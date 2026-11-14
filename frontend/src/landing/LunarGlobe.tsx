// LunarGlobe.tsx — High-fidelity WebGL 3D Moon with Three.js
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface SiteMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  region: string;
  mission: string;
}

interface LunarGlobeProps {
  sites: SiteMarkerData[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  className?: string;
}

// Convert Selenographic (Lat, Lon) to 3D Cartesian coordinates on sphere of radius R
export function latLonToVector3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;

  // In standard Three.js texture mapping on SphereGeometry:
  // y is North/South axis (+y is North Pole, -y is South Pole)
  // At lon=0, z = +R, x = 0 (Prime Meridian faces +Z)
  // At lon=+90 (East), x = +R, z = 0
  const y = radius * Math.sin(latRad);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  return new THREE.Vector3(x, y, z);
}

// Target rotations for each candidate site to bring it into optimal viewing angle
function getTargetRotationForSite(lat: number, lon: number): { x: number; y: number } {
  // If site is in polar region (lat < -60°), tilt the pole towards the camera by ~45°
  // and align longitude with the viewer
  const lonRad = (lon * Math.PI) / 180;
  if (lat < -60) {
    // South Pole region: tilt down so south pole faces camera
    return {
      x: 0.85, // ~48 degrees tilt to view south polar craters
      y: -lonRad,
    };
  } else if (lat > 60) {
    // North pole region
    return {
      x: -0.85,
      y: -lonRad,
    };
  } else {
    // Equatorial / mid-latitude: face directly at site
    const latRad = (lat * Math.PI) / 180;
    return {
      x: -latRad * 0.5,
      y: -lonRad,
    };
  }
}

