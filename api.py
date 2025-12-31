from graph import build_graph

def run_once(user_input: str) -> dict:
    graph = build_graph()

    state = {
        "current_task": user_input,
        "command": "",
        "output": "",
        "step_count": 0,
    }

    final_output = ""
    final_command = ""
    final_raw_output = ""

    for event in graph.stream(state):
        for node_name, update in event.items():
            if node_name == "planner":
                final_command = update.get("command", "")

            elif node_name == "executor":
                final_raw_output = update.get("output", "")

            elif node_name == "presenter":
                final_output = update.get("output", "")

    return {
        "message": final_output,
        "command": final_command,
        "raw_output": final_raw_output,
    }
