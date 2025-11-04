
import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Widget State Model
struct WidgetState: Codable {
    let todayTasks: [WidgetTask]
    let currentIndex: Int
    let petState: PetStateData
    let graceMinutes: Int
    let lastRolloverAt: String
    let lastUpdated: Double
}

struct WidgetTask: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let dueHour: Int
    let isDone: Bool
    let isSkipped: Bool
    let isMissed: Bool
}

struct PetStateData: Codable {
    let xp: Int
    let stageIndex: Int
}

// MARK: - Timeline Provider
struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), widgetState: nil)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), widgetState: loadWidgetState())
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        let widgetState = loadWidgetState()
        let entry = SimpleEntry(date: Date(), widgetState: widgetState)
        
        // Log widget state for debugging
        if let state = widgetState {
            print("📱 [PetProgressWidget] Timeline generated:")
            print("   - Tasks: \(state.todayTasks.count)")
            print("   - Current index: \(state.currentIndex)")
            print("   - Pet XP: \(state.petState.xp)")
            print("   - Pet Stage: \(state.petState.stageIndex)")
            if state.todayTasks.count > 0 {
                print("   - First task: \(state.todayTasks[0].title)")
            }
        } else {
            print("⚠️ [PetProgressWidget] No widget state found!")
        }
        
        // Calculate next refresh time based on grace minutes
        let graceMinutes = widgetState?.graceMinutes ?? 0
        let nextUpdate = nextBoundaryConsideringGrace(Date(), graceMinutes: graceMinutes)
        
        print("⏰ [PetProgressWidget] Next update: \(nextUpdate)")
        
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
    
    // Load widget state from App Group shared container
    private func loadWidgetState() -> WidgetState? {
        let appGroupIdentifier = "group.com.petprogress.app"
        let stateKey = "@PetProgress:widgetState"
        
        guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            print("❌ [PetProgressWidget] Failed to access App Group: \(appGroupIdentifier)")
            return nil
        }
        
        guard let jsonString = sharedDefaults.string(forKey: stateKey) else {
            print("⚠️ [PetProgressWidget] No data found for key: \(stateKey)")
            return nil
        }
        
        guard let jsonData = jsonString.data(using: .utf8) else {
            print("❌ [PetProgressWidget] Failed to convert string to data")
            return nil
        }
        
        do {
            let state = try JSONDecoder().decode(WidgetState.self, from: jsonData)
            print("✅ [PetProgressWidget] Successfully loaded widget state")
            return state
        } catch {
            print("❌ [PetProgressWidget] Error decoding widget state: \(error)")
            return nil
        }
    }
    
    // Calculate next hourly boundary considering grace minutes
    private func nextBoundaryConsideringGrace(_ now: Date, graceMinutes: Int) -> Date {
        let calendar = Calendar.current
        let currentMinutes = calendar.component(.minute, from: now)
        
        var next = now
        
        if currentMinutes < graceMinutes {
            // Boundary is at the end of grace period this hour
            next = calendar.date(bySettingHour: calendar.component(.hour, from: now), minute: graceMinutes, second: 0, of: now) ?? now
        } else {
            // Boundary is at the start of next hour + grace
            next = calendar.date(byAdding: .hour, value: 1, to: now) ?? now
            next = calendar.date(bySettingHour: calendar.component(.hour, from: next), minute: graceMinutes, second: 0, of: next) ?? next
        }
        
        return next
    }
}

// MARK: - Timeline Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let widgetState: WidgetState?
}

// MARK: - Widget Views
struct PetProgressWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            Text("Unsupported")
        }
    }
}

// MARK: - Small Widget View
struct SmallWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        if let state = entry.widgetState,
           state.currentIndex < state.todayTasks.count {
            let currentTask = state.todayTasks[state.currentIndex]
            let petEmoji = getPetEmoji(for: state.petState.stageIndex)
            let hour = currentTask.dueHour >= 0 ? String(format: "%02d:00", currentTask.dueHour) : "Anytime"
            
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
                    .padding()
                }
            }
        } else {
            ZStack {
                Color(hex: "#121826")
                VStack(spacing: 8) {
                    Text("🥚")
                        .font(.system(size: 50))
                    Text("No tasks")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "#A8B1C7"))
                    Text("Open app to add")
                        .font(.system(size: 10))
                        .foregroundColor(Color(hex: "#60A5FA"))
                }
                .padding()
            }
        }
    }
}

// MARK: - Medium Widget View
struct MediumWidgetView: View {
    let entry: SimpleEntry
    
