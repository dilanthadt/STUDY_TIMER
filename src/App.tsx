import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PermanentStopwatch } from './components/PermanentStopwatch';
import { FocusTimer } from './components/FocusTimer';
import { DetailsModal } from './components/DetailsModal';
import { SessionLog } from './types';

export const App: React.FC = () => {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState<boolean>(true);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [initialStopwatchSeconds, setInitialStopwatchSeconds] = useState<number>(0);
  const [currentAppSeconds, setCurrentAppSeconds] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Load initial settings and data from Electron persistence layer or localStorage fallback
  useEffect(() => {
    async function initData() {
      if (window.focus15API) {
        try {
          const [loadedSessions, initialSec, alwaysOnTopState] = await Promise.all([
            window.focus15API.getSessions(),
            window.focus15API.getTodayStopwatchSeconds(),
            window.focus15API.isAlwaysOnTop(),
          ]);

          setSessions(loadedSessions || []);
          setInitialStopwatchSeconds(initialSec || 0);
          setCurrentAppSeconds(initialSec || 0);
          setIsAlwaysOnTop(alwaysOnTopState);
        } catch (err) {
          console.error('[App] Failed to load initial data:', err);
        }
      } else {
        try {
          const storedSessions = localStorage.getItem('focus15_sessions');
          const storedSec = localStorage.getItem('focus15_stopwatch');
          if (storedSessions) setSessions(JSON.parse(storedSessions));
          if (storedSec) {
            const sec = parseInt(storedSec, 10);
            setInitialStopwatchSeconds(sec);
            setCurrentAppSeconds(sec);
          }
        } catch {
          // ignore
        }
      }
    }

    initData();
  }, []);

  const handleToggleAlwaysOnTop = async () => {
    if (window.focus15API) {
      const next = await window.focus15API.toggleAlwaysOnTop();
      setIsAlwaysOnTop(next);
    } else {
      setIsAlwaysOnTop((prev) => !prev);
    }
  };

  const handleMinimize = () => {
    window.focus15API?.minimizeWindow();
  };

  const handleClose = () => {
    window.focus15API?.closeWindow();
  };

  const handleSessionLogged = useCallback(async (session: SessionLog) => {
    setSessions((prev) => {
      const updated = [session, ...prev];
      if (!window.focus15API) {
        try {
          localStorage.setItem('focus15_sessions', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
    if (window.focus15API?.saveSession) {
      await window.focus15API.saveSession(session);
    }
  }, []);

  return (
    <div className="mini-app-shell">
      {/* Draggable mini header */}
      <Header
        isAlwaysOnTop={isAlwaysOnTop}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        onMinimize={handleMinimize}
        onClose={handleClose}
        onOpenDetails={() => setIsDetailsOpen((prev) => !prev)}
      />

      {/* Main Square Widget Body */}
      <main className="mini-widget-body">
        {/* 1. Permanent Stopwatch with Milliseconds */}
        <PermanentStopwatch
          initialSeconds={initialStopwatchSeconds}
          onTick={(sec) => setCurrentAppSeconds(sec)}
        />

        {/* Subtle sleek divider */}
        <div className="mini-widget-divider" />

        {/* 2. 15-Minute Focus Timer with Title */}
        <FocusTimer onSessionLogged={handleSessionLogged} />
      </main>

      {/* 3. Pop-up Details Modal */}
      <DetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        sessions={sessions}
        totalStopwatchSeconds={currentAppSeconds}
      />
    </div>
  );
};

export default App;
