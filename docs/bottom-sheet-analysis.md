# Bottom Sheet — Technical Analysis Report

## 1. Architecture

### Component Hierarchy

The BottomSheet is implemented as a **forwardRef component** using React's `forwardRef` API. It exposes two imperative methods: `present()` and `dismiss()`.

### Parent Hierarchy (outside-in)

```
GestureHandlerRootView          (app/_layout.tsx)
  └── BottomSheetProvider       (src/components/BottomSheetContext.tsx)
        └── Stack (expo-router) (app/_layout.tsx)
              └── Tabs          (app/(tabs)/_layout.tsx)
                    └── Tab Screens (index.tsx, templates.tsx, settings.tsx)
                          └── Per-component BottomSheet instances
```

### Two Usage Patterns

**Pattern A — Singleton via Context (root-level)**
- `BottomSheetProvider` in `app/_layout.tsx` renders ONE `BottomSheet` at the root
- Consumed via `useBottomSheet()` hook → `showBottomSheet(content)` / `hideBottomSheet()`
- Used by: `PromptPreviewSheet`, `TemplatePreviewSheet` (via `BottomSheetContext`)
- Rendered as a **sibling** to `Stack`, meaning it sits at the root layout level

**Pattern B — Per-component instances (inline)**
- Individual components create their own `BottomSheet` with `useRef<BottomSheetRef>`
- Rendered **inside** tab screen content, which is inside the `Tabs` navigator
- Used by: `ColorPickerModal`, `VersionHistoryModal`, `EnhancedPromptSheet`, `ContextMenu`, `TemplateContextMenu`, `categories.tsx`, `templates.tsx`
- These are rendered **inside** the tab content stacking context

### Overlay Implementation

The overlay is a **native React Native `Modal`** with `transparent` and `animationType="none"`. This creates a native OS-level window that renders above all React Native content, including the tab bar.

The `Modal` contains:
1. An `Animated.View` for the backdrop (opacity animated)
2. A `Pressable` for backdrop tap-to-dismiss
3. A `GestureDetector` wrapping the entire sheet for drag gesture

### Animation Architecture

All animations use **React Native Reanimated 4.5.0** shared values:
- `translateY` — sheet position (starts at `screenHeight`, animates to `0`)
- `backdropOpacity` — backdrop dim (starts at `0`, animates to `0.60`)
- `contentOpacity` — content fade (starts at `0`, animates to `1`)

Spring physics for sheet movement, timing for opacity transitions.

---

## 2. Opening / Closing Logic

### How It Opens

1. Parent calls `sheetRef.current?.present()`
2. `present()` calls `setIsOpen(true)`
3. `useEffect` on `[isOpen]` triggers:
   - Haptic feedback (`hapticLight()`)
   - If reduced motion: set values immediately
   - Otherwise: `translateY` springs to `0`, `backdropOpacity` times to `0.60`, `contentOpacity` times to `1`
4. `Modal` `visible` prop becomes `true`, native modal appears

### How It Closes

1. One of three triggers:
   - User drags sheet past threshold → `dismissSheet()` called
   - User taps backdrop → `dismissSheet()` called
   - User presses Android back button → `dismissSheet()` called
2. `dismissSheet()`:
   - Haptic feedback (`hapticMedium()`)
   - If reduced motion: set values immediately, `setIsOpen(false)`, call `onClose?.()`
   - Otherwise: `translateY` springs to `screenHeight`, `contentOpacity` times to `0` in 150ms, `backdropOpacity` times to `0` in 280ms
   - On backdrop animation finish: `runOnJS(setIsOpen)(false)`, then `runOnJS(onClose)()`
3. `Modal` `visible` becomes `false`, native modal dismissed

### State Management

- Single boolean state: `isOpen` (React `useState`)
- All animation values: Reanimated `useSharedValue` (JS thread + UI thread shared)
- No external state management (no Zustand for sheet state)

### Animated Values

