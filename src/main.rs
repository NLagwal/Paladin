mod config;
mod tools;
mod llm;

use std::io::{self, Write};
use colored::*;
use regex::Regex;
use crate::config::{load_config, AppConfig};
use crate::llm::LLMClient;
use crate::tools::run_shell_command;

// Prompts could be loaded from files, but hardcoding for simplicity given file access constraints
const PLANNER_PROMPT_TEMPLATE: &str = r#"
You are a command extraction agent.

User request: {current_task}

Current Scratchpad:
{scratchpad}

Your job: Extract EXACTLY ONE shell command that fulfills this request.

Rules:
- You MAY use the scratchpad to track your objective or reasoning using <think> tags.
- Content inside <think>...</think> will be saved to your scratchpad for future steps.
- Output ONLY the command itself after the think block (if any).
- No explanations outside the think block.
- If the request is already a command, output it verbatim.

Examples:
User: "use fastfetch"
Output: fastfetch

User: "list files"
Output:
<think>User wants to see files. I should use ls -la.</think>
ls -la

Output:
"#;

const PRESENTER_PROMPT_TEMPLATE: &str = r#"
You are a CLI presenter.

Command executed: `{command}`
Output:
```
{output}
```

Your job: Summarize the result briefly for the user.
- If it's a simple output, just show it or describe it.
- Be concise.
"#;

struct AgentState {
    current_task: String,
    scratchpad: String,
    command: String,
    output: String,
    step_count: usize,
}

fn extract_think(text: &str) -> (String, String) {
    let re = Regex::new(r"(?s)<think>(.*?)</think>").unwrap();
    if let Some(caps) = re.captures(text) {
        let thought = caps.get(1).map_or("", |m| m.as_str()).trim().to_string();
        let remaining = re.replace(text, "").trim().to_string();
        (thought, remaining)
    } else {
        ("".to_string(), text.trim().to_string())
    }
}

async fn planner_node(state: &mut AgentState, llm: &LLMClient) -> anyhow::Result<()> {
    let prompt = PLANNER_PROMPT_TEMPLATE
        .replace("{current_task}", &state.current_task)
        .replace("{scratchpad}", &state.scratchpad);

    let response = llm.invoke(&prompt).await?;
    let (thought, command) = extract_think(&response);

    if !thought.is_empty() {
        if !state.scratchpad.is_empty() {
            state.scratchpad.push_str("\n\n");
        }
        state.scratchpad.push_str(&format!("Step {}: {}", state.step_count + 1, thought));
    }

    state.command = command;
    state.step_count += 1;
    
    // Print UI
    println!("{}", format!("PLANNER: {}", state.command).cyan());
    
    Ok(())
}

async fn executor_node(state: &mut AgentState, config: &AppConfig) {
    if state.command.is_empty() {
        state.output = "[INFO] No command to execute".to_string();
    } else {
        state.output = run_shell_command(&state.command, config).await;
    }
    
    state.step_count += 1;
    
    // Print UI
    println!("{}", "EXECUTOR:".green());
    println!("{}", state.output.dimmed());
}

async fn presenter_node(state: &mut AgentState, llm: &LLMClient) -> anyhow::Result<()> {
    let prompt = PRESENTER_PROMPT_TEMPLATE
        .replace("{command}", &state.command)
        .replace("{output}", &state.output);

    let response = llm.invoke(&prompt).await?;
    let (_, formatted) = extract_think(&response); // Just in case, though presenter usually doesn't think

    state.output = formatted.clone(); // Update output with summary
    state.step_count += 1;
     
    println!("{}", "FINAL ANSWER:".magenta().bold());
    println!("{}", formatted);
    
    Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let config_path = "config.toml";
    
    println!("{}", "Loading config...".dimmed());
    let config = match load_config(config_path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error loading config: {}", e);
            // Fallback for demo if file missing? No, user has it.
            return Ok(());
        }
    };
    
    println!("Provider: {} | Model: {} | Mode: {}", config.provider, config.model, config.mode);

    let llm_client = LLMClient::new(&config)?;

    loop {
        print!("{}", "\nUser> ".yellow().bold());
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let input = input.trim();

        if input.eq_ignore_ascii_case("exit") || input.eq_ignore_ascii_case("quit") {
            break;
        }
        if input.is_empty() {
            continue;
        }

        let mut state = AgentState {
            current_task: input.to_string(),
            scratchpad: String::new(),
            command: String::new(),
            output: String::new(),
            step_count: 0,
        };

        println!("{}", "Running agent...".dimmed());

        // Linear Pipeline
        planner_node(&mut state, &llm_client).await?;
        executor_node(&mut state, &config).await;
        // Optional: presenter_node(&mut state, &llm_client).await?; 
        // NOTE: Keeping presenter active as per requirements
        presenter_node(&mut state, &llm_client).await?;
    }

    Ok(())
}
