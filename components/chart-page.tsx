"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { format, parse, differenceInMonths } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const projectData = [
  {
    "project_id": 1,
    "country_of_project": "India",
    "company": "IDinsight",
    "start": "May 2022",
    "end": "Aug 2022",
    "skills": ["Redshift", "Superset", "AWS", "Python", "SQL"],
    "broader_categories": ["Data Engineering", "Dashboarding", "Software Engineering / Big Data"]
  },
  {
    "project_id": 2,
    "country_of_project": "Malawi",
    "company": "IDinsight",
    "start": "Feb 2023",
    "end": "Apr 2023",
    "skills": ["Google Data Studio", "Python"],
    "broader_categories": ["Dashboarding", "Software Engineering / Big Data"]
  },
  {
    "project_id": 3,
    "country_of_project": "India",
    "company": "IDinsight",
    "start": "Apr 2022",
    "end": "Nov 2022",
    "skills": ["Redshift", "Glue", "Athena", "Python", "Superset", "Terraform"],
    "broader_categories": ["Data Engineering", "Software Engineering / Big Data", "DevOps / MLOps"]
  },
  {
    "project_id": 4,
    "country_of_project": "South Africa",
    "company": "IDinsight",
    "start": "Aug 2022",
    "end": "Sept 2022",
    "skills": ["FastAPI", "SQL", "Python"],
    "broader_categories": ["Software Engineering / Big Data"]
  },
  {
    "project_id": 5,
    "country_of_project": "India",
    "company": "IDinsight",
    "start": "Jan 2023",
    "end": "Sept 2023",
    "skills": ["AWS Lambda", "AWS Step Functions", "AWS Lambda", "Python"],
    "broader_categories": ["Software Engineering / Big Data", "Data Engineering"]
  },
  {
    "project_id": 6,
    "country_of_project": "Kenya",
    "company": "IDinsight",
    "start": "Jan 2022",
    "end": "Mar 2022",
    "skills": ["Hevo", "BigQuery", "GCP", "Python"],
    "broader_categories": ["Data Engineering", "Dashboarding", "Software Engineering / Big Data"]
  },
  {
    "project_id": 7,
    "country_of_project": "IDinsight Product",
    "company": "IDinsight",
    "start": "Jan 2023",
    "end": "May 2024",
    "skills": ["Cypress", "Airflow", "Python", "SQL", "Email Pipelines"],
    "broader_categories": ["DevOps / MLOps", "Software Engineering / Big Data"]
  },
  {
    "project_id": 8,
    "country_of_project": "IDinsight Project",
    "company": "IDinsight",
    "start": "Jul 2023",
    "end": "Jul 2023",
    "skills": ["Dask", "Grid Sampling", "Python"],
    "broader_categories": ["Software Engineering / Big Data", "Data Engineering"]
  },
  {
    "project_id": 9,
    "country_of_project": "India",
    "company": "Lentra.ai",
    "start": "Oct 2020",
    "end": "Dec 2021",
    "skills": ["Postman", "PowerBI", "Azure Data Factory", "Runbooks", "Python"],
    "broader_categories": ["Software Engineering / Big Data", "Data Engineering", "DevOps / MLOps"]
  },
  {
    "project_id": 10,
    "country_of_project": "Australia",
    "company": "Xceedance",
    "start": "Jan 2020",
    "end": "Jun 2020",
    "skills": ["Azure DevOps", "MySQL", "Selenium", "Python"],
    "broader_categories": ["Software Engineering / Big Data", "DevOps / MLOps"]
  },
  {
    "project_id": 11,
    "country_of_project": "India",
    "company": "Alpha Nodus",
    "start": "May 2019",
    "end": "Jul 2019",
    "skills": ["Tableau", "PostgreSQL", "Python", "Pandas", "NumPy"],
    "broader_categories": ["Data Engineering", "Data Science methods", "Dashboarding"]
  }
]

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#6A2C70",
  "#B83B5E",
]

const countryCoordinates = {
  "India": [78, 21],
  "Malawi": [34, -13],
  "South Africa": [22, -30],
  "Kenya": [38, 1],
  "Australia": [133, -27],
  "IDinsight Product": [0, 0],
  "IDinsight Project": [0, 0],
}

