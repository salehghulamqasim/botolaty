'use client';

import TournamentCreator from '@/components/dashboard/TournamentCreator';
import TournamentArchive from '@/components/dashboard/TournamentArchive';

export default function DashboardPage() {
  return (
    <>
      <TournamentCreator />
      <TournamentArchive />
    </>
  );
}
