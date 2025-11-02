
import { NativeModules, Platform } from 'react-native';

interface WidgetBridgeInterface {
  reloadAllTimelines: () => Promise<void>;
  reloadTimelines: (kind: string) => Promise<void>;
  getCurrentConfigurations: () => Promise<any[]>;
  saveToAppGroup: (key: string, value: string) => Promise<void>;
  loadFromAppGroup: (key: string) => Promise<string | null>;
}

// Mock implementation for development
const MockWidgetBridge: WidgetBridgeInterface = {
  reloadAllTimelines: async () => {
    console.log('[WidgetBridge] Mock: reloadAllTimelines called');
  },
  reloadTimelines: async (kind: string) => {
    console.log(`[WidgetBridge] Mock: reloadTimelines called for kind: ${kind}`);
  },
  getCurrentConfigurations: async () => {
    console.log('[WidgetBridge] Mock: getCurrentConfigurations called');
    return [];
  },
  saveToAppGroup: async (key: string, value: string) => {
    console.log(`[WidgetBridge] Mock: saveToAppGroup called - key: ${key}, value length: ${value.length}`);
  },
  loadFromAppGroup: async (key: string) => {
    console.log(`[WidgetBridge] Mock: loadFromAppGroup called - key: ${key}`);
    return null;
  },
};

// Use native module if available, otherwise use mock
const WidgetBridge: WidgetBridgeInterface = 
  Platform.OS === 'ios' && NativeModules.WidgetBridge 
    ? NativeModules.WidgetBridge 
    : MockWidgetBridge;

export default WidgetBridge;

/**
 * Reload all widget timelines
 */
export const reloadAllWidgets = async (): Promise<void> => {
  try {
    await WidgetBridge.reloadAllTimelines();
    console.log('[WidgetBridge] All widget timelines reloaded');
  } catch (error) {
    console.error('[WidgetBridge] Error reloading all timelines:', error);
  }
};

/**
 * Reload specific widget timeline by kind
 */
export const reloadWidget = async (kind: string = 'PetProgressWidget'): Promise<void> => {
  try {
    await WidgetBridge.reloadTimelines(kind);
    console.log(`[WidgetBridge] Widget timeline reloaded: ${kind}`);
  } catch (error) {
    console.error(`[WidgetBridge] Error reloading timeline ${kind}:`, error);
  }
};

/**
 * Get current widget configurations
 */
export const getWidgetConfigurations = async (): Promise<any[]> => {
  try {
    const configs = await WidgetBridge.getCurrentConfigurations();
    console.log('[WidgetBridge] Widget configurations:', configs);
    return configs;
  } catch (error) {
    console.error('[WidgetBridge] Error getting configurations:', error);
    return [];
  }
};

/**
 * Save data to App Group shared container
 */
export const saveToAppGroup = async (key: string, value: any): Promise<void> => {
  try {
    const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
    await WidgetBridge.saveToAppGroup(key, jsonString);
    console.log(`[WidgetBridge] Saved to App Group: ${key}`);
  } catch (error) {
    console.error(`[WidgetBridge] Error saving to App Group (${key}):`, error);
  }
};

/**
 * Load data from App Group shared container
 */
export const loadFromAppGroup = async (key: string): Promise<any | null> => {
  try {
    const jsonString = await WidgetBridge.loadFromAppGroup(key);
    if (jsonString) {
      const data = JSON.parse(jsonString);
      console.log(`[WidgetBridge] Loaded from App Group: ${key}`);
      return data;
    }
    return null;
  } catch (error) {
    console.error(`[WidgetBridge] Error loading from App Group (${key}):`, error);
    return null;
  }
};
