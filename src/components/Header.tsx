import React from 'react';
import { Pin, Minus, X, BarChart2 } from 'lucide-react';

interface HeaderProps {
  isAlwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onOpenDetails: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAlwaysOnTop,
  onToggleAlwaysOnTop,
  onMinimize,
  onClose,
  onOpenDetails,
}) => {
  return (
    <header className="mini-header">
      <div className="mini-header-brand">
        <span className="mini-brand-dot" />
        <span className="mini-brand-title">Focus15</span>
      </div>

      <div className="mini-header-actions no-drag">
        <button
          type="button"
          onClick={onOpenDetails}
          className="mini-header-btn"
          title="View Today's Details & History"
          aria-label="View Details"
        >
          <BarChart2 size={13} />
        </button>

        <button
          type="button"
          onClick={onToggleAlwaysOnTop}
          className={`mini-header-btn ${isAlwaysOnTop ? 'pinned' : ''}`}
          title={isAlwaysOnTop ? 'Always On Top (Active)' : 'Always On Top (Disabled)'}
          aria-label="Always On Top"
        >
          <Pin size={12} className={isAlwaysOnTop ? 'pin-active-icon' : ''} />
        </button>

        <button
          type="button"
          onClick={onMinimize}
          className="mini-header-btn"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus size={13} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mini-header-btn close-btn"
          title="Hide to tray"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      </div>
    </header>
  );
};
