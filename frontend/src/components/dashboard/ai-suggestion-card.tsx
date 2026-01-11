import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/QueryClient";
import { Suggestion } from "@/types/dashboard";
import { Check, ShieldAlert, X, Zap } from "lucide-react";

interface AISuggestionCardProps {
  suggestion: Suggestion;
  isPending?: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const severityCopy: Record<Suggestion["severity"], { label: string; tone: string; icon: React.ReactNode }> = {
  critical: {
    label: "Critical",
    tone: "bg-red-500/20 text-red-200 border-red-500/30 hover:bg-red-500/30",
    icon: <ShieldAlert className="h-3 w-3 mr-1" />
  },
  high: {
    label: "High",
    tone: "bg-amber-500/20 text-amber-200 border-amber-500/30 hover:bg-amber-500/30",
    icon: <ShieldAlert className="h-3 w-3 mr-1" />
  },
  medium: {
    label: "Medium",
    tone: "bg-blue-500/20 text-blue-200 border-blue-500/30 hover:bg-blue-500/30",
    icon: <Zap className="h-3 w-3 mr-1" />
  },
  low: {
    label: "Optimization",
    tone: "bg-zinc-700/50 text-zinc-300 border-zinc-600/50",
    icon: <Zap className="h-3 w-3 mr-1" />
  },
};

export function AISuggestionCard({
  suggestion,
  isPending,
  onAccept,
  onReject,
}: AISuggestionCardProps) {
  const tone = severityCopy[suggestion.severity];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md animate-in slide-in-from-right-2 fade-in duration-500">

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium px-2 py-0.5 border h-5 flex items-center shadow-[0_0_10px_-4px_rgba(0,0,0,0.5)]", tone.tone)}
              >
                {tone.icon} {tone.label}
              </Badge>
              <h4 className="text-sm font-semibold tracking-tight text-zinc-100">
                {suggestion.title}
              </h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              {suggestion.detail}
            </p>
          </div>
        </div>

        {suggestion.status === "pending" && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-emerald-600/20 text-emerald-300 border border-emerald-600/30 hover:bg-emerald-600/30 hover:text-emerald-200 shadow-none flex-1 transition-all active:scale-95"
              onClick={() => onAccept(suggestion.id)}
              disabled={isPending}
            >
              <Check className="mr-1.5 h-3 w-3" />
              Apply Fix
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-full"
              onClick={() => onReject(suggestion.id)}
              disabled={isPending}
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

