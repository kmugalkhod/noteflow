"use client";

interface CalloutBlockProps {
  content: string;
  properties?: { icon?: string; color?: string };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const CalloutBlock = ({ 
  content, 
  properties = {}, 
  placeholder, 
  isFocused, 
  onChange, 
  onPropertyChange,
  onFocus, 
  onBlur 
}: CalloutBlockProps) => {
  const icon = properties.icon || '💡';
  const color = properties.color || 'default';
  const calloutPlaceholder = placeholder || 'Callout text...';

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'gray':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
      case 'blue':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'green':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'red':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'purple':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      default:
        return 'bg-accent/50 border-border';
    }
  };

  const handleIconChange = (newIcon: string) => {
    if (onPropertyChange) {
      onPropertyChange({ icon: newIcon, color });
    }
  };

  return (
    <div className={`rounded-md border p-4 ${getColorClasses(color)}`}>
      <div className="flex items-start gap-3">
        <input
          type="text"
          value={icon}
          onChange={(e) => handleIconChange(e.target.value)}
          className="w-8 text-center bg-transparent border-none outline-none text-lg"
          maxLength={2}
        />
        <input
          type="text"
          value={content}
          onChange={(e) => onChange(e.target.value, e.target)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={calloutPlaceholder}
          className="flex-1 text-base border-none outline-none bg-transparent placeholder:text-muted-foreground/50"
          autoFocus={isFocused}
        />
      </div>
    </div>
  );
};