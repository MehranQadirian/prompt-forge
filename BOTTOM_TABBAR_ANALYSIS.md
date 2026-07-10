# Bottom Tab Bar Analysis

## 1. Architecture

### Library
**Custom implementation** built on top of Expo Router Tabs.

The project uses `expo-router` Tabs component (`import { Tabs } from 'expo-router'`) as the navigation foundation, but replaces the default tab bar entirely with a custom `PillTabBar` component via the `tabBar` prop.

### File Locations
| File | Purpose |
|---|---|
| `src/components/PillTabBar.tsx` | Custom tab bar component (PillTabBar + PillTabItem) |
| `app/(tabs)/_layout.tsx` | Tab layout — defines tabs, FAB, renders PillTabBar |
| `app/_layout.tsx` | Root layout — ThemeProvider, BottomSheetProvider, Stack |
| `src/constants/index.ts` | SPACING, RADIUS, ICON_SIZE, TYPOGRAPHY tokens |
| `src/theme/tokens.ts` | Theme color tokens (surfaceContainer, primary, etc.) |
| `src/theme/useTheme.ts` | Theme hook |
| `src/types/index.ts` | ThemeTokens type definition |

### Component Hierarchy
```
RootLayout (app/_layout.tsx)
  └─ ThemeProvider
       └─ BottomSheetProvider
            └─ Stack
                 └─ TabsLayout (app/(tabs)/_layout.tsx)
                      ├─ Tabs (expo-router)
                      │    ├─ Tabs.Screen "index" (Prompts)
                      │    ├─ Tabs.Screen "templates" (Templates)
                      │    └─ Tabs.Screen "settings" (Settings)
                      ├─ PillTabBar (custom tab bar)
                      │    ├─ Animated.View (container)
                      │    │    └─ View (bar — pill-shaped)
                      │    │         ├─ Animated.View (pill indicator)
                      │    │         └─ PillTabItem ×3
                      │    │              └─ AnimatedPressable
                      │    │                   ├─ Animated.View (iconWrap)
                      │    │                   │    └─ Ionicons
                      │    │                   │    └─ View (badge, optional)
                      │    │                   └─ Text (tabLabel)
                      └─ CreatePromptFAB (only on index tab)
```

### Navigation Architecture
- **Expo Router** handles navigation state, route definitions, and screen transitions
- **Custom PillTabBar** replaces the default tab bar via `tabBar={renderTabBar}`
- The `renderTabBar` callback receives Expo Router's `props` (state, navigation) and maps them to PillTabBar's interface
- Tab presses are forwarded to `props.navigation.navigate(route.name)`
- Screen focus events (via `listeners.focus`) update the active tab state

### Active Tab Management
Two parallel state mechanisms:
1. **React state**: `const [activeTab, setActiveTab] = useState('index')` — used for conditional rendering (FAB visibility) and passed to PillTabBar
2. **Reanimated shared value**: `const activeIndex = useSharedValue(0)` — drives the pill indicator animation and icon scale

Both are updated in `Tabs.Screen` `listeners.focus` callbacks:
```tsx
listeners={{
  focus: () => {
    setActiveTab('index');        // React state
    activeIndex.value = withSpring(0, SPRING);  // Shared value
  },
}}
```

### Navigation State Synchronization
- Expo Router maintains its own internal navigation state
- `renderTabBar` reads `props.state.routes[props.state.index].name` to determine the active tab
- The active tab key is passed as `activeTab` to PillTabBar
- Tab press triggers `props.navigation.navigate(route.name)` which updates Expo Router's state
- Focus listeners then fire, syncing both React state and shared values

**Issue**: The `activeTab` React state and `activeIndex` shared value are synchronized manually via focus listeners, creating a potential race condition or desync if focus events are missed or fire out of order.

---

## 2. Visual Structure

### Overall Container
- **Position**: `absolute`, `bottom: 0`, `left: 0`, `right: 0`
- **Z-index**: 9998
- **Horizontal padding**: `SPACING.lg` (16dp) on each side
- **Bottom padding**: `insets.bottom + SPACING.md` (safe area + 12dp)

### Bar
- **Layout**: `flexDirection: 'row'`, `alignItems: 'center'`
- **Background**: `c.surfaceContainer` (theme-derived)
- **Border**: 1dp `c.outlineVariant` (theme-derived)
- **Border radius**: `RADIUS.full` (999dp) — full pill shape
- **Internal padding**: `SPACING.sm` (8dp)
- **Position**: `relative` (for pill positioning)

