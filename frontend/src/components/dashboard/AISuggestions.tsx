import React from 'react';
import { Suggestion } from '@/types/dashboard';
import { AISuggestionCard } from './ai-suggestion-card';
import { Sparkles, Inbox } from 'lucide-react';

interface AISuggestionsProps {
  suggestions: Suggestion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isPending?: boolean;
}

export function AISuggestions({ suggestions, onAccept, onReject, isPending }: AISuggestionsProps) {
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="w-[20%] border-r border-border/50 bg-card/20 flex flex-col backdrop-blur-sm">
      <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between shrink-0 bg-background/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <div className="text-sm font-semibold tracking-tight text-foreground/90">AI Triage</div>
        </div>
        {pendingSuggestions.length > 0 && (
          <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary shadow-[0_0_10px_-4px_rgba(var(--primary),0.5)]">
            {pendingSuggestions.length}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 opacity-60">
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-400">All caught up</p>
              <p className="text-xs text-zinc-600">No pending suggestions from AI agent.</p>
            </div>
          </div>
        ) : (
          pendingSuggestions.map((suggestion) => (
            <AISuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={onAccept}
              onReject={onReject}
              isPending={isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}