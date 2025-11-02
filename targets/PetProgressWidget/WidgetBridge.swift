
import Foundation
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {
  
  private let appGroupIdentifier = "group.com.petprogress.app"
  
  // MARK: - Widget Timeline Management
  
  @objc
  func reloadAllTimelines(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    WidgetCenter.shared.reloadAllTimelines()
    resolve(nil)
  }
  
  @objc
  func reloadTimelines(_ kind: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    WidgetCenter.shared.reloadTimelines(ofKind: kind)
    resolve(nil)
  }
  
  @objc
  func getCurrentConfigurations(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    WidgetCenter.shared.getCurrentConfigurations { result in
      switch result {
      case .success(let configurations):
        let configData = configurations.map { config in
          return [
            "kind": config.kind,
            "family": "\(config.family)"
          ]
        }
        resolve(configData)
      case .failure(let error):
        reject("ERROR", "Failed to get configurations: \(error.localizedDescription)", error)
      }
    }
  }
  
  // MARK: - App Group Storage
  
  @objc
  func saveToAppGroup(_ key: String, value: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      reject("ERROR", "Failed to access App Group", nil)
      return
    }
    
    sharedDefaults.set(value, forKey: key)
    sharedDefaults.synchronize()
    resolve(nil)
  }
  
  @objc
  func loadFromAppGroup(_ key: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let sharedDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
      reject("ERROR", "Failed to access App Group", nil)
      return
    }
    
    let value = sharedDefaults.string(forKey: key)
    resolve(value)
  }
  
  // MARK: - React Native Bridge
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