| Value | Type | Initial | Target (open) | Target (close) |
|-------|------|---------|---------------|----------------|
| `translateY` | SharedValue | `screenHeight` | `0` | `screenHeight` |
| `backdropOpacity` | SharedValue | `0` | `0.60` | `0` |
| `contentOpacity` | SharedValue | `0` | `1` | `0` |
| `scrollOffset` | SharedValue | `0` | (tracked) | (reset) |
| `isAtTop` | SharedValue | `true` | (tracked) | (reset) |
| `reduceMotion` | SharedValue | `false` | (detected) | (detected) |

### Timing / Spring Configuration

```
OPEN_SPRING  = { damping: 22, stiffness: 220, mass: 0.9 }
CLOSE_SPRING = { damping: 28, stiffness: 280, mass: 1.0 }
BACKDROP_DURATION = 280ms
CONTENT_FADE_DURATION = 200ms
```

---

## 3. Gesture System

### Library Used

**react-native-gesture-handler 2.32.0** — Specifically the `Gesture.Pan()` API (new gesture system, not the old `PanResponder`).

### PanResponder Usage

**None.** The implementation uses `Gesture.Pan()` from react-native-gesture-handler, not React Native's built-in `PanResponder` or Gesture Responder System.

### Pressable Usage

A `Pressable` is used for the **backdrop tap-to-dismiss** (line 166):
```tsx
<Pressable style={styles.backdropTouch} onPress={dismissSheet} />
```

This is a separate component from the gesture handler. It handles single taps to close the sheet.

### Which Component Receives Touch Events

The `GestureDetector` wraps the **entire sheet** `Animated.View` (lines 169-199). This means:
- The pan gesture activates anywhere on the sheet surface
- Including the handle bar area, content area, and any children

### Which Component Owns the Pan Gesture

The `panGesture` is created via `Gesture.Pan()` (lines 122-139) and attached to the `GestureDetector` that wraps the sheet.

### How the Drag Gesture Is Calculated

1. **Activation**: `activeOffsetY([0, 5])` — gesture activates after 5px of downward movement
2. **Update**: `onUpdate` callback:
   - Checks `isAtTop` and `scrollOffset` — if content is scrolled down, gesture is ignored
   - Clamps `translateY` to `Math.max(0, event.translationY)` — can't drag above 0
   - Updates backdrop opacity proportionally: `0.60 * (1 - progress)`
3. **End**: `onEnd` callback:
   - If `translationY > 100` (DISMISS_THRESHOLD) OR `velocityY > 500` (VELOCITY_THRESHOLD): dismiss
   - Otherwise: snap back to open position with spring

### Thresholds

| Constant | Value | Purpose |
|----------|-------|---------|
| `DISMISS_THRESHOLD` | 100px | Distance dragged to trigger dismiss |
| `VELOCITY_THRESHOLD` | 500px/s | Velocity to trigger dismiss even if distance < 100px |
| `HANDLE_AREA_HEIGHT` | 64px | Visual height of the drag handle area |
| `HANDLE_BAR_WIDTH` | 40px | Width of the pill bar |
| `HANDLE_BAR_HEIGHT` | 5px | Height of the pill bar |

### Release Logic

On gesture end:
- **Dismiss**: `translationY > 100` OR `velocityY > 500` → `dismissSheet()` called via `runOnJS`
- **Snap back**: Otherwise → `translateY` springs to `0`, haptic feedback, backdrop restores

---

## 4. Pill Handle

### Component

The handle is a nested `View` structure inside the `GestureDetector`:

```
<GestureDetector gesture={panGesture}>
  <Animated.View style={styles.sheet}>        ← sheet container
    <View style={styles.handleArea}>          ← 64px touch target
      <View style={styles.handle} />          ← visual pill (40x5px)
    </View>
    ...
  </Animated.View>
</GestureDetector>
```

### Styling

| Property | Value | Notes |
|----------|-------|-------|
| `handleArea.height` | 64px | Large touch target |
| `handleArea.alignItems` | `center` | Horizontally centers pill |
| `handleArea.justifyContent` | `center` | Vertically centers pill |
| `handle.width` | 40px | Visual pill width |
| `handle.height` | 5px | Visual pill height |
| `handle.borderRadius` | 2.5px | Rounded ends |
| `handle.backgroundColor` | `c.outline` | Theme token |

