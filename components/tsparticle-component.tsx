"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

interface BackgroundProps {
    className?: string;
}

export function Background({ className }: BackgroundProps) {
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
            particles: {
                number: { value: 500, density: { enable: true, value_area: 800 } },
                color: { value: "#6b7280" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 2, random: true },
                move: {
                    enable: true,
                    speed: 3,
                    // direction: "right" as const,
                    random: true,
                    // straight: true,
                    out_mode: "",
                    bounce: true,
                    attract: { enable: true, },
                },
                collisions: {
                    enable: true,
                    mode: "bounce" as const,
                    overlap: { enable: true },
                },
                links: {
                    enable: false,
                    blink: true,
                    distance: 400,
                    color: "#d3d3d3",
                    opacity: 0.5,
                    width: 1,
                },
            },
            smooth: true,
            interactivity: {
                detect_on: "canvas",
                events: {
                    onHover: {
                        enable: true,
                        mode: "repulse" as const,
                        parallax: { enable: true, force: 100, smooth: 10 },
                    },
                },
                modes: {
                    repulse: {
                        distance: 100,
                        duration: 0.4,
                    },
                },

            },
            detectRetina: true,
            fpsLimit: 240,
        }),
        []
    );

    return (
        <div className={className}>
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

export default Background;