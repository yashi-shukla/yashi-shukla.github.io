'use client'

import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useEarthTexture, generateEarthTexture } from "./EarthTextureGenerator";

/**
 * GlobeStage Component
 * A 3D globe with atmosphere glow, slow rotation, and camera animation controls
 * Uses @react-three/fiber and @react-three/drei
 */

// Globe Inner Component - The main globe mesh with texture
function GlobeInner({ texture, isLowMotion }) {
  const meshRef = useRef();
  const atmosphereRef = useRef();

  // Slow auto-rotation animation
  useFrame((state, delta) => {
    if (!isLowMotion && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05; // Slow rotation
    }
    // Atmosphere follows the main globe rotation
    if (atmosphereRef.current && meshRef.current) {
      atmosphereRef.current.rotation.y = meshRef.current.rotation.y;
    }
  });

  return (
    <group>
      {/* Main Globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.0}
          transparent={false}
        />
      </mesh>

      {/* Atmosphere Glow - Slightly larger transparent sphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.52, 32, 32]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Pin Marker Component for displaying project locations
function PinMarker({ position, label, onClick }) {
  const markerRef = useRef();

  // Gentle floating animation - keep particles on globe surface
  useFrame((state) => {
    if (markerRef.current) {
      // Normalize the position to stay on globe surface (radius = 2.5)
      const vec = new THREE.Vector3(position[0], position[1], position[2]);
      vec.normalize().multiplyScalar(2.52); // Slightly above surface for visibility
      markerRef.current.position.copy(vec);

      // Add subtle floating motion
      const floatOffset = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      markerRef.current.position.addScaledVector(vec.clone().normalize(), floatOffset);
    }
  });

  return (
    <group ref={markerRef} position={position} onClick={onClick}>
      {/* Pin stem */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.2]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      {/* Pin head */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      {/* Label */}
      {label && (
        <Html position={[0, 0.15, 0]} center>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Main GlobeStage Component
const GlobeStage = forwardRef(({
  textureUrl = "/assets/earth.jpg",
  pins = [],
  onPinClick
}, ref) => {
  const [isLowMotion, setIsLowMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cameraRef = useRef();
  const controlsRef = useRef();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsLowMotion(mediaQuery.matches);

    const handleChange = (e) => setIsLowMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load texture with fallback to procedural earth
  const texture = useEarthTexture(textureUrl) || generateEarthTexture();

  // Camera movement function
  const moveCameraTo = (position, lookAt = [0, 0, 0], duration = 1.6) => {
    if (!cameraRef.current || isLowMotion) return;

    gsap.to(cameraRef.current.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (cameraRef.current) {
          cameraRef.current.lookAt(...lookAt);
        }
      }
    });
  };

  // Expose methods via forwardRef
  useImperativeHandle(ref, () => ({
    // Move camera to specific position with GSAP animation
    moveCameraTo,

    // Set camera for specific section
    setCameraForSection: (sectionId) => {
      const positions = {
        hero: [0, 0, 8],
        about: [5, 2, 5],
        services: [-5, 2, 5],
        work: [0, 5, 5],
        projects: [0, -5, 5],
        contact: [0, 0, 10]
      };

      const targetPos = positions[sectionId] || positions.hero;
      moveCameraTo(targetPos);
    },

    // Get current camera position
    getCameraPosition: () => {
      return cameraRef.current ? cameraRef.current.position.toArray() : [0, 0, 8];
    }
  }));

  // Convert lat/lon to 3D vector (fixed coordinates)
  const latLonToVector3 = (lat, lon, radius = 2.5) => {
    // Convert to radians
    const phi = (lat * Math.PI) / 180; // latitude
    const theta = (lon * Math.PI) / 180; // longitude

    // Spherical to Cartesian coordinates
    const x = radius * Math.cos(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        onCreated={({ camera, controls }) => {
          cameraRef.current = camera;
          if (controls) controlsRef.current = controls;
        }}
        gl={{
          antialias: !isMobile, // Disable antialiasing on mobile for performance
          alpha: true
        }}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow={!isMobile}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Stars background */}
        <Stars
          radius={300}
          depth={60}
          count={isMobile ? 1000 : 5000}
          factor={4}
          saturation={0}
        />

        {/* Main Globe */}
        <GlobeInner texture={texture} isLowMotion={isLowMotion} />

        {/* Pin Markers */}
        {pins.map((pin, index) => {
          const position = latLonToVector3(pin.lat, pin.lon);
          return (
            <PinMarker
              key={`${pin.lat}-${pin.lon}-${index}`}
              position={position}
              label={pin.label}
              onClick={() => onPinClick && onPinClick(pin, index)}
            />
          );
        })}

        {/* Controls - disabled on mobile for performance */}
        {!isMobile && (
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            minDistance={4}
            maxDistance={15}
            autoRotate={!isLowMotion}
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>

      {/* Accessibility overlay for screen readers */}
      <div className="sr-only">
        Interactive 3D globe showing project locations worldwide
        {pins.length > 0 && (
          <div>
            Project locations: {pins.map(pin => pin.label).join(', ')}
          </div>
        )}
      </div>

      {/* Reduced motion notice */}
      {isLowMotion && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-sm">
          Reduced motion enabled - animations paused
        </div>
      )}

      {/* Mobile performance notice */}
      {isMobile && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded text-sm">
          Mobile mode - optimized for performance
        </div>
      )}
    </div>
  );
});

GlobeStage.displayName = 'GlobeStage';

export default GlobeStage;
