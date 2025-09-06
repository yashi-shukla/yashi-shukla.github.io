'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Filter, Search, MapPin } from 'lucide-react'
import * as d3 from 'd3'

interface Project {
  id: string
  title: string
  description: string
  country: string
  region: string
  sector: string[]
  year: number
  status: 'completed' | 'ongoing' | 'planned'
  impact: string
  technologies: string[]
  lat: number
  lng: number
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Gemini LLM Pipeline - Gates Foundation',
    description: 'Architected GCP pipeline with Google Gemini multimodal LLM to process 10M+ PDFs for national survey sampling in India.',
    country: 'India',
    region: 'asia',
    sector: ['AI/ML', 'Government', 'LLM'],
    year: 2024,
    status: 'completed',
    impact: 'Processed 10M+ PDFs, automated OCR and data extraction, accelerated national survey sampling',
    technologies: ['Google Gemini', 'GCP', 'Python', 'BigQuery', 'AI Studio'],
    lat: 20,
    lng: 78
  },
  {
    id: '2',
    title: 'NDAP Monitoring Dashboard - Niti Aayog',
    description: 'Led design and implementation of Redshift-based architecture to ingest terabytes of clickstream data for India\'s National Data Analytics Platform.',
    country: 'India',
    region: 'asia',
    sector: ['Government', 'Big Data', 'Analytics'],
    year: 2023,
    status: 'completed',
    impact: 'Enabled real-time analytics on platform engagement and SLA compliance for government stakeholders',
    technologies: ['AWS Redshift', 'Apache Spark', 'Superset', 'Python'],
    lat: 28.6,
    lng: 77.2
  },
  {
    id: '3',
    title: 'SCTP Monitoring Dashboard - UNICEF Malawi',
    description: 'Automated raw data transformation workflows for Malawi government\'s Social Cash Transfer Programme monitoring.',
    country: 'Malawi',
    region: 'africa',
    sector: ['Government', 'Social Programs', 'UNICEF'],
    year: 2023,
    status: 'completed',
    impact: 'Reduced manual update time by 25%, enhanced data accuracy, strengthened government oversight',
    technologies: ['Python', 'Google Data Studio', 'APIs', 'Data Transformation'],
    lat: -13.25,
    lng: 34
  },
  {
    id: '4',
    title: 'Indus Action - Worker Benefits Platform',
    description: 'Built scalable data pipelines to expand government benefit access to 3M+ workers with Spark-based eligibility algorithms.',
    country: 'India',
    region: 'asia',
    sector: ['Government', 'Social Benefits'],
    year: 2022,
    status: 'completed',
    impact: 'Enabled benefit access for 3M+ workers, real-time outreach and claim tracking',
    technologies: ['AWS Redshift', 'Apache Spark', 'AWS Glue', 'Athena', 'FastAPI'],
    lat: 26.9,
    lng: 80.9
  },
  {
    id: '5',
    title: 'Praekelt Chatbot Backend',
    description: 'Developed FastAPI-based backend for Ask-Me-Anything chatbot with SQL data models for South African nonprofit.',
    country: 'South Africa',
    region: 'africa',
    sector: ['Nonprofit', 'AI/ML', 'Chatbot'],
    year: 2022,
    status: 'completed',
    impact: 'Reduced frontline support workload by 70%, enabled secure cross-organizational data sharing',
    technologies: ['FastAPI', 'SQL', 'Python', 'API Development'],
    lat: -30,
    lng: 25
  },
  {
    id: '6',
    title: 'Kidogo Daycare Quality Monitoring',
    description: 'Created monitoring system for analyzing daycare quality in Kenya using digital data collection and GCP BigQuery.',
    country: 'Kenya',
    region: 'africa',
    sector: ['Nonprofit', 'Education', 'Data Collection'],
    year: 2022,
    status: 'completed',
    impact: 'Enabled non-tech users to maintain monitoring system, improved daycare quality tracking',
    technologies: ['GCP BigQuery', 'Hevo', 'Kobo Toolbox', 'Low-code Solutions'],
    lat: 0,
    lng: 38
  },
  {
    id: '7',
    title: 'MOSAIKS Satellite Imagery Optimization',
    description: 'Optimized MOSAIKS grid sampling with Dask on Azure Kubernetes Service for global satellite image analysis.',
    country: 'Global',
    region: 'global',
    sector: ['Geospatial', 'AI/ML', 'Satellite'],
    year: 2023,
    status: 'completed',
    impact: 'Achieved 10x faster runtime performance for geospatial analysis',
    technologies: ['Dask', 'Azure Kubernetes', 'Python', 'Satellite Imagery', 'MLOps'],
    lat: 0,
    lng: 0
  },
  {
    id: '8',
    title: 'Aspirational Districts Programme - Niti Aayog',
    description: 'Created serverless architecture for mismatch reporting across government data collection levels.',
    country: 'India',
    region: 'asia',
    sector: ['Government', 'Serverless', 'Cost Optimization'],
    year: 2022,
    status: 'completed',
    impact: 'Improved data visibility for administrators with ultra-low cost architecture (<$20/month)',
    technologies: ['AWS Lambda', 'Step Functions', 'Serverless'],
    lat: 22,
    lng: 82
  },
  {
    id: '9',
    title: 'Hollard Insurance - Testing Automation',
    description: 'Automated end-to-end testing and data validation for Australian insurance groups using Azure DevOps.',
    country: 'Australia',
    region: 'oceania',
    sector: ['Insurance', 'QA', 'Testing'],
    year: 2021,
    status: 'completed',
    impact: 'Saved ~64 hours of manual QA work per month, reduced production defects',
    technologies: ['Azure DevOps', 'Selenium', 'Python', 'SQL'],
    lat: -25,
    lng: 135
  },
  {
    id: '10',
    title: 'Healthcare Analytics - Alpha Nodus',
    description: 'Built HIPAA-compliant patient data systems with statistical metrics and trend analysis for US healthcare groups.',
    country: 'USA',
    region: 'americas',
    sector: ['Healthcare', 'Analytics', 'HIPAA'],
    year: 2019,
    status: 'completed',
    impact: 'Reduced manual workload by 50%, increased patient throughput by 10%',
    technologies: ['Tableau', 'PostgreSQL', 'Python', 'Healthcare Analytics'],
    lat: 40,
    lng: -100
  }
]

