# Prompt Forge — Complete Technical & UX Specification

> **Purpose**: Exhaustive analysis of the Prompt Forge application, covering architecture, design system, components, screens, interactions, and recommendations for a future Splash Screen and Welcome/Onboarding experience.
>
> **Generated**: July 10, 2026
>
> **Status**: Analysis-only. No code modified.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Navigation](#4-navigation)
5. [Startup Flow](#5-startup-flow)
6. [Theme Engine](#6-theme-engine)
7. [Existing Themes](#7-existing-themes)
8. [Design Philosophy](#8-design-philosophy)
9. [HCI Principles](#9-hci-principles)
10. [Design Tokens](#10-design-tokens)
11. [Component Library](#11-component-library)
12. [Existing Screens](#12-existing-screens)
13. [Editor](#13-editor)
14. [Search](#14-search)
15. [Prompt Cards](#15-prompt-cards)
16. [Buttons](#16-buttons)
17. [Dialogs](#17-dialogs)
18. [Motion Design](#18-motion-design)
19. [Assets](#19-assets)
20. [Responsive Design](#20-responsive-design)
21. [Accessibility](#21-accessibility)
22. [Localization](#22-localization)
23. [Performance](#23-performance)
24. [Code Architecture](#24-code-architecture)
25. [Current UX Flow](#25-current-ux-flow)
26. [Visual Identity](#26-visual-identity)
27. [Current Limitations](#27-current-limitations)
28. [Opportunities](#28-opportunities)
29. [New Screen Integration Guide](#29-new-screen-integration-guide)
30. [Splash Screen Recommendations](#30-splash-screen-recommendations)
31. [Welcome / Onboarding Recommendations](#31-welcome--onboarding-recommendations)

---

## 1. Project Overview

### Application Purpose

Prompt Forge is a focused notepad mobile application for crafting, organizing, and enhancing AI prompts. It is not a general-purpose notes app — it is purpose-built around the workflow of writing prompts for AI systems (ChatGPT, Claude, Gemini, etc.), with features like placeholder templating, AI-powered prompt enhancement, version history, and categorization.

### Target Audience

- AI power users who craft and reuse prompts regularly
- Content creators, developers, and professionals who work with AI tools daily
- Users who want an organized, fast, offline-first prompt management system

### Main Workflows

1. **Create** — Write a new prompt with title, category, tags, and accent color
2. **Organize** — Categorize, tag, color-code, pin, and favorite prompts
3. **Enhance** — Use AI (Groq/GPT) to improve prompt quality with one tap
4. **Templating** — Use `[brackets]` and `{braces}` placeholders for dynamic prompt templates
5. **Reuse** — One-tap copy to clipboard, browse built-in templates, save templates from existing prompts
6. **Version** — Track up to 50 versions per prompt with full restore capability

### Current Implementation Status

- **MVP complete** — All core features functional
- **Single-platform** — Android only (no iOS build configuration)
- **New Architecture** — Enabled (`newArchEnabled: true`)
- **No tests** — Zero test files, no test dependencies, no test configuration
- **No CI/CD** — Only EAS Build profiles, no GitHub Actions
- **No README** — No contributor documentation
- **AI integration** — Only Groq is functional; OpenAI, DeepSeek, Gemini, Claude are stubs that throw `ProviderUnavailableError`
- **Welcome/Onboarding** — Screen exists (`welcome.tsx`) but has no navigation guard to redirect users on first launch

### Architectural Style

- **File-based routing** via Expo Router (v57)
- **Zustand** for state management (4 stores)
- **AsyncStorage** for all persistence (no database)
- **Custom component library** — All UI built from scratch, no third-party UI kits
- **Token-based design system** — 14 themes derived from 7 raw hex values per theme
- **Reanimated 4** for all animations (no Lottie, no CSS transitions)
- **Gesture Handler** for bottom sheet and swipe interactions

---

## 2. Tech Stack

### Core

| Library | Version | Purpose |
|---------|---------|---------|
| Expo SDK | 57.0.0 | Mobile framework |
| React | 19.2.3 | UI library |
| React Native | 0.86.0 | Native rendering (New Architecture enabled) |
| TypeScript | 5.8.3 | Type system (strict mode) |

### Navigation

| Library | Version | Purpose |
|---------|---------|---------|
| expo-router | ~57.0.4 | File-based routing (stack, tabs, nested) |
| react-native-screens | 4.25.2 | Native screen primitives |
| react-native-safe-area-context | ~5.7.0 | Safe area insets handling |

### Animation & Gestures

| Library | Version | Purpose |
|---------|---------|---------|
| react-native-reanimated | 4.5.0 | UI thread animations (springs, timing, shared values) |
| react-native-gesture-handler | ~2.32.0 | Native gesture system (pan, long-press) |
| react-native-worklets | 0.10.0 | Worklet runtime (Reanimated 4 dependency) |

### State Management

| Library | Version | Purpose |
|---------|---------|---------|
| zustand | ^5.0.0 | Lightweight state stores (4 stores) |
| React Context | (built-in) | ThemeProvider, BottomSheetContext only |

### Storage

| Library | Version | Purpose |
|---------|---------|---------|
| @react-native-async-storage/async-storage | 2.2.0 | All persistence (prompts, settings, AI configs, API keys) |

Not implemented: MMKV, SQLite, WatermelonDB, Realm, expo-secure-store, react-native-keychain.

### UI & Icons

| Library | Version | Purpose |
|---------|---------|---------|
| @expo/vector-icons | ^15.0.2 | Ionicons (single icon family used throughout) |
| react-native-draggable-flatlist | ^4.0.3 | Drag-and-drop category reordering |

### Platform & Build

| Library | Version | Purpose |
|---------|---------|---------|
| expo-splash-screen | ~57.0.2 | Splash screen control |
| expo-status-bar | ~57.0.0 | Status bar style management |
| expo-system-ui | ~57.0.0 | Android system UI background color |
| expo-constants | ~57.0.3 | App constants |
| expo-linking | ~57.0.2 | Deep linking |
| expo-asset | ~57.0.3 | Asset management |
| expo-font | ~57.0.0 | Custom font loading (no custom fonts currently) |
| expo-haptics | ~57.0.0 | Haptic feedback on all interactions |
| expo-clipboard | ~57.0.0 | One-tap copy to clipboard |

### Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| @types/react | ~19.2.4 | TypeScript types for React |
| babel-preset-expo | ~57.0.0 | Babel configuration |
| typescript | ~5.8.3 | Compiler |

### Build Configuration

- **EAS Build** with 3 profiles: `development` (dev client), `preview` (APK), `production` (APK with auto-increment)
- **Babel**: `babel-preset-expo` + `react-native-reanimated/plugin` (must be last)
- **Metro**: Default Expo config (no custom metro.config.js)
- **No custom fonts loaded** — the `assets/fonts/` directory is empty

---

## 3. Folder Structure

```
prompt-forge/
├── app/                              # Expo Router: file-based routes
│   ├── _layout.tsx                   # Root layout: ThemeProvider > GestureHandlerRootView > BottomSheetProvider > Stack
│   ├── +not-found.tsx                # 404 screen
│   ├── welcome.tsx                   # Onboarding/welcome screen (4 steps)
│   ├── editor.tsx                    # Prompt editor (title, content, categories, AI enhance, find/replace, version history)
│   ├── categories.tsx                # Category management (CRUD, reassign, reorder)
│   ├── placeholder-edit.tsx          # Placeholder value editor ([brackets] and {braces})
│   ├── (tabs)/                       # Tab group
│   │   ├── _layout.tsx              # Tab layout: PillTabBar + CreatePromptFAB
│   │   ├── index.tsx               # Prompts list (search, filter, bulk select, drag-reorder)
│   │   ├── templates.tsx           # Templates browser (search, filter, use)
│   │   └── settings.tsx            # Settings menu (links to sub-screens)
│   └── settings/                     # Settings sub-screens (Stack)
│       ├── _layout.tsx              # Settings Stack layout
│       ├── appearance.tsx           # Theme picker (14 themes, follow system)
│       ├── typography.tsx           # Font size and family settings
│       ├── options.tsx              # Toggle options (token count)
│       ├── ai.tsx                   # AI provider settings (5 providers, API keys, system prompt)
│       └── about.tsx               # About screen
│
├── src/
│   ├── components/                   # Reusable UI components
│   │   ├── BottomSheet.tsx          # Gesture-driven bottom sheet (Modal + Reanimated + GestureHandler)
│   │   ├── BottomSheetContext.tsx    # Global bottom sheet provider
│   │   ├── CategoryTag.tsx          # Animated category pill (wobble in reorder mode)
│   │   ├── ColorGridSheet.tsx       # Color grid picker bottom sheet
│   │   ├── ColorPickerModal.tsx     # Color picker modal
│   │   ├── ContextMenu.tsx          # Long-press context menu (rename, duplicate, pin, favorite, delete)
│   │   ├── EnhanceButton.tsx        # AI enhance button with loading state
│   │   ├── EnhancedPromptSheet.tsx  # AI enhancement result display sheet
│   │   ├── FilterChip.tsx           # Filter chip component
│   │   ├── FindReplace.tsx          # Find and replace toolbar
│   │   ├── MarkdownRenderer.tsx     # Custom markdown parser/renderer
│   │   ├── PillTabBar.tsx           # Custom floating pill tab bar (animated indicator)
│   │   ├── PlaceholderBar.tsx       # Placeholder quick-fill bar
│   │   ├── PromptPreviewSheet.tsx   # Prompt preview bottom sheet content
│   │   ├── SearchBar.tsx            # Animated expandable search bar
│   │   ├── StatItem.tsx             # Text statistics display item
│   │   ├── TemplateContextMenu.tsx  # Template context menu
│   │   ├── TemplatePreviewSheet.tsx # Template preview bottom sheet content
│   │   ├── ToolbarBtn.tsx           # Editor toolbar button
│   │   ├── UndoRedoBar.tsx          # Undo/redo button pair
│   │   └── cards/
│   │       ├── index.ts             # Barrel exports
│   │       ├── BaseCard.tsx         # Base card with ripple, theme-aware styling
│   │       ├── PromptCard.tsx       # Prompt card (title, category, preview, tags, versions, color)
│   │       └── TemplateCard.tsx     # Template card (title, description, preview block)
│   │
│   ├── constants/
│   │   ├── index.ts                 # SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE, TOUCH_TARGET, AI_DEFAULTS, STORAGE_KEYS, DEFAULT_CATEGORIES
│   │   └── haptics.ts              # Haptic feedback helper functions
│   │
│   ├── data/
│   │   └── templates.ts            # 8 default prompt templates
│   │
│   ├── hooks/
│   │   ├── useEnhance.ts           # AI prompt enhancement hook (snapshot/version tracking)
│   │   └── useHistory.ts          # Undo/redo history hook (useReducer, max 50 states)
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── provider.ts         # Provider registry (factory pattern)
│   │   │   ├── types.ts            # Re-exported AI types
│   │   │   ├── errors.ts           # Custom error classes
│   │   │   ├── prompt-engineer.ts  # System prompt builder
│   │   │   ├── groq.ts            # Groq API (llama-3.1-8b-instant) — ONLY functional provider
│   │   │   ├── openai.ts          # OpenAI (stub — throws ProviderUnavailableError)
│   │   │   ├── deepseek.ts        # DeepSeek (stub)
│   │   │   ├── gemini.ts          # Google Gemini (stub)
│   │   │   └── claude.ts          # Anthropic Claude (stub)
│   │   └── storage/
│   │       └── apiKeyStorage.ts    # API key storage (AsyncStorage, singleton)
│   │
│   ├── stores/
│   │   ├── promptStore.ts          # Prompts CRUD, categories, filtering, versions, search, pin/favorite
│   │   ├── settingsStore.ts        # App settings (theme, font, onboarded, token count)
│   │   ├── aiStore.ts             # AI provider state, configs, system prompt
│   │   └── placeholderEditStore.ts # Placeholder editing state machine
│   │
│   ├── theme/
│   │   ├── index.ts               # Barrel exports + legacy themes record
│   │   ├── tokens.ts              # 14 theme definitions, derivation functions, color utilities
│   │   ├── ThemeProvider.tsx       # React Context provider, follow-system, persistence
│   │   └── useTheme.ts            # Convenience hook wrapping ThemeContext
│   │
│   ├── types/
│   │   └── index.ts               # Prompt, PromptVersion, PromptTemplate, ThemeTokens, AppSettings, AI types
│   │
│   └── utils/
│       ├── placeholders.ts         # [bracket] and {brace} placeholder detection/replacement
│       ├── tokenCounter.ts         # Char/word/token/line counting (4 chars per token)
│       └── rtl.ts                 # RTL text detection (Arabic, Hebrew, Persian)
│
├── assets/
│   ├── icon.png                    # App icon
│   ├── splash-icon.png            # Splash screen icon
│   ├── favicon.png                # Web favicon
│   ├── android-icon-background.png # Android adaptive icon background
│   ├── android-icon-foreground.png # Android adaptive icon foreground
│   ├── android-icon-monochrome.png # Android monochrome icon variant
│   └── fonts/                     # Empty directory (no custom fonts)
│
├── docs/
│   ├── bottom-sheet-analysis.md
│   └── bottom-sheet-regression-report.md
│
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config (strict mode)
├── babel.config.js                 # Babel config (reanimated plugin)
├── eas.json                        # EAS Build profiles
├── DESIGN_SYSTEM.md                # Design system documentation
├── ARCHITECTURAL_REVIEW.md         # Bottom sheet bug investigation
├── BOTTOM_TABBAR_ANALYSIS.md       # Tab bar HCI audit
├── AGENTS.md                       # Agent instructions
├── CLAUDE.md                       # Agent instructions
└── LICENSE                         # MIT License
```

### Key Folder Responsibilities

| Folder | Responsibility |
|--------|---------------|
| `app/` | All screen routes (Expo Router file-based routing). Each file = one screen. |
| `src/components/` | Reusable UI components shared across screens. |
| `src/components/cards/` | Card component variants (BaseCard, PromptCard, TemplateCard). |
| `src/constants/` | App-wide constants: spacing, typography, icons, haptics, storage keys. |
| `src/data/` | Static data: 8 default prompt templates. |
| `src/hooks/` | Custom React hooks: AI enhancement, undo/redo history. |
| `src/services/ai/` | AI provider integrations (Groq functional, others stubbed). |
| `src/services/storage/` | Persistent storage services (API keys). |
| `src/stores/` | Zustand state stores (prompts, settings, AI, placeholders). |
| `src/theme/` | Theme engine: 14 themes, token derivation, React Context provider. |
| `src/types/` | TypeScript type definitions for all data models. |
| `src/utils/` | Pure utility functions: placeholders, token counting, RTL detection. |
| `assets/` | Static assets: app icons, splash icon (no custom fonts, no illustrations). |
| `docs/` | Internal documentation: bottom sheet analysis. |

---

## 4. Navigation

### Root Navigator

**File**: `app/_layout.tsx`

The root is a `Stack` navigator (Expo Router) with `headerShown: false` and `animation: 'simple_push'`. All screens are wrapped in:

```
ThemeProvider
  GestureHandlerRootView
    BottomSheetProvider
      Stack
```

The Stack contains all routes. No navigation guards are implemented in the root layout.

### Complete Screen Hierarchy

```
Stack (root)
├── (tabs)/                          # Tab Navigator (default initial route)
│   ├── index.tsx                    # Prompts list (first tab, home)
│   ├── templates.tsx               # Templates browser
│   └── settings.tsx                # Settings hub
├── editor.tsx                       # Prompt editor (full-screen)
├── placeholder-edit.tsx            # Placeholder value editor (full-screen)
├── categories.tsx                   # Category management (full-screen)
├── welcome.tsx                      # Onboarding (full-screen)
├── settings/
│   └── _layout.tsx                 # Nested Stack for settings sub-screens
│       ├── appearance.tsx          # Theme picker
│       ├── typography.tsx          # Font settings
│       ├── options.tsx             # Display options
│       ├── ai.tsx                  # AI configuration
│       └── about.tsx              # About
└── +not-found.tsx                   # 404 fallback
```

### Tab Navigator

**File**: `app/(tabs)/_layout.tsx`

Three tabs with a custom `PillTabBar` (not the default Expo tab bar):

| Tab Key | Label | Icon (inactive) | Icon (active) |
|---------|-------|-----------------|---------------|
| `index` | Prompts | `document-text-outline` | `document-text` |
| `templates` | Templates | `library-outline` | `library` |
| `settings` | Settings | `settings-outline` | `settings-sharp` |

The tab bar is replaced with `PillTabBar` via `tabBar={renderTabBar}`.

### PillTabBar

**File**: `src/components/PillTabBar.tsx`

- Custom animated pill-style tab bar positioned absolutely at the bottom
- Pill indicator slides using `useDerivedValue` + spring animation
- Tab icons scale based on proximity to active index (1.0 to 1.1)
- Auto-hides when keyboard shows (translates down 100px, fades to 0), restores on hide
- Supports badge counts (error-colored badge, capped at "99+")
- Respects safe area insets for bottom padding
- Accepts `onSwipeNavigate` callback for swipe-based tab switching

### Floating Action Button (FAB)

- Only visible on the Prompts tab (`activeTab === 'index'`)
- Positioned absolutely: `right: 20`, `bottom: insets.bottom + 72 + 12`
- 56x56 circle, `RADIUS.xl` (24) border radius, primary background
- Animated press-in (scale 0.9, 80ms timing) and spring-back to 1.0
- Creates new prompt, selects it, navigates to `/editor?id={id}`
- Hidden when not on the Prompts tab

### Nested Navigation

Settings uses a nested Stack navigator:
- `(tabs)/settings` -> `settings/_layout.tsx` (Stack, headerShown: false, animation: simple_push)
- Sub-screens: appearance, typography, options, ai, about

### Navigation Guards

**Not implemented.** The `welcome.tsx` screen exists and calls `setOnboarded()` then `router.replace('/(tabs)')`, but there is no redirect guard in `_layout.tsx` that checks `hasOnboarded` to redirect new users to `/welcome`. The welcome screen is effectively unreachable on first launch unless navigated to manually.

### Initial Route

- Expo Router defaults to `/(tabs)` as the initial route (file-based convention — `index.tsx` is the first tab)
- No explicit `initialRouteName` is set
- The Prompts tab loads first

### Navigation Animations

- Default Stack animation: `simple_push`
- Tab switching: Spring-based `activeIndex` shared value
- Bottom sheet: Custom spring + timing animations (see Section 18)

### Navigation Flow

```
App Launch -> (tabs)/index [Prompts tab]
  -> User taps FAB -> /editor?id={newId}
  -> User taps prompt card -> /editor?id={existingId}
  -> User taps template card -> BottomSheet preview -> "Use" -> /editor?id={newId}
  -> User taps Settings tab -> (tabs)/settings
    -> User taps Appearance -> /settings/appearance
    -> User taps Typography -> /settings/typography
    -> User taps AI Enhancement -> /settings/ai
    -> User taps About -> /settings/about
  -> User long-presses prompt -> ContextMenu bottom sheet
  -> User taps search -> SearchBar expands
  -> User taps category -> Filter by category
  -> User taps "Manage Categories" -> /categories
  -> User taps placeholder -> /placeholder-edit
```

---

## 5. Startup Flow

### Complete Startup Sequence

1. **Native splash screen** — Displayed by the OS using `splash-icon.png` on background `#1B211A` (forest theme background). Configured in `app.json`:
   ```json
   "splash": {
     "image": "./assets/splash-icon.png",
     "resizeMode": "contain",
     "backgroundColor": "#1B211A"
   }
   ```

2. **SplashScreen.preventAutoHideAsync()** — Called at module level in `app/_layout.tsx` to prevent the native splash from auto-hiding

3. **React initializes** — `RootLayout` renders `<ThemeProvider>` which immediately starts loading theme from AsyncStorage

4. **ThemeProvider mounts** — Loads `@promptforge_settings` from AsyncStorage to determine theme variant. If `followSystem` is true, also checks `useColorScheme()` for system dark/light preference

5. **RootLayoutInner mounts** — Renders a fallback loading state: centered `ActivityIndicator` (large, primary color) on the theme's background color

6. **Initialization useEffect fires**:
   - `loadSettings()` — Loads all settings from `@promptforge_settings` via `settingsStore`
   - `loadPrompts()` — Loads all prompts, categories, and order from `@promptforge_prompts` via `promptStore`
   - Both operations are sequential (`await`)

7. **setReady(true)** — Switches from loading spinner to the actual app UI

8. **SplashScreen.hideAsync()** — Hides the native splash screen (wrapped in try/catch to handle race conditions)

9. **System UI sync** — `SystemUI.setBackgroundColorAsync(theme.color.surface)` syncs the Android navigation/status bar background to the current theme's surface color

10. **StatusBar style** — Set to `'light'` for dark themes, `'dark'` for light themes based on `mode` from theme context

11. **App renders** — `GestureHandlerRootView` > `BottomSheetProvider` > `StatusBar` + `Stack` navigator (which routes to `/(tabs)` as initial route)

### What Does NOT Happen at Startup

- `aiStore.loadFromStorage()` is NOT called at startup — it is lazy-loaded only when the AI settings screen mounts
- No animations or transitions during splash
- No network requests
- No analytics or crash reporting initialization
- No font loading (no custom fonts)
- No deep link handling at startup (expo-linking is installed but not actively used in startup)

---

## 6. Theme Engine

### Architecture

The theme engine is built on React Context with Zustand for persistence. It supports 14 themes (7 dark, 7 light) with automatic token derivation from 7 raw hex values per theme.

### Theme Files

| File | Purpose |
|------|---------|
| `src/theme/tokens.ts` | Raw theme data, derivation functions, color utilities, theme cache |
| `src/theme/ThemeProvider.tsx` | React Context provider, follow-system logic, AsyncStorage persistence |
| `src/theme/useTheme.ts` | Convenience hook wrapping `ThemeContext` |
| `src/theme/index.ts` | Public API + legacy compatibility layer (`getThemeTokens()`, `allThemeVariants`, etc.) |

### How Themes Are Stored

1. **Raw definitions** — 14 themes defined as `rawThemes: Record<ThemeVariant, RawTheme>` in `tokens.ts`. Each has exactly 7 hex values: `background`, `text`, `surface`, `surfaceContainer`, `surfaceContainerHigh`, `primary`, `error`.

2. **Derived tokens** — `deriveTokens()` computes 23 additional tokens from the 7 raw values (see derivation table below). Results are cached in `themeCache` for performance.

3. **Persistence** — The active theme variant is persisted to AsyncStorage under key `@promptforge_settings` as part of the `AppSettings` object:
   ```json
   { "theme": "forest", "followSystem": false, "fontSize": 16, "fontFamily": "system", "hasOnboarded": false, "showTokenCount": true }
   ```

### Token Derivation Table

| Derived Token | Derivation |
|---------------|-----------|
| `onSurfaceVariant` | `text` at 68% opacity |
| `outline` | `text` at 12% opacity |
| `outlineVariant` | `text` at 6% opacity |
| `disabled` | `text` at 38% opacity |
| `disabledContainer` | `text` at 12% opacity |
| `onPrimary` | Auto-contrast: white or near-black based on primary luminance |
| `onError` | Auto-contrast: white or near-black based on error luminance |
| `success` | `#6FCF97` (dark) / `#1B8A5A` (light) |
| `warning` | `#F2C94C` (dark) / `#B7791F` (light) |
| `info` | `#56CCF2` (dark) / `#1D6FA5` (light) |
| `overlay` | Fixed `rgba(0, 0, 0, 0.55)` |
| `focusRing` | Same as `primary` |
| `text` | Alias for raw `text` |
| `textSecondary` | Alias for `onSurfaceVariant` |
| `textMuted` | Alias for `disabled` |
| `border` | Alias for `outlineVariant` |
| `sidebar` | Alias for `surface` |
| `surfaceElevated` | Alias for `surfaceContainerHigh` |
| `primaryLight` | `primary` at 15% alpha |
| `danger` | Alias for `error` |

### How Themes Switch

1. `ThemeProvider` exposes `setTheme(variant: ThemeVariant)` and `setFollowSystem(boolean)`
2. `setTheme` updates React state + persists to AsyncStorage
3. `setFollowSystem(true)` enables automatic dark/light switching based on `useColorScheme()` from React Native
4. Follow-system logic: picks the first variant in the target mode (e.g., system dark -> first dark theme)

### How Components Consume Theme

```tsx
const { theme, themeVariant, mode, followSystem, setTheme, setFollowSystem } = useTheme();
const c = theme.color;

// Usage
<View style={{ backgroundColor: c.surfaceContainer, borderColor: c.outlineVariant }}>
  <Text style={{ color: c.onBackground }}>Hello</Text>
</View>
```

All components destructure `theme.color` as `c` and reference tokens like `c.background`, `c.primary`, `c.onSurfaceVariant`, etc. No raw hex values are used in component code.

### Color System (Full Token Map)

Every theme produces these 23 color tokens:

**Surfaces (4)**:
- `background` — Screen background
- `surface` — Base surface (used for tone layering)
- `surfaceContainer` — Cards, inputs, list items
- `surfaceContainerHigh` — Elevated elements (modals, FAB, snackbars)

**Text (4)**:
- `onBackground` — Primary text on background
- `onSurfaceVariant` — Secondary/muted text (68% of text)
- `onPrimary` — Text on primary-colored surfaces (auto-contrast)
- `onError` — Text on error-colored surfaces (auto-contrast)

**Borders (2)**:
- `outline` — Visible borders (12% of text)
- `outlineVariant` — Subtle dividers (6% of text)

**Semantic (5)**:
- `primary` — Accent color: buttons, active states, links
- `error` — Destructive actions, validation errors
- `success` — Positive feedback (copy confirmation)
- `warning` — Caution states
- `info` — Informational highlights

**States (4)**:
- `disabled` — 38% opacity of onBackground
- `disabledContainer` — 12% opacity of onBackground
- `overlay` — Modal scrim: fixed rgba(0,0,0,0.55)
- `focusRing` — Focus indicator (same as primary)

**Aliases (8)**:
- `text`, `textSecondary`, `textMuted`, `border`, `sidebar`, `surfaceElevated`, `primaryLight`, `danger`

### Typography

**File**: `src/constants/index.ts`

No custom fonts are loaded. All typography uses system fonts with three available families: `system` (default), `monospace`, `serif`.

13 typography tokens:

| Token | Size | Weight | Line Height (approx) | Use |
|-------|------|--------|---------------------|-----|
| `title` | 28 | 700 | 34 | Screen titles |
| `heading` | 22 | 600 | 28 | Section headers, title input |
| `subheading` | 18 | 600 | 24 | Dialog titles, step titles |
| `body` | 16 | 400 | 24 | Primary reading text |
| `bodyMedium` | 16 | 500 | 24 | Category names, provider names |
| `bodySemibold` | 16 | 600 | 24 | Card titles |
| `caption` | 14 | 400 | 20 | Secondary text, descriptions |
| `captionMedium` | 14 | 500 | 20 | System prompt, badge text |
| `captionSemibold` | 14 | 600 | 20 | Button text, section titles (uppercase) |
| `labelSmall` | 12 | 400 | 16 | Meta text, timestamps |
| `labelSmallMedium` | 12 | 500 | 16 | Category labels, results count |
| `small` | 11 | 500 | 16 | Tags, timestamps, version numbers |
| `smallSemibold` | 11 | 600 | 16 | Tab labels |

### Spacing

**4dp grid** with 7 levels:

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4 | Inline spacing, tiny gaps |
| `sm` | 8 | Small gaps, icon-text gaps |
| `md` | 12 | Medium gaps |
| `lg` | 16 | Screen edge gutter, card padding |
| `xl` | 20 | Larger gaps |
| `xxl` | 24 | Section gaps |
| `xxxl` | 32 | Large section gaps |

### Corner Radius

6 levels:

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 4 | Tags, small badges |
| `sm` | 8 | Chips, small buttons |
| `md` | 12 | Cards, inputs, buttons |
| `lg` | 16 | Large cards, bottom sheets |
| `xl` | 24 | FAB, dialogs, bottom sheet top corners |
| `full` | 999 | Pill shapes (tab bar, category tags) |

### Icon Sizes

| Token | Value | Use |
|-------|-------|-----|
| `sm` | 16 | Inline with text, small badges |
| `md` | 20 | List items, toolbar buttons |
| `lg` | 24 | Tab bar icons, navigation |
| `xl` | 32 | Empty states, feature callouts |
| `list` | 20 | Same as md, list checkmarks |
| `appbar` | 24 | Same as lg |

### Touch Targets

`TOUCH_TARGET = 48` — Minimum 48x48dp hit area for all interactive elements. `hitSlop={8}` expands small icons rather than inflating the icon itself.

### Elevation (Dark-Theme-Aware)

Shadows are invisible on dark themes. The app uses **surface tone layering** instead:

| Level | Background | Use |
|-------|-----------|-----|
| level0 | `background` | Flat, no elevation |
| level1 | `surfaceContainer` | Cards, list items |
| level2 | `surfaceContainerHigh` | FAB, snackbar, floating elements |
| level3 | `surfaceContainerHigh` + `overlay` scrim | Modals, dialogs |

On light themes, a 1dp `outlineVariant` border is added to level1+ elements.

### Shadow Policy

**Not implemented.** No `elevation` or `shadow*` styles are used anywhere. The design relies entirely on surface tone layering for depth perception.

### Transparency Policy

Transparency is used sparingly and systematically:
- `onBackground + '14'` — Ripple color on Android (8% opacity)
- `onBackground + '08'` — Card pressed tint (3% opacity)
- `primary + '15'` — Primary light tint (via `primaryLight` token)
- `primary + '08'` — Background decorative circles in welcome screen
- `overlay` — Fixed `rgba(0,0,0,0.55)` for modal backdrops

### Animation Tokens

No dedicated animation token constants exist. Animation values are defined inline per component:
- Spring configs: `{ damping: 22, stiffness: 220, mass: 0.9 }` (open), `{ damping: 28, stiffness: 280, mass: 1.0 }` (close)
- Timing durations: 80ms, 120ms, 150ms, 200ms, 225ms, 280ms
- FAB press: 80ms timing to 0.9 scale, spring back to 1

### Semantic Colors

Success, warning, info are derived from mode (dark/light) and remain constant across all themes within a mode:
- **Dark mode**: `success: '#6FCF97'`, `warning: '#F2C94C'`, `info: '#56CCF2'`
- **Light mode**: `success: '#1B8A5A'`, `warning: '#B7791F'`, `info: '#1D6FA5'`

---

## 7. Existing Themes

### Dark Themes (7)

#### forest
- **Primary**: #7FBF8B (muted green)
- **Secondary/Surface**: #161B15
- **Accent**: #7FBF8B
- **Background**: #1B211A
- **Surface Container**: #222A21
- **Surface Container High**: #2A332A
- **Border**: Derived (6-12% of text)
- **Text**: #D3DAD9
- **Success**: #6FCF97
- **Warning**: #F2C94C
- **Danger/Error**: #E08A7A
- **Info**: #56CCF2
- **Mood**: Nature-inspired, calm, focused
- **Design language**: Organic, grounded, productivity-oriented
- **Visual personality**: Quiet confidence, like a well-organized desk in a forest cabin

#### midnight
- **Primary**: #5EA8E0 (cool blue)
- **Background**: #0F1620
- **Surface**: #0B121B
- **Surface Container**: #18222F
- **Surface Container High**: #1F2B3A
- **Text**: #CDD6E3
- **Error**: #E08A7A
- **Mood**: Professional, deep, focused
- **Design language**: Corporate tech, clean, nocturnal
- **Visual personality**: Like a Bloomberg terminal in dark mode

#### carbon
- **Primary**: #D9A566 (warm gold)
- **Background**: #161616
- **Surface**: #101010
- **Surface Container**: #202020
- **Surface Container High**: #2A2A2A
- **Text**: #DAD9D6
- **Error**: #E08A7A
- **Mood**: Industrial, warm, premium
- **Design language**: Dark luxury, metallic accents
- **Visual personality**: Like a high-end audio interface

#### plum
- **Primary**: #B88AD9 (soft purple)
- **Background**: #1A141F
- **Surface**: #150F1A
- **Surface Container**: #241A2B
- **Surface Container High**: #2E2236
- **Text**: #E2D8E8
- **Error**: #E08A8A
- **Mood**: Creative, elegant, expressive
- **Design language**: Artistic, sophisticated
- **Visual personality**: Like a designer's creative tool

#### ember
- **Primary**: #E0907A (warm coral)
- **Background**: #1F1517
- **Surface**: #190F11
- **Surface Container**: #2A1C1D
- **Surface Container High**: #341F22
- **Text**: #ECDAD6
- **Error**: #E0707A
- **Mood**: Warm, energetic, inviting
- **Design language**: Earthy warmth, approachable
- **Visual personality**: Like a cozy café at sunset

#### dracula
- **Primary**: #BD93F9 (classic Dracula purple)
- **Background**: #282A36
- **Surface**: #21222C
- **Surface Container**: #313341
- **Surface Container High**: #414354
- **Text**: #F8F8F2
- **Error**: #FF5555
- **Mood**: Iconic, bold, developer-oriented
- **Design language**: Terminal culture, hacker aesthetic
- **Visual personality**: The classic Dracula color scheme

#### mono
- **Primary**: #888888 (neutral gray)
- **Background**: #0A0A0A
- **Surface**: #050505
- **Surface Container**: #141414
- **Surface Container High**: #1E1E1E
- **Text**: #F0F0F0
- **Error**: #E04040
- **Mood**: Minimal, stark, utilitarian
- **Design language**: Brutalist, monochrome
- **Visual personality**: Like a typewriter — pure function, no decoration

### Light Themes (7)

#### paper
- **Primary**: #3D5EC0 (muted blue)
- **Background**: #F7F7F5
- **Surface**: #EEECEA
- **Surface Container**: #FFFFFF
- **Surface Container High**: #E8E6E4
- **Text**: #1A1A1A
- **Error**: #C03030
- **Mood**: Clean, classic, readable
- **Design language**: Traditional paper, editorial
- **Visual personality**: Like a well-designed notebook

#### sky
- **Primary**: #2563EB (bright blue)
- **Background**: #E8F0FB
- **Surface**: #DCE8F8
- **Surface Container**: #F2F7FF
- **Surface Container High**: #CCDDF5
- **Text**: #1A2540
- **Error**: #C02020
- **Mood**: Fresh, open, airy
- **Design language**: Modern SaaS, cloud-native
- **Visual personality**: Like a clean dashboard in daylight

#### sage
- **Primary**: #2D7A50 (forest green)
- **Background**: #EEF5F0
- **Surface**: #E2EDE6
- **Surface Container**: #F5FAF6
- **Surface Container High**: #D4E8DA
- **Text**: #182418
- **Error**: #C04040
- **Mood**: Natural, calming, organic
- **Design language**: Wellness, nature, mindfulness
- **Visual personality**: Like a botanical illustration guide

#### rose
- **Primary**: #B83058 (deep rose)
- **Background**: #FDF0F4
- **Surface**: #F8E4EC
- **Surface Container**: #FFF5F8
- **Surface Container High**: #F0D4E0
- **Text**: #2A1020
- **Error**: #C02050
- **Mood**: Feminine, warm, expressive
- **Design language**: Fashion, lifestyle, editorial
- **Visual personality**: Like a luxury magazine layout

#### latte
- **Primary**: #8A4C26 (warm brown)
- **Background**: #F5EDE0
- **Surface**: #EDE3D4
- **Surface Container**: #FDF6ED
- **Surface Container High**: #E4D8C8
- **Text**: #2A1E10
- **Error**: #C03030
- **Mood**: Warm, comforting, artisanal
- **Design language**: Coffee culture, craft
- **Visual personality**: Like a handcrafted menu at a specialty café

#### lavender
- **Primary**: #7050C0 (soft purple)
- **Background**: #F0ECFA
- **Surface**: #E6E0F5
- **Surface Container**: #F8F5FF
- **Surface Container High**: #D8D0EE
- **Text**: #1E1830
- **Error**: #C02050
- **Mood**: Dreamy, creative, gentle
- **Design language**: Soft, pastel, approachable
- **Visual personality**: Like a watercolor illustration

#### snow
- **Primary**: #333333 (near-black)
- **Background**: #FFFFFF
- **Surface**: #F5F5F5
- **Surface Container**: #FFFFFF
- **Surface Container High**: #E8E8E8
- **Text**: #111111
- **Error**: #CC0000
- **Mood**: Pure, minimal, clinical
- **Design language**: Apple-like, ultra-clean
- **Visual personality**: Like a blank canvas

---

## 8. Design Philosophy

### Inferred Philosophy: Premium Minimal with Dark-First Sensibility

The current design philosophy is best described as **"Premium Minimal with Dark-First Sensibility"**:

1. **Dark-first** — The default theme is `forest` (dark). 7 of 14 themes are dark. The app icon, splash background, and `userInterfaceStyle` all default to dark.

2. **Minimal** — No decorative illustrations, no images in-app, no gradients, no shadows. All visual hierarchy is achieved through typography weight, spacing, color contrast, and surface tone layering.

3. **Premium** — The 48dp minimum touch targets, consistent 4dp grid spacing, careful color derivation, and haptic feedback on every interaction signal a premium, polished product.

4. **Functional** — Every visual element serves a purpose. There is zero decorative chrome. The UI is entirely icon-and-text based.

5. **Token-driven** — All colors come from the theme token system. No raw hex values in component code. This enforces consistency across 14 themes.

### Not Material Design

While the surface layering system (background -> surface -> surfaceContainer -> surfaceContainerHigh) is inspired by Material Design 3, the overall aesthetic is not Material Design:
- No elevation shadows
- No Material icons (uses Ionicons exclusively)
- No FAB in the traditional sense (positioned above tab bar, not at bottom-right)
- No app bar / top app bar pattern

### Not iOS HIG

- No SF Symbols
- No native iOS navigation patterns (no large titles, no grouped lists)
- No iOS-style blur effects
- Custom bottom sheet instead of native iOS sheet

### Not Purely Custom

The design borrows from multiple sources:
- Surface tone layering from Material Design 3
- Color derivation (alpha blending) from design token systems
- Pill tab bar pattern from modern mobile apps
- Context menu from iOS long-press patterns

---

## 9. HCI Principles

### Consistency
**Followed.** All screens use the same token system, same typography scale, same spacing grid, same button patterns, same press feedback, same haptic patterns. The `PillTabBar` provides consistent navigation. The `BottomSheet` provides consistent modal patterns.

### Visibility
**Followed.** All actions are visible through icons and labels. The FAB clearly indicates "create". Search is toggled via a visible icon. Category filters are always visible. No hidden gestures or invisible touch targets.

### Feedback
**Followed extensively.** Every interaction provides:
- **Visual feedback**: Pressed opacity (0.7), color changes, animated transitions
- **Haptic feedback**: Light/Medium/Heavy impacts via expo-haptics
- **State feedback**: Loading spinners, success/error indicators, copy confirmation
- **Animated feedback**: Bottom sheet springs, tab indicator slides, search bar expands

### Recognition
**Followed.** Icons are semantic (document for prompts, library for templates, gear for settings). Color coding distinguishes categories. Pin and favorite icons are instantly recognizable.

### Efficiency
**Followed.** One-tap copy, quick-fill placeholders, search with instant filtering, category chips for fast filtering, context menu for quick actions.

### Accessibility
**Substantially followed.** Every interactive element has `accessibilityRole`, `accessibilityLabel`, and `accessibilityState`. The bottom sheet detects `reduceMotion`. Touch targets are 48dp minimum. However:
- No screen reader announcement for toast/snackbar feedback
- No Dynamic Type / font scaling support (font sizes are fixed)

### Error Prevention
**Followed.** Delete confirmations via bottom sheets, category reassignment prompts, version history for restore, undo/redo in editor.

### Progressive Disclosure
**Followed.** Search bar expands on demand. Find/replace is hidden until activated. Placeholder bar appears only when placeholders are detected. Category input appears only in reorder mode.

### Visual Hierarchy
**Followed.** Clear typography hierarchy (title > heading > body > caption > small). Surface tone layering creates depth. Primary color draws attention to key actions. Muted text recedes.

### Touch Targets
**Followed.** 48dp minimum enforced via `TOUCH_TARGET` constant. `hitSlop={8}` on small icon buttons. Ripple feedback on Android.

### Interaction Feedback
**Followed.** Pressed opacity (0.7), ripple effects (Android), haptic feedback, animated transitions, loading states, success/error indicators.

---

## 10. Design Tokens

### Spacing Scale (4dp grid)

```ts
SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 }
```

### Typography Scale

```ts
TYPOGRAPHY = {
  title:           { fontSize: 28, fontWeight: '700' },
  heading:         { fontSize: 22, fontWeight: '600' },
  subheading:      { fontSize: 18, fontWeight: '600' },
  body:            { fontSize: 16, fontWeight: '400' },
  bodyMedium:      { fontSize: 16, fontWeight: '500' },
  bodySemibold:    { fontSize: 16, fontWeight: '600' },
  caption:         { fontSize: 14, fontWeight: '400' },
  captionMedium:   { fontSize: 14, fontWeight: '500' },
  captionSemibold: { fontSize: 14, fontWeight: '600' },
  labelSmall:      { fontSize: 12, fontWeight: '400' },
  labelSmallMedium:{ fontSize: 12, fontWeight: '500' },
  small:           { fontSize: 11, fontWeight: '500' },
  smallSemibold:   { fontSize: 11, fontWeight: '600' },
}
```

### Radius Scale

```ts
RADIUS = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 999 }
```

### Icon Sizes

```ts
ICON_SIZE = { sm: 16, md: 20, lg: 24, xl: 32, list: 20, appbar: 24 }
```

### Touch Target

```ts
TOUCH_TARGET = 48
```

### Animations

No centralized animation tokens. Values are defined per-component:

| Component | Animation | Duration/Curve |
|-----------|-----------|---------------|
| FAB press-in | scale 1 → 0.9 | 80ms timing |
| FAB press-out | scale 0.9 → 1 | Spring: damping 20, stiffness 250, mass 0.8 |
| Tab pill slide | translateX | Spring: damping 20, stiffness 250, mass 0.8 |
| Tab icon scale | 1.0 → 1.1 | Interpolated from distance |
| Search bar expand | height + opacity | 225ms timing |
| Bottom sheet open | translateY | Spring: damping 22, stiffness 220, mass 0.9 |
| Bottom sheet close | translateY | Spring: damping 28, stiffness 280, mass 1.0 |
| Bottom sheet backdrop | opacity 0 → 0.60 | 280ms timing |
| Bottom sheet content fade | opacity 0 → 1 | 200ms timing |
| Category wiggle | rotation -3° ↔ +3° | withRepeat + withSequence, random delay |
| Selection mode header | opacity + translateY | 200ms timing |
| Placeholder bar enter | FadeInDown | 250ms |
| Placeholder bar exit | FadeOutUp | 200ms |
| Tab bar keyboard hide | translateY(100) + opacity(0) | Timing |
| Tab bar keyboard show | translateY(0) + opacity(1) | Spring |

### Opacity Values

| Value | Use |
|-------|-----|
| 0.06 | outlineVariant (subtlest divider) |
| 0.08 | Card pressed tint (onBackground + '08') |
| 0.12 | outline (visible border), disabledContainer |
| 0.14 | Ripple color (onBackground + '14') |
| 0.15 | primaryLight (primary at 15% alpha) |
| 0.38 | disabled text |
| 0.55 | Overlay/modal scrim |
| 0.60 | Bottom sheet backdrop |
| 0.68 | onSurfaceVariant (secondary text) |
| 0.70 | Pressed opacity on interactive elements |
| 0.85 | Tab press feedback opacity |
| 0.98 | Card pressed opacity |
| 1.00 | Full opacity |

### Timing Functions

| Function | Duration | Use |
|----------|----------|-----|
| Fast tap | 80ms | FAB press-in |
| Micro interaction | 120ms | Tab press feedback |
| Content fade | 150ms | Bottom sheet content fade-out |
| Quick transition | 200ms | Selection mode, placeholder bar exit |
| Standard expand | 225ms | Search bar expand |
| Standard transition | 280ms | Bottom sheet backdrop |

---

## 11. Component Library

### BaseCard

- **Purpose**: Theme-aware card wrapper with ripple and pressed states
- **Props**: `children`, `onPress?`, `onLongPress?`, `disabled?`, `accessibilityLabel?`, `accessibilityHint?`, `style?`
- **Variants**: Normal, Pressed, Disabled
- **States**: 16px padding, 16px radius, 1px border (outlineVariant), 12px bottom margin
- **Animations**: Pressed opacity 0.98, tint `onBackground + '08'`
- **Theme support**: Full (surfaceContainer bg, outlineVariant border)
- **Accessibility**: `accessibilityRole="button"`, `hitSlop={8}`, Android ripple

### PromptCard

- **Purpose**: Prompt list item with full metadata display
- **Props**: `prompt: Prompt`, `onPress`, `onLongPress?`, `onColorPress?`, `selected?`, `showCheckbox?`, `onToggleSelect?`
- **Variants**: Normal, Selected (checkbox with checkmark), Pinned (pin badge), Favorited (star icon)
- **States**: Normal, Pressed (opacity 0.98 + tint), Selected (primary-tinted checkbox)
- **Animations**: None (static card)
- **Theme support**: Full (all colors from tokens)
- **Accessibility**: Full labels including pin/favorite status, checkbox role

### TemplateCard

- **Purpose**: Template list item with description and preview block
- **Props**: `template: PromptTemplate`, `onPress`, `onLongPress?`
- **Variants**: Normal only
- **States**: Normal, Pressed
- **Animations**: None
- **Theme support**: Full

### PillTabBar

- **Purpose**: Custom animated floating pill tab bar
- **Props**: `tabs: Tab[]`, `activeTab`, `onTabPress`, `activeIndex: SharedValue`, `onSwipeNavigate?`
- **Variants**: 3 tabs (Prompts, Templates, Settings)
- **States**: Active (icon scale 1.1, primary indicator), Inactive (icon scale 1.0), Keyboard-hidden (translated down, faded)
- **Animations**: Pill slide (spring), icon scale (interpolate), press feedback (opacity + bg), keyboard hide/show
- **Theme support**: Full
- **Accessibility**: `accessibilityRole="button"`, `accessibilityState={{ selected }}`, hints

### SearchBar

- **Purpose**: Animated expandable search input
- **Props**: `title`, `query`, `onQueryChange`, `placeholder`, `isVisible`, `onToggle`
- **Variants**: Collapsed (title + icon), Expanded (title + full search input)
- **States**: Collapsed, Expanded (auto-focuses after 250ms)
- **Animations**: Height + opacity interpolated from expandProgress (225ms)
- **Theme support**: Full
- **Accessibility**: Standard TextInput accessibility

### CategoryTag

- **Purpose**: Category filter chip with animated wiggle in reorder mode
- **Props**: `name`, `isSelected`, `onPress`, `onLongPress?`, `onDragStart?`, `isReorderMode?`
- **Variants**: Selected (primary bg), Unselected (surfaceContainer bg)
- **States**: Normal, Selected, Reorder mode (wiggle animation)
- **Animations**: Wiggle via `withRepeat` + `withSequence` (rotation -3° to +3°, random delay per tag)
- **Theme support**: Full
- **Accessibility**: `accessibilityRole="button"`, `accessibilityState={{ selected }}`

### FilterChip

- **Purpose**: Generic filter chip (used for template categories)
- **Props**: `label`, `isSelected`, `onPress`
- **Variants**: Selected, Unselected
- **States**: Normal, Selected
- **Animations**: None
- **Theme support**: Full

### BottomSheet

- **Purpose**: Custom gesture-driven bottom sheet (Modal-based)
- **Props**: `children`, `onClose?` (via ref: `present()`, `dismiss()`)
- **Variants**: N/A (single implementation)
- **States**: Open, Closed, Pan-dismissing
- **Animations**: Spring for sheet, timing for backdrop/content, pan gesture for dismiss
- **Theme support**: Full (surfaceContainerHigh bg, outlineVariant border)
- **Accessibility**: `accessibilityLabel="Drag to dismiss"`, `reduceMotion` detection, Android back handler

### ContextMenu

- **Purpose**: Long-press context menu for prompts (bottom sheet)
- **Props**: `visible`, `prompt`, `onClose`, `onRename`, `onDuplicate`, `onDelete`, `onTogglePin`, `onToggleFavorite`, `onColorSelect`, `onSaveAsTemplate`, `onSelect?`
- **Variants**: N/A
- **States**: Visible (with prompt header, menu items, delete section)
- **Animations**: Via BottomSheet (spring + timing)
- **Theme support**: Full

### FindReplace

- **Purpose**: Find and replace toolbar in editor
- **Props**: `isActive`, `onClose`, `onFind`, `onReplace`, `onReplaceAll`, `matchCount`, `currentMatch`, `onNavigateMatch`
- **Variants**: Find-only, Find + Replace
- **States**: Active (visible), Inactive (returns null)
- **Animations**: None
- **Theme support**: Full (surfaceContainerHigh bg)

### PlaceholderBar

- **Purpose**: Horizontal scrollable placeholder quick-fill bar
- **Props**: `text`, `onTextChange`, `promptId?`
- **Variants**: N/A
- **States**: Filled (primary tint + checkmark), Unfilled (surface bg)
- **Animations**: FadeInDown (250ms) enter, FadeOutUp (200ms) exit
- **Theme support**: Full
- **Navigation**: Each placeholder press navigates to `/placeholder-edit`

### MarkdownRenderer

- **Purpose**: Custom markdown parser and renderer for prompt preview
- **Props**: `content`, `style?`
- **Supported syntax**: h1-h4, paragraphs, bold, italic, inline code, links, blockquotes, ordered/unordered lists, fenced code blocks, tables, horizontal rules, `[placeholder]`
- **Theme support**: Full

### ToolbarBtn

- **Purpose**: Generic toolbar icon button
- **Props**: `icon`, `label`, `color`, `onPress`
- **States**: Normal, Pressed (color + '0D' tint)

### StatItem

- **Purpose**: Text statistics display (chars/words/tokens/lines)
- **Props**: `label`, `value: number`, `color`, `mutedColor`

### UndoRedoBar

- **Purpose**: Undo/redo button pair
- **Props**: `canUndo`, `canRedo`, `onUndo`, `onRedo`
- **States**: Enabled, Disabled (opacity 0.38)

### EnhanceButton

- **Purpose**: AI enhance trigger button
- **Props**: `isEnhancing`, `onPress`
- **States**: Normal (sparkles icon), Enhancing (ActivityIndicator)

### EnhancedPromptSheet

- **Purpose**: AI enhancement result display with action buttons
- **Props**: `visible`, `enhancedText`, `error`, `onClose`, `onReplace`, `onInsertBelow`, `onCopy`, `onOpenSettings?`
- **States**: Success (preview + actions), Error (red container + message)

### PromptPreviewContent

- **Purpose**: Full prompt preview with markdown rendering
- **Props**: `prompt`, `onClose`, `onEdit`, `onDelete`
- **States**: Normal, Delete confirmation (nested Modal)

### TemplatePreviewContent

- **Purpose**: Template preview with "Use" action
- **Props**: `template`, `onClose`, `onUse`

### ColorGridSheet / ColorPickerModal

- **Purpose**: Color picker for prompt accent colors
- **Props**: `visible`, `currentColor`, `onClose`, `onSelect`
- **Colors**: 8 preset colors
- **States**: Normal, Selected (3px border + checkmark)

### VersionHistoryModal

- **Purpose**: Version history browser
- **Props**: `visible`, `versions`, `onClose`, `onRestore`, `onDeleteVersion`
- **States**: Has versions, Empty (clock icon + message)

---

## 12. Existing Screens

### Prompts Screen (`app/(tabs)/index.tsx`)

- **Purpose**: Main screen — list of all user prompts with search, category filtering, bulk operations, reorder mode
- **Layout**: SafeAreaView > header (SearchBar + category pills + results count) > FlatList of PromptCards
- **Sections**:
  1. SearchBar (expandable, animated)
  2. Category pills (horizontal ScrollView, reorderable)
  3. Results count ("X prompts")
  4. FlatList of PromptCards
- **Components**: SearchBar, CategoryTag, PromptCard, ContextMenu, BottomSheet, CategoryInput, FilterChip
- **Animations**: SearchBar expand/collapse, selection mode header/toolbar transitions, category wiggle in reorder mode
- **Interactions**:
  - Tap card → editor
  - Long press card → ContextMenu
  - Tap category → filter
  - Tap search icon → expand search
  - FAB → create new prompt
  - Pull to refresh
  - Multi-select → bulk operations
  - Reorder mode → drag categories
- **Empty states**: Centered icon (document-text-outline in circle) + "No prompts yet" + "Tap + to create your first prompt"
- **Loading states**: Pull-to-refresh with `RefreshControl`
- **Error states**: None (no network operations on this screen)
- **Navigation**: → editor, → categories, → placeholder-edit
- **Business logic**: Search filtering, category filtering, bulk select/duplicate/delete, category reorder, pin/favorite toggling

### Templates Screen (`app/(tabs)/templates.tsx`)

- **Purpose**: Browse pre-built prompt templates, search/filter, use templates
- **Layout**: SearchBar > horizontal category pills > FlatList of TemplateCards
- **Sections**:
  1. SearchBar
  2. Category pills
  3. FlatList of TemplateCards
- **Components**: SearchBar, FilterChip, TemplateCard, TemplateContextMenu, BottomSheet, PromptPreviewContent (as template preview)
- **Animations**: SearchBar expand/collapse
- **Interactions**:
  - Tap card → template preview bottom sheet
  - Long press → context menu (Preview, Copy, Use)
  - "Use in my own prompts" → category confirmation → create prompt → editor
- **Empty states**: search-outline icon + "No templates found" + "Try a different search or category"
- **Loading states**: None
- **Error states**: None
- **Navigation**: → editor (after using template)
- **Business logic**: Search filtering, template → prompt creation with category confirmation

### Settings Screen (`app/(tabs)/settings.tsx`)

- **Purpose**: Settings hub with navigation to sub-screens
- **Layout**: Title "Settings" + bordered card containing 6 menu items
- **Menu items**: Appearance (color-palette), Typography (text), Options (options), AI Enhancement (sparkles), Categories (pricetags), About (information-circle)
- **Components**: Pressable rows with icon + label + chevron-forward
- **Animations**: None
- **Interactions**: Tap → navigate to sub-screen
- **Empty states**: N/A
- **Loading states**: N/A
- **Error states**: N/A
- **Navigation**: → settings/appearance, → settings/typography, → settings/options, → settings/ai, → settings/about, → categories

### Editor Screen (`app/editor.tsx`)

- **Purpose**: Full prompt editor with title, category, content editing, find/replace, version history, AI enhance, copy
- **Layout**: Header (back + title + undo/redo + search) > ScrollView (FindReplace + title input + color indicator + category input + category pills + placeholder bar + content TextInput) > Bottom toolbar (stats row + action buttons)
- **Sections**:
  1. Header bar (back, title display, undo/redo, search toggle)
  2. FindReplace toolbar (expandable)
  3. Title TextInput
  4. Color indicator capsule
  5. Category input + category pills
  6. PlaceholderBar (when placeholders detected)
  7. Content TextInput (multiline, configurable font)
  8. Stats row (chars, words, ~tokens, lines)
  9. Action buttons (copy, enhance, version history, save)
- **Components**: FindReplace, UndoRedoBar, CategoryTag, PlaceholderBar, EnhanceButton, VersionHistoryModal, EnhancedPromptSheet, ColorPickerModal, StatItem
- **Animations**: FindReplace expand, PlaceholderBar enter/exit, copy success feedback
- **Interactions**:
  - Edit title/content
  - Select category
  - Toggle stats
  - Copy to clipboard (success feedback)
  - AI enhance → result sheet
  - Version history → restore/delete
  - Find/replace
  - Undo/redo
  - Edit placeholder values
  - Change accent color
- **Empty states**: "Prompt not found" if ID invalid
- **Loading states**: AI enhancement spinner
- **Error states**: AI error display in EnhancedPromptSheet
- **Navigation**: → placeholder-edit (for individual placeholder editing)
- **Business logic**: Text editing, undo/redo (50 states), AI enhancement, version management, placeholder detection/replacement, RTL detection

### Categories Screen (`app/categories.tsx`)

- **Purpose**: CRUD management for prompt categories
- **Layout**: Header (back + title + add button) > create input row > FlatList of category rows
- **Sections**:
  1. Header (back arrow, "Categories" title, add button)
  2. Category input (inline text input with confirm/cancel)
  3. Category list (each row: color dot + name + edit/delete buttons)
- **Components**: BottomSheet (delete confirmation, category reassignment)
- **Animations**: None
- **Interactions**:
  - Add new category
  - Edit category name (inline)
  - Delete category (with confirmation)
  - Reassign prompts when deleting non-empty category
  - "Other" system category cannot be edited/deleted
- **Empty states**: pricetags-outline icon + "No categories yet"
- **Loading states**: None
- **Error states**: None
- **Navigation**: → back to previous screen
- **Business logic**: Category CRUD, prompt reassignment, "Other" system category protection

### Welcome Screen (`app/welcome.tsx`)

- **Purpose**: Onboarding flow with 4 steps
- **Steps**:
  1. "Write Better Prompts" — create-outline icon
  2. "Quick Fill Placeholders" — flash-outline icon
  3. "Copy & Go" — copy-outline icon
  4. "Stay Organized" — color-palette-outline icon
- **Layout**: SafeAreaView > decorative background circles (primary at 6-8% opacity) > app logo (flash icon in primary circle) > app name "Prompt Forge" > tagline > step icon > step title > step description > dot indicators > skip/next buttons
- **Animations**: Dot indicators animate width (active = 24, inactive = 8). Step transitions are instant (no crossfade).
- **Interactions**:
  - Skip → setOnboarded + navigate to tabs
  - Next → advance step
  - Last step: "Let's Go" → setOnboarded + navigate to tabs
- **Empty states**: N/A
- **Loading states**: N/A
- **Error states**: N/A
- **Navigation**: → (tabs) via `router.replace`
- **Business logic**: Onboarding completion, `hasOnboarded` flag
- **Notable**: No navigation guard exists to redirect new users to this screen automatically

### Placeholder Edit Screen (`app/placeholder-edit.tsx`)

- **Purpose**: Dedicated screen for editing individual placeholder values
- **Layout**: Header (back + "Fill Placeholder" label + placeholder name + copy button) > content area (placeholder badge + multiline TextInput) > bottom toolbar (clear button + save button)
- **Interactions**: Edit placeholder value, copy, clear, save
- **Empty states**: N/A
- **Loading states**: None
- **Error states**: None
- **Navigation**: → back to editor (passes result via placeholderEditStore)

### Appearance Settings (`app/settings/appearance.tsx`)

- **Purpose**: Theme selection with preview dots and follow-system toggle
- **Layout**: ScrollView with "Follow System" Switch, "Dark Themes" card, "Light Themes" card
- **Theme preview**: Each theme shows 3 colored dots (background, surfaceContainer, primary)
- **Selected state**: Background tinted with primary at 14% opacity, checkmark-circle icon

### Typography Settings (`app/settings/typography.tsx`)

- **Purpose**: Font size and font family selection
- **Font sizes**: Small (14), Medium (16), Large (18), X-Large (20)
- **Font families**: System, Monospace, Serif

### Options Settings (`app/settings/options.tsx`)

- **Purpose**: Display options (currently only "Show Token Count" toggle)

### AI Settings (`app/settings/ai.tsx`)

- **Purpose**: AI provider configuration with API key management
- **Providers**: Groq, OpenAI, DeepSeek, Gemini, Claude
- **Sections**: Provider rows (expandable), System Prompt editor, Privacy notice

### About Screen (`app/settings/about.tsx`)

- **Purpose**: App info card (flash icon, "Prompt Forge", version "1.0.0")

### Not Found Screen (`app/+not-found.tsx`)

- **Purpose**: 404 page with "Page not found" and "Go to home" link

---

## 13. Editor

### Architecture

The editor (`app/editor.tsx`, 589 lines) is a single-file screen with no sub-components extracted. It manages all editing state locally.

### Title Input

- Large font (`TYPOGRAPHY.heading`, 22px/600)
- Auto-advances to content on submit
- Binds to `prompt.title` in the store

### Content Input

- Multiline `TextInput`
- Configurable font size (14-20, from settingsStore)
- Configurable font family (system/monospace/serif)
- RTL-aware (auto-detects Arabic/Hebrew/Persian text, switches to `textAlign: 'right'`)
- Binds to `prompt.content` in the store

### Placeholder System

- Automatic detection via `detectPlaceholders(text)` regex
- Detects `[brackets]` and `{braces}` syntax
- `PlaceholderBar` renders horizontally above content
- Each placeholder is tappable → navigates to `/placeholder-edit` screen
- `placeholderEditStore` manages cross-screen communication (startEdit → navigate → saveResult → consumeResult)
- Polls for results every 500ms

### Find/Replace

- Expandable `FindReplace` component
- Regex-safe search (literal string matching)
- Match counting with current match indicator
- Previous/next navigation
- Replace one / Replace all
- Match counter display

### Undo/Redo

- Custom `useHistoryState` hook (useReducer-based)
- Max 50 history states
- Deduplication: only pushes to history if value actually changed
- `commitNow` forces a history entry on keyboard dismiss
- Keyboard shortcuts (Ctrl+Z/Ctrl+Y) on web

### Version History

- Up to 50 versions per prompt (`MAX_VERSIONS = 50`)
- `VersionHistoryModal` bottom sheet
- Each version shows: number badge, date, content preview (2 lines)
- Expandable with Restore and Delete actions
- Versions saved with `addVersion()` in promptStore

### AI Enhance

- `useEnhance` hook manages the enhancement flow
- `EnhanceButton` triggers enhancement
- Results shown in `EnhancedPromptSheet`
- Options: Replace Current, Insert Below, Copy, Dismiss
- Snapshot-based version stale detection (if user edited during AI call)
- 30-second timeout on enhancement requests
- Error handling: InvalidKey → "Configure API Key" button

### Keyboard Handling

- `KeyboardAvoidingView` with platform-appropriate behavior:
  - iOS: `behavior: 'padding'`
  - Android: `behavior: 'height'`
- Commits undo history on keyboard hide
- `keyboardShouldPersistTaps="handled"` on ScrollView

### Stats Row

- Toggleable display of: characters, words, ~tokens (4 chars/token estimate), lines
- `StatItem` component for each metric
- Controlled by `showTokenCount` setting

### Bottom Toolbar

- Action buttons: Copy, AI Enhance, Version History, Save
- Copy button shows success feedback (green checkmark for 2 seconds)

### Scrolling

- `ScrollView` wraps all content
- `keyboardShouldPersistTaps="handled"`
- Proper padding to clear FAB and tab bar

### Performance

- No memoization (no `React.memo`, no `useMemo` on heavy computations)
- FlatList not used (single prompt editing)
- No lazy loading

---

## 14. Search

### Search Architecture

Search is implemented per-screen (Prompts and Templates), not as a global search feature. Each screen has its own `SearchBar` component.

### SearchBar Component

- **State**: `isVisible` (boolean), `query` (string)
- **Visual**: Collapsed shows title + search icon. Expanded shows title row + full-width search input with search icon, clear button.
- **Animation**: `expandProgress` shared value interpolated to height and opacity (225ms timing)
- **Auto-focus**: Input receives focus 250ms after expansion
- **Dismiss**: Keyboard dismissed when search bar closes

### Search Logic

- **Prompts screen**: Filters by `title` and `content` matching the query (case-insensitive). Combined with category filter.
- **Templates screen**: Filters by `title`, `description`, and `tags` matching the query. Combined with category filter.
- **State**: `searchQuery` stored in `promptStore` for prompts, local state for templates
- **Performance**: Filters run on every render (no debouncing, no memoization)

### Filters

- Category chips above the list
- Single category selection (tap to select, tap again to deselect)
- "All" is implicit (no category selected)
- Combined with search query (AND logic)

### Animations

- Search bar expand/collapse (225ms timing)
- No list item animations
- No search result highlighting

---

## 15. Prompt Cards

### PromptCard Visual Elements

**Header row**:
- Selection checkbox (when in selection mode): 24x24, primary bg when selected, checkmark icon
- 40x40 icon area with prompt accent color background
- Title (bodySemibold, 16/600)
- Category name (labelSmallMedium, 12/500, onSurfaceVariant)
- Pin badge (18px circle, pin icon) — shown when pinned
- Star icon (FAVORITE_COLOR #F1FA8C) — shown when favorited
- Chevron-forward icon (trailing)

**Preview text**:
- Content preview (caption, 14/400, onSurfaceVariant)
- Max 2 lines, ellipsizeMode: tail

**Tags row**:
- Up to 3 tags (small, 11/500)
- Each tag in a pill: surfaceContainer bg, outlineVariant border, onSurfaceVariant text
- RTL-aware (reverses row direction for RTL text)

**Footer**:
- Relative timestamp ("Just now", "Xm ago", "Xh ago", "Xd ago", or date string)
- Color capsule (16x16 circle, tappable, stops propagation)
- Version count ("v1", "v5", etc.) — shown when versions > 1

### Spacing

- Card padding: 16px (SPACING.lg)
- Card radius: 12px (RADIUS.md)
- Card border: 1px outlineVariant
- Bottom margin: 12px (SPACING.md)
- Gap between header/preview/tags/footer: 8-12px

### Corner Radius

- Card: 12px (RADIUS.md)
- Icon area: 10px (between RADIUS.sm and RADIUS.md)
- Pin badge: 9px (full circle)
- Color capsule: 8px (full circle)
- Tag pills: 8px (RADIUS.sm)

### Typography

- Title: bodySemibold (16/600)
- Category: labelSmallMedium (12/500, onSurfaceVariant)
- Preview: caption (14/400, onSurfaceVariant)
- Tags: small (11/500, onSurfaceVariant)
- Timestamp: labelSmall (12/400, disabled)
- Version: small (11/500, disabled)

### Icons

- Pin: `pin` (md, primary)
- Favorite: `star` (md, FAVORITE_COLOR)
- Chevron: `chevron-forward` (sm, disabled)
- Checkbox: custom (24x24, primary bg, checkmark)
- Selection checkbox: `checkmark` (sm, onPrimary)

### Animations

- None (cards are static)
- Pressed state: opacity 0.98 + tint

### Pressed State

- Opacity: 0.98
- Background tint: `onBackground + '08'`
- Android ripple: `onBackground + '14'`

### Selection Mode

- Checkbox appears on left of card
- Selected: primary bg with checkmark icon
- Bulk toolbar appears at top (animated in)
- Header with count and bulk actions (duplicate, delete)

---

## 16. Buttons

### Button Types

| Type | Background | Text | Border | Use |
|------|-----------|------|--------|-----|
| Primary (filled) | `primary` | `onPrimary` | none | Main actions (FAB, Next, Save, Let's Go) |
| Secondary (outlined) | transparent | `primary` | 1dp `outline` | Alternative actions (Replace All, Remove Key) |
| Tertiary (text) | transparent | `primary` | none | Low-priority actions (Skip, Dismiss) |
| Destructive | `error` | `onError` | none | Delete, Remove |
| Cancel | `surfaceContainer` | `onBackground` | 1dp `outlineVariant` | Cancel in dialogs |

### Specific Buttons

1. **FAB (Create Prompt)**: Primary bg, add icon (xl), 56x56 circle. Animated scale 0.9→1.
2. **Copy button**: Primary bg → Success bg (2s) with checkmark feedback.
3. **Delete buttons**: Error bg (context menu, preview, categories, version history).
4. **Save buttons**: Primary bg with checkmark icon.
5. **Back buttons**: surfaceContainer bg with arrow-back, sm radius.
6. **Category/Filter pills**: Primary when selected, surfaceContainer when not.
7. **Cancel buttons**: Outlined (surfaceContainer bg, 1dp outline).
8. **Replace All**: Secondary style (outlined primary).
9. **Dismissible tertiary**: No bg, muted text.
10. **Inline action buttons (AI settings)**: Outlined (border only), 40px height.
11. **Skip (welcome)**: Tertiary, disabled color text.
12. **Next/Let's Go (welcome)**: Primary filled, flex 2 width, arrow-forward/rocket icon.

### Visual States

| State | Treatment |
|-------|-----------|
| Normal | Full color, full opacity |
| Pressed | Opacity 0.7 + background tint |
| Disabled | Opacity 0.38 (text), background still visible |
| Focused | focusRing color (same as primary) |
| Loading | ActivityIndicator replaces icon (small, matching color) |
| Selected | Primary bg + onPrimary text |
| Success (copy) | Success bg + checkmark for 2 seconds |

### Animations

- FAB: scale spring (press in 0.9, press out 1)
- All others: opacity timing (0.7 pressed)

---

## 17. Dialogs

### Bottom Sheet

**File**: `src/components/BottomSheet.tsx`

- **Implementation**: Custom from scratch (Modal + Reanimated + GestureHandler)
- **Ref API**: `present()` and `dismiss()` via `useImperativeHandle`
- **Visual**: `surfaceContainerHigh` bg, `xl` (24) top border radius, 1px top border, max 90% height
- **Handle bar**: 40x5px rounded pill (outline color)
- **Animations**:
  - Open: Spring (damping 22, stiffness 220, mass 0.9) + backdrop timing 280ms + content fade 200ms
  - Close: Spring (damping 28, stiffness 280, mass 1.0) + backdrop timing 280ms + content fade 150ms
  - Pan gesture: Dismiss if translation > 100px or velocity > 500px/s
- **Accessibility**: `reduceMotion` detection (disables animations), Android back handler
- **Backdrop**: `overlay` color (rgba(0,0,0,0.55)), tappable to dismiss

### BottomSheetContext

- Global provider wrapping a single BottomSheet instance
- `showBottomSheet(content)` and `hideBottomSheet()` via React Context
- Content set via state, opened via `requestAnimationFrame` delay

### ContextMenu (Bottom Sheet)

- Prompt header with color bar, title, meta
- Menu items: Select, Rename, Duplicate, Pin/Unpin, Favorite/Unfavorite, Save as Template
- Delete section (separated by divider)
- Delete confirmation: Nested BottomSheet with warning icon, "Are you sure?", Cancel/Delete buttons

### TemplateContextMenu (Bottom Sheet)

- Template header (icon + name + category)
- Menu items: Preview, Copy Content, Use Template
- Tag row at bottom

### ColorGridSheet / ColorPickerModal (Bottom Sheet)

- Header (palette icon + "Prompt Color")
- 2x4 color grid (8 preset colors)
- Current selection label

### VersionHistoryModal (Bottom Sheet)

- Header (clock icon + "Version History" + count)
- Version list with numbered badges
- Expanded actions: Restore (outlined primary), Delete (outlined error)
- Empty state: Clock icon + "No versions saved yet"

### EnhancedPromptSheet (Bottom Sheet)

- Header (sparkles/alert icon + title + subtitle)
- Error state: Red container + warning icon + message + "Configure API Key" button
- Success state: Scrollable preview + Replace/Insert/Copy/Dismiss buttons

### PromptPreviewContent (Bottom Sheet)

- Header (color bar + title + meta + copy button)
- Tags, markdown content box
- Footer (Delete + Edit)
- Delete confirmation: Separate Modal (not BottomSheet)

### Snackbar / Toast

**Not implemented.** No snackbar or toast system exists. Copy feedback is handled via inline button state change (green + checkmark for 2 seconds).

### Modal (Non-Bottom-Sheet)

- `PromptPreviewContent` delete confirmation uses a `Modal` with fade animation
- Centered dialog: warning icon, title, message, Cancel/Delete buttons
- `accessibilityViewIsModal` enabled

---

## 18. Motion Design

### Complete Animation Inventory

| # | Animation | Component | Duration/Curve | Trigger | Purpose |
|---|-----------|-----------|---------------|---------|---------|
| 1 | FAB scale press-in | CreatePromptFAB | 80ms timing | pressIn | Tactile feedback |
| 2 | FAB scale spring-back | CreatePromptFAB | Spring (d20/s250/m0.8) | pressOut | Release feedback |
| 3 | Tab pill slide | PillTabBar | Spring (d20/s250/m0.8) | Tab switch | Active tab indicator |
| 4 | Tab icon scale | PillTabBar | Interpolated | Tab switch | Active emphasis |
| 5 | Tab press feedback | PillTabBar | 120ms timing | pressIn/Out | Touch feedback |
| 6 | Tab bar keyboard hide | PillTabBar | Timing (translateY + opacity) | Keyboard show | Clear keyboard |
| 7 | Tab bar keyboard show | PillTabBar | Spring | Keyboard hide | Restore |
| 8 | Search bar expand | SearchBar | 225ms timing | Toggle | Reveal search input |
| 9 | Search bar collapse | SearchBar | 225ms timing | Toggle | Hide search input |
| 10 | Category wiggle | CategoryTag | withRepeat + withTiming | Reorder mode | Visual reorder cue |
| 11 | Category wiggle cancel | CategoryTag | Spring to 0 | Exit reorder | Settle |
| 12 | Bottom sheet open (sheet) | BottomSheet | Spring (d22/s220/m0.9) | present() | Slide up |
| 13 | Bottom sheet close (sheet) | BottomSheet | Spring (d28/s280/m1.0) | dismiss() | Slide down |
| 14 | Bottom sheet backdrop open | BottomSheet | 280ms timing | present() | Dim background |
| 15 | Bottom sheet backdrop close | BottomSheet | 280ms timing | dismiss() | Undim |
| 16 | Bottom sheet content fade in | BottomSheet | 200ms timing | present() | Reveal content |
| 17 | Bottom sheet content fade out | BottomSheet | 150ms timing | dismiss() | Hide content |
| 18 | Bottom sheet pan dismiss | BottomSheet | Gesture-driven | Pan gesture | Swipe to dismiss |
| 19 | Selection mode header out | Prompts screen | 200ms timing | Enter selection | Hide header |
| 20 | Selection mode toolbar in | Prompts screen | 200ms timing | Enter selection | Show bulk actions |
| 21 | Selection mode header in | Prompts screen | 200ms timing | Exit selection | Restore header |
| 22 | Selection mode toolbar out | Prompts screen | 200ms timing | Exit selection | Hide bulk actions |
| 23 | Placeholder bar enter | PlaceholderBar | FadeInDown 250ms | Placeholders detected | Reveal bar |
| 24 | Placeholder bar exit | PlaceholderBar | FadeOutUp 200ms | Placeholders removed | Hide bar |

### Shared Values

- `activeIndex` (SharedValue<number>) — Tab bar active index (0, 1, 2)
- `translateY` (SharedValue<number>) — Bottom sheet vertical position
- `backdropOpacity` (SharedValue<number>) — Bottom sheet backdrop opacity
- `contentOpacity` (SharedValue<number>) — Bottom sheet content opacity
- `scale` (SharedValue<number>) — FAB scale
- `expandProgress` (SharedValue<number>) — Search bar expand progress (0 or 1)
- `rotate` (SharedValue<number>) — Category wiggle rotation

### Micro Interactions

- Every pressable: opacity 0.7 (timing, implicit)
- Every pressable: Android ripple (built-in)
- Every pressable: Haptic feedback (Light/Medium/Heavy)
- FAB: Scale spring (80ms in, spring out)
- Tab pill: Spring slide
- Tab icon: Scale interpolation

---

## 19. Assets

### Fonts

- **None loaded.** The `assets/fonts/` directory is empty. The app uses system fonts only: system default, monospace, serif.
- `expo-font` is installed but no custom fonts are registered.

### Illustrations

- **None.** The app is entirely icon-and-text based. No illustrations, no photos, no decorative images.

### SVGs

- **None.** No SVG files. No `react-native-svg` dependency. All visuals are Ionicons or styled React Native components.

### Icons

- **Single library**: Ionicons from `@expo/vector-icons` v15.0.2
- **Icons used**: ~50 unique Ionicons (see complete list in Section 11)
- **No custom icons** — all standard Ionicons

### Images

| File | Purpose |
|------|---------|
| `assets/icon.png` | App icon |
| `assets/splash-icon.png` | Splash screen icon |
| `assets/favicon.png` | Web favicon |
| `assets/android-icon-background.png` | Android adaptive icon background |
| `assets/android-icon-foreground.png` | Android adaptive icon foreground |
| `assets/android-icon-monochrome.png` | Android monochrome icon variant |

No images are used in-app UI. All empty states use Ionicons instead of illustrations.

### Lottie

- **None.** No `.lottie` files, no `lottie-react-native` dependency.

### Logos

- The app icon (`icon.png`) and splash icon (`splash-icon.png`) serve as the brand mark
- The welcome screen renders the flash icon (`Ionicons name="flash"`) in a primary-colored circle as the logo
- No separate logo file

### Brand Assets

- **Color palette**: 14 themes with systematic color derivation
- **Icon**: Flash/bolt icon (Ionicons "flash")
- **Splash background**: `#1B211A` (forest theme background)
- **Accent colors**: 8 prompt colors (`#7FBF8B`, `#5EA8E0`, `#E08A7A`, `#B88AD9`, `#E0907A`, `#8BE9FD`, `#F1FA8C`, `#FF79C6`)

---

## 20. Responsive Design

### Phone (Primary Target)

- Portrait only (`"orientation": "portrait"` in app.json)
- All layouts designed for single-column phone use
- Safe areas respected: `SafeAreaView` with `edges={['top', 'bottom']}` on all screens
- Bottom padding accounts for FAB + tab bar

### Tablet

- **Not implemented.** No tablet-specific layouts, no breakpoint system, no adaptive columns.
- The app will render at phone width on tablets (centered or stretched).

### Landscape

- **Not supported.** App is locked to portrait orientation.

### Scaling

- **Not implemented.** No `Dimensions` API usage for responsive scaling (except `welcome.tsx` which uses `Dimensions.get('window')` for decorative circles).
- Font sizes are fixed constants.
- No `useWindowDimensions` for layout adaptation (except `BottomSheet.tsx` for screen height).

### Safe Areas

- `SafeAreaView` with `edges={['top', 'bottom']}` on all screens
- `useSafeAreaInsets()` used for FAB positioning and tab bar padding
- Bottom sheet respects safe area via `useSafeAreaInsets()`

### Foldables

- **Not implemented.** No foldable-specific handling.

---

## 21. Accessibility

### Screen Readers

- Every interactive element has `accessibilityRole` and `accessibilityLabel`
- `accessibilityHint` provided for non-obvious actions (e.g., "Tap to preview, long press for options")
- `accessibilityState` includes `selected`, `checked`, `disabled` as appropriate
- Bottom sheet has `accessibilityLabel="Drag to dismiss"` on handle area

### Dynamic Fonts

- **Not implemented.** Font sizes are fixed constants. No `allowFontScaling` configuration. No Dynamic Type / text scaling support.

### Touch Targets

- 48dp minimum enforced via `TOUCH_TARGET` constant
- `hitSlop={8}` on small icon buttons to expand touch area
- All buttons and interactive elements meet the minimum

### Contrast

- Token derivation ensures text contrast:
  - `onBackground`: Raw text color (high contrast)
  - `onSurfaceVariant`: 68% opacity (reduced contrast for secondary text)
  - `disabled`: 38% opacity (low contrast for disabled)
  - `onPrimary`/`onError`: Auto-contrast via luminance calculation (white or near-black)
- All themes tested via WCAG contrast ratio calculations in `deriveTokens()`

### Focus

- `focusRing` token exists (same as primary color) but is NOT visually implemented anywhere
- No custom focus indicators
- Default browser/OS focus behavior

### Accessibility Labels

Every interactive element has descriptive labels:
- `"Create new prompt"` (FAB)
- `"Delete prompt"` (delete buttons)
- `"Exit selection mode"` (close button in selection)
- `"Skip onboarding"` (skip button)
- `"Drag to dismiss"` (bottom sheet handle)
- `"Switch to {label} tab"` (tab bar hints)
- Progress bar: `accessibilityRole="progressbar"`, `accessibilityValue={{ now, min, max }}`

### Reduced Motion

- Detected via `AccessibilityInfo.isReduceMotionEnabled()`
- Listened for runtime changes via `AccessibilityInfo.addEventListener('reduceMotionChanged')`
- When enabled: Spring animations replaced with instant state changes, timing animations replaced with instant values
- Implemented in `BottomSheet.tsx`

---

## 22. Localization

### Languages

- **English only.** All UI strings are hardcoded in English. No i18n library (no `react-intl`, no `i18next`, no `expo-localization`).

### RTL

- **Implemented.** `detectRTL(text)` in `src/utils/rtl.ts` detects Arabic, Hebrew, Persian, and other RTL Unicode ranges
- Used in editor and placeholder-edit screens for `textAlign: 'right'`
- PromptCard reverses tag row direction for RTL content
- No full app RTL layout support (only text-level RTL)

### Formatting

- Date formatting is custom (relative time: "Just now", "Xm ago", "Xh ago", "Xd ago")
- No locale-aware number formatting
- No locale-aware date formatting

### Translation Architecture

**Not implemented.** All strings are inline English. No translation system, no string externalization, no translation files.

---

## 23. Performance

### Memoization

- `useCallback` used in some components (FAB, tab bar)
- `useMemo` used for FAB bottom position calculation
- **Not used** in most components (PromptCard, TemplateCard, list items)
- No `React.memo` on any component

### Virtualization

- `FlatList` used for prompts and templates lists (built-in virtualization)
- `ScrollView` used in editor and settings (no virtualization)
- `draggableFlatlist` for category reorder

### Caching

- Theme tokens cached in `themeCache` object (prevents re-derivation)
- No image caching (no images in-app)
- No query caching (no network requests except AI enhancement)

### Image Optimization

- **N/A** — No images used in-app UI
- App icons are static assets loaded by Expo

### Rendering Optimization

- New Architecture enabled (improved bridgeless rendering)
- Reanimated runs animations on UI thread (no JS thread blocking)
- Gesture Handler runs on native thread
- No heavy computed values in render paths

### Startup Optimization

- Sequential loading (settings → prompts)
- `SplashScreen.preventAutoHideAsync()` to prevent premature splash hide
- Splash hidden only after data loaded
- SystemUI background color synced after ready
- No lazy imports or code splitting

---

## 24. Code Architecture

### Patterns

1. **File-based routing** — Expo Router convention: `app/` directory = navigation tree
2. **Zustand stores** — 4 stores with flat action structure (no middleware, no slices)
3. **Provider pattern** — ThemeProvider, BottomSheetContext
4. **Ref API** — BottomSheet exposes `present()`/`dismiss()` via `useImperativeHandle`
5. **Factory pattern** — AI provider registry with `getProvider(id)`
6. **Singleton pattern** — `apiKeyStorage` singleton instance

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useTheme` | `src/theme/useTheme.ts` | Theme context consumer |
| `useEnhance` | `src/hooks/useEnhance.ts` | AI prompt enhancement flow |
| `useHistoryState` | `src/hooks/useHistory.ts` | Undo/redo history (useReducer) |

### Services

| Service | File | Purpose |
|---------|------|---------|
| `getProvider()` | `src/services/ai/provider.ts` | AI provider factory |
| `apiKeyStorage` | `src/services/storage/apiKeyStorage.ts` | API key persistence |
| GroqProvider | `src/services/ai/groq.ts` | Groq API integration |
| OpenAIProvider | `src/services/ai/openai.ts` | Stub |
| DeepSeekProvider | `src/services/ai/deepseek.ts` | Stub |
| GeminiProvider | `src/services/ai/gemini.ts` | Stub |
| ClaudeProvider | `src/services/ai/claude.ts` | Stub |

### Utilities

| Utility | File | Purpose |
|---------|------|---------|
| `detectPlaceholders` | `src/utils/placeholders.ts` | Regex placeholder detection |
| `replacePlaceholdersByIndex` | `src/utils/placeholders.ts` | Placeholder replacement |
| `getTextStats` | `src/utils/tokenCounter.ts` | Char/word/token/line counting |
| `detectRTL` | `src/utils/rtl.ts` | RTL text detection |

### Feature Modules

- **Prompts**: `promptStore` + `PromptCard` + `ContextMenu` + editor
- **Templates**: `templates.ts` (data) + `TemplateCard` + `TemplateContextMenu`
- **AI Enhancement**: `aiStore` + `useEnhance` + AI providers + `EnhancedPromptSheet`
- **Categories**: `promptStore` (categories) + `CategoryTag` + `categories.tsx`
- **Placeholders**: `placeholderEditStore` + `PlaceholderBar` + `placeholder-edit.tsx`
- **Settings**: `settingsStore` + settings screens

### Dependency Flow

```
app/* (screens)
  → src/components/* (UI)
  → src/stores/* (state)
  → src/theme/* (styling)
  → src/hooks/* (logic)
  → src/services/* (external)
  → src/constants/* (tokens)
  → src/types/* (types)
  → src/utils/* (pure functions)
```

Components depend on stores, theme, constants. Stores depend on AsyncStorage. Services are isolated. Utils are pure functions with no dependencies.

---

## 25. Current UX Flow

### Complete User Journey

```
App Launch
  ↓
Native Splash Screen (splash-icon.png on #1B211A background)
  ↓
React Initialization (ThemeProvider loads theme from AsyncStorage)
  ↓
RootLayoutInner (loads settings + prompts from AsyncStorage)
  ↓
Loading State (ActivityIndicator on theme background)
  ↓
SplashScreen.hideAsync()
  ↓
Navigation Decision (routes to /(tabs) — NO guard checks hasOnboarded)
  ↓
Prompts Tab (home screen)
  │
  ├── Search bar (expandable)
  ├── Category filter chips
  ├── Prompt list (FlatList of PromptCards)
  ├── FAB (create new prompt)
  │
  ├── Tap prompt card → Editor
  │   ├── Edit title/content
  │   ├── Select category
  │   ├── Placeholder quick-fill
  │   ├── Find/replace
  │   ├── AI enhance
  │   ├── Version history
  │   ├── Copy to clipboard
  │   └── Back → Prompts tab
  │
  ├── Long-press prompt → Context menu
  │   ├── Rename / Duplicate / Pin / Favorite
  │   ├── Save as template
  │   ├── Select (bulk mode)
  │   └── Delete (with confirmation)
  │
  ├── FAB → New prompt → Editor
  │
  ├── Pull to refresh
  │
  └── Tap "Manage Categories" → Categories screen
      ├── Add / Edit / Delete categories
      └── Back → Prompts tab
  │
Templates Tab
  ├── Search + filter
  ├── Tap template → Preview bottom sheet
  │   ├── "Use in my own prompts"
  │   ├── Category confirmation
  │   └── → Editor
  └── Long-press → Context menu (Preview, Copy, Use)
  │
Settings Tab
  ├── Appearance → Theme picker (14 themes, follow system)
  ├── Typography → Font size + family
  ├── Options → Token count toggle
  ├── AI Enhancement → Provider config + API keys + system prompt
  ├── Categories → Category management
  └── About → App info
```

---

## 26. Visual Identity

### Brand Personality

Prompt Forge positions itself as a **premium, focused productivity tool** — not a playful or consumer app. The brand personality is:

- **Professional** — Clean layouts, no decorative chrome, systematic design tokens
- **Dark-first** — Default dark themes signal a tool for extended use
- **Technical** — Monospace font options, token counting, placeholder syntax
- **Calm** — Muted color palettes, no harsh contrasts, subtle animations

### Visual Consistency

- **Excellent.** All screens use the same token system, same spacing, same typography scale, same component patterns.
- The `useTheme()` hook is used in every screen and component.
- No raw hex values in component code (enforced by convention).

### Interaction Language

- **Consistent.** Every interactive element follows the same pattern:
  - `android_ripple` for Material touch feedback
  - `accessibilityRole` + `accessibilityLabel` for screen readers
  - `hitSlop={8}` for expanded touch areas
  - `style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}` for pressed feedback
  - `Haptics.impactAsync()` for haptic feedback

### Overall Quality

- **High for an MVP.** The design system is well-thought-out with systematic color derivation, consistent tokens, and comprehensive accessibility support.
- **Weaknesses**: No illustrations, no custom fonts, no Lottie animations, no rich empty states, no onboarding guard.

### Professional Level

- **Intermediate-Professional.** The token system and component patterns suggest professional-grade architecture, but the lack of illustrations, custom fonts, and animation polish keeps it from premium tier.

---

## 27. Current Limitations

### Architectural Limitations

1. **No onboarding guard** — `welcome.tsx` exists but nothing redirects new users to it
2. **All AsyncStorage** — No database, no relational data, no migrations. All data serialized to JSON blobs.
3. **Single-platform** — Android only, no iOS build configuration
4. **No tests** — Zero test coverage, no test infrastructure
5. **No custom fonts** — All typography uses system fonts only
6. **No illustrations** — Empty states use icons, not illustrations
7. **No animations library** — No Lottie, no After Effects exports, no animated illustrations
8. **Hardcoded English** — No internationalization infrastructure
9. **Fixed font sizes** — No Dynamic Type / accessibility font scaling
10. **No network layer** — AI is the only network operation (no caching, no offline queue)
11. **No image support** — Prompts are text-only, no image attachments
12. **No sharing** — No share sheet integration
13. **No widgets** — No home screen widgets
14. **No biometrics** — No Face ID / fingerprint for API key protection
15. **No backup** — No cloud sync, no export/import
16. **No analytics** — No crash reporting, no usage analytics
17. **All data in AsyncStorage** — Performance degrades with many prompts (full JSON serialization on every save)
18. **Single-file screens** — Some screens (prompts: 860 lines, editor: 589 lines) could benefit from component extraction
19. **No error boundaries** — No React error boundary implementation
20. **No deep linking** — `expo-linking` installed but no URL scheme configuration

### UI Limitations

1. **No animated transitions between screens** — Only `simple_push` animation
2. **No skeleton loading** — Only spinner and pull-to-refresh
3. **No shimmer/skeleton placeholders** — Empty states are static
4. **No gesture-based navigation** — No swipe-back, no edge swipe
5. **No drag-and-drop for prompts** — Only categories support drag reorder
6. **No multi-select animation** — Selection appears without smooth transition
7. **No haptic patterns** — Only simple impacts, no custom haptic patterns

---

## 28. Opportunities

### Improvements Without Breaking Existing Architecture

1. **Add onboarding guard** — Check `hasOnboarded` in `_layout.tsx` and redirect to `/welcome`
2. **Add custom fonts** — Register fonts via `expo-font` and `useFonts()` hook
3. **Add illustrations** — SVG or PNG illustrations for empty states, welcome screen, about screen
4. **Add Lottie animations** — Loading states, success animations, empty state illustrations
5. **Add skeleton loading** — Replace ActivityIndicator with skeleton placeholders
6. **Add screen transitions** — Custom transitions for modal-style screens
7. **Add gesture navigation** — Swipe-back on iOS, edge swipe for navigation
8. **Add haptic patterns** — Custom haptic sequences for special interactions
9. **Add export/import** — JSON export/import for prompt backup
10. **Add sharing** — Share prompt as text via system share sheet
11. **Add search highlighting** — Highlight matching text in search results
12. **Add drag-and-drop for prompts** — Reorder prompts within categories
13. **Add multi-select animation** — Smooth transition when entering/exit selection mode
14. **Add error boundaries** — Catch and display React errors gracefully
15. **Add analytics** — Basic usage analytics (Expo Analytics or custom)
16. **Add dynamic font scaling** — Respect system font size preferences
17. **Add rich empty states** — Illustrated empty states with CTAs
18. **Add onboarding illustrations** — Custom illustrations for each onboarding step
19. **Add micro-animations** — Entry animations for list items, staggered loading
20. **Add toast/snackbar system** — Reusable notification component for feedback

---

## 29. New Screen Integration Guide

### How to Add a New Screen

1. **Create the screen file** in `app/` (for top-level) or `app/settings/` (for settings sub-screen):
   ```tsx
   // app/new-screen.tsx
   export default function NewScreen() { ... }
   ```

2. **It auto-registers** — Expo Router picks up the file automatically. No manual route registration needed.

3. **Navigation**: Use `useRouter()` from `expo-router`:
   ```tsx
   const router = useRouter();
   router.push('/new-screen');        // Push onto stack
   router.replace('/new-screen');     // Replace current
   router.back();                     // Go back
   ```

4. **Theme**: Use `useTheme()` hook:
   ```tsx
   const { theme, mode } = useTheme();
   const c = theme.color;
   // Use c.primary, c.background, c.onBackground, etc.
   ```

5. **Safe Areas**: Wrap in `SafeAreaView`:
   ```tsx
   <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
   ```

6. **Status Bar**: Already handled by root layout (auto-switches based on theme mode)

7. **Animations**: Use `react-native-reanimated`:
   ```tsx
   import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
   ```

8. **Gestures**: Use `react-native-gesture-handler`:
   ```tsx
   import { Gesture, GestureDetector } from 'react-native-gesture-handler';
   ```

9. **Haptics**: Use `expo-haptics`:
   ```tsx
   import { hapticLight, hapticMedium, hapticHeavy } from '../src/constants/haptics';
   ```

10. **Components**: Import from `src/components/`:
    ```tsx
    import { BaseCard } from '../src/components/cards';
    import { BottomSheet } from '../src/components/BottomSheet';
    ```

11. **Constants**: Import from `src/constants/`:
    ```tsx
    import { SPACING, RADIUS, TYPOGRAPHY, ICON_SIZE, TOUCH_TARGET } from '../src/constants';
    ```

12. **Accessibility**: Follow the pattern:
    ```tsx
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Descriptive text"
      accessibilityHint="What this does"
      accessibilityState={{ disabled: false }}
      android_ripple={{ color: c.onBackground + '14' }}
      hitSlop={8}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
    ```

13. **Performance**:
    - Use `FlatList` for long lists (not `ScrollView`)
    - Memoize callbacks with `useCallback`
    - Use Reanimated shared values for animations (UI thread)

14. **Bottom Sheet**: Use the global context:
    ```tsx
    const { showBottomSheet, hideBottomSheet } = useBottomSheetContext();
    showBottomSheet(<MySheetContent />);
    ```

15. **Android Back Button**: Handle with `BackHandler`:
    ```tsx
    useEffect(() => {
      const handler = BackHandler.addEventListener('hardwareBackPress', () => { ... return true; });
      return () => handler.remove();
    }, []);
    ```

---

## 30. Splash Screen Recommendations

> **Note**: These are recommendations only. No implementation.

### Current Splash Screen

- **Native splash** via `expo-splash-screen`
- **Image**: `splash-icon.png` (contain mode)
- **Background**: `#1B211A` (forest theme background, hardcoded)
- **No animation** — static image
- **No theme awareness** — always uses forest background regardless of active theme
- **No transition** — jumps to ActivityIndicator loading state, then to app

### Ideal Splash Screen Recommendations

#### Layout

- **Centered brand mark**: Flash/bolt icon (the app's identity) centered both horizontally and vertically
- **App name**: "Prompt Forge" below the icon
- **Tagline**: Optional "Craft perfect AI prompts" below the name
- **Background**: Match the active theme's `background` color (not hardcoded forest)
- **Safe areas**: Respect top and bottom safe areas

#### Branding

- **Logo**: Use the same flash/bolt icon as the app icon, rendered at 64-80dp
- **App name**: TYPOGRAPHY.heading (22/600) or TYPOGRAPHY.title (28/700) for the brand name
- **Color**: Primary color for the icon, onBackground for the text
- **Consistency**: Match the visual identity of the welcome screen logo (primary circle + flash icon)

#### Animation

- **Recommended approach**: Use `expo-splash-screen` `SplashScreen.preventAutoHideAsync()` (already implemented) and add a React-native-reanimated powered entrance:
  - Icon: Fade in + scale from 0.8 to 1.0 (spring animation, 600ms)
  - App name: Fade in + translateY from 10 to 0 (spring, 800ms delay)
  - Tagline: Fade in (timing, 400ms, 1200ms delay)
- **Duration**: 1.5-2.5 seconds total (aligned with data loading)
- **Alternative**: Lottie animation for the flash/bolt icon (pulsing, sparkling)
- **Avoid**: Overly complex animations that delay the user from reaching the app

#### Startup Timing

- **Current timing**: Splash → ActivityIndicator (loading) → App
- **Recommended**: Splash (with animation) → App (no intermediate ActivityIndicator)
- **Implementation**: Move the loading logic into the splash screen itself, hide splash only when fully ready
- **Critical**: `SplashScreen.preventAutoHideAsync()` is already called — the splash stays visible until explicitly hidden

#### Transition

- **From splash to app**: Fade transition (opacity 1 → 0 over 300ms) as splash hides
- **From splash to welcome**: If first launch, smooth crossfade to welcome screen
- **From splash to home**: If returning user, smooth crossfade to home screen

#### Theme Support

- **Dynamic background**: Use the active theme's `background` color (not hardcoded `#1B211A`)
- **Implementation**: Load theme from AsyncStorage before showing splash, or use the default theme for splash and crossfade to actual theme
- **Dark/Light awareness**: Splash should adapt to the user's theme preference
- **Fallback**: If theme cannot be loaded, use forest (default)

#### Technical Constraints

- Must use `expo-splash-screen` API (already a dependency)
- Must call `SplashScreen.preventAutoHideAsync()` at module level
- Must call `SplashScreen.hideAsync()` when ready
- Native splash cannot be animated (only static image + background color)
- All animation must happen AFTER the native splash hides (in React layer)
- Consider using `expo-splash-screen` with `animated: true` option if available in SDK 57

---

## 31. Welcome / Onboarding Recommendations

> **Note**: These are recommendations only. No implementation.

### Current Onboarding

- **4 steps**: Write Better Prompts, Quick Fill Placeholders, Copy & Go, Stay Organized
- **Layout**: Centered content with decorative background circles
- **No illustrations** — uses Ionicons for step icons
- **No animations** — step transitions are instant (no crossfade)
- **No navigation guard** — unreachable on first launch
- **No gestures** — buttons only (no swipe)
- **Dot indicators**: Animate width (active=24, inactive=8)

### Ideal Onboarding Recommendations

#### Number of Pages

- **3-4 pages** (current 4 is appropriate)
- Each page should introduce ONE core concept
- Suggested flow:
  1. **Welcome / Brand** — Logo, app name, "Craft perfect AI prompts"
  2. **Create & Organize** — Categories, colors, tags, pin/favorite
  3. **AI Enhancement** — One-tap prompt improvement
  4. **Ready to Start** — CTA to begin

#### Navigation

- **Horizontal swipe** between pages (gesture-based, not button-only)
- **Dots indicator** at bottom showing current page
- **Skip button** (top-right or bottom-left, tertiary style)
- **Next/Done button** (bottom, primary filled)
- **Auto-advance option**: Consider auto-advancing after a delay on the first page only

#### Gestures

- **Horizontal swipe**: `react-native-gesture-handler` `Pan` gesture or `ScrollView` with `pagingEnabled`
- **Swipe threshold**: 50px minimum or 500px/s velocity
- **Spring animation**: For page snap (damping: 20, stiffness: 250)
- **Haptic feedback**: Light impact on page change

#### Illustrations

- **Custom illustrations** for each step (not just icons)
- **Style**: Minimal, line-art or flat illustrations matching the theme's primary color
- **Format**: SVG (via `react-native-svg`) or Lottie animations
- **Suggestion**: Flash/bolt motif, document/editor metaphors, color palette visualization
- **Size**: 120-160dp illustrations, centered above text
- **Animation**: Subtle entrance (fade + scale) when page becomes active

#### Buttons

- **Skip**: Tertiary style (no bg, muted text), top-right or bottom-left
- **Next**: Primary filled, bottom-right, with arrow-forward icon
- **Get Started / Let's Go**: Primary filled, full-width, bottom, with rocket or checkmark icon
- **Height**: TOUCH_TARGET + 8 (56dp)
- **Width**: Next = flex 1 or fixed width; Get Started = full width
- **Haptics**: Light on Next, Success notification on Get Started

#### Progress Indicators

- **Horizontal dots**: Centered at bottom, above buttons
- **Active dot**: Primary color, 24dp wide (current approach is good)
- **Inactive dots**: surfaceContainerHigh, 8dp wide
- **Alternative**: Animated progress bar (thin line at top, primary color, animates width)
- **Accessibility**: `accessibilityRole="progressbar"`, `accessibilityValue={{ now, min, max }}` (already implemented)

#### Animations

- **Page transitions**: Animated horizontal scroll with spring snapping
- **Content entrance**: Staggered fade-in + translateY for illustration, title, description
- **Illustration**: Subtle scale pulse or Lottie animation
- **Dots**: Spring-animated width change (already implemented)
- **Button entrance**: Fade-in + translateY from bottom (200ms delay after page settles)
- **Completion**: Success haptic + scale animation on "Get Started" press

#### Layout

```
SafeAreaView (edges: ['top', 'bottom'])
  ├── Skip button (top-right, absolute)
  ├── Page content (centered, flex 1)
  │   ├── Illustration (120-160dp, centered)
  │   ├── Title (TYPOGRAPHY.heading, centered)
  │   └── Description (TYPOGRAPHY.body, centered, max 300dp width)
  ├── Dots indicator (centered, marginBottom 24)
  └── Buttons row (horizontal, paddingHorizontal 32)
      ├── Skip (flex 1, tertiary) [hidden on last page]
      └── Next / Get Started (flex 2, primary)
```

#### Content Hierarchy

1. **Illustration**: Largest visual element, immediately communicates the concept
2. **Title**: TYPOGRAPHY.heading (22/600), centered, primary or onBackground color
3. **Description**: TYPOGRAPHY.body (16/400), centered, onSurfaceVariant color, max 2 lines
4. **Progress dots**: Below content, above buttons
5. **Actions**: At bottom, clear visual hierarchy (primary button dominant)

#### Theme Support

- **Full theme integration**: Use `useTheme()` hook for all colors
- **Dynamic illustrations**: Illustrations should adapt to light/dark mode
- **Background**: Use theme's `background` color (not hardcoded)
- **Decorative elements**: Use `primary + '08'` or `primaryLight` for subtle accents
- **Consistency**: Match the visual language of the rest of the app

#### HCI Considerations

1. **Progressive disclosure**: Each page reveals one concept, not overwhelming
2. **Recognition over recall**: Use icons + text, not text-only descriptions
3. **Consistency**: Same button patterns, same typography, same spacing as the app
4. **Feedback**: Haptic on every interaction, visual feedback on button press
5. **Accessibility**: Full screen reader support, reduced motion support
6. **Error prevention**: Skip button clearly visible, no accidental navigation
7. **Efficiency**: Allow users to skip entirely (current Skip button is good)
8. **Visibility**: Clear progress indicator showing how many pages remain
9. **User control**: User controls pace (no auto-advance, no time pressure)
10. **First-use success**: "Get Started" should navigate to a screen where the user can immediately take action (Prompts tab with FAB highlighted)

#### Navigation Guard (Critical)

The welcome screen MUST be reachable on first launch. Implementation:
- In `app/_layout.tsx`, after loading settings, check `settings.hasOnboarded`
- If `false`, set `Stack` initial route to `/welcome`
- If `true`, set `Stack` initial route to `/(tabs)`
- This is the single most important fix for the onboarding flow

#### Technical Implementation Notes

- Use `expo-router`'s `Stack.Screen` options for initial route selection
- Store `hasOnboarded` in `settingsStore` (already exists)
- Persist to AsyncStorage (already implemented in settingsStore)
- Consider adding a "Reset Onboarding" option in Settings > About for testing

---

*End of specification.*
