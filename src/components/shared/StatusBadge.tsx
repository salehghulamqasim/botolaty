'use client';

import { MatchStatus } from '@/types/tournament';
import { useI18n } from '@/i18n';

interface Props {
  status: MatchStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: Props) {
  const { t } = useI18n();

  const config = {
    upcoming: {
      bg: 'bg-surface-variant',
      text: 'text-on-surface-variant',
      label: t.bracket.upcoming,
      dot: false,
    },
    live: {
      bg: 'bg-tertiary-container/20',
      text: 'text-tertiary',
      label: t.bracket.live,
      dot: true,
    },
    completed: {
      bg: 'bg-primary-container/20',
      text: 'text-primary-fixed-dim',
      label: t.bracket.completed,
      dot: false,
    },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${c.bg} ${c.text} ${className}`}>
      {c.dot && <span className="w-2 h-2 rounded-full bg-tertiary pulse-live" />}
      {c.label}
    </span>
  );
}