    var body: some View {
        if let state = entry.widgetState,
           state.currentIndex < state.todayTasks.count {
            let currentTask = state.todayTasks[state.currentIndex]
            let petEmoji = getPetEmoji(for: state.petState.stageIndex)
            let hour = currentTask.dueHour >= 0 ? String(format: "%02d:00", currentTask.dueHour) : "Anytime"
            
            ZStack {
                Color(hex: "#121826")
                
                VStack(spacing: 12) {
                    // Top section: Pet and Task info
                    HStack(spacing: 16) {
                        // Pet display
                        Text(petEmoji)
                            .font(.system(size: 50))
                        
                        // Task info
                        VStack(alignment: .leading, spacing: 4) {
                            Text(currentTask.title)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color(hex: "#FFFFFF"))
                                .lineLimit(2)
                            
                            HStack(spacing: 8) {
                                Text(hour)
                                    .font(.system(size: 11))
                                    .foregroundColor(Color(hex: "#A8B1C7"))
                                
                                Text("•")
                                    .foregroundColor(Color(hex: "#A8B1C7"))
                                
                                Text("Stage \(state.petState.stageIndex + 1)")
                                    .font(.system(size: 11))
                                    .foregroundColor(Color(hex: "#60A5FA"))
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    
                    // Action buttons
                    HStack(spacing: 8) {
                        // Previous
                        Link(destination: URL(string: "petprogress://prev")!) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color(hex: "#A8B1C7"))
                                .frame(width: 40, height: 32)
                                .background(Color(hex: "#0B1220"))
                                .cornerRadius(8)
                        }
                        
                        // Complete
                        Link(destination: URL(string: "petprogress://complete")!) {
                            Image(systemName: "checkmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(Color(hex: "#FFFFFF"))
                                .frame(width: 50, height: 32)
                                .background(Color(hex: "#22C55E"))
                                .cornerRadius(8)
                        }
                        
                        // Miss
                        Link(destination: URL(string: "petprogress://miss")!) {
                            Image(systemName: "xmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(Color(hex: "#FFFFFF"))
                                .frame(width: 50, height: 32)
                                .background(Color(hex: "#F87171"))
                                .cornerRadius(8)
                        }
                        
                        // Skip
                        Link(destination: URL(string: "petprogress://skip")!) {
                            Image(systemName: "arrow.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color(hex: "#FFFFFF"))
                                .frame(width: 50, height: 32)
                                .background(Color(hex: "#FBBF24"))
                                .cornerRadius(8)
                        }
                        
                        // Next
                        Link(destination: URL(string: "petprogress://next")!) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color(hex: "#A8B1C7"))
                                .frame(width: 40, height: 32)
                                .background(Color(hex: "#0B1220"))
                                .cornerRadius(8)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)
                }
            }
        } else {
            ZStack {
                Color(hex: "#121826")
                VStack(spacing: 12) {
                    Text("🥚")
                        .font(.system(size: 50))
                    Text("No tasks today")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "#A8B1C7"))
                    Text("Open app to add tasks")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "#60A5FA"))
                }
            }
        }
    }
}

// MARK: - Widget Configuration
struct PetProgressWidget: Widget {
    let kind: String = "PetProgressWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            PetProgressWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("PetProgress")
        .description("Track your hourly tasks and watch your pet evolve")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Configuration Intent
struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configuration"
    static var description = IntentDescription("Configure your PetProgress widget")
}

// MARK: - Helper Functions
func getPetEmoji(for stageIndex: Int) -> String {
    // 31 stages (0-30) matching constants/petStages.ts
    let emojis = [
        "🥚",      // Stage 0: Egg (0 XP)
        "🐔",      // Stage 1: Chicken (100 XP)
        "🦡",      // Stage 2: Weasel (200 XP)
        "🦡",      // Stage 3: Badger (300 XP)
        "🦅",      // Stage 4: Hawk (400 XP)
        "🐟",      // Stage 5: Barracuda (500 XP)
        "🐺",      // Stage 6: Coyote (600 XP)
        "🐗",      // Stage 7: Wild Boar (700 XP)
        "🐺",      // Stage 8: Wolf (800 XP)
        "🐊",      // Stage 9: Crocodile (900 XP)
        "🦈",      // Stage 10: Mako Shark (1000 XP)
        "🦈",      // Stage 11: Great White Shark (1100 XP)
        "🐋",      // Stage 12: Orca (1200 XP)
        "🦬",      // Stage 13: Bison (1300 XP)
        "🐂",      // Stage 14: Bull (1400 XP)
        "🐴",      // Stage 15: Stallion (1500 XP)
        "🐻",      // Stage 16: Grizzly Bear (1600 XP)
        "🐻‍❄️",    // Stage 17: Polar Bear (1700 XP)
        "🦏",      // Stage 18: Rhinoceros (1800 XP)
        "🦛",      // Stage 19: Hippopotamus (1900 XP)
        "🐘",      // Stage 20: Elephant (2000 XP)
        "🦍",      // Stage 21: Silver Back Gorilla (2100 XP)
        "🐃",      // Stage 22: Cape Buffalo (2200 XP)
        "🦁",      // Stage 23: Lion (2300 XP)
        "🦎",      // Stage 24: Komodo Dragon (2400 XP)
        "🦅",      // Stage 25: Eagle (2500 XP)
        "🔥",      // Stage 26: Phoenix (2600 XP)
        "🐉",      // Stage 27: Dragon (2700 XP)
        "👔",      // Stage 28: Human CEO (2800 XP)
        "👑",      // Stage 29: Golden CEO (2900 XP)
        "⭐"       // Stage 30: Legendary (3000 XP)
    ]
    
    let index = min(max(stageIndex, 0), emojis.count - 1)
    return emojis[index]
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
