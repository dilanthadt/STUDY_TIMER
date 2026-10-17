import React, { useEffect, useState, useRef, useCallback } from 'react';
import { formatStopwatchWithMs } from '../utils/format';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PermanentStopwatchProps {
  initialSeconds?: number;
  onTick?: (seconds: number) => void;
}

export const PermanentStopwatch: React.FC<PermanentStopwatchProps> = ({
  initialSeconds = 0,
  onTick,
}) => {
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const lastTimestampRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const lastSavedSecondsRef = useRef<number>(initialSeconds);

  // Synchronize when initialSeconds loads from persistence
  useEffect(() => {
    if (initialSeconds > 0) {
      setAccumulatedSeconds((prev) => Math.max(prev, initialSeconds));
      lastSavedSecondsRef.current = Math.max(lastSavedSecondsRef.current, initialSeconds);
    }
  }, [initialSeconds]);

  // Persist to disk periodically
  const persistSeconds = useCallback((sec: number) => {
    if (window.focus15API?.saveTodayStopwatchSeconds) {
      window.focus15API.saveTodayStopwatchSeconds(Math.floor(sec));
      lastSavedSecondsRef.current = sec;
    }
  }, []);

  // High-frequency ticker for millisecond display (~30fps)
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    lastTimestampRef.current = Date.now();

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = now;

      // Filter sleep gaps > 10s
      const sensibleDelta = deltaSec > 10 ? 0.05 : deltaSec;

      setAccumulatedSeconds((prev) => {
        const next = prev + sensibleDelta;
        onTick?.(next);

        // Auto-persist every 5 whole seconds
        if (Math.floor(next) - Math.floor(lastSavedSecondsRef.current) >= 5) {
          persistSeconds(next);
        }
        return next;
      });
    }, 35);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onTick, persistSeconds]);

  const toggleRunning = () => {
    if (isRunning) {
      persistSeconds(accumulatedSeconds);
      setIsRunning(false);
    } else {
      lastTimestampRef.current = Date.now();
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    lastTimestampRef.current = Date.now();
    setAccumulatedSeconds(0);
    persistSeconds(0);
    onTick?.(0);
  };

  const { main, ms } = formatStopwatchWithMs(accumulatedSeconds);

  return (
    <div className="mini-stopwatch-section">
      <div className="stopwatch-digits-row" onClick={toggleRunning} title="Click to Pause/Resume">
        <span className="stopwatch-main-digits neon-green">{main}</span>
        <span className="stopwatch-ms-digits neon-green-dim">{ms}</span>
      </div>

      <div className="stopwatch-unit-labels">
        <span>hr</span>
        <span>min</span>
        <span>sec</span>
      </div>

      <div className="stopwatch-mini-bar">
        <button
          type="button"
          onClick={toggleRunning}
          className={`mini-circle-btn ${isRunning ? 'running' : 'paused'}`}
          title={isRunning ? 'Pause Stopwatch' : 'Resume Stopwatch'}
          aria-label={isRunning ? 'Pause Stopwatch' : 'Resume Stopwatch'}
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="mini-circle-btn reset-btn"
          title="Reset Stopwatch"
          aria-label="Reset Stopwatch"
        >
          <RotateCcw size={11} />
        </button>
      </div>
    </div>
  );
};
