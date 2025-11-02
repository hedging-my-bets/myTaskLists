
# PetProgress Widget Setup Guide

This guide walks you through setting up the iOS Home Screen widget for PetProgress.

## Prerequisites

- Xcode 15.0 or later
- iOS 17.0+ target device or simulator
- Expo CLI installed
- EAS CLI installed (for building)

## Step 1: Install Dependencies

The `@bacons/apple-targets` package is already included in your `package.json`. If you need to install it manually:

```bash
npm install @bacons/apple-targets
```

## Step 2: Prebuild the Project

Run the prebuild command to generate the native iOS project with the widget target:

```bash
npx expo prebuild --platform ios --clean
```

This will:
- Generate the iOS native project in the `ios/` directory
- Create the `PetProgressWidget` target
- Configure App Groups for data sharing
- Set up entitlements

## Step 3: Configure App Groups in Xcode

1. Open the project in Xcode:
   ```bash
   open ios/PetProgress.xcworkspace
   ```

2. Select the main app target (`PetProgress`)
3. Go to "Signing & Capabilities"
4. Verify that "App Groups" capability is enabled
5. Ensure `group.com.petprogress.app` is listed

6. Select the widget target (`PetProgressWidget`)
7. Repeat steps 3-5 for the widget target

## Step 4: Add Widget Files

The widget implementation files are already created in `targets/PetProgressWidget/`:

- `PetProgressWidget.swift` - Main widget implementation
- `Info.plist` - Widget configuration

During prebuild, these files should be automatically linked to the widget target.

## Step 5: Build and Run

### Option A: Development Build

1. In Xcode, select the main app scheme
2. Choose your target device or simulator
3. Click Run (⌘R)

### Option B: EAS Build

1. Configure EAS:
   ```bash
   eas build:configure
   ```

2. Build for iOS:
   ```bash
   eas build --platform ios --profile development
   ```

## Step 6: Add Widget to Home Screen

1. Long-press on the Home Screen
2. Tap the "+" button in the top-left corner
3. Search for "PetProgress"
4. Choose either:
   - **Small Widget**: Shows pet and hour, tap to complete
   - **Medium Widget**: Shows pet, task, and action buttons
5. Tap "Add Widget"

## Widget Features

### Small Widget
- Displays current pet stage emoji
- Shows current task hour
- Tap anywhere to complete the current task
- Deep link: `petprogress://complete`

### Medium Widget
- Displays pet stage emoji (left side)
- Shows current task title and hour
- Five action buttons:
  - **◀** Previous task (`petprogress://prev`)
  - **✓** Complete task (`petprogress://complete`)
  - **✕** Miss task (`petprogress://miss`)
  - **→** Skip task (`petprogress://skip`)
  - **▶** Next task (`petprogress://next`)

## Data Sharing

The widget shares data with the main app through:

1. **App Groups**: `group.com.petprogress.app`
2. **Shared UserDefaults**: Key `@PetProgress:widgetState`
3. **JSON Format**:
   ```json
   {
     "todayTasks": [...],
     "currentIndex": 0,
     "petState": { "xp": 100, "stageIndex": 5 },
     "graceMinutes": 15,
     "lastRolloverAt": "2024-01-15",
     "lastUpdated": 1705334400000
   }
   ```

## Timeline Refresh

The widget automatically refreshes:

1. **Hourly**: At each hour boundary + grace minutes
2. **After Actions**: When user taps any action button
3. **System-Managed**: iOS may refresh more or less frequently based on usage patterns

The timeline provider calculates the next refresh time using:
```swift
nextBoundaryConsideringGrace(Date(), graceMinutes: graceMinutes)
```

## Deep Link Handling

Deep links are handled in the main app through:

1. `navigation/deeplinks.ts` - Deep link handlers
2. `hooks/useAppState.ts` - State updates after actions
3. URL scheme: `petprogress://`

Supported actions:
- `complete` - Complete current task (+10 XP)
- `skip` - Skip current task (no XP change)
- `miss` - Mark as missed (XP penalty based on level)
- `next` - Navigate to next task
- `prev` - Navigate to previous task

## Troubleshooting

### Widget Not Appearing

1. Verify App Groups are configured correctly
2. Check that both targets have the same group identifier
3. Rebuild the app completely

### Widget Not Updating

1. Check that `syncWidgetState()` is being called after state changes
2. Verify the shared UserDefaults is accessible
3. Check Xcode console for widget logs

### Deep Links Not Working

1. Verify URL scheme is registered in `app.json`
2. Check that deep link handlers are implemented
3. Test deep links using Safari: `petprogress://complete`

### Build Errors

1. Clean build folder: Product → Clean Build Folder (⌘⇧K)
2. Delete derived data
3. Run `npx expo prebuild --clean` again

## Color Palette

The widget uses the Bright-Trust (Dark) color palette:

- Background: `#0B1220`
- Surface/Card: `#121826`
- Text/Primary: `#FFFFFF`
- Text/Muted: `#A8B1C7`
- Brand/Primary: `#60A5FA`
- Brand/Secondary: `#22D3EE`
- Success: `#22C55E`
- Warning: `#FBBF24`
- Error: `#F87171`
- Accent/Highlight: `#A78BFA`

## Testing Checklist

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

## Production Deployment

For production builds:

1. Update version in `app.json`
2. Build with EAS:
   ```bash
   eas build --platform ios --profile production
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

## Additional Resources

- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Intents Documentation](https://developer.apple.com/documentation/appintents)
- [Expo Apple Targets](https://github.com/EvanBacon/expo-apple-targets)
- [App Groups Guide](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Xcode console logs
3. Check React Native logs: `npx expo start`
4. Verify widget state in AsyncStorage
