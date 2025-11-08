/**
 * File Upload Validation
 *
 * Comprehensive file validation to prevent security vulnerabilities:
 * - Magic byte verification (prevents MIME type spoofing)
 * - SVG blocking (prevents XSS attacks)
 * - File size limits
 * - Dangerous extension blocking
 * - Content-type validation
 */

/**
 * Allowed image file signatures (magic bytes)
 * These are the first few bytes that identify file types
 */
export const ALLOWED_IMAGE_SIGNATURES = {
  'image/jpeg': {
    signatures: [
      [0xFF, 0xD8, 0xFF], // JPEG/JPG
    ],
    extensions: ['.jpg', '.jpeg'],
  },
  'image/png': {
    signatures: [
      [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    ],
    extensions: ['.png'],
  },
  'image/gif': {
    signatures: [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
    ],
    extensions: ['.gif'],
  },
  'image/webp': {
    signatures: [
      [0x52, 0x49, 0x46, 0x46], // RIFF (WebP container)
    ],
    extensions: ['.webp'],
  },
} as const;

/**
 * Blocked file extensions (security risk)
 * These can execute code or contain malicious content
 */
export const BLOCKED_EXTENSIONS = [
  // Vector graphics (XSS risk)
  '.svg',
  '.svgz',

  // Executables
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.sh',
  '.app',

  // Scripts
  '.js',
  '.vbs',
  '.ps1',

  // Web files with potential scripts
  '.html',
  '.htm',
  '.xml',

  // Archives (can hide malware)
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',

  // Office macros
  '.xlsm',
  '.docm',
  '.pptm',
];

/**
 * Maximum file sizes
 */
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5 MB
  default: 10 * 1024 * 1024, // 10 MB
} as const;

/**
 * Validation result type
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  detectedType?: string;
}

/**
 * Read the first N bytes of a file
 */
