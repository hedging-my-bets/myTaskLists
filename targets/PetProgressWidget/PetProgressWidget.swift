
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
        
        // Calculate next refresh time based on grace minutes
        let graceMinutes = widgetState?.graceMinutes ?? 0
        let nextUpdate = nextBoundaryConsideringGrace(Date(), graceMinutes: graceMinutes)
        
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
    
    // Load widget state from App Group shared container
    private func loadWidgetState() -> WidgetState? {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.petprogress.app"),
              let jsonString = sharedDefaults.string(forKey: "@PetProgress:widgetState"),
              let jsonData = jsonString.data(using: .utf8) else {
            return nil
        }
        
        do {
            let state = try JSONDecoder().decode(WidgetState.self, from: jsonData)
            return state
        } catch {
            print("Error decoding widget state: \(error)")
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
                VStack {
                    Text("🥚")
                        .font(.system(size: 50))
                    Text("No tasks")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "#A8B1C7"))
                }
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
                VStack {
                    Text("🥚")
                        .font(.system(size: 50))
                    Text("No tasks today")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "#A8B1C7"))
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
    let emojis = [
        "🥚", "🐔", "🦡", "🦡", "🦅", "🐟", "🐺", "🐗", "🐺", "🐊",
        "🦈", "🦈", "🐋", "🦬", "🐂", "🐴", "🐻", "🐻‍❄️", "🦏", "🦛",
        "🐘", "🦍", "🐃", "🦁", "🦎", "🦅", "🔥", "🐉", "👔", "👑"
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
