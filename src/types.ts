export type SessionStatus = 'completed' | 'reset' | 'cancelled';

export interface SessionLog {
  id: string;
  title: string;
  type: string;
  plannedSeconds: number;
  elapsedSeconds: number;
  startedAt: string;
  endedAt: string;
  status: SessionStatus;
  createdAt: string;
}

export interface Focus15API {
  getSessions: () => Promise<SessionLog[]>;
  saveSession: (session: SessionLog) => Promise<boolean>;
  getTodayStopwatchSeconds: () => Promise<number>;
  saveTodayStopwatchSeconds: (seconds: number) => Promise<boolean>;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  toggleAlwaysOnTop: (enabled?: boolean) => Promise<boolean>;
  isAlwaysOnTop: () => Promise<boolean>;
}

declare global {
  interface Window {
    focus15API?: Focus15API;
  }
}
