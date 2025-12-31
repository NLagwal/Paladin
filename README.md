# 🛡️ Paladin

**Paladin** is a reasoning-driven command execution assistant designed to bridge natural language intent and controlled system interaction.

> 🚧 **Work In Progress** 🚧

![Paladin Frontend WIP](assets/wip.png)

## 📖 Overview

At its core, Paladin translates user requests into **explicit, auditable shell commands**, executes them in a constrained environment, and presents the results in a structured, human-readable form. The system is intentionally synchronous, transparent, and deterministic by default.

**Paladin Prioritizes:**
- **Explicit Intent** over autonomy.
- **Safety Boundaries** over unrestricted execution.
- **Clear Separation** between reasoning, execution, and presentation.

## ✨ Features

- **Linear Execution Pipeline:** User Input → Planner → Executor → Presenter.
- **Dual Execution Modes:**
    - **Stable:** Executes only known, whitelisted commands (Safe).
    - **Experimental:** Allows unrestricted shell command execution (Beta/Unsafe).
- **Interface Support:**
    - **CLI:** Rich, interactive command-line interface.
    - **API Server:** FastAPI-based backend for web UI integration.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- [Ollama](https://ollama.com/) (or compatible LLM provider)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/paladin.git
    cd paladin
    ```

2.  **Set up a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure the application:**
    ```bash
    cp config.example.toml config.toml
    ```
    *Edit `config.toml` to set your LLM provider, model, and safety mode.*

## 🛠️ Usage

### CLI Mode
Run the interactive command-line agent:
```bash
python cli.py
```

### Server Mode
Start the API server (useful for WebUI integration):
```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```
*⚠️ Warning: Paladin executes real system commands. Do not expose the server to untrusted networks.*

## ⚙️ Configuration

The `config.toml` file controls the behavior of Paladin:

| Setting | Description | Default |
| :--- | :--- | :--- |
| `provider` | The LLM provider (e.g., `ollama`). | `ollama` |
| `model` | Specific model to use (e.g., `ministral-3:3b`). | `ministral-3:3b` |
| `temperature` | Creativity of the model (0.0 - 1.0). | `0.2` |
| `timeout_seconds` | Max duration for command execution. | `15` |
| `mode` | `stable` (allowlist) or `experimental` (unrestricted). | `stable` |

## 🏗️ Architecture

Paladin follows a simple, linear pipeline:

```mermaid
graph LR
    A[User Input] --> B[Planner]
    B --> C[Executor]
    C --> D[Presenter]
```

- **Planner**: Interprets the user request and derives a single command.
- **Executor**: Executes the command under configured safety constraints.
- **Presenter**: Formats and summarizes the output for user consumption.

## 📝 Todo List

- [ ] Implement robust allowlist for Stable mode.
- [ ] Add Docker support for sandboxed execution.
- [ ] Develop a full Web UI (Frontend).
- [ ] Add session history support (optional).
- [ ] Improve error handling and recovery strategies.
- [ ] Add unit and integration tests.

---

*Disclaimer: Paladin is a tool for executing commands. Always review the commands generated before execution, especially in Experimental mode.*
