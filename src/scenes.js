/* Scene transition management */
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
      const scene = document.getElementById(`scene-${i}`);
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
      envelope.classList.add('envelope--open');
      if (window.audioSystem) {
        await window.audioSystem.unlock();
        window.audioSystem.playWhoosh();
        window.Gestures.vibrate([50, 30, 50]);
      }
      setTimeout(() => {
        envelope.style.opacity = '0';
        envelope.style.transform = 'scale(0.5)';
        setTimeout(() => {
          this.goToScene(2);
        }, 500);
      }, 800);
    };

    if (openEnvelopeBtn) {
      openEnvelopeBtn.addEventListener('click', handleEnvelopeOpen);
    }
    if (envelope) {
      envelope.addEventListener('click', handleEnvelopeOpen);
    }

    /* Scene 2 -> 3 */
    const nextBtn2 = document.getElementById('next-btn-2');
    if (nextBtn2) {
      nextBtn2.addEventListener('click', () => {
        window.audioSystem.playClick();
        this.goToScene(3);
      });
    }

    /* Scene 3 -> 4 */
    const nextBtn3 = document.getElementById('next-btn-3');
    if (nextBtn3) {
      nextBtn3.addEventListener('click', () => {
        window.audioSystem.playClick();
        this.goToScene(4);
      });
    }

    /* Scene 4 -> 5 */
    const nextBtn4 = document.getElementById('next-btn-4');
    if (nextBtn4) {
      nextBtn4.addEventListener('click', () => {
        window.audioSystem.playClick();
        this.goToScene(5);
      });
    }

    /* Scene 5 -> 6 */
    const nextBtn5 = document.getElementById('next-btn-5');
    if (nextBtn5) {
      nextBtn5.addEventListener('click', () => {
        window.audioSystem.playClick();
        this.goToScene(6);
      });
    }

    /* Scene 6 -> 7 */
    const nextBtn6 = document.getElementById('next-btn-6');
    if (nextBtn6) {
      nextBtn6.addEventListener('click', () => {
        window.audioSystem.playClick();
        this.goToScene(7);
      });
    }

    /* Scene 7 -> Final */
    const giftBox = document.getElementById('gift-box');
    if (giftBox) {
      giftBox.addEventListener('click', () => {
        if (!giftBox.classList.contains('gift-box--open')) {
          giftBox.classList.add('gift-box--open');
          window.audioSystem.playPop();
          window.Gestures.vibrate([50, 30, 50]);
          this.createFireworks();
          setTimeout(() => {
            this.goToScene('final');
          }, 1200);
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
      }
    }, 600);

    /* Trigger scene-specific animations after transition */
    setTimeout(() => {
      this.triggerSceneAnimations(sceneNum);
    }, 800);
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
      const colors = ['#ff6ec4', '#ffd700', '#4e9eff', '#39e683', '#ff8a65'];
      for (let i = 0; i < 12; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = `${10 + Math.random() * 80}%`;
        balloon.style.top = `${20 + Math.random() * 60}%`;
        balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.setProperty('--float-time', `${3 + Math.random() * 4}s`);
        balloon.style.setProperty('--delay', `${Math.random() * 2}s`);
        balloonsContainer.appendChild(balloon);
      }
    }

    if (particlesContainer) {
      const particles = [];
      for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 4 + Math.random() * 8;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        const colors = ['#ffd700', '#ff6ec4', '#ffffff'];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`);
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
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / canvas.width;

    let candlesLit = true;
    let flameIntensity = 0;
    let animationId = null;

    const drawCake = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;

      /* Cake base */
      const cakeWidth = 120;
      const cakeHeight = 80;
      const cakeTop = 120;

      const gradient = ctx.createLinearGradient(centerX - cakeWidth / 2, 0, centerX + cakeWidth / 2, 0);
      gradient.addColorStop(0, '#fdcb6e');
      gradient.addColorStop(1, '#e74c3c');
      ctx.fillStyle = gradient;
      ctx.fillRect(centerX - cakeWidth / 2, cakeTop, cakeWidth, cakeHeight);

      /* Cake border */
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - cakeWidth / 2, cakeTop, cakeWidth, cakeHeight);

      /* Frosting */
      ctx.fillStyle = '#ffd1ec';
      ctx.beginPath();
      ctx.ellipse(centerX, cakeTop, cakeWidth / 2 + 8, 14, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#ffb6c1';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* Candles */
      const candlePositions = [
        { x: centerX - 40, y: cakeTop - 8 },
        { x: centerX - 13, y: cakeTop - 8 },
        { x: centerX + 13, y: cakeTop - 8 },
        { x: centerX + 40, y: cakeTop - 8 },
      ];

      candlePositions.forEach((pos, i) => {
        /* Candle */
        ctx.fillStyle = i % 2 === 0 ? '#ff6ec4' : '#4e9eff';
        ctx.fillRect(pos.x - 4, pos.y, 8, 24);

        /* Highlight */
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(pos.x - 3, pos.y, 3, 6);

        /* Flame */
        if (candlesLit) {
          flameIntensity = 1;
          const flameHeight = 10 + Math.sin(performance.now() * 0.02 + i) * 3;

          ctx.save();
          ctx.translate(pos.x, pos.y - 2);

          const flameGrad = ctx.createRadialGradient(0, 0, 0, 0, flameHeight, 5);
          flameGrad.addColorStop(0, '#ffd700');
          flameGrad.addColorStop(0.5, '#ffa500');
          flameGrad.addColorStop(1, 'rgba(255, 165, 0, 0)');

          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.ellipse(0, -flameHeight / 2, 3, flameHeight, 0, 0, Math.PI * 2);
          ctx.fill();

          /* Glow */
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(0, -flameHeight / 2 - 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.restore();
        }
      });

      /* Plate */
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(centerX - 80, cakeTop + cakeHeight, 160, 12);
      ctx.fillStyle = '#b0b0b0';
      ctx.fillRect(centerX - 80, cakeTop + cakeHeight + 12, 160, 6);
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
      window.audioSystem.playCandleBlow();
      window.Gestures.vibrate([100, 50, 100]);
      const rect = canvas.getBoundingClientRect();
      const parentRect = canvas.parentElement.getBoundingClientRect();
      window.Animations.createConfetti(
        rect.left - parentRect.left + rect.width / 2, 
        rect.top - parentRect.top + rect.height / 2, 
        80, 
        canvas.parentElement
      );
      setTimeout(() => {
        const hint = document.querySelector('.candle-hint');
        if (hint) {
          hint.innerHTML = '<p>🕯️ Candles blown out! 🎉</p>';
        }
      }, 500);
    };

    canvas.addEventListener('click', blowCandles);

    window.Gestures.onHold('#cake-canvas', blowCandles, 800);

    /* Store reference for cleanup */
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
  }

  animateScene5() {
    const letter = document.getElementById('letter');
    if (letter) {
      letter.classList.add('letter--revealed');
    }

    /* Play the reveal animation with a subtle delay */
    setTimeout(() => {
      const lines = document.querySelectorAll('.letter__line');
      lines.forEach((line, i) => {
        line.style.transitionDelay = `${i * 0.15}s`;
      });
    }, 300);

    window.audioSystem.playChime();
  }

  animateScene6() {
    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.classList.add('timeline--visible');
      setTimeout(() => {
        timeline.querySelectorAll('.timeline-item').forEach((item, i) => {
          item.style.transitionDelay = `${i * 0.15}s`;
        });
      }, 300);
    }
  }

  animateScene7() {
    const fireworks = document.getElementById('fireworks');
    if (!fireworks) return;

    /* Create floating sparkle effect */
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.left = `${20 + Math.random() * 60}%`;
        sparkle.style.top = `${20 + Math.random() * 60}%`;
        sparkle.style.width = '8px';
        sparkle.style.height = '8px';
        sparkle.style.background = ['#ffd700', '#ff6ec4', '#4e9eff'][Math.floor(Math.random() * 3)];
        sparkle.style.borderRadius = '50%';
        sparkle.style.boxShadow = '0 0 12px currentColor';
        sparkle.style.animation = 'sparkle 1.5s ease-in-out forwards';
        fireworks.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1500);
      }, i * 200);
    }
  }

  animateFinal() {
    window.audioSystem.playChime();
    this.createConfettiRain();
    setTimeout(() => {
      window.Animations.createConfetti(
        window.innerWidth / 2,
        100,
        100
      );
    }, 500);
  }

  /* Create fireworks on gift box open */
  createFireworks() {
    const fireworks = document.getElementById('fireworks');
    if (!fireworks) return;

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const color = ['#ffd700', '#ff6ec4', '#4e9eff', '#39e683'][Math.floor(Math.random() * 4)];
        const startX = 50 + Math.random() * 200;
        const startY = 50 + Math.random() * 100;

        for (let j = 0; j < 20; j++) {
          const fw = document.createElement('div');
          fw.className = 'firework';
          fw.style.left = `${startX}px`;
          fw.style.top = `${startY}px`;
          fw.style.setProperty('--color', color);

          const angle = (j / 20) * Math.PI * 2;
          const distance = 50 + Math.random() * 50;
          fw.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
          fw.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

          fireworks.appendChild(fw);
          setTimeout(() => fw.remove(), 1200);
        }
      }, i * 400);
    }
  }

  /* Confetti rain for final scene */
  createConfettiRain() {
    const body = document.body;
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const colors = ['#ff6ec4', '#ffd700', '#4e9eff', '#39e683', '#ff8a65'];
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = `${10 + Math.random() * 90}%`;
        confetti.style.top = '-20px';
        confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        confetti.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        confetti.style.setProperty('--ty', `${Math.sin(angle) * distance + 300}px`);
        confetti.style.animationDuration = `${2 + Math.random() * 1}s`;
        confetti.style.width = `${6 + Math.random() * 6}px`;
        confetti.style.height = `${10 + Math.random() * 10}px`;
        body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 30);
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
      scene.element.querySelectorAll('.particle, .balloon').forEach(el => el.remove());
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

    this.updateProgress();

    /* Restart music */
    if (window.audioSystem) {
      window.audioSystem.stopMusic();
      setTimeout(() => window.audioSystem.playMusic(), 500);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SceneManager };
}
