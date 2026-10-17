import React from 'react';
import { CheckCircle, Flame, Lightbulb } from 'lucide-react';
import { formatFriendlyDuration } from '../utils/format';

interface SummarySectionProps {
  completedCount: number;
  totalFocusSeconds: number;
  totalAppSeconds: number;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  completedCount,
  totalFocusSeconds,
  totalAppSeconds,
}) => {
  // Focus efficiency ratio
  const ratioPercent =
    totalAppSeconds > 0
      ? Math.min(100, Math.round((totalFocusSeconds / totalAppSeconds) * 100))
      : 0;

  return (
    <section className="summary-section">
      <div className="summary-grid">
        {/* Completed Blocks */}
        <div className="summary-card card-yellow">
          <div className="summary-card-header">
            <CheckCircle size={13} className="text-amber-700" />
            <span className="summary-card-title">BLOCKS TODAY</span>
          </div>
          <div className="summary-card-value">{completedCount}</div>
          <div className="summary-card-desc">15-min focus blocks</div>
        </div>

        {/* Total Intentional Focus Time */}
        <div className="summary-card card-lavender">
          <div className="summary-card-header">
            <Flame size={13} className="text-purple-700" />
            <span className="summary-card-title">INTENTIONAL FOCUS</span>
          </div>
          <div className="summary-card-value">
            {formatFriendlyDuration(totalFocusSeconds)}
          </div>
          <div className="summary-card-desc">
            {totalAppSeconds > 0 ? `${ratioPercent}% of active time` : 'Active focus logged'}
          </div>
        </div>
      </div>

      {/* Understated Parkinson's Law micro-reminder */}
      <div className="parkinson-tip">
        <Lightbulb size={12} className="tip-icon" />
        <span>Parkinson’s Law: Work expands to fill available time. 15m forces urgency.</span>
      </div>
    </section>
  );
};
