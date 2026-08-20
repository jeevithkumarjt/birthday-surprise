/* Animation utilities — lightweight, CSS-driven animation engine */
class AnimationSystem {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* Create a DOM element with optional classes and attributes */
  createElement(tag, className = '', attrs = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'html') {
        el.innerHTML = value;
      } else {
        el.setAttribute(key, value);
      }
    });
    return el;
  }

  /* Animate a CSS property over time */
  animate(element, keyframes, options) {
    if (this.prefersReducedMotion) return Promise.resolve();
    return element.animate(keyframes, options).finished;
  }

  /* Fade in an element */
  fadeIn(element, duration = 600, delay = 0) {
    if (this.prefersReducedMotion) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      return Promise.resolve();
    }

    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    element.style.transition = `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`;

    return new Promise(resolve => setTimeout(resolve, duration + delay));
  }

  /* Fade out an element */
  fadeOut(element, duration = 600, delay = 0) {
    if (this.prefersReducedMotion) {
      element.style.opacity = '0';
      return Promise.resolve();
    }

    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    element.style.transition = `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`;

    return new Promise(resolve => setTimeout(resolve, duration + delay));
  }

  /* Stagger animation of children */
  staggerChildren(container, childSelector, animationFn, staggerDelay = 100) {
    const children = container.querySelectorAll(childSelector);
    return Promise.all(
      Array.from(children).map((child, i) => {
        setTimeout(() => animationFn(child), i * staggerDelay);
        return new Promise(resolve => setTimeout(resolve, i * staggerDelay + 1000));
      })
    );
  }

  /* Typewriter text effect */
  typewriter(element, text, speed = 30) {
    if (this.prefersReducedMotion) {
      element.textContent = text;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      let i = 0;
      element.textContent = '';
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  /* Shake animation */
  shake(element, intensity = 10, duration = 500) {
    if (this.prefersReducedMotion) return Promise.resolve();

    const start = performance.now();
    const animateShake = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const shakeX = Math.sin(progress * Math.PI * 10) * intensity * (1 - progress);

      element.style.transform = `translateX(${shakeX}px)`;

      if (progress < 1) {
        requestAnimationFrame(animateShake);
      } else {
        element.style.transform = '';
      }
    };

    requestAnimationFrame(animateShake);
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /* Pulse animation */
  pulse(element, scale = 1.1, repeats = Infinity) {
    if (this.prefersReducedMotion) return Promise.resolve();

    let count = 0;
    const animate = () => {
      if (repeats !== Infinity && count >= repeats) {
        element.style.transform = '';
        return;
      }

      element.style.transition = 'transform 0.3s ease';
      element.style.transform = `scale(${scale})`;

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        count++;
        if (repeats !== Infinity && count < repeats) {
          setTimeout(animate, 200);
        }
      }, 300);
    };

    if (repeats === Infinity) {
      animate();
    } else {
      animate();
    }
  }

  /* Create particle burst effect */
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
      particle.style.zIndex = '10';
      particle.style.animation = 'none';

      const angle = (i / count) * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const vx = Math.cos(angle) * distance;
      const vy = Math.sin(angle) * distance + 50;

      parent.appendChild(particle);

      let startTime = null;
      const animateParticle = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 1500, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        particle.style.transform = `translate(${vx * ease}px, ${vy * ease + progress * 100}px)`;
        particle.style.opacity = `${1 - progress * 0.8}`;

        if (progress < 1) {
          requestAnimationFrame(animateParticle);
        } else {
          if (particle.parentNode) {
            particle.remove();
          }
        }
      };

      requestAnimationFrame(animateParticle);
    }
  }

  /* Create confetti effect */
  createConfetti(x, y, count = 50, container = null) {
    if (this.prefersReducedMotion) return;

    const parent = container || document.body;
    const colors = ['#ff6ec4', '#ffd700', '#4e9eff', '#39e683', '#ff8a65'];

    for (let i = 0; i < count; i++) {
      const confetti = this.createElement('div', 'confetti-piece');
      confetti.style.left = `${x}px`;
      confetti.style.top = `${y}px`;
      confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);

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

      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, 3000);
    }
  }
}

const Animations = new AnimationSystem();
window.Animations = Animations;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Animations, AnimationSystem };
}
