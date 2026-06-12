/* ========================================
   BIRTHDAY WEBSITE — script.js
   For: Soumiya ✨
======================================== */

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ─── CINEMATIC INTRO ───────────────────────────────────
function cinematicIntro() {
    const intro = document.getElementById('cinematic-intro');
    if (!intro) return;

    const canvas = document.getElementById('intro-canvas');
    const ctx = canvas.getContext('2d');
    const skipBtn = document.getElementById('skip-intro-btn');
    const flash = document.getElementById('intro-flash');

    const text1 = document.querySelector('.intro-text[data-text-id="1"]');
    const text2 = document.querySelector('.intro-text[data-text-id="2"]');
    const nameText = document.querySelector('.intro-name');
    const countdown = document.querySelector('.intro-countdown');

    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    let particles = [];
    const particleSettings = {
        count: window.innerWidth > 768 ? 300 : 100,
        radius: 1.5,
        minSpeed: 0.1,
        maxSpeed: 0.5,
        colors: ['rgba(244,167,195,', 'rgba(212,175,110,', 'rgba(155,114,207,']
    };

    class Particle {
        constructor(x, y, color, isStatic = false) {
            this.x = x;
            this.y = y;
            this.tx = x; // target x
            this.ty = y; // target y
            this.vx = isStatic ? 0 : (Math.random() - 0.5) * particleSettings.maxSpeed;
            this.vy = isStatic ? 0 : (Math.random() - 0.5) * particleSettings.maxSpeed;
            this.r = Math.random() * particleSettings.radius + 0.5;
            this.color = color || particleSettings.colors[Math.floor(Math.random() * particleSettings.colors.length)];
            this.alpha = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
        update() {
            this.x += (this.tx - this.x) * 0.05 + this.vx;
            this.y += (this.ty - this.y) * 0.05 + this.vy;
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }
    }

    function getHeartPath(scale = 15) {
        const points = [];
        for (let t = 0; t < Math.PI * 2; t += 0.1) {
            points.push({
                x: W / 2 + scale * (16 * Math.pow(Math.sin(t), 3)),
                y: H / 2 - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
            });
        }
        return points;
    }

    function getTextPath(text, font, size) {
        ctx.font = `${size}px ${font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, W / 2, H / 2);
        const imageData = ctx.getImageData(0, 0, W, H);
        ctx.clearRect(0, 0, W, H);
        const points = [];
        for (let y = 0; y < H; y += 4) {
            for (let x = 0; x < W; x += 4) {
                if (imageData.data[(y * W + x) * 4 + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }
        return points;
    }

    let animationFrameId;
    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    }

    const mainTimeline = gsap.timeline();

    function endIntro() {
        if (mainTimeline.isActive()) {
            mainTimeline.progress(1); // Instantly complete the timeline
        }
    }

    skipBtn.addEventListener('click', endIntro);

    // --- TIMELINE ---
    // 0-2s: Preparing
    mainTimeline.call(() => {
        particles.push(new Particle(W / 2, H / 2, particleSettings.colors[0]));
        gsap.to(particles[0], { alpha: 1, duration: 1 });
    }, [], 0.5)
    .to(text1, { text: "Preparing something special...", autoAlpha: 1, duration: 1.5 }, 0.5);

    // 2-4s: Collecting
    mainTimeline.call(() => {
        for (let i = 0; i < 50; i++) {
            const p = new Particle(Math.random() * W, Math.random() * H);
            particles.push(p);
            gsap.to(p, { alpha: Math.random() * 0.5 + 0.2, duration: 1 });
        }
    }, [], 2)
    .to(text1, { autoAlpha: 0, duration: 0.5 }, 2)
    .to(text1, { text: "Collecting beautiful memories...", autoAlpha: 1, duration: 1.5 }, 2.5);

    // 4-6s: Gathering (Heart)
    mainTimeline.call(() => {
        const heartPath = getHeartPath();
        particles.forEach((p, i) => {
            const target = heartPath[i % heartPath.length];
            gsap.to(p, { tx: target.x, ty: target.y, duration: 1.5, ease: 'power2.inOut' });
        });
    }, [], 4)
    .to(text1, { autoAlpha: 0, duration: 0.5 }, 4)
    .to(text1, { text: "Gathering dreams and achievements...", autoAlpha: 1, duration: 1.5 }, 4.5)
    .fromTo('#intro-canvas', { scale: 1 }, { scale: 1.05, repeat: 1, yoyo: true, duration: 1, ease: 'power1.inOut' }, 4.5);

    // 6-8s: SOUMIYA
    mainTimeline.call(() => {
        const namePath = getTextPath("SOUMIYA", `'${getComputedStyle(nameText).fontFamily.split(',')[0]}'`, W > 768 ? 120 : 60);
        particles.forEach((p, i) => {
            if (namePath.length > 0) {
                const target = namePath[i % namePath.length];
                gsap.to(p, { tx: target.x, ty: target.y, duration: 1.5, ease: 'power2.inOut', color: particleSettings.colors[1] });
            } else { // Fallback if canvas text fails
                gsap.to(p, { alpha: 0, duration: 1 });
            }
        });
        gsap.to(nameText, { autoAlpha: 1, duration: 1.5, delay: 0.5 });
    }, [], 6)
    .to(text1, { autoAlpha: 0, duration: 0.5 }, 6);

    // 8-9s: Await surprise
    mainTimeline.to(nameText, { autoAlpha: 0, duration: 0.5 }, 8)
    .call(() => {
        particles.forEach(p => {
            gsap.to(p, { tx: Math.random() * W, ty: Math.random() * H, duration: 1, ease: 'power2.inOut' });
        });
    }, [], 8)
    .to(text2, { text: "A surprise awaits you...", autoAlpha: 1, duration: 1 }, 8);

    // 9-10s: Countdown
    mainTimeline.to(text2, { autoAlpha: 0, duration: 0.2 }, 9)
    .fromTo(countdown, { textContent: 3, scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 9)
    .to(countdown, { scale: 1.5, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 9.33)
    .fromTo(countdown, { textContent: 2, scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 9.33)
    .to(countdown, { scale: 1.5, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 9.66)
    .fromTo(countdown, { textContent: 1, scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 9.66);

    // Final Reveal
    mainTimeline.to(flash, { autoAlpha: 1, duration: 0.15, ease: 'power2.in' }, 9.9)
    .call(() => {
        intro.classList.add('hidden');
        cancelAnimationFrame(animationFrameId);
        if (window.gsap) initAllGsap();
        const music = document.getElementById('bg-music');
        if (music) music.play().catch(() => {});
    }, [], 10)
    .to(flash, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 10.1);

    animate();
}

window.addEventListener('DOMContentLoaded', cinematicIntro);

// ─── CURSOR ───────────────────────────────────────────
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mx = 0, my = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  setTimeout(() => {
    trail.style.left = mx + 'px';
    trail.style.top = my + 'px';
  }, 80);
});

document.addEventListener('mousedown', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
});
document.addEventListener('mouseup', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(1)';
});

// ─── SCROLL PROGRESS ──────────────────────────────────
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('scroll-bar').style.width = pct + '%';
});

// ─── MUSIC ────────────────────────────────────────────
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
let musicPlaying = false;

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    document.getElementById('music-icon').textContent = '♪';
    musicBtn.style.color = 'var(--gold)';
  } else {
    bgMusic.play().catch(() => {});
    document.getElementById('music-icon').textContent = '♬';
    musicBtn.style.color = 'var(--pink)';
  }
  musicPlaying = !musicPlaying;
});

// ─── SECTION 1: HERO ──────────────────────────────────
function initHero() {
  // Particle canvas
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: window.innerWidth > 768 ? 120 : 40 }, () => createParticle());

  function createParticle() {
    return {
      x: Math.random() * (W || innerWidth),
      y: Math.random() * (H || innerHeight),
      r: Math.random() * 2.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      hue: Math.random() > 0.5 ? 'rgba(244,167,195,' : Math.random() > 0.5 ? 'rgba(212,175,110,' : 'rgba(155,114,207,'
    };
  }

  function animParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hue + p.alpha + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(animParticles);
  }
  animParticles();

  // Draw connecting lines between nearby particles
  setInterval(() => {
    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(244,167,195,${(1 - d / 90) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
  }, 50);

  // GSAP hero entrance
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to('.hero-date', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0)
    .to('.happy', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.4)
    .fromTo('.name-display', { opacity: 0, scale: 0.85, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'expo.out' }, 0.7)
    .to('.countdown-today', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 1.4)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.7)
    .to('.begin-btn', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 2.0);

  // Name shimmer
  gsap.to('.name-display', {
    backgroundPosition: '200% center',
    duration: 4, repeat: -1, ease: 'linear',
    backgroundSize: '200% auto'
  });

  // Floating hearts
  spawnFloatingHearts();

  // Begin button
  document.getElementById('begin-btn').addEventListener('click', () => {
    document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
  });
}

function spawnFloatingHearts() {
  const container = document.getElementById('floating-hearts');
  const symbols = ['❤', '🌸', '✨', '💫', '🌹', '💕', '⭐', '🦋'];
  setInterval(() => {
    const el = document.createElement('div');
    el.className = 'heart';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (Math.random() * 8 + 7) + 's';
    el.style.animationDelay = '-' + Math.random() * 5 + 's';
    el.style.fontSize = (Math.random() * 1.2 + 0.6) + 'rem';
    container.appendChild(el);
    setTimeout(() => el.remove(), 16000);
  }, 700);
}

// ─── SECTION 2: GALLERY ───────────────────────────────
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8, delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 85%' }
      }
    );

    // Lightbox
    item.querySelector('.gallery-img-wrap')?.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (src) {
        document.getElementById('lightbox-img').src = src;
        document.getElementById('lightbox').classList.add('active');
      }
    });
  });

  document.getElementById('lightbox-close').addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('active');
  });
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === document.getElementById('lightbox')) {
      document.getElementById('lightbox').classList.remove('active');
    }
  });

  // Header
  gsap.fromTo('.section-header', { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#gallery-section .section-header', start: 'top 80%' }
  });
}

// ─── SECTION 3: ACHIEVEMENT ───────────────────────────
function initAchievement() {
  gsap.fromTo('#achievement-section .section-header', { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#achievement-section', start: 'top 75%' }
  });
  gsap.fromTo('.achievement-desc', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.achievement-desc', start: 'top 85%' }
  });
  gsap.fromTo('.orbit-system', { opacity: 0, scale: 0.85 }, {
    opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.orbit-system', start: 'top 80%' }
  });
  gsap.fromTo('.achievement-footer', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.achievement-footer', start: 'top 90%' }
  });
}

// ─── SECTION 4: LETTER ────────────────────────────────
function initLetter() {
  // Spawn rose petals
  const container = document.getElementById('rose-petals');
  const petals = ['🌹', '🌸', '🪷', '💮', '🌺'];
  setInterval(() => {
    const el = document.createElement('div');
    el.className = 'petal';
    el.textContent = petals[Math.floor(Math.random() * petals.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (Math.random() * 8 + 8) + 's';
    el.style.animationDelay = Math.random() * 3 + 's';
    el.style.fontSize = (Math.random() * 0.8 + 0.6) + 'rem';
    container.appendChild(el);
    setTimeout(() => el.remove(), 18000);
  }, 600);

  // Envelope click
  const envelope = document.getElementById('envelope');
  const letterContent = document.getElementById('letter-content');
  const hint = document.getElementById('envelope-hint');
  let opened = false;

  const envelopeWrap = document.getElementById('envelope-wrap');
  envelopeWrap.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');
    hint.style.opacity = '0';

    gsap.to(envelope, {
      y: -30, scale: 0.92, opacity: 0.6, duration: 0.6, ease: 'power2.in',
      onComplete: () => {
        gsap.to(envelopeWrap, { opacity: 0, height: 0, marginBottom: 0, duration: 0.5 });
        letterContent.classList.add('visible');
        gsap.from('.letter-paper > *', {
          opacity: 0, y: 24, stagger: 0.15, duration: 0.7, ease: 'power3.out', delay: 0.3
        });
      }
    });
  });

  // Animate on scroll into view
  gsap.fromTo('#envelope-wrap', { opacity: 0, y: 50 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#letter-section', start: 'top 70%' }
  });
}

// ─── SECTION 5: TIMELINE ──────────────────────────────
function initTimeline() {
  gsap.fromTo('#timeline-section .section-header', { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#timeline-section', start: 'top 80%' }
  });

  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    const fromLeft = item.classList.contains('left');
    gsap.fromTo(item,
      { opacity: 0, x: fromLeft ? 50 : -50 },
      {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%' }
      }
    );
  });
}

// ─── SECTION 6: FINAL SURPRISE ────────────────────────
function initSurprise() {
  // Starfield
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: window.innerWidth > 768 ? 220 : 80 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.8 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * 0.0003 + 0.00015
  }));

  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.y -= s.speed;
      if (s.y < 0) s.y = 1;
      const a = 0.4 + Math.sin(Date.now() * 0.001 + s.x * 100) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  // Surprise button
  document.getElementById('surprise-btn').addEventListener('click', () => {
    document.getElementById('surprise-content').style.opacity = '0';
    document.getElementById('surprise-content').style.pointerEvents = 'none';

    setTimeout(() => {
      document.getElementById('surprise-reveal').classList.add('active');
      gsap.fromTo('#surprise-reveal h2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      gsap.fromTo('#surprise-reveal h1', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, delay: 0.4, ease: 'expo.out' });
      gsap.fromTo('#surprise-reveal p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.9, ease: 'power3.out' });
      launchFireworks();
      launchConfetti();
      spawnSurpriseHearts();
    }, 400);
  });

  gsap.fromTo('.surprise-content', { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#surprise-section', start: 'top 70%' }
  });
}

function launchFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fireworks = [];
  const particles = [];

  function Firework() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height;
    this.tx = Math.random() * canvas.width;
    this.ty = 100 + Math.random() * canvas.height * 0.45;
    this.dist = Math.hypot(this.tx - this.x, this.ty - this.y);
    this.distTraveled = 0;
    this.speed = 5 + Math.random() * 4;
    this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    const hues = ['350', '300', '45', '270', '15'];
    this.hue = hues[Math.floor(Math.random() * hues.length)];
    this.brightness = 55 + Math.random() * 20;
    this.trail = [];
  }

  Firework.prototype.update = function () {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 10) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    this.distTraveled += this.speed;
    if (this.distTraveled >= this.dist * 0.95) explode(this);
    return this.distTraveled < this.dist * 0.95;
  };

  function explode(fw) {
    const count = window.innerWidth > 768 ? 80 + Math.floor(Math.random() * 40) : 30 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x: fw.x, y: fw.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        hue: fw.hue, brightness: fw.brightness,
        alpha: 1, decay: 0.012 + Math.random() * 0.008
      });
    }
  }

  function animateFireworks() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.trail.forEach((t, idx) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${fw.hue},100%,${fw.brightness}%,${idx / fw.trail.length * 0.6})`;
        ctx.fill();
      });
      if (!fw.update()) fireworks.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.06;
      p.vx *= 0.99;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,${p.brightness}%,${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animateFireworks);
  }
  animateFireworks();

  // Launch sequence
  let count = 0;
  const interval = setInterval(() => {
    fireworks.push(new Firework());
    count++;
    if (count > 40) clearInterval(interval);
  }, 280);

  // Keep going
  setInterval(() => {
    fireworks.push(new Firework());
  }, 1200);
}

function launchConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#f4a7c3', '#d4af6e', '#9b72cf', '#f0d98a', '#fff8f5', '#e87da8'];

  for (let i = 0; i < (window.innerWidth > 768 ? 120 : 50); i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const w = Math.random() * 10 + 5;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${w}px;
      height: ${w * (Math.random() * 1.5 + 0.5)}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 4 + 3}s;
      animation-delay: ${Math.random() * 3}s;
      opacity: ${Math.random() * 0.6 + 0.4};
      transform: rotate(${Math.random() * 360}deg);
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    container.appendChild(el);
  }
}

function spawnSurpriseHearts() {
  const reveal = document.getElementById('surprise-reveal');
  const symbols = ['❤', '💕', '🌹', '✨', '💫', '🌸'];
  for (let i = 0; i < 25; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute; font-size:${Math.random() * 1.5 + 0.8}rem;
        left:${Math.random() * 100}%; bottom:10%;
        animation: floatHeart ${Math.random() * 5 + 5}s linear forwards;
        opacity:0; pointer-events:none; z-index:8;
      `;
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      reveal.appendChild(el);
    }, i * 150);
  }
}

function initAllGsap() {
    initHero();
    initGallery();
    initAchievement();
    initLetter();
    initTimeline();
    initSurprise();
}