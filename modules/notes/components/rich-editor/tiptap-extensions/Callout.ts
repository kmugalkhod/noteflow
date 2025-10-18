import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: (attributes?: { icon?: string; color?: string }) => ReturnType;
      /**
       * Toggle a callout node
       */
      toggleCallout: () => ReturnType;
      /**
       * Update callout attributes
       */
      updateCallout: (attributes: { icon?: string; color?: string }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      icon: {
        default: '💡',
        parseHTML: element => element.getAttribute('data-icon'),
        renderHTML: attributes => {
          return {
            'data-icon': attributes.icon,
          };
        },
      },
      color: {
        default: 'default',
        parseHTML: element => element.getAttribute('data-color'),
        renderHTML: attributes => {
          return {
            'data-color': attributes.color,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: `callout callout-${HTMLAttributes.color || 'default'}`,
      }),
      [
        'span',
        { class: 'callout-icon', contentEditable: 'false' },
        HTMLAttributes.icon || '💡',
      ],
      ['div', { class: 'callout-content' }, 0],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCallout:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph');
        },
      updateCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-c': () => this.editor.commands.toggleCallout(),
    };
  },
});
