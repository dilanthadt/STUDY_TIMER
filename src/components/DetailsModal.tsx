import React from 'react';
import { X, Check, RotateCcw, XCircle, Award, Clock, Flame } from 'lucide-react';
import { SessionLog } from '../types';
import { formatMS, formatFriendlyDuration, formatTimeOfDay } from '../utils/format';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionLog[];
  totalStopwatchSeconds: number;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  isOpen,
  onClose,
  sessions,
  totalStopwatchSeconds,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.startedAt.startsWith(todayStr));
  const completedCount = todaySessions.filter((s) => s.status === 'completed').length;
  const totalFocusSec = todaySessions.reduce((acc, curr) => acc + curr.elapsedSeconds, 0);

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="details-header">
          <div className="details-header-title">
            <Award size={14} className="text-amber-400" />
            <span>Today's Study Log</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="details-close-btn"
            title="Close details"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Quick summary stats */}
        <div className="details-stats-row">
          <div className="stat-pill stat-blocks">
            <span className="stat-num">{completedCount}</span>
            <span className="stat-lbl">Blocks Done</span>
          </div>
          <div className="stat-pill stat-focus">
            <Flame size={12} className="text-orange-400" />
            <span className="stat-num">{formatFriendlyDuration(totalFocusSec)}</span>
          </div>
          <div className="stat-pill stat-total">
            <Clock size={11} className="text-gray-400" />
            <span className="stat-num">{formatFriendlyDuration(totalStopwatchSeconds)}</span>
          </div>
        </div>

        {/* Session history list */}
        <div className="details-list-wrap">
          {todaySessions.length === 0 ? (
            <div className="details-empty">
              No sessions logged yet today. Complete your first 15m focus block!
            </div>
          ) : (
            <div className="details-items">
              {todaySessions.map((item) => (
                <div key={item.id} className={`modal-session-card status-${item.status}`}>
                  <div className="session-card-row1">
                    <span className="session-title" title={item.title}>
                      {item.title}
                    </span>
                    <span className={`modal-status-badge badge-${item.status}`}>
                      {item.status === 'completed' && <Check size={10} />}
                      {item.status === 'reset' && <RotateCcw size={10} />}
                      {item.status === 'cancelled' && <XCircle size={10} />}
                      <span>{item.status.toUpperCase()}</span>
                    </span>
                  </div>
                  <div className="session-card-row2">
                    <span>{formatTimeOfDay(item.startedAt)}</span>
                    <span>•</span>
                    <span>Focused: {formatMS(item.elapsedSeconds)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
