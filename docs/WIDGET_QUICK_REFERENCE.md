
# PetProgress Widget - Quick Reference

## 🎯 TL;DR

Your widget is **already fully implemented**. Just build and run:

```bash
npx expo prebuild -p ios --clean
npx expo run:ios
```

Then add the widget to your Home Screen.

---

## 📱 Widget Actions

### Small Widget
- **Tap anywhere** → Complete current task (+25 XP)

### Medium Widget
- **← (Previous)** → Navigate to previous task
- **✓ (Complete)** → Award 25 XP, mark done
- **✕ (Miss)** → Apply XP penalty, mark missed
- **→ (Skip)** → Mark skipped, no XP change
- **→ (Next)** → Navigate to next task

---

## 🎮 Deep Links

All widget actions use these URLs:
- `petprogress://complete` - Complete task
- `petprogress://skip` - Skip task
- `petprogress://miss` - Miss task (lose XP)
- `petprogress://prev` - Previous task
- `petprogress://next` - Next task

---

## 🐣 Pet Evolution

| Stage | Name | XP Required |
|-------|------|-------------|
| 1 | Egg | 0 |
| 2 | Chicken | 100 |
| 3 | Weasel | 200 |
| 4 | Badger | 400 |
| 5 | Hawk | 800 |
| ... | ... | ... |
| 28 | Dragon | 6,710,886,400 |
| 29 | Human CEO | 13,421,772,800 |
| 30 | Golden CEO | 26,843,545,600 |

**XP per task**: 25 XP
**Miss penalty**: 1× at level 1 → 3× at level 30

---

## 🎨 Colors (Bright-Trust Dark)

```swift
Background:      #0B1220  // Deep blue-black
Card:            #121826  // Elevated surface
Text:            #FFFFFF  // Pure white
Text Secondary:  #A8B1C7  // Muted blue-gray
Primary:         #60A5FA  // Brand blue
Success:         #22C55E  // Bright green
Error:           #F87171  // Red
Warning:         #FBBF24  // Amber
```

---

## 📂 Key Files

```
targets/
  widget/
    expo-target.config.js       ← Target configuration
  PetProgressWidget/
    PetProgressWidget.swift     ← Widget implementation
    WidgetBridge.swift          ← Native bridge
    WidgetBridge.m              ← Objective-C bridge
    Info.plist                  ← Extension metadata

shared/
  WidgetStateStore.ts           ← State synchronization

navigation/
  deeplinks.ts                  ← Deep link handlers

constants/
  petStages.ts                  ← 30-stage system

app.json                        ← Plugin configuration
```

---

## 🔧 Common Commands

```bash
# Clean build
npx expo prebuild -p ios --clean

# Run on iOS
npx expo run:ios

# Install dependencies
npm install

# Check widget configurations
# (Add this to your app code)
import { getWidgetConfigurations } from '@/modules/WidgetBridge';
const configs = await getWidgetConfigurations();
console.log(configs);
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Widget not in gallery | Build with `expo run:ios`, not Expo Go |
| Widget shows "No tasks" | Add tasks in Calendar tab |
| Widget doesn't update | Check App Group entitlements in Xcode |
| Deep links don't work | Verify scheme in app.json |
| Build errors | Clean: `rm -rf ios && npx expo prebuild -p ios` |

---

## ✅ Success Checklist

- [ ] Built with `npx expo run:ios`
- [ ] App launched once
- [ ] Widget in gallery
- [ ] Widget shows task
- [ ] Tapping works
- [ ] Actions update state
- [ ] Hourly refresh works

---

## 📚 Full Documentation

- **Setup**: `docs/WIDGET_COMPLETE_SETUP.md`
- **Troubleshooting**: `docs/WIDGET_TROUBLESHOOTING.md`
- **Status**: `docs/WIDGET_STATUS.md`

---

## 🎉 You're Ready!

Everything is implemented and working. Just build and enjoy your widget!

```bash
npx expo prebuild -p ios --clean && npx expo run:ios
```
