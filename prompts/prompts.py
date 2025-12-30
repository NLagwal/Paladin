from pathlib import Path
from langchain_core.prompts import ChatPromptTemplate

# Directory where THIS file lives
BASE_DIR = Path(__file__).parent


def load_prompt(filename: str) -> ChatPromptTemplate:
    text = (BASE_DIR / filename).read_text()
    return ChatPromptTemplate.from_messages([
        ("system", text)
    ])


PLANNER_PROMPT = load_prompt("planner.txt")
EXECUTOR_PROMPT = load_prompt("executor.txt")
CRITIC_PROMPT = load_prompt("critic.txt")
PRESENTER_PROMPT = load_prompt("presenter.txt")
