'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n';
import { useTournamentStore } from '@/lib/tournamentStore';
import { TeamCapacity, BracketFormat } from '@/types/tournament';
import { useRouter } from 'next/navigation';

export default function TournamentCreator() {
  const { t } = useI18n();
  const router = useRouter();
  const createTournament = useTournamentStore((s) => s.createTournament);

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<TeamCapacity>(24);
  const [format, setFormat] = useState<BracketFormat>('single');
  const [newTeam, setNewTeam] = useState('');
  const [teams, setTeams] = useState<string[]>([]);

  const handleAddTeam = () => {
    const trimmed = newTeam.trim();
    if (trimmed && teams.length < capacity && !teams.includes(trimmed)) {
      setTeams([...teams, trimmed]);
      setNewTeam('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTeam();
    }
  };

  const handleRemoveTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (name.trim() && teams.length >= 2) {
      createTournament(name.trim(), capacity, format, teams);
      router.push('/bracket');
    }
  };

  const capacityOptions: TeamCapacity[] = [12, 24, 32];

  return (
    <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-6 pb-16 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1 pt-2">
        <h2 className="text-3xl md:text-5xl font-bold text-on-surface font-[Sora] tracking-tight">
          {t.dashboard.title}
        </h2>
        <p className="text-base md:text-lg text-on-surface-variant">
          {t.dashboard.subtitle}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Settings */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant/50 rounded-xl p-6 shadow-sm relative overflow-hidden card-accent">
            <h3 className="text-xl font-semibold text-on-surface mb-6 flex items-center gap-2 font-[Sora]">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.dashboard.coreParams}
            </h3>

            <div className="flex flex-col gap-6">
              {/* Tournament Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface-variant" htmlFor="tname">
                  {t.dashboard.tournamentName}
                </label>
                <input
                  id="tname"
                  className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface text-base focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all placeholder:text-on-surface-variant/50"
                  placeholder={t.dashboard.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Capacity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-on-surface-variant">
                    {t.dashboard.teamCapacity}
                  </label>
                  <span className="text-sm text-secondary">{t.dashboard.capacityHint}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {capacityOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCapacity(c)}
                      className={`py-4 rounded-lg border text-xl font-extrabold font-[Sora] transition-all ${
                        capacity === c
                          ? 'border-primary bg-primary/10 text-primary shadow-[inset_0_0_12px_rgba(78,222,163,0.1)]'
                          : 'border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface-variant">
                  {t.dashboard.bracketFormat}
                </label>
                <div className="flex p-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg">
                  <button
                    onClick={() => setFormat('single')}
                    className={`flex-1 py-2 text-center rounded-md text-sm font-semibold transition-all ${
                      format === 'single'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t.dashboard.singleElimination}
                  </button>
                  <button
                    onClick={() => setFormat('double')}
                    className={`flex-1 py-2 text-center rounded-md text-sm font-semibold transition-all ${
                      format === 'double'
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t.dashboard.doubleElimination}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Roster */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          <div className="bg-surface border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-on-surface flex items-center gap-2 font-[Sora]">
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                {t.dashboard.participantRoster}
              </h3>
              <div className="bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant/50">
                <span className="text-lg font-extrabold text-primary font-[Sora]">{teams.length}</span>
                <span className="text-sm text-on-surface-variant">/{capacity}</span>
              </div>
            </div>

            {/* Add team input */}
            <div className="flex gap-2 mb-4 relative">
              <input
                className="flex-1 bg-surface-container-high border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-on-surface text-base focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/50"
                placeholder={t.dashboard.addTeamPlaceholder}
                value={newTeam}
                onChange={(e) => setNewTeam(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={50}
              />
              <button
                onClick={handleAddTeam}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-fixed transition-colors disabled:opacity-30"
                disabled={!newTeam.trim() || teams.length >= capacity}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Team list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {teams.map((team, i) => (
                <div
                  key={`${team}-${i}`}
                  className="flex items-center justify-between p-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-on-surface">{team}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveTeam(i)}
                    className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Empty slots */}
              {teams.length === 0 && (
                <div className="flex items-center justify-center p-4 bg-surface-container border border-dashed border-outline-variant rounded-lg opacity-50">
                  <span className="text-sm text-on-surface-variant flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.dashboard.awaitingEntries}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={!name.trim() || teams.length < 2}
          className="w-full md:w-auto px-8 py-3 bg-primary text-on-primary-fixed font-bold text-lg rounded-xl hover:bg-primary-fixed transition-all active:scale-95 shadow-[0_4px_24px_rgba(78,222,163,0.3)] flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed font-[Sora] relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
          </svg>
          <span className="relative z-10">{t.dashboard.generateBracket}</span>
        </button>
      </div>
    </div>
  );
}
