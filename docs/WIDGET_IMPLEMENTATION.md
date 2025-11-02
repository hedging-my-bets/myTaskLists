
# Widget Implementation Guide

This document describes the iOS home screen widget implementation for PetProgress.

## Overview

PetProgress supports two widget sizes for iOS 17+:
- **Small (systemSmall)**: Shows pet image + hour badge, tap to complete
- **Medium (systemMedium)**: Shows pet, current task, hour, and interactive buttons (✓/✕/‹/›)

## Architecture

### Technology Stack

- **WidgetKit**: Apple's framework for creating widgets
- **SwiftUI**: UI framework for widget views
- **AppIntents**: For timeline provider (iOS 17+)
- **App Groups**: For data sharing between app and widget
- **Deep Links**: For widget actions (v1 non-interactive approach)

### Shared State

The app uses a shared state store (`shared/WidgetStateStore.ts`) that exposes:

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

**Storage Mechanism:**
- **React Native**: AsyncStorage with key `@PetProgress:widgetState`
- **iOS Widget**: UserDefaults with suite name `group.com.petprogress.app`
- **Format**: JSON string

### Deep Links

The app registers the URL scheme `petprogress://` with these actions:

| Action | URL | Description | XP Change |
|--------|-----|-------------|-----------|
| Complete | `petprogress://complete` | Complete current task | +10 XP |
| Skip | `petprogress://skip` | Skip current task | No change |
| Miss | `petprogress://miss` | Mark task as missed | Level-scaled penalty |
| Next | `petprogress://next` | Navigate to next task | No change |
| Previous | `petprogress://prev` | Navigate to previous task | No change |

### Timeline & Refresh

Widgets use `AppIntentTimelineProvider` to:

1. **Emit Current Entry**: Provide current widget state
2. **Schedule Next Refresh**: Calculate next hour boundary considering grace minutes
3. **Request Reload**: After any deep link action

**Refresh Strategy:**
```swift
let nextUpdate = nextBoundaryConsideringGrace(Date(), graceMinutes: graceMinutes)
return Timeline(entries: [entry], policy: .after(nextUpdate))
```

**Timeline Utilities** (`utils/timeline.ts`):
- `nextBoundaryConsideringGrace(now, graceMinutes)`: Calculate next refresh time
- `getActiveHour(now, graceMinutes)`: Get current active hour
- `isWithinGracePeriod(now, targetHour, graceMinutes)`: Check if within grace period

### XP & Penalties

Pet evolution uses 30 stages with thresholds defined in `constants/petStages.ts`.

**XP Gain**: +10 XP per completed task (configurable via `XP_PER_TASK`)

**Miss Penalty** (level-scaled):
```
penalty(level) = 1 + 2*(level−1)/29
```

Examples:
- Level 1: 1× penalty (10 XP lost)
- Level 15: ~2× penalty (20 XP lost)
- Level 30: 3× penalty (30 XP lost)

**Rollover Logic** (at midnight + grace minutes):
1. Mark undone tasks as missed
2. Apply penalty: `xp -= round(xpGainPerTask * penalty(level) * missedCount)`
3. Clamp XP to 0 minimum
4. Recompute stage based on new XP
5. Create new tasks for today
6. Sync widget state

### Pet Stages (30 Levels)

1. Egg → 2. Chicken → 3. Weasel → 4. Badger → 5. Hawk → 6. Barracuda → 7. Coyote → 8. Wild Boar → 9. Wolf → 10. Crocodile → 11. Mako Shark → 12. Great White Shark → 13. Orca → 14. Bison → 15. Bull → 16. Stallion → 17. Grizzly Bear → 18. Polar Bear → 19. Rhinoceros → 20. Hippopotamus → 21. Elephant → 22. Silver Back Gorilla → 23. Cape Buffalo → 24. Lion → 25. Komodo Dragon → 26. Eagle → 27. Phoenix → 28. Dragon → 29. Human CEO → 30. Golden CEO

## Native iOS Implementation

### File Structure

```
targets/PetProgressWidget/
├── PetProgressWidget.swift    # Main widget implementation
└── Info.plist                 # Widget configuration
```

### Widget Configuration

```swift
struct PetProgressWidget: Widget {
    let kind: String = "PetProgressWidget"
    
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: ConfigurationAppIntent.self,
            provider: Provider()
        ) { entry in
            PetProgressWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("PetProgress")
        .description("Track your hourly tasks and watch your pet evolve")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### Timeline Provider

```swift
struct Provider: AppIntentTimelineProvider {
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<Entry> {
        let widgetState = loadWidgetState()
        let entry = SimpleEntry(date: Date(), widgetState: widgetState)
        
        let graceMinutes = widgetState?.graceMinutes ?? 0
        let nextUpdate = nextBoundaryConsideringGrace(Date(), graceMinutes: graceMinutes)
        
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
    
    private func loadWidgetState() -> WidgetState? {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.petprogress.app"),
              let jsonString = sharedDefaults.string(forKey: "@PetProgress:widgetState"),
              let jsonData = jsonString.data(using: .utf8) else {
            return nil
        }
        
        return try? JSONDecoder().decode(WidgetState.self, from: jsonData)
    }
}
```

### Small Widget View

```swift
struct SmallWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        Link(destination: URL(string: "petprogress://complete")!) {
            ZStack {
                Color(hex: "#121826")
                
                VStack(spacing: 8) {
                    Text(petEmoji)
                        .font(.system(size: 50))
                    
                    Text(hour)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color(hex: "#A8B1C7"))
                    
                    Text("Tap to complete")
                        .font(.system(size: 10))
                        .foregroundColor(Color(hex: "#60A5FA"))
                }
            }
        }
    }
}
```

### Medium Widget View

```swift
struct MediumWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        ZStack {
            Color(hex: "#121826")
            
