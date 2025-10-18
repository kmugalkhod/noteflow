import { Node, mergeAttributes } from '@tiptap/core';

export interface ToggleOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      /**
       * Set a toggle node
       */
      setToggle: (attributes?: { open?: boolean }) => ReturnType;
      /**
       * Toggle a toggle node
       */
      toggleToggle: () => ReturnType;
      /**
       * Update toggle open state
       */
      updateToggle: (open: boolean) => ReturnType;
    };
  }
}

export const Toggle = Node.create<ToggleOptions>({
  name: 'toggle',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: element => element.getAttribute('data-open') === 'true',
        renderHTML: attributes => {
          return {
            'data-open': attributes.open,
          };
        },
      },
      summary: {
        default: '',
        parseHTML: element => element.getAttribute('data-summary'),
        renderHTML: attributes => {
          return {
            'data-summary': attributes.summary,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'details[data-type="toggle"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const isOpen = HTMLAttributes.open;
    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'toggle',
        class: 'toggle-block',
        open: isOpen ? true : undefined,
      }),
      [
        'summary',
        { class: 'toggle-summary', contentEditable: 'true' },
        HTMLAttributes.summary || 'Toggle',
      ],
      ['div', { class: 'toggle-content' }, 0],
    ];
  },

  addCommands() {
    return {
      setToggle:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleToggle:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph');
        },
      updateToggle:
        (open) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { open });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-t': () => this.editor.commands.toggleToggle(),
    };
  },
});
