/* ═══════════════════════════════════════════════
   main.js — Santiago Barrionuevo Portfolio
═══════════════════════════════════════════════ */


/* ──────────────────────────────────────────────
   HEADER SCROLL
────────────────────────────────────────────── */

(function initHeader() {
  const hdr = document.getElementById('hdr');
  if (!hdr) return;
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();


/* ──────────────────────────────────────────────
   TEXT SCRAMBLE
────────────────────────────────────────────── */

class TextScramble {
  constructor(el) {
    this.el    = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#01';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length  = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => { this.resolve = resolve; });

    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from  = oldText[i] || '';
      const to    = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end   = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output   = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { from, to, start, end } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        const rand = this.chars[Math.floor(Math.random() * this.chars.length)];
        output += `<span style="color:var(--cyan);opacity:0.6">${rand}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

(function initScramble() {
  const target = document.getElementById('scrambleTarget');
  if (!target) return;

  const scramble = new TextScramble(target);
  const phrases  = ['Barrionuevo', 'Developer', 'Full Stack', 'Barrionuevo'];
  let i = 0;
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        observer.disconnect();

        setTimeout(() => {
          const next = () => {
            i = (i + 1) % phrases.length;
            scramble.setText(phrases[i]).then(() => {
              const delay = phrases[i] === 'Barrionuevo' ? 4500 : 1800;
              setTimeout(next, delay);
            });
          };
          next();
        }, 1200);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(target);
})();


/* ──────────────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────────────── */

(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const delay    = siblings.indexOf(entry.target) * 0.08;
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   THEME TOGGLE
────────────────────────────────────────────── */

(function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('theme');
  if (saved) html.setAttribute('data-theme', saved);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();


/* ──────────────────────────────────────────────
   CARRUSEL DE PROYECTOS
────────────────────────────────────────────── */

(function initCarousel() {
  const track    = document.getElementById('projTrack');
  const prevBtn  = document.getElementById('projPrev');
  const nextBtn  = document.getElementById('projNext');
  const dotsWrap = document.getElementById('projDots');

  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides = [...track.querySelectorAll('.proj-slide')];
  const total  = slides.length;
  let current  = 0;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'proj-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Proyecto ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateControls();
  }

  function updateControls() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    dotsWrap.querySelectorAll('.proj-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) goTo(current - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (current < total - 1) goTo(current + 1);
  });

  // Swipe touch para mobile
  let touchStartX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < total - 1) goTo(current + 1);
      if (diff < 0 && current > 0) goTo(current - 1);
    }
  }, { passive: true });

  // Teclado (izquierda/derecha cuando el carrusel está en foco)
  document.addEventListener('keydown', (e) => {
    const carousel = document.querySelector('.proj-carousel');
    if (!carousel) return;
    const rect = carousel.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft' && current > 0) goTo(current - 1);
    if (e.key === 'ArrowRight' && current < total - 1) goTo(current + 1);
  });

  // Init
  updateControls();
})();


/* ──────────────────────────────────────────────
   FORMULARIO DE CONTACTO
────────────────────────────────────────────── */

(function initForm() {
  const form   = document.getElementById('cform');
  const status = document.getElementById('fstatus');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    status.textContent = 'Enviando...';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        status.textContent = '✓ Mensaje enviado. Te respondo pronto.';
        form.reset();
      } else {
        status.textContent = '✗ Error al enviar. Intentá de nuevo.';
      }
    } catch {
      status.textContent = '✗ Error de conexión.';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();


/* ──────────────────────────────────────────────
   NAV ACTIVE STATE
────────────────────────────────────────────── */

(function initNavActive() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[data-nav]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => observer.observe(sec));
})();