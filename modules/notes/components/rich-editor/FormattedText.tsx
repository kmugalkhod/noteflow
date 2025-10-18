"use client";

import type { FormattedContent, FormattedTextSegment } from '../../types/blocks';
import { getColorClass, getBackgroundColorClass } from '../../utils/textFormatting';

interface FormattedTextProps {
  content: FormattedContent;
  className?: string;
}

export function FormattedText({ content, className = '' }: FormattedTextProps) {
  // If content is a plain string, render it directly
  if (typeof content === 'string') {
    return <span className={className}>{content}</span>;
  }

  // Render formatted segments
  return (
    <span className={className}>
      {content.map((segment, index) => (
        <FormattedSegment key={index} segment={segment} />
      ))}
    </span>
  );
}

function FormattedSegment({ segment }: { segment: FormattedTextSegment }) {
  let classes = '';
  let styles: React.CSSProperties = {};

  // Apply formatting classes
  if (segment.bold) classes += ' font-bold';
  if (segment.italic) classes += ' italic';
  if (segment.underline) classes += ' underline';
  if (segment.strikethrough) classes += ' line-through';
  if (segment.code) {
    classes += ' font-mono bg-accent px-1.5 py-0.5 rounded text-sm';
  }

  // Apply color
  if (segment.color) {
    const colorClass = getColorClass(segment.color);
    console.log('Segment color:', segment.color, 'class:', colorClass);
    if (colorClass) classes += ` ${colorClass}`;
  }

  // Apply background color
  if (segment.backgroundColor) {
    const bgClass = getBackgroundColorClass(segment.backgroundColor);
    if (bgClass) classes += ` ${bgClass} px-0.5 rounded`;
  }

  console.log('Rendering segment:', segment.text, 'with classes:', classes);
  return <span className={classes.trim()} style={styles}>{segment.text}</span>;
}
