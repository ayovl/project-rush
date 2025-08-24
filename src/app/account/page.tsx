import { Suspense } from 'react';
import AccountContent from './AccountContent';

// No server-side fetching is needed here anymore.
// RootLayout handles fetching user data and providing it via context.

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
