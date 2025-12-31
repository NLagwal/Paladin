import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/QueryClient";
import { Suggestion } from "@/types/dashboard";
import { Check, ShieldAlert, X } from "lucide-react";

interface AISuggestionCardProps {
  suggestion: Suggestion;
  isPending?: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const severityCopy: Record<Suggestion["severity"], { label: string; tone: string }> = {
  critical: { label: "Critical", tone: "bg-red-500/10 text-red-300 border-red-500/30" },
  high: { label: "High", tone: "bg-amber-500/10 text-amber-200 border-amber-500/30" },
  medium: { label: "Medium", tone: "bg-slate-700 text-slate-200 border-border" },
  low: { label: "Low", tone: "bg-slate-800 text-slate-300 border-border" },
};

export function AISuggestionCard({
  suggestion,
  isPending,
  onAccept,
  onReject,
}: AISuggestionCardProps) {
  const tone = severityCopy[suggestion.severity];

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none">{suggestion.title}</p>
              <Badge
                variant="outline"
                className={cn("text-[11px] font-medium", tone.tone)}
              >
                {tone.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {suggestion.detail}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-[11px] font-medium uppercase tracking-[0.08em]",
            suggestion.status === "pending"
              ? "text-amber-200"
              : suggestion.status === "accepted"
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {suggestion.status}
        </span>
      </div>
      {suggestion.status === "pending" && (
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 px-3"
            onClick={() => onAccept(suggestion.id)}
            disabled={isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={() => onReject(suggestion.id)}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}

