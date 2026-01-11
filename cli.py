import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.markdown import Markdown
from rich.theme import Theme

from graph import build_graph
from config import load_config

app = typer.Typer()

custom_theme = Theme({
    "title": "bold magenta",
    "planner": "cyan",
    "executor": "green",
    "presenter": "bold magenta",
    "dim": "dim",
})

console = Console(theme=custom_theme)


@app.command()
def start():
    """Start the Paladin MVP CLI."""
    CONFIG = load_config()

    console.print(
        Panel.fit(
            "[title]Paladin MVP[/title]\nLinear agent: Planner → Executor → Presenter",
            border_style="magenta"
        )
    )

    console.print(
        f"[dim]Provider:[/dim] {CONFIG.provider} | "
        f"[dim]Model:[/dim] {CONFIG.model} | "
        f"[dim]Temp:[/dim] {CONFIG.temperature}\n"
    )

    graph = build_graph()

    while True:
        user_input = Prompt.ask("[bold yellow]User[/bold yellow]")

        if user_input.lower() in {"exit", "quit"}:
            console.print("[dim]Exiting Paladin.[/dim]")
            break

        state = {
            "current_task": user_input,
            "scratchpad": "",
            "command": "",
            "output": "",
            "step_count": 0,
        }

        console.print("[dim]Running agent...[/dim]\n")

        try:
            for event in graph.stream(state):
                for node_name, update in event.items():

                    if node_name == "planner":
                        cmd = update.get("command", "")
                        console.print(
                            Panel(
                                f"Command: `{cmd}`" if cmd else "No command",
                                title="PLANNER",
                                border_style="cyan",
                            )
                        )

                    elif node_name == "executor":
                        console.print(
                            Panel(
                                update.get("output", ""),
                                title="EXECUTOR",
                                border_style="green",
                            )
                        )

                    elif node_name == "presenter":
                        console.print(
                            Panel(
                                Markdown(update.get("output", "")),
                                title="FINAL ANSWER",
                                border_style="magenta",
                            )
                        )

                    elif node_name == "safety":
                        console.print(
                            Panel(
                                update.get("output", ""),
                                title="SAFETY",
                                border_style="bold red",
                            )
                        )

        except KeyboardInterrupt:
            console.print("\n[bold red]Interrupted[/bold red]")
        except Exception as e:
            console.print(f"[bold red]Error:[/bold red] {e}")


if __name__ == "__main__":
    app()