export function LunarGlobe({
  sites,
  selectedSiteId,
  onSelectSite,
  className = '',
}: LunarGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHoveringMarker, setIsHoveringMarker] = useState<string | null>(null);

  // References for animation and interaction
  const targetRotationRef = useRef({ x: 0.85, y: 0 }); // Default for Shackleton Rim
  const currentRotationRef = useRef({ x: 0.85, y: 0 });
  const isDraggingRef = useRef(false);
  const previousPointerRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const lastInteractionTimeRef = useRef(Date.now());
  const markerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const hitSpheresRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Update target rotation when selectedSiteId changes
  useEffect(() => {
    const site = sites.find((s) => s.id === selectedSiteId);
    if (site) {
      targetRotationRef.current = getTargetRotationForSite(site.latitude, site.longitude);
      lastInteractionTimeRef.current = Date.now();
    }
  }, [selectedSiteId, sites]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // 2. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 3. Moon sphere setup
    const MOON_RADIUS = 2.45;
    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);

    // Procedural fallback canvas texture in case texture load is delayed or fails
    const createProceduralMoonCanvas = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      // Base highlands color
      ctx.fillStyle = '#b0b5be';
      ctx.fillRect(0, 0, 512, 256);
      // Dark basaltic maria patches
      ctx.fillStyle = '#686f7b';
      ctx.beginPath();
      ctx.ellipse(180, 110, 80, 50, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(260, 120, 60, 40, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(320, 100, 35, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(c);
    };

    const textureLoader = new THREE.TextureLoader();
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: createProceduralMoonCanvas(),
      roughness: 0.94,
      metalness: 0.04,
      bumpScale: 0.03,
    });

    // Load authentic NASA LROC equirectangular texture
    textureLoader.load(
      '/textures/moon_albedo.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        moonMaterial.map = texture;
        moonMaterial.bumpMap = texture;
        moonMaterial.needsUpdate = true;
        setIsLoaded(true);
      },
      undefined,
      () => {
        // Fallback kept
        setIsLoaded(true);
      }
    );

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonGroup.add(moonMesh);

    // 4. Site Markers Generation
    const markersMap = new Map<string, THREE.Group>();
    const hitMap = new Map<string, THREE.Mesh>();

    sites.forEach((site) => {
      const markerGroup = new THREE.Group();
      const pos = latLonToVector3(site.latitude, site.longitude, MOON_RADIUS);
      markerGroup.position.copy(pos);

      // Orient marker so its local +Y aligns with the surface normal
      const normal = pos.clone().normalize();
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // Surface ring
      const ringGeo = new THREE.RingGeometry(0.04, 0.07, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x42d9f5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.005; // slightly above surface
      markerGroup.add(ringMesh);

      // Core center dot
      const dotGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x42d9f5 });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.y = 0.02;
      markerGroup.add(dotMesh);

      // Hit sphere for easy clicking/tapping (invisible)
      const hitGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.position.y = 0.05;
      hitSphere.userData = { siteId: site.id };
      markerGroup.add(hitSphere);

      moonGroup.add(markerGroup);
      markersMap.set(site.id, markerGroup);
      hitMap.set(site.id, hitSphere);
    });

    markerMeshesRef.current = markersMap;
    hitSpheresRef.current = hitMap;

    // 5. Lighting (Authentic neutral directional sunlight + faint cosmic ambient)
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
    sunLight.position.set(6, 2.5, 4.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0c1424, 0.25);
    scene.add(ambientLight);

    // Subtle Earthshine fill light (soft blue from opposite angle)
    const earthshine = new THREE.DirectionalLight(0x4287f5, 0.15);
    earthshine.position.set(-6, -2, -2);
    scene.add(earthshine);

    // 6. Raycasting for marker interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getRaycastHit = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hitSpheres = Array.from(hitSpheresRef.current.values());
      const intersects = raycaster.intersectObjects(hitSpheres, false);
      if (intersects.length > 0) {
        return intersects[0].object.userData.siteId || null;
      }
      return null;
    };

    // Pointer events for drag rotation and marker selection
    let dragDistance = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      dragDistance = 0;
      previousPointerRef.current = { x: e.clientX, y: e.clientY };
      lastInteractionTimeRef.current = Date.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousPointerRef.current.x;
        const deltaY = e.clientY - previousPointerRef.current.y;
        dragDistance += Math.hypot(deltaX, deltaY);

        targetRotationRef.current.y += deltaX * 0.007;
        targetRotationRef.current.x = Math.max(
          -1.4,
          Math.min(1.4, targetRotationRef.current.x + deltaY * 0.007)
        );

        previousPointerRef.current = { x: e.clientX, y: e.clientY };
        lastInteractionTimeRef.current = Date.now();
      } else {
        // Hover test
        const hitId = getRaycastHit(e.clientX, e.clientY);
        setIsHoveringMarker(hitId);
        container.style.cursor = hitId ? 'pointer' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        if (dragDistance < 6) {
          // It was a click, test for marker
          const hitId = getRaycastHit(e.clientX, e.clientY);
          if (hitId) {
            onSelectSite(hitId);
          }
        }
      }
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 7. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation if idle and reduced motion is false
      const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
      if (!prefersReducedMotion && autoRotateRef.current && timeSinceInteraction > 3500) {
        targetRotationRef.current.y += 0.0008;
      }

      // Smooth lerp to target rotation
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      moonGroup.rotation.x = currentRotationRef.current.x;
      moonGroup.rotation.y = currentRotationRef.current.y;

      // Animate active marker pulse
      markersMap.forEach((group, siteId) => {
        const isSelected = siteId === selectedSiteId;
        const ring = group.children[0] as THREE.Mesh;
        const dot = group.children[1] as THREE.Mesh;

        if (ring && ring.material) {
          const mat = ring.material as THREE.MeshBasicMaterial;
          if (isSelected) {
            mat.color.setHex(0x42d9f5);
            const scale = 1 + Math.sin(elapsedTime * 4) * 0.22;
            ring.scale.set(scale, scale, scale);
            mat.opacity = 0.95;
          } else {
            mat.color.setHex(0x69afff);
            ring.scale.set(1, 1, 1);
            mat.opacity = 0.5;
          }
        }

        if (dot && dot.material) {
          const dMat = dot.material as THREE.MeshBasicMaterial;
          dMat.color.setHex(isSelected ? 0xffb547 : 0x42d9f5);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      moonGeometry.dispose();
      moonMaterial.dispose();
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [sites, selectedSiteId, onSelectSite, prefersReducedMotion]);

  if (!webGLSupported) {
    return (
      <div className={`relative flex items-center justify-center p-8 bg-slate-900/40 rounded-2xl border border-cyan-500/20 ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-500 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <span className="text-xs font-mono text-cyan-300">MOON (3D)</span>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-xs">
            WebGL is not active in this browser. You can still select landing sites using the interactive site buttons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${className}`}
      aria-label="Interactive 3D Moon: Drag to rotate, click site markers to inspect landing candidate locations"
    >
      {/* Loading state indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/80 bg-slate-950/80 px-3 py-1.5 rounded-full border border-cyan-500/20 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>INITIALIZING 3D LUNAR SPHERE...</span>
          </div>
        </div>
      )}

      {/* Marker hover tooltip */}
      {isHoveringMarker && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div className="px-3 py-1 bg-slate-950/90 border border-cyan-500/40 rounded-full text-[11px] font-mono text-cyan-300 shadow-lg shadow-cyan-500/20 backdrop-blur">
            Click to focus: {sites.find((s) => s.id === isHoveringMarker)?.name}
          </div>
        </div>
      )}
    </div>
  );
}