            VStack(spacing: 12) {
                // Pet and task info
                HStack(spacing: 16) {
                    Text(petEmoji)
                        .font(.system(size: 50))
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(currentTask.title)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(Color(hex: "#FFFFFF"))
                        
                        Text("\(hour) • Stage \(stageIndex + 1)")
                            .font(.system(size: 11))
                            .foregroundColor(Color(hex: "#A8B1C7"))
                    }
                }
                
                // Action buttons
                HStack(spacing: 8) {
                    ActionButton(url: "petprogress://prev", icon: "chevron.left", color: "#A8B1C7")
                    ActionButton(url: "petprogress://complete", icon: "checkmark", color: "#22C55E")
                    ActionButton(url: "petprogress://miss", icon: "xmark", color: "#F87171")
                    ActionButton(url: "petprogress://skip", icon: "arrow.right", color: "#FBBF24")
                    ActionButton(url: "petprogress://next", icon: "chevron.right", color: "#A8B1C7")
                }
            }
        }
    }
}
```

### App Groups Setup

1. **Enable App Groups** in Xcode capabilities for both targets
2. **Group Identifier**: `group.com.petprogress.app`
3. **Share Data** using `UserDefaults(suiteName:)`

```swift
let sharedDefaults = UserDefaults(suiteName: "group.com.petprogress.app")
sharedDefaults?.set(jsonString, forKey: "@PetProgress:widgetState")
```

### Deep Link Handling

In the main app (`app/_layout.tsx`):

```typescript
import * as Linking from 'expo-linking';

useEffect(() => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });
  
  return () => subscription.remove();
}, []);
```

## React Native Integration

### State Synchronization

After every state change that affects the widget:

```typescript
import { syncWidgetState, requestWidgetReload } from '@/shared/WidgetStateStore';

// Update widget state
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

### Deep Link Handlers

In `navigation/deeplinks.ts`:

```typescript
export const handleDeepLink = async (url: string, appState: AppState) => {
  const action = url.replace('petprogress://', '');
  
  switch (action) {
    case 'complete':
      // Complete current task
      await handleCompleteTask(appState);
      break;
    case 'skip':
      // Skip current task
      await handleSkipTask(appState);
      break;
    case 'miss':
      // Miss current task
      await handleMissTask(appState);
      break;
    case 'next':
      // Navigate to next task
      await handleNextTask(appState);
      break;
    case 'prev':
      // Navigate to previous task
      await handlePrevTask(appState);
      break;
  }
  
  // Sync widget state and request reload
  await syncWidgetState(...);
  await requestWidgetReload();
};
```

## Color Palette - Bright-Trust (Dark)

```swift
// Background
Color(hex: "#0B1220")  // Main background
Color(hex: "#121826")  // Surface/Card

// Text
Color(hex: "#FFFFFF")  // Primary text
Color(hex: "#A8B1C7")  // Muted text

// Brand
Color(hex: "#60A5FA")  // Primary (Blue)
Color(hex: "#22D3EE")  // Secondary (Cyan)

// Actions
Color(hex: "#22C55E")  // Success/Complete (Green)
Color(hex: "#FBBF24")  // Warning/Skip (Yellow)
Color(hex: "#F87171")  // Error/Miss (Red)
Color(hex: "#A78BFA")  // Accent/Highlight (Purple)
```

## QA Exit Criteria

- ✓ Small/Medium widgets show current task + pet stage
- ✓ Taps perform ✓/✕/‹/› via deep links and reflect on next render
- ✓ Hourly boundary + grace update without manual refresh
- ✓ Rollover applies level-scaled penalty and can de-evolve
- ✓ Threshold crossings update stage art on next timeline
- ✓ Widget state syncs after every app state change
- ✓ Deep links trigger haptic feedback
- ✓ Widget displays "No tasks" state when appropriate
- ✓ Color palette matches Bright-Trust (Dark) theme

## Files Reference

| File | Purpose |
|------|---------|
| `constants/petStages.ts` | 30 stages + XP thresholds |
| `utils/petLogic.ts` | Stage resolver, penalties, de-evolution |
| `utils/timeline.ts` | Boundary calculations with grace minutes |
| `utils/taskLogic.ts` | Rollover logic |
| `shared/WidgetStateStore.ts` | Shared state management |
| `navigation/deeplinks.ts` | Deep link handlers |
| `hooks/useAppState.ts` | Main app state hook with deep link integration |
| `targets/PetProgressWidget/PetProgressWidget.swift` | Widget implementation |
| `targets/PetProgressWidget/Info.plist` | Widget configuration |

## Upgrade Path: Interactive Widgets

For v2, upgrade to true interactive widgets using App Intents:

```swift
// Replace Link with Button
Button(intent: CompleteTaskIntent()) {
    Image(systemName: "checkmark")
}

// Define App Intent
struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    
    func perform() async throws -> some IntentResult {
        // Perform action directly in widget
        // Update shared state
        // Return result
    }
}
```

This allows actions to execute without opening the app, providing a truly interactive experience.

## Additional Resources

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Intents Documentation](https://developer.apple.com/documentation/appintents)
- [Timeline Management](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)
- [App Groups Guide](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)
