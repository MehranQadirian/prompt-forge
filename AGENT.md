# AGENT.md — Motion & Animation Guidelines

This file defines how animations must be implemented across this app. Follow it for **every** screen, not just the ones explicitly mentioned. The goal is **consistency**: the same type of interaction must always look, feel, and time out the same way, regardless of which screen it's on.

## Core Principle

Never invent a new spring/timing value per component. Every animation must reuse one of the shared **motion tokens** defined below. If a new use case doesn't fit an existing token, propose adding a token — don't hardcode a one-off value inline.

## Motion Tokens

Define these once in `src/theme/motion.ts` and import them everywhere:

```ts
export const MOTION = {
  // Pressing any tappable element (card, button, list row, tab)
  // Must feel instant and crisp — no wobble.
  pressIn:  { damping: 20, stiffness: 400, mass: 0.4 },
  pressOut: { damping: 16, stiffness: 320, mass: 0.4 },

  // Confirming a selection (checkmark, badge, highlight state)
  // A small bounce is acceptable here since it's a positive signal.
  select:   { damping: 18, stiffness: 300, mass: 0.5 },

  // Switches / toggles
  toggle:   { damping: 14, stiffness: 180, mass: 0.6 },

  // Simple fade/color transitions (no spring — opacity, color, border)
  fast:   { duration: 100 },
  normal: { duration: 150 },
  slow:   { duration: 220 }, // reserved for modals/sheets only, never small elements
};
```

## When to Use Which Token

| Interaction | Token | Example |
|---|---|---|
| Press/tap feedback on any element | `pressIn` / `pressOut` | card, button, list row, tab |
| Confirming a selection | `select` | selecting a theme, radio option, chip |
| On/off switch | `toggle` | settings switches, filters |
| Simple show/hide fade | `fast` / `normal` | error message, tooltip, notification badge |
| Modal / bottom sheet opening | `slow` | confirmation modal, action sheet |
| Adding/removing an item from a list | Layout animation — **only here** | deleting a todo, list reorder |

## Hard Rules

1. **No entrance animations on screens the user opens directly** (settings, static lists, forms). Only animate entrance when content is genuinely new (search results, a newly added list item). Never stagger-fade a full grid/list just because the screen mounted — it reads as a "wave" effect and feels unintentional.

2. **Layout animations are only for real position/size changes** — adding, removing, or reordering items. Never attach a layout animation to an element whose only change is color or selection state; it causes unrelated elements to visibly shift or feels sluggish for no reason.

3. **Keep layout-affecting properties constant between states.** Don't animate between `borderWidth: 1` and `borderWidth: 2`, or between different `padding`/`fontSize` values, based on selection/active state — this silently triggers layout reflows and reads as lag. Instead, keep the box size fixed from the start (e.g. always `borderWidth: 2`) and animate only color/opacity on top of it.

4. **Total animation duration for standard interactions (press, select, toggle) must read as under 200ms.** For springs, that means `damping >= 14` and `stiffness >= 250` — enough to avoid heavy overshoot or a "floaty" settle.

5. **Every animation must have a clear UX reason**: confirming a selection, giving press feedback, or communicating a state change. Purely decorative animation (e.g. cascading entrance effects) is only appropriate when new content is actually being introduced — not on every mount.

## Reference Implementation

`app/settings/appearance.tsx` is the reference implementation for `pressIn`/`pressOut`/`select` token usage. When building animations for other screens, match its behavior and timing exactly — don't design something faster, slower, or bouncier "because it seems nicer" for that screen. If a screen's animation looks or feels different from `appearance.tsx` for the same interaction type, that's a bug, not a stylistic choice.