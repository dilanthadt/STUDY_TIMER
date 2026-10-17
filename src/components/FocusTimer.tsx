import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Check, X } from 'lucide-react';
import { formatCountdownWithMs } from '../utils/format';
import { playCompletionChime } from '../utils/audio';
import { SessionLog, SessionStatus } from '../types';

const FOCUS_DURATION_SECONDS = 15 * 60; // 900 seconds

interface FocusTimerProps {
  onSessionLogged: (session: SessionLog) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionLogged }) => {
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');

  const [remainingSeconds, setRemainingSeconds] = useState<number>(FOCUS_DURATION_SECONDS);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedElapsedRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const sessionStartIsoRef = useRef<string>('');

  const recordSession = useCallback(
    (status: SessionStatus, finalElapsed: number) => {
      const session: SessionLog = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: taskTitle.trim(),
        type: '15min_focus',
        plannedSeconds: FOCUS_DURATION_SECONDS,
        elapsedSeconds: Math.min(FOCUS_DURATION_SECONDS, Math.max(1, Math.round(finalElapsed))),
        startedAt: sessionStartIsoRef.current || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        status,
        createdAt: new Date().toISOString(),
      };

      onSessionLogged(session);
    },
    [taskTitle, onSessionLogged]
  );

  const clearIntervalTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStart = () => {
    const trimmed = taskTitle.trim();
    if (!trimmed) {
      setHasError(true);
      return;
    }
    setHasError(false);

    startTimeRef.current = Date.now();
    if (timerState === 'idle') {
      sessionStartIsoRef.current = new Date().toISOString();
      accumulatedElapsedRef.current = 0;
      setRemainingSeconds(FOCUS_DURATION_SECONDS);
    }
    setTimerState('running');
  };

  const handlePause = () => {
    if (timerState !== 'running') return;
    clearIntervalTimer();

    if (startTimeRef.current) {
      const delta = (Date.now() - startTimeRef.current) / 1000;
      accumulatedElapsedRef.current += delta;
      setRemainingSeconds(Math.max(0, FOCUS_DURATION_SECONDS - accumulatedElapsedRef.current));
    }
    startTimeRef.current = null;
    setTimerState('paused');
  };

  const handleResume = () => {
    startTimeRef.current = Date.now();
    setTimerState('running');
  };

  const handleReset = () => {
    clearIntervalTimer();
    let currentElapsed = accumulatedElapsedRef.current;
    if (timerState === 'running' && startTimeRef.current) {
      currentElapsed += (Date.now() - startTimeRef.current) / 1000;
    }

    if (currentElapsed >= 5 && taskTitle.trim()) {
      recordSession('reset', currentElapsed);
    }

    accumulatedElapsedRef.current = 0;
    startTimeRef.current = null;
    setRemainingSeconds(FOCUS_DURATION_SECONDS);
    setTimerState('idle');
  };

  const handleFinishEarly = () => {
    clearIntervalTimer();
    let currentElapsed = accumulatedElapsedRef.current;
    if (timerState === 'running' && startTimeRef.current) {
      currentElapsed += (Date.now() - startTimeRef.current) / 1000;
    }

    playCompletionChime();
    recordSession('completed', currentElapsed);

    accumulatedElapsedRef.current = 0;
    startTimeRef.current = null;
    setRemainingSeconds(0);
    setTimerState('completed');
  };

  const handleCancel = () => {
    clearIntervalTimer();
    let currentElapsed = accumulatedElapsedRef.current;
    if (timerState === 'running' && startTimeRef.current) {
      currentElapsed += (Date.now() - startTimeRef.current) / 1000;
    }

    if (taskTitle.trim()) {
      recordSession('cancelled', currentElapsed);
    }

    accumulatedElapsedRef.current = 0;
    startTimeRef.current = null;
    setRemainingSeconds(FOCUS_DURATION_SECONDS);
    setTimerState('idle');
  };

  const handleNextBlock = () => {
    setTimerState('idle');
    setRemainingSeconds(FOCUS_DURATION_SECONDS);
    accumulatedElapsedRef.current = 0;
    startTimeRef.current = null;
    setTaskTitle('');
    setHasError(false);
  };

  // High-frequency countdown loop with millisecond precision
  useEffect(() => {
    if (timerState !== 'running') {
      clearIntervalTimer();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      const now = Date.now();
      const deltaSec = (now - startTimeRef.current) / 1000;
      const totalElapsed = accumulatedElapsedRef.current + deltaSec;
      const remaining = Math.max(0, FOCUS_DURATION_SECONDS - totalElapsed);

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearIntervalTimer();
        playCompletionChime();
        recordSession('completed', FOCUS_DURATION_SECONDS);
        setTimerState('completed');
        accumulatedElapsedRef.current = 0;
        startTimeRef.current = null;
      }
    }, 35);

    return () => {
      clearIntervalTimer();
    };
  }, [timerState, recordSession]);

  const { main, ms } = formatCountdownWithMs(remainingSeconds);
  const isEndingSoon = timerState === 'running' && remainingSeconds > 0 && remainingSeconds <= 60;

  return (
    <div className={`mini-timer-section state-${timerState} ${isEndingSoon ? 'ending-soon' : ''}`}>
      {/* Title input */}
      <div className="mini-title-wrap">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => {
            setTaskTitle(e.target.value);
            if (hasError) setHasError(false);
          }}
          placeholder={hasError ? 'Title is required!' : 'Enter study task...'}
          disabled={timerState === 'running' || timerState === 'paused'}
          className={`mini-title-input ${hasError ? 'error' : ''}`}
          maxLength={80}
        />
      </div>

      {/* 15:00 Countdown Digits with Milliseconds (Blinks Neon Red when ending soon) */}
      <div className={`mini-countdown-digits-row ${isEndingSoon ? 'blink-red' : ''}`}>
        <span className={`countdown-main-digits ${isEndingSoon ? 'neon-red' : 'neon-yellow'}`}>{main}</span>
        <span className={`countdown-ms-digits ${isEndingSoon ? 'neon-red-dim' : 'neon-yellow-dim'}`}>{ms}</span>
      </div>

      {/* Mini Controls */}
      <div className="mini-controls-row">
        {timerState === 'idle' && (
          <button
            type="button"
            onClick={handleStart}
            className="action-circle-btn btn-neon-yellow"
            title="Start 15-Minute Focus"
            aria-label="Start Focus"
          >
            <Play size={14} fill="currentColor" />
          </button>
        )}

        {timerState === 'running' && (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="action-circle-btn btn-amber"
              title="Pause"
              aria-label="Pause"
            >
              <Pause size={13} />
            </button>
            <button
              type="button"
              onClick={handleFinishEarly}
              className="action-circle-btn btn-green"
              title="Finish Early (Completed)"
              aria-label="Finish Early"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="action-circle-btn btn-ghost"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw size={12} />
            </button>
          </>
        )}

        {timerState === 'paused' && (
          <>
            <button
              type="button"
              onClick={handleResume}
              className="action-circle-btn btn-neon-yellow"
              title="Resume"
              aria-label="Resume"
            >
              <Play size={13} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="action-circle-btn btn-ghost"
              title="Cancel session"
              aria-label="Cancel"
            >
              <X size={13} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="action-circle-btn btn-ghost"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw size={12} />
            </button>
          </>
        )}

        {timerState === 'completed' && (
          <button
            type="button"
            onClick={handleNextBlock}
            className="action-pill-btn btn-neon-yellow"
            title="Start next block"
          >
            <Play size={12} fill="currentColor" />
            <span>Next Sprint</span>
          </button>
        )}
      </div>
    </div>
  );
};
