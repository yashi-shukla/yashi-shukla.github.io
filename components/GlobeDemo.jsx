'use client'

import React, { useRef } from 'react';
import GlobeStage from './GlobeStage';
import { useScrollAnimation, CAMERA_POSITIONS } from '../hooks/useScrollAnimation';

/**
 * GlobeDemo Component
 * Example implementation showing how to use GlobeStage with scroll animations
 */
export default function GlobeDemo() {
  const globeRef = useRef();

  // Example project pins
  const projectPins = [
    { lat: 28.6139, lon: 77.2090, label: "Delhi, India" },
    { lat: 40.7128, lon: -74.0060, label: "New York, USA" },
    { lat: 51.5074, lon: -0.1278, label: "London, UK" },
    { lat: -33.8688, lon: 151.2093, label: "Sydney, Australia" },
    { lat: -13.8167, lon: -50.9333, label: "Brasília, Brazil" }
  ];

  // Define sections for scroll animation
  const sections = [
    '#hero',
    '#about',
    '#services',
    '#work',
    '#projects',
    '#contact'
  ];

  // Define camera targets for each section
  const cameraTargets = [
    CAMERA_POSITIONS.hero,
    CAMERA_POSITIONS.about,
    CAMERA_POSITIONS.services,
    CAMERA_POSITIONS.work,
    CAMERA_POSITIONS.projects,
    CAMERA_POSITIONS.contact
  ];

  // Initialize scroll animation
  useScrollAnimation({
    sections,
    cameraTargets,
    globeRef,
    options: {
      parallaxText: true,
      sectionHighlights: true,
      debug: process.env.NODE_ENV === 'development'
    }
  });

  // Handle pin clicks
  const handlePinClick = (pin, index) => {
    console.log('Pin clicked:', pin, index);
    // You can implement custom logic here
    // e.g., show project details, zoom to location, etc.
  };

  // Example function to manually control camera
  const moveToRandomLocation = () => {
    const positions = Object.values(CAMERA_POSITIONS);
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    globeRef.current?.moveCameraTo([randomPos.x, randomPos.y, randomPos.z]);
  };

  return (
    <div className="relative">
      {/* Globe Stage */}
      <GlobeStage
        ref={globeRef}
        pins={projectPins}
        onPinClick={handlePinClick}
        textureUrl="/assets/earth.jpg"
      />

      {/* Control Panel (for testing) */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 p-4 rounded-lg">
        <h3 className="text-white font-bold mb-2">Globe Controls</h3>
        <button
          onClick={moveToRandomLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
        >
          Random View
        </button>
        <button
          onClick={() => globeRef.current?.setCameraForSection('hero')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Hero View
        </button>
      </div>

      {/* Example sections for scroll animation */}
      <div id="hero" className="h-screen flex items-center justify-center bg-gray-900">
        <h1 className="text-6xl font-bold text-white parallax-text">Hero Section</h1>
      </div>

      <div id="about" className="h-screen flex items-center justify-center bg-gray-800">
        <h1 className="text-6xl font-bold text-white parallax-text">About Section</h1>
      </div>

      <div id="services" className="h-screen flex items-center justify-center bg-gray-700">
        <h1 className="text-6xl font-bold text-white parallax-text">Services Section</h1>
      </div>

      <div id="work" className="h-screen flex items-center justify-center bg-gray-600">
        <h1 className="text-6xl font-bold text-white parallax-text">Work Section</h1>
      </div>

      <div id="projects" className="h-screen flex items-center justify-center bg-gray-500">
        <h1 className="text-6xl font-bold text-white parallax-text">Projects Section</h1>
      </div>

      <div id="contact" className="h-screen flex items-center justify-center bg-gray-400">
        <h1 className="text-6xl font-bold text-white parallax-text">Contact Section</h1>
      </div>
    </div>
  );
}
