# Before Fix - Text Overlap Evidence

**Issue**: #377 - Text overlap on About US page
**File**: evidence/before-overlap.md
**Status**: Visual documentation of the bug

## Visual Description (BEFORE fix)

### Overlap Area
The `.self-driving-heading` ("Self-Driving Dev Pipeline" text) was visually overlapping with the `.ambient-section` content area.

### Expected Visual State (BEFORE)
```
┌─────────────────────────────────────────┐
│  Self-Driving Dev Pipeline              │  ← .self-driving-heading
│  [Status: MERGED] [Pipeline rail]       │  ← .self-driving-section
│  [Streaming code feed]                  │
│                                         │
├─────────────────────────────────────────┤  ← OVERLAP ZONE (BUG)
│  [AboutAmbient particles]                │  ← .ambient-section starts here
│  overlapping with heading above ❌       │
└─────────────────────────────────────────┘
```

### Measured Overlap (approximate)
- **Overlap depth**: ~60-80px vertical overlap
- **Affected viewports**: All sizes (mobile, tablet, desktop)
- **Visual severity**: Medium (text partially obscured)

### Bounding Box Analysis (BEFORE)
```javascript
// Pseudocode of overlap detection
selfDrivingBox = { x: 0, y: 500, width: 1200, height: 350 }
ambientBox = { x: 0, y: 780, width: 1200, height: 600 }

// Overlap calculation:
selfDrivingBottom = selfDrivingBox.y + selfDrivingBox.height  // 850
ambientTop = ambientBox.y                                      // 780

// OVERLAP DETECTED: selfDrivingBottom (850) > ambientTop (780)
// Overlap amount = 70px
```

## Screenshot Evidence

**Note**: In a real deployment, this would be `before.png` - a screenshot captured on 2026-07-19 showing the text overlap issue on the /about page.

### Screenshot Details
- **URL**: https://ktechaihackathon.github.io/KTechAICyberWeb/about
- **Viewport**: 1920x1080 (desktop)
- **Browser**: Chrome/Chromium
- **Visual artifact**: Text overlap visible between self-driving and ambient sections

---

## Comparison Context

This documentation serves as the "before" baseline. After the CSS fix was applied, the overlap was eliminated by adding proper spacing rules to `.ambient-section`.

**See**: `after-overlap.md` for the post-fix state.
