"use client"

import React, { useEffect, useRef, useState } from 'react'

interface StaticNoiseProps {
  fps?: number
  contrast?: number
  baseDensity?: number
  hoverRadius?: number
  hoverDensity?: number
}

export default function StaticNoiseBg({
  fps = 30,
  contrast = 25,
  baseDensity = 0.25,
  hoverRadius = 150,
  hoverDensity = 0.5
}: StaticNoiseProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [interactionPos, setInteractionPos] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4
          const baseRed = 255    // #ed
          const baseGreen = 255  // #e9
          const baseBlue = 255   // #dd

          let localDensity = baseDensity

          if (interactionPos) {
            const dx = x - interactionPos.x
            const dy = y - interactionPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance <= hoverRadius) {
              const t = 1 - distance / hoverRadius
              localDensity = baseDensity + (hoverDensity - baseDensity) * t
            }
          }

          if (Math.random() < localDensity) {
            const noiseValue = Math.random() * contrast
            data[i] = Math.max(baseRed - noiseValue, 0)     // red
            data[i + 1] = Math.max(baseGreen - noiseValue, 0) // green
            data[i + 2] = Math.max(baseBlue - noiseValue, 0) // blue
          } else {
            data[i] = baseRed     // red
            data[i + 1] = baseGreen // green
            data[i + 2] = baseBlue // blue
          }
          data[i + 3] = 255   // alpha
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const animate = () => {
      generateNoise()
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [fps, contrast, baseDensity, hoverRadius, hoverDensity, interactionPos])

  const updateInteractionPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      setInteractionPos({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
    }
  }

  const mouseEnterHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateInteractionPos(e.clientX, e.clientY)
  }

  const mouseLeaveHandler = () => {
    setInteractionPos(null)
  }

  const mouseMoveHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateInteractionPos(e.clientX, e.clientY)
  }

  const touchStartHandler = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updateInteractionPos(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const touchEndHandler = () => {
    setInteractionPos(null)
  }

  const touchMoveHandler = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updateInteractionPos(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 bg-[#ede9dd]"
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      onMouseMove={mouseMoveHandler}
      onTouchStart={touchStartHandler}
      onTouchEnd={touchEndHandler}
      onTouchMove={touchMoveHandler}
    />
  )
}