<div align="center">

# Prompt Forge

A powerful, beautifully designed prompt management app built with React Native & Expo.

[![Version](https://img.shields.io/badge/version-1.2.2-blue.svg)](https://github.com/MehranQadirian/prompt-forge)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-orange.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.0-61DAFB.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-57-000020.svg)](https://expo.dev)

</div>

---

## Highlights

| | |
|---|---|
| 14 Premium Themes | 7 dark + 7 light hand-crafted themes with full design token systems |
| AI-Powered Enhancement | Enhance prompts with Groq, OpenAI, DeepSeek, Gemini, or Claude |
| Native Feel | Smooth gestures, haptic feedback, and fluid animations |
| Offline-First | All data stored locally — your prompts never leave your device |

---

## Features

### Prompt Management
- Create, edit, and organize prompts with titles, content, categories, and tags
- Version history — track every change and restore previous versions
- Pin and favorite prompts for quick access
- Color-code prompts for visual organization
- Drag-and-drop reordering
- Animated expand/collapse for prompt previews with scrollable content
- RTL language support

### AI Enhancement
- Enhance prompts with AI-powered suggestions
- Multiple AI provider support:
  - **Groq** — Fast inference with Llama models
  - **OpenAI** — GPT-4 and GPT-3.5
  - **DeepSeek** — Cost-effective alternative
  - **Google Gemini** — Multimodal capabilities
  - **Anthropic Claude** — Advanced reasoning
- Configurable system prompts for AI enhancement
- Skeleton loading animation during enhancement
- Token count display

### Swipe Actions
- Customizable swipe-left and swipe-right actions on prompt cards
- Actions: Edit, Duplicate, Pin, Favorite, Delete
- Smooth gesture-driven animations with react-native-reanimated
- Rubber band elastic drag (iOS-style)
- Haptic feedback on threshold crossing

### Templates
- 30+ built-in prompt templates across categories
- Save custom prompts as templates
- Browse and preview templates before use
- Category-based color coding with dark/light theme adaptation
- Markdown rendering in template previews

### Design System
- **14 theme variants** with full design tokens
  - **Dark:** Forest, Midnight, Carbon, Plum, Ember, Dracula, Mono
  - **Light:** Paper, Sky, Sage, Rose, Latte, Lavender, Snow
- System-follow mode for automatic light/dark switching
- Consistent typography, spacing, and color system
- Material Design 3 inspired components

### Editor
- Full-featured prompt editor
- Placeholder management for dynamic prompts (`[variable]` / `{variable}`)
- Find and replace functionality
- Undo/redo support
- Consistent toolbar styling

### Splash Screen
- Custom animated splash screen with smooth entrance/exit transitions
- Shows before app content loads (no flash of unstyled content)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.86.0 | Cross-platform framework |
| Expo | ~57.0.0 | Development platform |
| React | 19.2.3 | UI library |
| TypeScript | ~5.8.3 | Type safety |
| Zustand | ^5.0.0 | State management |
| react-native-reanimated | 4.5.0 | Animations |
| react-native-gesture-handler | ~2.32.0 | Gesture handling |
| expo-router | ~57.0.4 | File-based routing |
| AsyncStorage | 2.2.0 | Local persistence |

---

## Getting Started

### Prerequisites
- **Node.js** 18+
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** or **Xcode** for native builds

### Installation

```bash
git clone https://github.com/MehranQadirian/prompt-forge.git
cd prompt-forge
npm install
npx expo start
```

### Running

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios

# Web
npx expo start --web
```

### Building APK

```bash
# Development build
npx expo prebuild --clean
npx expo run:android

# Production build (EAS)
eas build --platform android --profile production

# APK build (for testing)
eas build --platform android --profile preview
```

---

## Project Structure

```
prompt-forge/
├── app/                        # Expo Router pages
│   ├── (tabs)/                 # Tab navigation
│   │   ├── index.tsx           # Prompts list
│   │   ├── templates.tsx       # Templates browser
│   │   └── _layout.tsx         # Tab bar configuration
│   ├── editor.tsx              # Prompt editor
│   ├── categories.tsx          # Category management
│   ├── settings/               # App settings
│   │   ├── about.tsx           # About page
│   │   ├── ai.tsx              # AI provider config
│   │   ├── appearance.tsx      # Theme selection
│   │   ├── developer.tsx       # Developer info
│   │   └── options.tsx         # Swipe action config
│   └── welcome.tsx             # Onboarding screen
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── cards/              # Card components
│   │   ├── BottomSheet.tsx     # Animated bottom sheet
│   │   ├── MarkdownRenderer.tsx # Markdown rendering
│   │   ├── PillTabBar.tsx      # Floating tab bar
│   │   └── SplashOverlay.tsx   # Splash screen
│   ├── stores/                 # Zustand state management
│   ├── theme/                  # Theme system (14 variants)
│   ├── services/ai/            # AI provider implementations
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   ├── constants/              # App constants
│   └── utils/                  # Utility functions
├── assets/                     # Static assets
├── android/                    # Native Android project
├── ios/                        # Native iOS project
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── CHANGES.txt                 # Changelog
```

---

## Theming

Prompt Forge includes **14 hand-crafted themes** with full design token systems:

| Dark Themes | Light Themes |
|---|---|
| Forest | Paper |
| Midnight | Sky |
| Carbon | Sage |
| Plum | Rose |
| Ember | Latte |
| Dracula | Lavender |
| Mono | Snow |

Each theme provides tokens for surface colors, text colors, semantic colors, borders, and state indicators. Template cards use category-based colors that adapt to dark/light themes.

---

## Changelog

See [CHANGES.txt](CHANGES.txt) for the full changelog.

**Recent highlights:**
- **v1.2.3** — Some bugs fixed
- **v1.2.2** — Fixed about page update checker, markdown rendering for release notes
- **v1.2.1** — Fixed swipe actions, bidirectional swipes, rubber band drag, accessibility
- **v1.2.0** — Template card colors, animated previews, improved tab switching

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Developer

**Mehran Ghadirian** — [@MehranQadirian](https://github.com/MehranQadirian)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
