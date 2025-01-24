'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  return (
    <header className="fixed w-full top-0 bg-black text-white p-4 z-10">
      <nav className="flex justify-end">
        <ConnectButton />
      </nav>
    </header>
  );
} 