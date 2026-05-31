'use client';

import { useState, useRef, useEffect } from 'react';
import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import { SearchResult } from '@/types/tournament';

export default function SearchBar() {
  const { t } = useI18n();
  const tournaments = useTournamentStore((s) => s.getVisibleTournaments());
  const setActiveTournament = useTournamentStore((s) => s.setActiveTournament);
  const getAllTeamNames = useTournamentStore((s) => s.getAllTeamNames);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results: SearchResult[] = [];
  if (query.trim()) {
    const q = query.toLowerCase();
    // Tournament matches
    tournaments.forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        results.push({ type: 'tournament', id: t.id, label: t.name, subtitle: t.lifecycle });
      }
    });
    // Team matches
    getAllTeamNames().forEach((name) => {
      if (name.toLowerCase().includes(q)) {
        results.push({ type: 'team', id: name, label: name, subtitle: t.team.profile });
      }
    });
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={t.nav.search}
          className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface
            placeholder:text-on-surface-variant/50
            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
            transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.trim() && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-on-surface-variant text-center">{t.search.noResults}</div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.type}-${r.id}-${i}`}
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                  if (r.type === 'tournament') {
                    setActiveTournament(r.id);
                    window.location.href = '/bracket';
                  } else {
                    setSelectedTeam(r.label);
                  }
                }}
                className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-b-0"
              >
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                  ${r.type === 'tournament' ? 'bg-primary-container/30 text-primary' : 'bg-tertiary-container/20 text-tertiary'}`}
                >
                  {r.type === 'tournament' ? '🏆' : '👤'}
                </span>
                <div>
                  <div className="text-sm font-semibold text-on-surface">{r.label}</div>
                  <div className="text-xs text-on-surface-variant">{r.subtitle}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
