# Research: Excalidraw Drawing Integration

**Date**: 2025-10-29
**Feature**: 006-excalidraw-drawing-feature

## Research Questions

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context in plan.md.

---

## 1. Drawing Library Selection: Excalidraw vs tldraw

### Decision: **tldraw**

### Rationale

After comprehensive research comparing both libraries, **tldraw** is the recommended choice for the following reasons:

#### Technical Advantages
1. **Bundle Size**: 32.6 kB (minified + gzipped) vs Excalidraw's 46.8 MB unpacked package
2. **React 19 Compatibility**: Clean support without dependency conflicts (Excalidraw has @radix-ui peer dependency warnings)
3. **Performance**: Better architecture for handling large canvases (1000+ elements) using signals library and record store
4. **Customization**: 25+ replaceable UI components vs Excalidraw's limited customization

#### Feature Comparison
| Feature | tldraw | Excalidraw |
|---------|--------|------------|
| Shapes, arrows, text, freehand | ✅ | ✅ |
| Undo/redo | ✅ | ✅ |
| Zoom, pan, grid | ✅ | ✅ |
| PNG/SVG export | ✅ | ✅ |
| PDF export | ❌ | ✅ (desktop only) |
| Toolbar customization | ✅ Full control | ❌ Limited |
| Bundle size | ✅ Small | ⚠️ Large |
| React 19 support | ✅ Clean | ⚠️ Peer dep warnings |

#### Community & Maintenance
- **tldraw**: 43.4K GitHub stars, $14.1M funding, very active development (commits within hours)
- **Excalidraw**: 108K GitHub stars, 250K-310K monthly npm downloads, MIT licensed

### Trade-offs
- **Lost**: Hand-drawn aesthetic, PDF export, larger community, MIT license (tldraw uses proprietary license for production)
- **Gained**: Better performance, smaller bundle, superior customization, cleaner React 19 support

### Implementation Details
```typescript
// Installation
npm install tldraw

// Basic integration (requires client-side rendering)
import dynamic from "next/dynamic";
import "tldraw/tldraw.css";

const Tldraw = dynamic(
  () => import('tldraw').then((mod) => mod.Tldraw),
  { ssr: false }
);
```

### Alternatives Considered
- **Excalidraw**: Rejected due to larger bundle size, React 19 peer dependency issues, and limited customization
- **Fabric.js**: Lower-level canvas library, requires more implementation work
- **Konva.js**: Canvas library without built-in drawing UI

---

## 2. Testing Framework

### Decision: **Vitest** (to be set up)

### Rationale

The codebase currently has **no testing framework configured**. Research findings:
- No test files exist (*.test.ts, *.spec.ts)
- No test configuration files
- No testing dependencies in package.json
- CLAUDE.md mentions `npm test` command but script doesn't exist

For this project, **Vitest** is recommended:

#### Why Vitest?
1. **Native ESM support**: Works seamlessly with Next.js 15 and TypeScript 5.9
2. **Vite-powered**: Extremely fast test execution
3. **Jest-compatible API**: Easy migration path if team knows Jest
4. **Built-in TypeScript support**: No additional configuration needed
5. **React Testing Library integration**: Standard for React component testing

#### Installation
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

#### Configuration (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})
```

#### Test Structure
```
tests/
├── setup.ts                       # Test setup file
├── drawing/
│   ├── DrawingCanvas.test.tsx     # Component tests
│   └── drawing-mutations.test.ts  # Convex function tests
└── integration/
    └── drawing-integration.test.tsx
```

### Alternatives Considered
- **Jest**: More mature but slower, requires more configuration for ESM
- **Cypress/Playwright**: E2E testing, overkill for unit/integration tests
- **No testing**: Not acceptable for production feature

---

## 3. Auto-Save Strategy with Convex

### Decision: **Debounced mutations with optimistic updates**

### Rationale

For drawing auto-save in Convex, the recommended pattern is:

#### Strategy
1. **Debounce drawing changes**: Wait 1-2 seconds after last change before saving
2. **Use Convex mutations**: `updateDrawing(drawingId, serializedData)`
3. **Optimistic updates**: Update local state immediately, sync to server in background
4. **Conflict resolution**: Last-write-wins (simple, acceptable for single-user drawings)

#### Implementation Pattern
```typescript
// In DrawingCanvas.tsx
import { useDebounce } from '@/hooks/useDebounce';
import { useMutation } from 'convex/react';

