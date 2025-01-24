'use client'
import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import Header from '../components/Header'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isConnected } = useAccount()
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const target = { x: canvas.width / 2, y: canvas.height / 2 }
    let cursor = { x: 0, y: 0 }

    function handleMouseMove(e: MouseEvent) {
      cursor.x = e.clientX
      cursor.y = e.clientY
    }

    function animate() {
      if (!ctx) return
      
      // Make canvas transparent initially
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      let dx = target.x - cursor.x
      let dy = target.y - cursor.y
      cursor.x += dx * 0.05
      cursor.y += dy * 0.05

      // Draw cursor with trail
      ctx.beginPath()
      ctx.arc(cursor.x, cursor.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.shadowBlur = 20
      ctx.shadowColor = 'white'
      ctx.fill()

      // Always continue animation
      requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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