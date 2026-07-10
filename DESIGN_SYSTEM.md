# Prompt Forge Design System

## Quick Start

```tsx
import { useTheme } from '../src/theme/useTheme';

function MyComponent() {
  const { theme, themeVariant, mode, setTheme } = useTheme();
  const c = theme.color;

  return (
    <Pressable
      android_ripple={{ color: c.onBackground + '14' }}
      style={{ backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }}
    >
      <Text style={{ color: c.onBackground }}>Hello</Text>
    </Pressable>
  );
}
```

## Color Tokens

All colors come from `theme.color.*`. Use these names — never raw hex values.

### Surfaces
| Token | Use |
|---|---|
| `background` | Screen background |
| `surface` | Base surface (cards on dark themes use tone layering) |
| `surfaceContainer` | Cards, inputs, list items |
| `surfaceContainerHigh` | Elevated elements (modals, FAB, snackbars) |

### Text
| Token | Use |
|---|---|
| `onBackground` | Primary text on background |
| `onSurfaceVariant` | Secondary/muted text |
| `disabled` | Placeholder text, disabled content |
| `onPrimary` | Text on top of primary-colored surfaces |
| `onError` | Text on top of error-colored surfaces |

### Borders
| Token | Use |
|---|---|
| `outline` | Visible borders (inputs, cards on light themes) |
| `outlineVariant` | Subtle dividers, card borders on dark themes |

### Semantic
| Token | Use |
|---|---|
| `primary` | Accent color — buttons, active states, links |
| `error` | Destructive actions, validation errors |
| `success` | Positive feedback (copy confirmation) |
| `warning` | Caution states |
| `info` | Informational highlights |

### States
| Token | Use |
|---|---|
| `disabled` | 38% opacity of onBackground |
| `disabledContainer` | 12% opacity of onBackground |
| `overlay` | Modal scrim — fixed rgba(0,0,0,0.55) |
| `focusRing` | Focus indicator — same as primary |

### Backward-Compatible Aliases
These map to the semantic tokens above. Prefer the semantic names in new code.
| Alias | Maps to |
|---|---|
| `text` | `onBackground` |
| `textSecondary` | `onSurfaceVariant` |
| `textMuted` | `disabled` |
| `border` | `outlineVariant` |
| `sidebar` | `surface` |
| `surfaceElevated` | `surfaceContainerHigh` |
| `primaryLight` | primary at 15% alpha |
| `danger` | `error` |

## Themes

14 themes available: 7 dark, 7 light.

**Dark**: forest, midnight, carbon, plum, ember, dracula, mono
**Light**: paper, sky, sage, rose, latte, lavender, snow

Switch via `setTheme('sky')` from the useTheme hook. "Follow system" mode auto-switches between light/dark pairs.

## Spacing (4dp Grid)

```ts
import { SPACING } from '../src/constants';

// or from tokens directly:
import { spacing } from '../src/theme/tokens';

SPACING.xs   // 4
SPACING.sm   // 8
SPACING.md   // 12
SPACING.lg   // 16  (screen edge gutter)
SPACING.xl   // 20
SPACING.xxl  // 24  (section gap)
SPACING.xxxl // 32
```

All padding, margin, and gap values must be multiples of 4dp.

## Corner Radius

```ts
import { RADIUS } from '../src/constants';

RADIUS.xs   // 4   — tags, small badges
RADIUS.sm   // 8   — chips, small buttons
RADIUS.md   // 12  — cards, inputs, buttons
RADIUS.lg   // 16  — large cards, bottom sheets
RADIUS.xl   // 24  — FAB, dialogs
RADIUS.full // 999 — pill shapes
```

## Typography

```ts
import { TYPOGRAPHY } from '../src/constants';

TYPOGRAPHY.title     // 28/34, weight 700 — screen titles
TYPOGRAPHY.heading   // 22/28, weight 600 — section headers
TYPOGRAPHY.subheading// 18/24, weight 600 — dialog titles
TYPOGRAPHY.body      // 16/24, weight 400 — primary reading text
TYPOGRAPHY.caption   // 14/20, weight 400 — secondary text
TYPOGRAPHY.small     // 11/16, weight 500 — badges, timestamps
```

One clear hierarchy per screen: one title style, one body, one caption. No ad-hoc font sizes.

## Icon Sizes

```ts
import { ICON_SIZE } from '../src/constants';

ICON_SIZE.sm      // 16  — inline with text
ICON_SIZE.md      // 20  — list leading/trailing
ICON_SIZE.lg      // 24  — app bar, nav (default)
ICON_SIZE.xl      // 32  — empty states, feature callouts
```

Use Ionicons only. One icon family, one stroke weight.

## Touch Targets

```ts
import { TOUCH_TARGET } from '../src/constants';

TOUCH_TARGET // 48dp minimum
```

Every Pressable must have at least 48x48dp hit area. Use `hitSlop={8}` to expand small icons rather than inflating the icon itself.

## Interactive Elements Pattern

Every Pressable must have:
1. `android_ripple={{ color: theme.color.onBackground + '14' }}` — Android ripple feedback
2. `accessibilityRole="button"` (or "radio", "tab", etc.)
3. `accessibilityLabel="Descriptive text"` — never omit for icon-only buttons
4. `accessibilityState={{ selected, disabled }}` when applicable
5. `hitSlop={8}` on small icon buttons
6. `style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}` — pressed feedback

```tsx
<Pressable
  onPress={handleAction}
  accessibilityRole="button"
  accessibilityLabel="Save version"
  android_ripple={{ color: c.onBackground + '14', borderless: true }}
  hitSlop={8}
  style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
>
  <Ionicons name="add-circle-outline" size={ICON_SIZE.md} color={c.onSurfaceVariant} />
</Pressable>
```

## Elevation (Dark-Theme-Aware)

On dark themes, shadows are invisible. Use surface tone layering instead:

| Level | Background | Use |
|---|---|---|
| level0 | `background` | Flat, no elevation |
| level1 | `surfaceContainer` | Cards, list items |
| level2 | `surfaceContainerHigh` | FAB, snackbar, floating elements |
| level3 | `surfaceContainerHigh` + `overlay` scrim | Modals, dialogs |

On light themes, add a 1dp `outlineVariant` border for level1+ elements.

## Screen Structure

```
SafeAreaView edges={['top', 'bottom']}
  ScrollView / FlatList
    Screen title (TYPOGRAPHY.title)
    Section headers (TYPOGRAPHY.heading)
    Content (TYPOGRAPHY.body)
    Captions (TYPOGRAPHY.small)
  Fixed toolbar at bottom (if applicable)
```

- SafeAreaView: always use `edges={['top', 'bottom']}`
- KeyboardAvoidingView: wrap any screen with text inputs
- Bottom padding: sufficient to clear FAB and tab bar

## Button Hierarchy

| Type | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary (filled) | `primary` | `onPrimary` | none | Main actions |
| Secondary (outlined) | transparent | `primary` | 1dp `outline` | Alternative actions |
| Tertiary (text) | transparent | `primary` | none | Low-priority actions |
| Destructive | `error` | `onError` | none | Delete, remove |

All buttons: min height 48dp, consistent radius `RADIUS.md` (12).

## File Reference

| File | Purpose |
|---|---|
| `src/theme/tokens.ts` | 14 themes, derivations, spacing/type/radius tokens |
| `src/theme/ThemeProvider.tsx` | Context provider, follow-system, persistence |
| `src/theme/useTheme.ts` | Convenience hook |
| `src/constants/index.ts` | SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE, TOUCH_TARGET |
| `src/types/index.ts` | ThemeVariant, ThemeTokens, AppSettings interfaces |
