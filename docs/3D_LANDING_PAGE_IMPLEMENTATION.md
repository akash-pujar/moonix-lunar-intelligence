# MOONIX — Premium Cinematic 3D Lunar Landing Experience Implementation

**Project:** MOONIX — Lunar Landing Site Navigator  
**Competition:** NASA Space Apps Challenge 2026 (Challenge 10 CLPS)  
**Date:** 2026-11-14  
**Status:** **COMPLETE, VERIFIED & PASSING ACCEPTANCE TESTS**

---

## 1. System Architecture & Routes

MOONIX seamlessly bifurcates public aerospace presentation from the analytical mission planning dashboard using client-side routing via `react-router-dom`:

| Route | View Component | Functionality |
|---|---|---|
| `/` | `LandingPage.tsx` | Public cinematic 3D lunar landing experience featuring an interactive WebGL Moon, candidate site selector, scientific capabilities, and technology sections. |
| `/app` | `DashboardPage.tsx` | Full-featured operational mission planning dashboard. Accepts validated `?site=<id>` URL parameters (e.g. `/app?site=shackleton-rim`) to initialize site analysis without loss of context. |
| `*` | Catch-all redirect | Redirects any unmapped endpoints back to `/`. |

```
frontend/src/
├── landing/
│   ├── LunarGlobe.tsx           # WebGL Three.js Moon sphere, starfield, raycaster, lighting, drag & lerp rotation
│   ├── LunarSiteMarkers.tsx     # Selenographic coordinate transformation & accessible selector pills
│   ├── LunarSiteSelector.tsx    # SpaceEdu-inspired 3-candidate alternative card stack
│   ├── SiteInformationPanel.tsx # Featured site intelligence panel (exact lat/lon, mission, SPICE status)
│   ├── HeroSection.tsx          # Orchestrator for 3D Moon hero, typography, CTAs, and telemetry strip
│   ├── MissionIntro.tsx         # "Every Landing Begins With Intelligence" editorial rationale
│   ├── CapabilitiesSection.tsx  # 5 capabilities: Solar, Earth, Site comparison, Timing, Terrain
│   ├── TechnologySection.tsx    # NAIF SPICE DE440, Horizons validation, 4 demonstration sites
│   ├── MissionCTA.tsx           # Closing CTA with selected site query parameter
│   └── LandingFooter.tsx        # Minimal, authentic footer with non-affiliation disclaimer
├── pages/
│   ├── LandingPage.tsx          # Assembles all landing sections with query parameter synchronization
│   └── DashboardPage.tsx        # Unchanged wrapper for the existing mission planner (App.tsx)
└── components/                  # All existing D3 timeline charts, site pickers, and viability panels
```

---

## 2. 3D Dependencies & WebGL Engine

- **Three.js (`three@0.187.0`, `@types/three@0.187.0`):**
  Direct Three.js integration was selected to ensure zero peer-dependency conflicts with React 19 (`^19.3.1`) while maintaining complete control over WebGL lifecycle, requestAnimationFrame loops, memory disposal, device pixel ratio caps, and pointer event raycasting.
- **Renderer Settings:**
  - `powerPreference: "high-performance"`
  - `toneMapping: THREE.ACESFilmicToneMapping` with exposure 1.05.
  - `antialias: true`, `alpha: true`.
  - Device pixel ratio capped at `Math.min(window.devicePixelRatio, 2)` to protect mobile battery and maintain 60 FPS on integrated GPUs.
- **Lighting Model:**
  - Physically plausible solar illumination: `THREE.DirectionalLight(0xfff5ea, 2.4)` positioned obliquely at $(6, 2.5, 4.5)$ to create natural lunar shadows and crater relief.
  - Deep-space cosmic ambient light (`THREE.AmbientLight(0x0c1424, 0.25)`).
  - Subtle Earthshine fill light (`THREE.DirectionalLight(0x4287f5, 0.15)`).
  - **No Artificial Blue Atmospheric Glow:** Adheres strictly to the physical reality of the lunar airless vacuum.

---

## 3. Lunar Asset Sources & Texture Provenance

