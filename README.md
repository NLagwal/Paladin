# 🛡️ Paladin — Unified System Design & Project Documentation

> **Version:** 0.0.1
> **Branch:** `branch_cero_zero0.0`
> **Last Updated:** January 2026

---

## Overview

**Paladin** is an AI-powered command execution platform that converts natural-language intent into **safe, auditable, and deterministic system commands**. It bridges human intent and system execution while enforcing strict safety boundaries.

The system is designed around a **linear, transparent pipeline**:

> **User Input → Planner → Safety Validation → Executor → Presenter**

Key priorities:

* Explicit intent over autonomous action
* Safety and auditability over convenience
* Deterministic behavior over black-box reasoning

Paladin supports both **CLI and Web UI** interfaces and can run in **Stable (safe)** or **Experimental (unsafe)** execution modes.

---

## Why Paladin Exists

Traditional CLIs suffer from:

* Memorization-heavy syntax
* High risk of destructive commands
* Poor auditability
* No semantic understanding

Paladin provides:

* Natural language interface
* AI-assisted command planning
* Explicit command visibility before execution
* Policy-driven safety checks
* Full execution history and logs

---

## Key Features

### 🤖 AI Planning

* Natural language → structured command plans
* Ollama-based local LLM support (primary)
* OpenAI fallback (optional)
* Deterministic prompt templates
* Optional RAG with command documentation

### 🔐 Safety-First Execution

* Allowlist-based execution (Stable mode)
* Explicit unsafe mode for development
* Command syntax validation
* Subprocess isolation with timeouts
* No silent command chaining

### 📊 Auditability & Observability

* Full command history
* Structured logs
* Execution timing metrics
* Clear stdout / stderr separation

### 🌐 Interfaces

* Interactive CLI
* REST API (FastAPI)
* React-based Web UI

---

## Execution Modes

| Mode             | Description             | Intended Use       | Risk    |
| ---------------- | ----------------------- | ------------------ | ------- |
| **Stable**       | Allowlist-only commands | Production / demos | Low ✅   |
| **Experimental** | Raw shell execution     | Local development  | High ⚠️ |

> ⚠️ Experimental mode must never be exposed to untrusted users or networks.

---

## System Architecture

Paladin uses a **layered linear architecture** with strict separation of concerns.

### Architecture Layers

1. **Interface Layer** — CLI / Web UI / REST API
2. **Orchestration Layer** — Agent Controller
3. **Reasoning Layer** — LLM Planner
4. **Safety Layer** — Allowlist & validation
5. **Execution Layer** — Command Executor
6. **Presentation Layer** — Output Formatter

### High-Level Flow

```
User Input
   ↓
Planner (LLM)
   ↓
Safety Validation
   ↓
Executor (Sandboxed)
   ↓
Presenter
   ↓
User Output
```

The system is **synchronous by default** to maximize predictability and debuggability.

---

## Core Components

### 1. Planner

**Purpose:** Translate natural language into executable command plans.

**Responsibilities:**

* Interpret user intent
* Generate explicit shell commands
* Attach reasoning and expected outcome
* Assign safety level

**Output Structure:**

```json
{
  "command": "ls -la",
  "reasoning": "User wants detailed directory listing",
  "safety_level": "safe",
  "expected_outcome": "List of files including hidden ones"
}
```

---

### 2. Safety Validator

**Purpose:** Enforce execution constraints.

**Mechanisms:**

* Allowlist validation (Stable mode)
* Syntax filtering (no pipes, redirects, chaining)
* Explicit denial of destructive commands

**Forbidden Examples:**

* `rm`, `dd`, `mkfs`, `fdisk`
* `sudo`, `su`
* `>`, `>>`, `|`, `&&`

---

### 3. Executor

**Purpose:** Execute validated commands safely.

**Responsibilities:**

* Subprocess execution
* Timeout enforcement
* Capture stdout / stderr
* Return structured execution result

**Execution Result:**

```json
{
  "stdout": "...",
  "stderr": "",
  "exit_code": 0,
  "execution_time_ms": 45
}
```

---

### 4. Presenter

**Purpose:** Convert raw execution output into user-friendly responses.

**Responsibilities:**

* Summarize execution result
* Format output for CLI or API
* Highlight errors or warnings

---

### 5. Agent Controller

**Purpose:** Orchestrate the entire pipeline.

**Pipeline:**

1. Receive user query
2. Call Planner
3. Run Safety Validation
4. Execute command
5. Present formatted output
6. Log all steps

---

## API Design

### POST `/api/execute`

Execute a natural language command.

**Request:**

```json
{
  "query": "show disk usage",
  "mode": "stable"
}
```

**Success Response:**

```json
{
  "status": "success",
  "command": "df -h",
  "output": "...",
  "execution_time_ms": 123
}
```

---

### GET `/api/health`

Health check endpoint.

```json
{
  "status": "healthy",
  "version": "0.0.1",
  "mode": "stable"
}
```

---

## Configuration

Configuration is centralized via `config.toml`.

```toml
[llm]
provider = "ollama"
model = "ministral-3:3b"
temperature = 0.2

[execution]
mode = "stable"
timeout_seconds = 15

[safety]
enable_allowlist = true
allow_file_write = false

[logging]
level = "INFO"
file = "paladin.log"
```

---

## Deployment

### Local (CLI / API Only)

```bash
ollama serve
ollama pull ministral-3:3b
python cli.py
```

### Docker (Recommended)

```bash
docker-compose up -d
```

---

## Scalability (Conceptual)

* Stateless planner and executor services
* Horizontal scaling via Kubernetes
* Redis caching for repeated plans
* PostgreSQL for command history

---

## Failure Handling

* Immediate failure on safety violation
* Subprocess timeout termination
* Clear error propagation (no silent retries)

---

## Security Notes ⚠️

* No authentication by default
* Do not expose Experimental mode publicly
* LLM output is **not trusted blindly**
* All commands are visible before execution

---

## Team Contributions

* **Nakul Lagwal** — AI architecture & system design
* **Mann Upadhyay** — Frontend & integration
* **Kavish Bansal** — Backend services & monitoring
* **Vihaan Sharma** — Database schema & Docker

---

## Project Status

🚧 **Active development**
Features and APIs may change before v1.0.

---

**Paladin** is intentionally conservative by design — power is explicit, and safety is never implicit.
