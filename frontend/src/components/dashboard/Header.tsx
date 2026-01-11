import React, { useEffect, useState } from 'react';
import { Shield, Timer } from 'lucide-react';
import { api, AiStatus } from '@/lib/api';
import { SettingsModal } from './SettingsModal';

export function Header() {
  const [status, setStatus] = useState<AiStatus>({
    status: "CONNECTING...",
    mode: "-",
    model: "-",
    uptime: "-"
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await api.getAiStatus();
      setStatus(data);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-14 border-b border-border/50 bg-card/20 flex items-center px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-bold font-mono">PALADIN</div>
          <div className="text-xs text-muted-foreground -mt-0.5 font-mono">COMMAND EXECUTOR</div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs font-mono">
        <SettingsModal />
        <div className="w-px h-6 bg-border/50 mx-1" />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/50 border border-border/50">
          <span className="text-muted-foreground">STATUS:</span>
          <span className={status.status === "ONLINE" ? "font-semibold text-green-400" : "font-semibold text-destructive"}>
            {status.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/50 border border-border/50">
          <span className="text-muted-foreground">MODE:</span>
          <span className="font-semibold text-foreground">{status.mode}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/50 border border-border/50">
          <span className="text-muted-foreground">MODEL:</span>
          <span className="font-semibold text-foreground">{status.model}</span>
        </div>
      </div>
    </div>
  );
}