/* Scene transition management — premium animations */
class SceneManager {
  constructor() {
    this.currentScene = 1;
    this.totalScenes = 7;
    this.scenes = [];
    this.progressBar = null;

    this.init();
  }

  init() {
    this.progressBar = document.getElementById('progress-bar');

    for (let i = 1; i <= this.totalScenes + 1; i++) {
      const scene = document.getElementById(`scene-${i}`) || document.getElementById(i === 8 ? 'final' : `scene-${i}`);
      if (scene) {
        this.scenes.push({ element: scene, id: i });
      }
    }

    this.bindNavigation();
  }

  bindNavigation() {
    /* Scene 1 -> 2 */
    const openEnvelopeBtn = document.getElementById('open-envelope-btn');
    const envelope = document.getElementById('envelope');

    const handleEnvelopeOpen = async () => {
      if (envelope.classList.contains('envelope--open')) return;

      envelope.classList.add('envelope--open');
      if (window.audioSystem) {
        await window.audioSystem.unlock();
        window.audioSystem.playWhoosh();
        window.Gestures.vibrate([50, 30, 50]);
      }

      /* Break the seal with particle burst */
      const seal = envelope.querySelector('.envelope__seal');
      if (seal) {
        seal.style.transition = 'none';
        window.Animations?.createParticleBurst(seal, '#d4af37', 15, envelope);
      }

      /* Light spill */
      const light = envelope.querySelector('.envelope-light');
      if (light) {
        light.style.display = 'block';
      }

      setTimeout(() => {
        envelope.style.opacity = '0';
        envelope.style.transform = 'scale(0.3)';
        envelope.style.filter = 'blur(4px)';
        setTimeout(() => {
          this.goToScene(2);
        }, 600);
      }, 900);
    };

    if (openEnvelopeBtn) {
      openEnvelopeBtn.addEventListener('click', handleEnvelopeOpen);
      openEnvelopeBtn.classList.add('pulse-ring');
    }
    if (envelope) {
      envelope.addEventListener('click', handleEnvelopeOpen);
    }

    /* Navigation buttons */
    const scenes = [
      { btn: 'next-btn-2', to: 3 },
      { btn: 'next-btn-3', to: 4 },
      { btn: 'next-btn-4', to: 5 },
      { btn: 'next-btn-5', to: 6 },
      { btn: 'next-btn-6', to: 7 },
    ];

    scenes.forEach(({ btn, to }) => {
      const el = document.getElementById(btn);
      if (el) {
        el.addEventListener('click', () => {
          if (window.audioSystem) window.audioSystem.playClick();
          this.goToScene(to);
        });
      }
    });

    /* Scene 7 -> Final */
    const giftBox = document.getElementById('gift-box');
    if (giftBox) {
      giftBox.addEventListener('click', () => {
        if (!giftBox.classList.contains('gift-box--open')) {
          giftBox.classList.add('gift-box--open');
          if (window.audioSystem) {
            window.audioSystem.playPop();
            window.audioSystem.playConfettiSound();
          }
          window.Gestures.vibrate([80, 40, 80]);
          this.createFireworks();

          /* Full-screen confetti */
          setTimeout(() => {
            window.Animations?.createConfetti(
              window.innerWidth / 2,
              window.innerHeight / 2,
              120
            );
          }, 200);

          setTimeout(() => {
            this.goToScene('final');
          }, 1400);
        }
      });
    }

    /* Restart */
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restart();
      });
    }
  }

  goToScene(sceneNum) {
    const fromScene = document.querySelector('.scene--active');
    if (fromScene) {
      fromScene.classList.remove('scene--active');
      fromScene.classList.add('scene--exiting');

      /* Remove ambient particles from exiting scene */
      const sceneId = fromScene.id;
      const ambient = document.getElementById(`ambient-${sceneId}`);
      if (ambient) {
        ambient.innerHTML = '';
      }
    }

    setTimeout(() => {
      if (fromScene) {
        fromScene.classList.remove('scene--exiting');
      }

      const targetScene = typeof sceneNum === 'number'
        ? document.getElementById(`scene-${sceneNum}`)
        : document.getElementById(sceneNum);

      if (targetScene) {
        targetScene.classList.add('scene--active');
        this.currentScene = typeof sceneNum === 'number' ? sceneNum : this.totalScenes + 1;
        this.updateProgress();

        /* Spawn ambient particles for the new scene */
        setTimeout(() => {
          this.spawnAmbientParticles(targetScene.id);
        }, 200);
      }
    }, 700);

    /* Trigger scene-specific animations after transition */
    setTimeout(() => {
      this.triggerSceneAnimations(sceneNum);
    }, 900);
  }

  spawnAmbientParticles(sceneId) {
    const ambient = document.getElementById(`ambient-${sceneId}`);
    if (!ambient) return;

    /* Clear previous */
    ambient.innerHTML = '';

    const isFinal = sceneId === 'final';
    const particleCount = isFinal ? 50 : 25;
    const items = ['💖', '🌸', '✨', '🌙', '⭐', '💫'];

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      const icon = items[Math.floor(Math.random() * items.length)];
      p.textContent = icon;
      p.className = i % 2 === 0
        ? (Math.random() > 0.5 ? 'ambient-heart' : 'ambient-petal')
        : 'ambient-sparkle';

      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.animationDuration = `${15 + Math.random() * 15}s`;
      p.style.fontSize = `${10 + Math.random() * 12}px`;
      p.style.opacity = `${0.15 + Math.random() * 0.15}`;

      ambient.appendChild(p);

      /* Remove after animation ends */
      setTimeout(() => p.remove(), 35000);
    }
  }

  triggerSceneAnimations(sceneNum) {
    switch (sceneNum) {
      case 2:
        this.animateScene2();
        break;
      case 3:
        this.initCakeAnimation();
        break;
      case 4:
        this.animateScene4();
        break;
      case 5:
        this.animateScene5();
        break;
      case 6:
        this.animateScene6();
        break;
      case 7:
        this.animateScene7();
        break;
      case 'final':
      case 8:
        this.animateFinal();
        break;
    }
  }

  animateScene2() {
    const balloonsContainer = document.getElementById('balloons');
    const particlesContainer = document.getElementById('particles');

    if (balloonsContainer) {
      const colors = ['#ff6ec4', '#ffd700', '#4e9eff', '#39e683', '#ff8a65', '#ffd7a0'];
      for (let i = 0; i < 12; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = `${10 + Math.random() * 80}%`;
        balloon.style.top = `${20 + Math.random() * 60}%`;
        balloon.style.background = `linear-gradient(145deg, ${colors[Math.floor(Math.random() * colors.length)]}, #fff4)`;
        balloon.style.setProperty('--float-time', `${4 + Math.random() * 3}s`);
        balloon.style.setProperty('--delay', `${Math.random() * 3}s`);
        balloonsContainer.appendChild(balloon);
      }
    }

    if (particlesContainer) {
      const particles = [];
      for (let i = 0; i < 80; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 3 + Math.random() * 6;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        const colors = ['#ffd7a0', '#ff6ec4', '#ffffff', '#ffd1ec'];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--tx', `${(Math.random() - 0.5) * 80}px`);
        p.style.animation = `sparkle-fall ${1 + Math.random() * 2}s ease-in forwards`;
        particlesContainer.appendChild(p);
        particles.push(p);
      }

      setTimeout(() => {
        particles.forEach(p => p.remove());
      }, 3000);
    }
  }

  initCakeAnimation() {
    const canvas = document.getElementById('cake-canvas');
    if (!canvas || canvas.dataset.initialized === 'true') return;
    canvas.dataset.initialized = 'true';

    const ctx = canvas.getContext('2d');

    let candlesLit = true;
    let animationId = null;

    const drawCake = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;

      /* Cake base — textured with gradient */
      const cakeWidth = 130;
      const cakeHeight = 90;
      const cakeTop = 120;

      const gradient = ctx.createLinearGradient(centerX - cakeWidth / 2, 0, centerX + cakeWidth / 2, 0);
      gradient.addColorStop(0, '#fdcb6e');
      gradient.addColorStop(0.5, '#e74c3c');
      gradient.addColorStop(1, '#c0392b');
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - cakeWidth / 2, cakeTop, cakeWidth, cakeHeight);

      /* Cake border */
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - cakeWidth / 2, cakeTop, cakeWidth, cakeHeight);

      /* Frosting */
      ctx.fillStyle = '#ffd1ec';
      ctx.beginPath();
      ctx.ellipse(centerX, cakeTop, cakeWidth / 2 + 10, 16, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#ffb6c1';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* Strawberries on frosting */
      for (let i = 0; i < 3; i++) {
        const sx = centerX - 20 + i * 20;
        const sy = cakeTop - 10;
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cc5555';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      /* Candles */
      const candlePositions = [
        { x: centerX - 42, y: cakeTop - 8 },
        { x: centerX - 14, y: cakeTop - 8 },
        { x: centerX + 14, y: cakeTop - 8 },
        { x: centerX + 42, y: cakeTop - 8 },
      ];

      candlePositions.forEach((pos, i) => {
        /* Candle body with gradient */
        const candleGrad = ctx.createLinearGradient(pos.x - 4, pos.y, pos.x + 4, pos.y);
        candleGrad.addColorStop(0, i % 2 === 0 ? '#ff6ec4' : '#4e9eff');
        candleGrad.addColorStop(1, i % 2 === 0 ? '#e74c3c' : '#3a5a9e');
        ctx.fillStyle = candleGrad;
        ctx.fillRect(pos.x - 4, pos.y, 8, 26);

        /* Candle highlight */
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(pos.x - 3, pos.y, 3, 8);

        /* Wick */
        ctx.fillStyle = '#2c1a0a';
        ctx.fillRect(pos.x - 1, pos.y - 6, 2, 6);

        /* Flame */
        if (candlesLit) {
          const time = performance.now() * 0.004 + i * 2;
          const flicker = Math.sin(time) * 0.3 + Math.cos(time * 1.3) * 0.2 + 0.5;
          const flameHeight = 8 + flicker * 6;
          const flameWidth = 2.5 + flicker * 1.5;

          ctx.save();
          ctx.translate(pos.x, pos.y - 8);

          /* Outer glow */
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 12 + flicker * 8;

          /* Flame gradient */
          const flameGrad = ctx.createRadialGradient(0, -flameHeight / 2, 0, 0, -flameHeight / 2, flameWidth);
          flameGrad.addColorStop(0, '#fff8dc');
          flameGrad.addColorStop(0.4, '#ffd700');
          flameGrad.addColorStop(0.7, '#ffa500');
          flameGrad.addColorStop(1, 'rgba(255, 165, 0, 0)');

          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.ellipse(0, -flameHeight / 2, flameWidth, flameHeight, 0, 0, Math.PI * 2);
          ctx.fill();

          /* Core glow */
          ctx.shadowBlur = 6;
          ctx.fillStyle = '#fff8dc';
          ctx.beginPath();
          ctx.arc(0, -flameHeight / 2 - 2, 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      /* Plate */
      const plateGrad = ctx.createLinearGradient(centerX - 80, cakeTop + cakeHeight, centerX + 80, cakeTop + cakeHeight);
      plateGrad.addColorStop(0, '#d0d0d0');
      plateGrad.addColorStop(1, '#a0a0a0');
      ctx.fillStyle = plateGrad;
      ctx.fillRect(centerX - 80, cakeTop + cakeHeight, 160, 14);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - 80, cakeTop + cakeHeight, 160, 14);
    };

    const animate = () => {
      drawCake();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    /* Candle blow interaction */
    const blowCandles = () => {
      if (!candlesLit) return;
      candlesLit = false;
      if (window.audioSystem) {
        window.audioSystem.playCandleBlow();
        window.audioSystem.playConfettiSound();
      }
      window.Gestures.vibrate([200, 50, 200]);

      /* Smoke wisps + confetti */
      const rect = canvas.getBoundingClientRect();
      const parentRect = canvas.parentElement.getBoundingClientRect();
      const confettiX = rect.left - parentRect.left + rect.width / 2;
      const confettiY = rect.top - parentRect.top;

      /* Smoke */
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const smoke = document.createElement('div');
          smoke.className = 'smoke-wisp';
          smoke.style.left = `${confettiX}px`;
          smoke.style.top = `${confettiY}px`;
          smoke.style.setProperty('--smoke-delay', `${i * 0.2}s`);
          canvas.parentElement.appendChild(smoke);
          setTimeout(() => smoke.remove(), 4000);
        }, i * 150);
      }

      /* Confetti */
      window.Animations?.createConfetti(confettiX, confettiY, 80, canvas.parentElement);

      setTimeout(() => {
        const hint = document.querySelector('.candle-hint');
        if (hint) {
          hint.innerHTML = '<p>🕯️ Candles blown out! 🎉</p>';
        }
        /* Ambient warmth */
        const glow = document.querySelector('.cake-glow');
        if (glow) {
          glow.style.background = 'radial-gradient(circle, rgba(255, 215, 160, 0.05) 0%, transparent 70%)';
        }
      }, 500);
    };

    canvas.addEventListener('click', blowCandles);
    window.Gestures.onHold('#cake-canvas', blowCandles, 800);

    if (!window._cakeAnimationCleanup) {
      window._cakeAnimationCleanup = () => {
        if (animationId) cancelAnimationFrame(animationId);
        canvas.removeEventListener('click', blowCandles);
      };
    }
  }

  animateScene4() {
    const polaroids = document.querySelectorAll('.polaroid');
    polaroids.forEach((p, i) => {
      p.style.transitionDelay = `${i * 0.15}s`;
    });

    /* Activate first polaroid */
    if (polaroids[0]) {
      polaroids[0].classList.add('polaroid--active');
    }
  }

  animateScene5() {
    const letter = document.getElementById('letter');
    if (letter) {
      letter.classList.add('letter--revealed');
    }

    /* Add drop cap styling to first line */
    const firstLine = document.querySelector('.letter__line[data-line="1"]');
    if (firstLine) {
      firstLine.classList.add('letter__line--dropcap');
    }

    /* Sequential reveal is handled by CSS transition-delay */
    setTimeout(() => {
      const lines = document.querySelectorAll('.letter__line');
      lines.forEach((line, i) => {
        line.style.transitionDelay = `${i * 0.2}s`;
      });
    }, 200);

    if (window.audioSystem) {
      window.audioSystem.playChime();
    }
  }

  animateScene6() {
    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.classList.add('timeline--visible');

      setTimeout(() => {
        timeline.querySelectorAll('.timeline-item').forEach((item, i) => {
          item.style.transitionDelay = `${i * 0.15}s`;
        });
      }, 200);
    }
  }

  animateScene7() {
    const fireworks = document.getElementById('fireworks');
    if (!fireworks) return;

    /* Ambient sparkle floating */
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.left = `${15 + Math.random() * 70}%`;
        sparkle.style.top = `${10 + Math.random() * 70}%`;
        sparkle.style.width = '6px';
        sparkle.style.height = '6px';
        sparkle.style.background = ['#ffd7a0', '#ff6ec4', '#4e9eff', '#ffffff'][Math.floor(Math.random() * 4)];
        sparkle.style.borderRadius = '50%';
        sparkle.style.boxShadow = '0 0 10px currentColor';
        sparkle.style.animation = 'sparkle-fall 3s ease-in-out forwards';
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
        fireworks.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 3000);
      }, i * 150);
    }
  }

  animateFinal() {
    if (window.audioSystem) {
      window.audioSystem.playChime();
    }

    /* Light rays */
    const lightRays = document.getElementById('light-rays');
    if (lightRays) {
      for (let i = 0; i < 8; i++) {
        const ray = document.createElement('div');
        ray.className = 'light-ray';
        ray.style.transform = `rotate(${i * 45}deg)`;
        ray.style.animationDelay = `${i * 0.1}s`;
        lightRays.appendChild(ray);
      }
    }

    /* Confetti rain */
    this.createConfettiRain();

    setTimeout(() => {
      window.Animations?.createConfetti(
        window.innerWidth / 2,
        100,
        120
      );
    }, 600);

    /* Heart beating */
    setTimeout(() => {
      const heart = document.getElementById('final-heart');
      if (heart) {
        heart.style.display = 'block';
      }
    }, 300);
  }

  /* Create fireworks on gift box open */
  createFireworks() {
    const fireworks = document.getElementById('fireworks');
    if (!fireworks) return;

    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const color = ['#ffd7a0', '#ff6ec4', '#4e9eff', '#39e683', '#fff7'][Math.floor(Math.random() * 5)];
        const centerX = 100 + Math.random() * 100;
        const centerY = 80 + Math.random() * 60;

        for (let j = 0; j < 30; j++) {
          const fw = document.createElement('div');
          fw.className = 'firework';
          fw.style.left = `${centerX}px`;
          fw.style.top = `${centerY}px`;
          fw.style.setProperty('--color', color);

          const angle = (j / 30) * Math.PI * 2;
          const distance = 40 + Math.random() * 80;
          fw.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
          fw.style.setProperty('--ty', `${Math.sin(angle) * distance + 30}px`);
          fw.style.animationDuration = `${0.8 + Math.random() * 0.4}s`;

          fireworks.appendChild(fw);
          setTimeout(() => fw.remove(), 1500);
        }
      }, i * 300);
    }
  }

  /* Confetti rain for final scene */
  createConfettiRain() {
    const body = document.body;
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const colors = ['#ff6ec4', '#ffd7a0', '#4e9eff', '#39e683', '#fff7', '#ff8a65'];
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = `${5 + Math.random() * 90}%`;
        confetti.style.top = '-30px';
        confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        confetti.style.width = `${6 + Math.random() * 6}px`;
        confetti.style.height = `${10 + Math.random() * 10}px`;
        confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
        confetti.style.opacity = `${0.5 + Math.random() * 0.5}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        confetti.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        confetti.style.setProperty('--ty', `${Math.sin(angle) * distance + 300}px`);

        body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
      }, i * 20);
    }
  }

  updateProgress() {
    if (!this.progressBar) return;
    const progress = (this.currentScene / this.totalScenes) * 100;
    this.progressBar.style.scale = `${progress / 100} 1`;
  }

  restart() {
    /* Clean up all scenes */
    this.scenes.forEach(scene => {
      scene.element.classList.remove('scene--active', 'scene--exiting');
      scene.element.style.opacity = '';
      scene.element.style.transform = '';
      scene.element.style.filter = '';

      /* Clean up canvas */
      const canvas = scene.element.querySelector('canvas');
      if (canvas && window._cakeAnimationCleanup) {
        window._cakeAnimationCleanup();
        window._cakeAnimationCleanup = null;
      }

      /* Reset cake blow state */
      if (canvas) {
        canvas.dataset.blown = 'false';
        canvas.dataset.initialized = 'false';
      }

      /* Reset candle hint text */
      const hint = document.querySelector('.candle-hint');
      if (hint) {
        hint.innerHTML = '<p>Tap the candles or press and hold to blow them out</p>';
      }

      /* Clean up generated particles */
      scene.element.querySelectorAll('.particle, .balloon, .smoke-wisp, .ambient-heart, .ambient-petal, .ambient-sparkle, .firework, .light-ray').forEach(el => el.remove());

      /* Remove pulse ring class */
      const btn = scene.element.querySelector('.pulse-ring');
      if (btn) btn.classList.remove('pulse-ring');
    });

    /* Reset all animations */
    const letter = document.getElementById('letter');
    if (letter) {
      letter.classList.remove('letter--revealed');
    }

    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.classList.remove('timeline--visible');
    }

    const envelope = document.getElementById('envelope');
    if (envelope) {
      envelope.classList.remove('envelope--open');
      envelope.style.opacity = '';
      envelope.style.transform = '';
      envelope.style.filter = '';
      const light = envelope.querySelector('.envelope-light');
      if (light) {
        light.style.display = 'none';
      }
    }

    const giftBox = document.getElementById('gift-box');
    if (giftBox) {
      giftBox.classList.remove('gift-box--open');
    }

    /* Reset to scene 1 */
    this.currentScene = 1;
    const scene1 = document.getElementById('scene-1');
    if (scene1) {
      scene1.classList.add('scene--active');
    }

    /* Reset polaroid active state */
    document.querySelectorAll('.polaroid').forEach(p => {
      p.classList.remove('polaroid--active');
    });

    /* Reset timeline markers display */

    /* Clean up light rays */
    const lightRays = document.getElementById('light-rays');
    if (lightRays) {
      lightRays.innerHTML = '';
    }

    this.updateProgress();

    /* Restart music */
    if (window.audioSystem) {
      window.audioSystem.stopMusic();
      setTimeout(() => window.audioSystem.playMusic(), 500);
    }

    /* Re-add pulse ring to button */
    const openBtn = document.getElementById('open-envelope-btn');
    if (openBtn) {
      openBtn.classList.add('pulse-ring');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SceneManager };
}
