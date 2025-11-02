
# Widget Implementation Guide

This document describes how to implement native iOS home screen widgets for PetProgress.

## Overview

PetProgress supports two widget sizes:
- **Small (systemSmall)**: Shows pet image + hour badge, tap to complete
- **Medium (systemMedium)**: Shows pet, current task, hour, and interactive buttons (✓/✕/‹/›)

## Architecture

### Shared State

The app uses a shared state store (`shared/WidgetStateStore.ts`) that exposes:
- `todayTasks`: Array of today's tasks
- `currentIndex`: Index of the current task
- `petState`: Pet XP and stage
- `graceMinutes`: Grace period setting
- `lastRolloverAt`: Last rollover date

For native iOS implementation, use App Groups with `UserDefaults(suiteName:)` to share this data.

### Deep Links

The app registers the URL scheme `petprogress://` with these actions:
- `petprogress://complete` - Complete current task
- `petprogress://skip` - Skip current task
- `petprogress://miss` - Mark task as missed (with XP penalty)
- `petprogress://next` - Navigate to next task
- `petprogress://prev` - Navigate to previous task

### Timeline & Refresh

Widgets use `AppIntentTimelineProvider` to:
1. Emit one entry "now"
2. Schedule next refresh at the next hour boundary (considering grace minutes)
3. Request reload after any deep link action

Use `utils/timeline.ts` functions:
- `nextBoundaryConsideringGrace(now, graceMinutes)`: Calculate next refresh time
- `getActiveHour(now, graceMinutes)`: Get current active hour
- `isWithinGracePeriod(now, targetHour, graceMinutes)`: Check if within grace period

### XP & Penalties

Pet evolution uses 30 stages with thresholds defined in `constants/petStages.ts`.

**XP Gain**: +10 XP per completed task (configurable)

**Miss Penalty** (level-scaled):
```
penalty(level) = 1 + 2*(level−1)/29
```
- Level 1: 1× penalty (10 XP lost)
- Level 15: ~2× penalty (20 XP lost)
- Level 30: 3× penalty (30 XP lost)

**Rollover**: At midnight + grace minutes:
1. Mark undone tasks as missed
2. Apply penalty: `xp -= round(xpGainPerTask * penalty(level) * missedCount)`
3. Clamp XP to 0 minimum
4. Recompute stage based on new XP
5. Create new tasks for today

### Pet Stages (30 Levels)

1. Egg → 2. Chicken → 3. Weasel → 4. Badger → 5. Hawk → 6. Barracuda → 7. Coyote → 8. Wild Boar → 9. Wolf → 10. Crocodile → 11. Mako Shark → 12. Great White Shark → 13. Orca → 14. Bison → 15. Bull → 16. Stallion → 17. Grizzly Bear → 18. Polar Bear → 19. Rhinoceros → 20. Hippopotamus → 21. Elephant → 22. Silver Back Gorilla → 23. Cape Buffalo → 24. Lion → 25. Komodo Dragon → 26. Eagle → 27. Phoenix → 28. Dragon → 29. Human CEO → 30. Golden CEO

## Native iOS Implementation

### 1. Create Widget Extension

```swift
import WidgetKit
import SwiftUI

struct PetProgressWidget: Widget {
    let kind: String = "PetProgressWidget"
    
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: ConfigurationAppIntent.self,
            provider: Provider()
        ) { entry in
            PetProgressWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("PetProgress")
        .description("Track your tasks and watch your pet evolve")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### 2. Timeline Provider

```swift
struct Provider: AppIntentTimelineProvider {
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<Entry> {
        let widgetState = loadWidgetState()
        let entry = SimpleEntry(date: Date(), widgetState: widgetState)
        
        let graceMinutes = widgetState.graceMinutes
        let nextUpdate = nextBoundaryConsideringGrace(Date(), graceMinutes)
        
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
}
```

### 3. Widget Views

**Small Widget:**
```swift
struct SmallWidgetView: View {
    let entry: Entry
    
    var body: some View {
        Link(destination: URL(string: "petprogress://complete")!) {
            VStack {
                Text(entry.widgetState.petState.emoji)
                    .font(.system(size: 60))
                Text("\(entry.widgetState.currentHour):00")
                    .font(.caption)
            }
        }
    }
}
```

**Medium Widget:**
```swift
struct MediumWidgetView: View {
    let entry: Entry
    
    var body: some View {
        HStack {
            // Pet on left
            Text(entry.widgetState.petState.emoji)
                .font(.system(size: 50))
            
            // Task info on right
            VStack(alignment: .leading) {
                Text(entry.widgetState.currentTask.title)
                    .lineLimit(2)
                Text("\(entry.widgetState.currentHour):00")
                    .font(.caption)
            }
        }
        
        // Action buttons at bottom
        HStack {
            Link(destination: URL(string: "petprogress://prev")!) {
                Image(systemName: "chevron.left")
            }
            Link(destination: URL(string: "petprogress://complete")!) {
                Image(systemName: "checkmark")
            }
            Link(destination: URL(string: "petprogress://miss")!) {
                Image(systemName: "xmark")
            }
            Link(destination: URL(string: "petprogress://skip")!) {
                Image(systemName: "arrow.right")
            }
            Link(destination: URL(string: "petprogress://next")!) {
                Image(systemName: "chevron.right")
            }
        }
    }
}
```

### 4. App Groups Setup

1. Enable App Groups in Xcode capabilities for both app and widget targets
2. Use group identifier: `group.com.petprogress.app`
3. Share data using `UserDefaults(suiteName:)`

```swift
let sharedDefaults = UserDefaults(suiteName: "group.com.petprogress.app")
```

### 5. Deep Link Handling

In your app's `SceneDelegate` or `App` struct:

```swift
.onOpenURL { url in
    handleDeepLink(url)
}
```

## React Native Limitations

React Native/Expo does not support native iOS widgets with interactive buttons out of the box. To implement this feature:

1. **Option A**: Use Expo's custom native modules to create a widget extension
2. **Option B**: Create a native iOS build with widget extension
3. **Option C**: Use a service like EAS Build with custom native code

The React Native implementation in this codebase provides:
- Deep link handlers that work when links are opened
- Shared state management via AsyncStorage
- Timeline calculation utilities
- All business logic for XP, penalties, and pet evolution

## QA Exit Criteria

- ✓ Small/Medium widgets show current task + pet stage
- ✓ Taps perform ✓/✕/‹/› via deep links and reflect on next render
- ✓ Hourly boundary + grace update without manual refresh
- ✓ Rollover applies level-scaled penalty and can de-evolve
- ✓ Threshold crossings update stage art on next timeline

## Files Reference

- `constants/petStages.ts` - 30 stages + XP thresholds
- `utils/petLogic.ts` - Stage resolver, penalties, de-evolution
- `utils/timeline.ts` - Boundary calculations with grace minutes
- `utils/taskLogic.ts` - Rollover logic
- `shared/WidgetStateStore.ts` - Shared state management
- `navigation/deeplinks.ts` - Deep link handlers
- `hooks/useAppState.ts` - Main app state hook with deep link integration
