'use client'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import Header from '../components/Header'

interface ShootingOrb {
  x: number;
  y: number;
  active: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isConnected } = useAccount()
  const cursorRef = useRef({ x: 0, y: 0 })
  const orbsRef = useRef<ShootingOrb[]>([])
  const targetRef = useRef({ x: 0, y: 0 })
  const [showCustomCursor, setShowCustomCursor] = useState(true)

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

  return (
    <main className="h-screen overflow-hidden relative">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        preload="auto"
        className="absolute w-full h-full object-cover"
        webkit-playsinline="true"
      >
        <source src="/spacevideoLoop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        <div className="flex-1 flex flex-col custom:flex-row justify-center custom:justify-between items-center max-w-7xl w-full px-6 pt-12">
          {/* Timer and Pool Info (Top on mobile) */}
          <div className="flex flex-col gap-3 custom:gap-6 w-[300px] custom:w-[600px] mr-0 custom:mr-6 custom:ml-32 order-1 custom:order-2">
            <div>
              <h2 className="text-xs custom:text-base text-white mb-2">TIME TO EXPIRY</h2>
              <div className="border border-white rounded-full p-2 custom:p-4">
                <p className="text-lg custom:text-3xl text-white text-center">34mins 23s</p>
              </div>
            </div>

            <div>
              <h2 className="text-xs custom:text-base text-white mb-2">POOL VALUE</h2>
              <div className="border border-white rounded-full p-2 custom:p-4">
                <p className="text-lg custom:text-3xl text-white text-center">$12933</p>
              </div>
            </div>

            <div>
              <h2 className="text-xs custom:text-base text-white mb-2">WANT THE POOL?</h2>
              <button className="w-full bg-white text-black rounded-full p-2 custom:p-4 text-xs custom:text-lg font-medium hover:bg-gray-100 transition-colors">
                Place Bid for $303
              </button>
              <p className="text-[10px] custom:text-xs text-gray-400 text-center mt-2">
                You'll get $300 back if your bid isn't the last!
              </p>
            </div>
          </div>

          {/* Previous Bid Info (Bottom on mobile) */}
          <div className="bg-[#d7d7d7]/40 backdrop-blur-sm rounded-3xl p-4 custom:p-8 w-[300px] custom:w-[400px] h-[260px] custom:h-[360px] grid grid-rows-[1fr_auto_1fr] items-center order-2 custom:order-1 mt-6 custom:mt-0 relative">
            <div className="text-center self-center">
              <h2 className="text-xs custom:text-base text-white mb-2">PREVIOUS BID</h2>
              <p className="text-xl custom:text-4xl text-white">$202</p>
            </div>

            <div className="w-3/4 h-[1px] bg-white opacity-50 mx-auto" />
            
            <div className="text-center self-center">
              <h2 className="text-xs custom:text-base text-white mb-2">PREVIOUS BIDDER</h2>
              <p className="text-xl custom:text-4xl text-white">0xB1db4...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}