/* Scene transition manager — GSAP-powered cinematic experience */
class SceneManager {
  constructor() {
    this.currentScene = 1;
    this.totalScenes = 7;
    this.scenes = [];
    this.progressBar = null;
    this.gsap = window.gsap || null;
    this.loadingScreen = null;

    this.init();
  }

  init() {
    this.progressBar = document.getElementById('progress-bar');
    this.loadingScreen = document.getElementById('loading-screen');

    for (let i = 1; i <= this.totalScenes + 1; i++) {
      const scene = document.getElementById(`scene-${i}`) || document.getElementById(i === 8 ? 'final' : `scene-${i}`);
      if (scene) {
        this.scenes.push({ element: scene, id: i });
      }
    }

    this.bindNavigation();
    this.initLoadingScreen();
    this.setupButtonEffects();
  }

  initLoadingScreen() {
    const loadingText = this.loadingScreen?.querySelector('.loading-text');
    const loadingProgress = this.loadingScreen?.querySelector('.loading-progress');

    if (!this.loadingScreen) return;

    const messages = ['Creating magic...', 'Polishing the details...', 'Almost there...'];
    let msgIndex = 0;

    const msgInterval = setInterval(() => {
      if (loadingText) {
        loadingText.textContent = messages[msgIndex % messages.length];
        msgIndex++;
      }
    }, 800);

    setTimeout(() => {
      if (this.gsap) {
        this.gsap.to(this.loadingScreen, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            this.loadingScreen.style.display = 'none';
          }
        });
      } else {
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => { this.loadingScreen.style.display = 'none'; }, 800);
      }
      clearInterval(msgInterval);
    }, 2500);
  }

  setupButtonEffects() {
    document.querySelectorAll('.btn').forEach(btn => {
      Animations.setupButtonEffects(btn);
    });
  }

  bindNavigation() {
    /* Scene 1 -> 2: Envelope open */
    const openEnvelopeBtn = document.getElementById('open-envelope-btn');
    const envelope = document.getElementById('envelope');
    const envelopeLight = envelope?.querySelector('.envelope-light');

    const handleEnvelopeOpen = async (e) => {
      e.stopPropagation();
      if (envelope.classList.contains('envelope--open')) return;

      envelope.classList.add('envelope--open');

      if (window.audioSystem) {
        await window.audioSystem.unlock();
        window.audioSystem.playWhoosh();
      }
      window.Gestures?.vibrate([50, 30, 50]);

      /* GSAP animations for envelope opening */
      if (this.gsap && envelope) {
        this.gsap.timeline()
          .to(envelopeLight, { opacity: 1, duration: 0.6, ease: 'power2.out' })
          .fromTo('.envelope__seal', { scale: 1 }, { scale: 0, duration: 0.4, ease: 'back.in(1.7)', delay: 0.2 })
          .to('.envelope__seal', { opacity: 0, duration: 0.3 });

        /* Particle burst from seal */
        const seal = envelope.querySelector('.envelope__seal');
        setTimeout(() => {
          Animations.createParticleBurst(seal, '#d4af37', 20, envelope);
        }, 150);
      } else {
        Animations.createParticleBurst(envelope.querySelector('.envelope__seal'), '#d4af37', 15, envelope);
      }

      /* Transition to scene 2 */
      setTimeout(() => {
        this.goToScene(2);
      }, 1200);
    };

    if (openEnvelopeBtn) {
      openEnvelopeBtn.addEventListener('click', handleEnvelopeOpen);
    }
    if (envelope) {
      envelope.addEventListener('click', handleEnvelopeOpen);
    }

    /* Stagger text reveal on scene 1 */
    const introText = document.querySelector('#scene-1 .stagger-text');
    if (introText) {
      introText.classList.add('stagger-revealed');
    }

    /* Navigation buttons — scenes 2-7 */
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
          Animations.createParticleBurst(el, '#ff6ec4', 8, null);
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
          window.Gestures?.vibrate([80, 40, 80]);

          /* Fireworks + confetti */
          this.createFireworks(3);
          setTimeout(() => {
            Animations.createConfetti(
              window.innerWidth / 2,
              window.innerHeight / 2,
              120,
              null,
              ['#ff6ec4', '#ffd7a0', '#d4af37', '#4e9eff', '#39e683']
            );
          }, 200);

          /* Screen flash */
          Animations.screenFlash('rgba(255, 215, 160, 0.5)', 800);

          setTimeout(() => {
            this.goToScene('final');
          }, 1400);
        }
      });
    }

    /* Restart button */
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }
  }

  /* Cinematic scene transition */
  goToScene(sceneNum) {
    const fromScene = document.querySelector('.scene--active');
    if (fromScene) {
      fromScene.classList.remove('scene--active');
      fromScene.classList.add('scene--exiting');

      /* Clean up ambient particles from exiting scene */
      const sceneId = fromScene.id;
      const ambient = document.getElementById(`ambient-${sceneId}`);
      if (ambient) {
        ambient.innerHTML = '';
      }

      /* Clear canvas animation if needed */
      const canvas = fromScene.querySelector('canvas');
      if (canvas && window._cakeAnimationCleanup) {
        window._cakeAnimationCleanup();
        window._cakeAnimationCleanup = null;
        canvas.dataset.initialized = 'false';
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
        }, 300);

        /* Trigger scene-specific entrance animations */
        setTimeout(() => {
          this.triggerSceneAnimations(sceneNum);
        }, 400);
      }
    }, 900);
  }

  spawnAmbientParticles(sceneId) {
    const configMap = {
      'scene-2': { count: 30, density: 'heavy' },
      'scene-3': { count: 20, density: 'medium' },
      'scene-4': { count: 20, density: 'medium' },
      'scene-5': { count: 15, density: 'light' },
      'scene-6': { count: 25, density: 'medium' },
      'scene-7': { count: 35, density: 'heavy' },
      'final': { count: 50, density: 'heavy' }
    };

    const config = configMap[sceneId] || { count: 25, density: 'medium' };
    Animations.startAmbientSystem(`ambient-${sceneId}`, config.density);
  }

  triggerSceneAnimations(sceneNum) {
    switch (sceneNum) {
      case 2: this.animateScene2(); break;
      case 3: this.initCakeAnimation(); break;
      case 4: this.animateScene4(); break;
      case 5: this.animateScene5(); break;
      case 6: this.animateScene6(); break;
      case 7: this.animateScene7(); break;
      case 'final':
      case 8: this.animateFinal(); break;
    }
  }

  /* Scene 2: Birthday Reveal */
  animateScene2() {
    const title = document.querySelector('#scene-2 .reveal-text__title');
    const subtitle = document.querySelector('#scene-2 .reveal-text__subtitle');
    const nextBtn = document.getElementById('next-btn-2');

    if (this.gsap) {
      const tl = this.gsap.timeline();

      if (title) {
        tl.from(title, {
          opacity: 0,
          y: 40,
          rotation: -5,
          duration: 1.2,
          ease: 'back.out(1.7)'
        }, 0.3);
      }

      if (subtitle) {
        tl.from(subtitle, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out'
        }, 0.8);
      }

      if (nextBtn) {
        tl.from(nextBtn, {
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          ease: 'back.out(1.7)'
        }, 1.3);
      }

      /* Idle drift animation for balloons */
      const balloons = document.getElementById('balloons');
      if (balloons) {
        this.gsap.to(balloons, {
          y: '+=10',
          x: '+=5',
          duration: 2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }
    } else {
      /* Fallback animations */
      if (title) title.style.opacity = '1';
      if (subtitle) subtitle.style.opacity = '1';
      if (nextBtn) nextBtn.style.opacity = '1';
    }

    /* Create balloons */
    this.createBalloons();
  }

  createBalloons() {
    const balloonsContainer = document.getElementById('balloons');
    if (!balloonsContainer) return;

    const colors = ['#ff6ec4', '#ffd7a0', '#4e9eff', '#39e683', '#ff8a65', '#d4af37'];

    for (let i = 0; i < 12; i++) {
      const balloon = Animations.createElement('div', 'balloon');
      balloon.style.left = `${10 + Math.random() * 80}%`;
      balloon.style.top = `${20 + Math.random() * 60}%`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      balloon.style.background = `linear-gradient(145deg, ${color}, #fff4), radial-gradient(circle at 30% 30%, #fff9 0%, transparent 70%)`;
      balloon.style.setProperty('--float-time', `${4 + Math.random() * 3}s`);
      balloon.style.setProperty('--delay', `${Math.random() * 3}s`);
      balloonsContainer.appendChild(balloon);

      /* Continuous float drift */
      if (this.gsap) {
        this.gsap.to(balloon, {
          y: '+=' + (15 + Math.random() * 20),
          x: '+=' + (Math.random() - 0.5) * 20,
          repeat: -1,
          yoyo: true,
          duration: 4 + Math.random() * 3,
          ease: 'sine.inOut',
          delay: Math.random() * 2
        });
      }
    }
  }

  /* Scene 3: Interactive Cake */
  initCakeAnimation() {
    const canvas = document.getElementById('cake-canvas');
    if (!canvas || canvas.dataset.initialized === 'true') return;
    canvas.dataset.initialized = 'true';

    const ctx = canvas.getContext('2d');
    let candlesLit = true;
    let animationId = null;
    const centerX = canvas.width / 2;

    const drawCake = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cakeWidth = 150;
      const cakeHeight = 100;
      const cakeTop = 130;

      /* Ambient glow behind cake */
      const glow = ctx.createRadialGradient(centerX, cakeTop + cakeHeight / 2, 0, centerX, cakeTop + cakeHeight / 2, 200);
      glow.addColorStop(0, 'rgba(255, 215, 160, 0.15)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* Cake base — gradient with subtle texture */
      const gradient = ctx.createLinearGradient(centerX - cakeWidth / 2, 0, centerX + cakeWidth / 2, 0);
      gradient.addColorStop(0, '#fdcb6e');
      gradient.addColorStop(0.5, '#e74c3c');
      gradient.addColorStop(1, '#c0392b');
      ctx.fillStyle = gradient;

      /* Add texture */
      ctx.save();
      ctx.fillRect(centerX - cakeWidth / 2, cakeTop, cakeWidth, cakeHeight);
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - cakeWidth / 2, cakeTop, cakeWidth, cakeHeight);

      /* Frosting */
      ctx.fillStyle = '#ffd1ec';
      ctx.beginPath();
      ctx.ellipse(centerX, cakeTop, cakeWidth / 2 + 10, 18, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#ffb6c1';
      ctx.lineWidth = 2;
      ctx.stroke();

      /* Strawberries */
      for (let i = 0; i < 4; i++) {
        const sx = centerX - 30 + i * 20;
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
        { x: centerX - 48, y: cakeTop - 8 },
        { x: centerX - 16, y: cakeTop - 8 },
        { x: centerX + 16, y: cakeTop - 8 },
        { x: centerX + 48, y: cakeTop - 8 },
      ];

      candlePositions.forEach((pos, i) => {
        /* Candle body */
        const candleGrad = ctx.createLinearGradient(pos.x - 4, pos.y, pos.x + 4, pos.y);
        candleGrad.addColorStop(0, '#ff6ec4');
        candleGrad.addColorStop(1, '#e74c3c');
        ctx.fillStyle = candleGrad;
        ctx.fillRect(pos.x - 4, pos.y, 8, 28);

        /* Candle highlight */
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(pos.x - 3, pos.y, 3, 8);

        /* Wick */
        ctx.fillStyle = '#2c1a0a';
        ctx.fillRect(pos.x - 1, pos.y - 8, 2, 8);

        /* Flame */
        if (candlesLit) {
          const time = performance.now() * 0.004 + i * 2;
          const flicker = Math.sin(time) * 0.3 + Math.cos(time * 1.3) * 0.2 + 0.5;
          const flameHeight = 10 + flicker * 6;
          const flameWidth = 3 + flicker * 1.5;

          ctx.save();
          ctx.translate(pos.x, pos.y - 8);

          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 12 + flicker * 8;

          const flameGrad = ctx.createRadialGradient(0, -flameHeight / 2, 0, 0, -flameHeight / 2, flameWidth);
          flameGrad.addColorStop(0, '#fff8dc');
          flameGrad.addColorStop(0.4, '#ffd700');
          flameGrad.addColorStop(0.7, '#ffa500');
          flameGrad.addColorStop(1, 'rgba(255, 165, 0, 0)');

          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.ellipse(0, -flameHeight / 2, flameWidth, flameHeight, 0, 0, Math.PI * 2);
          ctx.fill();

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

      ctx.restore();
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
      window.Gestures?.vibrate([200, 50, 200]);

      const rect = canvas.getBoundingClientRect();
      const confettiX = rect.left + rect.width / 2;
      const confettiY = rect.top;

      /* Smoke wisps */
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const smoke = Animations.createElement('div', 'smoke-wisp');
          smoke.style.left = `${confettiX}px`;
          smoke.style.top = `${confettiY}px`;
          canvas.parentElement.appendChild(smoke);
          setTimeout(() => smoke.remove(), 4000);
        }, i * 150);
      }

      /* Ambient warmth fades */
      const glow = document.getElementById('cake-glow');
      if (this.gsap && glow) {
        this.gsap.to(glow, {
          background: 'radial-gradient(circle, rgba(255, 215, 160, 0.03) 0%, transparent 70%)',
          duration: 1,
          ease: 'power2.out'
        });
      }

      /* Confetti */
      setTimeout(() => {
        Animations.createConfetti(confettiX, confettiY, 100, canvas.parentElement);
        Animations.screenFlash('rgba(255, 215, 160, 0.3)', 500);
      }, 150);

      /* Update hint */
      setTimeout(() => {
        const hint = document.querySelector('.candle-hint');
        if (hint) {
          hint.innerHTML = '<p>🕯️ Candles blown out! 🎉</p>';
          Animations.staggerIn(hint, '*', 0.1);
        }
      }, 400);
    };

    canvas.addEventListener('click', blowCandles);
    window.Gestures?.onHold('#cake-canvas', blowCandles, 800);

    /* GSAP entrance animation for cake */
    setTimeout(() => {
      const cakeContainer = document.getElementById('cake-container');
      if (this.gsap && cakeContainer) {
        this.gsap.from(cakeContainer, {
          opacity: 0,
          y: 50,
          scale: 0.8,
          duration: 1.2,
          ease: 'back.out(1.7)'
        });
      }
    }, 100);
  }

  /* Scene 4: Gallery */
  animateScene4() {
    const polaroids = document.querySelectorAll('.polaroid');
    const title = document.querySelector('.gallery-title');

    if (this.gsap) {
      if (title) {
        this.gsap.from(title, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: 'power3.out'
        });
      }

      polaroids.forEach((p, i) => {
        /* Staggered entrance with 3D rotation */
        this.gsap.from(p, {
          opacity: 0,
          rotation: (i % 2 === 0 ? -1 : 1) * (10 + i * 2),
          scale: 0.8,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.3 + i * 0.15
        });
      });

      /* Hover tilt effect */
      polaroids.forEach(p => {
        p.addEventListener('mouseenter', () => {
          this.gsap.to(p, {
            rotation: 0,
            scale: 1.05,
            z: 50,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        p.addEventListener('mouseleave', () => {
          const baseRot = parseFloat(p.style.getPropertyValue('--rotation')) || 0;
          this.gsap.to(p, {
            rotation: baseRot,
            scale: 1,
            z: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
        });
      });
    }

    /* Activate first polaroid */
    if (polaroids[0]) {
      polaroids[0].classList.add('polaroid--active');
    }
  }

  /* Scene 5: Letter */
  animateScene5() {
    const letter = document.getElementById('letter');
    const seal = document.getElementById('letter-seal');
    const content = document.getElementById('letter-content');
    const titleHint = document.querySelector('#scene-5 .stagger-text');

    if (this.gsap) {
      /* Letter entrance */
      this.gsap.from(letter, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 1,
        ease: 'power3.out'
      });

      /* Seal animation */
      this.gsap.from(seal, {
        scale: 0,
        rotation: 360,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
        delay: 0.5
      });

      /* Seal hover effect */
      seal.addEventListener('mouseenter', () => {
        this.gsap.to(seal, {
          scale: 1.1,
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.7)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      seal.addEventListener('mouseleave', () => {
        this.gsap.to(seal, {
          scale: 1,
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
          duration: 0.3
        });
      });

      /* Reveal letter content with seal break */
      const reveal = () => {
        if (window.audioSystem) window.audioSystem.playChime();

        this.gsap.timeline()
          .to(seal, { scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(1.7)' })
          .to(content, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2');

        /* Sequential letter line reveal */
        const lines = content.querySelectorAll('.letter__line');
        lines.forEach((line, i) => {
          line.style.opacity = '0';
          line.style.transform = 'translateY(20px)';
          setTimeout(() => {
            line.style.transition = 'all 0.6s ease';
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
          }, 300 + i * 120);
        });
      };

      seal.addEventListener('click', reveal);
      letter.classList.add('letter--revealed');

      /* Also reveal on button click for mobile */
      const nextBtn = document.getElementById('next-btn-5');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (!seal.style.opacity || parseFloat(seal.style.opacity) !== 0) {
            reveal();
          }
        }, { once: false });
      }
    } else {
      letter.classList.add('letter--revealed');
      if (seal) seal.style.opacity = '0';
      if (content) content.style.opacity = '1';
    }
  }

  /* Scene 6: Timeline */
  animateScene6() {
    const timeline = document.getElementById('timeline');
    const title = document.querySelector('.timeline-title');

    if (this.gsap) {
      if (title) {
        this.gsap.from(title, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: 'power3.out'
        });
      }

      this.gsap.from(timeline, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      });

      /* Staggered timeline item reveal */
      const items = timeline.querySelectorAll('.timeline-item');
      items.forEach((item, i) => {
        const marker = item.querySelector('.timeline__marker');
        const content = item.querySelector('.timeline__content');

        const tl = this.gsap.timeline({ delay: 0.3 + i * 0.15 });
        tl.to(timeline, {}, 0); /* sync */

        if (marker) {
          tl.from(marker, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)'
          });
        }
        if (content) {
          tl.from(content, {
            opacity: 0,
            x: i % 2 === 0 ? -30 : 30,
            duration: 0.6,
            ease: 'power3.out'
          }, '-=0.3');
        }
      });
    } else {
      timeline.classList.add('timeline--visible');
    }
  }

  /* Scene 7: Gift Box */
  animateScene7() {
    const giftBox = document.getElementById('gift-box');
    const title = document.querySelector('#scene-7 .final-hint');

    if (this.gsap && giftBox) {
      /* Gift box entrance */
      this.gsap.from(giftBox, {
        opacity: 0,
        scale: 0.5,
        rotation: -180,
        duration: 1.5,
        ease: 'back.out(1.7)'
      });

      /* Idle: subtle floating */
      this.gsap.to(giftBox, {
        y: '+=10',
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

      /* Bow bounce idle */
      const bow = giftBox.querySelector('.gift-box__bow');
      if (bow) {
        this.gsap.to(bow, {
          y: '+=5',
          rotation: 2,
          duration: 2.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }
    }

    if (title) {
      Animations.staggerIn(title, '*', 0.1);
    }

    /* Ambient sparkles */
    setTimeout(() => {
      const fireworks = document.getElementById('fireworks');
      if (fireworks) {
        for (let i = 0; i < 15; i++) {
          setTimeout(() => {
            const sparkle = Animations.createElement('div', 'sparkle');
            sparkle.style.left = `${15 + Math.random() * 70}%`;
            sparkle.style.top = `${10 + Math.random() * 70}%`;
            sparkle.style.width = '6px';
            sparkle.style.height = '6px';
            sparkle.style.background = ['#ffd7a0', '#ff6ec4', '#4e9eff', '#ffffff'][Math.floor(Math.random() * 4)];
            sparkle.style.borderRadius = '50%';
            sparkle.style.boxShadow = '0 0 10px currentColor';
            sparkle.style.position = 'absolute';
            fireworks.appendChild(sparkle);

            if (this.gsap) {
              this.gsap.to(sparkle, {
                opacity: 0,
                scale: 0,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => sparkle.remove()
              });
            } else {
              setTimeout(() => sparkle.remove(), 800);
            }
          }, i * 200);
        }
      }
    }, 500);
  }

  /* Final Scene */
  animateFinal() {
    const title = document.getElementById('final-title');
    const subtitle = document.querySelector('.final-message__subtitle');
    const heart = document.getElementById('final-heart');
    const restartBtn = document.getElementById('restart-btn');

    if (window.audioSystem) {
      window.audioSystem.playChime();
    }

    if (this.gsap) {
      const tl = this.gsap.timeline();

      if (title) {
        tl.from(title, {
          opacity: 0,
          y: 50,
          duration: 1.2,
          ease: 'back.out(1.7)'
        }, 0.5);
      }

      if (subtitle) {
        tl.from(subtitle, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out'
        }, 1.2);
      }

      /* Light rays */
      Animations.createLightRays('light-rays', 12);
      const rays = document.querySelectorAll('.light-ray');
      rays.forEach((ray, i) => {
        tl.to(ray, {
          opacity: 0.5 + Math.random() * 0.2,
          duration: 0.8,
          ease: 'power2.out'
        }, 0.5 + i * 0.05);
      });

      /* Heart reveal with beat */
      if (heart) {
        tl.to(heart, {
          opacity: 1,
          scale: 1.2,
          duration: 0.6,
          ease: 'back.out(1.7)',
          onStart: () => { heart.style.display = 'block'; }
        }, 1.8);

        this.gsap.to(heart, {
          scale: 1.3,
          duration: 0.6,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true
        }, 2.5);
      }

      /* Restart button */
      if (restartBtn) {
        tl.from(restartBtn, {
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          ease: 'back.out(1.7)'
        }, 2);
      }
    } else {
      /* Fallback */
      if (title) title.style.opacity = '1';
      if (subtitle) subtitle.style.opacity = '1';
      if (heart) heart.style.display = 'block';
      Animations.createLightRays('light-rays', 12);
    }

    /* Confetti rain */
    setTimeout(() => {
      Animations.startConfettiRain(null, 'heavy');
    }, 1000);

    /* Floating hearts */
    setTimeout(() => {
      if (heart && heart.style.display !== 'none') {
        heart.style.display = 'block';
        const hearts = heart.querySelectorAll('.floating-heart');
        if (this.gsap) {
          hearts.forEach((h, i) => {
            this.gsap.to(h, {
              y: '-+=30',
              opacity: 0.3,
              duration: 4,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              delay: i * 0.5
            });
          });
        }
      }
    }, 500);

    /* Ambient sparkles */
    this.startFinalSparkles();
  }

  startFinalSparkles() {
    const container = document.getElementById('ambient-final');
    if (!container || this.prefersReducedMotion) return;

    const createSparkle = () => {
      const sparkle = Animations.createElement('div', 'ambient-sparkle');
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.width = `${4 + Math.random() * 6}px`;
      sparkle.style.height = `${4 + Math.random() * 6}px`;
      sparkle.style.background = 'rgba(255, 255, 255, 0.8)';
      sparkle.style.borderRadius = '50%';
      sparkle.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
      sparkle.style.position = 'absolute';
      container.appendChild(sparkle);

      if (this.gsap) {
        this.gsap.to(sparkle, {
          opacity: 0,
          scale: 0,
          duration: 1.5,
          ease: 'power2.out',
          onComplete: () => sparkle.remove()
        });
      }
    };

    setInterval(createSparkle, 200);
  }

  /* Fireworks effect */
  createFireworks(count = 4) {
    if (this.prefersReducedMotion) return;

    const fireworks = document.getElementById('fireworks');
    if (!fireworks) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const color = ['#ffd7a0', '#ff6ec4', '#4e9eff', '#39e683', '#fff7'][Math.floor(Math.random() * 5)];
        const centerX = 100 + Math.random() * 150;
        const centerY = 80 + Math.random() * 80;

        for (let j = 0; j < 35; j++) {
          const fw = Animations.createElement('div', 'firework');
          fw.style.left = `${centerX}px`;
          fw.style.top = `${centerY}px`;
          fw.style.setProperty('--color', color);

          const angle = (j / 35) * Math.PI * 2;
          const distance = 40 + Math.random() * 100;
          fw.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
          fw.style.setProperty('--ty', `${Math.sin(angle) * distance + 30}px`);
          fw.style.animationDuration = `${0.8 + Math.random() * 0.4}s`;

          fireworks.appendChild(fw);
          setTimeout(() => fw.remove(), 1500);
        }
      }, i * 300);
    }
  }

  /* Confetti rain */
  createConfettiRain() {
    if (!this.gsap) {
      /* Fallback */
      const body = document.body;
      const colors = ['#ff6ec4', '#ffd7a0', '#4e9eff', '#39e683', '#fff7', '#ff8a65'];

      for (let i = 0; i < 80; i++) {
        setTimeout(() => {
          const confetti = Animations.createElement('div', 'confetti-piece');
          confetti.style.left = `${5 + Math.random() * 90}%`;
          confetti.style.top = '-30px';
          confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
          confetti.style.width = `${6 + Math.random() * 6}px`;
          confetti.style.height = `${10 + Math.random() * 10}px`;

          const angle = Math.random() * Math.PI * 2;
          const distance = 100 + Math.random() * 200;
          confetti.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
          confetti.style.setProperty('--ty', `${Math.sin(angle) * distance + 300}px`);
          confetti.style.animationDuration = `${2 + Math.random() * 2}s`;

          body.appendChild(confetti);
          setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
      }
      return;
    }

    const colors = ['#ff6ec4', '#ffd7a0', '#4e9eff', '#39e683', '#fff7', '#ff8a65'];
    const duration = 3 + Math.random() * 2;

    for (let i = 0; i < 120; i++) {
      setTimeout(() => {
        const confetti = Animations.createElement('div', 'confetti-piece');
        confetti.style.left = `${5 + Math.random() * 90}%`;
        confetti.style.top = '-30px';
        confetti.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        confetti.style.width = `${6 + Math.random() * 8}px`;
        confetti.style.height = `${10 + Math.random() * 12}px`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        document.body.appendChild(confetti);

        const targetX = (Math.random() - 0.5) * 100;
        const targetY = window.innerHeight + 200;

        this.gsap.to(confetti, {
          y: targetY,
          x: targetX,
          rotation: Math.random() * 360,
          opacity: 0,
          duration: duration,
          ease: 'sine.in',
          onComplete: () => confetti.remove()
        });
      }, i * 30);
    }
  }

  updateProgress() {
    if (!this.progressBar) return;
    const progress = (this.currentScene / this.totalScenes) * 100;
    if (this.gsap) {
      this.gsap.to(this.progressBar, {
        scaleX: progress / 100,
        duration: 0.8,
        ease: 'power2.out'
      });
    } else {
      this.progressBar.style.scale = `${progress / 100} 1`;
    }
  }

  restart() {
    /* Clean up all scenes */
    this.scenes.forEach(scene => {
      scene.element.classList.remove('scene--active', 'scene--exiting');
      if (this.gsap) {
        this.gsap.set(scene.element, { clear: true });
      }

      /* Clean up canvas */
      const canvas = scene.element.querySelector('canvas');
      if (canvas && window._cakeAnimationCleanup) {
        window._cakeAnimationCleanup();
        window._cakeAnimationCleanup = null;
        canvas.dataset.initialized = 'false';
        canvas.dataset.blown = 'false';
      }

      /* Reset candle hint */
      const hint = scene.element.querySelector('.candle-hint');
      if (hint) {
        hint.innerHTML = '<p>Tap the candles or press and hold to blow them out</p>';
      }

      /* Clean up generated elements */
      scene.element.querySelectorAll('.particle, .balloon, .smoke-wisp, .ambient-particle, .firework, .light-ray, .confetti-piece, .sparkle, .screen-flash').forEach(el => el.remove());

      /* Clear ambient containers */
      const ambient = scene.element.closest('.app')?.querySelector(`#ambient-${scene.element.id}`);
      if (ambient) ambient.innerHTML = '';
    });

    /* Reset all states */
    const letter = document.getElementById('letter');
    if (letter) {
      letter.classList.remove('letter--revealed');
      letter.style.opacity = '';
      letter.style.transform = '';
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
        light.style.opacity = '0';
      }
      const seal = envelope.querySelector('.envelope__seal');
      if (seal) {
        seal.style.opacity = '';
        seal.style.transform = '';
        seal.style.scale = '';
      }
    }

    const giftBox = document.getElementById('gift-box');
    if (giftBox) {
      giftBox.classList.remove('gift-box--open');
      if (this.gsap) {
        this.gsap.set(giftBox, { clear: true });
      }
    }

    /* Reset to scene 1 */
    this.currentScene = 1;
    const scene1 = document.getElementById('scene-1');
    if (scene1) {
      scene1.classList.add('scene--active');
      const introText = scene1.querySelector('.stagger-text');
      if (introText) introText.classList.add('stagger-revealed');
    }

    /* Reset polaroids */
    document.querySelectorAll('.polaroid').forEach(p => {
      p.classList.remove('polaroid--active');
    });

    /* Reset light rays */
    const lightRays = document.getElementById('light-rays');
    if (lightRays) lightRays.innerHTML = '';

    /* Reset heart display */
    const finalHeart = document.getElementById('final-heart');
    if (finalHeart) finalHeart.style.display = 'none';

    this.updateProgress();

    /* Restart music */
    if (window.audioSystem) {
      window.audioSystem.stopMusic();
      setTimeout(() => window.audioSystem.playMusic(), 500);
    }

    /* Re-add pulse ring to button */
    const openBtn = document.getElementById('open-envelope-btn');
    if (openBtn) openBtn.classList.add('pulse-ring');

    /* Respawn ambient particles */
    setTimeout(() => {
      this.spawnAmbientParticles('scene-1');
    }, 500);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SceneManager };
}
