# NOCTIS — The Only Light in the World

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional electric performance automotive brand.

> **Mood**: A city in total blackout at night where the car's light is the only light in the world. Quiet, expensive, and precise: huge empty space, few words, perfect motion.

---

## Technical Stack & Architectural Rules

- **Zero Frameworks & Libraries**: Pure semantic HTML5, CSS3, and vanilla JavaScript (ES6+). Zero build tools, zero npm dependencies, no React, Vite, GSAP, Lenis, or Tailwind.
- **Canvas Scrollytelling**: High-performance `<canvas>` rendering scrubbing preloaded WebP frame sequences driven by scroll progress in a single `requestAnimationFrame` loop with lerp smoothing.
- **Strict Design System**:
  - Zero gradients (no linear, radial, or conic gradients).
  - Zero glassmorphism (no `backdrop-filter`, no `blur`, no translucent frosted cards).
  - Zero glows or drop shadows; all corners square (`border-radius: 0`).
  - Colors: Asphalt (`#07080A`), Graphite (`#121418`), Fog (`#8A8F98`), Bone (`#EDEAE4`), Xenon (`#CFE3FF`), Taillight (`#E1251B`), Hairline (`rgba(237, 234, 228, 0.12)`).
  - Typography: Archivo (expanded width 125%), Inter, JetBrains Mono via Google Fonts.

---

## Experience Sections

1. **Hero Journey (Pinned Scrollytelling, ~600vh)**:
   - Scrubbed 598-frame continuous camera sequence across 3 joined clips.
   - Live telemetry HUD on left edge: chapter indicator with taillight tick, real-time speed (`000` → `118 KM/H`), and distance (`0.0` → `4.2 KM`).
   - Chapters reveal line by line in empty sky.
   - Canvas fades to solid blackout over the final 5% of scroll.
2. **Engineering Statement (100vh)**:
   - Centered philosophy quote revealing word-by-word with scroll opacity.
3. **Architecture Dismantle (Pinned Scrollytelling, ~350vh)**:
   - 200-frame sequence taking the vehicle apart down to its structural battery pack and axial-flux motors.
   - 4 technical callouts (**BODY**, **BATTERY**, **DRIVE**, **LIGHT**) fade in sequentially with 1px hairlines.
4. **The Lineup (Interactive Accordion, 100vh)**:
   - 5 studio side profiles: **GT-E** (Grand Tourer), **S** (Sport Sedan), **X** (Coupe SUV), **R** (Track Coupe), **ONE** (Hypercar Concept).
   - Desktop hover (80ms debounce) with smooth flex transition, shared floor line at 72% height, and animated car entry.
   - Finish swatches, specifications, full keyboard accessibility, and vertical stack for mobile.
5. **Private Allocation & Reservation (100vh)**:
   - Xenon-bordered action with hover inversion and taillight tick.
6. **Global Enhancements**:
   - Fixed film-grain overlay shifted at 8Hz across an offscreen canvas tile.
   - Headlight custom cursor morphing to an optical light bar with contextual labels on desktop fine pointers.
   - Full `prefers-reduced-motion` compliance.

---

## Running Locally

Serve the repository with any local static HTTP server:

```bash
# Using Python
python -m http.server 8080

# Or using VS Code Live Server
# Right-click index.html and select "Open with Live Server"
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.