const DrawingCanvas = () => {
  const [drawingData, setDrawingData] = useState(initialData);
  const debouncedData = useDebounce(drawingData, 1500); // 1.5s delay
  const updateDrawing = useMutation(api.drawings.update);

  useEffect(() => {
    if (debouncedData && drawingId) {
      updateDrawing({
        drawingId,
        data: JSON.stringify(debouncedData)
      }).catch(err => {
        toast.error('Failed to save drawing');
      });
    }
  }, [debouncedData]);
};
```

#### Best Practices from Convex Docs
1. **Mutations for writes**: Use Convex mutations (not actions) for database writes
2. **Keep mutations fast**: Serialize data client-side, not in mutation
3. **Handle errors gracefully**: Show toast notification on failure
4. **Size limits**: Convex has 1MB document size limit - implement size checks

#### Performance Considerations
- Serialize drawing data to JSON client-side (don't send raw objects)
- Compress large drawings (use library like `lz-string` if needed)
- Monitor drawing size and warn user if approaching limits
- Use Convex's built-in reactivity for real-time sync across tabs

### Alternatives Considered
- **Save on every change**: Too many network requests, poor performance
- **Save on blur/close**: Risk of data loss if user navigates away
- **Manual save button**: Poor UX, users forget to save

---

## 4. Performance Optimization Strategies

### Decision: **Multi-layered optimization approach**

### Rationale

To achieve <100ms interaction latency and <500ms load time:

#### 4.1 Code Splitting & Lazy Loading
```typescript
// Lazy load drawing component
const DrawingCanvas = dynamic(
  () => import('@/components/drawing/DrawingCanvas'),
  {
    ssr: false,
    loading: () => <DrawingLoadingSkeleton />
  }
);
```

**Impact**: Reduces initial bundle size, faster page load

#### 4.2 Canvas Rendering Optimization
- **tldraw built-in optimizations**: Uses signals library for efficient re-renders
- **Virtualization**: tldraw only renders visible elements on large canvases
- **RAF throttling**: Drawing updates throttled to requestAnimationFrame

#### 4.3 Data Serialization
```typescript
// Compress large drawings before saving
import LZString from 'lz-string';