async function readFileBytes(file: File, numBytes: number): Promise<Uint8Array> {
  const slice = file.slice(0, numBytes);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Check if file bytes match a signature
 */
function matchesSignature(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false;

  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Detect file type by magic bytes
 */
async function detectFileType(file: File): Promise<string | null> {
  // Read first 16 bytes (enough for most signatures)
  const bytes = await readFileBytes(file, 16);

  // Check against known signatures
  for (const [mimeType, config] of Object.entries(ALLOWED_IMAGE_SIGNATURES)) {
    for (const signature of config.signatures) {
      if (matchesSignature(bytes, signature)) {
        return mimeType;
      }
    }
  }

  return null;
}

/**
 * Validate file extension
 */
function validateExtension(fileName: string): FileValidationResult {
  const extension = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];

  if (!extension) {
    return {
      valid: false,
      error: 'File must have an extension',
    };
  }

  // Check if extension is blocked
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type ${extension} is not allowed for security reasons`,
    };
  }

  // Check if extension matches allowed image types
  const allowedExtensions = Object.values(ALLOWED_IMAGE_SIGNATURES)
    .flatMap(config => config.extensions);

  if (!allowedExtensions.includes(extension as any)) {
    return {
      valid: false,
      error: `Only image files are allowed (${allowedExtensions.join(', ')})`,
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type against detected file type
 */
async function validateMimeType(file: File): Promise<FileValidationResult> {
  const declaredMimeType = file.type;

  // Block SVG explicitly (even if MIME type claims it's safe)
  if (declaredMimeType === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return {
      valid: false,
      error: 'SVG files are not allowed due to XSS security risks',
    };
  }

  // Detect actual file type by magic bytes
  const detectedType = await detectFileType(file);

  if (!detectedType) {
    return {
      valid: false,
      error: 'Could not verify file type. File may be corrupted or unsupported.',
    };
  }

  // Check if declared type matches detected type
  if (declaredMimeType && declaredMimeType !== detectedType) {
    return {
      valid: false,
      error: `File type mismatch: declared as ${declaredMimeType} but detected as ${detectedType}`,
    };
  }

  return {
    valid: true,
    mimeType: detectedType,
    detectedType,
  };
}

/**
 * Validate file size
 */
function validateFileSize(file: File): FileValidationResult {
  const maxSize = FILE_SIZE_LIMITS.image;

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    return {
      valid: false,
      error: `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * MAIN VALIDATION FUNCTION
 *
 * Performs comprehensive validation on uploaded files:
 * 1. File size check
 * 2. Extension validation
 * 3. Magic byte verification
 * 4. MIME type validation
 * 5. SVG blocking
 *
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export async function validateImageFile(file: File): Promise<FileValidationResult> {
  // 1. Validate file size
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;

  // 2. Validate extension
  const extensionCheck = validateExtension(file.name);
  if (!extensionCheck.valid) return extensionCheck;

  // 3. Validate MIME type and magic bytes
  const mimeCheck = await validateMimeType(file);
  if (!mimeCheck.valid) return mimeCheck;

  // All checks passed
  return {
    valid: true,
    mimeType: mimeCheck.mimeType,
    detectedType: mimeCheck.detectedType,
  };
}

/**
 * Quick validation (client-side only)
 * Use this for instant feedback before upload
 * Always follow up with full validateImageFile() on server
 */
export function quickValidate(file: File): FileValidationResult {
  // Size check
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;

  // Extension check
  const extensionCheck = validateExtension(file.name);
  if (!extensionCheck.valid) return extensionCheck;

  // Basic MIME check (can be spoofed, so this is just preliminary)
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select an image file',
    };
  }

  if (file.type === 'image/svg+xml') {
    return {
      valid: false,
      error: 'SVG files are not allowed due to security risks',
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename
 * Removes potentially dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let clean = filename.replace(/\.\./g, '');

  // Remove special characters except dot, dash, underscore
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  const maxLength = 100;
  if (clean.length > maxLength) {
    const extension = clean.match(/\.[^.]+$/)?.[0] || '';
    const nameLength = maxLength - extension.length;
    clean = clean.substring(0, nameLength) + extension;
  }

  return clean;
}

/**
 * Generate safe filename with timestamp
 */
export function generateSafeFilename(originalName: string): string {
  const sanitized = sanitizeFilename(originalName);
  const extension = sanitized.match(/\.[^.]+$/)?.[0] || '.jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `upload_${timestamp}_${random}${extension}`;
}

/**
 * Validation error messages for user display
 */
export const VALIDATION_ERRORS = {
  SIZE_EXCEEDED: 'Image is too large. Maximum size is 5MB.',
  INVALID_TYPE: 'Please select a valid image file (JPEG, PNG, GIF, or WebP).',
  SVG_BLOCKED: 'SVG files cannot be uploaded for security reasons.',
  TYPE_MISMATCH: 'File appears to be corrupted or is not a valid image.',
  EMPTY_FILE: 'The selected file is empty.',
  NO_EXTENSION: 'File must have a valid extension.',
  BLOCKED_EXTENSION: 'This file type is not allowed.',
} as const;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(result: FileValidationResult): string {
  if (result.valid) return '';

  const error = result.error || '';

  if (error.includes('size')) return VALIDATION_ERRORS.SIZE_EXCEEDED;
  if (error.includes('SVG')) return VALIDATION_ERRORS.SVG_BLOCKED;
  if (error.includes('mismatch')) return VALIDATION_ERRORS.TYPE_MISMATCH;
  if (error.includes('empty')) return VALIDATION_ERRORS.EMPTY_FILE;
  if (error.includes('extension') && !error.includes('blocked')) {
    return VALIDATION_ERRORS.NO_EXTENSION;
  }
  if (error.includes('not allowed')) return VALIDATION_ERRORS.BLOCKED_EXTENSION;

  return VALIDATION_ERRORS.INVALID_TYPE;
}
