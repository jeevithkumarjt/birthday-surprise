/* Main application entry point */
let audioSystem;
let sceneManager;

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  /* Initialize audio */
  audioSystem = new AudioSystem();

  /* Wait for GSAP */
  let gsapAttempts = 0;
  while ((!window.gsap || !window.gsap.timeline) && gsapAttempts < 20) {
    await new Promise(r => setTimeout(r, 50));
    gsapAttempts++;
  }

  /* Initialize scene manager */
  sceneManager = new SceneManager();

  window.SceneManager = sceneManager;
  window.audioSystem = audioSystem;

  /* Hide loading screen and start experience */
  hideLoadingScreen();

  /* Set up interactions */
  initGallerySwipe();
  initScrollReveal();
  initCursorParallax();
  initStaggerText();
  initFontLoading();

  /* Auto-unlock audio on first interaction */
  const unlockAudio = async () => {
    await audioSystem.unlock();
    audioSystem.start();
    document.body.removeEventListener('click', unlockAudio);
    document.body.removeEventListener('touchend', unlockAudio);
  };

  document.body.addEventListener('click', unlockAudio);
  document.body.addEventListener('touchend', unlockAudio);

  /* Handle deep linking */
  handleDeepLink();

  /* Initialize keyboard navigation */
  initGestures(sceneManager);

  /* Initial ambient particles for scene 1 */
  setTimeout(() => {
    sceneManager.spawnAmbientParticles('scene-1');
  }, 500);
}

/* Hide loading screen with animation */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  setTimeout(() => {
    if (window.gsap) {
      gsap.timeline({
        onComplete: () => {
          loadingScreen.style.display = 'none';
        }
      }).to(loadingScreen, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut'
      });
    } else {
      loadingScreen.style.opacity = '0';
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 800);
    }
  }, 2000);
}

/* Cursor parallax effect on cards */
function initCursorParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax], [data-tilt]');

  if (!parallaxElements.length) return;

  const cursorGlow = document.getElementById('cursor-glow');

  let mouseX = 0;
  let mouseY = 0;
  let isMoving = false;

  /* Cursor glow following */
  if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(() => {
          cursorGlow.style.left = `${mouseX}px`;
          cursorGlow.style.top = `${mouseY}px`;
          if (window.gsap) {
            gsap.to(cursorGlow, {
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
          isMoving = false;
        });
      }
    });

    /* Hide cursor glow on leave */
    document.addEventListener('mouseleave', () => {
      if (window.gsap) {
        gsap.to(cursorGlow, { opacity: 0, duration: 0.5, ease: 'power2.inOut' });
      }
    });

    /* Hide on touch devices */
    if ('ontouchstart' in window) {
      cursorGlow.style.display = 'none';
    }
  }

  /* Tilt effect on cards */
  parallaxElements.forEach(el => {
    const maxTilt = 8;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * maxTilt;
      const tiltY = ((centerX - x) / centerX) * maxTilt;

      if (window.gsap) {
        gsap.to(el, {
          rotationX: tiltX,
          rotationY: tiltY,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000,
          transformStyle: 'preserve-3d'
        });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (window.gsap) {
        gsap.to(el, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
  });
}

/* Staggered text reveal */
function initStaggerText() {
  const staggerElements = document.querySelectorAll('[data-stagger]');

  staggerElements.forEach(el => {
    el.classList.add('stagger-ready');
  });
}

/* Font loading */
async function initFontLoading() {
  /* Trigger font load */
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      /* Fonts might already be loaded */
    }
  }
}

/* Gallery swipe navigation */
function initGallerySwipe() {
  const polaroids = document.querySelectorAll('.polaroid');
  if (polaroids.length === 0) return;

  let activeIndex = 0;

  function updateActivePolaroid() {
    polaroids.forEach((p, i) => {
      p.classList.toggle('polaroid--active', i === activeIndex);
    });
  }

  const nextBtn = document.getElementById('next-memory');
  const prevBtn = document.getElementById('prev-memory');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % polaroids.length;
      updateActivePolaroid();
      window.audioSystem.playClick();
      window.Gestures?.vibrate(30);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + polaroids.length) % polaroids.length;
      updateActivePolaroid();
      window.audioSystem.playClick();
      window.Gestures?.vibrate(30);
    });
  }

  updateActivePolaroid();
}

/* Scroll reveal for timeline items */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.timeline-item');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      observer.observe(el);
    });
  }
}

/* Handle deep linking */
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  const name = params.get('name');

  if (name) {
    const title = document.querySelector('.reveal-text__title');
    if (title) {
      title.textContent = `Happy Birthday, ${name}! 🎂`;
    }
  }

  if (scene && /^\d+$/.test(scene)) {
    const sceneNum = parseInt(scene);
    if (sceneNum >= 1 && sceneNum <= 8) {
      setTimeout(() => {
        window.SceneManager.goToScene(sceneNum >= 8 ? 'final' : sceneNum);
      }, 800);
    }
  }
}

/* Initialize keyboard navigation */
function initGestures(sceneManager) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      if (sceneManager.currentScene < sceneManager.totalScenes) {
        sceneManager.goToScene(sceneManager.currentScene + 1);
      }
    }
    if (e.key === 'ArrowLeft') {
      if (sceneManager.currentScene > 1) {
        sceneManager.goToScene(sceneManager.currentScene - 1);
      }
    }
  });

  /* Swipe navigation */
  if (window.Gestures) {
    window.Gestures.onSwipe((e) => {
      if (e.detail.direction === 'right' && sceneManager.currentScene > 1) {
        sceneManager.goToScene(sceneManager.currentScene - 1);
      } else if (e.detail.direction === 'left' && sceneManager.currentScene < sceneManager.totalScenes) {
        sceneManager.goToScene(sceneManager.currentScene + 1);
      }
    });
  }
}

/* Handle reduced motion changes */
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e) => {
    if (window.Animations) {
      Animations.prefersReducedMotion = e.matches;
    }
    if (window.SceneManager) {
      SceneManager.prefersReducedMotion = e.matches;
    }
  };
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
  } else {
    mediaQuery.addListener(handler);
  }
}
