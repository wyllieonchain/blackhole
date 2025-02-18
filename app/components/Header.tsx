'use client';
import Image from 'next/image'
import { useState } from 'react'
import HowItWorksModal from './HowItWorksModal'
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-transparent text-white p-4 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="px-6">
            <div 
              onClick={() => setIsModalOpen(true)}
              className="text-white cursor-pointer text-base hover:text-gray-300 transition-colors"
            >
              How it Works
            </div>
          </div>
          
          <div className="flex items-center">
            <a 
              href="https://x.com/bidBlackhole" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity mr-6"
            >
              <Image
                src="/Xlogo.svg"
                alt="X (Twitter) Logo"
                width={24}
                height={24}
              />
            </a>
            <div className="min-w-[140px]">
              <ConnectButton/>
            </div>
          </div>
        </div>
      </header>

      <HowItWorksModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 