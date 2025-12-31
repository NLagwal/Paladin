import React from 'react';
import { Suggestion } from '@/types/dashboard';
import { AISuggestionCard } from './ai-suggestion-card';

interface AISuggestionsProps {
  suggestions: Suggestion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isPending?: boolean;
}

export function AISuggestions({ suggestions, onAccept, onReject, isPending }: AISuggestionsProps) {
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="w-[20%] border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col">
      <div className="h-12 border-b border-zinc-800/50 px-4 flex items-center justify-between shrink-0">
        <div className="text-sm font-medium">AI Triage</div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          {pendingSuggestions.length}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {pendingSuggestions.length === 0 ? (
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 text-sm text-zinc-500">
            No pending suggestions
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