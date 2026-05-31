'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import { TournamentLifecycle } from '@/types/tournament';

export default function TournamentArchive() {
  const allTournaments = useTournamentStore((s) => s.getVisibleTournaments());
  const activeTournamentId = useTournamentStore((s) => s.activeTournamentId);
  const setActiveTournament = useTournamentStore((s) => s.setActiveTournament);
  const updateTournamentStatus = useTournamentStore((s) => s.updateTournamentStatus);
  const deleteTournament = useTournamentStore((s) => s.deleteTournament);
  const { t } = useI18n();

  const nonActive = allTournaments.filter((t) => t.id !== activeTournamentId);
  const active = allTournaments.filter((t) => t.lifecycle !== 'completed');
  const archived = allTournaments.filter((t) => t.lifecycle === 'completed');

  if (allTournaments.length <= 1 && !activeTournamentId) return null;

  const lifecycleLabel = (lc: TournamentLifecycle) => {
    switch (lc) {
      case 'draft': return t.shared.draft;
      case 'active': return t.shared.active;
      case 'completed': return t.shared.finished;
    }
  };

  const lifecycleColor = (lc: TournamentLifecycle) => {
    switch (lc) {
      case 'draft': return 'bg-secondary/10 text-secondary';
      case 'active': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <div className="mt-10 space-y-6">
      {/* Active Tournaments */}
      {active.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            {t.dashboard.activeTournaments} ({active.length})
          </h3>
          <div className="flex flex-col gap-2">
            {active.map((tourney) => (
              <TournamentRow
                key={tourney.id}
                tourney={tourney}
                isCurrent={tourney.id === activeTournamentId}
                onOpen={() => setActiveTournament(tourney.id)}
                onStatusChange={(lc) => updateTournamentStatus(tourney.id, lc)}
                onDelete={() => deleteTournament(tourney.id)}
                lifecycleLabel={lifecycleLabel}
                lifecycleColor={lifecycleColor}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived Tournaments */}
      {archived.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            {t.dashboard.previousTournaments} ({archived.length})
          </h3>
          <div className="flex flex-col gap-2">
            {archived.map((tourney) => (
              <TournamentRow
                key={tourney.id}
                tourney={tourney}
                isCurrent={false}
                onOpen={() => setActiveTournament(tourney.id)}
                onStatusChange={(lc) => updateTournamentStatus(tourney.id, lc)}
                onDelete={() => deleteTournament(tourney.id)}
                lifecycleLabel={lifecycleLabel}
                lifecycleColor={lifecycleColor}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {nonActive.length === 0 && (
        <div className="text-center py-6 text-on-surface-variant/50 text-sm">
          {t.dashboard.noArchives}
        </div>
      )}
    </div>
  );
}

function TournamentRow({
  tourney,
  isCurrent,
  onOpen,
  onStatusChange,
  onDelete,
  lifecycleLabel,
  lifecycleColor,
  t,
}: {
  tourney: ReturnType<typeof useTournamentStore.getState>['tournaments'][number];
  isCurrent: boolean;
  onOpen: () => void;
  onStatusChange: (lc: TournamentLifecycle) => void;
  onDelete: () => void;
  lifecycleLabel: (lc: TournamentLifecycle) => string;
  lifecycleColor: (lc: TournamentLifecycle) => string;
  t: any;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all
      ${isCurrent
        ? 'bg-primary/5 border-primary/25 shadow-sm shadow-primary/5'
        : 'bg-surface-container border-outline-variant/20 hover:border-outline-variant/40'}`}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-on-surface truncate">{tourney.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lifecycleColor(tourney.lifecycle)}`}>
            {lifecycleLabel(tourney.lifecycle)}
          </span>
          {isCurrent && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <div className="text-xs text-on-surface-variant/70">
          {tourney.teams.length} {t.dashboard.teamsCount} · {tourney.capacity}-slot · {new Date(tourney.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isCurrent && (
          <button
            onClick={onOpen}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold
              bg-primary/10 text-primary hover:bg-primary/20
              transition-colors"
          >
            {t.dashboard.setActive}
          </button>
        )}

        {/* Lifecycle toggle */}
        {tourney.lifecycle !== 'completed' ? (
          <button
            onClick={() => onStatusChange('completed')}
            className="px-2 py-1.5 rounded-lg text-xs font-semibold
              bg-surface-container-highest text-on-surface-variant
              hover:bg-surface-container-hover transition-colors"
            title={t.dashboard.markCompleted}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => onStatusChange('active')}
            className="px-2 py-1.5 rounded-lg text-xs font-semibold
              bg-surface-container-highest text-on-surface-variant
              hover:bg-surface-container-hover transition-colors"
            title={t.dashboard.reopen}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        )}

        {/* Delete */}
        <button
          onClick={onDelete}
          className="px-2 py-1.5 rounded-lg text-xs font-semibold
            text-on-surface-variant/40 hover:text-error hover:bg-error/5
            transition-colors"
          title={t.shared.delete}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
