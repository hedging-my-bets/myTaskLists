
# PetProgress Widget - Quick Start Guide

Get the iOS Home Screen widget up and running in 5 minutes.

## 🚀 Quick Setup

### 1. Prebuild (2 minutes)

```bash
# Generate native iOS project with widget target
npx expo prebuild --platform ios --clean
```

This creates:
- `ios/` directory
- `PetProgressWidget` target
- App Groups configuration

### 2. Open in Xcode (1 minute)

```bash
# Open the workspace
open ios/PetProgress.xcworkspace
```

### 3. Verify Configuration (1 minute)

**Check both targets have App Groups:**

1. Select `PetProgress` target → Signing & Capabilities
2. Verify "App Groups" is enabled
3. Check `group.com.petprogress.app` is listed
4. Repeat for `PetProgressWidget` target

### 4. Build & Run (1 minute)

```bash
# Run on simulator or device
npx expo run:ios
```

### 5. Add Widget to Home Screen

1. Long-press Home Screen
2. Tap "+" button
3. Search "PetProgress"
4. Choose Small or Medium
5. Tap "Add Widget"

## ✅ Verify It Works

### Test Small Widget
- Should show pet emoji and hour
- Tap widget → app opens and completes task
- Widget updates with new task

### Test Medium Widget
- Should show pet, task title, hour, stage
- Tap ✓ → completes task
- Tap ✕ → marks missed
- Tap → → skips task
- Tap ◀/▶ → navigates tasks

## 🎯 Key Files

```
targets/PetProgressWidget/
├── PetProgressWidget.swift    # Widget implementation
├── Info.plist                 # Widget config
├── WidgetBridge.swift         # Native bridge
└── WidgetBridge.m             # Bridge header

shared/
└── WidgetStateStore.ts        # State management

modules/
└── WidgetBridge.ts            # TypeScript bridge
```

## 🔗 Deep Links

Test in Safari:
```
petprogress://complete
petprogress://skip
petprogress://miss
petprogress://next
petprogress://prev
```

## 🎨 Colors (Bright-Trust Dark)

```swift
Background:  #0B1220
Card:        #121826
Text:        #FFFFFF
Muted:       #A8B1C7
Primary:     #60A5FA
Success:     #22C55E
Warning:     #FBBF24
Error:       #F87171
```

## 📱 Widget Sizes

**Small:** Pet + Hour + Tap to complete

**Medium:** Pet + Task + 5 action buttons

## ⏰ Refresh

- **Hourly**: At hour boundary + grace minutes
- **After Actions**: Explicit reload
- **System**: iOS manages frequency

## 🐛 Common Issues

### Widget not appearing?
```bash
# Rebuild completely
npx expo prebuild --clean --platform ios
npx expo run:ios
```

### Widget not updating?
- Check App Groups are configured
- Verify both targets have same group ID
- Check Console logs in Xcode

### Deep links not working?
- Verify URL scheme in `app.json`
- Test with Safari first
- Check deep link handlers in code

## 📚 Full Documentation

- `WIDGET_IMPLEMENTATION.md` - Technical details
- `WIDGET_SETUP_GUIDE.md` - Complete setup
- `WIDGET_README.md` - Full overview

## 🎓 Next Steps

1. ✅ Get widget working (you're here!)
2. 📖 Read `WIDGET_IMPLEMENTATION.md` for details
3. 🎨 Customize widget appearance
4. 🚀 Build for production with EAS
5. 📱 Submit to App Store

## 💡 Pro Tips

- Use Xcode Console to debug widget
- Test on real device for accurate refresh timing
- Check shared UserDefaults for state
- Use Safari to test deep links quickly

## 🆘 Need Help?

1. Check `WIDGET_README.md` troubleshooting
2. Review Xcode console logs
3. Verify App Groups configuration
4. Test deep links in Safari

---

**That's it!** Your widget should now be working. 🎉

For detailed information, see the full documentation in the `docs/` folder.
