
import { ActivityLog, Machine, Message, Suggestion } from "@/types/dashboard";

export const seedSuggestions: Suggestion[] = [
  {
    id: "s-1",
    title: "Escalate SSH brute force to supervised mode",
    detail: "Pivot to just-discovered 10.0.5.42 host. Rate limit to 5 rps, capture banners, and log credentials.",
    severity: "high",
    status: "pending",
  },
  {
    id: "s-2",
    title: "Verify leaked AWS keys",
    detail: "Keys surfaced in recon logs. Spin up isolated validator agent to check scope and permissions safely.",
    severity: "critical",
    status: "pending",
  },
  {
    id: "s-3",
    title: "Snapshot vuln evidence",
    detail: "Archive current exploit traces before remediation window closes. Attach to engagement log.",
    severity: "medium",
    status: "pending",
  },
];

export const machines: Machine[] = [
  {
    id: "machine-1",
    name: "Primary Supervisor",
    metrics: [
      { label: "Uptime", value: "18h 42m", hint: "continuous", intent: "ok" },
      { label: "Tasks", value: "23 agents", hint: "6 in recon", intent: "ok" },
      { label: "CPU/Memory", value: "38% used", hint: "62% free", intent: "ok" },
      { label: "Queue", value: "3 items", hint: "watch", intent: "warn" },
    ]
  },
  {
    id: "machine-2",
    name: "Recon Node Alpha",
    metrics: [
      { label: "Uptime", value: "72h 15m", hint: "stable", intent: "ok" },
      { label: "Tasks", value: "15 agents", hint: "3 in scan", intent: "ok" },
      { label: "CPU/Memory", value: "22% used", hint: "78% free", intent: "ok" },
      { label: "Queue", value: "0 items", hint: "idle", intent: "ok" },
    ]
  },
  {
    id: "machine-3",
    name: "Exploit Node Beta",
    metrics: [
      { label: "Uptime", value: "6h 08m", hint: "recent restart", intent: "warn" },
      { label: "Tasks", value: "8 agents", hint: "2 active", intent: "ok" },
      { label: "CPU/Memory", value: "91% used", hint: "9% free", intent: "warn" },
      { label: "Queue", value: "12 items", hint: "critical", intent: "error" },
    ]
  },
];

export const activityLog: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "12:24 UTC",
    scope: "network",
    message: "Recon agent mapped 10.0.5.0/24; 8 services flagged for follow-up.",
    level: "info",
  },
  {
    id: "log-2",
    timestamp: "12:21 UTC",
    scope: "triage",
    message: "CVE-2024-45721 reproduced on staging host. Proof captured.",
    level: "success",
  },
  {
    id: "log-3",
    timestamp: "12:15 UTC",
    scope: "planning",
    message: "Supervisor paused brute-force branch pending scope confirmation.",
    level: "warning",
  },
  {
    id: "log-4",
    timestamp: "12:08 UTC",
    scope: "memory",
    message: "Prior exploit chain re-used for RCE attempt; awaiting confirmation.",
    level: "info",
  },
    {
    id: "log-5",
    timestamp: "12:05 UTC",
    scope: "network",
    message: "Port scan completed on 10.0.5.0/24 subnet.",
    level: "info",
  },
  {
    id: "log-6",
    timestamp: "12:02 UTC",
    scope: "exploit",
    message: "Privilege escalation successful on target host.",
    level: "success",
  },
];

export const mockMessages: Message[] = [
  { id: 1, sender: "user", text: "What's the status of the SSH brute force operation?" },
  { id: 2, sender: "ai", text: "The SSH brute force on 10.0.5.42 has identified 3 valid credentials. Currently rate-limited to 5 requests/second to avoid detection. Recommend escalating to supervised mode for targeted access." },
  { id: 3, sender: "user", text: "Show me the discovered credentials" },
  { id: 4, sender: "ai", text: "Credentials discovered:\n1. admin:P@ssw0rd123\n2. root:toor\n3. backup:backup2024\n\nAll three have been validated. The admin account shows elevated privileges." },
];
