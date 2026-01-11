
import { ActivityLog, Machine, Message, Suggestion } from "@/types/dashboard";

export const seedSuggestions: Suggestion[] = [
  {
    id: "s-1",
    title: "System Health Check",
    detail: "Run diagnostics on CPU, Memory, and Disk usage to identify bottlenecks.",
    severity: "low",
    status: "pending",
  },
  {
    id: "s-2",
    title: "Clean Docker Artifacts",
    detail: "Prune unused containers and networks to reclaim storage space.",
    severity: "medium",
    status: "pending",
  },
  {
    id: "s-3",
    title: "Review Security Logs",
    detail: "Analyze auth.log for recent failed login attempts.",
    severity: "high",
    status: "pending",
  },
];

export const machines: Machine[] = [
  {
    id: "machine-1",
    name: "Localhost (Controller)",
    metrics: [
      { label: "Uptime", value: "2d 4h", hint: "stable", intent: "ok" },
      { label: "Agent", value: "Idle", hint: "ready", intent: "ok" },
      { label: "Mode", value: "Stable", hint: "safe", intent: "ok" },
      { label: "Queue", value: "0 tasks", hint: "empty", intent: "ok" },
    ]
  },
  {
    id: "machine-2",
    name: "Ollama Service",
    metrics: [
      { label: "Status", value: "Active", hint: "port 11434", intent: "ok" },
      { label: "Model", value: "ministral-3:3b", hint: "loaded", intent: "ok" },
      { label: "VRAM", value: "4.2 GB", hint: "60% used", intent: "warn" },
      { label: "Requests", value: "12/min", hint: "low load", intent: "ok" },
    ]
  },
];

export const activityLog: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "17:42 UTC",
    scope: "executor",
    message: "Successfully executed: `docker ps -a`",
    level: "success",
  },
  {
    id: "log-2",
    timestamp: "17:41 UTC",
    scope: "planner",
    message: "Parsed intent: \"List all docker containers\" -> `docker ps -a`",
    level: "info",
  },
  {
    id: "log-3",
    timestamp: "17:38 UTC",
    scope: "safety",
    message: "Blocked command: `rm -rf /tmp/*` (Experimental mode required)",
    level: "warning",
  },
  {
    id: "log-4",
    timestamp: "17:35 UTC",
    scope: "presenter",
    message: "Formatted output for `df -h` to markdown table.",
    level: "info",
  },
  {
    id: "log-5",
    timestamp: "17:30 UTC",
    scope: "system",
    message: "Paladin Agent initialized in STABLE mode.",
    level: "info",
  },
];

export const mockMessages: Message[] = [
  { id: 1, sender: "user", text: "Check the disk space on the root partition." },
  { id: 2, sender: "ai", text: "I will check the disk space using `df -h /`." },
  { id: 3, sender: "ai", text: "Executor: Command: `df -h /`\nOutput:\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   24G   26G  48% /" },
  { id: 4, sender: "ai", text: "The root partition is 48% full with 26GB available. Usage is within normal limits." },
];
