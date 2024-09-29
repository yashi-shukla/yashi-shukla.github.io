"use client"

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

interface TSParticlesSVGProps {
  svgPath: string
  color?: string
  particleCount?: number
  className?: string
}

export default function TSParticlesSVG({
  svgPath,
  color = "#000000",
  particleCount = 50
}: TSParticlesSVGProps) {
  const [particlesInit, setParticlesInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    if (container) {
      console.log(container);
    }
  };

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
          // resize: true,
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: color,
        },
        move: {
          // direction: "none",
          enable: true,
          // outModes: {
          //   default: "out",
          // },
          random: false,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            // area: 800,
          },
          value: particleCount,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "path",
          options: {
            path: {
              d: svgPath,
            },
          },
        },
        size: {
          value: { min: 10, max: 20 },
        },
      },
      detectRetina: true,
    }), []
  );

  return (
    <div className="h-screen w-screen">
      {particlesInit && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={particlesOptions}
        />

      )}
    </div>
  );
}
