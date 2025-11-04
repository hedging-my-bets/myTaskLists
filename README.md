
# PetProgress - iPhone Habits with an Evolving Pet

PetProgress turns your iPhone Home Screen into a habit control panel. Track hourly tasks, watch your pet evolve with XP, and stay motivated with visual progress—all without opening the app.

## ✨ Features

### 🏠 Home Screen Widget
- **Small Widget**: Quick glance at current task and pet
- **Medium Widget**: Full control panel with 5 action buttons
- **Hourly Updates**: Automatically refreshes at hour boundaries
- **Deep Links**: Tap buttons to complete, skip, or navigate tasks

### 🐣 Pet Evolution System
- **30 Stages**: Egg → Chicken → ... → Dragon → CEO → Golden CEO
- **25 XP per Task**: Earn experience by completing tasks
- **Progressive Thresholds**: Steady 100 XP increments per stage (100, 200, 300... 3000)
- **Level-Scaled Penalties**: Miss penalties scale from 1× to 3× as you level up
- **Visual Progress**: Watch your pet evolve in real-time

### ⏰ Smart Task Management
- **Hourly Tasks**: Schedule tasks for specific hours
- **Anytime Tasks**: Flexible tasks without time constraints
- **Recurring Tasks**: Set up daily, weekly, or custom patterns
- **Grace Period**: Configurable 0-30 minute grace window
- **Midnight Rollover**: Automatic task reset with XP penalties for missed tasks

### 🎨 Beautiful Design
- **Bright-Trust Dark Theme**: High-contrast dark mode optimized for readability
- **Smooth Animations**: Polished transitions and haptic feedback
- **Clean UI**: Minimalist design that stays out of your way
- **Consistent Colors**: Unified palette across app and widget

## 🚀 Quick Start

### Prerequisites
- macOS with Xcode installed
- iOS device or simulator running iOS 17.0+
- Node.js and npm/pnpm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Prebuild for iOS**
   ```bash
   npx expo prebuild -p ios --clean
   ```

3. **Build and run**
   ```bash
   npx expo run:ios
   ```

4. **Add widget to Home Screen**
   - Launch the app once
   - Long-press on Home Screen
   - Tap "+" button
   - Search "PetProgress"
   - Select widget size and add

**Important**: You must use a native dev client (`expo run:ios`). Expo Go does NOT support widgets.

## 📱 How It Works

### Widget Actions

**Small Widget:**
- Tap anywhere to complete the current task

**Medium Widget:**
- **← Previous**: Navigate to previous task
- **✓ Complete**: Award 25 XP, mark task as done
- **✕ Miss**: Apply XP penalty, mark task as missed
- **→ Skip**: Mark task as skipped (no XP change)
- **→ Next**: Navigate to next task

### Task Lifecycle

1. **Create Tasks**: Add tasks in the Calendar tab with specific times or "anytime"
2. **Track Progress**: Widget shows the current task based on time of day
3. **Take Action**: Complete, skip, or miss tasks directly from the widget
4. **Earn XP**: Gain 25 XP for each completed task
5. **Watch Evolution**: Pet evolves as you cross XP thresholds
6. **Midnight Rollover**: Undone tasks become "missed" and apply XP penalties

### XP System

- **Gain**: +25 XP per completed task
- **Loss**: Level-scaled penalty for missed tasks
  - Level 1: 1× penalty (25 XP)
  - Level 15: 2× penalty (50 XP)
  - Level 30: 3× penalty (75 XP)
- **Evolution**: Pet evolves when XP crosses stage thresholds
- **De-evolution**: Pet can de-evolve if XP drops below current stage

## 🎯 Pet Stages

The pet evolution system uses a **progressive XP model** with 30 stages. Each stage requires 100 more XP than the previous one, creating a steady, predictable climb from Egg to Legendary.

| Stage | Name | XP Required | Tasks Needed* |
|-------|------|-------------|---------------|
| 0 | Egg 🥚 | 0 | 0 |
| 1 | Chicken 🐔 | 100 | 4 |
| 2 | Weasel 🦡 | 200 | 8 |
| 3 | Badger 🦡 | 300 | 12 |
| 4 | Hawk 🦅 | 400 | 16 |
| 5 | Barracuda 🐟 | 500 | 20 |
| 6 | Coyote 🐺 | 600 | 24 |
| 7 | Wild Boar 🐗 | 700 | 28 |
| 8 | Wolf 🐺 | 800 | 32 |
| 9 | Crocodile 🐊 | 900 | 36 |
| 10 | Mako Shark 🦈 | 1,000 | 40 |
| 11 | Great White Shark 🦈 | 1,100 | 44 |
| 12 | Orca 🐋 | 1,200 | 48 |
| 13 | Bison 🦬 | 1,300 | 52 |
| 14 | Bull 🐂 | 1,400 | 56 |
| 15 | Stallion 🐴 | 1,500 | 60 |
| 16 | Grizzly Bear 🐻 | 1,600 | 64 |
| 17 | Polar Bear 🐻‍❄️ | 1,700 | 68 |
| 18 | Rhinoceros 🦏 | 1,800 | 72 |
| 19 | Hippopotamus 🦛 | 1,900 | 76 |
| 20 | Elephant 🐘 | 2,000 | 80 |
| 21 | Silver Back Gorilla 🦍 | 2,100 | 84 |
| 22 | Cape Buffalo 🐃 | 2,200 | 88 |
| 23 | Lion 🦁 | 2,300 | 92 |
| 24 | Komodo Dragon 🦎 | 2,400 | 96 |
| 25 | Eagle 🦅 | 2,500 | 100 |
| 26 | Phoenix 🔥 | 2,600 | 104 |
| 27 | Dragon 🐉 | 2,700 | 108 |
| 28 | Human CEO 👔 | 2,800 | 112 |
| 29 | Golden CEO 👑 | 2,900 | 116 |
| 30 | Legendary ⭐ | 3,000 | 120 |

