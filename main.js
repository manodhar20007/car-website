/**
 * NOCTIS — Scrollytelling Engine & Interactive System
 * Plain Vanilla JavaScript (ES6+). Zero libraries.
 */

(function () {
  'use strict';

  const cfg = window.NOCTIS_CONFIG || {};
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const state = {
    isMobile: window.innerWidth < 768,
    hero: {
      targetFrame: 0,
      currentFrame: 0,
      progress: 0,
      images: [],
      loadedIndices: new Set(),
      isLoaded: false
    },
    dismantle: {
      targetFrame: 0,
      currentFrame: 0,
      progress: 0,
      images: [],
      loadedIndices: new Set(),
      isLoaded: false
    },
    lineup: {
      activeIndex: cfg.lineup ? cfg.lineup.defaultIndex : 0,
      hoverTimeout: null
    },
    cursor: {
      targetX: -100,
      targetY: -100,
      currentX: -100,
      currentY: -100,
      label: '',
      isHovering: false,
      isPressed: false
    },
    nav: {
      lastScrollY: 0,
      hidden: false
    }
  };

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------------------------------------------------------------------------
  // 1. FILM GRAIN OVERLAY
  // Fixed noise tile drawn offscreen, shifted 8x/sec, 3.5% opacity, no vignette
  // ---------------------------------------------------------------------------
  function initFilmGrain() {
    const canvas = document.getElementById('film-grain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    // Offscreen small noise pattern (256x256)
    const noiseSize = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = noiseSize;
    offscreen.height = noiseSize;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(noiseSize, noiseSize);
    const buffer32 = new Uint32Array(imgData.data.buffer);

    for (let i = 0; i < buffer32.length; i++) {
      // Near-white noise pixel with subtle variations
      const val = Math.floor(Math.random() * 255);
      // 0xAARRGGBB in little endian (ABGR)
      buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    offCtx.putImageData(imgData, 0, 0);

    function resizeGrain() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeGrain();
    window.addEventListener('resize', resizeGrain, { passive: true });

    const pattern = ctx.createPattern(offscreen, 'repeat');

    // Shift noise 8 times per second (~125ms)
    let offsetX = 0;
    let offsetY = 0;
    setInterval(() => {
      offsetX = Math.floor(Math.random() * noiseSize);
      offsetY = Math.floor(Math.random() * noiseSize);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.fillStyle = pattern;
      ctx.fillRect(-noiseSize, -noiseSize, canvas.width + noiseSize * 2, canvas.height + noiseSize * 2);
      ctx.restore();
    }, 125);
  }

  // ---------------------------------------------------------------------------
  // 2. CUSTOM HEADLIGHT CURSOR (Desktop Fine Pointer Only)
  // Dot + 28px ring, lerp 0.18, morphs to 44x2px bar with tiny mono label
  // ---------------------------------------------------------------------------
  function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const labelEl = document.getElementById('cursor-label');
    if (!cursor || !window.matchMedia('(pointer: fine)').matches || isReducedMotion) {
      return;
    }

    window.addEventListener('mousemove', (e) => {
      state.cursor.targetX = e.clientX;
      state.cursor.targetY = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      cursor.classList.add('is-pressed');
      setTimeout(() => cursor.classList.remove('is-pressed'), 120);
    });

    // Delegate hover for links, buttons, and custom triggers
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, .lineup-slide');
      if (target) {
        state.cursor.isHovering = true;
        cursor.classList.add('is-hovering');

        let label = target.getAttribute('data-cursor') || '';
        if (!label) {
          if (target.classList.contains('lineup-slide')) {
            label = target.getAttribute('aria-expanded') === 'true' ? 'CONFIGURE' : 'OPEN';
          } else if (target.tagName === 'A' || target.tagName === 'BUTTON') {
            label = 'VIEW';
          }
        }
        state.cursor.label = label;
        if (labelEl) labelEl.textContent = label;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor], a, button, .lineup-slide');
      if (target) {
        state.cursor.isHovering = false;
        cursor.classList.remove('is-hovering');
        state.cursor.label = '';
        if (labelEl) labelEl.textContent = '';
      }
    });

    function renderCursor() {
      state.cursor.currentX = lerp(state.cursor.currentX, state.cursor.targetX, 0.18);
      state.cursor.currentY = lerp(state.cursor.currentY, state.cursor.targetY, 0.18);

      cursor.style.transform = `translate(${state.cursor.currentX}px, ${state.cursor.currentY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
  }

  // ---------------------------------------------------------------------------
  // 3. NAVIGATION (Hide on scroll down, show on scroll up)
  // ---------------------------------------------------------------------------
  function initNavigation() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollY > state.nav.lastScrollY && currentScrollY > 120) {
        if (!state.nav.hidden) {
          nav.classList.add('is-hidden');
          state.nav.hidden = true;
        }
      } else {
        if (state.nav.hidden) {
          nav.classList.remove('is-hidden');
          state.nav.hidden = false;
        }
      }
      state.nav.lastScrollY = currentScrollY;
    }, { passive: true });

    // Smooth anchor navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. FRAME PRELOADING & PRELOADER SCREEN
  // Loads frames 1–40 first, then reveals page and streams rest in background
  // ---------------------------------------------------------------------------
  function loadSingleFrame(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().then(() => resolve(img)).catch(() => {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
        });
      } else {
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      }
    });
  }

  async function initPreloaderAndFrames() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloader-bar');
    const counter = document.getElementById('preloader-counter');

    const heroCfg = cfg.hero;
    const dismantleCfg = cfg.dismantle;
    const isMob = window.innerWidth < 768;

    const heroTotal = heroCfg.frameCount;
    const dismantleTotal = dismantleCfg.frameCount;
    const initialBatchCount = heroCfg.preloadInitialCount || 40;

    state.hero.images = new Array(heroTotal);
    state.dismantle.images = new Array(dismantleTotal);

    let initialLoaded = 0;

    // Load initial 40 frames of Hero sequence
    const initialPromises = [];
    for (let i = 1; i <= initialBatchCount; i++) {
      const src = isMob ? heroCfg.mobilePath(i) : heroCfg.desktopPath(i);
      const p = loadSingleFrame(src).then((img) => {
        if (img) {
          state.hero.images[i - 1] = img;
          state.hero.loadedIndices.add(i - 1);
        }
        initialLoaded++;
        const pct = Math.min(Math.round((initialLoaded / initialBatchCount) * 100), 100);
        if (bar) bar.style.width = pct + '%';
        if (counter) counter.textContent = String(pct).padStart(3, '0');
      });
      initialPromises.push(p);
    }

    await Promise.all(initialPromises);

    // Initial batch loaded -> Bright pulse & reveal site
    if (bar) bar.classList.add('is-bright');
    await new Promise((r) => setTimeout(r, 160));

    if (preloader) preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');

    // Trigger initial renders
    drawHeroFrame(0);
    drawDismantleFrame(0);

    // Stream remaining hero frames in background
    (async () => {
      for (let i = initialBatchCount + 1; i <= heroTotal; i++) {
        const src = isMob ? heroCfg.mobilePath(i) : heroCfg.desktopPath(i);
        const img = await loadSingleFrame(src);
        if (img) {
          state.hero.images[i - 1] = img;
          state.hero.loadedIndices.add(i - 1);
        }
      }
      state.hero.isLoaded = true;
    })();

    // Stream dismantle frames in background
    (async () => {
      for (let i = 1; i <= dismantleTotal; i++) {
        const src = isMob ? dismantleCfg.mobilePath(i) : dismantleCfg.desktopPath(i);
        const img = await loadSingleFrame(src);
        if (img) {
          state.dismantle.images[i - 1] = img;
          state.dismantle.loadedIndices.add(i - 1);
        }
      }
      state.dismantle.isLoaded = true;
    })();
  }

  // Find nearest loaded frame if current frame is still loading
  function getNearestLoadedFrame(images, index, total) {
    if (images[index]) return images[index];
    for (let offset = 1; offset < total; offset++) {
      if (index - offset >= 0 && images[index - offset]) return images[index - offset];
      if (index + offset < total && images[index + offset]) return images[index + offset];
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // 5. CANVAS DRAWING (Cover in landscape, Contain in portrait centered on asphalt)
  // ---------------------------------------------------------------------------
  function drawSequenceFrame(canvas, img) {
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, cw, ch);

    const isPortrait = ch > cw;
    let scale;

    if (isPortrait) {
      // Contain fit vertically centered on asphalt
      scale = Math.min(cw / img.width, ch / img.height);
    } else {
      // Cover fit
      scale = Math.max(cw / img.width, ch / img.height);
    }

    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  function resizeCanvas(canvas) {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function drawHeroFrame(frameIndex) {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    resizeCanvas(canvas);
    const img = getNearestLoadedFrame(state.hero.images, frameIndex, cfg.hero.frameCount);
    if (img) drawSequenceFrame(canvas, img);
  }

  function drawDismantleFrame(frameIndex) {
    const canvas = document.getElementById('dismantle-canvas');
    if (!canvas) return;
    resizeCanvas(canvas);
    const img = getNearestLoadedFrame(state.dismantle.images, frameIndex, cfg.dismantle.frameCount);
    if (img) drawSequenceFrame(canvas, img);
  }

  // ---------------------------------------------------------------------------
  // 6. SCROLLYTELLING ANIMATION LOOP (rAF, lerp 0.15)
  // ---------------------------------------------------------------------------
  let lastDrawnHeroFrame = -1;
  let lastDrawnDismantleFrame = -1;

  function updateScrollytelling() {
    const vh = window.innerHeight;

    // --- Hero Section Progress ---
    const heroWrapper = document.getElementById('hero-section');
    if (heroWrapper) {
      const rect = heroWrapper.getBoundingClientRect();
      const maxScroll = heroWrapper.offsetHeight - vh;
      const progress = clamp(-rect.top / maxScroll, 0, 1);
      state.hero.progress = progress;
      state.hero.targetFrame = Math.round(progress * (cfg.hero.frameCount - 1));

      // Lerp frame
      state.hero.currentFrame += (state.hero.targetFrame - state.hero.currentFrame) * 0.15;
      const roundedHeroFrame = Math.round(state.hero.currentFrame);

      if (roundedHeroFrame !== lastDrawnHeroFrame) {
        lastDrawnHeroFrame = roundedHeroFrame;
        drawHeroFrame(roundedHeroFrame);
      }

      // Update Hero Progress Line
      const heroLine = document.getElementById('hero-progress-line');
      if (heroLine) heroLine.style.width = (progress * 100) + '%';

      // Update Blackout Fade over last 5% of scroll (0.95 -> 1.0)
      const blackout = document.getElementById('hero-blackout');
      if (blackout) {
        if (progress >= 0.95) {
          const fadeOpacity = (progress - 0.95) / 0.05;
          blackout.style.opacity = String(fadeOpacity);
        } else {
          blackout.style.opacity = '0';
        }
      }

      // Update Hero Chapters
      cfg.hero.chapters.forEach((ch) => {
        const el = document.getElementById(ch.id);
        if (el) {
          const inRange = progress >= ch.start && progress <= ch.end;
          el.classList.toggle('is-active', inRange);
        }
      });

      // Update Hero HUD
      const hudChapter = document.getElementById('hud-chapter');
      const hudSpeed = document.getElementById('hud-speed');
      const hudDist = document.getElementById('hud-distance');

      let currentChapter = cfg.hero.chapters.find((ch) => progress >= ch.start && progress <= ch.end);
      if (!currentChapter) {
        // Find nearest past chapter
        currentChapter = cfg.hero.chapters.slice().reverse().find((ch) => progress >= ch.start) || cfg.hero.chapters[0];
      }
      if (hudChapter) hudChapter.textContent = currentChapter.hudIndex;

      const currentSpeed = Math.round(progress * cfg.hero.speedMax);
      if (hudSpeed) hudSpeed.textContent = String(currentSpeed).padStart(3, '0');

      const currentDist = (progress * cfg.hero.distanceMax).toFixed(1);
      if (hudDist) hudDist.textContent = currentDist;
    }

    // --- Statement Word-by-Word Scroll Scrub ---
    const statementSection = document.getElementById('statement-section');
    if (statementSection) {
      const rect = statementSection.getBoundingClientRect();
      const inViewProgress = clamp((vh - rect.top) / (vh + rect.height * 0.5), 0, 1);
      const words = document.querySelectorAll('.statement-word');
      if (words.length > 0) {
        const totalWords = words.length;
        words.forEach((word, idx) => {
          const wordThreshold = idx / totalWords;
          if (inViewProgress >= wordThreshold + (1 / totalWords)) {
            word.style.opacity = '1';
          } else if (inViewProgress >= wordThreshold) {
            const frac = (inViewProgress - wordThreshold) / (1 / totalWords);
            word.style.opacity = String(0.15 + frac * 0.85);
          } else {
            word.style.opacity = '0.15';
          }
        });
      }
    }

    // --- Dismantle Section Progress ---
    const dismantleWrapper = document.getElementById('dismantle-section');
    if (dismantleWrapper) {
      const rect = dismantleWrapper.getBoundingClientRect();
      const maxScroll = dismantleWrapper.offsetHeight - vh;
      const progress = clamp(-rect.top / maxScroll, 0, 1);
      state.dismantle.progress = progress;
      state.dismantle.targetFrame = Math.round(progress * (cfg.dismantle.frameCount - 1));

      state.dismantle.currentFrame += (state.dismantle.targetFrame - state.dismantle.currentFrame) * 0.15;
      const roundedDismantleFrame = Math.round(state.dismantle.currentFrame);

      if (roundedDismantleFrame !== lastDrawnDismantleFrame) {
        lastDrawnDismantleFrame = roundedDismantleFrame;
        drawDismantleFrame(roundedDismantleFrame);
      }

      // Dismantle Progress Line
      const dismantleLine = document.getElementById('dismantle-progress-line');
      if (dismantleLine) dismantleLine.style.width = (progress * 100) + '%';

      // Dismantle Callouts Reveal (after 70% progress)
      cfg.dismantle.callouts.forEach((callout) => {
        const el = document.getElementById(`callout-${callout.id}`);
        if (el) {
          const isVisible = progress >= callout.start;
          el.classList.toggle('is-visible', isVisible);
        }
      });
    }

    if (!isReducedMotion) {
      requestAnimationFrame(updateScrollytelling);
    }
  }

  // ---------------------------------------------------------------------------
  // 7. STATEMENT SECTION SETUP
  // ---------------------------------------------------------------------------
  function initStatementWords() {
    const quoteEl = document.getElementById('statement-quote');
    if (!quoteEl || !cfg.statement) return;

    const words = cfg.statement.text.split(' ');
    quoteEl.innerHTML = words
      .map((word) => `<span class="statement-word">${word}</span>`)
      .join(' ');
  }

  // ---------------------------------------------------------------------------
  // 8. DISMANTLE CALLOUTS DOM INJECTION
  // ---------------------------------------------------------------------------
  function initDismantleCallouts() {
    const container = document.getElementById('dismantle-callouts');
    if (!container || !cfg.dismantle) return;

    container.innerHTML = cfg.dismantle.callouts
      .map((c) => {
        return `
          <div class="callout-item" id="callout-${c.id}">
            <div class="callout-dot" style="left: ${c.dot.x}%; top: ${c.dot.y}%;"></div>
            <svg class="callout-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line class="callout-line" x1="${c.dot.x}" y1="${c.dot.y}" x2="${c.card.x}" y2="${c.card.y}" />
            </svg>
            <div class="callout-card" style="left: ${c.card.x}%; top: ${c.card.y}%;">
              <span class="callout-label">${c.label}</span>
              <span class="callout-detail">${c.detail}</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // ---------------------------------------------------------------------------
  // 9. LINEUP ACCORDION (Desktop Hover 80ms Debounce + Keyboard/Touch A11y)
  // ---------------------------------------------------------------------------
  function initLineupAccordion() {
    const container = document.getElementById('lineup-accordion');
    if (!container || !cfg.lineup) return;

    const models = cfg.lineup.models;

    // Build DOM for the 5 lineup slides
    container.innerHTML = `
      <div class="lineup-floor-line" aria-hidden="true"></div>
      ${models.map((m, idx) => {
        const isDefault = idx === cfg.lineup.defaultIndex;
        return `
          <div class="lineup-slide reveal-slide"
               id="slide-${m.id}"
               role="tab"
               tabindex="0"
               aria-selected="${isDefault}"
               aria-expanded="${isDefault}"
               aria-controls="panel-${m.id}"
               data-index="${idx}">
            
            <!-- Closed Meta: Number at top, rotated model name -->
            <div class="slide-closed-meta" aria-hidden="true">
              <span class="slide-num-top">${m.num}</span>
              <span class="slide-name-rotated">${m.name}</span>
            </div>

            <!-- Car Image Sitting on shared floor line at 72% height -->
            <div class="slide-car-wrap" aria-hidden="true">
              <img src="${m.image}"
                   alt="${m.alt}"
                   class="slide-car-img"
                   loading="lazy">
            </div>

            <!-- Open Slide Content -->
            <div class="slide-open-content" id="panel-${m.id}" role="tabpanel">
              <div class="slide-header-top">
                <span class="hud-tag">${m.num} — SPECIFICATION</span>
                <h3 class="slide-model-title">${m.name}</h3>
                <p class="slide-tagline">${m.tagline}</p>
              </div>

              <div class="slide-bottom-bar">
                <div class="slide-specs-row">
                  ${m.specs.map((sp) => `
                    <div class="spec-col">
                      <span class="spec-label">${sp.label}</span>
                      <span class="spec-value">${sp.value}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="slide-interactive">
                  <div class="slide-swatches" aria-label="Available Finishes">
                    ${m.colors.map((c, cIdx) => `
                      <button type="button"
                              class="swatch-item ${cIdx === 0 ? 'is-active' : ''}"
                              style="--swatch-color: ${c.hex};"
                              title="${c.name}"
                              aria-label="${c.name}">
                      </button>
                    `).join('')}
                  </div>
                  <a href="#reserve" class="slide-configure-link" data-cursor="CONFIGURE">
                    <span>Configure</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        `;
      }).join('')}
    `;

    const slides = container.querySelectorAll('.lineup-slide');

    function setActiveSlide(index) {
      state.lineup.activeIndex = index;
      slides.forEach((slide, idx) => {
        const isTarget = idx === index;
        slide.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
        slide.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      });

      // Update custom cursor label if mouse is over lineup
      const cursorEl = document.getElementById('custom-cursor');
      const labelEl = document.getElementById('cursor-label');
      if (cursorEl && cursorEl.classList.contains('is-hovering')) {
        const hoveredSlide = Array.from(slides).find((s) => s.matches(':hover'));
        if (hoveredSlide) {
          const isExpanded = hoveredSlide.getAttribute('aria-expanded') === 'true';
          const newLabel = isExpanded ? 'CONFIGURE' : 'OPEN';
          state.cursor.label = newLabel;
          if (labelEl) labelEl.textContent = newLabel;
        }
      }
    }

    // Desktop hover with 80ms debounce
    slides.forEach((slide, idx) => {
      slide.addEventListener('mouseenter', () => {
        clearTimeout(state.lineup.hoverTimeout);
        state.lineup.hoverTimeout = setTimeout(() => {
          setActiveSlide(idx);
        }, 80);
      });

      slide.addEventListener('mouseleave', () => {
        clearTimeout(state.lineup.hoverTimeout);
      });

      // Tap / Click activation
      slide.addEventListener('click', () => {
        setActiveSlide(idx);
      });

      // Keyboard navigation (Arrow keys)
      slide.addEventListener('keydown', (e) => {
        let newIndex = state.lineup.activeIndex;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (state.lineup.activeIndex + 1) % slides.length;
          setActiveSlide(newIndex);
          slides[newIndex].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (state.lineup.activeIndex - 1 + slides.length) % slides.length;
          setActiveSlide(newIndex);
          slides[newIndex].focus();
        }
      });
    });

    // Swatch selection interaction
    container.querySelectorAll('.swatch-item').forEach((swatch) => {
      swatch.addEventListener('click', function (e) {
        e.stopPropagation();
        const parentSwatches = this.closest('.slide-swatches');
        if (parentSwatches) {
          parentSwatches.querySelectorAll('.swatch-item').forEach((s) => s.classList.remove('is-active'));
          this.classList.add('is-active');
        }
      });
    });

    // IntersectionObserver for staggered entrance (rise 40px, 0.08s stagger)
    const lineupObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            slides.forEach((slide, idx) => {
              setTimeout(() => {
                slide.classList.add('is-in-view');
              }, idx * 80);
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    lineupObserver.observe(container);
  }

  // ---------------------------------------------------------------------------
  // 10. SCROLL REVEALS & RESERVE BUTTON INTERACTION
  // ---------------------------------------------------------------------------
  function initGenericScrollReveals() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function initReserveButton() {
    const btn = document.getElementById('reserve-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      alert('NOCTIS PRIVATE CLIENT REGISTRY\n\nChassis allocation for the 2027 series is strictly by invitation or certified reservation.\n\nYour session key has been registered.');
    });
  }

  // ---------------------------------------------------------------------------
  // 11. RESIZE HANDLERS
  // ---------------------------------------------------------------------------
  function initResizeListeners() {
    window.addEventListener('resize', () => {
      const isMob = window.innerWidth < 768;
      if (state.isMobile !== isMob) {
        state.isMobile = isMob;
        // Redraw current frames with proper scaling
        drawHeroFrame(Math.round(state.hero.currentFrame));
        drawDismantleFrame(Math.round(state.dismantle.currentFrame));
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    initFilmGrain();
    initCustomCursor();
    initNavigation();
    initStatementWords();
    initDismantleCallouts();
    initLineupAccordion();
    initGenericScrollReveals();
    initReserveButton();
    initResizeListeners();

    // Start loading frames & animate preloader
    initPreloaderAndFrames();

    // Start single requestAnimationFrame loop
    if (!isReducedMotion) {
      requestAnimationFrame(updateScrollytelling);
    }
  });

})();