export default function ChartPage() {
  const [selectedCompany, setSelectedCompany] = useState("All")

  const filteredProjects = useMemo(() => {
    return selectedCompany === "All"
      ? projectData
      : projectData.filter((project) => project.company === selectedCompany)
  }, [selectedCompany])

  const skillsData = useMemo(() => {
    const skillsCount = {}
    filteredProjects.forEach((project) => {
      const startDate = parse(project.start, "MMM yyyy", new Date())
      const endDate = parse(project.end, "MMM yyyy", new Date())
      const monthsSpent = differenceInMonths(endDate, startDate) + 1
      project.skills.forEach((skill) => {
        skillsCount[skill] = (skillsCount[skill] || 0) + monthsSpent
      })
    })
    return Object.entries(skillsCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [filteredProjects])

  const broaderCategoriesData = useMemo(() => {
    const categoriesCount = {}
    filteredProjects.forEach((project) => {
      project.broader_categories.forEach((category) => {
        categoriesCount[category] = (categoriesCount[category] || 0) + 1
      })
    })
    return Object.entries(categoriesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredProjects])

  const timelineData = useMemo(() => {
    const companies = [...new Set(projectData.map((project) => project.company))]
    return companies.map((company) => {
      const companyProjects = projectData.filter((project) => project.company === company)
      const start = companyProjects.reduce((min, p) => 
        (parse(p.start, "MMM yyyy", new Date()) < min ? parse(p.start, "MMM yyyy", new Date()) : min),
        parse(companyProjects[0].start, "MMM yyyy", new Date())
      )
      const end = companyProjects.reduce((max, p) => 
        (parse(p.end, "MMM yyyy", new Date()) > max ? parse(p.end, "MMM yyyy", new Date()) : max),
        parse(companyProjects[0].end, "MMM yyyy", new Date())
      )
      return { company, start, end }
    }).sort((a, b) => a.start - b.start)
  }, [])

  const projectsOverTime = useMemo(() => {
    const projectCounts = {}
    projectData.forEach((project) => {
      const year = parse(project.start, "MMM yyyy", new Date()).getFullYear()
      projectCounts[year] = (projectCounts[year] || 0) + 1
    })
    return Object.entries(projectCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year)
  }, [])

  const projectsByCountry = useMemo(() => {
    const countryProjects = {}
    filteredProjects.forEach((project) => {
      const country = project.country_of_project
      if (!countryProjects[country]) {
        countryProjects[country] = {
          name: country,
          count: 1,
          x: countryCoordinates[country] ? countryCoordinates[country][0] : 0,
          y: countryCoordinates[country] ? countryCoordinates[country][1] : 0,
        }
      } else {
        countryProjects[country].count++
      }
    })
    return Object.values(countryProjects)
  }, [filteredProjects])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Project and Skills Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Company Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[300px]">
            {timelineData.map((item, index) => (
              <div key={item.company} className="absolute w-full">
                <div
                  className="h-8 rounded-full flex items-center justify-center text-xs text-white px-2 overflow-hidden whitespace-nowrap"
                  style={{
                    left: `${(item.start.getTime() - timelineData[0].start.getTime()) / (timelineData[timelineData.length - 1].end.getTime() - timelineData[0].start.getTime()) * 100}%`,
                    width: `${(item.end.getTime() - item.start.getTime()) / (timelineData[timelineData.length - 1].end.getTime() - timelineData[0].start.getTime()) * 100}%`,
                    top: `${index * 40}px`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                >
                  {item.company}
                </div>
                <div
                  className="absolute w-3 h-3 rounded-full bg-gray-800"
                  style={{
                    left: `${(item.start.getTime() - timelineData[0].start.getTime()) / (timelineData[timelineData.length - 1].end.getTime() - timelineData[0].start.getTime()) * 100}%`,
                    top: `${index * 40 + 16}px`,
                  }}
                />
              </div>
            ))}
            <div className="absolute left-0 right-0 top-[280px] border-t border-gray-300 border-dashed" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{format(timelineData[0].start, "MMM yyyy")}</span>
            <span>{format(timelineData[timelineData.length - 1].end, "MMM yyyy")}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Skills (Months Spent)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broader Categories Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={broaderCategoriesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {broaderCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Projects Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={projectsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[-180, 180]} name="longitude" unit="°" />
                <YAxis type="number" dataKey="y" domain={[-90, 90]}  name="latitude" unit="°" />
                <ZAxis type="number" dataKey="count" range={[400, 2000]} name="projects" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Projects" data={projectsByCountry} fill="#8884d8">
                  {projectsByCountry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}