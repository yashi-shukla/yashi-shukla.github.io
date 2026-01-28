'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Animation configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.9,
  },
  ease: {
    smooth: 'power2.out',
    bounce: 'back.out(1.2)',
    elastic: 'elastic.out(1, 0.5)',
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
}

// Fade up animation for scroll reveals
export function fadeUpOnScroll(
  elements: string | Element | Element[],
  options: {
    start?: string
    end?: string
    stagger?: number
    duration?: number
    y?: number
  } = {}
) {
  const {
    start = 'top 85%',
    end = 'bottom 15%',
    stagger = ANIMATION_CONFIG.stagger.normal,
    duration = ANIMATION_CONFIG.duration.normal,
    y = 30,
  } = options

  gsap.set(elements, { opacity: 0, y })

  gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease: ANIMATION_CONFIG.ease.smooth,
    scrollTrigger: {
      trigger: elements as gsap.DOMTarget,
      start,
      end,
      toggleActions: 'play none none reverse',
    },
  })
}

// Staggered fade up for lists/grids
export function staggerFadeUp(
  container: string | Element,
  childSelector: string,
  options: {
    start?: string
    stagger?: number
    duration?: number
    y?: number
  } = {}
) {
  const {
    start = 'top 80%',
    stagger = ANIMATION_CONFIG.stagger.normal,
    duration = ANIMATION_CONFIG.duration.normal,
    y = 40,
  } = options

  const children = typeof container === 'string'
    ? document.querySelectorAll(`${container} ${childSelector}`)
    : container.querySelectorAll(childSelector)

  gsap.set(children, { opacity: 0, y })

  gsap.to(children, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease: ANIMATION_CONFIG.ease.smooth,
    scrollTrigger: {
      trigger: container as gsap.DOMTarget,
      start,
      toggleActions: 'play none none reverse',
    },
  })
}

// Parallax effect for hero sections
export function parallaxOnScroll(
  element: string | Element,
  options: {
    speed?: number
    direction?: 'up' | 'down'
  } = {}
) {
  const { speed = 0.5, direction = 'up' } = options
  const multiplier = direction === 'up' ? -1 : 1

  gsap.to(element, {
    y: () => window.innerHeight * speed * multiplier,
    ease: 'none',
    scrollTrigger: {
      trigger: element as gsap.DOMTarget,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
}

// Scale in animation
export function scaleInOnScroll(
  elements: string | Element | Element[],
  options: {
    start?: string
    duration?: number
    scale?: number
  } = {}
) {
  const {
    start = 'top 85%',
    duration = ANIMATION_CONFIG.duration.normal,
    scale = 0.9,
  } = options

  gsap.set(elements, { opacity: 0, scale })

  gsap.to(elements, {
    opacity: 1,
    scale: 1,
    duration,
    ease: ANIMATION_CONFIG.ease.smooth,
    scrollTrigger: {
      trigger: elements as gsap.DOMTarget,
      start,
      toggleActions: 'play none none reverse',
    },
  })
}

// Text reveal animation (word by word)
export function textReveal(
  element: string | Element,
  options: {
    start?: string
    stagger?: number
    duration?: number
  } = {}
) {
  const {
    start = 'top 80%',
    stagger = 0.03,
    duration = 0.5,
  } = options

  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (!el) return

  const text = el.textContent || ''
  const words = text.split(' ')

  el.innerHTML = words
    .map((word) => `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`)
    .join(' ')

  const spans = el.querySelectorAll('span > span')

  gsap.set(spans, { y: '100%' })

  gsap.to(spans, {
    y: 0,
    duration,
    stagger,
    ease: ANIMATION_CONFIG.ease.smooth,
    scrollTrigger: {
      trigger: el,
      start,
      toggleActions: 'play none none reverse',
    },
  })
}

// Counter animation for stats
export function animateCounter(
  element: string | Element,
  endValue: number,
  options: {
    duration?: number
    prefix?: string
    suffix?: string
  } = {}
) {
  const { duration = 2, prefix = '', suffix = '' } = options
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (!el) return

  const counter = { value: 0 }

  gsap.to(counter, {
    value: endValue,
    duration,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      once: true,
    },
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(counter.value)}${suffix}`
    },
  })
}

// Initialize all scroll animations
export function initScrollAnimations() {
  // Refresh ScrollTrigger after all animations are set up
  ScrollTrigger.refresh()
}

// Cleanup function
export function cleanupAnimations() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
}
