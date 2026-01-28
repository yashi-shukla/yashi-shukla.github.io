# GlobeStage Components

A collection of React Three.js components for creating interactive 3D globes with scroll-based camera animations.

## Components

### GlobeStage.jsx
The main 3D globe component with atmosphere glow, slow rotation, and camera controls.

**Features:**
- Textured globe with subtle atmosphere glow
- Slow auto-rotation (respects reduced motion preference)
- Pin markers for project locations
- GSAP-powered camera animations
- Mobile performance optimizations
- Accessibility features (reduced motion, screen reader support)

**Props:**
- `textureUrl` (string): Path to earth texture (defaults to "/assets/earth.jpg")
- `pins` (array): Array of pin objects `{lat, lon, label}`
- `onPinClick` (function): Callback for pin clicks

**Ref Methods:**
- `moveCameraTo([x, y, z], [lookAtX, lookAtY, lookAtZ], duration)`: Animate camera to position
- `setCameraForSection(sectionId)`: Move camera to predefined section position
- `getCameraPosition()`: Get current camera position

### useScrollAnimation.js
Hook for connecting scroll sections to globe camera animations using GSAP ScrollTrigger.

**Parameters:**
- `sections`: Array of section selectors or refs
- `cameraTargets`: Array of camera target objects `{x, y, z}`
- `globeRef`: Ref to GlobeStage component
- `options`: Configuration options

**Options:**
- `start`: ScrollTrigger start position (default: "top center")
- `end`: ScrollTrigger end position (default: "bottom center")
- `scrub`: Enable scrubbing (default: false)
- `pin`: Pin sections during scroll (default: false)
- `parallaxText`: Enable parallax text animations (default: true)
- `sectionHighlights`: Highlight active sections (default: true)
- `debug`: Show ScrollTrigger markers (default: false)

## Usage Examples

### Basic Globe
```jsx
import GlobeStage from './components/GlobeStage';

function App() {
  const globeRef = useRef();

  return (
    <GlobeStage
      ref={globeRef}
      pins={[
        { lat: 40.7128, lon: -74.0060, label: "New York" },
        { lat: 51.5074, lon: -0.1278, label: "London" }
      ]}
      onPinClick={(pin) => console.log('Clicked:', pin)}
    />
  );
}
```

### Scroll-Connected Globe
```jsx
import GlobeStage from './components/GlobeStage';
import { useScrollAnimation, CAMERA_POSITIONS } from './hooks/useScrollAnimation';

function Portfolio() {
  const globeRef = useRef();

  // Define sections and camera positions
  const sections = ['#hero', '#about', '#work', '#contact'];
  const cameraTargets = [
    CAMERA_POSITIONS.hero,
    CAMERA_POSITIONS.about,
    CAMERA_POSITIONS.work,
    CAMERA_POSITIONS.contact
  ];

  // Initialize scroll animations
  useScrollAnimation({
    sections,
    cameraTargets,
    globeRef,
    options: {
      parallaxText: true,
      sectionHighlights: true
    }
  });

  return (
    <div>
      <GlobeStage ref={globeRef} />

      {/* Your sections */}
      <section id="hero">Hero Content</section>
      <section id="about">About Content</section>
      <section id="work">Work Content</section>
      <section id="contact">Contact Content</section>
    </div>
  );
}
```

### Manual Camera Control
```jsx
function Controls() {
  const globeRef = useRef();

  const moveToHero = () => {
    globeRef.current?.setCameraForSection('hero');
  };

  const moveToCustom = () => {
    globeRef.current?.moveCameraTo([5, 2, 5], [0, 0, 0], 2);
  };

  return (
    <div>
      <button onClick={moveToHero}>Hero View</button>
      <button onClick={moveToCustom}>Custom View</button>
      <GlobeStage ref={globeRef} />
    </div>
  );
}
```

## Predefined Camera Positions

```javascript
import { CAMERA_POSITIONS } from './hooks/useScrollAnimation';

// Available positions:
CAMERA_POSITIONS.hero      // { x: 0, y: 0, z: 8 }
CAMERA_POSITIONS.about     // { x: 5, y: 2, z: 5 }
CAMERA_POSITIONS.services  // { x: -5, y: 2, z: 5 }
CAMERA_POSITIONS.work      // { x: 0, y: 5, z: 5 }
CAMERA_POSITIONS.projects  // { x: 0, y: -5, z: 5 }
CAMERA_POSITIONS.contact   // { x: 0, y: 0, z: 10 }

// Regional positions:
CAMERA_POSITIONS.northAmerica  // { x: -2, y: 3, z: 6 }
CAMERA_POSITIONS.europe        // { x: 3, y: 3, z: 6 }
CAMERA_POSITIONS.asia          // { x: 6, y: 1, z: 5 }
CAMERA_POSITIONS.africa        // { x: 2, y: -2, z: 6 }
CAMERA_POSITIONS.southAmerica  // { x: -4, y: -2, z: 6 }
CAMERA_POSITIONS.australia     // { x: 7, y: -4, z: 6 }
```

## Accessibility Features

### Reduced Motion Support
- Automatically detects `prefers-reduced-motion: reduce`
- Disables auto-rotation and camera animations
- Shows visual indicator when reduced motion is active

### Mobile Optimizations
- Disables antialiasing for better performance
- Reduces star count in background
- Disables orbit controls
- Shows performance indicator

### Screen Reader Support
- Descriptive text for the globe
- Lists all pin locations
- Keyboard navigation support

## Dependencies

```bash
npm install @react-three/fiber@^8.15.0 @react-three/drei@^9.88.0 three@^0.180.0 gsap@^3.13.0
```

## Browser Support

- Modern browsers with WebGL support
- Graceful degradation for reduced motion preferences
- Mobile-optimized performance









