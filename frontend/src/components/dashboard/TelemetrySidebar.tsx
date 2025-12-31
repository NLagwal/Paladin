import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Thermometer } from 'lucide-react';

interface TelemetryData {
  cpu: number;
  memory: number;
  disk: number;
  cpuTemp: number;
  timestamp: string;
  error?: string;
}

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  return envUrl || 'http://localhost:5000/api';
};


export function TelemetrySidebar() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cpu: 0,
    memory: 0,
    disk: 0,
    cpuTemp: 0,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const apiUrl = getApiUrl();
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`${apiUrl}/telemetry`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTelemetry(data);
      } catch (error) {
        console.error('Failed to fetch telemetry:', error);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[80px] border-r border-border/50 bg-card/30 flex flex-col items-center py-4 space-y-6">
      {/* CPU */}
      <div className="flex flex-col items-center space-y-2">
        <ProgressRing 
          progress={telemetry.cpu} 
          size={48} 
          strokeWidth={4} 
        />
        <span className="text-xs font-mono text-muted-foreground">CPU</span>
        <span className="text-[10px] font-mono text-foreground/60">{telemetry.cpu}%</span>
      </div>

      {/* RAM */}
      <div className="flex flex-col items-center space-y-2">
        <ProgressRing 
          progress={telemetry.memory} 
          size={48} 
          strokeWidth={4} 
        />
        <span className="text-xs font-mono text-muted-foreground">RAM</span>
        <span className="text-[10px] font-mono text-foreground/60">{telemetry.memory}%</span>
      </div>

      {/* CPU Temp */}
      <div className="flex flex-col items-center space-y-2">
        <Thermometer size={48} className="text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">TEMP</span>
        <span className="text-[10px] font-mono text-foreground/60">{telemetry.cpuTemp}°C</span>
      </div>
    </div>
  );
}

