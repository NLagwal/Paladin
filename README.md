# 🛡️ Paladin

**Paladin** is a reasoning-driven command execution assistant designed to bridge natural language intent and controlled system interaction.

> 🚧 **Work In Progress** 🚧

![Paladin Frontend WIP](assets/wip.png)

## 📖 Overview

At its core, Paladin translates user requests into **explicit, auditable shell commands**, executes them in a constrained environment, and presents the results in a structured, human-readable form.

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
    - **Web UI:** Full-stack React dashboard with microservices architecture.

## 🏗️ Project Structure

The project is organized into the following components:

- **`ai/`**: The core Python agent logic (LLM interaction, graph, tools).
- **`frontend/`**: React-based Web UI.
- **`services/`**: Backend microservices (Auth, Notification, PDF Hosting).
- **`api-gateway/`**: Gateway routing requests to services.

## 🚀 Getting Started

### Prerequisites

- [Docker & Docker Compose](https://www.docker.com/) (Recommended for full stack)
- Python 3.11+ (For standalone agent)
- [Ollama](https://ollama.com/) (or compatible LLM provider)

### Method 1: Full-Stack Web App (Recommended)

Run the entire suite (Frontend + AI + Services) using Docker Compose.

```bash
# Build and start all services
docker-compose build --no-cache
docker-compose up

# Make sure you have the model pulled in Ollama (if running via docker-compose ollama service)
docker-compose exec ollama ollama run ministral-3:3b 
```

Then open **http://localhost:3000/** in your browser.

### Method 2: Standalone AI Agent (CLI/API)

If you only want to run the core AI agent:

#### 1. Setup

```bash
cd ai

# Create venv
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure
cp config.example.toml config.toml
# Edit config.toml to set your LLM provider options
```

#### 2. Run CLI

```bash
python cli.py
```

#### 3. Run API Server

```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```
*⚠️ Warning: Paladin executes real system commands. Do not expose the server to untrusted networks.*

## ⚙️ Configuration (`ai/config.toml`)

| Setting | Description | Default |
| :--- | :--- | :--- |
| `provider` | The LLM provider (e.g., `ollama`). | `ollama` |
| `model` | Specific model to use (e.g., `ministral-3:3b`). | `ministral-3:3b` |
| `temperature` | Creativity of the model (0.0 - 1.0). | `0.2` |
| `timeout_seconds` | Max duration for command execution. | `15` |
| `mode` | `stable` (allowlist) or `experimental` (unrestricted). | `stable` |

## 🏗️ Architecture

```mermaid
graph LR
    A[User Input] --> B[Planner]
    B --> C[Executor]
    C --> D[Presenter]
```

- **Planner**: Interprets the user request and derives a single command.
- **Executor**: Executes the command under configured safety constraints.
- **Presenter**: Formats and summarizes the output for user consumption.

## Execution Modes

### Stable Mode (Default)
- Executes only known, whitelisted commands (defined in `tools.py`).
- Intended for web exposure and shared environments.

### Experimental Mode (Beta)
- Allows unrestricted shell command execution (except blacklisted interactive commands like `vim`, `top`).
- Intended for local experimentation only.

> ⚠️ Experimental mode is **unsafe for untrusted input**.

---

*Disclaimer: Paladin is a tool for executing commands. Always review the commands generated before execution, especially in Experimental mode.*
