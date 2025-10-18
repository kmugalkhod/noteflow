"use client";

import { useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import { Callout } from './tiptap-extensions/Callout';
import { Toggle } from './tiptap-extensions/Toggle';
import { tiptapToBlocks, blocksToTiptap } from '../../utils/tiptapSerializer';
import { EditorToolbar } from './EditorToolbar';
import type { Block, BlockType } from '../../types/blocks';
import type { RichEditorRef } from './RichEditor';
// import './tiptap-editor-styles.css'; // Temporarily disabled - TODO: Convert @apply to CSS

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (blocks: Block[], serialized: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export const TiptapEditor = forwardRef<RichEditorRef, TiptapEditorProps>(({
  initialContent = '',
  placeholder = "Type '/' for commands",
  onChange,
  onFocus,
  onBlur,
  className = '',
}, ref) => {

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'text',
      }),
      Placeholder.configure({
        placeholder: placeholder,
        showOnlyWhenEditable: true,
      }),
      Callout,
      Toggle,
    ],
    content: parseInitialContent(initialContent),
    editorProps: {
      attributes: {
        class: 'tiptap-editor prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const tiptapJSON = editor.getJSON();
        const blocks = tiptapToBlocks(tiptapJSON);
        const serialized = JSON.stringify(blocks);
        onChange(blocks, serialized);
      }
    },
    onFocus: () => {
      if (onFocus) onFocus();
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
  });

  // Parse initial content (could be JSON blocks or plain text)
  function parseInitialContent(content: string): JSONContent {
    if (!content) {
      return {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
    }

    try {
      // Try to parse as block JSON first
      const blocks = JSON.parse(content) as Block[];
      if (Array.isArray(blocks) && blocks.length > 0 && blocks[0].type) {
        return blocksToTiptap(blocks);
      }
    } catch {
      // Not valid JSON, treat as plain text
    }

    // Fallback: plain text
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: content ? [{ type: 'text', text: content }] : [],
        },
      ],
    };
  }

  // Update content when initialContent changes
  useEffect(() => {
    if (editor && initialContent) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = parseInitialContent(initialContent);
      const newContentString = JSON.stringify(newContent);

      if (currentContent !== newContentString) {
        editor.commands.setContent(newContent);
      }
    }
  }, [initialContent, editor]);

  // Expose editor methods through ref (matching old RichEditor API)
  useImperativeHandle(ref, () => ({
    focus: () => {
      editor?.commands.focus();
    },
    getBlocks: () => {
      if (!editor) return [];
      return tiptapToBlocks(editor.getJSON());
    },
    setBlocks: (blocks: Block[]) => {
      if (!editor) return;
      const tiptapContent = blocksToTiptap(blocks);
      editor.commands.setContent(tiptapContent);
    },
    insertBlock: (type: BlockType, content = '') => {
      if (!editor) return;

      switch (type) {
        case 'paragraph':
          editor.commands.insertContent({ type: 'paragraph', content: content ? [{ type: 'text', text: content }] : [] });
          break;
        case 'heading1':
          editor.commands.insertContent({ type: 'heading', attrs: { level: 1 }, content: content ? [{ type: 'text', text: content }] : [] });
          break;
        case 'heading2':
          editor.commands.insertContent({ type: 'heading', attrs: { level: 2 }, content: content ? [{ type: 'text', text: content }] : [] });
          break;
        case 'heading3':
          editor.commands.insertContent({ type: 'heading', attrs: { level: 3 }, content: content ? [{ type: 'text', text: content }] : [] });
          break;
        case 'bulletList':
          editor.commands.insertContent({ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: content ? [{ type: 'text', text: content }] : [] }] }] });
          break;
        case 'numberedList':
          editor.commands.insertContent({ type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: content ? [{ type: 'text', text: content }] : [] }] }] });
          break;
        case 'todo':
          editor.commands.insertContent({ type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: content ? [{ type: 'text', text: content }] : [] }] }] });
          break;
        case 'quote':
          editor.commands.insertContent({ type: 'blockquote', content: [{ type: 'paragraph', content: content ? [{ type: 'text', text: content }] : [] }] });
          break;
        case 'code':
          editor.commands.insertContent({ type: 'codeBlock', content: content ? [{ type: 'text', text: content }] : [] });
          break;
        case 'divider':
          editor.commands.insertContent({ type: 'horizontalRule' });
          break;
        case 'callout':
          editor.commands.insertContent({ type: 'callout', attrs: { icon: '💡', color: 'default' }, content: content ? [{ type: 'text', text: content }] : [] });
          break;
        case 'toggle':
          editor.commands.insertContent({ type: 'toggle', attrs: { open: false, summary: content }, content: [{ type: 'paragraph' }] });
          break;
        case 'image':
          editor.commands.insertContent({ type: 'image', attrs: { src: content || '' } });
          break;
        case 'table':
          editor.commands.insertContent({
            type: 'table',
            content: [
              { type: 'tableRow', content: [{ type: 'tableHeader', content: [{ type: 'paragraph' }] }, { type: 'tableHeader', content: [{ type: 'paragraph' }] }, { type: 'tableHeader', content: [{ type: 'paragraph' }] }] },
              { type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }, { type: 'tableCell', content: [{ type: 'paragraph' }] }, { type: 'tableCell', content: [{ type: 'paragraph' }] }] },
              { type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }, { type: 'tableCell', content: [{ type: 'paragraph' }] }, { type: 'tableCell', content: [{ type: 'paragraph' }] }] },
            ],
          });
          break;
      }
    },
  }), [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      <EditorToolbar editor={editor} />
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';
