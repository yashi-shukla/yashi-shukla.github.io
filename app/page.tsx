'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mail, Linkedin, Github, Menu, X, ChevronDown } from 'lucide-react'

// Brand SVG icons not available in Lucide
const TableauIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.654 0v2.406h-2.36v1.17h2.36v2.468h1.18V3.576h2.36V2.406h-2.36V0h-1.18zm-4.18 4.404V7.69H4.66v1.18h2.814v3.25h1.18v-3.25h2.814V7.69H8.654V4.404h-1.18zm8.588 0V7.69h-2.814v1.18h2.814v3.25h1.18v-3.25h2.814V7.69h-2.814V4.404h-1.18zM11.654 8.84v3.286h-2.36v1.18h2.36v3.286h1.18v-3.286h2.36v-1.18h-2.36V8.84h-1.18zm-8.41 4.368v2.406H0v1.18h3.244v2.406h1.18v-2.406h3.244v-1.18H4.424v-2.406h-1.18zm16.77 0v2.406h-3.244v1.18h3.244v2.406h1.18v-2.406H24v-1.18h-3.006v-2.406h-1.18zm-8.36 4.38v3.286h-2.36v1.18h2.36V24h1.18v-2.146h2.36v-1.18h-2.36v-3.286h-1.18z"/>
  </svg>
)

const SubstackIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24l9.6-5.244 9.6 5.244V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
  </svg>
)

const MediumIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
)
import { DraggableGlobe } from '@/components/draggable-globe'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { NumberTicker } from '@/components/ui/number-ticker'
import { STATS } from '@/lib/constants'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  // Initialize GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text reveal with stagger
      gsap.from('.hero-line', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      })

      // Scroll indicator
      gsap.from('.scroll-cta', {
        opacity: 0,
        y: -20,
        duration: 0.8,
        delay: 1.2,
        ease: 'power2.out',
      })

      // Stats counter animation - use fromTo to avoid layout issues
      ScrollTrigger.batch('.stat-card', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            {
              y: 40,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            }
          )
        },
        start: 'top 85%',
        once: true,
      })

      // Section titles - use fromTo to avoid layout issues
      gsap.utils.toArray('.section-reveal').forEach((el) => {
        gsap.fromTo(el as Element,
          {
            y: 40,
            opacity: 0,
          },
          {
            scrollTrigger: {
              trigger: el as Element,
              start: 'top 85%',
              once: true,
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        )
      })

      // Cards with stagger - use fromTo to avoid layout issues
      ScrollTrigger.batch('.card-reveal', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            {
              y: 50,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            }
          )
        },
        start: 'top 85%',
        once: true,
      })
    }, mainRef)

    return () => ctx.revert()
  }, [])

  const scrollToExplore = () => {
    document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Yashi Shukla",
    jobTitle: "Data Engineer & AI Specialist",
    url: "https://yashi-shukla.github.io",
    sameAs: [
      "https://linkedin.com/in/yashi-shukla",
      "https://github.com/yashi-shukla",
    ],
    knowsAbout: [
      "Data Engineering",
      "Artificial Intelligence",
      "Machine Learning",
      "Cloud Architecture",
      "LLM Pipelines",
      "Python",
      "GCP",
      "AWS",
      "Azure",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressCountry: "India",
    },
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navigation - Minimal */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
        <div className="container-custom">
          <div className="flex justify-between items-center h-14">
            <a href="/" className="tracking-tight text-lg font-medium" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
              Yashi Shukla
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {['About', 'Work', 'Projects', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={item === 'Projects' ? '/projects' : `#${item.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors animated-underline"
                >
                  {item}
                </a>
              ))}
              <ThemeToggle />
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t border-border/40 py-4 space-y-3">
              {['About', 'Work', 'Projects', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={item === 'Projects' ? '/projects' : `#${item.toLowerCase()}`}
                  className="block text-sm text-muted-foreground hover:text-foreground py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero - Minimal, points to globe */}
      <section className="min-h-screen flex flex-col justify-center relative pt-14">
        <div className="container-custom py-20 lg:py-32">
          <div className="max-w-4xl">
            {/* Role badge */}
            <div className="hero-line mb-8">
              <Badge variant="outline" className="text-xs tracking-wider">
                Data Engineer & AI Specialist
              </Badge>
            </div>

            {/* Main headline - Serif */}
            <h1 className="hero-title text-fluid-display text-foreground mb-6">
              <span className="hero-line block">Empowering positive</span>
              <span className="hero-line block">change through</span>
              <span className="hero-line block text-muted-foreground">data & AI</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-line text-fluid-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Building cloud-native systems, LLM workflows, and analytics solutions
              for private and global development organizations.
            </p>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-cta absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer" onClick={scrollToExplore}>
          <span className="text-xs text-muted-foreground tracking-wider uppercase">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 text-muted-foreground scroll-indicator" />
        </div>
      </section>

      {/* Screen 2: Stats + Globe — one cohesive section */}
      <section id="explore" className="bg-muted/30">
        {/* Stats row */}
        <div className="container-custom pt-16 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <Card className="stat-card card-3d text-center border-0 shadow-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl lg:text-5xl font-normal tracking-tight">
                  <NumberTicker value={STATS.totalProjects} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Projects Delivered</p>
              </CardContent>
            </Card>
            <Card className="stat-card card-3d text-center border-0 shadow-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl lg:text-5xl font-normal tracking-tight">
                  <NumberTicker value={10} suffix="M+" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Records Processed</p>
              </CardContent>
            </Card>
            <Card className="stat-card card-3d text-center border-0 shadow-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl lg:text-5xl font-normal tracking-tight">
                  <NumberTicker value={STATS.yearsExperience} suffix="+" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Years Experience</p>
              </CardContent>
            </Card>
            <Card className="stat-card card-3d text-center border-0 shadow-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-4xl lg:text-5xl font-normal tracking-tight">
                  <NumberTicker value={STATS.cloudPlatforms} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Cloud Platforms</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Globe */}
        <div id="globe" className="relative pb-8">
          <DraggableGlobe showFilters={false} />
        </div>
      </section>

      {/* Screen 3: About */}
      <section id="about" className="section-padding bg-background">
        <div className="container-custom">
          <div className="section-reveal text-center mb-16">
            <Badge variant="outline" className="mb-4">About</Badge>
            <h2 className="section-title text-fluid-2xl text-foreground mb-6">
              Who Am I
            </h2>
            <p className="text-fluid-base text-muted-foreground max-w-2xl mx-auto">
              Currently at the World Bank Group, previously at IDinsight. I specialize in
              transforming complex data challenges into scalable, impactful solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                title: 'AI & LLM Engineering',
                desc: 'Building autonomous agents with Gemini and GPT. Prompt engineering, multimodal processing, and MLOps for production.'
              },
              {
                title: 'Cloud Architecture',
                desc: 'Designing systems on AWS, GCP, and Azure. Expert in Redshift, BigQuery, Spark, and cost-optimized serverless.'
              },
              {
                title: 'Social Impact',
                desc: 'Data solutions for governments and nonprofits across India, Africa, and globally. Making data accessible and actionable.'
              }
            ].map((item) => (
              <Card key={item.title} className="card-reveal card-3d border-0 shadow-sm flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="leading-relaxed">{item.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Work Section */}
      <section id="work" className="section-padding bg-background">
        <div className="container-custom">
          <div className="section-reveal text-center mb-16">
            <Badge variant="outline" className="mb-4">Work</Badge>
            <h2 className="section-title text-fluid-2xl text-foreground mb-6">
              Featured Projects
            </h2>
            <p className="text-fluid-base text-muted-foreground max-w-2xl mx-auto">
              Real-world impact across government, nonprofit, and private sector projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[
              {
                org: 'Gates Foundation',
                title: 'Gemini LLM Pipeline',
                desc: 'GCP pipeline with Gemini multimodal LLM to extract structured data from 10M+ PDFs for national survey sampling.',
                skills: ['Python', 'GCP', 'Gemini', 'BigQuery']
              },
              {
                org: 'World Bank Group',
                title: 'Data360 Platform',
                desc: 'Migrating pipelines to Databricks, standardizing datasets using SDMX, building GAFS Dashboard for food security.',
                skills: ['Python', 'Databricks', 'SQL', 'APIs']
              },
              {
                org: 'Niti Aayog',
                title: 'NDAP Dashboard',
                desc: 'Redshift architecture ingesting terabytes of clickstream data with Superset dashboards for government analytics.',
                skills: ['AWS', 'Redshift', 'Spark', 'Superset']
              },
              {
                org: 'UNICEF Malawi',
                title: 'Cash Transfer Monitoring',
                desc: 'Automated data workflows for Social Cash Transfer Programme, reducing manual update time by 25%.',
                skills: ['Python', 'APIs', 'SQL']
              },
              {
                org: 'Indus Action',
                title: 'Benefits Platform',
                desc: 'Scalable pipelines with AWS to expand government benefit access to 3M+ workers with real-time tracking.',
                skills: ['AWS', 'Redshift', 'Glue', 'FastAPI']
              },
              {
                org: 'IDinsight',
                title: 'MOSAIKS Imagery',
                desc: 'Optimized satellite imagery sampling with Dask on Azure Kubernetes, achieving 10x faster runtime.',
                skills: ['Azure', 'Kubernetes', 'Dask', 'Python']
              }
            ].map((project) => (
              <Card key={project.title} className="card-reveal card-3d border-0 shadow-sm group flex flex-col">
                <CardHeader className="pb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{project.org}</span>
                  <CardTitle className="text-lg mt-1 group-hover:text-muted-foreground transition-colors">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <CardDescription className="leading-relaxed">{project.desc}</CardDescription>
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/50">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="section-reveal text-center mt-16">
            <a href="/projects">
              <InteractiveHoverButton>View All Projects</InteractiveHoverButton>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-20 bg-muted/20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="section-reveal text-center mb-10">
              <Badge variant="outline" className="mb-4">Contact</Badge>
              <h2 className="section-title text-fluid-2xl text-foreground mb-6">
                Let&apos;s Connect
              </h2>
              <p className="text-fluid-base text-muted-foreground">
                Interested in working together? I&apos;d love to hear about your project.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="card-reveal space-y-5">
                <p className="text-muted-foreground leading-relaxed">
                  I&apos;m particularly interested in projects at the intersection of data engineering,
                  AI, and social impact. Whether it&apos;s LLM pipelines, cloud architecture, or
                  analytics solutions. Let&apos;s talk!
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Mail, label: 'yashishkl1@gmail.com', href: 'mailto:yashishkl1@gmail.com' },
                    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/yashi-shukla' },
                    { icon: Github, label: 'GitHub', href: 'https://github.com/yashi-shukla' },
                    { icon: TableauIcon, label: 'Tableau Public', href: 'https://public.tableau.com/app/profile/yashishukla/' },
                    { icon: SubstackIcon, label: 'Substack', href: 'https://substack.com/@yashishukla' },
                    { icon: MediumIcon, label: 'Medium', href: 'https://medium.com/@yashi.shukla' },
                  ].map(({ icon: Icon, label, href }) => (
                    <div key={label} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm animated-underline"
                        >
                          {label}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">{label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <Card className="card-reveal border-0 shadow-sm bg-background">
                <CardHeader>
                  <CardTitle className="text-lg">Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message</label>
                      <textarea
                        rows={4}
                        placeholder="Tell me about your project..."
                        className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-6 border-t border-border/40">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Yashi Shukla
            </p>
            <div className="flex items-center gap-6">
              <a href="/Yashi_Resume.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Resume
              </a>
              <a href="https://linkedin.com/in/yashi-shukla" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="https://github.com/yashi-shukla" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
