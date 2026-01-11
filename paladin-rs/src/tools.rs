use std::process::{Command, Stdio};
use std::collections::HashSet;
use std::time::Duration;
use crate::config::AppConfig;
use anyhow::Result;

lazy_static::lazy_static! {
    static ref STABLE_ALLOWLIST: HashSet<&'static str> = {
        [
            "fastfetch", "neofetch", "uname", "uptime", "lsb_release", "hostname",
            "free", "vmstat", "mpstat", "lscpu", "lsmem",
            "df", "lsblk", "mount", "findmnt",
            "ps",
            "ip", "ss", "iw",
            "ls", "stat", "du", "tree", "cat", "head", "tail", "wc"
        ].into_iter().collect()
    };

    static ref INTERACTIVE_COMMANDS: HashSet<&'static str> = {
        [
            "vim", "vi", "nvim", "nano", "emacs",
            "top", "htop", "btop", "nvtop",
            "less", "more", "man",
            "ssh", "ftp", "telnet",
            "tmux", "screen",
            "watch"
        ].into_iter().collect()
    };
}

fn is_interactive(command: &str) -> bool {
    let parts: Vec<&str> = command.split_whitespace().collect();
    if parts.is_empty() {
        return false;
    }
    INTERACTIVE_COMMANDS.contains(parts[0])
}

fn is_allowed(command: &str, config: &AppConfig) -> bool {
    if config.mode == "experimental" {
        return !is_interactive(command);
    }

    let parts: Vec<&str> = command.split_whitespace().collect();
    if parts.is_empty() {
        return false;
    }
    let base_cmd = parts[0];

    if !config.allowed_commands.is_empty() {
        return config.allowed_commands.iter().any(|c| c == base_cmd);
    }

    STABLE_ALLOWLIST.contains(base_cmd)
}

pub async fn run_shell_command(command: &str, config: &AppConfig) -> String {
    if !is_allowed(command, config) {
        return format!(
            "[DENIED] Command not allowed in {} mode",
            config.mode
        );
    }

    // In a real async runtime, we might want to use tokio::process
    // keeping it simple with std::process for now, but wrapping in timeout
    
    // NOTE: std::process::Command blocks, but for short commands it's okay-ish.
    // For better async, use tokio::process::Command.
    let output_result = tokio::time::timeout(
        Duration::from_secs(config.timeout_seconds),
        async {
            tokio::process::Command::new("bash")
                .arg("-c")
                .arg(command)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .output()
                .await
        }
    ).await;

    match output_result {
        Ok(Ok(output)) => {
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

            if !stdout.is_empty() && !stderr.is_empty() {
                format!("{}\n\n[STDERR]\n{}", stdout, stderr)
            } else if !stdout.is_empty() {
                stdout
            } else if !stderr.is_empty() {
                format!("[STDERR]\n{}", stderr)
            } else {
                "[INFO] Command executed with no output".to_string()
            }
        }
        Ok(Err(e)) => format!("[ERROR] Execution failed: {}", e),
        Err(_) => "[ERROR] Command timed out".to_string(),
    }
}

pub fn search_web(query: &str) -> String {
    format!("[INFO] Searching the web for: {}\n(Placeholder)", query)
}
