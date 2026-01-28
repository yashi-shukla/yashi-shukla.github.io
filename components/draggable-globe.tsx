'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useTheme } from '@/contexts/ThemeContext'

// Configuration constants inspired by ben-tiki/d3-globe
const GLOBE_CONFIG = {
  ROTATION_SENSITIVITY: 0.5,
  AUTO_ROTATION_SPEED: 0.2, // Reduced from 0.3 for smoother rotation
  SCALE: 250,
  HOVER_SCALE_FACTOR: 1.2,
  UPDATE_THROTTLE: 16 // ~60fps
}

interface ProjectData {
  id: string
  name: string
  lat: number
  lng: number
  projects: number
  region: string
  sector: string[]
  status: 'completed' | 'ongoing' | 'planned'
  year: number
  description: string
  technologies: string[]
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
}

export function DraggableGlobe({ 
  showFilters = true, 
  showTitle = true, 
  showLegend = false,
  showInstructions = true,
  compact = false,
  showProjectPanel = true,
  onProjectSelect,
  externalSelectedProject
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
  
  // Theme-aware colors
  const isDark = theme === 'dark'
  const colors = {
    globeFill: isDark ? 'rgba(31, 41, 55, 0.1)' : 'rgba(243, 244, 246, 0.5)',
    globeStroke: isDark ? '#9ca3af' : '#6b7280',
    globeShadow: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(107, 114, 128, 0.3)',
    graticule: isDark ? '#6b7280' : '#9ca3af',
    countryDefault: isDark ? '#4b5563' : '#d1d5db',
    countryHover: isDark ? '#6b7280' : '#9ca3af',
    countryWithProject: isDark ? '#374151' : '#9ca3af',
    surfaceDot: isDark ? '#4b5563' : '#d1d5db',
    markerDefault: isDark ? '#60a5fa' : '#3b82f6',
    markerHover: isDark ? '#93c5fd' : '#2563eb'
  }
  
  const [mounted, setMounted] = useState(false)
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [internalSelectedProject, setInternalSelectedProject] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Use external state if provided, otherwise use internal state
  const hoveredProject = externalSelectedProject !== undefined ? externalSelectedProject : internalSelectedProject
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

  // Real project data based on resume
  const allProjects: ProjectData[] = React.useMemo(() => [
    {
      id: '1',
      name: 'India',
      lat: 20,
      lng: 78,
      projects: 15,
      region: 'asia',
      sector: ['AI/ML', 'Government', 'LLM'],
      status: 'completed',
      year: 2024,
      description: 'Gemini LLM Pipeline - Gates Foundation: Processed 10M+ PDFs with Google Gemini for national survey sampling',
      technologies: ['Google Gemini', 'GCP', 'Python', 'BigQuery', 'AI Studio']
    },
    {
      id: '2',
      name: 'India',
      lat: 28.6,
      lng: 77.2,
      projects: 8,
      region: 'asia',
      sector: ['Government', 'Big Data', 'Analytics'],
      status: 'completed',
      year: 2023,
      description: 'NDAP Monitoring Dashboard - Niti Aayog: Redshift architecture ingesting terabytes of clickstream data',
      technologies: ['AWS Redshift', 'Apache Spark', 'Superset', 'Python', 'ETL']
    },
    {
      id: '3',
      name: 'Malawi',
      lat: -13.25,
      lng: 34,
      projects: 5,
      region: 'africa',
      sector: ['Government', 'Social Programs', 'UNICEF'],
      status: 'completed',
      year: 2023,
      description: 'SCTP Monitoring Dashboard - UNICEF Malawi: Automated cash transfer program data workflows',
      technologies: ['Python', 'Google Data Studio', 'APIs', 'Data Transformation']
    },
    {
      id: '4',
      name: 'India',
      lat: 26.9,
      lng: 80.9,
      projects: 6,
      region: 'asia',
      sector: ['Government', 'Social Benefits'],
      status: 'completed',
      year: 2022,
      description: 'Indus Action: AWS pipelines for 3M+ worker benefit access with Spark-based eligibility algorithms',
      technologies: ['AWS Redshift', 'Apache Spark', 'AWS Glue', 'Athena', 'FastAPI']
    },
    {
      id: '5',
      name: 'South Africa',
      lat: -30,
      lng: 25,
      projects: 4,
      region: 'africa',
      sector: ['Nonprofit', 'AI/ML', 'Chatbot'],
      status: 'completed',
      year: 2022,
      description: 'Praekelt: FastAPI chatbot backend with SQL data models, reducing frontline support by 70%',
      technologies: ['FastAPI', 'SQL', 'Python', 'API Development', 'Data Security']
    },
    {
      id: '6',
      name: 'Kenya',
      lat: 0,
      lng: 38,
      projects: 3,
      region: 'africa',
      sector: ['Nonprofit', 'Education', 'Data Collection'],
      status: 'completed',
      year: 2022,
      description: 'Kidogo: GCP BigQuery monitoring system for daycare quality analysis with Kobo integration',
      technologies: ['GCP BigQuery', 'Hevo', 'Kobo Toolbox', 'Low-code Solutions']
    },
    {
      id: '7',
      name: 'Kenya',
      lat: -1.3,
      lng: 36.8,
      projects: 2,
      region: 'africa',
      sector: ['Nonprofit', 'Social Justice', 'Data Systems'],
      status: 'completed',
      year: 2022,
      description: 'Social Justice Movement: Digital data collection system with Directus on GCP',
      technologies: ['Directus', 'GCP', 'Kobo Toolbox', 'Data Management']
    },
    {
      id: '8',
      name: 'Global',
      lat: 0,
      lng: 0,
      projects: 12,
      region: 'global',
      sector: ['Geospatial', 'AI/ML', 'Satellite'],
      status: 'completed',
      year: 2023,
      description: 'MOSAIKS Satellite Imagery: Dask-powered sampling with 10x speedup on Azure Kubernetes',
      technologies: ['Dask', 'Azure Kubernetes', 'Python', 'Satellite Imagery', 'MLOps']
    },
    {
      id: '9',
      name: 'India',
      lat: 22,
      lng: 82,
      projects: 4,
      region: 'asia',
      sector: ['Government', 'Serverless', 'Cost Optimization'],
      status: 'completed',
      year: 2022,
      description: 'Aspirational Districts Programme - Niti Aayog: Serverless AWS architecture (<$20/month cost)',
      technologies: ['AWS Lambda', 'Step Functions', 'Serverless', 'Cost Optimization']
    },
    {
      id: '10',
      name: 'Australia',
      lat: -25,
      lng: 135,
      projects: 3,
      region: 'oceania',
      sector: ['Insurance', 'QA', 'Testing'],
      status: 'completed',
      year: 2021,
      description: 'Hollard Insurance: Azure-based testing automation and data validation systems',
      technologies: ['Azure DevOps', 'Selenium', 'Python', 'SQL', 'QA Automation']
    },
    {
      id: '11',
      name: 'USA',
      lat: 40,
      lng: -100,
      projects: 6,
      region: 'americas',
      sector: ['Healthcare', 'AI/ML', 'HIPAA'],
      status: 'completed',
      year: 2019,
      description: 'Healthcare Analytics: HIPAA-compliant patient data systems with Tableau dashboards',
      technologies: ['Tableau', 'PostgreSQL', 'Python', 'HIPAA Compliance', 'Healthcare Analytics']
    }
  ], [])

  // Filter projects based on selections
  const filteredProjects = React.useMemo(() => {
    return allProjects.filter(project => {
      const sectorMatch = selectedSector === 'All' || project.sector.includes(selectedSector)
      const regionMatch = selectedRegion === 'All' || project.region === selectedRegion.toLowerCase()
      return sectorMatch && regionMatch
    })
  }, [selectedSector, selectedRegion, allProjects])

  // Filter options based on actual experience
  const sectors = ['All', 'AI/ML', 'Government', 'LLM', 'Big Data', 'Analytics', 'Social Programs', 'UNICEF', 'Social Benefits', 'Nonprofit', 'Chatbot', 'Education', 'Data Collection', 'Social Justice', 'Data Systems', 'Geospatial', 'Satellite', 'Serverless', 'Cost Optimization', 'Insurance', 'QA', 'Testing', 'Healthcare', 'HIPAA']
  const regions = ['All', 'Asia', 'Africa', 'Americas', 'Oceania', 'Global']

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

  // Load world countries GeoJSON
  const loadWorldData = async () => {
    try {
      console.log('🌍 Fetching world countries data...')
      const response = await fetch('/data/world-countries.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ World countries data loaded successfully')
      return data
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

  // Optimized update function using requestAnimationFrame
  const updateGlobePositions = useCallback(() => {
    if (!projectionRef.current || !svgRef.current) return

    const projection = projectionRef.current
    const path = pathRef.current
    const width = 600
    const height = 600
    const radius = GLOBE_CONFIG.SCALE

    projection.rotate(rotationRef.current)

    // Update surface dots (optimized with reduced calculations)
    if (elementsRef.current.surfaceDots) {
      elementsRef.current.surfaceDots.each(function(d: { lat: number; lng: number }) {
        const coords = projection([d.lng, d.lat])
        if (coords) {
          const [x, y] = coords
          const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
          const visible = distance < radius
          
          if (visible) {
            const depth = (radius - distance) / radius
            d3.select(this)
              .attr('cx', x)
              .attr('cy', y)
              .attr('opacity', Math.max(0.1, depth * 0.3))
              .attr('r', 1.2 + depth * 0.3)
          } else {
            d3.select(this).attr('opacity', 0)
          }
        }
      })
    }

    // Update country boundaries
    if (elementsRef.current.countryPaths && path) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      elementsRef.current.countryPaths.attr('d', path as any)
    }

    // Update project dots (no transitions during rotation for performance)
    if (elementsRef.current.projectDots) {
      elementsRef.current.projectDots.each(function(d: ProjectData) {
        const coords = projection([d.lng, d.lat])
        if (coords) {
          const [x, y] = coords
          const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
          const visible = distance < GLOBE_CONFIG.SCALE
          const depth = (GLOBE_CONFIG.SCALE - distance) / GLOBE_CONFIG.SCALE
          const baseSize = Math.max(5, d.projects / 6)
          const size = visible ? baseSize + depth * 4 : 0

          d3.select(this).select('.project-circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', size)
            .attr('opacity', visible ? 0.9 + depth * 0.1 : 0)

          d3.select(this).select('.project-label')
            .attr('x', x)
            .attr('y', y - size - 8)
        }
      })
    }

    // Update graticule
    if (elementsRef.current.graticulePath && path) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      elementsRef.current.graticulePath.attr('d', path as any)
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

      // Auto-rotate if enabled
      if (autoRotateRef.current && !isDraggingRef.current) {
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
    const width = 600
    const height = 600

    // Clear previous content
    svg.selectAll('*').remove()

    // Create globe projection
    const projection = d3.geoOrthographic()
      .scale(GLOBE_CONFIG.SCALE)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current)
      .clipAngle(90)

    const path = d3.geoPath().projection(projection)
    
    projectionRef.current = projection
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

    // Add globe outline
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', GLOBE_CONFIG.SCALE)
      .attr('fill', colors.globeFill)
      .attr('stroke', colors.globeStroke)
      .attr('stroke-width', 2)
      .style('filter', `drop-shadow(0 0 20px ${colors.globeShadow})`)
      .style('pointer-events', 'none')

    // Add graticule
    const graticule = d3.geoGraticule().step([15, 15])
    const graticulePath = svg.append('path')
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', colors.graticule)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3)

    elementsRef.current.graticulePath = graticulePath

    // Add country boundaries
    let countryPaths = null
    if (worldData && worldData.features) {
      countryPaths = svg.selectAll('.country')
        .data(worldData.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', d => {
          const countryName = d.properties?.name
          if (!countryName) return colors.countryDefault
          const projectsInCountry = filteredProjects.filter(p =>
            p.name === countryName ||
            (p.name === 'USA' && countryName === 'United States') ||
            (p.name === 'South Africa' && countryName === 'South Africa')
          )
          const totalProjects = projectsInCountry.reduce((sum, p) => sum + p.projects, 0)
          return totalProjects > 0 ? colors.countryWithProject : colors.countryDefault
        })
        .attr('stroke', colors.countryDefault)
        .attr('stroke-width', 0.3)
        .attr('opacity', 0.8)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const countryName = d.properties?.name === 'United States' ? 'USA' : d.properties?.name
          if (countryName) setHoveredCountry(countryName)
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', 1)
            .attr('stroke', colors.countryHover)
        })
        .on('mouseout', function() {
          setHoveredCountry(null)
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0.3)
            .attr('stroke', colors.countryDefault)
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

    // Add project locations
    const projectDots = svg.selectAll('.project-dot')
      .data(filteredProjects)
      .enter()
      .append('g')
      .attr('class', 'project-dot')

    projectDots.append('circle')
      .attr('class', 'project-circle')
      .attr('r', 0)
      .attr('fill', colors.markerDefault)
      .attr('stroke', isDark ? '#ffffff' : '#000000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .style('filter', `drop-shadow(0 0 8px ${colors.markerDefault})`)
      .on('click', function(event, d) {
        setHoveredProject(hoveredProject === d.id ? null : d.id)
      })

    projectDots.append('text')
      .attr('class', 'project-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', isDark ? '#ffffff' : '#000000')
      .attr('opacity', 0)
      .style('text-shadow', isDark ? '0 0 4px rgba(0, 0, 0, 0.8)' : '0 0 4px rgba(255, 255, 255, 0.8)')
      .text(d => `${d.name} (${d.projects})`)

    // Hover effects
    projectDots
      .on('mouseover', function(event, d) {
        const coords = projection([d.lng, d.lat])
        if (coords) {
          const [x, y] = coords
          const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
          const visible = distance < GLOBE_CONFIG.SCALE
          
          if (visible) {
            d3.select(this).select('.project-circle')
              .transition()
              .duration(200)
              .attr('r', Math.max(15, d.projects / 2) * GLOBE_CONFIG.HOVER_SCALE_FACTOR)
              .attr('opacity', 1)
              .style('filter', 'drop-shadow(0 0 20px rgba(229, 231, 235, 1))')

            d3.select(this).select('.project-label')
              .transition()
              .duration(200)
              .attr('opacity', 1)
          }
        }
      })
      .on('mouseout', function(event, d) {
        const coords = projection([d.lng, d.lat])
        if (coords) {
          const [x, y] = coords
          const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
          const visible = distance < GLOBE_CONFIG.SCALE
          const depth = (GLOBE_CONFIG.SCALE - distance) / GLOBE_CONFIG.SCALE
          const baseSize = Math.max(5, d.projects / 6)
          const size = visible ? baseSize + depth * 4 : 0
          
          d3.select(this).select('.project-circle')
            .transition()
            .duration(300)
            .attr('r', size)
            .attr('opacity', visible ? 0.9 + depth * 0.1 : 0)
            .style('filter', 'drop-shadow(0 0 8px rgba(229, 231, 235, 0.6))')

          d3.select(this).select('.project-label')
            .transition()
            .duration(300)
            .attr('opacity', 0)
        }
      })

    elementsRef.current.projectDots = projectDots

    // Initial update
    updateGlobePositions()

    console.log('✅ Globe initialized')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoading, worldData, filteredProjects, theme])

  // Removed scroll-based animations for better performance

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Global Portfolio...</div>
          <div className="text-gray-400 text-sm mt-2">Preparing interactive globe</div>
        </div>
      </div>
    )
  }

  return (
    <div ref={globeRef} className={`relative w-full ${compact ? 'h-full' : 'min-h-screen'} bg-gray-50 dark:bg-black overflow-hidden`}>

      {/* Filter Controls - Only show if enabled */}
      {showFilters && (
        <div className="absolute top-8 left-8 right-8 z-10">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {showTitle && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Project Portfolio</h2>}
            
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-500 dark:focus:ring-white focus:border-transparent"
              >
                <option value="">Sector</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-gray-500 dark:focus:ring-white focus:border-transparent"
              >
                <option value="">Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Globe Container */}
      <div className={`flex items-center justify-center ${compact ? 'h-full' : 'min-h-screen pt-20 pb-8'}`}>
        <svg
          ref={svgRef}
          viewBox="0 0 600 600"
          className="w-full h-auto max-w-2xl"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.05))'
          }}
        />
      </div>

      {/* Project Details Panel - Only show if enabled */}
      {showProjectPanel && hoveredProject && mounted && (
        <div className="absolute bottom-8 left-8 right-8 bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-lg p-6 border border-gray-300 dark:border-gray-800">
          {(() => {
            const project = allProjects.find(p => p.id === hoveredProject)
            if (!project) return null
            
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{project.description}</h3>
                  <button
                    onClick={() => setHoveredProject(null)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                    <div className="text-gray-900 dark:text-white font-medium">{project.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
                    <div className="text-gray-900 dark:text-white font-medium">{project.projects}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Year</div>
                    <div className="text-gray-900 dark:text-white font-medium">{project.year}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sectors</div>
                    <div className="flex flex-wrap gap-2">
                      {project.sector.map(s => (
                        <span key={s} className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Technologies</div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => (
                        <span key={tech} className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-8 right-8 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="text-sm font-medium text-white mb-3">Global Portfolio</div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Projects: {filteredProjects.length} of {allProjects.length}</div>
            <div>Countries: {new Set(filteredProjects.map(p => p.name)).size}</div>
            <div>Regions: {new Set(filteredProjects.map(p => p.region)).size}</div>
          </div>
        </div>
      )}

      {/* Country Tooltip */}
      {hoveredCountry && mounted && (
        <div className={`absolute ${compact ? 'top-4' : 'top-32'} left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-sm rounded-lg p-4 border border-gray-800 min-w-[250px]`}>
          <div className="text-center">
            {(() => {
              const countryInfo = countryData.find(c =>
                c.country_name === hoveredCountry ||
                c.iso_a2 === hoveredCountry ||
                c.iso_a3 === hoveredCountry
              )
              const countryProjects = filteredProjects.filter(p => p.name === hoveredCountry)

              return (
                <>
                  {countryInfo && (
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={countryInfo.flag_url}
                        alt={`${countryInfo.country_name} flag`}
                        className="w-8 h-6 rounded-sm shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div>
                        <div className="text-white font-semibold">{countryInfo.country_name}</div>
                        <div className="text-gray-400 text-xs">{countryInfo.region} • {countryInfo.subregion}</div>
                      </div>
                    </div>
                  )}
                  {!countryInfo && (
                    <div className="text-white font-semibold mb-2">{hoveredCountry}</div>
                  )}
                  <div className="text-gray-400 text-sm">
                    {countryProjects.length > 0 ? (
                      (() => {
                        const totalProjects = countryProjects.reduce((sum, p) => sum + p.projects, 0)
                        return `${totalProjects} projects across ${countryProjects.length} locations`
                      })()
                    ) : (
                      'No projects in this country'
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Interactive instructions */}
      {showInstructions && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
          <div className="text-sm text-gray-400 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800 text-center">
            🌍 Drag to rotate • Hover countries & markers • Use filters above
          </div>
        </div>
      )}
    </div>
  )
}
