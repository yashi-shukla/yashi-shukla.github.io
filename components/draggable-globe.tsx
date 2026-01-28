'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'
import { useTheme } from '@/contexts/ThemeContext'
import { PROJECTS, SKILLS, REGIONS, getProjectCountByCountry, type ProjectData } from '@/lib/constants'

// Interpolate between two raw projection functions
// Based on the v0/Observable interpolateProjection technique
type AlphaProjection = d3.GeoProjection & { alpha: (t: number) => AlphaProjection }

function interpolateProjection(
  rawA: (lambda: number, phi: number) => [number, number],
  rawB: (lambda: number, phi: number) => [number, number]
): AlphaProjection {
  let alpha = 0

  const mutate = d3.geoProjectionMutator((): d3.GeoRawProjection => {
    const raw: d3.GeoRawProjection = (lambda: number, phi: number): [number, number] => {
      const a = rawA(lambda, phi)
      const b = rawB(lambda, phi)
      return [
        a[0] * (1 - alpha) + b[0] * alpha,
        a[1] * (1 - alpha) + b[1] * alpha
      ]
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw.invert = (x: number, y: number): [number, number] => {
      const inv = alpha < 0.5
        ? (rawA as unknown as { invert?: (x: number, y: number) => [number, number] }).invert
        : (rawB as unknown as { invert?: (x: number, y: number) => [number, number] }).invert
      return inv ? inv(x, y) : [0, 0]
    }
    return raw
  })

  const projection = mutate() as unknown as AlphaProjection

  projection.alpha = function(t: number) {
    alpha = t
    mutate()
    return projection
  }

  return projection
}

// Configuration constants inspired by ben-tiki/d3-globe and Observable
const GLOBE_CONFIG = {
  ROTATION_SENSITIVITY: 0.4, // Slightly smoother drag
  AUTO_ROTATION_SPEED: 0.15, // Slower, more elegant rotation
  SCALE: 200,
  HOVER_SCALE_FACTOR: 1.15, // Subtler hover scale
  UPDATE_THROTTLE: 16, // ~60fps
  DRAG_DAMPING: 0.95 // For smoother drag deceleration
}


interface CountryData {
  country_code: string
  country_name: string
  iso_a2: string
  iso_a3: string
  flag_url: string
  region: string
  subregion: string
}

interface DraggableGlobeProps {
  showFilters?: boolean
  showTitle?: boolean
  showLegend?: boolean
  showInstructions?: boolean
  compact?: boolean
  showProjectPanel?: boolean
  onProjectSelect?: (projectId: string | null) => void
  externalSelectedProject?: string | null
  externalSelectedSkill?: string
  externalSelectedRegion?: string
  externalSelectedCountry?: string
}

export function DraggableGlobe({
  showFilters = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showTitle = true,
  showLegend = false,
  showInstructions = true,
  compact = false,
  showProjectPanel = true,
  onProjectSelect,
  externalSelectedProject,
  externalSelectedSkill,
  externalSelectedRegion,
  externalSelectedCountry
}: DraggableGlobeProps = {}) {
  const { theme } = useTheme()
  const globeRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rotationRef = useRef<[number, number, number]>([0, -10, 0])
  const animationFrameRef = useRef<number>()
  const autoRotateRef = useRef<boolean>(false)
  const isDraggingRef = useRef<boolean>(false)
  const projectionRef = useRef<d3.GeoProjection | null>(null)
  const pathRef = useRef<d3.GeoPath | null>(null)
  const elementsRef = useRef<{
    surfaceDots: d3.Selection<SVGCircleElement, { lat: number; lng: number; id: string }, SVGSVGElement, unknown> | null
    projectDots: d3.Selection<SVGGElement, ProjectData, SVGSVGElement, unknown> | null
    countryPaths: d3.Selection<SVGPathElement, GeoJSON.Feature, SVGSVGElement, unknown> | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graticulePath: any | null
  }>({ surfaceDots: null, projectDots: null, countryPaths: null, graticulePath: null })
  
  // Theme-aware colors - Observable-inspired minimal grayscale palette
  const isDark = theme === 'dark'
  const colors = {
    // Globe background - subtle, not distracting
    globeFill: isDark ? '#1a1a1a' : '#EEEEEE',
    globeStroke: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    globeShadow: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.08)',
    // Graticule - nearly invisible
    graticule: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    // Countries - white/light with subtle strokes
    countryFill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
    countryStroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
    countryHover: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
    // Countries with projects - more visible
    countryWithProject: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
    countryWithProjectHover: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)',
    countrySelected: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
    // Surface dots - very subtle
    surfaceDot: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  }
  
  const [mounted, setMounted] = useState(false)
  const [internalSelectedSkill, setSelectedSkill] = useState('All')
  const [internalSelectedRegion, setSelectedRegion] = useState('All')
  // Use external filter state if provided, otherwise use internal
  const selectedSkill = externalSelectedSkill !== undefined ? externalSelectedSkill : internalSelectedSkill
  const selectedRegion = externalSelectedRegion !== undefined ? externalSelectedRegion : internalSelectedRegion
  const selectedCountryFilter = externalSelectedCountry ?? 'All'
  const [internalSelectedProject, setInternalSelectedProject] = useState<string | null>(null)
  const [selectedCountryProjects, setSelectedCountryProjects] = useState<typeof PROJECTS>([])
  const [projectIndex, setProjectIndex] = useState(0)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Unroll animation state
  const [isUnrolled, setIsUnrolled] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const unrollAlphaRef = useRef(0) // 0 = globe, 1 = flat map
  const unrollAnimFrameRef = useRef<number>()
  const globeOutlineRef = useRef<d3.Selection<SVGCircleElement, unknown, null, undefined> | null>(null)
  
  // Use external state if provided, otherwise use internal state
  const hoveredProject = externalSelectedProject !== undefined ? externalSelectedProject : internalSelectedProject
  const hoveredProjectRef = useRef(hoveredProject)
  hoveredProjectRef.current = hoveredProject
  const setHoveredProject = (projectId: string | null) => {
    if (onProjectSelect) {
      onProjectSelect(projectId)
    } else {
      setInternalSelectedProject(projectId)
    }
  }

  // Generate optimized dot grid for globe surface - SIGNIFICANTLY REDUCED for performance
  const surfacePoints = React.useMemo(() => {
    const dots = []
    const step = 20 // Increased from 10 to 20 for much better performance

    for (let lat = -75; lat <= 75; lat += step) {
      const radius = Math.cos((lat * Math.PI) / 180)
      const circumference = 2 * Math.PI * radius
      const numDots = Math.max(1, Math.floor(circumference / (step * Math.PI / 180) * 0.5)) // Reduced density by 50%

      for (let i = 0; i < numDots; i++) {
        const lng = (i * 360) / numDots - 180
        dots.push({ lat, lng, id: `${lat}-${lng}` })
      }
    }
    console.log(`🔵 Generated ${dots.length} surface dots (optimized for performance)`)
    return dots
  }, [])

  // Use centralized project data from constants
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const projectCountByCountry = React.useMemo(() => getProjectCountByCountry(), [])

  // Filter projects based on selections
  const filteredProjects = React.useMemo(() => {
    return PROJECTS.filter(project => {
      const skillMatch = selectedSkill === 'All' || project.skills.some(skill =>
        skill.toLowerCase().includes(selectedSkill.toLowerCase())
      )
      const regionMatch = selectedRegion === 'All' || project.region.toLowerCase() === selectedRegion.toLowerCase()
      const countryMatch = selectedCountryFilter === 'All' || project.country === selectedCountryFilter
      return skillMatch && regionMatch && countryMatch
    })
  }, [selectedSkill, selectedRegion, selectedCountryFilter])

  // Countries that have projects (for highlighting)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const countriesWithProjects = React.useMemo(() => {
    return new Set(filteredProjects.map(p => p.country))
  }, [filteredProjects])

  // Use shared skills and regions from constants
  const skills = ['All', ...SKILLS]
  const regions = ['All', ...REGIONS]

  // Load country data from CSV (inspired by ben-tiki/d3-globe)
  const loadCountryData = async () => {
    try {
      console.log('🇺🇸 Fetching country data...')
      const response = await fetch('/data/country-data.csv')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const csvText = await response.text()
      const parsedData = d3.csvParse(csvText) as CountryData[]
      console.log('✅ Country data loaded successfully')
      return parsedData
    } catch (error) {
      console.error('❌ Error loading country data:', error)
      return []
    }
  }

  // Load world countries from TopoJSON (handles antimeridian cutting properly)
  const loadWorldData = async () => {
    try {
      console.log('🌍 Fetching world countries data...')
      const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const world = await response.json() as Topology
      const countries = topojson.feature(world, world.objects.countries) as unknown as d3.ExtendedFeatureCollection
      console.log('✅ World countries data loaded successfully')
      return countries
    } catch (error) {
      console.error('❌ Error loading world countries data:', error)
      return null
    }
  }


  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Data loading effect - runs only once
  useEffect(() => {
    console.log('🌍 Starting globe data loading...')
    const loadData = async () => {
      try {
        const timeoutPromise = new Promise(resolve =>
          setTimeout(() => resolve(undefined), 15000)
        )

        const dataPromise = Promise.all([
          loadWorldData(),
          loadCountryData()
        ])

        console.log('⏳ Loading world data and country data...')
        const raced = await Promise.race([dataPromise, timeoutPromise])
        const [worldDataResult, countryDataResult] = Array.isArray(raced) ? raced : [null, null]

        if (worldDataResult) setWorldData(worldDataResult)
        if (countryDataResult) setCountryData(countryDataResult)

        console.log('✅ All globe data loaded successfully')
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error loading globe data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Globe and map dimensions (sized to fit one screen)
  const GLOBE_W = 460, GLOBE_H = 460
  const MAP_W = 800, MAP_H = 420

  // Optimized update function using requestAnimationFrame
  const updateGlobePositions = useCallback(() => {
    if (!projectionRef.current || !svgRef.current) return

    const projection = projectionRef.current as unknown as AlphaProjection
    const path = pathRef.current
    const alpha = unrollAlphaRef.current

    // Interpolate viewBox dimensions
    const vw = GLOBE_W * (1 - alpha) + MAP_W * alpha
    const vh = GLOBE_H * (1 - alpha) + MAP_H * alpha
    svgRef.current.setAttribute('viewBox', `0 0 ${vw} ${vh}`)

    // Interpolate scale and center
    const mapScale = GLOBE_CONFIG.SCALE * (1 - alpha) + 125 * alpha
    const cx = vw / 2
    const cy = vh / 2

    // Update interpolation alpha and projection params
    if (typeof projection.alpha === 'function') {
      projection.alpha(alpha)
      projection.scale(mapScale)
      projection.translate([cx, cy])
      // Remove clip for flat map; orthographic needs clip at 90
      if (alpha > 0.01) {
        // Use a very large precalculated clip that effectively shows everything
        projection.clipAngle(180 - (1 - alpha) * 89)
      } else {
        projection.clipAngle(90)
      }
    }

    projection.rotate(rotationRef.current)

    // Update globe outline visibility and position
    if (globeOutlineRef.current) {
      globeOutlineRef.current
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', mapScale)
        .style('opacity', Math.max(0, 1 - alpha * 3))
    }

    // Update surface dots (fade out during transition, hide in map mode)
    if (elementsRef.current.surfaceDots) {
      if (alpha > 0.3) {
        elementsRef.current.surfaceDots.attr('opacity', 0)
      } else {
        const radius = GLOBE_CONFIG.SCALE
        elementsRef.current.surfaceDots.each(function(d: { lat: number; lng: number }) {
          const coords = projection([d.lng, d.lat])
          if (coords) {
            const [x, y] = coords
            const distance = Math.sqrt((x - cx)**2 + (y - cy)**2)
            const visible = distance < radius

            if (visible) {
              const depth = (radius - distance) / radius
              d3.select(this)
                .attr('cx', x)
                .attr('cy', y)
                .attr('opacity', Math.max(0.1, depth * 0.3) * (1 - alpha * 3))
                .attr('r', 1.2 + depth * 0.3)
            } else {
              d3.select(this).attr('opacity', 0)
            }
          }
        })
      }
    }

    // Update country boundaries — fade fills to transparent in flat map mode (boundaries only)
    if (elementsRef.current.countryPaths && path) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      elementsRef.current.countryPaths.attr('d', path as any)

      // Interpolate fill opacity: fade non-project countries, keep project countries highlighted
      if (alpha > 0.01) {
        elementsRef.current.countryPaths.each(function(d: d3.ExtendedFeature) {
          const hasProjects = filteredProjects.some(p =>
            p.country === d.properties?.name ||
            (p.country === 'USA' && (d.properties?.name === 'United States' || d.properties?.name === 'United States of America'))
          )
          const el = d3.select(this)
          if (hasProjects) {
            // Keep project countries visible with a subtle fill
            el.attr('fill-opacity', Math.max(0.4, 1 - alpha * 0.6))
          } else {
            el.attr('fill-opacity', 1 - alpha)
          }
        })
        const strokeOpacity = Math.min(1, 0.5 + alpha * 0.5)
        elementsRef.current.countryPaths.attr('stroke-opacity', strokeOpacity)
      } else {
        elementsRef.current.countryPaths.attr('fill-opacity', 1)
        elementsRef.current.countryPaths.attr('stroke-opacity', 1)
      }
    }

    // Update graticule — fade out in flat map mode
    if (elementsRef.current.graticulePath && path) {
      elementsRef.current.graticulePath
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('d', path as any)
        .attr('opacity', Math.max(0, 0.5 - alpha * 1.5))
    }
  }, [])

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!mounted || isLoading) return

    let lastTime = 0
    const animate = (timestamp: number) => {
      // Throttle updates to ~60fps
      if (timestamp - lastTime < GLOBE_CONFIG.UPDATE_THROTTLE) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      lastTime = timestamp

      // Auto-rotate if enabled (only in globe mode)
      if (autoRotateRef.current && !isDraggingRef.current && unrollAlphaRef.current < 0.5) {
        rotationRef.current = [
          rotationRef.current[0] + GLOBE_CONFIG.AUTO_ROTATION_SPEED,
          rotationRef.current[1],
          rotationRef.current[2]
        ]
        updateGlobePositions()
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mounted, isLoading, updateGlobePositions])

  // Start auto-rotation after delay
  useEffect(() => {
    if (!mounted || isLoading) return

    const timer = setTimeout(() => {
      autoRotateRef.current = true
    }, 2000)

    return () => clearTimeout(timer)
  }, [mounted, isLoading])

  // Globe initialization - runs once when data is loaded
  useEffect(() => {
    if (!svgRef.current || !mounted || isLoading) return

    console.log('🎨 Initializing globe...')
    const svg = d3.select(svgRef.current)
    const alpha = unrollAlphaRef.current
    const width = GLOBE_W * (1 - alpha) + MAP_W * alpha
    const height = GLOBE_H * (1 - alpha) + MAP_H * alpha
    const initScale = GLOBE_CONFIG.SCALE * (1 - alpha) + 125 * alpha

    // Set initial viewBox
    svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`)

    // Clear previous content
    svg.selectAll('*').remove()

    // Create interpolated projection (globe <-> flat map)
    // d3 raw projections have compatible signatures but TS can't verify
    const projection = interpolateProjection(
      d3.geoOrthographicRaw as unknown as (lambda: number, phi: number) => [number, number],
      d3.geoEquirectangularRaw as unknown as (lambda: number, phi: number) => [number, number]
    )
    projection
      .scale(initScale)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current)
      .clipAngle(alpha > 0.01 ? 180 : 90)
      .precision(0.1)

    // Apply initial alpha
    projection.alpha(alpha)

    const path = d3.geoPath().projection(projection)

    projectionRef.current = projection as unknown as d3.GeoProjection
    pathRef.current = path

    // Drag behavior
    const drag = d3.drag()
      .subject(function() {
        const r = projection.rotate()
        return { x: r[0] / GLOBE_CONFIG.ROTATION_SENSITIVITY, y: -r[1] / GLOBE_CONFIG.ROTATION_SENSITIVITY }
      })
      .on('start', function() {
        isDraggingRef.current = true
        autoRotateRef.current = false
      })
      .on('drag', function(event) {
        rotationRef.current = [
          event.x * GLOBE_CONFIG.ROTATION_SENSITIVITY,
          -Math.max(-90, Math.min(90, event.y * GLOBE_CONFIG.ROTATION_SENSITIVITY)),
          rotationRef.current[2]
        ]
        updateGlobePositions()
      })
      .on('end', function() {
        isDraggingRef.current = false
        setTimeout(() => {
          if (!isDraggingRef.current) {
            autoRotateRef.current = true
          }
        }, 3000)
      })

    // Apply drag to SVG
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call(drag as any)
      .style('cursor', 'grab')
      .on('mousedown', function() {
        d3.select(this).style('cursor', 'grabbing')
      })
      .on('mouseup', function() {
        d3.select(this).style('cursor', 'grab')
      })

    // Add globe outline - subtle, elegant (hidden in flat map mode)
    const globeOutline = svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', initScale)
      .attr('fill', colors.globeFill)
      .attr('stroke', colors.globeStroke)
      .attr('stroke-width', 1)
      .style('filter', `drop-shadow(0 4px 20px ${colors.globeShadow})`)
      .style('pointer-events', 'none')
      .style('opacity', alpha > 0.3 ? 0 : 1)

    globeOutlineRef.current = globeOutline

    // Add graticule - very subtle, nearly invisible
    const graticule = d3.geoGraticule().step([20, 20]) // Wider grid for cleaner look
    const graticulePath = svg.append('path')
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', colors.graticule)
      .attr('stroke-width', 0.3)
      .attr('opacity', 0.5)

    elementsRef.current.graticulePath = graticulePath

    // Helper to check if country has projects (using shared PROJECTS data)
    const getCountryProjects = (countryName: string | undefined) => {
      if (!countryName) return []
      return filteredProjects.filter(p =>
        p.country === countryName ||
        (p.country === 'USA' && (countryName === 'United States' || countryName === 'United States of America')) ||
        (p.country === 'India' && countryName === 'India') ||
        (p.country === 'Malawi' && countryName === 'Malawi') ||
        (p.country === 'Kenya' && countryName === 'Kenya') ||
        (p.country === 'South Africa' && countryName === 'South Africa') ||
        (p.country === 'Australia' && countryName === 'Australia')
      )
    }

    // Add country boundaries - minimal, elegant style with project highlighting
    let countryPaths = null
    if (worldData && worldData.features) {
      countryPaths = svg.selectAll('.country')
        .data(worldData.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', d => {
          const projects = getCountryProjects(d.properties?.name)
          return projects.length > 0 ? colors.countryWithProject : colors.countryFill
        })
        .attr('stroke', d => {
          const projects = getCountryProjects(d.properties?.name)
          return projects.length > 0 ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : colors.countryStroke
        })
        .attr('stroke-width', d => {
          const projects = getCountryProjects(d.properties?.name)
          return projects.length > 0 ? 0.8 : 0.5
        })
        .style('cursor', d => {
          const projects = getCountryProjects(d.properties?.name)
          return projects.length > 0 ? 'pointer' : 'default'
        })
        .on('mouseover', function(event, d) {
          const countryName = d.properties?.name === 'United States of America' ? 'USA' : d.properties?.name
          const projects = getCountryProjects(d.properties?.name)

          if (countryName) setHoveredCountry(countryName)

          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', projects.length > 0 ? colors.countryWithProjectHover : colors.countryHover)
            .attr('stroke-width', projects.length > 0 ? 1.2 : 0.8)
        })
        .on('mouseout', function(event, d) {
          setHoveredCountry(null)
          const projects = getCountryProjects(d.properties?.name)

          d3.select(this)
            .transition()
            .duration(300)
            .attr('fill', projects.length > 0 ? colors.countryWithProject : colors.countryFill)
            .attr('stroke-width', projects.length > 0 ? 0.8 : 0.5)
        })
        .on('click', function(event, d) {
          const countryName = d.properties?.name === 'United States of America' ? 'USA' : d.properties?.name
          const projects = getCountryProjects(d.properties?.name)

          if (projects.length > 0 && countryName) {
            const isAlreadySelected = hoveredProjectRef.current && projects.some(p => p.id === hoveredProjectRef.current)

            if (isAlreadySelected) {
              setHoveredProject(null)
              setSelectedCountryProjects([])
              setProjectIndex(0)
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', colors.countryWithProject)
            } else {
              setSelectedCountryProjects(projects)
              setProjectIndex(0)
              setHoveredProject(projects[0].id)
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', colors.countrySelected)
            }
          }
        })

      elementsRef.current.countryPaths = countryPaths
    }

    // Add surface dots
    const surfaceDots = svg.selectAll('.surface-dot')
      .data(surfacePoints)
      .enter()
      .append('circle')
      .attr('class', 'surface-dot')
      .attr('r', 1.2)
      .attr('fill', colors.surfaceDot)
      .attr('opacity', 0.2)

    elementsRef.current.surfaceDots = surfaceDots

    // Initial update
    updateGlobePositions()

    console.log('✅ Globe initialized')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoading, worldData, filteredProjects, theme])

  // Unroll/roll animation handler
  const handleUnrollToggle = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    const targetAlpha = isUnrolled ? 0 : 1
    const startAlpha = unrollAlphaRef.current
    const startTime = performance.now()
    const duration = 2000 // 2 seconds

    // Pause auto-rotation during animation
    const wasAutoRotating = autoRotateRef.current
    autoRotateRef.current = false

    const animateUnroll = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const t = Math.min(1, elapsed / duration)

      // Ease in-out cubic
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

      unrollAlphaRef.current = startAlpha + (targetAlpha - startAlpha) * eased
      updateGlobePositions()

      if (t < 1) {
        unrollAnimFrameRef.current = requestAnimationFrame(animateUnroll)
      } else {
        unrollAlphaRef.current = targetAlpha
        updateGlobePositions()
        setIsUnrolled(!isUnrolled)
        setIsAnimating(false)

        // Resume auto-rotation only if going back to globe
        if (targetAlpha === 0 && wasAutoRotating) {
          setTimeout(() => { autoRotateRef.current = true }, 1000)
        }
      }
    }

    unrollAnimFrameRef.current = requestAnimationFrame(animateUnroll)
  }, [isAnimating, isUnrolled, updateGlobePositions])

  // Cleanup unroll animation on unmount
  useEffect(() => {
    return () => {
      if (unrollAnimFrameRef.current) {
        cancelAnimationFrame(unrollAnimFrameRef.current)
      }
    }
  }, [])

  // Show loading state - minimal
  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] bg-transparent overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-white mx-auto mb-4"></div>
          <div className="text-neutral-600 dark:text-neutral-400 text-sm tracking-wide">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={globeRef} className={`relative w-full ${compact ? 'h-full' : 'h-[80vh]'} bg-transparent overflow-hidden`}>

      {/* Filter Controls - minimal style, right aligned */}
      {showFilters && (
        <div className="absolute top-8 right-8 z-10">
          <div className="flex flex-wrap gap-3 justify-end">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-700 dark:text-neutral-300 text-sm focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-transparent transition-shadow"
            >
              <option value="All">All Skills</option>
              {skills.slice(1).map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-neutral-700 dark:text-neutral-300 text-sm focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 focus:border-transparent transition-shadow"
            >
              <option value="All">All Regions</option>
              {regions.slice(1).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Globe Container */}
      <div className={`relative flex flex-col items-center justify-center ${compact ? 'h-full' : 'h-full py-6'}`}>
        <svg
          ref={svgRef}
          viewBox="0 0 460 460"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto max-w-3xl max-h-[65vh]"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.05))',
            transition: 'max-width 0.3s ease'
          }}
        />

      </div>

      {/* Project Details Panel - minimal floating card */}
      {showProjectPanel && hoveredProject && mounted && (
        <div className="absolute bottom-8 left-8 right-8 bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 transition-all duration-300">
          {(() => {
            const project = PROJECTS.find(p => p.id === hoveredProject)
            if (!project) return null
            const total = selectedCountryProjects.length
            const hasMultiple = total > 1

            return (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white leading-tight">{project.org}: {project.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{project.description}</p>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {project.country} · {project.year}
                    </div>
                  </div>
                  <button
                    onClick={() => { setHoveredProject(null); setSelectedCountryProjects([]); setProjectIndex(0) }}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors ml-4 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map(skill => (
                      <span key={skill} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {hasMultiple && (
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => {
                          const prev = (projectIndex - 1 + total) % total
                          setProjectIndex(prev)
                          setHoveredProject(selectedCountryProjects[prev].id)
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-500 dark:hover:border-neutral-500 transition-colors text-sm"
                      >
                        ‹
                      </button>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {projectIndex + 1}/{total}
                      </span>
                      <button
                        onClick={() => {
                          const next = (projectIndex + 1) % total
                          setProjectIndex(next)
                          setHoveredProject(selectedCountryProjects[next].id)
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-500 dark:hover:border-neutral-500 transition-colors text-sm"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Legend - minimal */}
      {showLegend && (
        <div className="absolute bottom-8 right-8 bg-white dark:bg-neutral-900 rounded-md p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="text-xs font-medium text-neutral-900 dark:text-white mb-2 tracking-wide uppercase">Portfolio</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
            <div>{filteredProjects.length} projects</div>
            <div>{new Set(filteredProjects.map(p => p.country)).size} countries</div>
          </div>
        </div>
      )}

      {/* Country Tooltip - minimal floating style */}
      {hoveredCountry && mounted && (
        <div className={`absolute ${compact ? 'top-16' : 'top-32'} left-1/2 transform -translate-x-1/2 z-20 bg-white dark:bg-neutral-900 rounded-md px-4 py-3 shadow-lg border border-neutral-200 dark:border-neutral-800 min-w-[200px] transition-all duration-200`}>
          <div className="text-center">
            {(() => {
              const countryInfo = countryData.find(c =>
                c.country_name === hoveredCountry ||
                c.iso_a2 === hoveredCountry ||
                c.iso_a3 === hoveredCountry
              )
              // Get projects for this country from shared data
              const countryProjects = filteredProjects.filter(p => p.country === hoveredCountry)
              const projectCount = countryProjects.length

              return (
                <>
                  {countryInfo && (
                    <div className="flex items-center justify-center gap-3 mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={countryInfo.flag_url}
                        alt={`${countryInfo.country_name} flag`}
                        className="w-6 h-4 rounded-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div>
                        <div className="text-neutral-900 dark:text-white font-medium text-sm">{countryInfo.country_name}</div>
                      </div>
                    </div>
                  )}
                  {!countryInfo && (
                    <div className="text-neutral-900 dark:text-white font-medium text-sm mb-1">{hoveredCountry}</div>
                  )}
                  <div className="text-neutral-500 dark:text-neutral-400 text-xs">
                    {projectCount > 0 ? (
                      `${projectCount} project${projectCount > 1 ? 's' : ''}`
                    ) : (
                      'No projects'
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Interactive instructions + unroll button - centered above globe */}
      {showInstructions && (
        <div className={`absolute z-10 ${compact ? 'top-4 left-4 right-4' : 'top-8 left-1/2 transform -translate-x-1/2'}`}>
          <div className={`flex items-center gap-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-full shadow-sm border border-neutral-200 dark:border-neutral-800 ${compact ? 'justify-center px-5 py-2.5' : 'px-4 py-2'}`}>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wide">
              Drag to rotate · Click countries for details
            </span>
            <span className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700"></span>
            <button
              onClick={handleUnrollToggle}
              disabled={isAnimating}
              className="text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isAnimating ? 'Animating...' : isUnrolled ? 'Roll to Globe' : 'Unroll Globe'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
