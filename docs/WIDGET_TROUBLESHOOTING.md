
# Widget Troubleshooting Guide

## Common Issues and Solutions

### 1. Widget doesn't appear in the widget gallery

**Symptoms:**
- Can't find "PetProgress" when adding widgets
- Widget gallery doesn't show the app

**Solutions:**

#### A. Build with native dev client (not Expo Go)
```bash
# Clean prebuild
npx expo prebuild -p ios --clean

# Run on device/simulator
npx expo run:ios
```

**Important:** Expo Go does NOT support widgets. You must build a native dev client.

#### B. Launch the app first
1. Build and run the app
2. Open it at least once
3. Close the app
4. Try adding the widget again

#### C. Restart the simulator/device
```bash
# For simulator
xcrun simctl shutdown all
xcrun simctl boot "iPhone 15 Pro"

# Or just restart from Simulator menu
```

#### D. Check Xcode target membership
1. Open `ios/YourApp.xcworkspace` in Xcode
2. Select the widget target (PetProgressWidget)
3. Go to Build Phases → Compile Sources
4. Verify `PetProgressWidget.swift` is listed
5. Make sure `WidgetBridge.m` and `WidgetBridge.swift` are in the **app target only**, not the widget target

---

### 2. Widget shows "No tasks"

**Symptoms:**
- Widget displays placeholder state
- Shows egg emoji and "No tasks"

**Solutions:**

#### A. Add tasks in the Calendar tab
1. Open the app
2. Go to Calendar tab
3. Add at least one task with a specific time
4. Make sure the task is for today

#### B. Check widget state sync
Look for console logs:
```
Widget state saved: { taskCount: X, currentIndex: Y, ... }
```

If you don't see these logs, the state isn't syncing.

#### C. Force sync
1. Force quit the app
2. Reopen it
3. Wait a few seconds
4. Check the widget again

---

### 3. Widget doesn't update after tapping

**Symptoms:**
- Tap widget buttons but nothing happens
- App doesn't open or state doesn't change

**Solutions:**

#### A. Check deep link scheme
In `app.json`, verify:
```json
{
  "expo": {
    "scheme": "petprogress"
  }
}
```

#### B. Check deep link handlers
Look for console logs when tapping:
```
Deep link received: petprogress://complete
Handling deep link action: complete
```

If you don't see these, deep links aren't working.

#### C. Verify URL scheme in Info.plist
After prebuild, check `ios/YourApp/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>petprogress</string>
    </array>
  </dict>
</array>
```

#### D. Rebuild after changes
```bash
npx expo prebuild -p ios --clean
npx expo run:ios
```

---

### 4. App Group not working

**Symptoms:**
- Widget shows old data
- Changes in app don't reflect in widget
- Console shows "Failed to access App Group"

**Solutions:**

#### A. Check entitlements in Xcode
1. Open `ios/YourApp.xcworkspace`
2. Select the **app target**
3. Go to Signing & Capabilities
4. Verify "App Groups" capability exists
5. Check that `group.com.petprogress.app` is listed and enabled
6. Repeat for the **widget target**

#### B. Verify App Group in code
In `WidgetBridge.swift`:
```swift
private let appGroupIdentifier = "group.com.petprogress.app"
```

In `PetProgressWidget.swift`:
```swift
UserDefaults(suiteName: "group.com.petprogress.app")
```

Both should match the entitlement.

#### C. Check provisioning profile
If building for a real device:
1. Go to Apple Developer portal
2. Check that your App ID has App Groups enabled
3. Regenerate provisioning profiles if needed
4. Download and install in Xcode

---

### 5. Widget crashes on launch

**Symptoms:**
- Widget briefly appears then disappears
- Widget shows error icon
- Device/simulator shows crash

**Solutions:**

#### A. Attach debugger
1. Open Xcode
2. Run the app
3. Debug → Attach to Process → PetProgressWidget
4. Check console for crash logs

#### B. Check JSON decoding
The widget expects this structure:
```json
{
  "todayTasks": [...],
  "currentIndex": 0,
  "petState": { "xp": 0, "stageIndex": 0 },
  "graceMinutes": 5,
  "lastRolloverAt": "2024-01-01",
  "lastUpdated": 1234567890
}
```

#### C. Add error handling
In `PetProgressWidget.swift`, check the `loadWidgetState()` function:
```swift
do {
    let state = try JSONDecoder().decode(WidgetState.self, from: jsonData)
    return state
} catch {
    print("Error decoding widget state: \(error)")
    return nil
}
```

#### D. Check Console.app
1. Open Console.app on Mac
2. Select your device/simulator
3. Filter by "PetProgress"
4. Look for crash logs or error messages

---

### 6. Widget doesn't refresh hourly

**Symptoms:**
- Widget shows stale data
- Doesn't update at hour boundaries

**Solutions:**

