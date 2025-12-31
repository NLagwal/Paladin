import React from 'react';
import { Shield, Sparkles, Timer } from 'lucide-react';

export function Header() {
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/50 border border-border/50">
            <span className="text-muted-foreground">OBJ:</span>
            <span className="font-semibold text-foreground">7</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/50 border border-border/50">
            <span className="text-muted-foreground">LOOPS:</span>
            <span className="font-semibold text-foreground">3</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary/50 border border-border/50">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-semibold text-foreground">04:12</span>
          </div>
      </div>
    </div>
  );
}