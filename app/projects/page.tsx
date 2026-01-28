'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Filter, Search, MapPin } from 'lucide-react'
import { DraggableGlobe } from '@/components/draggable-globe'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PROJECTS, SKILLS, COUNTRIES, type ProjectData } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProjectsPage() {
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>(PROJECTS)
  const [selectedSkill, setSelectedSkill] = useState('All')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Handle globe country selection
  const handleGlobeProjectSelect = (projectId: string | null) => {
    setSelectedProject(projectId)

    if (projectId) {
      const project = PROJECTS.find(p => p.id === projectId)
      if (project) {
        setSelectedCountry(project.country)
      }
    } else {
      setSelectedCountry('All')
    }
  }

  // Filter projects
  useEffect(() => {
    let filtered = PROJECTS

    if (selectedSkill !== 'All') {
      filtered = filtered.filter(project =>
        project.skills.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase()))
      )
    }

    if (selectedCountry !== 'All') {
      filtered = filtered.filter(project =>
        project.country === selectedCountry
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.org.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }, [selectedSkill, selectedCountry, searchTerm])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </a>
              <div className="w-px h-5 bg-border"></div>
              <h1 className="text-lg font-medium tracking-tight">Projects</h1>
              <div className="w-px h-5 bg-border"></div>
              <a href="/Yashi_Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resume
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filteredProjects.length} of {PROJECTS.length}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by skill or country</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow text-sm"
              />
            </div>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow text-sm"
            >
              <option value="All">All Skills</option>
              {SKILLS.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow text-sm"
            >
              <option value="All">All Countries</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Globe */}
          <div className="bg-muted/30 rounded-lg overflow-hidden h-[600px] shadow-sm">
            <DraggableGlobe
              showFilters={false}
              showTitle={false}
              showLegend={false}
              showInstructions={true}
              showProjectPanel={false}
              compact={true}
              onProjectSelect={handleGlobeProjectSelect}
              externalSelectedProject={selectedProject}
              externalSelectedSkill={selectedSkill}
              externalSelectedCountry={selectedCountry}
            />
          </div>

          {/* Project List */}
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Project Details</h2>
              {selectedCountry !== 'All' && (
                <button
                  onClick={() => {
                    setSelectedCountry('All')
                    setSelectedProject(null)
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <span>Filtered: {selectedCountry}</span>
                  <span className="text-lg leading-none">×</span>
                </button>
              )}
            </div>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground flex-1 flex flex-col items-center justify-center">
                <Filter className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No projects match your filters</p>
                <p className="text-xs mt-1">Try adjusting your criteria</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 pr-2" data-lenis-prevent>
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedProject === project.id
                        ? 'bg-foreground text-background shadow-lg border-foreground'
                        : 'hover:shadow-md border-border/50'
                    }`}
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-xs uppercase tracking-wider ${
                            selectedProject === project.id ? 'text-background/60' : 'text-muted-foreground'
                          }`}>
                            {project.org}
                          </span>
                          <CardTitle className={`text-base mt-1 ${
                            selectedProject === project.id ? 'text-background' : ''
                          }`}>
                            {project.title}
                          </CardTitle>
                        </div>
                        <div className={`flex items-center gap-1.5 ${
                          selectedProject === project.id ? 'text-background/70' : 'text-muted-foreground'
                        }`}>
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs">{project.country}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className={`text-sm leading-relaxed ${
                        selectedProject === project.id ? 'text-background/70' : ''
                      }`}>
                        {project.description}
                      </CardDescription>

                      {/* Skills badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant={selectedProject === project.id ? 'outline' : 'secondary'}
                            className={`text-xs font-normal ${
                              selectedProject === project.id
                                ? 'border-background/30 text-background/80'
                                : ''
                            }`}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className={`mt-3 pt-3 border-t ${
                        selectedProject === project.id ? 'border-background/20' : 'border-border/50'
                      }`}>
                        <span className={`text-xs ${
                          selectedProject === project.id ? 'text-background/50' : 'text-muted-foreground'
                        }`}>
                          {project.year}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {selectedProject === project.id && (
                        <div className="mt-4 pt-4 border-t border-background/20">
                          <div>
                            <h4 className="font-medium text-background/80 text-sm mb-1">Impact</h4>
                            <p className="text-background/70 text-sm">{project.impact}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
