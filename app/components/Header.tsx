'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 p-4">
      <div className="max-w-7xl mx-auto flex justify-end">
        <ConnectButton />
      </div>
    </header>
  );
} 