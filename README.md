# Paladin

**Paladin** is a reasoning-driven command execution assistant designed to bridge
natural language intent and controlled system interaction.

At its core, Paladin translates user requests into **explicit, auditable shell
commands**, executes them in a constrained environment, and presents the results
in a structured, human-readable form. The system is intentionally synchronous,
transparent, and deterministic by default.

Paladin prioritizes:
- Explicit intent over autonomy
- Safety boundaries over unrestricted execution
- Clear separation between reasoning, execution, and presentation

It is built as a backend-first system intended to be paired with a Web UI or CLI,
but it does **not** manage sessions, memory, or user identity on its own.

---

## Execution Model

Paladin follows a simple, linear pipeline:

```

User Input → Planner → Executor → Presenter

````

- **Planner**: Interprets the user request and derives a single command
- **Executor**: Executes the command under configured safety constraints
- **Presenter**: Formats and summarizes the output for user consumption

No background agents, hidden loops, or autonomous retries are performed.

---

## Execution Modes

Paladin supports two execution modes:

### Stable Mode (Default)
- Executes only known, whitelisted commands
- Intended for web exposure and shared environments
- Prevents arbitrary command execution

### Experimental Mode (Beta)
- Allows unrestricted shell command execution
- Intended for local experimentation only
- Disabled by default

⚠️ Experimental mode is **unsafe for untrusted input**.

---

## What Paladin Is Not

Paladin is **not**:
- A general-purpose shell replacement
- An autonomous agent
- A penetration testing framework
- A background daemon
- A self-improving system

Every action is derived from **explicit user input** and executed synchronously.

---

## Setup and Configuration

Requirements: Python 3.11+

Create and activate a virtual environment:

python -m venv venv
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Copy the example configuration and edit as needed:

cp config.example.toml config.toml

Configuration controls:

- LLM provider and model parameters  
- Command execution timeout  
- Safety mode  
  - stable — allowlisted commands only  
  - experimental — unrestricted command execution (beta)

## Running Paladin 

#### CLI mode:

cd ai 

python cli.py

Server mode (for WebUI integration):

uvicorn server:app --host 0.0.0.0 --port 8000

Warning: Paladin executes real system commands. Do not expose the server to untrusted networks.

#### GUI mode:

docker-compose build --no-cache
docker-compose up
docker-compose exec ollama ollama run ministral-3:3b 

Then open http://localhost:3000/ on your prefered browser
