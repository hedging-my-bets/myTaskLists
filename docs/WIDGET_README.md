
# PetProgress iOS Widget - v1 Implementation

This document provides a complete overview of the iOS Home Screen widget implementation for PetProgress.

## 🎯 Overview

PetProgress v1 includes iOS Home Screen widgets that allow users to:
- View their current task and pet stage at a glance
- Complete, skip, or miss tasks directly from the widget
- Navigate between tasks without opening the app
- See automatic hourly updates respecting grace periods

## 📱 Widget Sizes

### Small Widget (systemSmall)
- **Display**: Pet emoji + current hour
- **Action**: Tap anywhere to complete current task
- **Use Case**: Quick glance and one-tap completion

### Medium Widget (systemMedium)
- **Display**: Pet emoji, task title, hour, stage number
- **Actions**: 5 buttons (Previous, Complete, Miss, Skip, Next)
- **Use Case**: Full task management from Home Screen

## 🏗️ Architecture

### Technology Stack
- **WidgetKit**: Apple's widget framework
- **SwiftUI**: UI rendering
- **AppIntents**: Timeline provider (iOS 17+)
- **App Groups**: Data sharing
- **Deep Links**: Widget actions

### Data Flow

```
React Native App
    ↓
AsyncStorage + App Group
    ↓
Widget Timeline Provider
    ↓
Widget Views
    ↓
Deep Link Actions
    ↓
React Native App
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Xcode 15.0+
- iOS 17.0+ target
- Expo CLI
- EAS CLI (for production builds)

### 2. Install Dependencies

The required package is already in `package.json`:
```json
"@bacons/apple-targets": "^3.0.2"
```

### 3. Prebuild

Generate the native iOS project with widget target:

```bash
npx expo prebuild --platform ios --clean
```

This creates:
- `ios/` directory with native project
- `PetProgressWidget` target
- App Groups configuration
- Entitlements setup

### 4. Open in Xcode

```bash
open ios/PetProgress.xcworkspace
```

### 5. Verify Configuration

**Main App Target:**
1. Select `PetProgress` target
2. Go to "Signing & Capabilities"
3. Verify "App Groups" is enabled
4. Check `group.com.petprogress.app` is listed

**Widget Target:**
1. Select `PetProgressWidget` target
2. Repeat steps 2-4

### 6. Build and Run

**Development:**
```bash
npx expo run:ios
```

**Production:**
```bash
eas build --platform ios --profile production
```

## 📂 File Structure

```
PetProgress/
├── app.json                          # Expo config with widget target
├── targets/
│   └── PetProgressWidget/
│       ├── PetProgressWidget.swift   # Widget implementation
│       ├── Info.plist                # Widget config
│       ├── WidgetBridge.swift        # Native bridge
│       └── WidgetBridge.m            # Bridge header
├── shared/
│   └── WidgetStateStore.ts           # State management
├── modules/
│   └── WidgetBridge.ts               # TypeScript bridge
├── navigation/
│   └── deeplinks.ts                  # Deep link handlers
└── docs/
    ├── WIDGET_IMPLEMENTATION.md      # Technical details
    ├── WIDGET_SETUP_GUIDE.md         # Setup guide
    └── WIDGET_README.md              # This file
```

## 🎨 Design

### Color Palette (Bright-Trust Dark)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Blue | `#0B1220` |
| Card | Slate | `#121826` |
| Text Primary | White | `#FFFFFF` |
| Text Muted | Gray | `#A8B1C7` |
| Primary | Blue | `#60A5FA` |
| Secondary | Cyan | `#22D3EE` |
| Success | Green | `#22C55E` |
| Warning | Yellow | `#FBBF24` |
| Error | Red | `#F87171` |
| Accent | Purple | `#A78BFA` |

### Layout

**Small Widget:**
```
┌─────────────┐
│             │
│     🐉      │
│             │
│   14:00     │
│             │
│ Tap to      │
│ complete    │
└─────────────┘
```

**Medium Widget:**
```
┌──────────────────────────────┐
│  🐉    Review code           │
│        14:00 • Stage 28      │
│                              │
│  ◀  ✓  ✕  →  ▶             │
└──────────────────────────────┘
```

## 🔗 Deep Links

### URL Scheme
`petprogress://`

### Actions

| Action | URL | Effect | XP Change |
|--------|-----|--------|-----------|
| Complete | `petprogress://complete` | Mark task done | +10 XP |
| Skip | `petprogress://skip` | Skip task | 0 XP |
| Miss | `petprogress://miss` | Mark missed | -10 to -30 XP (level-scaled) |
| Next | `petprogress://next` | Next task | 0 XP |
| Previous | `petprogress://prev` | Previous task | 0 XP |

### Implementation

**Swift (Widget):**
```swift
Link(destination: URL(string: "petprogress://complete")!) {
    Image(systemName: "checkmark")
}
```

**TypeScript (App):**
```typescript
import * as Linking from 'expo-linking';

Linking.addEventListener('url', ({ url }) => {
  handleDeepLink(url);
});
```

## ⏰ Timeline & Refresh

### Refresh Strategy

1. **Hourly Boundaries**: Widget refreshes at each hour + grace minutes
2. **After Actions**: Explicit reload after deep link actions
3. **System-Managed**: iOS may adjust frequency based on usage

### Grace Period

The grace period (0-30 minutes) allows tasks to remain "current" briefly into the next hour.

**Example with 15-minute grace:**
- Task due at 14:00
- Remains current until 15:15
- Widget refreshes at 15:15

### Timeline Calculation

