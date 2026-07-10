# Bottom Sheet Regression Report

## Every File Modified

| File | Action |
|------|--------|
| `src/components/BottomSheet.tsx` | Modified — gesture architecture refactored |

**No other files were modified.**

---

## Exact Code Changes

### `src/components/BottomSheet.tsx`

#### 1. Removed `Pressable` backdrop

**Before:**
```tsx
<Pressable style={styles.backdropTouch} onPress={dismissSheet} />
```

**After:**
```tsx
{/* Backdrop — visual only, no touch handling */}
<Animated.View style={[styles.backdrop, { backgroundColor: c.overlay }, backdropStyle]} />
```

**Why:** The `Pressable` component uses the gesture system internally on Android. When both `Pressable` and `GestureDetector` exist in the same view hierarchy, they conflict — `Pressable` captures the touch sequence before `GestureDetector` can process it.

**Affects touch handling:** YES — removes the dedicated backdrop tap handler. Replaced by container-level touch detection.

---

#### 2. Changed `GestureDetector` scope from entire sheet to handle-only

**Before:**
```tsx
<GestureDetector gesture={panGesture}>
  <Animated.View style={[styles.sheet, ...]}>
    <View style={styles.handleArea}>...</View>
    <ScrollView>...</ScrollView>
  </Animated.View>
</GestureDetector>
```

**After:**
```tsx
<Animated.View style={[styles.sheet, ...]}>
  <GestureDetector gesture={panGesture}>
    <View style={styles.handleArea}>...</View>
  </GestureDetector>
  <ScrollView>...</ScrollView>
</Animated.View>
```

**Why:** Wrapping the entire sheet means the pan gesture competes with the ScrollView for touch events. By scoping the gesture to only the handle area, the drag affordance is explicit and there's no conflict with scrolling.

**Affects touch handling:** YES — drag gesture now only activates on the handle area (64px), not anywhere on the sheet.

---

#### 3. Added container touch handlers for backdrop tap

**Before:** No container touch handlers.

**After:**
```tsx
<View
  style={styles.container}
  pointerEvents="box-none"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

With handlers:
- `handleTouchStart`: Records touch start position
- `handleTouchMove`: Sets `hasMoved` flag if finger moves > 10px
- `handleTouchEnd`: If no movement (tap) and touch Y < 10% of screen height → dismiss

**Why:** Replaces the `Pressable` backdrop with a simpler touch detection mechanism that doesn't use the gesture system.

**Affects touch handling:** YES — backdrop tap detection changed from `Pressable.onPress` to manual touch coordinate checking.

---

#### 4. Added `pointerEvents="box-none"` to container

**Before:**
```tsx
<View style={styles.container}>
```

**After:**
```tsx
<View style={styles.container} pointerEvents="box-none">
```

**Why:** Without `pointerEvents="box-none"`, the container View may consume touches on Android, preventing them from reaching child elements.

**Affects touch handling:** YES — container no longer blocks touch delivery to children.

---

#### 5. Removed `scrollOffset` and `isAtTop` shared values

**Before:**
```tsx
const scrollOffset = useSharedValue(0);
const isAtTop = useSharedValue(true);
```

**After:** Removed entirely.

**Why:** These were used to coordinate the pan gesture with ScrollView scrolling. Since the gesture is now scoped to the handle only, this coordination is no longer needed.

**Affects touch handling:** YES — the pan gesture no longer checks scroll position before activating.

---

#### 6. Removed `backdropTouch` style

**Before:**
```tsx
backdropTouch: {
  ...StyleSheet.absoluteFill,
},
```

**After:** Style removed.

**Why:** The `Pressable` that used this style was removed.

**Affects touch handling:** YES — the touchable backdrop area no longer exists as a styled element.

---

#### 7. Added `useRef` for touch tracking

**Before:** No `useRef` for touch state.

**After:**
```tsx
const touchStartY = useRef(0);
const touchStartX = useRef(0);
const hasMoved = useRef(false);
```

**Why:** Needed for the new backdrop tap detection mechanism.

**Affects touch handling:** YES — adds touch state tracking.

---

#### 8. Removed `Pressable` and `GestureResponderEvent` from imports, added `useRef` and `GestureResponderEvent`

**Before:**
```tsx
import { View, StyleSheet, Pressable, ScrollView, ... } from 'react-native';
```

**After:**
```tsx
import React, { ..., useRef } from 'react';
import { View, StyleSheet, ScrollView, ..., GestureResponderEvent } from 'react-native';
```

**Why:** `Pressable` no longer used. `useRef` needed for touch tracking. `GestureResponderEvent` needed for touch handler types.

**Affects touch handling:** NO — import changes only.

---

#### 9. Removed `handleScroll` callback

**Before:**
```tsx
const handleScroll = useCallback((e: any) => {
  scrollOffset.value = e.nativeEvent.contentOffset.y;
  isAtTop.value = e.nativeEvent.contentOffset.y <= 0;
}, []);
```

**After:** Removed.

**Why:** No longer needed since the gesture doesn't coordinate with ScrollView.

**Affects touch handling:** YES — ScrollView no longer reports scroll position to the gesture system.

---

## Touch Hierarchy

### CURRENT

```
Modal (native)
  └── View (container, pointerEvents="box-none")
        ├── Animated.View (backdrop, visual only, NO touch handling)
        └── Animated.View (sheet, position: absolute)
              ├── GestureDetector
              │     └── View (handleArea, 64px)
              │           └── View (handle, visual pill)
              └── Animated.View (content)
                    └── ScrollView (children)
