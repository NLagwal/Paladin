import subprocess
import shlex
from config import load_config

CONFIG = load_config()

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
    "top",
    "htop",

    # networking (read-only)
    "ip",
    "ss",
    "ping",
    "nmcli",
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
      - Anything goes (freeroam)
    """
    if CONFIG.mode == "experimental":
        return True

    try:
        argv = shlex.split(command)
    except ValueError:
        return False

    if not argv:
        return False

    base_cmd = argv[0]
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

    try:
        process = subprocess.run(
            command,
            shell=True,
            executable="/bin/bash",
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=CONFIG.timeout_seconds,
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
