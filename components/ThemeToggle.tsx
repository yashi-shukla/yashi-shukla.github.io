'use client'

import { useCallback, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
  duration?: number
}

export function ThemeToggle({ className, duration = 500 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDark = theme === 'dark'

  const handleToggle = useCallback(async () => {
    // Fallback for browsers without View Transitions API
    if (!document.startViewTransition || !buttonRef.current) {
      toggleTheme()
      return
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme()
      })
    })

    await transition.ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    )
  }, [toggleTheme, duration])

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className={`relative w-10 h-10 rounded-full border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center ${className || ''}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-[18px] h-[18px] text-foreground" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-foreground" />
      )}
    </button>
  )
}
