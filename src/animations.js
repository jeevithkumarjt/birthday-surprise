/* Animation System — GSAP-powered visual effects engine */
class AnimationSystem {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.gsap = window.gsap || null;
    if (!this.gsap) {
      console.warn('GSAP not loaded, falling back to minimal animations');
    }
  }

  createElement(tag, className = '', attrs = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'html') {
        el.innerHTML = value;
      } else if (key === 'style') {
        Object.assign(el.style, value);
      } else {
        el.setAttribute(key, value);
      }
    });
    return el;
  }

  /* Animate element with GSAP */
  animate(element, props, duration = 0.8, ease = 'power3.out', delay = 0) {
    if (this.prefersReducedMotion || !this.gsap) {
      Object.assign(element.style, props);
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.gsap.to(element, {
        ...props,
        duration,
        ease,
        delay,
        onComplete: resolve
      });
    });
  }

  /* Staggered fade+slide-in of children */
  staggerIn(container, selector = '*', stagger = 0.08, from = 'start') {
    if (this.prefersReducedMotion || !this.gsap) {
      container?.querySelectorAll(selector).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }
    const targets = container.querySelectorAll(selector);
    if (!targets.length) return;
    this.gsap.from(targets, {
      opacity: 0,
      y: 30,
      stagger: { amount: stagger * (targets.length || 1), from },
      ease: 'power3.out',
      duration: 0.9
    });
  }

  staggerOut(container, selector = '*', stagger = 0.05, callback) {
    if (this.prefersReducedMotion || !this.gsap) {
      if (callback) callback();
      return;
    }
    const targets = container.querySelectorAll(selector);
    if (!targets.length) { if (callback) callback(); return; }
    this.gsap.to(targets, {
      opacity: 0,
      y: -20,
      stagger: stagger,
      ease: 'power3.in',
      duration: 0.6,
      onComplete: callback
    });
  }

  /* Split text animation — word by word */
  splitTextReveal(element, stagger = 0.12) {
    if (!element || this.prefersReducedMotion) {
      if (element) element.style.opacity = '1';
      return;
    }
    const text = element.textContent.trim();
    const words = text.split(' ');
    element.innerHTML = words.map(word => `<span class="split-word">${word}</span>`).join(' ');
    if (this.gsap) {
      this.gsap.from('.split-word', {
        opacity: 0,
        y: 40,
        rotation: -10,
        stagger: stagger,
        ease: 'back.out(1.7)',
        duration: 1,
        delay: 0.3
      });
    }
  }

  /* Letter-by-letter reveal */
  typewriterText(element, speed = 0.05) {
    if (!element || this.prefersReducedMotion) {
      if (element) element.style.opacity = '1';
      return Promise.resolve();
    }
    const text = element.textContent.trim();
    element.innerHTML = text.split('').map(c => `<span class="split-char">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    if (this.gsap) {
      return new Promise(resolve => {
        this.gsap.from('.split-char', {
          opacity: 0,
          y: 10,
          stagger: speed,
          ease: 'none',
          onComplete: resolve
        });
      });
    }
    return Promise.resolve();
  }

  /* Create ambient floating particles */
  createAmbientParticles(containerId, config = {}) {
    const defaults = {
      count: 25,
      icons: ['💖', '🌸', '✨', '🌙', '⭐', '💫'],
      sizeMin: 10,
      sizeMax: 20,
      opacityMin: 0.15,
      opacityMax: 0.3,
      durationMin: 25,
      durationMax: 45
    };
    const cfg = { ...defaults, ...config };
    const ambient = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!ambient) return;

    ambient.innerHTML = '';

    for (let i = 0; i < cfg.count; i++) {
      const p = this.createElement('div', 'ambient-particle', {
        html: cfg.icons[Math.floor(Math.random() * cfg.icons.length)]
      });
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.animationDuration = `${cfg.durationMin + Math.random() * (cfg.durationMax - cfg.durationMin)}s`;
      p.style.fontSize = `${cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin)}px`;
      p.style.opacity = `${cfg.opacityMin + Math.random() * (cfg.opacityMax - cfg.opacityMin)}`;
      ambient.appendChild(p);
    }
  }

  /* Continuous ambient particle system — uses GSAP for smooth drift */
  startAmbientSystem(containerId, density = 'medium') {
    const counts = { light: 15, medium: 25, heavy: 40 };
    const ambient = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!ambient) return;

    const count = counts[density] || 25;
    const icons = ['💖', '🌸', '✨', '⭐', '💫', '🌙', '🌼', '🍓'];
    ambient.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const p = this.createElement('div', 'ambient-particle', {
        html: icons[Math.floor(Math.random() * icons.length)]
      });
      const size = 8 + Math.random() * 14;
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;

      p.style.cssText = `
        left: ${startX}%;
        top: ${startY}%;
        font-size: ${size}px;
        opacity: ${0.1 + Math.random() * 0.15};
        position: absolute;
      `;

      ambient.appendChild(p);

      if (this.gsap) {
        const tl = this.gsap.timeline({
          repeat: -1,
          defaults: { ease: 'none' }
        });

        tl.to(p, {
          x: `+=${(Math.random() - 0.5) * 100}`,
          y: `-=${100 + Math.random() * 100}`,
          duration: 20 + Math.random() * 30,
          ease: 'none'
        }, 0);

        tl.to(p, {
          opacity: `${0.05 + Math.random() * 0.1}`,
          duration: 4 + Math.random() * 3,
          yoyo: true,
          repeat: -1
        }, 0);

        tl.to(p, {
          rotation: `${Math.random() * 360}`,
          duration: 20 + Math.random() * 30
        }, 0);
      } else {
        p.style.animation = `ambientFloat ${25 + Math.random() * 20}s ease-in-out infinite`;
      }
    }
  }

  /* Create confetti explosion */
  createConfetti(x, y, count = 60, container = null, colors = null) {
    if (this.prefersReducedMotion) return;

    const parent = container || document.body;
    const palette = colors || ['#ff6ec4', '#ffd7a0', '#4e9eff', '#39e683', '#fff7', '#ff8a65', '#d4af37'];

    for (let i = 0; i < count; i++) {
      const confetti = this.createElement('div', 'confetti-piece');
      confetti.style.left = `${x}px`;
      confetti.style.top = `${y}px`;
      confetti.style.setProperty('--color', palette[Math.floor(Math.random() * palette.length)]);

      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 120;
      const vx = Math.cos(angle) * distance;
      const vy = Math.sin(angle) * distance + 100;

      confetti.style.setProperty('--tx', `${vx}px`);
      confetti.style.setProperty('--ty', `${vy}px`);
      confetti.style.animationDuration = `${1 + Math.random() * 2}s`;
      confetti.style.width = `${6 + Math.random() * 8}px`;
      confetti.style.height = `${10 + Math.random() * 12}px`;

      parent.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  }

  /* Create particle burst */
  createParticleBurst(origin, color, count = 30, container = null) {
    if (this.prefersReducedMotion) return;

    const parent = container || document.body;
    const rect = origin.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const particle = this.createElement('div', 'particle');
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.background = color;
      particle.style.width = `${8 + Math.random() * 8}px`;
      particle.style.height = `${8 + Math.random() * 8}px`;
      particle.style.position = 'absolute';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '100';
      particle.style.animation = 'none';

      const angle = (i / count) * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const vx = Math.cos(angle) * distance;
      const vy = Math.sin(angle) * distance + 50;

      parent.appendChild(particle);

      if (this.gsap) {
        this.gsap.to(particle, {
          x: vx,
          y: vy,
          opacity: 0,
          scale: 0,
          duration: 1 + Math.random() * 0.5,
          ease: 'power2.out',
          onComplete: () => particle.remove()
        });
      }
    }
  }

  /* Screen flash effect */
  screenFlash(color = 'rgba(255, 255, 255, 0.8)', duration = 600) {
    if (this.prefersReducedMotion) return;

    const flash = this.createElement('div', 'screen-flash');
    flash.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${color};
      z-index: 160;
      pointer-events: none;
      opacity: 0;
    `;
    document.body.appendChild(flash);

    if (this.gsap) {
      this.gsap.timeline({
        onComplete: () => flash.remove()
      }).to(flash, {
        opacity: 1,
        duration: duration / 2000
      }).to(flash, {
        opacity: 0,
        duration: duration / 2000
      });
    }
  }

  /* Light ray creation */
  createLightRays(containerId = 'light-rays', count = 12) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const ray = this.createElement('div', 'light-ray');
      ray.style.transform = `rotate(${i * (360 / count)}deg)`;
      ray.style.animationDelay = `${i * 0.1}s`;
      container.appendChild(ray);
    }
  }

  /* Continuous confetti rain */
  startConfettiRain(container = null, density = 'medium') {
    if (this.prefersReducedMotion) return;

    const counts = { light: 30, medium: 60, heavy: 100 };
    const count = counts[density] || 60;
    const parent = container || document.body;
    const colors = ['#ff6ec4', '#ffd7a0', '#4e9eff', '#39e683', '#fff7', '#ff8a65', '#d4af37'];

    const createPiece = () => {
      const confetti = this.createElement('div', 'confetti-rain');
      confetti.style.left = `${5 + Math.random() * 90}%`;
      confetti.style.top = '-30px';
      confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
      confetti.style.width = `${6 + Math.random() * 8}px`;
      confetti.style.height = `${10 + Math.random() * 12}px`;
      parent.appendChild(confetti);

      const targetY = window.innerHeight + 100;
      const targetX = (Math.random() - 0.5) * 100;

      if (this.gsap) {
        this.gsap.to(confetti, {
          y: targetY,
          x: targetX,
          rotation: Math.random() * 360,
          opacity: 0,
          duration: 2.5 + Math.random() * 2,
          ease: 'sine.in',
          onComplete: () => confetti.remove()
        });
      }

      setTimeout(() => {
        if (confetti.parentNode) confetti.remove();
      }, 5000);
    };

    for (let i = 0; i < count; i++) {
      setTimeout(createPiece, i * 50);
    }
  }

  /* Button micro-interaction */
  setupButtonEffects(button) {
    if (!button || this.prefersReducedMotion) return;

    const glow = button.querySelector('.btn__glow') || this.createElement('div', 'btn__glow');
    if (!button.querySelector('.btn__glow')) {
      button.appendChild(glow);
    }

    if (this.gsap) {
      button.addEventListener('mouseenter', () => {
        if (this.prefersReducedMotion) return;
        this.gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)'
        });
        this.gsap.to(glow, {
          opacity: 0.7,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mouseleave', () => {
        if (this.prefersReducedMotion) return;
        this.gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          boxShadow: 'none'
        });
        this.gsap.to(glow, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mousedown', () => {
        if (this.prefersReducedMotion) return;
        this.gsap.to(button, {
          scale: 0.95,
          duration: 0.1,
          ease: 'power1.in'
        });
      });

      button.addEventListener('mouseup', () => {
        if (this.prefersReducedMotion) return;
        this.gsap.to(button, {
          scale: 1,
          duration: 0.2,
          ease: 'back.out(1.7)'
        });
      });
    }
  }

  /* Shake animation */
  shake(element, intensity = 10, duration = 0.5) {
    if (this.prefersReducedMotion || !this.gsap) return Promise.resolve();
    return new Promise(resolve => {
      this.gsap.to(element, {
        x: `+=${intensity}`,
        duration: duration / 10,
        repeat: 9,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: resolve
      });
    });
  }

  /* Pulse animation */
  pulse(element, scale = 1.1, repeats = 2, duration = 0.5) {
    if (this.prefersReducedMotion || !this.gsap) {
      element.style.transform = ``;
      return Promise.resolve();
    }
    return new Promise(resolve => {
      const tl = this.gsap.timeline({
        repeat: repeats,
        yoyo: true,
        onComplete: () => {
          this.gsap.set(element, { scale: 1 });
          resolve();
        }
      });
      tl.to(element, {
        scale: scale,
        duration: duration,
        ease: 'power1.inOut'
      });
    });
  }

  /* Fade in */
  fadeIn(element, duration = 0.6, delay = 0) {
    if (this.prefersReducedMotion || !this.gsap) {
      element.style.opacity = '1';
      return Promise.resolve();
    }
    element.style.opacity = '0';
    element.style.display = '';
    return new Promise(resolve => {
      this.gsap.to(element, {
        opacity: 1,
        duration: duration,
        delay: delay,
        ease: 'power2.out',
        onComplete: resolve
      });
    });
  }

  /* Fade out */
  fadeOut(element, duration = 0.6, delay = 0) {
    if (this.prefersReducedMotion || !this.gsap) {
      element.style.opacity = '0';
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.gsap.to(element, {
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: 'power2.in',
        onComplete: resolve
      });
    });
  }
}

const Animations = new AnimationSystem();
window.Animations = Animations;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Animations, AnimationSystem };
}
