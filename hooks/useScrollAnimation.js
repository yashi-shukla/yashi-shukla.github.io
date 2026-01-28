import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * useScrollAnimation Hook
 * Connects scroll sections to globe camera animations using GSAP ScrollTrigger
 *
 * @param {Object} options
 * @param {Array} options.sections - Array of section selectors or refs
 * @param {Array} options.cameraTargets - Array of camera target positions [{x, y, z}, ...]
 * @param {Object} options.globeRef - Ref to the GlobeStage component
 * @param {Object} options.options - Additional options
 */
export function useScrollAnimation({
  sections = [],
  cameraTargets = [],
  globeRef,
  options = {}
}) {
  const {
    start = "top center",
    end = "bottom center",
    scrub = false,
    pin = false,
    anticipatePin = 1,
    parallaxText = true,
    sectionHighlights = true,
    debug = false
  } = options;

  const triggersRef = useRef([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !globeRef?.current) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('Reduced motion enabled, skipping scroll animations');
      return;
    }

    // Clear existing triggers
    triggersRef.current.forEach(trigger => trigger.kill());
    triggersRef.current = [];

    sections.forEach((section, index) => {
      const target = cameraTargets[index];

      if (!target) {
        console.warn(`No camera target for section ${index}`);
        return;
      }

      // Get section element
      const sectionElement = typeof section === 'string'
        ? document.querySelector(section)
        : section.current || section;

      if (!sectionElement) {
        console.warn(`Section element not found for index ${index}`);
        return;
      }

      // Create ScrollTrigger
      const trigger = ScrollTrigger.create({
        trigger: sectionElement,
        start,
        end,
        scrub: scrub ? 1 : false,
        pin: pin ? sectionElement : false,
        anticipatePin,
        markers: debug,

        onEnter: () => {
          if (globeRef.current?.moveCameraTo) {
            globeRef.current.moveCameraTo(
              [target.x, target.y, target.z],
              [0, 0, 0], // Look at center
              1.5 // Animation duration
            );
          }
        },

        onEnterBack: () => {
          if (globeRef.current?.moveCameraTo) {
            globeRef.current.moveCameraTo(
              [target.x, target.y, target.z],
              [0, 0, 0],
              1.5
            );
          }
        },

        // Optional parallax text animation
        onUpdate: parallaxText ? (self) => {
          if (parallaxText) {
            const progress = self.progress;
            const textElements = sectionElement.querySelectorAll('.parallax-text');

            textElements.forEach((el) => {
              gsap.set(el, {
                y: progress * -50,
                opacity: Math.max(0.3, 1 - progress * 0.3)
              });
            });
          }
        } : undefined
      });

      triggersRef.current.push(trigger);
    });

    // Section highlight animations
    if (sectionHighlights) {
      sections.forEach((section, index) => {
        const sectionElement = typeof section === 'string'
          ? document.querySelector(section)
          : section.current || section;

        if (sectionElement) {
          const trigger = ScrollTrigger.create({
            trigger: sectionElement,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
              // Highlight current section
              gsap.to(sectionElement, {
                backgroundColor: "rgba(255,255,255,0.05)",
                duration: 0.5
              });
            },
            onLeave: () => {
              // Remove highlight
              gsap.to(sectionElement, {
                backgroundColor: "transparent",
                duration: 0.5
              });
            },
            onEnterBack: () => {
              gsap.to(sectionElement, {
                backgroundColor: "rgba(255,255,255,0.05)",
                duration: 0.5
              });
            },
            onLeaveBack: () => {
              gsap.to(sectionElement, {
                backgroundColor: "transparent",
                duration: 0.5
              });
            }
          });

          triggersRef.current.push(trigger);
        }
      });
    }

    // Cleanup function
    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, [
    sections,
    cameraTargets,
    globeRef,
    start,
    end,
    scrub,
    pin,
    anticipatePin,
    parallaxText,
    sectionHighlights,
    debug
  ]);

  // Return control functions
  return {
    // Refresh all ScrollTriggers (useful after DOM changes)
    refresh: () => {
      ScrollTrigger.refresh();
    },

    // Kill all triggers
    kill: () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    },

    // Get all active triggers
    getTriggers: () => triggersRef.current
  };
}

/**
 * Predefined camera positions for common sections
 */
export const CAMERA_POSITIONS = {
  hero: { x: 0, y: 0, z: 8 },
  about: { x: 5, y: 2, z: 5 },
  services: { x: -5, y: 2, z: 5 },
  work: { x: 0, y: 5, z: 5 },
  projects: { x: 0, y: -5, z: 5 },
  contact: { x: 0, y: 0, z: 10 },
  // Additional positions
  northAmerica: { x: -2, y: 3, z: 6 },
  europe: { x: 3, y: 3, z: 6 },
  asia: { x: 6, y: 1, z: 5 },
  africa: { x: 2, y: -2, z: 6 },
  southAmerica: { x: -4, y: -2, z: 6 },
  australia: { x: 7, y: -4, z: 6 }
};

/**
 * Utility function to create section array from selectors
 */
export function createSectionsArray(selectors) {
  return selectors.map(selector =>
    typeof selector === 'string' ? selector : selector
  );
}









