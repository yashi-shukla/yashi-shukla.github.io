'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// Configuration constants inspired by ben-tiki/d3-globe
const GLOBE_CONFIG = {
  ROTATION_SENSITIVITY: 0.5,
  AUTO_ROTATION_SPEED: 0.3,
  SCALE: 250,
  HOVER_SCALE_FACTOR: 1.2
}

// Color palette for choropleth mapping (inspired by ben-tiki/d3-globe)
const COLOR_RANGE = [
  '#f7fbff', // Very light blue
  '#deebf7',
  '#c6dbef',
  '#9ecae1',
  '#6baed6',
  '#4292c6',
  '#2171b5',
  '#08519c',
  '#08306b'  // Dark blue
]

// Color scale options (linear or logarithmic)
const COLOR_SCALE = 'linear' // Can be 'linear' or 'log'

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

export function DraggableGlobe() {
  const globeRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [rotation, setRotation] = useState<[number, number, number]>([0, -10, 0])
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [countryData, setCountryData] = useState<CountryData[]>([])
  const [globeCoordinates, setGlobeCoordinates] = useState<ProjectData[] | null>(null)
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate optimized dot grid for globe surface
  const surfacePoints = React.useMemo(() => {
    const dots = []
    const step = 10 // Increased step for better performance

    for (let lat = -80; lat <= 80; lat += step) {
      const radius = Math.cos((lat * Math.PI) / 180)
      const circumference = 2 * Math.PI * radius
      const numDots = Math.max(1, Math.floor(circumference / (step * Math.PI / 180)))

      for (let i = 0; i < numDots; i++) {
        const lng = (i * 360) / numDots - 180
        dots.push({ lat, lng, id: `${lat}-${lng}` })
      }
    }
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

  // Load globe coordinates for enhanced projection
  const loadGlobeCoordinates = async () => {
    try {
      console.log('📍 Fetching globe coordinates...')
      const response = await fetch('/data/globe-coordinates.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const coordinates = await response.json()
      console.log('✅ Globe coordinates loaded successfully')
      return coordinates
    } catch (error) {
      console.error('❌ Error loading globe coordinates:', error)
      return null
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

  // Enhanced color scale for choropleth mapping
  const getColorScale = React.useMemo(() => {
    const maxProjects = Math.max(...filteredProjects.map(p => p.projects))
    const domain = COLOR_SCALE === 'log'
      ? [1, Math.log10(maxProjects)]
      : [0, maxProjects]

    const scale = COLOR_SCALE === 'log'
      ? d3.scaleLog().domain(domain).range([0, COLOR_RANGE.length - 1])
      : d3.scaleLinear().domain(domain).range([0, COLOR_RANGE.length - 1])

    return (value: number) => {
      if (value === 0) return 'rgba(55, 65, 81, 0.1)'
      const index = Math.floor(scale(value))
      return COLOR_RANGE[Math.min(index, COLOR_RANGE.length - 1)]
    }
  }, [filteredProjects])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Data loading effect - runs only once
  useEffect(() => {
    console.log('🌍 Starting globe data loading...')
    const loadData = async () => {
      try {
        // Soft timeout (resolve instead of reject) to avoid crashing UI
        const timeoutPromise = new Promise(resolve =>
          setTimeout(() => resolve(undefined), 15000)
        )

        const dataPromise = Promise.all([
          loadWorldData(),
          loadCountryData(),
          loadGlobeCoordinates()
        ])

        console.log('⏳ Loading world data, country data, and coordinates...')
        const raced = await Promise.race([dataPromise, timeoutPromise])
        const [worldDataResult, countryDataResult, coordinates] = Array.isArray(raced) ? raced : [null, null, null]

        // Set the loaded data to state
        if (worldDataResult) setWorldData(worldDataResult)
        if (countryDataResult) setCountryData(countryDataResult)
        if (coordinates) setGlobeCoordinates(coordinates)

        console.log('✅ All globe data loaded successfully')
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error loading globe data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, []) // Empty dependency array - runs only once

  // Globe rendering effect - runs when data is loaded and mounted
  useEffect(() => {
    if (!svgRef.current || !mounted || isLoading) return

    console.log('🎨 Starting globe rendering...')
    const svg = d3.select(svgRef.current)
    const width = 600
    const height = 600
    const radius = 250

    // Create globe projection with improved settings
    const projection = d3.geoOrthographic()
      .scale(GLOBE_CONFIG.SCALE)
      .translate([width / 2, height / 2])
      .rotate(rotation)
      .clipAngle(90)

    const path = d3.geoPath().projection(projection)

    // Clear previous content
    svg.selectAll('*').remove()

    // Enhanced drag behavior based on Observable example
    const drag = d3.drag()
      .subject(function() {
        const r = projection.rotate()
        return { x: r[0] / GLOBE_CONFIG.ROTATION_SENSITIVITY, y: -r[1] / GLOBE_CONFIG.ROTATION_SENSITIVITY }
      })
      .on('start', function() {
        setIsDragging(true)
        stopAutoRotate()
      })
      .on('drag', function(event) {
        const newRotation: [number, number, number] = [
          event.x * GLOBE_CONFIG.ROTATION_SENSITIVITY,
          -Math.max(-90, Math.min(90, event.y * GLOBE_CONFIG.ROTATION_SENSITIVITY)),
          rotation[2]
        ]
        setRotation(newRotation)
        projection.rotate(newRotation)
        updateGlobe()
      })
      .on('end', function() {
        setIsDragging(false)
        setTimeout(() => {
          if (!isDragging) startAutoRotate()
        }, 3000)
      })

    // Add interactive sphere for drag (visible for debugging)
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', GLOBE_CONFIG.SCALE)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('cursor', 'grab')
      
    // Apply drag behavior to the entire SVG
    svg.call(drag)
      .style('cursor', 'grab')
      .on('mousedown', function() {
        d3.select(this).style('cursor', 'grabbing')
      })
      .on('mouseup', function() {
        d3.select(this).style('cursor', 'grab')
      })

    // Add globe outline with gray theme
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', GLOBE_CONFIG.SCALE)
      .attr('fill', 'rgba(31, 41, 55, 0.1)') // Dark gray fill
      .attr('stroke', '#9ca3af') // Light gray stroke
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 20px rgba(156, 163, 175, 0.2))')
      .style('pointer-events', 'none')

    // Add subtle grid lines with gray theme
    const graticule = d3.geoGraticule().step([15, 15])
    svg.append('path')
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#6b7280') // Medium gray
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.3)

    // Add country boundaries with choropleth effect (using stored worldData)
    if (worldData && worldData.features) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const countryPaths = svg.selectAll('.country')
        .data(worldData.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', d => {
          const projectsInCountry = filteredProjects.filter(p =>
            p.name === d.properties.name ||
            (p.name === 'USA' && d.properties.name === 'United States') ||
            (p.name === 'South Africa' && d.properties.name === 'South Africa')
          )
          const totalProjects = projectsInCountry.reduce((sum, p) => sum + p.projects, 0)
          return getColorScale(totalProjects)
        })
        .attr('stroke', '#4b5563')
        .attr('stroke-width', 0.3)
        .attr('opacity', 0.8)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const countryName = d.properties.name === 'United States' ? 'USA' : d.properties.name
          setHoveredCountry(countryName)
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', 1)
            .attr('stroke', '#9ca3af')
        })
        .on('mouseout', function() {
          setHoveredCountry(null)
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0.3)
            .attr('stroke', '#4b5563')
        })
    }

    // Add surface dots with gray theme
    const surfaceDots = svg.selectAll('.surface-dot')
      .data(surfacePoints)
      .enter()
      .append('circle')
      .attr('class', 'surface-dot')
      .attr('r', 1.2)
      .attr('fill', '#9ca3af') // Light gray dots
      .attr('opacity', 0.3)

    // Add project locations (filtered)
    const projectDots = svg.selectAll('.project-dot')
      .data(filteredProjects)
      .enter()
      .append('g')
      .attr('class', 'project-dot')

    // Project circles with light gray color
    projectDots.append('circle')
      .attr('class', 'project-circle')
      .attr('r', 0)
      .attr('fill', '#e5e7eb') // Light gray
      .attr('stroke', '#ffffff') // White stroke for contrast
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 0 8px rgba(229, 231, 235, 0.8))')
      .on('click', function(event, d) {
        setHoveredProject(hoveredProject === d.id ? null : d.id)
      })

    // Project labels
    projectDots.append('text')
      .attr('class', 'project-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .attr('opacity', 0)
      .style('text-shadow', '0 0 4px rgba(0, 0, 0, 0.8)')
      .text(d => `${d.name} (${d.projects})`)

    // Pulse animation for project dots
    const pulse = () => {
      projectDots.selectAll('.project-circle')
        .transition()
        .duration(2000)
        .attr('opacity', 0.5)
        .transition()
        .duration(2000)
        .attr('opacity', 0.9)
    }

    let pulseTimer: NodeJS.Timeout | undefined
    const startPulse = () => {
      pulseTimer = setInterval(pulse, 4000)
    }
    startPulse()

    // Update positions based on rotation
    const updateGlobe = () => {
      if (!svgRef.current) return // Guard against calling updateGlobe before SVG is ready

      projection.rotate(rotation)

      // Update surface dots with depth-based opacity
      if (surfaceDots) {
        surfaceDots.each(function(d: { lat: number; lng: number }) {
          const coords = projection([d.lng, d.lat])
          if (coords) {
            const [x, y] = coords
            const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
            const visible = distance < radius
            const depth = (radius - distance) / radius

            d3.select(this)
              .attr('cx', x)
              .attr('cy', y)
              .attr('opacity', visible ? Math.max(0.1, depth * 0.4) : 0)
              .attr('r', visible ? 1.5 + depth * 0.5 : 0)
          }
        })
      }

      // Update country boundaries if they exist
      if (worldData && worldData.features) {
        const countryPaths = svg.selectAll('.country')
        if (!countryPaths.empty()) {
          countryPaths.attr('d', path)
        }
      }

      // Update project dots with enhanced visibility and animation
      if (projectDots) {
        projectDots.each(function(d: ProjectData, i: number) {
          const coords = projection([d.lng, d.lat])
          if (coords) {
            const [x, y] = coords
            const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
            const visible = distance < GLOBE_CONFIG.SCALE
            const depth = (GLOBE_CONFIG.SCALE - distance) / GLOBE_CONFIG.SCALE
            const baseSize = Math.max(5, d.projects / 6)
            const size = visible ? baseSize + depth * 4 : 0
            const animationDelay = scrollProgress * i * 100

            d3.select(this).select('.project-circle')
              .attr('cx', x)
              .attr('cy', y)
              .transition()
              .delay(animationDelay)
              .duration(500)
              .attr('r', size)
              .attr('opacity', visible ? 0.9 + depth * 0.1 : 0)

            d3.select(this).select('.project-label')
              .attr('x', x)
              .attr('y', y - size - 8)
          }
        })
      }

      // Update graticule if it exists
      const graticulePath = svg.select('path')
      if (!graticulePath.empty()) {
        graticulePath.attr('d', path)
      }
    }

    // Enhanced hover effects inspired by ben-tiki/d3-globe
    if (projectDots) {
      projectDots
        .on('mouseover', function(event, d) {
        const coords = projection([d.lng, d.lat])
        if (coords) {
          const [x, y] = coords
          const distance = Math.sqrt((x - width/2)**2 + (y - height/2)**2)
          const visible = distance < GLOBE_CONFIG.SCALE
          
          if (visible) {
            // Scale up the project marker
            d3.select(this).select('.project-circle')
              .transition()
              .duration(200)
              .attr('r', Math.max(15, d.projects / 2) * GLOBE_CONFIG.HOVER_SCALE_FACTOR)
              .attr('opacity', 1)
              .style('filter', 'drop-shadow(0 0 20px rgba(229, 231, 235, 1))')

            // Show project label
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
    }

    updateGlobe()

    // Auto-rotation functionality
    let autoRotateTimer: NodeJS.Timeout

    const startAutoRotate = () => {
      autoRotateTimer = setInterval(() => {
        if (!isDragging) {
          setRotation(prev => [prev[0] + GLOBE_CONFIG.AUTO_ROTATION_SPEED, prev[1], prev[2]])
        }
      }, 50)
    }

    const stopAutoRotate = () => {
      if (autoRotateTimer) clearInterval(autoRotateTimer)
    }

    // Start auto rotation after initial delay
    const initialDelay = setTimeout(startAutoRotate, 2000)

    return () => {
      clearTimeout(initialDelay)
      stopAutoRotate()
      if (pulseTimer) clearInterval(pulseTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, rotation, filteredProjects, countryData, getColorScale, isLoading])

  // Scroll-based animations
  useEffect(() => {
    const handleScroll = () => {
      if (!globeRef.current) return

      const rect = globeRef.current.getBoundingClientRect()
      const elementTop = rect.top
      const elementHeight = rect.height
      const windowHeight = window.innerHeight

      const isInViewport = elementTop < windowHeight && elementTop + elementHeight > 0

      if (isInViewport) {
        const progress = Math.max(0, Math.min(1,
          (windowHeight - elementTop) / (windowHeight + elementHeight)
        ))
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Show loading state while data is being fetched
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
    <div ref={globeRef} className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Debug badge: data load verification */}
      <div className="absolute top-2 left-2 z-20 text-[10px] leading-tight text-gray-400 bg-black/70 border border-gray-800 rounded px-2 py-1">
        <div>GeoJSON: {worldData?.features?.length ?? 0} features</div>
        <div>CSV: {countryData?.length ?? 0} rows</div>
        <div>Coords: {globeCoordinates ? 'yes' : 'no'}</div>
      </div>
      {/* Filter Controls */}
      <div className="absolute top-8 left-8 right-8 z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Global Project Portfolio</h2>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-white focus:border-transparent"
            >
              <option value="">Sector</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-white focus:border-transparent"
            >
              <option value="">Region</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

          </div>
        </div>
      </div>

      {/* Globe Container */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8">
        <svg
          ref={svgRef}
          viewBox="0 0 600 600"
          className="w-full h-auto max-w-2xl"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.05))'
          }}
        />
      </div>

      {/* Project Details Panel */}
      {hoveredProject && mounted && (
        <div className="absolute bottom-8 left-8 right-8 bg-black/95 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          {(() => {
            const project = allProjects.find(p => p.id === hoveredProject)
            if (!project) return null
            
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{project.description}</h3>
                  <button
                    onClick={() => setHoveredProject(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="text-white font-medium">{project.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Projects</div>
                    <div className="text-white font-medium">{project.projects}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Year</div>
                    <div className="text-white font-medium">{project.year}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Sectors</div>
                    <div className="flex flex-wrap gap-2">
                      {project.sector.map(s => (
                        <span key={s} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Technologies</div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map(tech => (
                        <span key={tech} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
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
      <div className="absolute bottom-8 right-8 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
        <div className="text-sm font-medium text-white mb-3">Global Portfolio</div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Projects: {filteredProjects.length} of {allProjects.length}</div>
          <div>Countries: {new Set(filteredProjects.map(p => p.name)).size}</div>
          <div>Regions: {new Set(filteredProjects.map(p => p.region)).size}</div>
        </div>
      </div>

      {/* Enhanced Country Tooltip with Flag (inspired by ben-tiki/d3-globe) */}
      {hoveredCountry && mounted && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-sm rounded-lg p-4 border border-gray-800 min-w-[250px]">
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
                          // Hide flag if it fails to load
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
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
        <div className="text-sm text-gray-400 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800 text-center">
          🌍 Drag to rotate • Hover countries & markers • Use filters above
        </div>
      </div>
    </div>
  )
}