### Dimensions
- **Width**: `screenWidth - SPACING.lg * 2` (screen minus 32dp gutters)
- **Height**: Determined by content — `48dp` (tab item height) + `16dp` (padding top+bottom) = ~64dp
- **Tab width**: `(barWidth - 16dp) / tabs.length` — evenly distributed

### Safe Area
- Handled via `useSafeAreaInsets()` from `react-native-safe-area-context`
- Bottom inset applied as `paddingBottom: insets.bottom + SPACING.md`
- The bar floats above the safe area with the inset as padding

### Surface Design
- The bar uses a floating pill design (not a traditional edge-to-edge tab bar)
- Positioned with horizontal margins creating a detached, elevated appearance
- 1dp border provides subtle definition against any background
- No shadows or elevation — relies on surface color differentiation

---

## 3. Pill Indicator

### Shape
- Rounded rectangle (pill shape)
- `borderRadius: RADIUS.full` (999dp) — fully rounded ends

### Dimensions
- **Width**: `tabWidth` — matches the width of each tab item (calculated dynamically)
- **Height**: `top: SPACING.sm` to `bottom: SPACING.sm` — fills the bar's internal padding area (8dp from top, 8dp from bottom = ~48dp height)

### Positioning
- `position: 'absolute'` inside the bar
- Vertically centered via `top: SPACING.sm` + `bottom: SPACING.sm`
- Horizontally positioned via animated `translateX`

### Animation
- **Library**: `react-native-reanimated`
- **Movement**: `useDerivedValue` computes `pillX = barPadding + activeIndex.value * tabWidth`
- **Transform**: `translateX` animated via `pillX` derived value
- **Spring config**: `{ damping: 20, stiffness: 250, mass: 0.8 }`
- **Width**: Dynamically set to `tabWidth`

### Rendering Strategy
- Rendered as a single `Animated.View` behind the tab items (`zIndex: 1` on tab items, pill has no zIndex — naturally behind)
- The pill slides left/right as `activeIndex` changes
- The pill resizes to match `tabWidth` (all tabs are equal width, so pill width is constant)

### Answers
- **Is it animated?** Yes — smooth spring animation on translateX
- **Which animation library?** react-native-reanimated
- **How is active position calculated?** `barPadding + activeIndex * tabWidth` where `activeIndex` is a shared value (0, 1, or 2)
- **Does the pill resize?** Yes — width is set to `tabWidth`, but since all tabs are equal width, it appears constant
- **Does it clip correctly?** Yes — `borderRadius: RADIUS.full` ensures pill shape
- **Does it overlap other components?** It sits behind tab items (zIndex layering), so it doesn't overlap interactive elements

---

## 4. Tab Buttons

### Component Type
`AnimatedPressable` — created via `Animated.createAnimatedComponent(Pressable)`

### Layout
- `alignItems: 'center'`, `justifyContent: 'center'`
- `height: 48` (matches `TOUCH_TARGET` constant)
- `width: tabWidth` (dynamically calculated)
- `borderRadius: RADIUS.full` (999dp)
- `zIndex: 1` (above the pill indicator)

### Hit Area
- Full tab item bounds (48dp height × tabWidth)
- `hitSlop` not explicitly set on tab items (defaults to 0)

### Alignment
- Vertically: centered within the bar
- Horizontally: centered content (icon + label stacked)

### Padding
- No explicit padding on tab items — spacing comes from the bar's `padding: SPACING.sm` and the tab width calculation

### Pressable Bounds
- Full width of `tabWidth` and height of 48dp
- `borderRadius: RADIUS.full` — pressable area is pill-shaped

---

## 5. Pressed State

### Implementation
- **Opacity animation**: `pressedOpacity` shared value animates between 1.0 and 0.7
- **Duration**: 120ms `withTiming` for both press-in and press-out
- **Applied via**: `useAnimatedStyle` returning `{ opacity: pressedOpacity.value }`

### Android Ripple
- **Enabled**: Yes — `android_ripple={{ color: colors.onBackground + '14' }}`
- **Bounded**: Yes — no `borderless: true`, so ripple stays within the tab item's `borderRadius: RADIUS.full` bounds
- **Color**: `onBackground` at ~8% opacity

### Opacity
- Press-in: opacity → 0.7 (120ms)
- Press-out: opacity → 1.0 (120ms)

### Scaling
- No scale animation on press (icon has a separate scale based on distance from active index, but this is not a press effect)

### Background Overlay
- No background overlay — feedback is via opacity + ripple only

