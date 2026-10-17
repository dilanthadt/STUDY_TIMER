import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Check, XCircle, RotateCcw } from 'lucide-react';
import { SessionLog } from '../types';
import { formatMS, formatTimeOfDay } from '../utils/format';

interface HistorySectionProps {
  sessions: SessionLog[];
}

export const HistorySection: React.FC<HistorySectionProps> = ({ sessions }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Filter for today's sessions
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.startedAt.startsWith(todayStr));

  return (
    <section className="history-section">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="history-toggle-bar"
        aria-expanded={isOpen}
      >
        <div className="history-title-wrap">
          <History size={13} className="text-gray-500" />
          <span className="history-toggle-text">Today’s Session History</span>
          <span className="history-counter-badge">{todaySessions.length}</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="history-drawer">
          {todaySessions.length === 0 ? (
            <div className="history-empty">
              No sessions recorded yet today. Complete your first 15m focus block!
            </div>
          ) : (
            <div className="history-list">
              {todaySessions.map((item) => {
                const isCompleted = item.status === 'completed';
                const isReset = item.status === 'reset';
                const isCancelled = item.status === 'cancelled';

                return (
                  <div key={item.id} className={`history-item status-${item.status}`}>
                    <div className="history-item-top">
                      <span className="history-item-title" title={item.title}>
                        {item.title}
                      </span>
                      <span className={`status-badge badge-${item.status}`}>
                        {isCompleted && <Check size={10} />}
                        {isReset && <RotateCcw size={10} />}
                        {isCancelled && <XCircle size={10} />}
                        <span>{item.status.toUpperCase()}</span>
                      </span>
                    </div>

                    <div className="history-item-meta">
                      <span className="meta-time">{formatTimeOfDay(item.startedAt)}</span>
                      <span className="meta-dot">•</span>
                      <span className="meta-duration">
                        Focused: {formatMS(item.elapsedSeconds)}
                        {item.status !== 'completed' && ` (of 15:00)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
