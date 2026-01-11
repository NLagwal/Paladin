from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from llm import get_llm
from prompts import PLANNER_PROMPT, PRESENTER_PROMPT
from tools import run_shell_command
import re

MAX_STEPS = 5


class AgentState(TypedDict):
    current_task: str
    scratchpad: str
    command: str
    output: str
    step_count: int


def strip_think(text: str) -> str:
    """Remove <think> tags if present."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def extract_think(text: str) -> tuple[str, str]:
    """
    Extracts content inside <think> tags and the remaining text.
    Returns (thought, remaining_text).
    """
    match = re.search(r"<think>(.*?)</think>", text, flags=re.DOTALL)
    if match:
        thought = match.group(1).strip()
        remaining = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
        return thought, remaining
    return "", text.strip()


def planner_node(state: AgentState) -> dict:
    """
    Planner extracts a single shell command from user input.
    Returns the command as a plain string.
    """
    # Instantiate LLM dynamically to support config changes at runtime
    llm = get_llm()
    response = (PLANNER_PROMPT | llm).invoke({
        "current_task": state["current_task"],
        "scratchpad": state.get("scratchpad", "")
    })
    
    thought, command = extract_think(response.content)
    
    # Update scratchpad if there's new thought
    new_scratchpad = state.get("scratchpad", "")
    if thought:
        if new_scratchpad:
            new_scratchpad += "\n\n"
        new_scratchpad += f"Step {state['step_count'] + 1}: {thought}"
    
    return {
        "command": command,
        "scratchpad": new_scratchpad,
        "step_count": state["step_count"] + 1
    }


def executor_node(state: AgentState) -> dict:
    """
    Executor runs the command unconditionally if non-empty.
    Returns raw output from subprocess.
    """
    command = state["command"].strip()
    
    if not command:
        output = "[INFO] No command to execute"
    else:
        output = run_shell_command(command)
    
    return {
        "output": output,
        "step_count": state["step_count"] + 1
    }


def presenter_node(state: AgentState) -> dict:
    """
    Presenter formats the output for display.
    """
    # Instantiate LLM dynamically to support config changes at runtime
    llm = get_llm()
    response = (PRESENTER_PROMPT | llm).invoke({
        "command": state["command"],
        "output": state["output"]
    })
    
    formatted = strip_think(response.content).strip()
    
    return {
        "output": formatted,
        "step_count": state["step_count"] + 1
    }


def safety_node(state: AgentState) -> dict:
    """Safety termination."""
    return {
        "output": "[SAFETY] Maximum steps exceeded"
    }


def should_terminate(state: AgentState) -> str:
    """Check if we've exceeded max steps."""
    if state["step_count"] >= MAX_STEPS:
        return "safety"
    return "executor"


def build_graph():
    """Build linear graph: planner → executor → presenter."""
    graph = StateGraph(AgentState)
    
    graph.add_node("planner", planner_node)
    graph.add_node("executor", executor_node)
    graph.add_node("presenter", presenter_node)
    graph.add_node("safety", safety_node)
    
    graph.add_edge(START, "planner")
    
    graph.add_conditional_edges(
        "planner",
        should_terminate,
        {
            "executor": "executor",
            "safety": "safety"
        }
    )
    
    graph.add_edge("executor", "presenter")
    graph.add_edge("presenter", END)
    graph.add_edge("safety", END)
    
    return graph.compile()
