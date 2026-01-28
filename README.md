# Yashi Shukla - Portfolio

Personal portfolio website showcasing data engineering, AI, and cloud projects.

**Live**: [yashi-shukla.github.io](https://yashi-shukla.github.io/)

## Tech Stack

- **Framework**: Next.js 14 (App Router, static export)
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **Visualization**: D3.js interactive globe with orthographic-to-equirectangular projection animation
- **Animations**: GSAP, ScrollTrigger, Lenis smooth scroll
- **Deployment**: GitHub Pages via GitHub Actions

## Features

- Interactive 3D globe with country highlighting for project locations
- Globe-to-flat-map unroll animation with smooth projection interpolation
- Light/dark theme with system preference detection
- Filterable project list by skill and country
- Animated number tickers for statistics
- Responsive design

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Static export to out/
npm run lint
```

## Project Structure

```
app/
  page.tsx              # Landing page (hero, stats, globe, about, work, contact)
  projects/page.tsx     # Projects page with filters and globe
  layout.tsx            # Root layout with fonts and theme provider
components/
  draggable-globe.tsx   # D3.js globe with projection interpolation
  ui/                   # shadcn/ui components
lib/
  constants.ts          # Project data, skills, stats
  animations.ts         # GSAP animation utilities
public/
  data/                 # Country metadata CSV
  Yashi_Resume.pdf
```

## Deployment

Pushes to `master` auto-deploy via GitHub Actions. The workflow builds the static export and deploys to GitHub Pages.