const compressDrawing = (data: object) => {
  const json = JSON.stringify(data);
  return LZString.compressToUTF16(json);
};
```

**Impact**: Reduces network payload, faster saves/loads

#### 4.4 Caching Strategy
- **Browser cache**: Store last drawing state in localStorage as backup
- **Convex cache**: Convex automatically caches query results
- **Stale-while-revalidate**: Show cached drawing immediately, update in background

#### 4.5 Monitoring
```typescript
// Add performance marks
performance.mark('drawing-load-start');
// ... load drawing
performance.mark('drawing-load-end');
performance.measure('drawing-load', 'drawing-load-start', 'drawing-load-end');
```

**Targets**:
- Time to interactive: <500ms
- Drawing change latency: <100ms
- Auto-save overhead: <50ms (non-blocking)

### Alternatives Considered
- **Server-side rendering**: Not possible with canvas libraries
- **Web Workers**: Overkill for current requirements, added complexity
- **Canvas instead of SVG**: tldraw already uses optimal rendering

---

## 5. Bundle Size Management

### Decision: **Code splitting + tree shaking + compression**

### Rationale

To minimize bundle size impact:

#### 5.1 Dynamic Imports
```typescript
// Only load drawing library when needed
const DrawingFeature = dynamic(() => import('./DrawingFeature'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

**Expected savings**: ~200-300 KB not loaded on initial page load

#### 5.2 Tree Shaking
```typescript
// Import only what's needed from tldraw
import { Tldraw, useEditor } from 'tldraw';
// Don't import entire tldraw package
```

#### 5.3 Compression
- **Brotli compression**: Next.js automatically applies (40-50% size reduction)
- **Image optimization**: Use Next.js Image component for exported drawings
- **Minification**: Next.js production build handles this

#### 5.4 Bundle Analysis
```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({...});
```

**Run with**: `ANALYZE=true npm run build`

#### 5.5 Size Budget
- **Main bundle**: < 300 KB (currently unknown, need to measure)
- **Drawing chunk**: < 200 KB (tldraw + dependencies)
- **Total impact**: < 500 KB additional JS

### Monitoring
- Set up bundle size CI checks
- Alert if bundle grows > 10% between builds
- Use Next.js Bundle Analyzer to track changes

### Alternatives Considered
- **CDN hosting**: Adds external dependency, cache invalidation complexity
- **Alternative smaller libraries**: No suitable alternatives found with required features
- **Custom canvas implementation**: Would take months, not worth it

---

## 6. Mobile Support Strategy

### Decision: **Responsive design with simplified mobile UI**

### Rationale

Given constraints:

#### 6.1 Approach
- **Desktop/Tablet**: Full editing experience
- **Mobile phones**: View-only or simplified drawing tools
- **Touch optimization**: tldraw has built-in touch gesture support

#### 6.2 Implementation
```typescript
// Detect device type
import { useMediaQuery } from '@/hooks/useMediaQuery';

const DrawingCanvas = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Tldraw
      components={{
        Toolbar: isMobile ? SimplifiedToolbar : DefaultToolbar,
      }}
      // Disable complex features on mobile
      options={{
        isReadonly: isMobile ? true : false,
      }}
    />
  );
};
```

#### 6.3 Features by Device
| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Full editing | ✅ | ✅ | ❌ |
| View drawings | ✅ | ✅ | ✅ |
| Basic shapes | ✅ | ✅ | ⚠️ Limited |
| Text editing | ✅ | ✅ | ⚠️ Simplified |
| Export | ✅ | ✅ | ✅ |
| Pan/Zoom | ✅ | ✅ | ✅ Touch gestures |

### Alternatives Considered
- **Full mobile editing**: Too complex for v1, poor UX on small screens
- **No mobile support**: Unacceptable, users need to view drawings on mobile
- **Separate mobile app**: Out of scope, unnecessary

---

## 7. Data Storage & Size Limits

### Decision: **Convex database with size monitoring**

### Rationale

#### 7.1 Storage Structure
```typescript
// convex/schema.ts
drawings: defineTable({
  noteId: v.id("notes"),
  userId: v.id("users"),
  data: v.string(),          // Serialized tldraw data (compressed if needed)
  version: v.number(),        // Schema version for migrations
  sizeBytes: v.number(),      // Track drawing size
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

#### 7.2 Size Limits
- **Convex document limit**: 1 MB per document
- **Practical limit for drawings**: 500 KB (compressed)
- **Warning threshold**: 400 KB
- **Hard limit**: 500 KB (prevent save if exceeded)

#### 7.3 Size Monitoring
```typescript
const validateDrawingSize = (data: string) => {
  const sizeBytes = new Blob([data]).size;
  const sizeMB = sizeBytes / (1024 * 1024);

  if (sizeMB > 0.5) {
    throw new Error('Drawing is too large (max 500 KB)');
  }

  if (sizeMB > 0.4) {
    toast.warning('Drawing is getting large, consider splitting into multiple notes');
  }

  return sizeBytes;
};
```

#### 7.4 Compression Strategy
```typescript
import LZString from 'lz-string';

// Compress before saving
const saveDrawing = (data: TLStoreSnapshot) => {
  const json = JSON.stringify(data);
  const compressed = LZString.compressToUTF16(json);

  const sizeBytes = new Blob([compressed]).size;

  if (sizeBytes > 500000) {
    throw new Error('Drawing too large after compression');
  }

  return updateDrawing({ data: compressed, sizeBytes });
};
```

**Compression ratio**: Typically 60-80% size reduction for drawing data

### Alternatives Considered
- **Store in Convex FileStorage**: More complex, harder to query, but no size limit
- **External blob storage**: Added complexity, network latency
- **Client-side only storage**: No sync across devices

---

## Implementation Recommendations

### Phase 1: Foundation (Days 1-3)
1. Install tldraw: `npm install tldraw`
2. Set up Vitest: `npm install -D vitest @testing-library/react`
3. Create basic DrawingCanvas component with dynamic import
4. Add drawings table to Convex schema

### Phase 2: Integration (Days 4-6)
1. Integrate drawing canvas into note editor
2. Implement Convex mutations (create, update, delete)
3. Add auto-save with debouncing
4. Size validation and compression

### Phase 3: Features (Days 7-10)
1. Export functionality (PNG, SVG)
2. Toolbar customization to match app theme
3. Mobile responsive design
4. Performance monitoring

### Phase 4: Polish (Days 11-13)
1. Error handling and loading states
2. Keyboard shortcuts
3. Accessibility improvements
4. Write tests for critical paths

---

## Open Questions

1. **Licensing**: Confirm tldraw licensing requirements for production use
2. **Concurrent editing**: Do we need real-time collaboration in v1? (Recommendation: No)
3. **Drawing templates**: Should we provide template shapes/diagrams? (Recommendation: Not in v1)
4. **Versioning**: Do we need drawing history/versioning? (Recommendation: Not in v1, undo/redo is sufficient)

---

## References

- [tldraw Documentation](https://tldraw.dev/)
- [tldraw GitHub](https://github.com/tldraw/tldraw)
- [Excalidraw Documentation](https://docs.excalidraw.com/)
- [Convex Database Limits](https://docs.convex.dev/database/document-storage)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
