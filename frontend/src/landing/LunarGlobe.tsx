// LunarGlobe.tsx — High-fidelity WebGL 3D Moon with Three.js (Enlarged 560–680px visual anchor)
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MOON_ALBEDO_DATA_URI } from './moonAlbedoData';

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
  // +y is North Pole, -y is South Pole
  // At lon=0, z = +R, x = 0 (Prime Meridian faces +Z)
  // At lon=+90 (East), x = +R, z = 0
  const y = radius * Math.sin(latRad);
  const x = radius * Math.cos(latRad) * Math.sin(lonRad);
  const z = radius * Math.cos(latRad) * Math.cos(lonRad);

  return new THREE.Vector3(x, y, z);
}

// Target rotations for each candidate site to bring it into optimal viewing angle
function getTargetRotationForSite(lat: number, lon: number): { x: number; y: number } {
  const lonRad = (lon * Math.PI) / 180;
  if (lat < -60) {
    // South Pole region: tilt down so south pole craters face camera at ~48 degrees
    return {
      x: 0.84,
      y: -lonRad,
    };
  } else if (lat > 60) {
    // North pole region
    return {
      x: -0.84,
      y: -lonRad,
    };
  } else {
    // Equatorial / mid-latitude: face directly at site
    const latRad = (lat * Math.PI) / 180;
    return {
      x: -latRad * 0.45,
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
  const [, setIsLoaded] = useState(false);
  const [, setIsHoveringMarker] = useState<string | null>(null);

  // References for animation and interaction
  const targetRotationRef = useRef({ x: 0.84, y: 0 }); // Default for Shackleton Rim
  const currentRotationRef = useRef({ x: 0.84, y: 0 });
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

    // 2. Scene setup with transparent background for pure black space integration
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    // ── 3. Moon Sphere Setup (Commanding 560–680px diameter) ──
    const MOON_RADIUS = 2.15;
    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);

    // Load authentic NASA LROC equirectangular texture synchronously from embedded data URI
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(MOON_ALBEDO_DATA_URI, () => {
      setIsLoaded(true);
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const moonMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.052,
      roughness: 0.90,
      metalness: 0.01,
    });

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonGroup.add(moonMesh);

    // ── 4. Candidate Site Markers ──
    const markersMap = new Map<string, THREE.Group>();
    const hitMap = new Map<string, THREE.Mesh>();

    sites.forEach((site) => {
      const markerGroup = new THREE.Group();
      const pos = latLonToVector3(site.latitude, site.longitude, MOON_RADIUS);
      markerGroup.position.copy(pos);

      // Orient marker so local +Y aligns with surface normal
      const normal = pos.clone().normalize();
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      // Outer glow pulse ring
      const ringGeo = new THREE.RingGeometry(0.040, 0.075, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x42d9f5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.006;
      markerGroup.add(ringMesh);

      // Core beacon dot
      const dotGeo = new THREE.SphereGeometry(0.028, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x42d9f5 });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.y = 0.022;
      markerGroup.add(dotMesh);

      // Invisible hit sphere for frictionless raycast clicking
      const hitGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.position.y = 0.04;
      hitSphere.userData = { siteId: site.id };
      markerGroup.add(hitSphere);

      moonGroup.add(markerGroup);
      markersMap.set(site.id, markerGroup);
      hitMap.set(site.id, hitSphere);
    });

    markerMeshesRef.current = markersMap;
    hitSpheresRef.current = hitMap;

    // ── 5. Natural Directional Sunlight (Upper Right) & Lunar Terminator ──
    // Directional Sunlight: upper right, creates deep physical shadows in craters
    const sunLight = new THREE.DirectionalLight(0xfff5ea, 3.4);
    sunLight.position.set(8.5, 3.2, 4.5);
    scene.add(sunLight);

    // Subtle Natural Lunar Rim Light (gives crisp limb silhouette against deep black space)
    const rimLight = new THREE.DirectionalLight(0xdbe6f2, 0.42);
    rimLight.position.set(-8.5, -1.5, -4.0);
    scene.add(rimLight);

    // Subtle Dark-Side Ambient (preserves spherical perception without artificial blue haze)
    const ambientLight = new THREE.AmbientLight(0x0a0d14, 0.15);
    scene.add(ambientLight);

    // ── 6. Raycasting & Interaction ──
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

        targetRotationRef.current.y += deltaX * 0.0055;
        targetRotationRef.current.x = Math.max(
          -1.35,
          Math.min(1.35, targetRotationRef.current.x + deltaY * 0.0055)
        );

        previousPointerRef.current = { x: e.clientX, y: e.clientY };
        lastInteractionTimeRef.current = Date.now();
      } else {
        const hitId = getRaycastHit(e.clientX, e.clientY);
        setIsHoveringMarker(hitId);
        container.style.cursor = hitId ? 'pointer' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current && dragDistance < 6) {
        const hitId = getRaycastHit(e.clientX, e.clientY);
        if (hitId) {
          onSelectSite(hitId);
        }
      }
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ── 7. Resize Handler ──
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

    // ── 8. Animation Loop ──
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Very slow, serene auto-rotation when idle
      const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
      if (!prefersReducedMotion && autoRotateRef.current && timeSinceInteraction > 3000) {
        targetRotationRef.current.y += 0.0004;
      }

      // Smooth lerp to target rotation
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      moonGroup.rotation.x = currentRotationRef.current.x;
      moonGroup.rotation.y = currentRotationRef.current.y;

      // Animate site marker states
      markersMap.forEach((group, siteId) => {
        const isSelected = siteId === selectedSiteId;
        const ring = group.children[0] as THREE.Mesh;
        const dot = group.children[1] as THREE.Mesh;

        if (ring && ring.material) {
          const mat = ring.material as THREE.MeshBasicMaterial;
          if (isSelected) {
            mat.color.setHex(0x42d9f5);
            const scale = 1.05 + Math.sin(elapsedTime * 3.5) * 0.22;
            ring.scale.set(scale, scale, scale);
            mat.opacity = 0.95;
          } else {
            mat.color.setHex(0x69afff);
            ring.scale.set(1, 1, 1);
            mat.opacity = 0.55;
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

    // ── 9. Cleanup ──
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      moonGeometry.dispose();
      moonMaterial.dispose();
      renderer.dispose();
    };
  }, [sites, selectedSiteId, onSelectSite, prefersReducedMotion]);

  if (!webGLSupported) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#03060E]/90 text-center p-6 ${className}`}
      >
        <div className="w-48 h-48 rounded-full bg-slate-800 border-2 border-slate-600 mb-4 flex items-center justify-center text-slate-400 font-mono text-xs">
          [WebGL Unavailable]
        </div>
        <p className="text-xs text-[#9AA9BF]">3D acceleration disabled in your browser.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative cursor-grab active:cursor-grabbing ${className}`}
      role="region"
      aria-label="Interactive 3D Moon Globe"
    />
  );
}
