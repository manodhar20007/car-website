/**
 * NOCTIS Configuration
 * All section heights, chapter ranges, frame counts, frame paths and callout positions
 * are defined here for easy tuning.
 */

window.NOCTIS_CONFIG = {
  // Pinned Section Heights
  heroHeight: '600vh',
  dismantleHeight: '350vh',

  // Hero Scrollytelling Sequence
  hero: {
    frameCount: 598,
    desktopPath: (index) => `assets/frames/hero/frame_${String(index).padStart(4, '0')}.webp`,
    mobilePath: (index) => `assets/frames/hero-mobile/frame_${String(index).padStart(4, '0')}.webp`,
    preloadInitialCount: 40,
    speedMax: 118,      // km/h
    distanceMax: 4.2,   // km
    fadeToBlackStart: 0.95, // fade canvas to solid black over 95% - 100%
    chapters: [
      {
        id: 'hero-ch1',
        start: 0.00,
        end: 0.12,
        title: 'NOCTIS',
        subtitle: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT',
        hudIndex: '01/04'
      },
      {
        id: 'hero-ch2',
        start: 0.22,
        end: 0.40,
        title: "It doesn't need the city's light.",
        hudIndex: '02/04'
      },
      {
        id: 'hero-ch3',
        start: 0.50,
        end: 0.68,
        title: 'It brings its own.',
        hudIndex: '03/04'
      },
      {
        id: 'hero-ch4',
        start: 0.80,
        end: 1.00,
        title: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        cta: 'Discover the GT-E',
        ctaHref: '#lineup',
        hudIndex: '04/04'
      }
    ]
  },

  // Statement Section
  statement: {
    label: '02 — ENGINEERING',
    text: 'Every part was designed to disappear into one line of light.'
  },

  // Dismantle Scrollytelling Sequence
  dismantle: {
    frameCount: 200,
    desktopPath: (index) => `assets/frames/dismantle/frame_${String(index).padStart(4, '0')}.webp`,
    mobilePath: (index) => `assets/frames/dismantle-mobile/frame_${String(index).padStart(4, '0')}.webp`,
    calloutsStartProgress: 0.70, // Callouts begin fading in after 70%
    callouts: [
      {
        id: 'body',
        label: 'BODY',
        detail: 'Carbon composite monocoque',
        start: 0.72,
        end: 1.00,
        // Relative percentage positions on stage canvas
        dot: { x: 44, y: 32 },
        card: { x: 24, y: 22 }
      },
      {
        id: 'battery',
        label: 'BATTERY',
        detail: '110 kWh structural pack',
        start: 0.79,
        end: 1.00,
        dot: { x: 46, y: 68 },
        card: { x: 30, y: 80 }
      },
      {
        id: 'drive',
        label: 'DRIVE',
        detail: 'Dual axial-flux motors, 680 kW',
        start: 0.86,
        end: 1.00,
        dot: { x: 67, y: 63 },
        card: { x: 74, y: 74 }
      },
      {
        id: 'light',
        label: 'LIGHT',
        detail: 'Single-line LED signature',
        start: 0.93,
        end: 1.00,
        dot: { x: 85, y: 54 },
        card: { x: 78, y: 40 }
      }
    ]
  },

  // Lineup Section
  lineup: {
    label: '03 — THE LINEUP',
    headline: 'Five ways to drive the night.',
    defaultIndex: 0,
    models: [
      {
        id: 'gt-e',
        num: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        specs: [
          { label: 'RANGE', value: '640 km' },
          { label: '0–100 KM/H', value: '3.1 s' },
          { label: 'POWER', value: '680 kW' }
        ],
        specLine: '640 km · 3.1 s · 680 kW',
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite grand tourer coupe side profile',
        colors: [
          { name: 'Matte Graphite', hex: '#1D2024' },
          { name: 'Obsidian Night', hex: '#0B0C0E' },
          { name: 'Satin Bone', hex: '#D6D2CB' },
          { name: 'Xenon Blue', hex: '#3B4D63' }
        ]
      },
      {
        id: 's',
        num: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        specs: [
          { label: 'RANGE', value: '600 km' },
          { label: '0–100 KM/H', value: '3.6 s' },
          { label: 'POWER', value: '520 kW' }
        ],
        specLine: '600 km · 3.6 s · 520 kW',
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S satin bone white four-door sport sedan side profile',
        colors: [
          { name: 'Satin Bone White', hex: '#EDEAE4' },
          { name: 'Matte Graphite', hex: '#1D2024' },
          { name: 'Deep Basalt', hex: '#16181D' },
          { name: 'Glacier Xenon', hex: '#8DAAC6' }
        ]
      },
      {
        id: 'x',
        num: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        specs: [
          { label: 'RANGE', value: '560 km' },
          { label: '0–100 KM/H', value: '4.2 s' },
          { label: 'POWER', value: '480 kW' }
        ],
        specLine: '560 km · 4.2 s · 480 kW',
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue SUV coupe side profile',
        colors: [
          { name: 'Midnight Blue', hex: '#0B1528' },
          { name: 'Carbon Grey', hex: '#1A1B20' },
          { name: 'Bone White', hex: '#E2DFD9' },
          { name: 'Obsidian', hex: '#08090C' }
        ]
      },
      {
        id: 'r',
        num: '04',
        name: 'R',
        tagline: 'Built for the track.',
        specs: [
          { label: 'RANGE', value: '420 km' },
          { label: '0–100 KM/H', value: '2.4 s' },
          { label: 'POWER', value: '900 kW' }
        ],
        specLine: '420 km · 2.4 s · 900 kW',
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R satin black track coupe with fixed rear wing side profile',
        colors: [
          { name: 'Satin Black / Red', hex: '#090A0D' },
          { name: 'Stealth Carbon', hex: '#191B20' },
          { name: 'Apex Red', hex: '#A81E17' },
          { name: 'Ghost Silver', hex: '#9BA3B0' }
        ]
      },
      {
        id: 'one',
        num: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        specs: [
          { label: 'STATUS', value: 'Concept' },
          { label: 'AERO', value: 'Active Flow' },
          { label: 'DRIVE', value: 'Flux Matrix' }
        ],
        specLine: 'Concept · Liquid Architecture',
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE liquid silver concept hypercar side profile',
        colors: [
          { name: 'Liquid Silver', hex: '#A2B0C0' },
          { name: 'Hyper Obsidian', hex: '#07080A' },
          { name: 'Pure Xenon', hex: '#CFE3FF' },
          { name: 'Raw Titanium', hex: '#484D55' }
        ]
      }
    ]
  }
};

