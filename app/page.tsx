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

    // Set canvas size
    const updateCanvasSize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let cursor = { x: 0, y: 0 }

    const handleMouseMove = (e: MouseEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
    }
    document.addEventListener('mousemove', handleMouseMove)

    function animate() {
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let dx = target.x - cursor.x
      let dy = target.y - cursor.y
      cursor.x += dx * 0.05
      cursor.y += dy * 0.05

      ctx.beginPath()
      ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', updateCanvasSize)
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
        className="fixed inset-0 pointer-events-none z-50"
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