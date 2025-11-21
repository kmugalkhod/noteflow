"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { AIInput } from "./AIInput";

interface AIToolbarProps {
  onAIAction: (action: "summarize" | "continue" | "custom", prompt?: string) => Promise<void>;
  isGenerating: boolean;
  disabled?: boolean;
}

export function AIToolbar({ onAIAction, isGenerating, disabled = false }: AIToolbarProps) {
  const [showAIInput, setShowAIInput] = useState(false);

  const handleQuickAction = async (action: "summarize" | "continue") => {
    await onAIAction(action);
  };

  const handleCustomPrompt = async (prompt: string) => {
    await onAIAction("custom", prompt);
    setShowAIInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAIInput(!showAIInput)}
          disabled={disabled || isGenerating}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600/20 rounded-full text-xs font-medium transition-all border border-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          Ask AI
        </button>

        <button
          onClick={() => handleQuickAction("continue")}
          disabled={disabled || isGenerating}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue writing...
        </button>

        <button
          onClick={() => handleQuickAction("summarize")}
          disabled={disabled || isGenerating}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Summarize
        </button>
      </div>

      {/* AI Input Box - Expandable */}
      {showAIInput && (
        <AIInput
          onSubmit={handleCustomPrompt}
          onCancel={() => setShowAIInput(false)}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
