import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { Focus15StoreData, SessionLog } from './types';

export class PersistenceService {
  private filePath: string;
  private memoryCache: Focus15StoreData;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'focus15_data.json');
    this.memoryCache = this.loadData();
  }

  public getFilePath(): string {
    return this.filePath;
  }

  private getDefaultData(): Focus15StoreData {
    return {
      sessions: [],
      stopwatchByDate: {},
      settings: {
        alwaysOnTop: true,
      },
    };
  }

  private loadData(): Focus15StoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
          stopwatchByDate:
            typeof parsed.stopwatchByDate === 'object' && parsed.stopwatchByDate !== null
              ? parsed.stopwatchByDate
              : {},
          settings: {
            alwaysOnTop:
              typeof parsed.settings?.alwaysOnTop === 'boolean'
                ? parsed.settings.alwaysOnTop
                : true,
          },
        };
      }
    } catch (err) {
      console.error('[PersistenceService] Failed to load data, using defaults:', err);
    }
    return this.getDefaultData();
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('[PersistenceService] Error writing data to disk:', err);
      // Fallback direct write
      try {
        fs.writeFileSync(this.filePath, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
      } catch (innerErr) {
        console.error('[PersistenceService] Fallback direct write failed:', innerErr);
      }
    }
  }

  public getSessions(): SessionLog[] {
    return [...this.memoryCache.sessions];
  }

  public addSession(session: SessionLog): boolean {
    try {
      this.memoryCache.sessions.unshift(session);
      this.persist();
      return true;
    } catch (err) {
      console.error('[PersistenceService] Failed to add session:', err);
      return false;
    }
  }

  public getTodayStopwatchSeconds(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.memoryCache.stopwatchByDate[today] || 0;
  }

  public saveTodayStopwatchSeconds(seconds: number): boolean {
    try {
      const today = new Date().toISOString().slice(0, 10);
      this.memoryCache.stopwatchByDate[today] = Math.max(0, Math.floor(seconds));
      this.persist();
      return true;
    } catch (err) {
      console.error('[PersistenceService] Failed to save stopwatch seconds:', err);
      return false;
    }
  }

  public getSettings() {
    return { ...this.memoryCache.settings };
  }

  public updateSettings(settings: Partial<{ alwaysOnTop: boolean }>) {
    this.memoryCache.settings = {
      ...this.memoryCache.settings,
      ...settings,
    };
    this.persist();
  }
}
