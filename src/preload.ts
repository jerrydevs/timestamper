import { contextBridge, ipcRenderer } from 'electron';

interface TimestampData {
  id: string;
  timestamp: string;
  isNew?: boolean;
}

interface ElectronAPI {
  onTimestamp: (cb: (data: TimestampData) => void) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

contextBridge.exposeInMainWorld('electronAPI', {
  onTimestamp: (cb: (data: TimestampData) => void) => {
    ipcRenderer.on('timestamp-detected', (_event, timestamp) => {
      cb({
        ...timestamp,
        id: `timestamp-${Date.now() - Math.random()}`
      });
    });
  },

  startMonitoring: () => {
    ipcRenderer.send('start-monitoring');
  },
  stopMonitoring: () => {
    ipcRenderer.send('stop-monitoring');
  }
})

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}