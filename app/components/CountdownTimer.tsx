'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Target date: March 25, 2025 at 12:00 ET
    const targetDate = new Date('March 25, 2025 12:00:00 EDT');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Timer expired
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };
    
    // Update the countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);
  
  // Format numbers to always have two digits
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };
  
  return (
    <div className="countdown-timer mt-6 mb-8 text-center">
      <div className="flex justify-center gap-4 text-gray-200">
        <div className="flex flex-col items-center">
          <div className="text-2xl">{timeLeft.days}</div>
          <div className="text-sm">DAYS</div>
        </div>
        <div className="text-2xl">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl">{formatNumber(timeLeft.hours)}</div>
          <div className="text-sm">HOURS</div>
        </div>
        <div className="text-2xl">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-sm">MINS</div>
        </div>
        <div className="text-2xl">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl">{formatNumber(timeLeft.seconds)}</div>
          <div className="text-sm">SECS</div>
        </div>
      </div>
    </div>
  );
} 