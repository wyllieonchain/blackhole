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
  const [showCustomCursor, setShowCustomCursor] = useState(true)

  // Watch for RainbowKit modal
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // RainbowKit modal was added
          const modalExists = document.querySelector('[data-rk]')
          setShowCustomCursor(!modalExists)
        }
        if (mutation.removedNodes.length > 0) {
          // RainbowKit modal was removed
          setShowCustomCursor(true)
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Update cursor style based on state
    document.body.style.cursor = showCustomCursor ? 'none' : 'auto'

    if (!showCustomCursor) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let cursor = cursorRef.current

    const handleMouseMove = (e: MouseEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
    }

    const handleClick = (e: MouseEvent) => {
      orbsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        active: true
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)

    function animate() {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw cursor
      ctx.beginPath()
      ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()

      // Draw and update all active orbs
      orbsRef.current = orbsRef.current.filter(orb => {
        if (!orb.active) return false

        let dx = target.x - orb.x
        let dy = target.y - orb.y
        orb.x += dx * 0.01
        orb.y += dy * 0.01

        // Check if orb has reached center (with small threshold)
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy)
        if (distanceToCenter < 1) {
          orb.active = false
          return false
        }

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()

        return true
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [showCustomCursor])

  return (
    <main className="h-screen overflow-hidden relative">
      <video 
        autoPlay 
        loop 
        muted 
        className="absolute w-full h-full object-cover"
      >
        <source src="/spacevideoLoop.mp4" type="video/mp4" />
      </video>
      <canvas 
        ref={canvasRef} 
        className={`fixed inset-0 pointer-events-none ${showCustomCursor ? '' : 'hidden'}`}
      />
      <Header />
      <div className="flex flex-col items-center justify-center h-screen gap-8 relative">
        <div className="z-10 flex flex-col items-center gap-4">
          <h1 className="text-4xl text-center font-golos text-gray-200">
            The Black Hole for Capital
          </h1>
          <p className="text-xl text-center font-golos text-gray-300">
            Watch $10k drain the financial system.
          </p>
        </div>
        <div className="absolute bottom-0 z-10 flex flex-col items-center gap-2">
          {isConnected && (
            <a 
              href="https://x.com/malcolmonchain" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/Xlogo.svg"
                alt="X (Twitter) Logo"
                width={24}
                height={24}
              />
            </a>
          )}
          <p className="text-sm text-gray-600 font-golos">
            COMING SOON
          </p>
        </div>
      </div>
    </main>
  );
}