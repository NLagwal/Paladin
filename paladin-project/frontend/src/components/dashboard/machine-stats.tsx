import { MachineMetric } from "@/types/dashboard";

interface MachineStatsProps {
  metrics: MachineMetric[];
}

export function MachineStats({ metrics }: MachineStatsProps) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Systems
          </p>
          <p className="text-sm font-semibold">Machine telemetry</p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.08em] text-primary">Live</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border/60 bg-background/60 px-3 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {metric.label}
              </p>
              <span
                className={
                  metric.intent === "warn"
                    ? "text-amber-200 text-xs"
                    : "text-muted-foreground text-xs"
                }
              >
                {metric.hint}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

