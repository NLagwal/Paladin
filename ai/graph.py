from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from llm import get_llm
from prompts import PLANNER_PROMPT, PRESENTER_PROMPT
from tools import run_shell_command
import re

LLM = get_llm()
MAX_STEPS = 5


class AgentState(TypedDict):
    current_task: str
    command: str
    output: str
    step_count: int


def strip_think(text: str) -> str:
    """Remove <think> tags if present."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def planner_node(state: AgentState) -> dict:
    """
    Planner extracts a single shell command from user input.
    Returns the command as a plain string.
    """
    response = (PLANNER_PROMPT | LLM).invoke({
        "current_task": state["current_task"]
    })
    
    command = strip_think(response.content).strip()
    
    return {
        "command": command,
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
    response = (PRESENTER_PROMPT | LLM).invoke({
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
