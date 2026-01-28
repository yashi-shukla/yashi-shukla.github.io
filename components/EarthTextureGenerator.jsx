'use client'

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * EarthTextureGenerator Component
 * Generates a procedural earth-like texture using Three.js CanvasTexture
 * Useful as a fallback when earth.jpg is not available
 */
export function generateEarthTexture() {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Create ocean background with better contrast
  ctx.fillStyle = '#1e3a8a'; // Deep ocean blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add continents with larger, more visible shapes
  // North America (much larger and more visible)
  ctx.fillStyle = '#16a34a'; // Dark green for better contrast
  ctx.beginPath();
  ctx.moveTo(150, 200);
  ctx.bezierCurveTo(100, 180, 200, 120, 350, 160);
  ctx.bezierCurveTo(450, 140, 500, 180, 480, 250);
  ctx.bezierCurveTo(460, 320, 400, 350, 300, 330);
  ctx.bezierCurveTo(200, 310, 150, 280, 150, 200);
  ctx.fill();

  // South America (larger and more visible)
  ctx.beginPath();
  ctx.moveTo(280, 380);
  ctx.bezierCurveTo(260, 350, 300, 320, 340, 340);
  ctx.bezierCurveTo(360, 360, 350, 420, 330, 480);
  ctx.bezierCurveTo(310, 520, 280, 540, 260, 520);
  ctx.bezierCurveTo(240, 480, 250, 420, 280, 380);
  ctx.fill();

  // Europe (larger)
  ctx.fillStyle = '#15803d'; // Very dark green
  ctx.beginPath();
  ctx.moveTo(550, 180);
  ctx.bezierCurveTo(520, 170, 580, 150, 650, 160);
  ctx.bezierCurveTo(680, 170, 670, 200, 640, 210);
  ctx.bezierCurveTo(600, 220, 560, 210, 550, 180);
  ctx.fill();

  // Africa (much larger)
  ctx.beginPath();
  ctx.moveTo(580, 250);
  ctx.bezierCurveTo(560, 220, 600, 180, 650, 200);
  ctx.bezierCurveTo(680, 220, 670, 320, 650, 380);
  ctx.bezierCurveTo(630, 420, 600, 440, 570, 420);
  ctx.bezierCurveTo(540, 380, 550, 300, 580, 250);
  ctx.fill();

  // Asia (largest continent, very visible)
  ctx.fillStyle = '#14532d'; // Very dark green
  ctx.beginPath();
  ctx.moveTo(650, 120);
  ctx.bezierCurveTo(620, 100, 750, 80, 900, 100);
  ctx.bezierCurveTo(1000, 120, 950, 180, 900, 200);
  ctx.bezierCurveTo(800, 220, 700, 210, 650, 180);
  ctx.bezierCurveTo(620, 160, 630, 140, 650, 120);
  ctx.fill();

  // Australia (larger)
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(800, 450);
  ctx.bezierCurveTo(780, 430, 820, 410, 880, 420);
  ctx.bezierCurveTo(920, 430, 910, 470, 880, 480);
  ctx.bezierCurveTo(840, 490, 800, 480, 800, 450);
  ctx.fill();

  // Add some cloud-like formations
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 10 + Math.random() * 20;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add polar ice caps with more realistic shape
  const iceGradient = ctx.createRadialGradient(
    canvas.width / 2, 60, 0,
    canvas.width / 2, 60, canvas.width / 3
  );
  iceGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  iceGradient.addColorStop(1, 'rgba(173, 216, 230, 0.6)');

  ctx.fillStyle = iceGradient;
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 80, canvas.width / 2.5, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 80, canvas.width / 2.5, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Add some atmospheric haze
  const hazeGradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 200,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  hazeGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  hazeGradient.addColorStop(1, 'rgba(135, 206, 235, 0.2)');

  ctx.fillStyle = hazeGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Hook to get earth texture with fallback
 */
export function useEarthTexture() {
  return useMemo(() => {
    // During SSR, return null and let it load on client
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      // Always use procedural texture since earth.jpg doesn't exist
      return generateEarthTexture();

    } catch (error) {
      console.warn('useEarthTexture: Error generating texture:', error);
      return null;
    }
  }, []);
}

export default generateEarthTexture;