```swift
func nextBoundaryConsideringGrace(_ now: Date, graceMinutes: Int) -> Date {
    let calendar = Calendar.current
    let currentMinutes = calendar.component(.minute, from: now)
    
    if currentMinutes < graceMinutes {
        // Boundary is at end of grace this hour
        return calendar.date(bySettingHour: calendar.component(.hour, from: now), 
                           minute: graceMinutes, second: 0, of: now)!
    } else {
        // Boundary is at start of next hour + grace
        let next = calendar.date(byAdding: .hour, value: 1, to: now)!
        return calendar.date(bySettingHour: calendar.component(.hour, from: next),
                           minute: graceMinutes, second: 0, of: next)!
    }
}
```

## 🐉 Pet Evolution

### 30 Stages

1. Egg → 2. Chicken → 3. Weasel → 4. Badger → 5. Hawk → 6. Barracuda → 7. Coyote → 8. Wild Boar → 9. Wolf → 10. Crocodile → 11. Mako Shark → 12. Great White Shark → 13. Orca → 14. Bison → 15. Bull → 16. Stallion → 17. Grizzly Bear → 18. Polar Bear → 19. Rhinoceros → 20. Hippopotamus → 21. Elephant → 22. Silver Back Gorilla → 23. Cape Buffalo → 24. Lion → 25. Komodo Dragon → 26. Eagle → 27. Phoenix → 28. Dragon → 29. Human CEO → 30. Golden CEO

### XP System

**Gain:**
- Complete task: +10 XP

**Penalty (level-scaled):**
```
penalty(level) = 1 + 2*(level−1)/29
```

- Level 1: 1× penalty (10 XP lost)
- Level 15: 2× penalty (20 XP lost)
- Level 30: 3× penalty (30 XP lost)

### De-evolution

When XP drops below current stage threshold, pet de-evolves to appropriate stage.

## 🔄 State Synchronization

### Widget State Structure

```typescript
interface WidgetState {
  todayTasks: Task[];
  currentIndex: number;
  petState: PetState;
  graceMinutes: number;
  lastRolloverAt: string;
  lastUpdated: number;
}
```

### Sync Points

State is synced after:
- Task completion/skip/miss
- Task navigation
- Rollover at midnight
- Settings changes
- App launch

### Implementation

```typescript
import { syncWidgetState, requestWidgetReload } from '@/shared/WidgetStateStore';

// After state change
await syncWidgetState(
  tasks,
  currentTaskIndex,
  petState,
  settings,
  lastRolloverDate
);

// Request widget reload
await requestWidgetReload();
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Small widget displays correctly
- [ ] Medium widget displays correctly
- [ ] Tap actions trigger deep links
- [ ] Widget updates after actions
- [ ] Hourly refresh works
- [ ] Grace period is respected
- [ ] Pet evolution displays correctly
- [ ] Task navigation works
- [ ] XP changes reflect in widget
- [ ] Rollover updates widget
- [ ] "No tasks" state displays
- [ ] Colors match design

### Testing Deep Links

Use Safari to test deep links:
```
petprogress://complete
petprogress://skip
petprogress://miss
petprogress://next
petprogress://prev
```

### Debugging

**View Widget Logs:**
1. Open Xcode
2. Run app on device/simulator
3. Open Console app
4. Filter by "PetProgress"

**Check Shared Data:**
```swift
let sharedDefaults = UserDefaults(suiteName: "group.com.petprogress.app")
let state = sharedDefaults?.string(forKey: "@PetProgress:widgetState")
print(state ?? "No state")
```

## 🚀 Deployment

### Development Build

```bash
eas build --platform ios --profile development
```

### Production Build

```bash
eas build --platform ios --profile production
```

### App Store Submission

```bash
eas submit --platform ios
```

## 🔮 Future Enhancements (v2)

### Interactive Widgets

Replace deep links with App Intents for true in-widget actions:

```swift
Button(intent: CompleteTaskIntent()) {
    Image(systemName: "checkmark")
}

struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    
    func perform() async throws -> some IntentResult {
        // Execute action directly in widget
        // No need to open app
    }
}
```

### Additional Features

- Lock Screen widgets (inline, circular, rectangular)
- Live Activities for task streaks
- StandBy mode support
- Widget configuration options
- Multiple widget instances with different task lists

## 📚 Resources

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Intents Documentation](https://developer.apple.com/documentation/appintents)
- [Timeline Management](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)
- [App Groups Guide](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)
- [Expo Apple Targets](https://github.com/EvanBacon/expo-apple-targets)

## 🐛 Troubleshooting

### Widget Not Appearing

**Solution:**
1. Verify App Groups are configured
2. Check bundle identifiers match
3. Rebuild app completely
4. Restart device

### Widget Not Updating

**Solution:**
1. Check `syncWidgetState()` is called
2. Verify shared UserDefaults access
3. Check widget logs in Console
4. Force reload: `WidgetCenter.shared.reloadAllTimelines()`

### Deep Links Not Working

**Solution:**
1. Verify URL scheme in `app.json`
2. Check deep link handlers
3. Test with Safari
4. Check app is registered for scheme

### Build Errors

**Solution:**
1. Clean build: ⌘⇧K
2. Delete derived data
3. Run `npx expo prebuild --clean`
4. Update Xcode

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review Xcode console logs
3. Check React Native logs
4. Verify widget state in AsyncStorage

## ✅ Success Criteria

v1 is complete when:
- ✓ Widgets display on Home Screen
- ✓ Deep link actions work
- ✓ Hourly refresh respects grace period
- ✓ Pet evolution displays correctly
- ✓ State syncs between app and widget
- ✓ Color palette matches design
- ✓ All 30 pet stages work
- ✓ Level-scaled penalties apply
- ✓ Rollover logic functions correctly
