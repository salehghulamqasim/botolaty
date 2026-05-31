'use client';

import { useTournamentStore } from '@/lib/tournamentStore';
import { useI18n } from '@/i18n';
import { AccessRole } from '@/types/tournament';
import { useRumble } from '@/hooks/useRumble';
import React from 'react';

export default function AdminToggle() {
  const { accessRole, setAccessRole } = useTournamentStore();
  const { t } = useI18n();
  const { buzz } = useRumble();

  const roles: { key: AccessRole; label: string; icon: React.ReactNode }[] = [
    {
      key: 'admin',
      label: t.nav.adminMode,
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      key: 'public',
      label: t.nav.spectatorMode,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
        </svg>
      ),
    },
    {
      key: 'team',
      label: t.nav.teamView,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-outline-variant/50">
      {roles.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => {
            if (accessRole !== key) {
              buzz('light');
              setAccessRole(key);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
            ${accessRole === key
              ? 'bg-primary/20 text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'}`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
