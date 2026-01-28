// Centralized project and skills data for consistency across the portfolio

export interface ProjectData {
  id: string
  title: string
  org: string
  description: string
  country: string
  region: string
  year: number
  status: 'completed' | 'ongoing' | 'planned'
  impact: string
  skills: string[]
  lat: number
  lng: number
}

// Skills from resume - core technical skills
export const SKILLS = [
  'Python',
  'SQL',
  'GCP',
  'AWS',
  'Azure',
  'Spark',
  'BigQuery',
  'Redshift',
  'Gemini',
  'FastAPI',
  'Airflow',
  'dbt',
  'Docker',
  'Kubernetes',
  'Tableau',
  'Superset',
  'Databricks',
] as const

export const REGIONS = ['Asia', 'Africa', 'Americas', 'Oceania', 'Global'] as const

// All projects with consistent skills mapping
export const PROJECTS: ProjectData[] = [
  {
    id: '1',
    title: 'Gemini LLM Pipeline',
    org: 'Gates Foundation',
    description: 'Architected GCP pipeline with Google Gemini multimodal LLM to process 10M+ PDFs for national survey sampling in India.',
    country: 'India',
    region: 'asia',
    year: 2024,
    status: 'completed',
    impact: 'Processed 10M+ PDFs, automated OCR and data extraction, accelerated national survey sampling',
    skills: ['Python', 'GCP', 'Gemini', 'BigQuery'],
    lat: 20,
    lng: 78
  },
  {
    id: '2',
    title: 'Data360 Platform',
    org: 'World Bank Group',
    description: 'Migrating data pipelines to Databricks, standardizing datasets using SDMX frameworks, building GAFS Dashboard for food security.',
    country: 'Global',
    region: 'global',
    year: 2025,
    status: 'ongoing',
    impact: 'Enabling global development insights through scalable data infrastructure',
    skills: ['Python', 'Databricks', 'SQL', 'Airflow'],
    lat: 38.9,
    lng: -77
  },
  {
    id: '3',
    title: 'NDAP Monitoring Dashboard',
    org: 'Niti Aayog',
    description: 'Led Redshift architecture ingesting terabytes of clickstream data for India\'s National Data Analytics Platform.',
    country: 'India',
    region: 'asia',
    year: 2023,
    status: 'completed',
    impact: 'Enabled real-time analytics on platform engagement and SLA compliance for government stakeholders',
    skills: ['AWS', 'Redshift', 'Spark', 'Superset', 'Python'],
    lat: 28.6,
    lng: 77.2
  },
  {
    id: '4',
    title: 'SCTP Cash Transfer Dashboard',
    org: 'UNICEF Malawi',
    description: 'Automated raw data transformation workflows for Malawi government\'s Social Cash Transfer Programme monitoring.',
    country: 'Malawi',
    region: 'africa',
    year: 2023,
    status: 'completed',
    impact: 'Reduced manual update time by 25%, enhanced data accuracy, strengthened government oversight',
    skills: ['Python', 'SQL', 'GCP'],
    lat: -13.25,
    lng: 34
  },
  {
    id: '5',
    title: 'Worker Benefits Platform',
    org: 'Indus Action',
    description: 'Built scalable data pipelines to expand government benefit access to 3M+ workers with Spark-based eligibility algorithms.',
    country: 'India',
    region: 'asia',
    year: 2022,
    status: 'completed',
    impact: 'Enabled benefit access for 3M+ workers, real-time outreach and claim tracking',
    skills: ['AWS', 'Redshift', 'Spark', 'FastAPI', 'Python'],
    lat: 26.9,
    lng: 80.9
  },
  {
    id: '6',
    title: 'Chatbot Backend',
    org: 'Praekelt',
    description: 'Developed FastAPI-based backend for Ask-Me-Anything chatbot with SQL data models for South African nonprofit.',
    country: 'South Africa',
    region: 'africa',
    year: 2022,
    status: 'completed',
    impact: 'Reduced frontline support workload by 70%, enabled secure cross-organizational data sharing',
    skills: ['FastAPI', 'SQL', 'Python'],
    lat: -30,
    lng: 25
  },
  {
    id: '7',
    title: 'Daycare Quality Monitoring',
    org: 'Kidogo',
    description: 'Created monitoring system for analyzing daycare quality in Kenya using digital data collection and GCP BigQuery.',
    country: 'Kenya',
    region: 'africa',
    year: 2022,
    status: 'completed',
    impact: 'Enabled non-tech users to maintain monitoring system, improved daycare quality tracking',
    skills: ['GCP', 'BigQuery', 'Python'],
    lat: 0,
    lng: 38
  },
  {
    id: '8',
    title: 'MOSAIKS Satellite Imagery',
    org: 'IDinsight',
    description: 'Optimized MOSAIKS grid sampling with Dask on Azure Kubernetes Service for global satellite image analysis.',
    country: 'Global',
    region: 'global',
    year: 2023,
    status: 'completed',
    impact: 'Achieved 10x faster runtime performance for geospatial analysis',
    skills: ['Azure', 'Kubernetes', 'Python'],
    lat: 0,
    lng: 0
  },
  {
    id: '9',
    title: 'Aspirational Districts Programme',
    org: 'Niti Aayog',
    description: 'Created serverless architecture for mismatch reporting across government data collection levels.',
    country: 'India',
    region: 'asia',
    year: 2022,
    status: 'completed',
    impact: 'Improved data visibility for administrators with ultra-low cost architecture (<$20/month)',
    skills: ['AWS', 'Python'],
    lat: 22,
    lng: 82
  },
  {
    id: '10',
    title: 'Testing Automation',
    org: 'Hollard Insurance',
    description: 'Automated end-to-end testing and data validation for Australian insurance groups using Azure DevOps.',
    country: 'Australia',
    region: 'oceania',
    year: 2021,
    status: 'completed',
    impact: 'Saved ~64 hours of manual QA work per month, reduced production defects',
    skills: ['Azure', 'Python', 'SQL'],
    lat: -25,
    lng: 135
  },
  {
    id: '11',
    title: 'Healthcare Analytics',
    org: 'Alpha Nodus',
    description: 'Built HIPAA-compliant patient data systems with statistical metrics and trend analysis for US healthcare groups.',
    country: 'USA',
    region: 'americas',
    year: 2019,
    status: 'completed',
    impact: 'Reduced manual workload by 50%, increased patient throughput by 10%',
    skills: ['Tableau', 'SQL', 'Python'],
    lat: 40,
    lng: -100
  },
  {
    id: '12',
    title: 'Surveystream Testing',
    org: 'IDinsight',
    description: 'Developed end-to-end regression testing suite and automated surveyor email notifications pipeline.',
    country: 'India',
    region: 'asia',
    year: 2023,
    status: 'completed',
    impact: 'Reduced manual QA efforts by 30%, enabled scalable email automation',
    skills: ['Python', 'Airflow', 'Docker'],
    lat: 19,
    lng: 73
  }
]