### Custom Animation
- `pressedOpacity` shared value + `useAnimatedStyle` — same pattern as the FAB component

### Inconsistencies Found
1. **No `hitSlop`** on tab items — other interactive components in the app use `hitSlop={8}`. Tab items rely solely on their calculated width for touch targets.
2. **Icon scale is not a press effect** — the `iconStyle` animation scales icons based on `Math.abs(activeIndex.value - index)`, which is a proximity effect, not a press feedback. This could be confused with press feedback.
3. **Ripple color inconsistency** — Tab items use `colors.onBackground + '14'`, while the FAB uses `c.primary` for its background. The ripple colors are consistent across tab items but different from the FAB (which is expected since they're different component types).

---

## 6. Active State

### Active Colors
- **Icon**: `colors.primary` (theme-derived accent color)
- **Label**: `colors.primary`
- **Pill background**: `colors.surfaceContainerHigh` (elevated surface)

### Active Icon
- Uses `tab.iconFocused` variant (e.g., `document-text` instead of `document-text-outline`)
- Ionicons filled variant for active, outline variant for inactive

### Active Label
- `TYPOGRAPHY.smallSemibold` (11px, weight 600)
- Color: `colors.primary`

### Active Pill
- Slides to the active tab position via spring animation
- `backgroundColor: c.surfaceContainerHigh`
- `borderRadius: RADIUS.full`

### Animation
- Pill movement: spring `{ damping: 20, stiffness: 250, mass: 0.8 }`
- Icon scale: `interpolate` based on distance from active index (1.1x at active, 1.0x at distance 1+)
- Both driven by `activeIndex` shared value

### Transition Duration
- Pill: spring-based (~200-300ms depending on distance)
- Icon scale: spring-based (same shared value)

### Consistency
- All tabs use the same animation config
- Active state is visually distinct (filled icon + primary color + pill)

---

## 7. Inactive State

### Icon Color
- `colors.onSurfaceVariant` (68% opacity of text color — derived token)

### Label Color
- `colors.onSurfaceVariant`

### Accessibility
- `accessibilityState={{ selected: isActive }}` — properly communicates selected state
- `accessibilityLabel` includes badge count when present

### Visual Hierarchy
- Inactive tabs are visually recessed (muted color, outline icon)
- Active tab stands out (primary color, filled icon, pill background)
- Clear distinction between active and inactive states

---

## 8. Icon System

### Icon Library
Ionicons (from `@expo/vector-icons`)

### Icon Size
`ICON_SIZE.lg` = 24dp

### Icon Alignment
- Centered horizontally within the tab item
- Inside an `Animated.View` wrapper (`iconWrap`) with `height: 26`, `marginBottom: 2`

### Active/Inactive Variations
- **Active**: `tab.iconFocused` (filled variant, e.g., `document-text`)
- **Inactive**: `tab.icon` (outline variant, e.g., `document-text-outline`)

### Padding
- No explicit padding on icons — spacing from `iconWrap` height and `marginBottom`

---

## 9. Typography

### Font
System default (no custom font specified)

### Size
`TYPOGRAPHY.smallSemibold.fontSize` = 11px

### Weight
`TYPOGRAPHY.smallSemibold.fontWeight` = '600' (semibold)

### Spacing
- `marginBottom: 2` between icon and label
- `numberOfLines={1}` — single line, no wrapping

### Alignment
- Centered horizontally within the tab item

---

## 10. Theme Support

### Background Colors
- **Bar**: `c.surfaceContainer` — adapts to all 14 themes
- **Pill**: `c.surfaceContainerHigh` — adapts to all 14 themes

### Icon Colors
- **Active**: `c.primary` — theme accent color
- **Inactive**: `c.onSurfaceVariant` — 68% opacity of text color

### Labels
- **Active**: `c.primary`
- **Inactive**: `c.onSurfaceVariant`

### Pill
- Background: `c.surfaceContainerHigh`
- All colors derived from theme tokens

### Borders
- `c.outlineVariant` — 6% opacity of text color

### Pressed State
- Ripple: `c.onBackground + '14'` — 8% opacity of text color
- Opacity: 0.7 (no color change)

### Active State
- Icon: `c.primary`
- Label: `c.primary`
- Pill: `c.surfaceContainerHigh`

### Inactive State
- Icon: `c.onSurfaceVariant`
- Label: `c.onSurfaceVariant`

### Theme Hardcoding
**No hardcoded colors found.** All colors are derived from `theme.color.*` tokens. The tab bar is fully theme-aware and will adapt to all 14 themes (7 dark, 7 light) without modification.

---

## 11. HCI Audit

### Consistency
- **PASS**: All three tabs use identical component structure, animation, and styling
- **PASS**: Pressed state is consistent across all tabs
- **ISSUE**: The FAB has a different press animation (scale 0.9) than tabs (opacity 0.7) — different feedback patterns for different component types

### Visibility of System Status
- **PASS**: Active tab is clearly indicated via pill, filled icon, and primary color
- **PASS**: Badge counts are visible on tabs with notifications
- **PASS**: Keyboard show/hide animates the bar out/in

### Feedback
- **PASS**: Haptic feedback on every tab press (`ImpactFeedbackStyle.Light`)
- **PASS**: Visual feedback via opacity animation + ripple
- **PASS**: Pill animation provides clear transition feedback

### Recognition Rather Than Recall
- **PASS**: Icons + labels provide clear recognition cues
- **PASS**: Filled vs outline icons distinguish active/inactive
- **PASS**: Pill indicator shows current location

### Fitts's Law
- **PASS**: Tab items are 48dp height (meets `TOUCH_TARGET` minimum)
- **ISSUE**: Tab width is calculated dynamically — on narrow screens with 3 tabs, each tab could be relatively narrow
- **PASS**: FAB is 56dp × 56dp (above minimum)

### Touch Targets
- **PASS**: Tab items: 48dp height × calculated width
- **PASS**: FAB: 56dp × 56dp
- **ISSUE**: No `hitSlop` on tab items — other components use `hitSlop={8}`

### Visual Hierarchy
- **PASS**: Active tab is visually dominant (primary color + filled icon + pill)
- **PASS**: Inactive tabs are visually recessed
- **PASS**: FAB stands out as a primary action

### Accessibility
- **PASS**: `accessibilityRole="button"` on all interactive elements
- **PASS**: `accessibilityLabel` on all buttons
- **PASS**: `accessibilityState={{ selected: isActive }}` on tabs
- **PASS**: Badge count included in accessibility label
- **ISSUE**: No `accessibilityHint` on tab items (e.g., "Switch to Prompts tab")

### Error Prevention
- **PASS**: Haptic feedback confirms action
- **PASS**: Visual feedback confirms state change

---

## 12. Android UX Audit

### Material Interaction
- **PASS**: Ripple effect follows Material Design guidelines
- **PASS**: Haptic feedback on interaction
- **PASS**: Smooth spring animations

### Native Feel
- **PASS**: Floating pill design is modern Android aesthetic
- **PASS**: Keyboard hide/show behavior is native-like
- **PASS**: Safe area handling is correct

### Motion
- **PASS**: Spring animations feel natural
- **PASS**: Pill movement is smooth
- **ISSUE**: Icon scale animation (proximity-based) could feel unexpected — it's not a standard Android pattern

### Pressed Feedback
- **PASS**: Ripple is bounded to tab shape
- **PASS**: Opacity change provides additional feedback
- **PASS**: Haptic confirms interaction

### Responsiveness
- **PASS**: Keyboard show/hide is animated
- **PASS**: Tab switch is immediate with animation

### Hit Testing
- **PASS**: 48dp height meets Android guidelines
- **ISSUE**: No explicit `hitSlop` — relies on calculated width only

### Gesture Quality
- **PASS**: No gesture conflicts with swipe navigation
- **PASS**: Tab presses are clean and deliberate

---

## 13. Code Quality

### Reusability
- **PASS**: `PillTabItem` is extracted as a separate component
- **PASS**: `Tab` interface is exported for type safety
- **PASS**: `PillTabBarProps` interface is well-defined
- **ISSUE**: `PillTabItem` receives `colors` as a prop instead of using `useTheme()` internally — inconsistent with other components

### Maintainability
- **PASS**: Clear separation between PillTabBar and PillTabItem
- **PASS**: Animation logic is isolated in shared values
- **PASS**: Constants are used for spacing/radius/typography

### Duplicate Logic
- **ISSUE**: `AnimatedPressable` is defined in both `PillTabBar.tsx` and `_layout.tsx` — should be extracted
- **ISSUE**: `SPRING` config is defined in both `PillTabBar.tsx` and `_layout.tsx` — should be a shared constant

### Duplicate Styling
- **PASS**: No duplicate styles found within PillTabBar
- **ISSUE**: FAB styles in `_layout.tsx` are not using the design system's RADIUS/SPACING tokens for all values (e.g., `width: 56`, `height: 56`, `borderRadius: 28` are hardcoded)

### Hardcoded Values
- **ISSUE**: `height: 48` in `styles.tabItem` — should use `TOUCH_TARGET`
- **ISSUE**: `height: 26` in `styles.iconWrap` — not from design tokens
- **ISSUE**: `marginBottom: 2` in `styles.iconWrap` — not from design tokens
- **ISSUE**: `minWidth: 16`, `height: 16`, `borderRadius: 8` in badge styles — not from design tokens
- **ISSUE**: `fontSize: 9`, `fontWeight: '700'` in badge text — not from design tokens
- **ISSUE**: FAB `width: 56`, `height: 56`, `borderRadius: 28` — hardcoded

### Missing Design Tokens
- Badge dimensions (16×16, borderRadius 8) should be tokens
- Badge text style (9px, 700) should be a token
- Icon wrapper height (26dp) should be a token
- Tab item height (48dp) should use `TOUCH_TARGET`

### Missing Reusable Components
- Badge component could be extracted (used in tab bar and potentially elsewhere)
- FAB component could be extracted from `_layout.tsx`

---

## 14. Problems Found

1. **`AnimatedPressable` duplicated** in `PillTabBar.tsx` and `_layout.tsx` — should be a shared utility
2. **`SPRING` config duplicated** in `PillTabBar.tsx` and `_layout.tsx` — should be a shared constant
3. **Tab item `height: 48` hardcoded** — should use `TOUCH_TARGET` constant
4. **Icon wrapper `height: 26` not from tokens** — no design token for this value
5. **Icon wrapper `marginBottom: 2` not from tokens** — no design token for this value
6. **Badge dimensions hardcoded** (16×16, borderRadius 8) — should be design tokens
7. **Badge text style hardcoded** (9px, 700 weight) — should be a typography token
8. **No `hitSlop` on tab items** — inconsistent with other components that use `hitSlop={8}`
9. **No `accessibilityHint` on tab items** — missing hint for screen readers
10. **`PillTabItem` receives `colors` as prop** instead of using `useTheme()` — inconsistent pattern
11. **FAB dimensions hardcoded** (56×56, borderRadius 28) — should use design tokens
12. **Dual state management** (React state + shared value) for active tab — potential for desync
13. **Icon scale animation is proximity-based, not press-based** — could confuse users who expect it as press feedback
14. **`activeIndex` shared value updated in focus listeners** — if focus events are delayed, animation could lag behind actual navigation state
15. **No loading state** for tab content — no visual indicator during screen transitions
16. **Badge `right: -8` overflows** the tab item bounds — could be clipped by `overflow: 'hidden'` if added to parent

---

## 15. Refactoring Recommendations

### Architecture
- Extract `AnimatedPressable` to a shared utility (`src/components/AnimatedPressable.tsx`)
- Extract `SPRING` config to `src/constants/index.ts`
- Extract `CreatePromptFAB` to its own component file (`src/components/CreatePromptFAB.tsx`)
- Consider a single source of truth for active tab (either React state OR shared value, not both)
- Make `PillTabItem` use `useTheme()` internally instead of receiving `colors` as a prop

### Layout
- Replace hardcoded `height: 48` with `TOUCH_TARGET`
- Add `hitSlop={8}` to tab items for consistency
- Consider adding `overflow: 'hidden'` to the bar to clip badge overflow

### Animation
- Keep the pill spring animation — it's well-tuned
- Consider removing the proximity-based icon scale (non-standard) or making it more subtle
- Ensure `activeIndex` is always in sync with actual navigation state

### Pressed State
- Current implementation is good (opacity + ripple + haptic)
- Add `hitSlop={8}` to match other components
- Consider adding a subtle background tint on press (like BaseCard uses `c.onBackground + '08'`)

### Active State
- Current implementation is clear and well-defined
- Consider adding a subtle scale animation to the active icon (1.0 → 1.05) for additional emphasis

### Theme Compatibility
- Already fully theme-aware — no changes needed
- Ensure any new tokens (badge, icon wrapper) are also theme-derived

### Accessibility
- Add `accessibilityHint` to tab items (e.g., `"Switch to ${tab.label} tab"`)
- Add `accessibilityRole="tablist"` to the bar container
- Add `accessibilityRole="tab"` to individual tab items (currently `"button"`)

### Performance
- The `useDerivedValue` for `pillX` is efficient
- Consider memoizing `PillTabItem` with `React.memo` to prevent unnecessary re-renders
- The keyboard listener setup in `useEffect` is correct but should be cleaned up properly (already done)
