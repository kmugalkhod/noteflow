"use client";

import { memo } from 'react';
import type { SlashCommand } from './SlashCommands';

interface SlashMenuItemProps {
  command: SlashCommand;
  isSelected: boolean;
  onClick: () => void;
}

export const SlashMenuItem = memo(({ command, isSelected, onClick }: SlashMenuItemProps) => {
  const IconComponent = command.icon;
  
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
    >
      <div className={`flex-shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
          {command.label}
        </div>
        <div className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {command.description}
        </div>
      </div>
      
      {/* Show primary alias as shortcut hint */}
      {command.aliases[0] && (
        <div className={`text-xs px-1.5 py-0.5 rounded border ${
          isSelected 
            ? 'border-primary-foreground/20 text-primary-foreground/70' 
            : 'border-border text-muted-foreground'
        }`}>
          /{command.aliases[0]}
        </div>
      )}
    </div>
  );
});

SlashMenuItem.displayName = 'SlashMenuItem';