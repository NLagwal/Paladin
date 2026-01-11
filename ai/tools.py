import subprocess
import shlex
import urllib.request
import urllib.parse
from config import load_config

# -------------------------------------------------
# Interactive commands blacklist
# -------------------------------------------------
INTERACTIVE_COMMANDS = {
    "vim", "vi", "nvim", "nano", "emacs",
    "top", "htop", "btop", "nvtop",
    "less", "more", "man",
    "ssh", "ftp", "telnet",
    "tmux", "screen",
    "watch", 
}

def _is_interactive(command: str) -> bool:
    try:
        argv = shlex.split(command)
    except ValueError:
        return True # Safe default
    
    if not argv:
        return False
        
    return argv[0] in INTERACTIVE_COMMANDS

# -------------------------------------------------
# Stable-mode allowlist (known, read-only commands)
# -------------------------------------------------

STABLE_ALLOWLIST = {
    # system info
    "fastfetch",
    "neofetch",
    "uname",
    "uptime",
    "lsb_release",
    "hostname",

    # memory / cpu
    "free",
    "vmstat",
    "mpstat",
    "lscpu",
    "lsmem",

    # disk
    "df",
    "lsblk",
    "mount",
    "findmnt",

    # processes (read-only)
    "ps",

    # networking (read-only)
    "ip",
    "ss",
    "iw",

    # files (non-destructive)
    "ls",
    "stat",
    "du",
    "tree",
    "cat",
    "head",
    "tail",
    "wc",
}

def _is_allowed(command: str) -> bool:
    """
    Stable:
      - Only known, read-only commands
    Experimental:
      - Anything goes EXCEPT interactive commands
    """
    cfg = load_config()
    
    if cfg.mode == "experimental":
        return not _is_interactive(command)

    try:
        argv = shlex.split(command)
    except ValueError:
        return False

    if not argv:
        return False

    base_cmd = argv[0]
    
    # Check config override first
    if cfg.allowed_commands:
        return base_cmd in cfg.allowed_commands
        
    return base_cmd in STABLE_ALLOWLIST


def run_shell_command(command: str) -> str:
    """
    Execute a shell command with mode-based safety policy.
    """
    if not command or not isinstance(command, str):
        return "[ERROR] Invalid command"

    if not _is_allowed(command):
        return (
            "[DENIED] Command not allowed in STABLE mode\n"
            "Enable experimental mode to allow unrestricted execution."
        )
    
    # Load config for timeout
    cfg = load_config()

    try:
        process = subprocess.run(
            command,
            shell=True,
            executable="/bin/bash",
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=cfg.timeout_seconds,
        )

        stdout = process.stdout.strip()
        stderr = process.stderr.strip()

        if stdout and stderr:
            return f"{stdout}\n\n[STDERR]\n{stderr}"
        if stdout:
            return stdout
        if stderr:
            return f"[STDERR]\n{stderr}"

        return "[INFO] Command executed with no output"

    except subprocess.TimeoutExpired:
        return "[ERROR] Command timed out"
    except Exception as e:
        return f"[ERROR] {type(e).__name__}: {str(e)}"

def search_web(query: str) -> str:
    """
    Basic web search tool (Mock/Placeholder or simple naive implementation).
    """
    # This is a placeholder. In a real scenario, you'd use a search API.
    # We can simulate it or just return a message if not configured.
    return f"[INFO] Searching the web for: {query}\n(Note: Real web search requires an API key configuration. This is a placeholder.)"