const sectors = ['All', 'AI/ML', 'Government', 'LLM', 'Big Data', 'Analytics', 'Social Programs', 'UNICEF', 'Social Benefits', 'Nonprofit', 'Chatbot', 'Education', 'Healthcare', 'Insurance', 'QA', 'Testing', 'Geospatial', 'Satellite', 'Serverless', 'Cost Optimization']
const regions = ['All', 'Asia', 'Africa', 'Americas', 'Oceania', 'Global']

export default function ProjectsPage() {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects)
  const [selectedSector, setSelectedSector] = useState('All')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Globe setup
  const globeRef = React.useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!globeRef.current) return

    const svg = d3.select(globeRef.current)
    const width = 600
    const height = 400

    // Create globe projection
    const projection = d3.geoOrthographic()
      .scale(180)
      .translate([width / 2, height / 2])
      .rotate([0, 0, 0])

    const path = d3.geoPath().projection(projection)

    svg.selectAll('*').remove()

    // Add globe circle
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale())
      .attr('fill', 'none')
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 2)

    // Add grid lines
    const graticule = d3.geoGraticule().step([20, 20])
    svg.append('path')
      .datum(graticule)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#374151')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)

    // Add project dots
    const dots = svg.selectAll('.project-dot')
      .data(filteredProjects)
      .enter()
      .append('g')
      .attr('class', 'project-dot')
      .style('cursor', 'pointer')

    dots.each(function(d) {
      const coords = projection([d.lng, d.lat])
      if (coords) {
        const [x, y] = coords
        
        d3.select(this)
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', selectedProject === d.id ? 8 : 5)
          .attr('fill', '#ffffff')
          .attr('stroke', '#6b7280')
          .attr('stroke-width', 2)
          .attr('opacity', 0.9)
          .on('click', () => {
            setSelectedProject(selectedProject === d.id ? null : d.id)
          })
          .on('mouseover', function() {
            d3.select(this).transition().duration(200).attr('r', 7)
          })
          .on('mouseout', function() {
            d3.select(this).transition().duration(200).attr('r', selectedProject === d.id ? 8 : 5)
          })

        // Add project title on hover
        d3.select(this)
          .append('text')
          .attr('x', x)
          .attr('y', y - 15)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#ffffff')
          .attr('opacity', 0)
          .text(d.title)
          .on('mouseover', function() {
            d3.select(this).transition().duration(200).attr('opacity', 1)
          })
          .on('mouseout', function() {
            d3.select(this).transition().duration(200).attr('opacity', 0)
          })
      }
    })

  }, [filteredProjects, selectedProject])

  // Filter projects
  useEffect(() => {
    let filtered = projects

    if (selectedSector !== 'All') {
      filtered = filtered.filter(project => 
        project.sector.includes(selectedSector)
      )
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter(project => 
        project.region === selectedRegion.toLowerCase()
      )
    }


    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }, [selectedSector, selectedRegion, searchTerm])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Back
              </a>
              <div className="w-px h-6 bg-gray-700"></div>
              <h1 className="text-xl font-bold text-white">Real Projects Portfolio</h1>
            </div>
            <div className="text-sm text-gray-400">
              {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Filter Real Projects from Resume</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Sector Filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white"
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Globe */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Global Project Distribution</h2>
            <div className="flex justify-center">
              <svg
                ref={globeRef}
                width="600"
                height="400"
                viewBox="0 0 600 400"
                className="w-full h-auto max-w-lg"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.1))'
                }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center">
              Click on dots to view project details • Real projects from resume
            </p>
          </div>

          {/* Project List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Project Details</h2>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No projects match your current filters</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-6 rounded-lg border transition-all duration-300 cursor-pointer ${
                      selectedProject === project.id
                        ? 'bg-white text-black border-white'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{project.country}</span>
                      </div>
                    </div>
                    
                    <p className={`mb-4 ${selectedProject === project.id ? 'text-gray-700' : 'text-gray-400'}`}>
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.sector.map((s) => (
                        <span
                          key={s}
                          className={`px-2 py-1 text-xs rounded-full ${
                            selectedProject === project.id
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-end text-sm">
                      <span className={selectedProject === project.id ? 'text-gray-600' : 'text-gray-500'}>
                        {project.year}
                      </span>
                    </div>

                    {selectedProject === project.id && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-800 mb-1">Impact</h4>
                          <p className="text-gray-700 text-sm">{project.impact}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}