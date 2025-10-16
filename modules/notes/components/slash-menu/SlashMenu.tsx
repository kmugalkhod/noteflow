"use client";

import { useEffect } from 'react';
import { SlashMenuItem } from './SlashMenuItem';
import type { SlashMenuState } from './hooks/useSlashMenu';
import type { SlashCommand } from './SlashCommands';

interface SlashMenuProps {
  state: SlashMenuState;
  menuRef: React.RefObject<HTMLDivElement>;
  onSelectCommand: (command: SlashCommand, index: number) => void;
}

export const SlashMenu = ({ state, menuRef, onSelectCommand }: SlashMenuProps) => {
  // Scroll selected item into view
  useEffect(() => {
    if (menuRef.current && state.selectedIndex >= 0) {
      const selectedElement = menuRef.current.children[state.selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [state.selectedIndex, menuRef]);

  if (!state.isOpen || !state.position) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-80 max-h-96 overflow-y-auto bg-popover border border-border rounded-md shadow-lg"
      style={{
        left: `${state.position.x}px`,
        top: `${state.position.y}px`,
      }}
      role="listbox"
      aria-label="Slash commands"
    >
      {state.filteredCommands.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
          No commands found for "{state.query}"
        </div>
      ) : (
        <>
          {/* Basic Commands */}
          {state.filteredCommands.some(cmd => cmd.category === 'basic') && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                Basic blocks
              </div>
              {state.filteredCommands
                .filter(cmd => cmd.category === 'basic')
                .map((command, index) => {
                  const globalIndex = state.filteredCommands.indexOf(command);
                  return (
                    <SlashMenuItem
                      key={command.id}
                      command={command}
                      isSelected={globalIndex === state.selectedIndex}
                      onClick={() => onSelectCommand(command, globalIndex)}
                    />
                  );
                })}
            </div>
          )}
          
          {/* Advanced Commands */}
          {state.filteredCommands.some(cmd => cmd.category === 'advanced') && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                Advanced blocks
              </div>
              {state.filteredCommands
                .filter(cmd => cmd.category === 'advanced')
                .map((command, index) => {
                  const globalIndex = state.filteredCommands.indexOf(command);
                  return (
                    <SlashMenuItem
                      key={command.id}
                      command={command}
                      isSelected={globalIndex === state.selectedIndex}
                      onClick={() => onSelectCommand(command, globalIndex)}
                    />
                  );
                })}
            </div>
          )}
        </>
      )}
      
      {/* Footer with keyboard hints */}
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground bg-muted/30">
        <div className="flex items-center justify-between">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};