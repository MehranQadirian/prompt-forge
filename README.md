<div align="center">

# ⚡ Prompt Forge

**A powerful, beautifully designed prompt management app built with React Native & Expo**

[![Version](https://img.shields.io/badge/version-1.2.2-blue.svg)](https://github.com/MehranQadirian/prompt-forge)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-orange.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.0-61DAFB.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-57-000020.svg)](https://expo.dev)

</div>

---

<div align="center">

### 🌐 Language / زبان

**[English](#english)** | **[فارسی](#persian)**

</div>

---

<a id="english"></a>
<details open>
<summary><h2>🇬🇧 English</h2></summary>

<br>

## ✨ Highlights

| | |
|---|---|
| 🎨 **14 Premium Themes** | 7 dark + 7 light hand-crafted themes with full design token systems |
| 🤖 **AI-Powered Enhancement** | Enhance prompts with Groq, OpenAI, DeepSeek, Gemini, or Claude |
| 📱 **Native Feel** | Smooth gestures, haptic feedback, and fluid animations |
| 🔒 **Offline-First** | All data stored locally — your prompts never leave your device |

---

## 🚀 Features

### 📝 Prompt Management
- ✅ Create, edit, and organize prompts with titles, content, categories, and tags
- ✅ **Version history** — track every change and restore previous versions
- ✅ Pin and favorite prompts for quick access
- ✅ Color-code prompts for visual organization
- ✅ Drag-and-drop reordering
- ✅ Animated expand/collapse for prompt previews with scrollable content
- ✅ RTL language support (Arabic, Persian, Hebrew, etc.)

### 🤖 AI Enhancement
- ✅ Enhance prompts with AI-powered suggestions
- ✅ Multiple AI provider support:
  - **Groq** — Fast inference with Llama models
  - **OpenAI** — GPT-4 and GPT-3.5
  - **DeepSeek** — Cost-effective alternative
  - **Google Gemini** — Multimodal capabilities
  - **Anthropic Claude** — Advanced reasoning
- ✅ Configurable system prompts for AI enhancement
- ✅ Skeleton loading animation during enhancement
- ✅ Token count display

### 👆 Swipe Actions
- ✅ Customizable swipe-left and swipe-right actions on prompt cards
- ✅ Actions: Edit, Duplicate, Pin, Favorite, Delete
- ✅ Smooth gesture-driven animations with react-native-reanimated
- ✅ Rubber band elastic drag (iOS-style)
- ✅ Haptic feedback on threshold crossing

### 📚 Templates
- ✅ 30+ built-in prompt templates across categories
- ✅ Save custom prompts as templates
- ✅ Browse and preview templates before use
- ✅ Category-based color coding with dark/light theme adaptation
- ✅ Markdown rendering in template previews

### 🎨 Design System
- ✅ **14 theme variants** with full design tokens
  - 🌙 **Dark:** Forest, Midnight, Carbon, Plum, Ember, Dracula, Mono
  - ☀️ **Light:** Paper, Sky, Sage, Rose, Latte, Lavender, Snow
- ✅ System-follow mode for automatic light/dark switching
- ✅ Consistent typography, spacing, and color system
- ✅ Material Design 3 inspired components

### ✏️ Editor
- ✅ Full-featured prompt editor
- ✅ Placeholder management for dynamic prompts (`[variable]` / `{variable}`)
- ✅ Find and replace functionality
- ✅ Undo/redo support
- ✅ Consistent toolbar styling

### 🎬 Splash Screen
- ✅ Custom animated splash screen with smooth entrance/exit transitions
- ✅ Shows before app content loads (no flash of unstyled content)

---

## 🛠 Tech Stack

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

## 🏁 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** or **Xcode** for native builds

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

## 📁 Project Structure

```
prompt-forge/
├── app/                        # Expo Router pages
│   ├── (tabs)/                 # Tab navigation (Prompts, Templates, Settings)
│   │   ├── index.tsx           # Home / Prompts list
│   │   ├── templates.tsx       # Templates browser
│   │   └── _layout.tsx         # Tab bar configuration
│   ├── editor.tsx              # Prompt editor
│   ├── categories.tsx          # Category management
│   ├── settings/               # App settings
│   │   ├── about.tsx           # About page with update checker
│   │   ├── ai.tsx              # AI provider configuration
│   │   ├── appearance.tsx      # Theme selection
│   │   ├── developer.tsx       # Developer info
│   │   └── options.tsx         # Swipe action configuration
│   └── welcome.tsx             # Onboarding screen
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── cards/              # Card components
│   │   │   ├── BaseCard.tsx    # Base pressable card
│   │   │   ├── PromptCard.tsx  # Prompt list card
│   │   │   ├── SwipeCard.tsx   # Gesture-driven swipe wrapper
│   │   │   └── SwipeActionRow.tsx # Swipe action buttons
│   │   ├── BottomSheet.tsx     # Animated bottom sheet
│   │   ├── ContextMenu.tsx     # Context menu
│   │   ├── MarkdownRenderer.tsx # Markdown rendering
│   │   ├── PillTabBar.tsx      # Floating tab bar
│   │   ├── SearchBar.tsx       # Animated search bar
│   │   └── SplashOverlay.tsx   # Splash screen
│   ├── stores/                 # Zustand state management
│   │   ├── promptStore.ts      # Prompt data & CRUD
│   │   ├── templateStore.ts    # Template data
│   │   ├── settingsStore.ts    # App settings
│   │   ├── aiStore.ts          # AI provider state
│   │   └── swipeStore.ts       # Swipe coordination
│   ├── theme/                  # Theme system
│   │   ├── tokens.ts           # Design tokens + 14 color palettes
│   │   ├── useTheme.ts         # Theme hook
│   │   └── ThemeProvider.tsx   # Theme context provider
│   ├── services/               # External services
│   │   └── ai/                 # AI provider implementations
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── constants/              # App constants & haptics
│   └── utils/                  # Utility functions
├── assets/                     # Static assets (icons, splash)
├── android/                    # Native Android project
├── ios/                        # Native iOS project
├── app.json                    # Expo configuration
├── package.json                # Dependencies & scripts
└── CHANGES.txt                 # Full changelog
```

---

## 🎨 Theming

Prompt Forge includes **14 hand-crafted themes** with full design token systems:

| Dark Themes | Light Themes |
|---|---|
| 🌲 Forest | 📄 Paper |
| 🌙 Midnight | 🌤 Sky |
| ⬛ Carbon | 🌿 Sage |
| 🟣 Plum | 🌹 Rose |
| 🔥 Ember | ☕ Latte |
| 🧛 Dracula | 💜 Lavender |
| ⚫ Mono | ❄️ Snow |

Each theme provides tokens for:
- Surface colors (background, container, elevated)
- Text colors (primary, secondary, disabled)
- Semantic colors (primary, error, success, warning)
- Border and outline colors
- State indicators (pressed, focused, disabled)

Template cards use **category-based colors** that automatically adapt to dark/light themes.

---

## 📋 Changelog

See [CHANGES.txt](CHANGES.txt) for the full changelog.

**Recent highlights:**
- **v1.2.2** — Fixed about page update checker, markdown rendering for release notes
- **v1.2.1** — Fixed swipe actions, bidirectional swipes, rubber band drag, accessibility
- **v1.2.0** — Template card colors, animated previews, improved tab switching

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 👨‍💻 Developer

**Mehran Ghadirian**

- GitHub: [@MehranQadirian](https://github.com/MehranQadirian)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## ⭐ Star History

If you find Prompt Forge useful, please give it a star on GitHub! It helps others discover the project.

</details>

---

<a id="persian"></a>
<details>
<summary><h2>🇮🇷 فارسی</h2></summary>

<br>

<div dir="rtl">

## ✨ ویژگی‌های برجسته

| | |
|---|---|
| 🎨 **۱۴ تم پریمیوم** | ۷ تم تاریک + ۷ تم روشن با سیستم توکن کامل |
| 🤖 **بهبود با هوش مصنوعی** | پرامپت‌ها را با Groq، OpenAI، DeepSeek، Gemini یا Claude بهبود دهید |
| 📱 **حس بومی** | حرکات روان، بازخورد لمسی و انیمیشن‌های流畅 |
| 🔒 **آفلاین** | تمام داده‌ها محلی ذخیره می‌شوند — پرامپت‌های شما هرگز دستگاه را ترک نمی‌کنند |

---

## 🚀 امکانات

### 📝 مدیریت پرامپت
- ✅ ایجاد، ویرایش و سازماندهی پرامپت‌ها با عنوان، محتوا، دسته‌بندی و برچسب
- ✅ **تاریخچه نسخه** — هر تغییر را ردیابی کنید و نسخه‌های قبلی را بازیابی کنید
- ✅ سنجاق کردن و علاقه‌مندی پرامپت‌ها برای دسترسی سریع
- ✅ رنگ‌بندی پرامپت‌ها برای سازماندهی بصری
- ✅ مرتب‌سازی با کشیدن و رها کردن
- ✅ باز/بسته شدن انیمیشنی برای پیش‌نمایش پرامپت‌ها با محتوای قابل اسکرول
- ✅ پشتیبانی از زبان‌های راست به چپ (عربی، فارسی، عبری و غیره)

### 🤖 بهبود با هوش مصنوعی
- ✅ بهبود پرامپت‌ها با پیشنهادات هوش مصنوعی
- ✅ پشتیبانی از ارائه‌دهندگان هوش مصنوعی:
  - **Groq** — استنتاج سریع با مدل‌های Llama
  - **OpenAI** — GPT-4 و GPT-3.5
  - **DeepSeek** — جایگزین مقرون‌به‌صرفه
  - **Google Gemini** — قابلیت‌های چندوجهی
  - **Anthropic Claude** — استدلال پیشرفته
- ✅ پرامپت‌های سیستم قابل پیکربندی برای بهبود هوش مصنوعی
- ✅ انیمیشن اسکلتون در حین بهبود
- ✅ نمایش تعداد توکن

### 👆 اعمال کشیدن (Swipe)
- ✅ اعمال سفارشی کشیدن به چپ و راست روی کارت پرامپت‌ها
- ✅ اعمال: ویرایش، تکثیر، سنجاق، علاقه‌مندی، حذف
- ✅ انیمیشن‌های روان حرکتی با react-native-reanimated
- ✅ کشیدن کشسان (سبک iOS)
- ✅ بازخورد لمسی عبور از آستانه

### 📚 قالب‌ها
- ✅ بیش از ۳۰ قالب پرامپت آماده در دسته‌بندی‌های مختلف
- ✅ ذخیره پرامپت‌های سفارشی به عنوان قالب
- ✅ مرور و پیش‌نمایش قالب‌ها قبل از استفاده
- ✅ رنگ‌بندی بر اساس دسته‌بندی با سازگاری تم تاریک/روشن
- ✅ رندرینگ مارک‌داون در پیش‌نمایش قالب‌ها

### 🎨 سیستم طراحی
- ✅ **۱۴ تم** با توکن‌های طراحی کامل
  - 🌙 **تاریک:** Forest, Midnight, Carbon, Plum, Ember, Dracula, Mono
  - ☀️ **روشن:** Paper, Sky, Sage, Rose, Latte, Lavender, Snow
- ✅ حالت پیروی از سیستم برای تغییر خودکار تاریک/روشن
- ✅ تایپوگرافی، فاصله‌گذاری و سیستم رنگ سازگار
- ✅ کامپوننت‌های الهام‌گرفته از Material Design 3

### ✏️ ویرایشگر
- ✅ ویرایشگر پرامپت با امکانات کامل
- ✅ مدیریت پلیس‌های نگهداری برای پرامپت‌های پویا (`[متغیر]` / `{متغیر}`)
- ✅ جستجو و جایگزینی
- ✅ پشتیبانی از بازگشت/بازانجام
- ✅ استایل نوار ابزار سازگار

### 🎬 صفحه شروع
- ✅ صفحه شروع انیمیشنی سفارشی با انتقال ورود/خروج روان
- ✅ قبل از بارگذاری محتوای برنامه نمایش داده می‌شود (بدون فلاش)

---

## 🛠 فناوری‌های استفاده شده

| فناوری | نسخه | کاربرد |
|---|---|---|
| React Native | 0.86.0 | چارچوب چندپلتفرمی |
| Expo | ~57.0.0 | پلتفرم توسعه |
| React | 19.2.3 | کتابخانه رابط کاربری |
| TypeScript | ~5.8.3 | ایمنی تایپ |
| Zustand | ^5.0.0 | مدیریت وضعیت |
| react-native-reanimated | 4.5.0 | انیمیشن‌ها |
| react-native-gesture-handler | ~2.32.0 | مدیریت حرکات |
| expo-router | ~57.0.4 | مسیریابی مبتنی بر فایل |
| AsyncStorage | 2.2.0 | ذخیره‌سازی محلی |

---

## 🏁 شروع سریعع

### پیش‌نیازها
- **Node.js** 18+
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** یا **Xcode** برای ساخت بومی

### نصب

```bash
# کلون کردن مخزن
git clone https://github.com/MehranQadirian/prompt-forge.git
cd prompt-forge

# نصب وابستگی‌ها
npm install

# شروع سرور توسعه
npx expo start
```

### اجرا

```bash
# اندروید
npx expo run:android

# iOS
npx expo run:ios

# وب
npx expo start --web
```

### ساخت APK

```bash
# ساخت توسعه
npx expo prebuild --clean
npx expo run:android

# ساخت تولید (EAS)
eas build --platform android --profile production

# ساخت APK (برای تست)
eas build --platform android --profile preview
```

---

## 📁 ساختار پروژه

```
prompt-forge/
├── app/                        # صفحات Expo Router
│   ├── (tabs)/                 # ناوبری تب (پرامپت‌ها، قالب‌ها، تنظیمات)
│   │   ├── index.tsx           # صفحه اصلی / لیست پرامپت‌ها
│   │   ├── templates.tsx       # مرورگر قالب‌ها
│   │   └── _layout.tsx         # پیکربندی نوار تب
│   ├── editor.tsx              # ویرایشگر پرامپت
│   ├── categories.tsx          # مدیریت دسته‌بندی
│   ├── settings/               # تنظیمات برنامه
│   │   ├── about.tsx           # صفحه درباره با بررسی به‌روزرسانی
│   │   ├── ai.tsx              # پیکربندی ارائه‌دهنده هوش مصنوعی
│   │   ├── appearance.tsx      # انتخاب تم
│   │   ├── developer.tsx       # اطلاعات توسعه‌دهنده
│   │   └── options.tsx         # پیکربندی اعمال کشیدن
│   └── welcome.tsx             # صفحه راهنمای شروع
├── src/
│   ├── components/             # کامپوننت‌های UI قابل استفاده مجدد
│   │   ├── cards/              # کامپوننت‌های کارت
│   │   │   ├── BaseCard.tsx    # کارت پایه قابل فشار
│   │   │   ├── PromptCard.tsx  # کارت لیست پرامپت
│   │   │   ├── SwipeCard.tsx   # بسته حرکتی کشیدن
│   │   │   └── SwipeActionRow.tsx # دکمه‌های عمل کشیدن
│   │   ├── BottomSheet.tsx     # صفحه پایین انیمیشنی
│   │   ├── ContextMenu.tsx     # منوی زمینه
│   │   ├── MarkdownRenderer.tsx # رندرینگ مارک‌داون
│   │   ├── PillTabBar.tsx      # نوار تب شناور
│   │   ├── SearchBar.tsx       # نوار جستجوی انیمیشنی
│   │   └── SplashOverlay.tsx   # صفحه شروع
│   ├── stores/                 # مدیریت وضعیت Zustand
│   │   ├── promptStore.ts      # داده و CRUD پرامپت
│   │   ├── templateStore.ts    # داده قالب‌ها
│   │   ├── settingsStore.ts    # تنظیمات برنامه
│   │   ├── aiStore.ts          # وضعیت ارائه‌دهنده هوش مصنوعی
│   │   └── swipeStore.ts       # هماهنگ‌سازی کشیدن
│   ├── theme/                  # سیستم تم
│   │   ├── tokens.ts           # توکن‌های طراحی + ۱۴ پالت رنگ
│   │   ├── useTheme.ts         # هوک تم
│   │   └── ThemeProvider.tsx   # ارائه‌دهنده زمینه تم
│   ├── services/               # سرویس‌های خارجی
│   │   └── ai/                 # پیاده‌سازی ارائه‌دهندگان هوش مصنوعی
│   ├── hooks/                  # هوک‌های سفارشی React
│   ├── types/                  # تعریف تایپ‌های TypeScript
│   ├── constants/              # ثابت‌ها و بازخورد لمسی
│   └── utils/                  # توابع کمکی
├── assets/                     # دارایی‌های ثابت (آیکون‌ها، شروع)
├── android/                    # پروژه بومی اندروید
├── ios/                        # پروژه بومی iOS
├── app.json                    # پیکربندی Expo
├── package.json                # وابستگی‌ها و اسکریپت‌ها
└── CHANGES.txt                 # تاریخچه تغییرات کامل
```

---

## 🎨 پوشش‌ها (تم‌ها)

Prompt Forge شامل **۱۴ تم دست‌ساز** با سیستم توکن کامل طراحی است:

| تم‌های تاریک | تم‌های روشن |
|---|---|
| 🌲 Forest (جنگل) | 📄 Paper (کاغذ) |
| 🌙 Midnight (نیمه‌شب) | 🌤 Sky (آسمان) |
| ⬛ Carbon (کربن) | 🌿 Sage (مریم‌گلی) |
| 🟣 Plum (آلو) | 🌹 Rose (گل سرخ) |
| 🔥 Ember (آتش) | ☕ Latte (لاتیه) |
| 🧛 Dracula (ドラacula) | 💜 Lavender (اسطوخودوس) |
| ⚫ Mono (تک‌رنگ) | ❄️ Snow (برف) |

هر تم توکن‌هایی برای ارائه می‌دهد:
- رنگ‌های سطح (پس‌زمینه، کانتینر، بالا)
- رنگ‌های متن (اصلی، ثانویه، غیرفعال)
- رنگ‌های معنایی (اصلی، خطا، موفقیت، هشدار)
- رنگ‌های حاشیه و خطوط
- نشانگرهای وضعیت (فشرده، متمرکز، غیرفعال)

کارت‌های قالب از **رنگ‌های مبتنی بر دسته‌بندی** استفاده می‌کنند که به طور خودکار با تم تاریک/روشن سازگار می‌شوند.

---

## 📋 تاریخچه تغییرات

برای مشاهده تاریخچه کامل به [CHANGES.txt](CHANGES.txt) مراجعه کنید.

**نکات برجسته اخیر:**
- **v1.2.2** — رفع مشکل بررسی به‌روزرسانی صفحه درباره، رندرینگ مارک‌داون برای یادداشت‌های انتشار
- **v1.2.1** — رفع اعمال کشیدن، کشیدن دوجهته، کشیدن کشسان، دسترسی‌پذیری
- **v1.2.0** — رنگ‌های کارت قالب، پیش‌نمایش‌های انیمیشنی، بهبود سوئیچ تب

---

## 🤝 مشارکت

مشارکت شما خوش آمدید! نحوه کمک:

1. **فورک** کنید مخزن را
2. **ایجاد** کنید شاخه ویژگی (`git checkout -b feature/amazing-feature`)
3. **کامیت** کنید تغییرات خود را (`git commit -m 'Add amazing feature'`)
4. **پوش** کنید به شاخه (`git push origin feature/amazing-feature`)
5. **باز کنید** یک Pull Request

---

## 👨‍💻 توسعه‌دهنده

**مهران قاضی‌نیان**

- GitHub: [@MehranQadirian](https://github.com/MehranQadirian)

---

## 📄 مجوز

این پروژه تحت **مجوز MIT** است — جزئیات را در فایل [LICENSE](LICENSE) مشاهده کنید.

---

## ⭐ ستاره‌ها

اگر Prompt Forge را مفید می‌دانید، لطفاً آن را در GitHub ستاره دهید! این به دیگران کمک می‌کند پروژه را کشف کنند.

</div>

</details>

---

<div align="center">

Made with ❤️ by [Mehran Ghadirian](https://github.com/MehranQadirian)

</div>
