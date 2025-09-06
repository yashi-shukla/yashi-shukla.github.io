'use client'

import React, { useState } from 'react'
import { ArrowRight, Mail, Phone, MapPin, Linkedin, Menu, X } from 'lucide-react'
import { DraggableGlobe } from '@/components/draggable-globe'

export default function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-white">YASHI SHUKLA</div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a>
              <a href="#work" className="text-gray-300 hover:text-white transition-colors">Work</a>
              <a href="/projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-black border-t border-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="#about"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#services"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </a>
                <a
                  href="#work"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Work
                </a>
                <a
                  href="/projects"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Projects
                </a>
                <a
                  href="#contact"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Empowering positive change through
            <span className="block text-gray-300">data, AI & cloud engineering</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            5+ years building cloud-native data systems, AI/ML workflows, and scalable solutions for governments, nonprofits, and enterprises worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 font-semibold">
              View My Work <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-900 hover:text-white transition-all duration-300">
              Get In Touch
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '50+', label: 'Global Projects' },
              { value: '10M+', label: 'Records Processed' },
              { value: '5+', label: 'Years Experience' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="bg-black p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Globe Section */}
      <DraggableGlobe />

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Who I Am</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Data Engineer & AI Specialist with 5+ years architecting cloud-native systems, LLM workflows, and scalable solutions for governments, nonprofits, and enterprises. Expert in MLOps, GenAI, and delivering data-driven impact at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI & ML Engineering',
                description: 'Building LLM workflows, GenAI solutions, and MLOps pipelines with Gemini, GPT, and TensorFlow'
              },
              {
                icon: '☁️',
                title: 'Cloud Architecture',
                description: 'Designing scalable systems on AWS, GCP, and Azure with serverless and containerized solutions'
              },
              {
                icon: '🌍',
                title: 'Social Impact',
                description: 'Delivering data solutions for governments, nonprofits, and social good organizations worldwide'
              }
            ].map((item, index) => (
              <div
                key={item.title}
                className="text-center bg-black p-6 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What I Do</h2>
            <p className="text-xl text-gray-400">Specialized services to help you harness the power of data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI & LLM Engineering',
                description: 'Building production LLM workflows, GenAI solutions, and multimodal AI systems for large-scale data processing.',
                features: ['Gemini & GPT Integration', 'LLM Fine-tuning & Prompt Engineering', 'Autonomous AI Agents', 'MLOps & Model Deployment']
              },
              {
                title: 'Cloud Data Engineering',
                description: 'Architecting cloud-native data systems, ETL/ELT pipelines, and scalable infrastructure across AWS, GCP, and Azure.',
                features: ['Serverless Data Pipelines', 'Data Warehousing (Redshift/BigQuery)', 'Real-time Processing', 'Cost Optimization (<$20/month)']
              },
              {
                title: 'Social Impact Solutions',
                description: 'Delivering data-driven solutions for governments, nonprofits, and social good organizations to maximize societal impact.',
                features: ['Government Analytics Platforms', 'Nonprofit Data Systems', 'Policy Impact Measurement', 'Benefit Access Optimization']
              }
            ].map((service, index) => (
              <div
                key={service.title}
                className="bg-gray-900 p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-gray-200 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <ul className="text-sm text-gray-400 space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">My Work</h2>
            <p className="text-xl text-gray-400">A selection of projects that showcase my expertise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Gemini LLM Pipeline (Gates Foundation)',
                description: 'Architected GCP pipeline with Google Gemini processing 10M+ PDFs for national survey sampling in India.',
                technologies: ['Google Gemini', 'GCP', 'Python', 'BigQuery']
              },
              {
                title: 'National Data Analytics Platform (NDAP)',
                description: 'Led Redshift architecture ingesting terabytes of clickstream data for India\'s government analytics platform.',
                technologies: ['AWS Redshift', 'Apache Spark', 'Superset', 'Python']
              },
              {
                title: 'SCTP Monitoring Dashboard (UNICEF)',
                description: 'Built automated data transformation workflows for Malawi government cash transfer program monitoring.',
                technologies: ['Python', 'Google Data Studio', 'APIs', 'ETL']
              }
            ].map((project, index) => (
              <div
                key={project.title}
                className="bg-black p-6 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gray-200 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
    </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Ready to start your next data project?</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Let&apos;s work together</h3>
              <p className="text-gray-600 mb-8">
                I&apos;m always interested in new opportunities and exciting projects.
                Whether you need help with data engineering, analytics, or cloud solutions,
                I&apos;d love to hear from you.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">yashi@example.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <a href="#" className="text-blue-600 hover:text-blue-700">linkedin.com/in/yashi-shukla</a>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Yashi Shukla. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}