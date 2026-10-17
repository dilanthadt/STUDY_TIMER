import { contextBridge, ipcRenderer } from 'electron';
import { Focus15API, SessionLog } from './types';

const api: Focus15API = {
  getSessions: (): Promise<SessionLog[]> => ipcRenderer.invoke('focus15:getSessions'),
  saveSession: (session: SessionLog): Promise<boolean> => ipcRenderer.invoke('focus15:saveSession', session),
  getTodayStopwatchSeconds: (): Promise<number> => ipcRenderer.invoke('focus15:getTodayStopwatchSeconds'),
  saveTodayStopwatchSeconds: (seconds: number): Promise<boolean> => ipcRenderer.invoke('focus15:saveTodayStopwatchSeconds', seconds),
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('focus15:minimizeWindow'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('focus15:closeWindow'),
  toggleAlwaysOnTop: (enabled?: boolean): Promise<boolean> => ipcRenderer.invoke('focus15:toggleAlwaysOnTop', enabled),
  isAlwaysOnTop: (): Promise<boolean> => ipcRenderer.invoke('focus15:isAlwaysOnTop'),
};

contextBridge.exposeInMainWorld('focus15API', api);