### Pointer Events

No explicit `pointerEvents` set on the handle. It inherits from parent.

### HitSlop

No `hitSlop` on the handle. The touch target is the full 64px `handleArea` height.

### zIndex / elevation / overflow / position

- No `zIndex` on handle or handleArea
- No `elevation` on handle or handleArea
- No `overflow` on handle or handleArea
- `handleArea` has no explicit `position` (static)
- `sheet` has `position: 'absolute'` with `bottom: 0`

### Whether It Receives Touch Events

**The handle itself does NOT directly receive touch events.** The `GestureDetector` wraps the entire sheet, so the pan gesture is on the sheet `Animated.View`, not on the handle. The handle is purely visual — a decorative indicator showing users where to grab.

The touch event flow for the handle area:
1. Touch lands on `handleArea` View
2. `GestureDetector` (parent) intercepts the pan gesture
3. Pan gesture `onStart` / `onUpdate` / `onEnd` fire
4. Sheet moves based on gesture translation

---

## 5. Animated Values

| Value | Created At | Updated By | Purpose |
|-------|-----------|------------|---------|
| `translateY` | Line 41 | `useEffect([isOpen])`, `panGesture.onUpdate`, `panGesture.onEnd`, `dismissSheet` | Sheet vertical position |
| `backdropOpacity` | Line 42 | `useEffect([isOpen])`, `panGesture.onUpdate`, `panGesture.onEnd`, `dismissSheet` | Backdrop dim level |
| `contentOpacity` | Line 43 | `useEffect([isOpen])`, `dismissSheet` | Content fade in/out |
| `scrollOffset` | Line 44 | `handleScroll` | Tracks ScrollView offset |
| `isAtTop` | Line 45 | `handleScroll` | Whether ScrollView is at top |
| `reduceMotion` | Line 46 | `useEffect` (accessibility listener) | Reduced motion preference |

### Animated Styles

| Style | Driven By | Applied To |
|-------|-----------|------------|
| `backdropStyle` | `backdropOpacity` | Backdrop `Animated.View` |
| `sheetStyle` | `translateY` | Sheet `Animated.View` (via `transform: [{ translateY }]`) |
| `contentStyle` | `contentOpacity` | Content `Animated.View` |

---

## 6. Event Flow

### Finger Touch on Handle Bar

```
Finger Touch
    ↓
Modal (native) receives touch
    ↓
View (container) passes to children
    ↓
Pressable (backdropTouch) — NOT triggered (touch is on sheet, not backdrop)
    ↓
GestureDetector (wraps sheet) — Pan gesture activates
    ↓
Gesture.Pan().onUpdate() — if isAtTop && scrollOffset === 0:
    ↓
    translateY.value = Math.max(0, event.translationY)
    ↓
    backdropOpacity.value = 0.60 * (1 - progress)
    ↓
    Animated.View (sheet) transforms via sheetStyle
    ↓
    Sheet moves down on screen
    ↓
Finger Release
    ↓
Gesture.Pan().onEnd() —
    ↓
    if translationY > 100 OR velocityY > 500:
        ↓
        runOnJS(dismissSheet)()
        ↓
        hapticMedium()
        ↓
        translateY → withSpring(screenHeight, CLOSE_SPRING)
        ↓
        contentOpacity → withTiming(0, 150ms)
        ↓
        backdropOpacity → withTiming(0, 280ms)
        ↓
        on animation finish: setIsOpen(false), onClose()
        ↓
        Modal visible → false
    else:
        ↓
        hapticLight()
        ↓
        translateY → withSpring(0, OPEN_SPRING)
        ↓
        backdropOpacity → withTiming(0.60, 280ms)
        ↓
        Sheet snaps back to open position
```

---

## 7. Android Specific Notes

### pointerEvents

The container `View` has no explicit `pointerEvents` prop. Previously it had `pointerEvents="box-none"` which was removed because it could interfere with touch delivery to the sheet.

