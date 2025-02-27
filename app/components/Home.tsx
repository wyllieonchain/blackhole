'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { waitForTransactionReceipt, writeContract, simulateContract } from '@wagmi/core';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Header from './Header';
import currency from 'currency.js';
import VaultABI from '../contracts/USDC20Vault.sol/USDC20Vault.json';
import USDCABI from "../contracts/USDC20.sol/USDC20.json";
import config from '../lib/wagmi';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

interface ShootingOrb {
  x: number;
  y: number;
  active: boolean;
}

interface HomeProps {
  vaultData: {
    hasStarted: boolean
    prizePool: string
    highestBid: string
    highestBidder: string
    lastBidTime: string
    nextBidAmount: string
    isGameOver: boolean
    isClaimed: boolean
    timeRemaining: number
  }
}

export default function Home({ vaultData }: HomeProps) {


  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef({ x: 0, y: 0 })
  const orbsRef = useRef<ShootingOrb[]>([])
  const targetRef = useRef({ x: 0, y: 0 })
  const TIMER_DURATION = 60;

  const formattedPrizePool = currency(Number(vaultData.prizePool || 0) / 1e6).format()
  const formattedHighestBid = currency(Number(vaultData.highestBid || 0) / 1e6).format()
  const formattedNextBid = currency(Number(vaultData.nextBidAmount || 0) / 1e6).format()
  const formattedRefundAmount = currency((Number(vaultData.nextBidAmount || 0) / 1e6) / 1.02).format()
  const shortenedBidder = vaultData.highestBidder ? `${vaultData.highestBidder.substring(0, 7)}...` : '0x00000...'

  const { isConnected, address } = useAccount();
  // const publicClient = usePublicClient();


  const [showCustomCursor, setShowCustomCursor] = useState(true)
  const [timeLeft, setTimeLeft] = useState(vaultData.timeRemaining);
  const [hasClaimed, setHasClaimed] = useState(false)
  const [isWinner, setIsWinner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDCABI.abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, VAULT_ADDRESS]
  });

  // Add these new state variables for the animation
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const targetValue = Number(vaultData.prizePool || 0) / 1e6;
  
  // Format the animated value
  const formattedAnimatedValue = currency(animatedValue).format();
  
  // Animation effect
  useEffect(() => {
    if (!isAnimating) return;
    
    // Start from a lower value (about 10% of the target)
    let startValue = Math.max(1, targetValue * 0.1);
    setAnimatedValue(startValue);
    
    // Calculate animation duration and steps
    const duration = 2000; // 2 seconds
    const steps = 30;
    const stepDuration = duration / steps;
    
    // Use logarithmic increments for a more dramatic effect
    const increment = (targetValue - startValue) / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        setAnimatedValue(targetValue);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        // Accelerating increment formula
        const progress = currentStep / steps;
        const easedProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const newValue = startValue + (targetValue - startValue) * easedProgress;
        setAnimatedValue(newValue);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [targetValue, isAnimating]);
  
  // Reset animation when prize pool changes
  useEffect(() => {
    setIsAnimating(true);
  }, [vaultData.prizePool]);

  useEffect(() => {
    setIsClient(true);
  }, [vaultData]);

  useEffect(() => {
    if (vaultData.isGameOver && address === vaultData.highestBidder) {
      setIsWinner(true);
    }
  }, [vaultData.isGameOver, address]);

  // Update timer based on lastBidTime
  useEffect(() => {
    if (!vaultData.lastBidTime) return

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const timeSinceLastBid = now - Number(vaultData.lastBidTime)
      const timeRemaining = TIMER_DURATION - timeSinceLastBid
      setTimeLeft(timeRemaining > 0 ? timeRemaining : 0)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [vaultData.lastBidTime])

  // Initialize cursor effect immediately
  useEffect(() => {
    document.body.style.cursor = 'none'

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    cursorRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }
    targetRef.current = {
      x: window.innerWidth / 2,
      y: canvas.height / 2
    }

    const updateCanvasSize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      targetRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2
      }
    }
    window.addEventListener('resize', updateCanvasSize)

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX
      cursorRef.current.y = e.clientY
    }
    document.addEventListener('mousemove', handleMouseMove)

    const handleClick = (e: MouseEvent) => {
      orbsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        active: true
      })
    }
    document.addEventListener('click', handleClick)

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (showCustomCursor) {
        // Draw cursor
        ctx.beginPath()
        ctx.arc(cursorRef.current.x, cursorRef.current.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()

        // Draw orbs
        orbsRef.current = orbsRef.current.filter(orb => {
          if (!orb.active) return false

          let dx = targetRef.current.x - orb.x
          let dy = targetRef.current.y - orb.y
          orb.x += dx * 0.02
          orb.y += dy * 0.02

          const distanceToCenter = Math.sqrt(dx * dx + dy * dy)
          if (distanceToCenter < 10) {
            orb.active = false
            return false
          }

          // Calculate opacity based on distance to center
          const maxDistance = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2
          const opacity = Math.min(distanceToCenter / 100, 1) // Start fading when within 100px

          ctx.beginPath()
          ctx.arc(orb.x, orb.y, 10, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fill()

          return true
        })
      }

      requestAnimationFrame(animate)
    }
    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, []) // Remove showCustomCursor dependency

  // Separate modal observer effect
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const modalExists = document.querySelector('[data-rk]')
          if (modalExists) {
            document.body.style.cursor = 'auto'
            setShowCustomCursor(false)
          }
        }
        if (mutation.removedNodes.length > 0) {
          document.body.style.cursor = 'none'
          setShowCustomCursor(true)
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Try to play video on mobile
    const video = document.querySelector('video')
    if (video) {
      video.play().catch(error => {
        console.log("Video autoplay failed:", error)
      })
    }
  }, [])

  // Handle bid placement
  const handleBidClick = async () => {
    try {
      if (!vaultData.nextBidAmount) throw new Error("VaultData missing");
      if (!vaultData.nextBidAmount || !address) throw new Error("VaultData missing");

      setIsLoading(true)


      const allowanceValue = (allowance as bigint) ?? BigInt(0)
      const nextBidAmountValue = BigInt(vaultData.nextBidAmount) ?? BigInt(0)

      console.log(`Allowance: ${allowanceValue} | BidAmount: ${nextBidAmountValue}`);
      if (allowanceValue < nextBidAmountValue) {
        console.log(`Running Approve`);
        const approveSim = await simulateContract(config, {
          address: USDC_ADDRESS,
          abi: USDCABI.abi,
          functionName: 'approve',
          args: [VAULT_ADDRESS, nextBidAmountValue],
          account: address,
        });
        // Extract the transaction request properly
        const approveRequest = approveSim?.request;

        if (!approveRequest) {
          throw new Error("Simulation did not return a valid transaction request.");
        }

        // Send the approve transaction
        const approveResults = await writeContract(config, {
          address: USDC_ADDRESS,
          abi: USDCABI.abi,
          functionName: 'approve',
          args: [VAULT_ADDRESS, nextBidAmountValue],
          account: address,
        });
        await waitForTransactionReceipt(config, { hash: approveResults });
        console.log("Approval tx:", approveResults);
      }

      console.log("Placing bid...")

      const bidSim = await simulateContract(config, {
        address: VAULT_ADDRESS,
        abi: VaultABI.abi,
        functionName: 'placeBid',
        account: address,
      })
      // Extract the transaction request properly
      const bidRequest = bidSim?.request;

      if (!bidRequest) {
        throw new Error("Simulation did not return a valid transaction request.");
      }

      const bidResults = await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: VaultABI.abi,
        functionName: 'placeBid',
        account: address,
      });
      await waitForTransactionReceipt(config, { hash: bidResults });
      console.log("Bid tx:", bidResults)

    } catch (error) {
      console.error('Bid failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update the claim handler
  const handleClaimClick = async () => {
    try {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected. Attempting to connect...");
      }

      setIsLoading(true)
      const claimSim = await simulateContract(config, {
        address: VAULT_ADDRESS,
        abi: VaultABI.abi,
        functionName: 'claim',
        account: address,
      })
      const claimRequest = claimSim?.request;

      if (!claimRequest) {
        throw new Error("Simulation did not return a valid transaction request.");
      }
      const claimResults = await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: VaultABI.abi,
        functionName: 'claim',
        account: address,
      });
      await waitForTransactionReceipt(config, { hash: claimResults });
      console.log(`Claim TX: ${claimResults}`);

      setHasClaimed(true)
    } catch (error) {
      console.error('Claim failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add helper function to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}mins ${secs}s`;
  };

  return (
    <main className="h-screen overflow-hidden relative">
      <video
        autoPlay
        loop={true}
        muted
        playsInline
        preload="auto"
        className="absolute w-full h-full object-cover"
        webkit-playsinline="true"
      >
        <source src="/api/video" type="video/mp4" />
        <source src="/spacevideoLoop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex flex-col h-screen">
        <Header />

        {/* Game over state */}
        {vaultData.isGameOver ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
            <div className="text-center max-w-md">
              <p className="text-white text-xl custom:text-2xl mb-4">
                <a 
                  href={`https://etherscan.io/address/${vaultData.highestBidder}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline border-b border-white/50"
                >
                  {shortenedBidder}
                </a> won the game.
              </p>
              <p className="text-white text-sm custom:text-base mb-8">
                Follow us on <a 
                  href="https://x.com/bidBlackhole" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline border-b border-white/50"
                >
                  X
                </a> for the next game
              </p>
              
              {isWinner && isConnected && (
                <button
                  onClick={handleClaimClick}
                  disabled={isLoading || hasClaimed || vaultData.isClaimed}
                  className={`rounded-3xl py-3 px-8 text-base custom:text-lg font-medium ${
                    hasClaimed || vaultData.isClaimed
                      ? 'bg-gray-400 text-white'
                      : 'bg-white text-black hover:bg-gray-100 disabled:opacity-50'
                  }`}
                >
                  {isLoading ? 'Loading...' : 
                   (hasClaimed || vaultData.isClaimed) ? 'Congrats on the win!' : 'Claim Pool'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
            {/* Timer at the top for mobile, bottom for desktop */}
            <div className="custom:absolute custom:bottom-16 mb-8 custom:mb-0 flex flex-col items-center w-[300px]">
              <h2 className="text-xs custom:text-base text-white mb-2 text-center">
                {vaultData.hasStarted && vaultData.highestBid === "0" ?
                  "Place the first bid to start the clock" : "TIME TO EXPIRY"
                }
              </h2>
              <div className="border-2 border-white rounded-3xl p-3 w-full h-[126px] flex items-center justify-center custom:border-0 custom:p-0 custom:h-auto">
                <p className="text-2xl custom:text-5xl text-white text-center font-light">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>

            {/* Main Content - Previous Bid Info and Bid Button */}
            <div className="flex flex-col custom:flex-row justify-center items-center custom:items-start w-full max-w-7xl gap-8 custom:gap-32">
              {/* Right Section - Pool Value and Bid Button - Moved up for mobile */}
              <div className="flex flex-col w-[300px] custom:w-[400px] gap-4 order-1 custom:order-2">
                {/* Pool Value */}
                <div className="flex flex-col items-center">
                  <h2 className="text-xs custom:text-base text-white mb-2 text-center">POOL VALUE</h2>
                  <div className="border-2 border-white rounded-3xl p-3 custom:p-5 w-full h-[126px] custom:h-[210px] flex items-center justify-center">
                    <p className="text-3xl custom:text-6xl text-white text-center">
                      {isAnimating ? formattedAnimatedValue : formattedPrizePool}
                    </p>
                  </div>
                </div>

                {/* Bid Button */}
                <div className="flex flex-col">
                  {isConnected && isClient ? (
                    <button
                      onClick={handleBidClick}
                      disabled={isLoading}
                      className="w-full bg-white text-black rounded-3xl p-2 custom:p-4 text-xs custom:text-lg font-medium hover:bg-gray-100 disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : `Place Bid for ${formattedNextBid}`}
                    </button>
                  ) : (
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button
                          onClick={openConnectModal}
                          className="w-full bg-white text-black rounded-2xl p-2 custom:p-4 text-xs custom:text-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                          Place Bid for {formattedNextBid}
                        </button>
                      )}
                    </ConnectButton.Custom>
                  )}
                  <p className="text-[10px] custom:text-xs text-gray-400 text-center mt-2">
                    You'll be returned {formattedRefundAmount} if your bid is not the last
                  </p>
                </div>
              </div>

              {/* Previous Bid Info - Moved down for mobile */}
              <div className="bg-[#d7d7d7]/40 backdrop-blur-sm rounded-3xl p-4 custom:p-8 w-[300px] custom:w-[400px] h-[156px] custom:h-[340px] grid grid-rows-[1fr_auto_1fr] items-center order-2 custom:order-1">
                <div className="text-center self-center">
                  <h2 className="text-xs custom:text-base text-white mb-2">PREVIOUS BID</h2>
                  <p className="text-lg custom:text-3xl text-white">{formattedHighestBid}</p>
                </div>

                <div className="w-3/4 h-[1px] bg-white opacity-50 mx-auto" />

                <div className="text-center self-center">
                  <h2 className="text-xs custom:text-base text-white mb-2">PREVIOUS BIDDER</h2>
                  <a 
                    href={`https://etherscan.io/address/${vaultData.highestBidder}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg custom:text-3xl text-white hover:underline border-b border-white/50"
                  >
                    {shortenedBidder}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
      />
    </main>
  )
}