#### A. Check timeline provider
In `PetProgressWidget.swift`:
```swift
func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
    // ...
    let nextUpdate = nextBoundaryConsideringGrace(Date(), graceMinutes: graceMinutes)
    return Timeline(entries: [entry], policy: .after(nextUpdate))
}
```

#### B. Verify grace minutes calculation
```swift
private func nextBoundaryConsideringGrace(_ now: Date, graceMinutes: Int) -> Date {
    // Should return next hour + grace minutes
}
```

#### C. Force reload
In the app, after any action:
```typescript
await requestWidgetReload();
```

This calls `WidgetCenter.shared.reloadTimelines(ofKind: "PetProgressWidget")`.

#### D. Check system widget budget
iOS limits widget updates to conserve battery. If you're testing frequently:
1. Wait a few minutes between tests
2. Don't force-reload too often
3. Let the system manage the timeline

---

### 7. Colors look wrong

**Symptoms:**
- Widget colors don't match app
- Text is hard to read

**Solutions:**

#### A. Check color definitions
In `PetProgressWidget.swift`:
```swift
Color(hex: "#0B1220")  // Background
Color(hex: "#121826")  // Card
Color(hex: "#FFFFFF")  // Text
Color(hex: "#60A5FA")  // Primary
```

#### B. Verify Color extension
Make sure the `Color(hex:)` extension is working:
```swift
extension Color {
    init(hex: String) {
        // ... hex parsing code
    }
}
```

#### C. Test in light/dark mode
Widgets should adapt to system appearance. Test both:
1. Settings → Display & Brightness → Light/Dark
2. Check widget appearance in both modes

---

### 8. Build errors

**Symptoms:**
- Xcode shows compile errors
- Build fails

**Common errors and fixes:**

#### A. "No such module 'WidgetKit'"
- Make sure deployment target is iOS 14.0+
- Check that WidgetKit is in frameworks

#### B. "Cannot find 'WidgetBridge' in scope"
- Make sure `WidgetBridge.m` and `WidgetBridge.swift` are in the app target
- Check that they're NOT in the widget target

#### C. "Duplicate symbols"
- Clean build folder: Cmd+Shift+K
- Delete DerivedData
- Rebuild

#### D. "Entitlement not allowed"
- Check that App Groups is enabled in Capabilities
- Verify your Apple Developer account has App Groups enabled

---

## Debugging Tips

### Enable verbose logging

In `shared/WidgetStateStore.ts`:
```typescript
console.log('Widget state saved:', {
  taskCount: stateWithTimestamp.todayTasks.length,
  currentIndex: stateWithTimestamp.currentIndex,
  petXP: stateWithTimestamp.petState.xp,
  petStage: stateWithTimestamp.petState.stageIndex,
  timestamp: new Date(stateWithTimestamp.lastUpdated).toISOString(),
});
```

In `PetProgressWidget.swift`:
```swift
print("Widget state loaded: \(state)")
print("Next update scheduled for: \(nextUpdate)")
```

### Check widget timeline

In the app:
```typescript
import { getWidgetConfigurations } from '@/modules/WidgetBridge';

const configs = await getWidgetConfigurations();
console.log('Active widgets:', configs);
```

### Inspect App Group storage

In Xcode debugger:
```swift
let sharedDefaults = UserDefaults(suiteName: "group.com.petprogress.app")
print(sharedDefaults?.dictionaryRepresentation())
```

### Monitor deep links

In `hooks/useAppState.ts`:
```typescript
useEffect(() => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    console.log('Deep link received:', url);
    // ...
  });
  // ...
}, [state]);
```

---

## Still having issues?

1. **Clean everything:**
   ```bash
   rm -rf ios android node_modules
   npm install
   npx expo prebuild -p ios --clean
   npx expo run:ios
   ```

2. **Check the complete setup guide:**
   See `docs/WIDGET_COMPLETE_SETUP.md`

3. **Verify all files exist:**
   - `targets/PetProgressWidget/PetProgressWidget.swift`
   - `targets/PetProgressWidget/Info.plist`
   - `targets/PetProgressWidget/WidgetBridge.m`
   - `targets/PetProgressWidget/WidgetBridge.swift`
   - `targets/widget/expo-target.config.js`
   - `app.json` (with @bacons/apple-targets plugin)

4. **Check package.json:**
   ```json
   {
     "dependencies": {
       "@bacons/apple-targets": "^3.0.2"
     }
   }
   ```

5. **Verify iOS deployment target:**
   In Xcode, both app and widget targets should have iOS 17.0+ deployment target.

---

## Success Checklist

- [ ] Built with `npx expo run:ios` (not Expo Go)
- [ ] App launched at least once
- [ ] Widget appears in widget gallery
- [ ] Widget shows current task
- [ ] Tapping widget opens app
- [ ] Widget actions update state
- [ ] Widget refreshes hourly
- [ ] App Group entitlements configured
- [ ] Deep links working
- [ ] Colors look correct
- [ ] Pet evolves with XP

If all boxes are checked, your widget is working perfectly! 🎉
