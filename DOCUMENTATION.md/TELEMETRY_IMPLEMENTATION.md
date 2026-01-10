# 🛡️ Paladin System Design Documentation

**Branch:** `branch_cero_zero0.0`  
**Version:** 0.0.1  
**Last Updated:** January 2026

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow](#data-flow)
3. [Component Design](#component-design)
4. [Safety Model](#safety-model)
5. [API Design](#api-design)
6. [Configuration](#configuration)
7. [Future Roadmap](#future-roadmap)

---

## System Architecture

### High-Level Architecture

Paladin follows a **linear pipeline architecture** with clear separation of concerns. The system is intentionally synchronous, transparent, and deterministic by default.

(assets/ai.svg)


### Layer Structure

The system is organized into six distinct layers:

1. **Interface Layer** - CLI / API Server
2. **Orchestration Layer** - Agent Controller
3. **Reasoning Layer** - LLM Planner
4. **Execution Layer** - Command Executor
5. **Safety Layer** - Allowlist / Sandbox
6. **Presentation Layer** - Output Formatter

### Design Principles

- **Explicit over Implicit** - All commands are visible and auditable
- **Synchronous by Default** - No hidden async behavior
- **Fail-Safe** - Errors halt execution immediately
- **Auditable** - Every action is logged
- **Deterministic** - Same input produces same output

### Execution Modes

| Mode | Description | Use Case | Risk Level |
|------|-------------|----------|------------|
| **Stable** | Allowlist-based execution. Only pre-approved commands permitted. | Production, untrusted environments | Low ✅ |
| **Experimental** | Unrestricted shell access. Any command can be executed. | Development, trusted environments | High ⚠️ |

---

## Data Flow

### Request Processing Pipeline

(assets/working.svg)

### Data Flow Steps

1. **User Input** → Natural language request (e.g., "list files in current directory")

2. **Planner** → LLM generates structured command plan
   - Output: JSON with command, reasoning, safety analysis

3. **Safety Check** → Validate against allowlist (Stable) or syntax (Experimental)

4. **Executor** → Run command in subprocess with timeout
   - Output: stdout, stderr, exit_code

5. **Presenter** → Format output into human-readable response

6. **Response** → Display to user via CLI or API

### Data Structures

```json
// Planner Output
{
  "command": "ls -la",
  "reasoning": "User wants to see all files including hidden ones",
  "safety_level": "safe",
  "expected_outcome": "List of files with details"
}

// Executor Output
{
  "stdout": "total 48\ndrwxr-xr-x  12 user  staff   384 Jan 10 10:30 .\n...",
  "stderr": "",
  "exit_code": 0,
  "execution_time_ms": 45
}

// Presenter Output
{
  "summary": "Successfully listed 12 files",
  "formatted_output": "...",
  "command_executed": "ls -la"
}
```

---

## Component Design

(assets/overview.svg)
### Component Overview


### 1. Planner (`planner.py`)

**Purpose:** Translates natural language to executable commands

**Responsibilities:**
- Interface with LLM provider (Ollama)
- Parse user intent
- Generate command with reasoning
- Perform preliminary safety assessment

**Inputs:** 
- User query (string)
- Config (dict)

**Outputs:** 
- Command plan (JSON)

**Key Functions:**
```python
def plan_command(query: str, config: dict) -> dict:
    """
    Generates a command plan from natural language query
    
    Returns:
        {
            "command": str,
            "reasoning": str,
            "safety_level": str,
            "expected_outcome": str
        }
    """
```

---

### 2. Executor (`executor.py`)

**Purpose:** Safely executes shell commands

**Responsibilities:**
- Validate command against safety policy
- Execute in subprocess with timeout
- Capture stdout/stderr
- Handle execution errors

**Inputs:** 
- Command (string)
- Mode (stable/experimental)

**Outputs:** 
- Execution result (dict)

**Key Functions:**
```python
def execute_command(command: str, mode: str, timeout: int) -> dict:
    """
    Executes command in subprocess with safety checks
    
    Returns:
        {
            "stdout": str,
            "stderr": str,
            "exit_code": int,
            "execution_time_ms": int
        }
    """
```

**Safety Mechanisms:**
- Allowlist validation (Stable mode)
- Timeout protection
- Subprocess isolation
- Error containment

---

### 3. Presenter (`presenter.py`)

**Purpose:** Formats execution results for user consumption

**Responsibilities:**
- Parse raw command output
- Generate human-readable summary
- Format for CLI or API response
- Highlight errors or warnings

**Inputs:** 
- Execution result (dict)

**Outputs:** 
- Formatted response (string/dict)

**Key Functions:**
```python
def present_result(result: dict, format: str = "cli") -> str:
    """
    Formats execution result for display
    
    Args:
        format: "cli" or "api"
    
    Returns:
        Formatted string or dict
    """
```

---

### 4. Agent (`agent.py`)

**Purpose:** Orchestrates the entire pipeline

**Responsibilities:**
- Coordinate Planner → Executor → Presenter
- Handle pipeline errors
- Manage state (if needed)
- Log all actions

**Inputs:** 
- User request

**Outputs:** 
- Final response to user

**Key Functions:**
```python
def process_request(query: str) -> str:
    """
    Main orchestration function
    
    Pipeline:
        1. Plan command
        2. Execute command
        3. Present result
    
    Returns:
        Final formatted response
    """
```

---

### 5. Config Manager (`config.py`)

**Purpose:** Centralized configuration management

**Responsibilities:**
- Load config.toml
- Validate configuration
- Provide config access to all modules
- Support config hot-reload (future)

**Inputs:** 
- config.toml file

**Outputs:** 
- Config object

**Configuration Schema:**
```toml
[llm]
provider = "ollama"
model = "ministral-3:3b"
temperature = 0.2

[execution]
mode = "stable"  # or "experimental"
timeout_seconds = 15

[logging]
level = "INFO"
file = "paladin.log"
```

---

## Safety Model

### Defense-in-Depth Strategy

(assets/safety.svg)
### Safety Layers

1. **LLM Reasoning** - Planner assesses command safety before generation
2. **Allowlist Validation** - Commands checked against whitelist (Stable mode)
3. **Syntax Validation** - Basic shell injection prevention
4. **Subprocess Isolation** - Commands run in isolated subprocess
5. **Timeout Protection** - Automatic termination after timeout_seconds
6. **Error Containment** - Exceptions caught and logged, never exposed

### Stable Mode Allowlist (Example)

```python
ALLOWED_COMMANDS = {
    # File Operations (Read-only)
    "ls": ["ls", "ls -l", "ls -la", "ls -lh"],
    "cat": ["cat <file>"],
    "pwd": ["pwd"],
    "find": ["find . -name <pattern>"],
    
    # System Info
    "date": ["date"],
    "whoami": ["whoami"],
    "uname": ["uname -a"],
    "df": ["df -h"],
    
    # Network (Read-only)
    "ping": ["ping -c 4 <host>"],
    "curl": ["curl -I <url>"],  # Headers only
    "nslookup": ["nslookup <domain>"],
    
    # FORBIDDEN (even in allowlist):
    # - rm, dd, mkfs, fdisk (destructive)
    # - sudo, su (privilege escalation)
    # - eval, exec (code execution)
    # - >, >>, |, && (output redirection/chaining)
}
```

### Command Validation Flow

(assets/command_validation.svg)
### Security Warnings ⚠️

- **Experimental Mode is UNSAFE** - Only use in trusted, isolated environments
- **Do not expose API server to public networks** - No authentication implemented
- **LLM can be prompt-injected** - User input is NOT sanitized before LLM
- **Shell injection possible in Experimental** - Commands passed to shell directly
- **Resource exhaustion risk** - Long-running commands can consume system resources

---

## API Design

### FastAPI Endpoints

#### POST `/api/execute`

Execute a natural language command

**Request:**
```json
{
  "query": "show disk usage",
  "mode": "stable"  // optional, defaults to config
}
```

**Response (Success):**
```json
{
  "status": "success",
  "command": "df -h",
  "output": "Filesystem      Size  Used Avail Use% Mounted on\n...",
  "execution_time_ms": 123
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "Command not in allowlist",
  "command": "rm -rf /",
  "execution_time_ms": 0
}
```

---

#### GET `/api/health`

Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "version": "0.0.1",
  "mode": "stable",
  "uptime_seconds": 3600
}
```

---

#### GET `/api/config`

Get current configuration (non-sensitive)

**Response:**
```json
{
  "provider": "ollama",
  "model": "ministral-3:3b",
  "mode": "stable",
  "timeout_seconds": 15
}
```

---

### CLI Interface

**Example Session:**

```
$ python cli.py
🛡️  Paladin CLI (Stable Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> list all python files

🤔 Planning: find . -name "*.py"
⚡ Executing...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
./cli.py
./server.py
./agent.py
./planner.py
./executor.py
./presenter.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Found 6 Python files (45ms)

> exit
👋 Goodbye!
```

---

## Configuration

### config.toml Structure

```toml
[llm]
provider = "ollama"           # LLM provider: "ollama", "openai", etc.
model = "ministral-3:3b"      # Specific model to use
temperature = 0.2             # Creativity (0.0-1.0)
base_url = "http://localhost:11434"  # Ollama endpoint

[execution]
mode = "stable"               # "stable" or "experimental"
timeout_seconds = 15          # Max execution time
max_output_lines = 1000       # Truncate long outputs

[safety]
enable_allowlist = true       # Enforce allowlist (Stable mode)
allow_network = false         # Allow network commands
allow_file_write = false      # Allow file modifications

[logging]
level = "INFO"                # DEBUG, INFO, WARNING, ERROR
file = "paladin.log"          # Log file path
console = true                # Also log to console

[api]
host = "0.0.0.0"
port = 8000
cors_origins = ["http://localhost:3000"]
```

---

## Future Roadmap

---

## Architecture Decisions

### Why Synchronous?

- **Predictability** - Easier to reason about execution flow
- **Debugging** - Simpler error tracking and logging
- **Safety** - No race conditions or concurrent command conflicts

### Why Linear Pipeline?

- **Clarity** - Each component has a single, well-defined responsibility
- **Testability** - Easy to mock and test individual components
- **Maintainability** - Changes to one component don't affect others

### Why Two Modes?

- **Stable** - Production-ready with strong safety guarantees
- **Experimental** - Development flexibility without restrictions
- **Clear Trade-off** - Users explicitly choose safety vs. power

---

## Deployment

### Local Development

```bash
# Start Ollama
ollama serve

# Pull model
ollama pull ministral-3:3b

# Run Paladin CLI
python cli.py

# Or start API server
uvicorn server:app --reload
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  paladin:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PALADIN_MODE=stable
    volumes:
      - ./config.toml:/app/config.toml
    depends_on:
      - ollama
  
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
```

---

## Testing Strategy

### Unit Tests

```python
# test_planner.py
def test_plan_simple_command():
    result = plan_command("list files", config)
    assert result["command"] in ["ls", "ls -l", "ls -la"]
    assert result["safety_level"] == "safe"

# test_executor.py
def test_execute_safe_command():
    result = execute_command("pwd", "stable", 15)
    assert result["exit_code"] == 0
    assert len(result["stdout"]) > 0

# test_presenter.py
def test_format_output():
    result = {"stdout": "file1.txt\nfile2.txt", "exit_code": 0}
    output = present_result(result)
    assert "file1.txt" in output
```

### Integration Tests

```python
# test_integration.py
def test_full_pipeline():
    response = process_request("show current directory")
    assert "pwd" in response.lower()
    assert response["status"] == "success"
```

