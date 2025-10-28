# Quick Testing Guide - 5 Minutes

## 🚀 Start Testing

```bash
npm run dev
```

Visit: `http://localhost:3000` (or the port shown)

---

## ✅ 10 Essential Tests (1 minute each)

### 1. ✨ Button Animations (10 seconds)
- **Action:** Hover over "New story" button
- **Expected:** Button scales up
- **Action:** Click and hold
- **Expected:** Button scales down
- ✅ **Pass:** Smooth scale animation

---

### 2. 🎯 Input Focus (10 seconds)
- **Action:** Click on search bar
- **Expected:** Border color changes (NO blue ring)
- **Action:** Press Tab to move between inputs
- **Expected:** Clean focus indicators
- ✅ **Pass:** No intrusive blue glow

---

### 3. 📱 Skeleton Loaders (15 seconds)
- **Action:** Hard refresh (Cmd+Shift+R)
- **Expected:** See gray skeleton boxes
- **Expected:** Shimmer animation (left to right)
- **Expected:** Smoothly replaced by content
- ✅ **Pass:** Loading states visible

---

### 4. 🔔 Toast Notifications (20 seconds)
- **Action:** Right-click folder → Change color
- **Expected:** Green success toast appears
- **Wait:** 3 seconds
- **Expected:** Toast auto-dismisses
- ✅ **Pass:** Context-aware timing

---

### 5. 🎭 Modal Animations (15 seconds)
- **Action:** Right-click folder → Delete
- **Expected:** Dialog scales in smoothly
- **Action:** Press Escape
- **Expected:** Dialog scales out
- ✅ **Pass:** Smooth transitions

---

### 6. 🖱️ Drag & Drop Feedback (20 seconds)
- **Action:** Drag a folder in sidebar
- **Expected:** Folder becomes transparent
- **Action:** Drag over another folder
- **Expected:** Dashed border appears
- ✅ **Pass:** Clear visual feedback

---

### 7. ⌨️ Keyboard Shortcuts (15 seconds)
- **Action:** Press Cmd+K (or Ctrl+K on Windows)
- **Expected:** Command palette opens
- **Action:** Press Escape
- **Expected:** Palette closes
- ✅ **Pass:** Shortcuts working

---

### 8. 🔤 Typography (10 seconds)
- **Action:** Look at headings and paragraphs
- **Expected:** Text looks crisp and readable
- **Expected:** Comfortable line-spacing
- ✅ **Pass:** Improved readability

---

### 9. 🎨 Selection Color (10 seconds)
- **Action:** Select text in a note
- **Expected:** Blue highlight (primary color)
- **Expected:** Text remains readable
- ✅ **Pass:** Custom selection color

---

### 10. ♿ Accessibility (30 seconds)

**Test Reduced Motion:**
- **macOS:** System Settings → Accessibility → Display → Reduce Motion ON
- **DevTools:** F12 → Cmd+Shift+P → "Emulate prefers-reduced-motion" → reduce

**After enabling:**
- **Action:** Hover buttons, open modals
- **Expected:** NO animations
- **Expected:** Everything still works perfectly
- ✅ **Pass:** Respects user preferences

---

## 🎯 Quick Pass/Fail

**All working if:**
- ✅ Buttons scale on hover/press
- ✅ No blue rings on inputs
- ✅ Skeletons shimmer
- ✅ Toasts auto-dismiss (3s)
- ✅ Modals animate in/out
- ✅ Drag shows feedback
- ✅ Cmd/Ctrl+K works
- ✅ Text looks crisp
- ✅ Selection has color
- ✅ Works without animations

**If 8+ pass → ✅ SUCCESS!**

---

## 🐛 Something Wrong?

### Animations not working?
```javascript
// Open console (F12), check:
localStorage.getItem('noteflow:animation-preference')
// Should be null or show preference

// Clear and retry:
localStorage.clear()
// Then hard refresh: Cmd+Shift+R
```

### Toast not showing?
- Check browser console for errors
- Try different action (create folder, change color)

### Skeleton not appearing?
- They show briefly while loading
- Try: DevTools → Network → Slow 3G
- Refresh page

---

## 📊 Performance Check (optional)

```bash
# Build for production
npm run build

# Expected:
# ✓ Compiled successfully
# ✓ Bundle size increase < 10KB
# ✓ No errors
```

---

## ✅ Done!

**Tested all 10 items?** → You've verified the complete UI/UX implementation! 🎉

**For detailed testing:** See `TESTING_CHECKLIST.md`
**For documentation:** See `FINAL_IMPLEMENTATION_REPORT.md`