// Get unique skills used across all projects
export const getUniqueSkills = (): string[] => {
  const skillSet = new Set<string>()
  PROJECTS.forEach(project => {
    project.skills.forEach(skill => skillSet.add(skill))
  })
  return Array.from(skillSet).sort()
}

// Get projects by skill
export const getProjectsBySkill = (skill: string): ProjectData[] => {
  if (skill === 'All') return PROJECTS
  return PROJECTS.filter(project =>
    project.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
  )
}

// Get projects by region
export const getProjectsByRegion = (region: string): ProjectData[] => {
  if (region === 'All') return PROJECTS
  return PROJECTS.filter(project =>
    project.region.toLowerCase() === region.toLowerCase()
  )
}

// Unique countries that appear in projects (for dropdown filters)
export const COUNTRIES = Array.from(new Set(PROJECTS.map(p => p.country))).sort()

// Get projects by country
export const getProjectsByCountry = (country: string): ProjectData[] => {
  return PROJECTS.filter(project =>
    project.country.toLowerCase() === country.toLowerCase()
  )
}

// Get project count by country (for globe display)
export const getProjectCountByCountry = (): Record<string, number> => {
  const counts: Record<string, number> = {}
  PROJECTS.forEach(project => {
    const country = project.country
    counts[country] = (counts[country] || 0) + 1
  })
  return counts
}

// Get unique countries with projects
export const getCountriesWithProjects = (): string[] => {
  return Array.from(new Set(PROJECTS.map(p => p.country)))
}

// Stats calculations
export const STATS = {
  totalProjects: PROJECTS.length,
  totalCountries: new Set(PROJECTS.filter(p => p.country !== 'Global').map(p => p.country)).size,
  totalContinents: new Set(PROJECTS.map(p => p.region)).size,
  yearsExperience: new Date().getFullYear() - 2020, // Started in 2020
  cloudPlatforms: 3, // AWS, GCP, Azure
  recordsProcessed: '10M+',
}