### Nested ScrollView

The sheet contains a `ScrollView` with `nestedScrollEnabled` and `bounces={false}`. The scroll view's `onScroll` updates `scrollOffset` and `isAtTop` shared values, which the pan gesture checks before activating.

### Touchable Components

- `Pressable` on backdrop — handles tap-to-dismiss
- No `TouchableWithoutFeedback` used (was removed in favor of `Pressable`)

### overflow hidden

No explicit `overflow` set on any component in the BottomSheet.

### Absolute Positioning

- `sheet`: `position: 'absolute'`, `left: 0`, `right: 0`, `bottom: 0` — anchored to bottom
- `backdrop`: `StyleSheet.absoluteFill` — fills entire screen
- `backdropTouch`: `StyleSheet.absoluteFill` — fills entire screen

### zIndex / elevation

- No `zIndex` or `elevation` on BottomSheet components
- The `Modal` itself creates a native OS-level window above all React Native content

### Modal Implementation

Uses React Native's `Modal` with:
- `visible={isOpen}`
- `transparent={true}`
- `animationType="none"` (custom animations via Reanimated)
- `statusBarTranslucent={true}`
- `onRequestClose={dismissSheet}` (Android back button)

### Potential Android Issues

1. **Modal touch handling**: Android Modal may intercept touches differently than iOS
2. **Gesture Handler in Modal**: react-native-gesture-handler gestures inside Modal may have platform-specific behavior
3. **Elevation conflicts**: Other components with high `elevation` (PillTabBar: 9998, FAB: 9999) may create stacking context issues, though the Modal should render above them

---

## 8. Possible Reasons Why Drag Doesn't Work

### 8.1 Modal Touch Interception

**Why**: React Native's `Modal` on Android may intercept or consume touch events before they reach the `GestureDetector`.

**Where**: `BottomSheet.tsx` — the `<Modal>` wrapper (line 154)

**Affected files**: `src/components/BottomSheet.tsx`

### 8.2 Pressable Backdrop Intercepting

**Why**: The `Pressable` backdrop (`styles.backdropTouch`) uses `StyleSheet.absoluteFill` and may intercept touches that should reach the sheet. Even though the sheet is rendered after the backdrop, the Pressable's touchable area may overlap.

**Where**: `BottomSheet.tsx` — line 166

**Affected files**: `src/components/BottomSheet.tsx`

### 8.3 GestureDetector Activation Threshold

**Why**: `activeOffsetY([0, 5])` requires 5px of downward movement before the gesture activates. On some devices or with imprecise touch, this may not trigger.

**Where**: `BottomSheet.tsx` — line 123

**Affected files**: `src/components/BottomSheet.tsx`

### 8.4 ScrollView Consuming Touches

**Why**: The `ScrollView` inside the sheet may consume touch events for scrolling, preventing the pan gesture from activating. The `isAtTop` check only blocks the gesture when scrolled down, but the ScrollView may still intercept the initial touch.

**Where**: `BottomSheet.tsx` — lines 186-197

**Affected files**: `src/components/BottomSheet.tsx`

### 8.5 Container View Blocking Touches

**Why**: The container `View` (line 161) may not properly pass touches to its children on Android. Without `pointerEvents="box-none"`, it may consume touches.

**Where**: `BottomSheet.tsx` — line 161

**Affected files**: `src/components/BottomSheet.tsx`

### 8.6 Native Modal Layer Priority

**Why**: On Android, the native `Modal` creates a new window layer. Touch events in this layer may be handled differently than in the main React Native view hierarchy.

**Where**: `BottomSheet.tsx` — the `<Modal>` component

**Affected files**: `src/components/BottomSheet.tsx`

### 8.7 Gesture Handler Library Version Conflicts

**Why**: react-native-gesture-handler 2.32.0 with react-native-reanimated 4.5.0 on react-native 0.86.0 may have known issues with gestures inside Modal.

**Where**: `package.json`

**Affected files**: `package.json`, `src/components/BottomSheet.tsx`

