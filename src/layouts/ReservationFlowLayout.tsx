import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import type { ReservationHelpAction } from '../components/navigation/FocusedReservationHeader/FocusedReservationHeader';
import { FocusedReservationHeader } from '../components/navigation/FocusedReservationHeader/FocusedReservationHeader';

export interface ReservationFlowLayoutProps {
  onBack?(): void;
  onExit?(): void;
  helpAction?: ReservationHelpAction;
}

export function ReservationFlowLayout({ onBack, onExit, helpAction }: ReservationFlowLayoutProps) {
  return (
    <>
      <FocusedReservationHeader onBack={onBack} onExit={onExit} helpAction={helpAction} />
      <main>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