*Tasks needed assumes 25 XP per task with no misses

### Progressive XP Model

The evolution system uses a **linear progression** where each stage requires exactly 100 more XP than the previous stage:

- **Stage 1**: 100 XP (4 tasks)
- **Stage 2**: 200 XP (8 tasks total)
- **Stage 10**: 1,000 XP (40 tasks total)
- **Stage 20**: 2,000 XP (80 tasks total)
- **Stage 30**: 3,000 XP (120 tasks total)

This creates a balanced progression where:
- Early stages feel achievable (4-8 tasks)
- Mid-game maintains momentum (40-80 tasks)
- Late game provides long-term goals (100-120 tasks)
- Maximum level is reachable with consistent daily habits

## 🛠️ Technical Details

### Architecture
- **React Native + Expo 54**: Cross-platform mobile framework
- **WidgetKit**: Native iOS widget implementation
- **App Groups**: Shared storage between app and widget
- **Deep Links**: URL scheme for widget actions
- **Timeline Provider**: Hourly widget updates

### Key Technologies
- **@bacons/apple-targets**: Expo plugin for native widget targets
- **SwiftUI**: Widget UI implementation
- **UserDefaults**: App Group shared storage
- **AppIntentTimelineProvider**: iOS 17+ timeline management
- **React Native Reanimated**: Smooth animations

### File Structure
```
PetProgress/
├── app/                          # React Native app screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── (home)/              # Home screen
│   │   ├── calendar.tsx         # Task management
│   │   └── settings.tsx         # Settings
│   └── _layout.tsx              # Root layout
├── targets/                      # Native widget code
│   ├── widget/
│   │   └── expo-target.config.js
│   └── PetProgressWidget/
│       ├── PetProgressWidget.swift
│       ├── WidgetBridge.swift
│       └── WidgetBridge.m
├── shared/                       # Shared state management
│   └── WidgetStateStore.ts
├── constants/                    # Configuration
│   └── petStages.ts             # 30-stage progressive system
├── styles/                       # Design system
│   └── commonStyles.ts          # Bright-Trust palette
└── docs/                         # Documentation
    ├── WIDGET_COMPLETE_SETUP.md
    ├── WIDGET_TROUBLESHOOTING.md
    └── WIDGET_STATUS.md
```

## 🎨 Color Palette

**Bright-Trust (Dark)**
- Background: `#0B1220` - Deep blue-black
- Card: `#121826` - Elevated surface
- Text: `#FFFFFF` - Pure white
- Text Secondary: `#A8B1C7` - Muted blue-gray
- Primary: `#60A5FA` - Brand blue
- Success: `#22C55E` - Bright green
- Error: `#F87171` - Red
- Warning: `#FBBF24` - Amber

## 📚 Documentation

- **[Complete Setup Guide](docs/WIDGET_COMPLETE_SETUP.md)** - Detailed setup instructions
- **[Troubleshooting Guide](docs/WIDGET_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Implementation Status](docs/WIDGET_STATUS.md)** - Technical implementation details
- **[Quick Reference](docs/WIDGET_QUICK_REFERENCE.md)** - Quick command reference

## 🐛 Troubleshooting

### Widget doesn't appear
- Make sure you built with `expo run:ios`, not Expo Go
- Launch the app at least once
- Restart the simulator/device

### Widget shows "No tasks"
- Add tasks in the Calendar tab
- Make sure tasks have a due hour set
- Check console logs for state sync

### Widget doesn't update
- Verify App Group entitlements in Xcode
- Check that both app and widget have the same App Group
- Try removing and re-adding the widget

See [WIDGET_TROUBLESHOOTING.md](docs/WIDGET_TROUBLESHOOTING.md) for more solutions.

## ✅ Implementation Status

- ✅ Widget target generation via Expo
- ✅ App Group configuration for shared state
- ✅ Deep link action handlers
- ✅ Timeline provider with hourly refresh
- ✅ App Group storage (UserDefaults)
- ✅ 30-stage progressive evolution system (100→3000 XP)
- ✅ Bright-Trust dark color palette
- ✅ Level-scaled miss penalties
- ✅ Widget reload after actions
- ✅ Grace minutes support
- ✅ Small and Medium widget families

**Overall Completion: 100%** 🎉

## 🎉 Ready for Production

Your PetProgress widget implementation is complete and production-ready. All P0 (blocking), P1 (functional), and P2 (quality) issues have been resolved.

Just run:
```bash
npx expo prebuild -p ios --clean
npx expo run:ios
```

Then add the widget to your Home Screen and start tracking your tasks!

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Widget support via [@bacons/apple-targets](https://github.com/EvanBacon/expo-apple-targets)
- Icons from [SF Symbols](https://developer.apple.com/sf-symbols/)

---

**Made with ❤️ for habit-driven people who value glanceable, actionable progress.**