Documented in detail in [docs/3D_ASSET_SOURCES.md](file:///D:/Moonix/docs/3D_ASSET_SOURCES.md):
- **Asset:** `moon_albedo.jpg` (135.8 KB) located at `frontend/public/textures/moon_albedo.jpg` and `frontend/dist/textures/moon_albedo.jpg`.
- **Source:** NASA Goddard Space Flight Center / Scientific Visualization Studio (SVS Entry 4720: *CGI Moon Kit*).
- **Origin Instrument:** Lunar Reconnaissance Orbiter Camera (LROC) Wide Angle Camera (WAC) global multispectral mosaic assembled by Ernie Wright.
- **Projection:** Equirectangular ($1024 \times 512$), centered at Prime Meridian ($0^\circ\text{ Longitude}$).
- **Procedural Fallback:** In the event of network failure, `LunarGlobe.tsx` includes an inline canvas procedural texture generator rendering basaltic maria and anorthositic highlands.

---

## 4. Selenographic Coordinate Transformation & Marker Validation

To place 3D marker pins accurately on the lunar sphere of radius $R$:
For selenographic latitude $\phi \in [-90^\circ, +90^\circ]$ and longitude $\lambda \in [-180^\circ, +180^\circ]$:

$$\begin{aligned}
y &= R \sin(\phi) \\
x &= R \cos(\phi) \sin(\lambda) \\
z &= R \cos(\phi) \cos(\lambda)
\end{aligned}$$

### Coordinate Convention Validation Table

| Candidate Site | Catalogue Latitude | Catalogue Longitude | 3D Coordinates ($R = 2.45$) | Region & Physical Hemisphere Placement |
|---|---|---|---|---|
| **Shackleton Rim** | $-89.540^\circ$ | $0.000^\circ$ | $x=0.000$, $y=-2.450$, $z=+0.020$ | Extreme Lunar South Pole rim |
| **Malapert Massif** | $-86.000^\circ$ | $0.000^\circ$ | $x=0.000$, $y=-2.444$, $z=+0.171$ | South Polar mountain ridge |
| **Nobile Rim** | $-85.300^\circ$ | $+32.500^\circ$ | $x=+0.108$, $y=-2.442$, $z=+0.169$ | South Pole eastern longitude quadrant |
| **Apollo 11** | $+0.674^\circ$ | $+23.473^\circ$ | $x=+0.976$, $y=+0.029$, $z=+2.247$ | Equatorial Near-Side (Mare Tranquillitatis) |

### Focused Viewing Orientations
When a site is selected, `LunarGlobe.tsx` computes smooth target Euler rotations:
- **South Polar Sites (`lat < -60°`):** The Moon tilts downwards by $48^\circ$ ($0.85\text{ rad}$) on the X-axis, presenting a clear, unobstructed orbital view into the southern crater basins.
- **Equatorial Sites (Apollo 11):** The Moon levels to near-zero X-tilt and rotates on the Y-axis to center Mare Tranquillitatis directly in front of the observer.

---

## 5. Candidate Site Interaction & State Synchronization

- **Single Featured Site Architecture:** Exactly one candidate landing site is active at any time. The remaining three candidate sites appear in the side-positioned `LunarSiteSelector.tsx` cards.
- **Bidirectional Selection:**
  - Clicking a 3D marker directly on the WebGL globe.
  - Clicking any alternative site card in the side selector.
  - Selecting mobile accessible pill buttons (`LunarSiteMarkers.tsx`).
- **URL Query Parameter State:** Selecting a site updates the URL search parameters (`/?site=<id>`) via `replace: true`, enabling bookmarking and direct links.
- **Planner Handoff:** Clicking **LAUNCH MISSION PLANNER** transfers the active candidate site directly to the operational dashboard via `/app?site=<id>`, where `App.tsx` validates the parameter against `sites.json` and selects it as `primarySiteId`.

---

## 6. Performance & Accessibility (WCAG 2.1 AA)

- **GPU Resource Management:** All geometries, textures, materials, and renderer instances are explicitly traversed and disposed in the React `useEffect` cleanup handler.
- **Animation Loop Efficiency:** Three.js uses direct mutable refs for animation state; zero React re-renders are triggered during rotation or idle animation frames.
- **Reduced Motion Support:** When `prefers-reduced-motion` is detected, continuous idle auto-rotation is disabled, while manual interactive rotation remains functional.
- **WebGL Fallback:** In headless or non-WebGL environments, the globe automatically falls back to an accessible, high-contrast SVG representation with full keyboard interactivity.
- **Responsive Layout:**
  - Desktop ($1440\text{px}+$): Tripartite hero with alternative selectors on the left, centered 3D Moon, and intelligence panel on the right.
  - Tablet/Mobile ($320\text{px} - 1024\text{px}$): Vertically stacked layout with accessible selector pills, scaled globe canvas, and touch-drag support without horizontal overflow.

---

## 7. Acceptance Test Results

| Acceptance Criteria | Verification Method | Status |
|---|---|---|
| `/` loads 3D landing page | HTTP request & Chrome preview | **PASS** |
| WebGL Moon renders | Three.js scene initialized | **PASS** |
| Smooth rotation & damping | Pointer drag & lerp animation | **PASS** |
| 4 sites use catalogue coordinates | Validated against `sites.json` | **PASS** |
| Marker selection updates featured site | Raycasting & click handlers | **PASS** |
| Smooth camera focus transition | Euler rotation target lerp | **PASS** |
| Launch Planner opens `/app?site=...` | React Router validated navigation | **PASS** |
| Original dashboard functional | Timelines & metrics load at `/app` | **PASS** |
| No false scientific claims | Strictly honest provenance tags | **PASS** |
| WebGL fallback active | Safe degradation path | **PASS** |
| Mobile layout (320px–390px) | Headless Chrome viewport test | **PASS** |
| TypeScript check passes | `npx tsc --noEmit` exit code 0 | **PASS** |
| Production build passes | `npm run build` exit code 0 (568ms) | **PASS** |

---

## 8. Captured Verification Screenshots

- Desktop Hero (Shackleton Default): `3d-hero-desktop.png` (281.8 KB)
- 3D Moon with Shackleton Selected: `3d-moon-shackleton.png` (298.4 KB)
- 3D Moon with Malapert Selected: `3d-moon-malapert.png` (282.2 KB)
- 3D Moon with Nobile Selected: `3d-moon-nobile.png` (281.7 KB)
- 3D Moon with Apollo 11 Selected: `3d-moon-apollo11.png` (281.8 KB)
- Capabilities Section: `capabilities-section.png` (317.7 KB)
- Technology Section: `technology-section.png` (317.2 KB)
- Operational Dashboard (`/app?site=shackleton-rim`): `dashboard-site-shackleton.png` (183.7 KB)
- Mobile Viewport (390px): `landing-mobile-390.png` (108.7 KB)

