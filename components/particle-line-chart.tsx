"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface DataPoint {
    x: number
    y: number
}

interface ParticleLineChartProps {
    data: DataPoint[]
    width?: number
    height?: number
    particleCount?: number
    particleColor?: string
    backgroundColor?: string
    minParticleSize?: number
    maxParticleSize?: number
}

interface Particle {
    x: number
    y: number
    size: number
    initialX: number
    initialY: number
    targetX: number
    targetY: number
}

function cubicInterpolation(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const v0 = (p2 - p0) * 0.5
    const v1 = (p3 - p1) * 0.5
    const t2 = t * t
    const t3 = t * t2
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
}

export default function ParticleLineChart({
    data,
    width = 800,
    height = 400,
    particleCount = 200,
    particleColor = 'hsl(var(--primary))',
    backgroundColor = 'hsl(var(--background))',
    minParticleSize = 2,
    maxParticleSize = 6
}: ParticleLineChartProps) {
    const [particles, setParticles] = useState<Particle[]>([])
    const [isInView, setIsInView] = useState(false)
    const controls = useAnimation()

    useEffect(() => {
        // Scale data to fit canvas
        const xScale = width / (Math.max(...data.map(d => d.x)) - Math.min(...data.map(d => d.x)))
        const yScale = height / (Math.max(...data.map(d => d.y)) - Math.min(...data.map(d => d.y)))
        const scaledData = data.map(point => ({
            x: (point.x - Math.min(...data.map(d => d.x))) * xScale,
            y: height - (point.y - Math.min(...data.map(d => d.y))) * yScale
        }))

        // Generate random particles
        const newParticles: Particle[] = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * (maxParticleSize - minParticleSize) + minParticleSize,
            initialX: Math.random() * width,
            initialY: Math.random() * height,
            targetX: 0,
            targetY: 0
        }))

        // Assign target positions for particles
        newParticles.forEach((particle, index) => {
            const t = index / (particleCount - 1)
            const i = Math.floor(t * (scaledData.length - 1))
            const nextI = Math.min(i + 1, scaledData.length - 1)
            const tBetweenPoints = t * (scaledData.length - 1) - i

            const prevI = Math.max(0, i - 1)
            const nextNextI = Math.min(scaledData.length - 1, i + 2)

            particle.targetX = cubicInterpolation(
                scaledData[prevI].x,
                scaledData[i].x,
                scaledData[nextI].x,
                scaledData[nextNextI].x,
                tBetweenPoints
            )
            particle.targetY = cubicInterpolation(
                scaledData[prevI].y,
                scaledData[i].y,
                scaledData[nextI].y,
                scaledData[nextNextI].y,
                tBetweenPoints
            )
        })

        setParticles(newParticles)
    }, [data, width, height, particleCount, minParticleSize, maxParticleSize])

    useEffect(() => {
        if (isInView) {
            controls.start(i => ({
                x: particles[i].targetX,
                y: particles[i].targetY,
                transition: { duration: 1, ease: "easeInOut" }
            }))
        } else {
            controls.start((i: string | number) => ({
                x: particles[i].initialX,
                y: particles[i].initialY,
                transition: { duration: 0.5, ease: "easeInOut" }
            }))
        }
    }, [isInView, particles, controls])

    return (
        <div className="p-4 bg-background">
            <div
                style={{ width, height, position: 'relative' }}
                ref={(ref) => {
                    if (ref) {
                        const observer = new IntersectionObserver(
                            ([entry]) => setIsInView(entry.isIntersecting),
                            { threshold: 0.5 }
                        )
                        observer.observe(ref)
                        return () => observer.disconnect()
                    }
                }}
            >
                {particles.map((particle, index) => (
                    <motion.div
                        key={index}
                        custom={index}
                        animate={controls}
                        initial={{ x: particle.initialX, y: particle.initialY }}
                        style={{
                            position: 'absolute',
                            width: particle.size,
                            height: particle.size,
                            borderRadius: '50%',
                            backgroundColor: particleColor,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}


interface PriceData {
    x: number // Day number
    y: number // Price
}

function generatePriceHistory(days: number, startPrice: number): PriceData[] {
    const data: PriceData[] = []
    let currentPrice = startPrice

    for (let i = 0; i < days; i++) {
        // Simulate daily price change
        const change = (Math.random() - 0.5) * 10 // Random change between -5 and 5
        currentPrice += change
        currentPrice = Math.max(currentPrice, 0) // Ensure price doesn't go negative

        data.push({
            x: i,
            y: parseFloat(currentPrice.toFixed(2))
        })
    }

    return data
}

function PriceHistoryChart() {
    const days = 30
    const startPrice = 100
    const priceHistory = generatePriceHistory(days, startPrice)

    return (
        <div className="w-full max-w-3xl mx-auto">
            <ParticleLineChart
                data={priceHistory}
                width={800}
                height={400}
                particleCount={500}
                particleColor="#6b7280"
                backgroundColor="hsl(var(--background))"
                minParticleSize={1}
                maxParticleSize={4}
            />
        </div>
    )
}

export { PriceHistoryChart }