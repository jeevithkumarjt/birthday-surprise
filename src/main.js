/* Main application entry point */
let audioSystem;

document.addEventListener('DOMContentLoaded', () => {
  audioSystem = new AudioSystem();
  const sceneManager = new SceneManager();

  window.SceneManager = sceneManager;
  window.audioSystem = audioSystem;

  initGallerySwipe();
  initScrollReveal();

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
});

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
      Gestures.vibrate(30);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + polaroids.length) % polaroids.length;
      updateActivePolaroid();
      window.audioSystem.playClick();
      Gestures.vibrate(30);
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
      }, 500);
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
}

/* Handle reduced motion changes */
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e) => { Animations.prefersReducedMotion = e.matches; };
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
  } else {
    mediaQuery.addListener(handler);
  }
}