```

### Which component receives touch events first?

1. **Modal** (native) — receives all touches in the modal window
2. **Container View** — `pointerEvents="box-none"` passes touches through
3. **Backdrop Animated.View** — `absoluteFill` but NO touch handlers (visual only)
4. **Sheet Animated.View** — `absoluteFill` at bottom, receives touches in sheet area
5. **GestureDetector** — wraps handleArea only, activates pan gesture on handle
6. **ScrollView** — handles its own touches for scrolling

Touch flow:
- Touch on handle area → `GestureDetector` activates pan gesture
- Touch on content area → `ScrollView` handles scrolling
- Touch on backdrop area (above sheet) → container `onTouchEnd` detects tap → dismiss

---

## Gesture Ownership

| Gesture | Owner | Notes |
|---------|-------|-------|
| **Tap (backdrop)** | Container `onTouchEnd` | Detects tap via coordinate check (Y < 10% screen) |
| **Drag (handle)** | `GestureDetector` → `Gesture.Pan()` | Scoped to handle area only (64px) |
| **Scroll** | `ScrollView` | Independent, no gesture coordination |
| **Back button** | `BackHandler` useEffect | Calls `dismissSheet()` |

---

## pointerEvents

| Component | pointerEvents | Effect |
|-----------|---------------|--------|
| Container View | `"box-none"` | Passes touches to children, doesn't consume |
| Backdrop Animated.View | (none) | Visual only, no touch handlers |
| Sheet Animated.View | (none) | Receives touches normally |
| HandleArea View | (none) | Inside GestureDetector, receives pan gestures |
| ScrollView | (none) | Handles its own scrolling |

---

## GestureDetector

**Current location:** Wraps ONLY the `handleArea` View (64px height).

```
<GestureDetector gesture={panGesture}>
  <View style={styles.handleArea}>
    <View style={styles.handle} />
  </View>
</GestureDetector>
```

**Previous location:** Wrapped the entire sheet `Animated.View`.

**Impact:** Pan gesture now only activates when user touches the handle area. Touches elsewhere on the sheet go to ScrollView or container.

---

## Pressable Backdrop

**Current status:** REMOVED. No longer exists in the component tree.

**Previous status:** Existed as `<Pressable style={styles.backdropTouch} onPress={dismissSheet} />` with `StyleSheet.absoluteFill`.

**Why removed:** `Pressable` uses the gesture system internally on Android. When both `Pressable` and `GestureDetector` exist in the same hierarchy, `Pressable` captures touches before `GestureDetector` can process them.

**Replacement:** Container-level touch detection via `onTouchStart`/`onTouchMove`/`onTouchEnd` with coordinate-based tap detection.

---

## Modal

**Current implementation:** Unchanged.

```tsx
<Modal
  visible={isOpen}
  transparent
  animationType="none"
  onRequestClose={dismissSheet}
  statusBarTranslucent
>
```

**Does Modal block touches differently?** NO — the Modal implementation is identical. The only change is inside the Modal's children (removed Pressable, restructured GestureDetector).

**Potential issue:** On Android, the native Modal may still intercept touches before they reach the React Native view hierarchy. This is a platform-level behavior that cannot be changed without replacing the Modal with a custom native implementation.

---

## Regression

### 1. Backdrop tap detection is imprecise

**Before:** `Pressable` with `StyleSheet.absoluteFill` — any tap anywhere on the backdrop triggered dismiss.

**After:** Container `onTouchEnd` checks if `touchY < screenHeight * 0.1`. This means:
- Taps in the top 10% of screen always dismiss
- Taps between the sheet top and 10% mark may NOT dismiss
- The exact boundary depends on sheet height (which varies by content)

**Impact:** Backdrop taps in the area between the sheet top and the 10% threshold may not trigger dismiss.

### 2. Drag only works on handle area

**Before:** `GestureDetector` wrapped entire sheet — drag worked anywhere on the sheet surface.

**After:** `GestureDetector` wraps only the 64px handle area — drag only works on the handle.

**Impact:** Users can no longer drag from the content area. They must grab the handle specifically.

### 3. No visual feedback on backdrop area

**Before:** `Pressable` had visual press feedback (opacity change on press).

**After:** No visual feedback — container touch handlers don't provide press states.

**Impact:** Users don't see visual confirmation when tapping the backdrop.

### 4. Touch coordinate check is approximate

**Before:** `Pressable` had exact hit testing — tap on the Pressable element triggered dismiss.

**After:** `handleTouchEnd` uses `screenHeight * 0.1` as approximate sheet top boundary.

**Impact:** The dismiss boundary is not precise. If the sheet is shorter than 90% of screen, taps above the sheet but below the 10% mark won't dismiss.

### 5. No `onPressIn`/`onPressOut` visual feedback

**Before:** `Pressable` provided `onPressIn`/`onPressOut` states for visual feedback.

**After:** Raw touch handlers don't provide press state callbacks.

**Impact:** No press animation on backdrop tap.

### 6. ScrollView no longer coordinates with drag

**Before:** `scrollOffset` and `isAtTop` shared values coordinated drag with scroll position.

**After:** These values removed. Drag activates regardless of scroll position (but only on handle).

**Impact:** If user scrolls content and then tries to drag from handle, the drag works. But there's no scroll-awareness in the gesture.