### 8.8 Animated View Transform Conflict

**Why**: The `sheetStyle` applies `transform: [{ translateY }]` via `useAnimatedStyle`. The `GestureDetector` wrapping the same `Animated.View` may have trouble tracking touches on a transformed element.

**Where**: `BottomSheet.tsx` — lines 145-147, 170-179

**Affected files**: `src/components/BottomSheet.tsx`

---

## 9. File Structure

| File | Responsibility |
|------|---------------|
| `src/components/BottomSheet.tsx` | Core BottomSheet component — animation, gesture, rendering |
| `src/components/BottomSheetContext.tsx` | Singleton BottomSheet provider for root-level usage |
| `app/_layout.tsx` | Root layout — renders `BottomSheetProvider` at app root |
| `src/components/ColorPickerModal.tsx` | Color picker — uses BottomSheet via ref |
| `src/components/VersionHistoryModal.tsx` | Version history — uses BottomSheet via ref |
| `src/components/EnhancedPromptSheet.tsx` | AI enhancement result — uses BottomSheet via ref |
| `src/components/ContextMenu.tsx` | Prompt context menu — uses 2 BottomSheets via refs |
| `src/components/TemplateContextMenu.tsx` | Template context menu — uses BottomSheet via ref |
| `src/components/PromptPreviewSheet.tsx` | Prompt preview — uses BottomSheet via context |
| `src/components/TemplatePreviewSheet.tsx` | Template preview — uses BottomSheet via context |
| `app/(tabs)/templates.tsx` | Templates screen — uses BottomSheet for category picker |
| `app/categories.tsx` | Categories screen — uses 2 BottomSheets for delete/reassign |
| `app/(tabs)/_layout.tsx` | Tab layout — defines PillTabBar and FAB z-index values |
| `src/components/PillTabBar.tsx` | Tab bar — has `zIndex: 9998` |

---

## 10. Component Tree

### Root Level (BottomSheetContext)

```
GestureHandlerRootView
  └── BottomSheetProvider
        ├── {children}  (Stack → Tabs → Screens)
        └── BottomSheet (singleton)
              └── Modal
                    └── View (container)
                          ├── Animated.View (backdrop)
                          ├── Pressable (backdropTouch)
                          └── GestureDetector
                                └── Animated.View (sheet)
                                      ├── View (handleArea)
                                      │     └── View (handle) ← the "pill"
                                      └── Animated.View (content)
                                            └── ScrollView
                                                  └── {children}
```

### Per-Component Instance (e.g., ColorPickerModal)

```
Tab Screen (e.g., index.tsx)
  └── ColorPickerModal
        └── BottomSheet (instance)
              └── Modal
                    └── View (container)
                          ├── Animated.View (backdrop)
                          ├── Pressable (backdropTouch)
                          └── GestureDetector
                                └── Animated.View (sheet)
                                      ├── View (handleArea)
                                      │     └── View (handle) ← the "pill"
                                      └── Animated.View (content)
                                            └── ScrollView
                                                  └── Color grid, etc.
```

---

## 11. Current Gesture Lifecycle

### Phase 1: Touch Down

1. User's finger touches the sheet area (including handle bar)
2. React Native's touch system delivers the event to the Modal's view hierarchy
3. The `Pressable` backdrop does NOT intercept (touch is on sheet, not backdrop)
4. `GestureDetector` begins tracking the touch

### Phase 2: Gesture Activation

1. `Gesture.Pan()` monitors vertical movement
2. `activeOffsetY([0, 5])` — waits for 5px downward movement
3. Once threshold met, gesture enters active state
4. `onStart` callback fires (if implemented)

### Phase 3: Gesture Update (Drag)

1. `onUpdate` fires on each frame during drag
2. Checks `isAtTop` and `scrollOffset` — if content is scrolled, gesture is ignored
3. Calculates `newY = Math.max(0, event.translationY)`
4. Updates `translateY.value = newY` — sheet moves
5. Updates `backdropOpacity.value = 0.60 * (1 - progress)` — backdrop fades

