# Prompt Forge

A powerful, beautifully designed prompt management app built with React Native and Expo. Create, organize, enhance, and manage your AI prompts with a premium native feel.

## Features

### Prompt Management
- Create, edit, and organize prompts with titles, content, categories, and tags
- Version history — track every change and restore previous versions
- Pin and favorite prompts for quick access
- Color-code prompts for visual organization
- Drag-and-drop reordering

### AI Enhancement
- Enhance prompts with AI-powered suggestions
- Multiple AI provider support (Groq, OpenAI-compatible APIs)
- Configurable system prompts for AI enhancement
- Token count display

### Swipe Actions
- Customizable swipe-left and swipe-right actions on prompt cards
- Actions: Edit, Duplicate, Pin, Favorite, Delete
- Smooth gesture-driven animations with react-native-reanimated

### Templates
- Built-in prompt templates across categories
- Save custom prompts as templates
- Browse and preview templates before use

### Design System
- 14 theme variants (7 dark, 7 light) with full design tokens
- System-follow mode for automatic light/dark switching
- Consistent typography, spacing, and color system
- RTL language support

### Editor
- Full-featured prompt editor
- Placeholder management for dynamic prompts
- Find and replace functionality
- Markdown rendering
- Undo/redo support

## Tech Stack

| Technology | Version |
|---|---|
| React Native | 0.86.0 |
| Expo | ~57.0.0 |
| React | 19.2.3 |
| TypeScript | ~5.8.3 |
| Zustand | ^5.0.0 |
| react-native-reanimated | 4.5.0 |
| react-native-gesture-handler | ~2.32.0 |
| expo-router | ~57.0.4 |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode for native builds

### Installation

```bash
# Clone the repository
git clone https://github.com/MehranQadirian/prompt-forge.git
cd prompt-forge

# Install dependencies
npm install

# Start the development server
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

## Project Structure

```
prompt-forge/
├── app/                    # Expo Router pages
│   ├── (tabs)/             # Tab navigation
│   ├── editor.tsx          # Prompt editor
│   ├── categories.tsx      # Category management
│   ├── settings/           # App settings
│   └── welcome.tsx         # Onboarding
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── cards/          # Card components (BaseCard, PromptCard, SwipeCard)
│   │   ├── BottomSheet.tsx # Bottom sheet component
│   │   ├── ContextMenu.tsx # Context menu
│   │   └── ...             # More components
│   ├── stores/             # Zustand state management
│   │   ├── promptStore.ts  # Prompt data store
│   │   ├── settingsStore.ts# App settings store
│   │   ├── aiStore.ts      # AI provider store
│   │   └── swipeStore.ts   # Swipe state store
│   ├── theme/              # Theme system
│   │   ├── tokens.ts       # 14 theme variants with design tokens
│   │   └── ThemeProvider.tsx
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # App constants and utilities
│   ├── services/           # AI and external services
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── assets/                 # Static assets
└── app.json               # Expo configuration
```

## Theming

Prompt Forge includes 14 hand-crafted themes with full design token systems:

**Dark themes:** Forest, Midnight, Carbon, Plum, Ember, Dracula, Mono
**Light themes:** Paper, Sky, Sage, Rose, Latte, Lavender, Snow

Each theme provides tokens for surfaces, text, borders, semantic colors, and state indicators.

## License

MIT License - see [LICENSE](LICENSE) for details.
