import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLog } from "@/types/dashboard";
import { AlertOctagon, ArrowUpRight, CheckCircle, Info } from "lucide-react";

const levelIcon: Record<ActivityLog['level'], JSX.Element> = {
  info: <Info className="h-4 w-4 text-accent-blue" />,
  success: <CheckCircle className="h-4 w-4 text-primary" />,
  warning: <AlertOctagon className="h-4 w-4 text-accent-amber" />,
  error: <AlertOctagon className="h-4 w-4 text-destructive" />,
};

const levelTone: Record<ActivityLog['level'], string> = {
  info: "text-accent-blue",
  success: "text-primary",
  warning: "text-accent-amber",
  error: "text-destructive",
};

export function ActivityLogs({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="glassmorphism rounded-lg p-4 flex-1 flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold font-mono">Live Logs</p>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 font-mono text-xs"
            >
              <span className="text-muted-foreground">{log.timestamp}</span>
              <div className={`w-4 h-4 flex-shrink-0 mt-0.5`}>{levelIcon[log.level]}</div>
              <p className="flex-1 text-foreground/80 leading-relaxed">
                <span className={`${levelTone[log.level]} font-semibold`}>[{log.scope.toUpperCase()}]</span> {log.message}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