### Phase 4: Gesture End (Release)

1. `onEnd` fires when finger lifts
2. Evaluates dismiss criteria:
   - `translationY > 100` (DISMISS_THRESHOLD) → dismiss
   - `velocityY > 500` (VELOCITY_THRESHOLD) → dismiss
3. If dismiss: calls `runOnJS(dismissSheet)()`
4. If not dismiss: calls `runOnJS(hapticLight)()` and snaps back

### Phase 5: Dismiss Animation

1. `hapticMedium()` triggers haptic feedback
2. `translateY` springs to `screenHeight` (off-screen) via `withSpring`
3. `contentOpacity` fades to `0` in 150ms via `withTiming`
4. `backdropOpacity` fades to `0` in 280ms via `withTiming`
5. On backdrop animation finish: `setIsOpen(false)`, `onClose()` called
6. `Modal` `visible` becomes `false` — native modal dismissed

---

## 12. Technical Debt

### 12.1 Modal Touch Handling on Android

**Issue**: React Native's `Modal` on Android may intercept or consume touch events before they reach `GestureDetector`. This is a known platform-specific behavior.

**Risk**: High — directly affects drag gesture functionality.

**Mitigation**: Would require either custom native modal implementation or workaround with `pointerEvents`.

### 12.2 Gesture + ScrollView Conflict

**Issue**: The `ScrollView` inside the sheet may consume touches before the `GestureDetector` can process them. The `isAtTop` check is a workaround but doesn't prevent the initial touch interception.

**Risk**: Medium — users may experience unresponsive drag when content is scrollable.

**Mitigation**: Would require `simultaneousHandlers` or `waitFor` configuration, or a custom scroll-view that coordinates with the pan gesture.

### 12.3 Backdrop Pressable Overlap

**Issue**: The `Pressable` backdrop has `StyleSheet.absoluteFill` and may intercept touches that should reach the sheet. The sheet is rendered after the backdrop in the component tree, but on Android the touch delivery order may differ.

**Risk**: Medium — backdrop may "steal" touches from the sheet.

**Mitigation**: Could use `pointerEvents="none"` on the Pressable and handle taps via a different mechanism.

### 12.4 Multiple BottomSheet Instances

**Issue**: Each component that uses BottomSheet creates its own `Modal` instance. When multiple sheets are open (e.g., `ContextMenu` has 2), multiple native modals stack.

**Risk**: Low — currently only one sheet is open at a time, but architecture allows multiple.

**Mitigation**: Could consolidate to a single Modal with dynamic content, or use a sheet queue.

### 12.5 Animation Synchronization

**Issue**: The dismiss animation uses `withTiming` for backdrop opacity with a callback (`finished` flag). If the component unmounts before animation completes, the callback may not fire.

**Risk**: Low — the `Modal` keeps the component mounted while visible.

**Mitigation**: Could use `useAnimatedReaction` or cleanup in `useEffect`.

### 12.6 Re-rendering

**Issue**: The component re-renders when `isOpen` changes (state update). All `useCallback` and `useMemo` hooks depend on `isOpen` or `dismissSheet`, which changes on every open/close cycle.

**Risk**: Low — Reanimated shared values avoid re-renders for animation, but the state change still triggers a render.

**Mitigation**: Could move `isOpen` to a shared value and avoid React state entirely.

### 12.7 Missing Gesture Cleanup

**Issue**: The `panGesture` is created fresh on every render (no `useMemo`). While Reanimated handles this efficiently, it's not optimal.

**Risk**: Very low — Reanimated's gesture system handles re-creation gracefully.

**Mitigation**: Wrap `Gesture.Pan()` in `useMemo` with appropriate dependencies.

### 12.8 Platform-Specific Behavior

**Issue**: The `Modal` with `animationType="none"` and `statusBarTranslucent` may behave differently on iOS vs Android. The gesture handler library also has platform-specific edge cases.

**Risk**: Medium — gestures may work on one platform but not the other.

**Mitigation**: Would require platform-specific testing and potential native module implementations.
