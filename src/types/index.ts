// Define the shape of the timestamp data
export interface TimestampData {
  timestamp: string;
  id: string;
  isNew?: boolean;
}

// Define grid position for timestamps in the right panel
export interface GridItem {
  id: string;
  timestampData: TimestampData;
  gridArea: string;
  position: { row: number; col: number };
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