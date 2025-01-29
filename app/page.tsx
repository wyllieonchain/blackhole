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
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none"
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
          <p className="text-sm text-gray-600 font-golos md:hidden mt-8">
            COMING SOON
          </p>
        </div>
        <div className="absolute bottom-0 z-10 flex-col items-center gap-2 hidden md:flex">
          {isConnected && (
            <a 
              href="https://x.com/bidBlackhole" 
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