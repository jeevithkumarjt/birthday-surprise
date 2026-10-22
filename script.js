/* ============================================
   PREMIUM CINEMATIC BIRTHDAY - SCRIPT
   ============================================ */

// Global State
let currentScene = 1;
const totalScenes = 9;
let revealedMemories = 0;
let isMusicPlaying = false;
let audioContext = null;
let oscillator = null;

// ============================================
// PARTICLE CANVAS
// ============================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, color, size, speedX, speedY, life, type) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.life = life;
        this.maxLife = life;
        this.type = type || 'circle';
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.opacity = this.life / this.maxLife;
        this.rotation += this.rotationSpeed;

        if (this.type === 'heart') {
            this.speedY -= 0.02;
        }
        if (this.type === 'sparkle') {
            this.size = this.maxLife * 0.05 * Math.sin(this.life * 0.1);
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.type === 'heart') {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size * 4}px Arial`;
            ctx.fillText('❤', 0, 0);
        } else if (this.type === 'sparkle') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.moveTo(0, 0);
                ctx.lineTo(this.size * 0.3, this.size);
                ctx.lineTo(0, this.size * 0.3);
                ctx.lineTo(-this.size * 0.3, this.size);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'confetti') {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        }

        ctx.restore();
    }
}

function createParticles(x, y, count, colors, type, speed, life, size) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const spd = (Math.random() * speed) + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const sz = size || Math.random() * 4 + 2;
        const lt = life || 120;

        particles.push(new Particle(
            x, y, color, sz,
            Math.cos(angle) * spd,
            Math.sin(angle) * spd,
            lt, type || 'circle'
        ));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Ambient particles
function createAmbientParticles() {
    if (particles.length < 30) {
        const x = Math.random() * canvas.width;
        const y = canvas.height + 10;
        const colors = ['#ffd700', '#ff6b9d', '#a855f7', '#3b82f6', '#ec4899'];
        particles.push(new Particle(
            x, y, colors[Math.floor(Math.random() * colors.length)],
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 0.5,
            -(Math.random() * 1 + 0.5),
            300, 'circle'
        ));
    }
    requestAnimationFrame(createAmbientParticles);
}
createAmbientParticles();

// ============================================
// CONFETTI SYSTEM
// ============================================
function launchConfetti(x, y, count) {
    const colors = ['#ffd700', '#ff6b9d', '#a855f7', '#3b82f6', '#ec4899', '#ff4500', '#00ff88'];
    for (let i = 0; i < (count || 50); i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-blast';
        confetti.style.left = (x || window.innerWidth / 2) + 'px';
        confetti.style.top = (y || window.innerHeight / 2) + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        document.body.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 300 + 100;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;

        gsap.to(confetti, {
            x: destX,
            y: destY + 300,
            rotation: Math.random() * 720,
            opacity: 0,
            duration: 2 + Math.random(),
            ease: 'power2.out',
            onComplete: () => confetti.remove()
        });
    }
}

function launchConfettiRain(count) {
    const colors = ['#ffd700', '#ff6b9d', '#a855f7', '#3b82f6', '#ec4899', '#ff4500'];
    for (let i = 0; i < (count || 80); i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ============================================
// SPARKLE SYSTEM
// ============================================
function createSparkles(container, count) {
    for (let i = 0; i < (count || 20); i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 2 + 's';
            sparkle.style.animationDuration = (Math.random() * 1 + 1) + 's';
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 3000);
        }, i * 100);
    }
}

// ============================================
// SCENE TRANSITION
// ============================================
let isTransitioning = false;

function goToScene(sceneNum) {
    if (isTransitioning) return;
    if (String(currentScene) === String(sceneNum)) return;
    const current = document.getElementById('scene' + currentScene);
    const next = document.getElementById('scene' + sceneNum);
    if (!current || !next) return;

    isTransitioning = true;

    gsap.to(current, {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
        duration: 0.5,
        onComplete: () => {
            current.classList.remove('active');
            current.style.transform = '';
            current.style.filter = '';

            next.classList.add('active');
            next.classList.add('scene-transition');
            gsap.fromTo(next,
                { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
                {
                    opacity: 1, scale: 1, filter: 'blur(0px)',
                    duration: 0.6,
                    onComplete: () => {
                        next.classList.remove('scene-transition');
                        initScene(sceneNum);
                        isTransitioning = false;
                    }
                }
            );
        }
    });
    
    currentScene = sceneNum;

    // Safety: ensure transition lock is released even if animation callbacks fail
    setTimeout(() => { isTransitioning = false; }, 2000);
}

function initScene(num) {
    // Reset scene 1 state on replay
    if (num === 1) {
        const flap = document.getElementById('envelopeFlap');
        const letter = document.getElementById('envelopeLetter');
        if (flap) flap.classList.remove('open');
        if (letter) letter.classList.remove('show');
    }
    switch(num) {
        case 1: initScene1(); break;
        case 2: initScene2(); break;
        case 3: initScene3(); break;
        case 4: initScene4(); break;
        case 5: initScene5(); break;
        case 6: initScene6(); break;
        case 7: initScene7(); break;
        case 8: initScene8(); break;
        case 9: initScene9(); break;
    }
}

// ============================================
// SCENE 1 - ENVELOPE
// ============================================
let scene1Initialized = false;

function initScene1() {
    const flap = document.getElementById('envelopeFlap');
    const letter = document.getElementById('envelopeLetter');

    // Clone button to remove old listeners on replay
    if (scene1Initialized) {
        const oldBtn = document.getElementById('openEnvelope');
        if (oldBtn) {
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        }
    }
    scene1Initialized = true;

    const openBtn = document.getElementById('openEnvelope');

    openBtn.onclick = () => {
        openBtn.style.display = 'none';

        // Open envelope flap
        flap.classList.add('open');

        // Show letter
        setTimeout(() => {
            letter.classList.add('show');
        }, 400);

        // Sparkle explosion
        setTimeout(() => {
            createParticles(window.innerWidth / 2, window.innerHeight / 2, 60,
                ['#ffd700', '#ff6b9d', '#a855f7', '#fff', '#ec4899'],
                'sparkle', 8, 150, 6
            );
            launchConfettiRain(60);
        }, 1000);

        // Transition
        setTimeout(() => {
            goToScene(2);
        }, 2500);
    };

    // Animate envelope entrance
    gsap.from('.envelope-container', {
        y: 50, opacity: 0, duration: 1, ease: 'back.out(1.7)'
    });
}

// ============================================
// SCENE 2 - HAPPY BIRTHDAY
// ============================================
function initScene2() {
    const container = document.getElementById('balloonsContainer');
    container.innerHTML = '';

    const balloonColors = [
        'linear-gradient(135deg, #ff6b9d, #e91e63)',
        'linear-gradient(135deg, #a855f7, #7c3aed)',
        'linear-gradient(135deg, #3b82f6, #2563eb)',
        'linear-gradient(135deg, #ffd700, #f59e0b)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #ec4899, #be185d)',
        'linear-gradient(135deg, #f97316, #ea580c)',
        'linear-gradient(135deg, #06b6d4, #0891b2)',
    ];

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const totalBalloons = vw < 480 ? 12 : vw < 768 ? 18 : 30;
    const placed = [];

    const minDist = vw < 480 ? 70 : vw < 768 ? 80 : 90;

    function isTooClose(x, y) {
        for (const p of placed) {
            const dx = x - p.x;
            const dy = y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < minDist) return true;
        }
        return false;
    }

    for (let i = 0; i < totalBalloons; i++) {
        let x, y, attempts = 0;
        do {
            x = Math.random() * (vw - 80);
            y = Math.random() * (vh - 100);
            attempts++;
        } while (isTooClose(x, y) && attempts < 50);
        placed.push({ x, y });

        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.background = balloonColors[i % balloonColors.length];
        balloon.style.left = x + 'px';
        balloon.style.top = y + 'px';
        balloon.style.animationDelay = Math.random() * 3 + 's';
        balloon.style.animationDuration = (Math.random() * 2 + 3) + 's';
        balloon.style.transform = `scale(${Math.random() * 0.4 + 0.7})`;
        container.appendChild(balloon);
    }

    // Click any balloon -> blast ALL balloons smoothly
    let blasted = false;
    container.onclick = (e) => {
        const balloon = e.target.closest('.balloon');
        if (!balloon || blasted) return;
        blasted = true;

        const allBalloons = container.querySelectorAll('.balloon');
        allBalloons.forEach((b, idx) => {
            setTimeout(() => {
                b.classList.add('pop');
                const rect = b.getBoundingClientRect();
                launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
                createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 10,
                    ['#ffd700', '#ff6b9d', '#a855f7'],
                    'sparkle', 4, 70, 3
                );
            }, idx * 60);
        });

        // Grand blast from center after all popped
        setTimeout(() => {
            launchConfetti(vw / 2, vh / 2, 80);
            createParticles(vw / 2, vh / 2, 80,
                ['#ffd700', '#ff6b9d', '#a855f7', '#fff', '#ec4899'],
                'confetti', 8, 150, 5
            );
        }, allBalloons.length * 60 + 200);

        setTimeout(() => goToScene(3), allBalloons.length * 60 + 1000);
    };

    // Create sparkles
    const sparklesBg = document.getElementById('sparklesBg2');
    createSparkles(sparklesBg, 40);

    // Animate title
    gsap.from('.birthday-title', {
        y: -50, opacity: 0, duration: 1, ease: 'back.out(1.7)'
    });
    gsap.from('.birthday-quote', {
        y: 30, opacity: 0, duration: 1, delay: 0.5
    });
}

// ============================================
// SCENE 3 - BIRTHDAY CAKE
// ============================================
function initScene3() {
    const candle = document.getElementById('birthdayCandle');
    const makeWish = document.getElementById('makeWishText');
    const nextBtn = document.getElementById('nextFromCake');

    if (candle) candle.classList.remove('off');
    makeWish.classList.remove('show');
    nextBtn.style.display = 'none';

    const blowOutCandle = () => {
        if (!candle || candle.classList.contains('off')) return;
        candle.classList.add('off');

        setTimeout(() => {
            const cakeEl = document.getElementById('birthdayCake');
            if (cakeEl) {
                const cakeRect = cakeEl.getBoundingClientRect();
                createParticles(
                    cakeRect.left + cakeRect.width / 2,
                    cakeRect.top + cakeRect.height * 0.2,
                    50,
                    ['#ffd700', '#ff6b9d', '#a855f7', '#fff', '#ed641d'],
                    'sparkle', 7, 130, 4
                );
                launchConfettiRain(50);
            }
        }, 400);

        setTimeout(() => { makeWish.classList.add('show'); }, 800);

        setTimeout(() => {
            nextBtn.style.display = 'block';
            gsap.from(nextBtn, { y: 20, opacity: 0, duration: 0.5 });
        }, 1500);
    };

    if (candle) candle.onclick = blowOutCandle;

    nextBtn.onclick = () => goToScene(4);

    gsap.from('.birthday-cake', { y: 80, opacity: 0, duration: 1, ease: 'back.out(1.4)' });
    gsap.from('.layer-1', { y: 60, opacity: 0, duration: 0.8, delay: 0.3, ease: 'back.out(1.2)' });
    gsap.from('.layer-2', { y: 40, opacity: 0, duration: 0.8, delay: 0.5, ease: 'back.out(1.2)' });
    gsap.from('.layer-3', { y: 30, opacity: 0, duration: 0.8, delay: 0.7, ease: 'back.out(1.2)' });
    gsap.from('.candle', { y: 20, opacity: 0, duration: 0.6, delay: 1, ease: 'back.out(1.5)' });
    gsap.from('.cake-plate', { scaleX: 0, opacity: 0, duration: 0.6, delay: 1.2, ease: 'back.out(1.5)' });
}

// ============================================
// SCENE 4 - MEMORY GALLERY
// ============================================
function initScene4() {
    revealedMemories = 0;
    const grid = document.getElementById('memoryGrid');
    const nextBtn = document.getElementById('nextFromMemory');
    nextBtn.style.display = 'none';

    // Generate all 27 photo cards
    const photos = ['img/Media.jpg'];
    for (let i = 1; i <= 26; i++) {
        photos.push('img/Media (' + i + ').jpg');
    }

    grid.innerHTML = '';
    photos.forEach((src, i) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = i;
        card.innerHTML = '<div class="card-inner"><div class="card-front"><span class="lock-icon">🔒</span><p>Hidden Memory</p></div><div class="card-back"><img src="' + src + '" alt="Memory ' + (i + 1) + '"></div></div>';
        grid.appendChild(card);
    });

    const cards = document.querySelectorAll('.memory-card');

    // Create floating hearts
    const heartsContainer = document.getElementById('floatingHearts4');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = '❤';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heartsContainer.appendChild(heart);
    }

    // Animate cards entrance
    cards.forEach((card, i) => {
        gsap.to(card, {
            opacity: 1,
            delay: i * 0.08,
            duration: 0.4
        });
    });

    cards.forEach((card, i) => {
        card.onclick = () => {
            if (card.classList.contains('flipped')) return;
            if (i !== revealedMemories) return;

            card.classList.add('flipped');
            revealedMemories++;

            const rect = card.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20,
                ['#ffd700', '#ff6b9d', '#ec4899'],
                'sparkle', 5, 100, 4
            );
            launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);

             if (revealedMemories === cards.length) {
                setTimeout(() => {
                    nextBtn.style.display = 'block';
                    gsap.from(nextBtn, { y: 20, opacity: 0, duration: 0.5 });
                }, 500);
            }
        };
    });

    // Reveal All button
    const revealAllBtn = document.getElementById('revealAllBtn');
    revealAllBtn.classList.remove('done');
    revealAllBtn.onclick = () => {
        cards.forEach((card, i) => {
            setTimeout(() => {
                if (!card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    revealedMemories++;
                }
            }, i * 100);
        });
        revealAllBtn.classList.add('done');
        setTimeout(() => {
            nextBtn.style.display = 'block';
            gsap.from(nextBtn, { y: 20, opacity: 0, duration: 0.5 });
            launchConfettiRain(60);
        }, cards.length * 100 + 300);
    };

    nextBtn.onclick = () => goToScene(5);
}

// ============================================
// SCENE 5 - TIMELINE
// ============================================
function initScene5() {
    const items = document.querySelectorAll('.timeline-item');
    const line = document.getElementById('timelineLine');
    const nextBtn = document.getElementById('nextFromTimeline');

    // Reset
    items.forEach(item => item.classList.remove('revealed'));
    line.style.height = '0px';
    nextBtn.style.display = 'none';

    // Create floating hearts
    const heartsContainer = document.getElementById('floatingHearts5');
    heartsContainer.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = '❤';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heartsContainer.appendChild(heart);
    }

    // Animate timeline line
    const totalHeight = items.length * 100;
    gsap.to(line, {
        height: totalHeight + 'px',
        duration: 2,
        ease: 'none'
    });

    // Reveal items one by one
    items.forEach((item, i) => {
        setTimeout(() => {
            item.classList.add('revealed');
            // Create sparkles at card position
            const rect = item.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8,
                ['#ffd700', '#ff6b9d'],
                'sparkle', 3, 60, 3
            );
        }, 400 * (i + 1));
    });

    // Show next button after all revealed
    setTimeout(() => {
        nextBtn.style.display = 'block';
        gsap.from(nextBtn, { y: 20, opacity: 0, duration: 0.5 });
    }, 400 * items.length + 500);

    nextBtn.onclick = () => goToScene(6);
}

// ============================================
// SCENE 6 - LOVE LETTER (Typewriter Style)
// ============================================
let scene6TypingDone = false;

function initScene6() {
    const letterContent = document.getElementById('letterContent');
    const nextBtn = document.getElementById('nextFromQuotes');
    const skipBtn = document.getElementById('skipTypewriter');
    nextBtn.style.display = 'none';
    skipBtn.style.display = 'block';
    scene6TypingDone = false;

    // Create stars
    const starsBg = document.getElementById('starsBg6');
    starsBg.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        starsBg.appendChild(star);
    }

    const fullText = [
        'My dearest Trijal,',
        '',
        'Every moment with you feels like a beautiful dream.',
        '✿ Your smile lights up even the darkest of days.',
        'The way you laugh is my favorite sound in the world.',
        '✿ You have this incredible ability to make everyone around you feel loved.',
        'Watching you grow, achieve, and shine has been my greatest joy.',
        '✿ On this special day, I want you to know that you are deeply cherished.',
        'May this year bring you all the happiness your heart desires.',
        '✿ May your dreams come true and your soul always find peace.',
        'Happy Birthday, my love. I\'m so proud of you.',
        '✿ With all my love, always.'
    ];

    letterContent.innerHTML = '';

    const p = document.createElement('p');
    p.className = 'letter-text typewriter-text';
    letterContent.appendChild(p);

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    p.appendChild(cursor);

    const text = fullText.join('\n');
    let charIndex = 0;

    const container = document.querySelector('.letter-container');

    function typeNext() {
        if (scene6TypingDone) return;

        if (charIndex >= text.length) {
            finishTyping();
            return;
        }

        const char = text[charIndex];

        if (char === '\n') {
            const br = document.createElement('br');
            p.insertBefore(br, cursor);
            charIndex++;
            container.scrollTop = container.scrollHeight;
            setTimeout(typeNext, 80);
        } else {
            const span = document.createTextNode(char);
            p.insertBefore(span, cursor);
            charIndex++;
            container.scrollTop = container.scrollHeight;

            let delay = 30 + Math.random() * 20;
            if (char === '.' || char === ',') delay = 120 + Math.random() * 80;
            if (char === '✿') delay = 150;

            setTimeout(typeNext, delay);
        }
    }

    function finishTyping() {
        scene6TypingDone = true;
        p.innerHTML = text.replace(/\n/g, '<br>') + '<span class="typewriter-cursor done">|</span>';
        skipBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        gsap.from(nextBtn, { y: 20, opacity: 0, duration: 0.5 });
    }

    // Skip button - show full text instantly
    skipBtn.onclick = () => {
        finishTyping();
    };

    setTimeout(typeNext, 800);

    nextBtn.onclick = () => goToScene(7);
}

// ============================================
// SCENE 7 - MOOD
// ============================================
function initScene7() {
    const moodCards = document.querySelectorAll('.mood-card');
    const moodMessage = document.getElementById('moodMessage');
    const nextBtn = document.getElementById('nextFromMood');

    const messages = {
        love: "You make every moment special ❤️",
        happy: "Keep smiling, the world is brighter because of you. 😊",
        loved: "You are deeply loved. 🥰",
        hug: "Sending unlimited virtual hugs. 🤗",
        cool: "You are awesome. 😎",
        emotional: "It's okay, tomorrow will be better. 😢"
    };

    moodMessage.classList.remove('show');
    nextBtn.style.display = 'none';

    moodCards.forEach(card => {
        card.onclick = () => {
            moodCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const mood = card.dataset.mood;
            moodMessage.textContent = messages[mood];
            moodMessage.classList.add('show');

            // Sparkle effect
            const rect = card.getBoundingClientRect();
            createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20,
                ['#ffd700', '#ff6b9d', '#a855f7'],
                'sparkle', 5, 80, 4
            );

            // Show next button
            setTimeout(() => {
                nextBtn.style.display = 'block';
                gsap.from(nextBtn, { y: 20, opacity: 0, duration: 0.5 });
            }, 800);
        };
    });

    nextBtn.onclick = () => goToScene(8);
}

// ============================================
// SCENE 8 - MUSIC
// ============================================
function initScene8() {
    const playBtn = document.getElementById('playBtn');
    const waveBars = document.querySelectorAll('.wave-bar');
    const songBtns = document.querySelectorAll('.song-btn');
    const nowPlaying = document.getElementById('nowPlaying');
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.getElementById('progressBar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtnMusic = document.getElementById('nextBtn');
    const nextBtn = document.getElementById('nextFromMusic');

    let audio = null;
    let currentSongIndex = -1;
    const songs = [
        { src: 'songs/Manjal-Veiyil.mp3', name: 'Manjal Veiyil' },
        { src: 'songs/Othaiyadi Pathayila Kanaa 320 Kbps.mp3', name: 'Othaiyadi Pathayila' }
    ];

    // Set random wave heights
    waveBars.forEach(bar => {
        bar.style.setProperty('--wave-height', (Math.random() * 40 + 15) + 'px');
    });

    function stopWaves() {
        waveBars.forEach(bar => bar.classList.remove('active'));
    }

    function startWaves() {
        waveBars.forEach(bar => bar.classList.add('active'));
    }

    function loadSong(index) {
        if (audio) {
            audio.pause();
            audio = null;
        }
        currentSongIndex = index;
        audio = new Audio(songs[index].src);
        audio.volume = 1;

        songBtns.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        nowPlaying.textContent = songs[index].name;

        audio.addEventListener('timeupdate', () => {
            if (audio && audio.duration) {
                const pct = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = pct + '%';
            }
        });

        audio.addEventListener('ended', () => {
            if (!audio) return;
            stopWaves();
            playBtn.textContent = '▶️ Play';
            progressFill.style.width = '0%';
            // Auto play next
            const next = (currentSongIndex + 1) % songs.length;
            loadSong(next);
            audio.play().catch(()=>{});
            startWaves();
            playBtn.textContent = '⏸️ Pause';
        });
    }

    songBtns.forEach((btn, i) => {
        btn.onclick = () => {
            loadSong(i);
            audio.play().catch(()=>{});
            startWaves();
            playBtn.textContent = '⏸️ Pause';
        };
    });

    playBtn.onclick = () => {
        if (!audio && currentSongIndex === -1) {
            loadSong(0);
            audio.play().catch(()=>{});
            startWaves();
            playBtn.textContent = '⏸️ Pause';
            return;
        }

        if (audio && !audio.paused) {
            audio.pause();
            stopWaves();
            playBtn.textContent = '▶️ Play';
        } else if (audio) {
            audio.play().catch(()=>{});
            startWaves();
            playBtn.textContent = '⏸️ Pause';
        }
    };

    prevBtn.onclick = () => {
        const prev = currentSongIndex <= 0 ? songs.length - 1 : currentSongIndex - 1;
        loadSong(prev);
        audio.play().catch(()=>{});
        startWaves();
        playBtn.textContent = '⏸️ Pause';
    };

    nextBtnMusic.onclick = () => {
        const next = (currentSongIndex + 1) % songs.length;
        loadSong(next);
        audio.play().catch(()=>{});
        startWaves();
        playBtn.textContent = '⏸️ Pause';
    };

    progressBar.onclick = (e) => {
        if (!audio || !audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    };

    nextBtn.onclick = () => {
        if (audio) {
            audio.pause();
            audio = null;
        }
        stopWaves();
        goToScene(9);
    };
}

// ============================================
// SCENE 9 - FINAL
// ============================================
function initScene9() {
    const fireworksContainer = document.getElementById('fireworksContainer');

    // Continuous fireworks
    function createFirework() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.6;
        const colors = ['#ffd700', '#ff6b9d', '#a855f7', '#3b82f6', '#ec4899', '#00ff88'];

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            const angle = (Math.PI * 2 * i) / 30;
            const velocity = Math.random() * 100 + 50;
            particle.style.setProperty('--fw-x', Math.cos(angle) * velocity + 'px');
            particle.style.setProperty('--fw-y', Math.sin(angle) * velocity + 'px');

            fireworksContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
    }

    // Launch fireworks periodically
    const fwInterval = setInterval(createFirework, 800);

    // Initial confetti
    launchConfettiRain(100);

    // Create sparkles
    createParticles(window.innerWidth / 2, window.innerHeight / 2, 80,
        ['#ffd700', '#ff6b9d', '#a855f7', '#fff'],
        'sparkle', 10, 200, 5
    );

    // Animate elements
    gsap.from('.final-message-card', {
        y: 30, opacity: 0, duration: 1, ease: 'back.out(1.4)'
    });
    gsap.from('.final-title', {
        y: 50, opacity: 0, duration: 1, delay: 0.5
    });

    // Replay button
    document.getElementById('replayBtn').onclick = () => {
        clearInterval(fwInterval);
        goToScene(1);
    };
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initScene1();
});
