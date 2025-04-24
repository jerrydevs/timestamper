// Define the shape of the timestamp data
export interface TimestampData {
  timestamp: string;
  id: string;
}

// Define grid position for timestamps in the right panel
export interface GridItem {
  id: string;
  timestampData: TimestampData;
  position: { x: number; y: number };
  isNew?: boolean;
}

// Define the Electron API
export interface ElectronAPI {
  onTimestamp: (callback: (data: TimestampData) => void) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

// Extend the Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}