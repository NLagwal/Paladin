export type SuggestionStatus = "pending" | "accepted" | "rejected";

export interface Suggestion {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "high" | "medium" | "low";
  status: SuggestionStatus;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  scope: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
}

export interface MachineMetric {
  label: string;
  value: string;
  hint?: string;
  intent?: "ok" | "warn" | "error";
}

export interface Machine {
    id: string;
    name: string;
    metrics: MachineMetric[];
}

export interface Message {
    id: number;
    sender: "user" | "ai";
    text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  command?: string;
  raw_output?: string;
}
