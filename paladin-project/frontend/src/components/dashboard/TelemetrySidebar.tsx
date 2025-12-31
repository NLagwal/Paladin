import { ProgressRing } from "@/components/ui/ProgressRing";
import { machines } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer } from "recharts";

const netData = [
    { value: 5 },
    { value: 15 },
    { value: 10 },
    { value: 25 },
    { value: 20 },
    { value: 30 },
    { value: 22 },
];


export function TelemetrySidebar() {
    const machine = machines[0]; // Example: using first machine

    const cpuMetric = machine.metrics.find(m => m.label.includes("CPU"));
    const cpuValue = cpuMetric ? parseInt(cpuMetric.value) : 0;

    const memMetric = machine.metrics.find(m => m.label.includes("Memory"));
    const memValue = memMetric ? parseInt(memMetric.value) : 0;

    return (
        <div className="w-[80px] border-r border-border/50 bg-card/30 flex flex-col items-center py-4 space-y-6">
            <div className="flex flex-col items-center space-y-2">
                <ProgressRing progress={cpuValue} size={48} strokeWidth={4} />
                <span className="text-xs font-mono text-muted-foreground">CPU</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <ProgressRing progress={memValue} size={48} strokeWidth={4} />
                <span className="text-xs font-mono text-muted-foreground">RAM</span>
            </div>
            <div className="flex flex-col items-center space-y-2 w-full px-2">
                <ResponsiveContainer width="100%" height={30}>
                    <LineChart data={netData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                <span className="text-xs font-mono text-muted-foreground">NET</span>
            </div>
        </div>
    );
}
