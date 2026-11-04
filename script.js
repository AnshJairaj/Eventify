/* =====================================================
   Eventify – script.js  (logic for index.html)

   FILE MAP
   1. Helpers & storage      5. Event details + booking form
   2. Event data             6. Profile drawer
   3. Effects engine (FX)    7. Swipe deck, theme, nav, scroll, init

   QUICK GUIDE – "I want to change…"
   - Add / edit an event ........ EVENTS array (section 2)
   - Add a filter category ...... CATEGORIES array (section 2)
   - Change a click effect ...... `themes` object inside FX (section 3)
   - Add a sort option .......... SORTERS (section 4) + <option> in index.html
   - Change form rules/messages . `validators` (section 5)
   - Max tickets per booking .... search for "Math.min(6" (modalHTML + bindForm)
   - Card layout ................ cardHTML (section 4)
   - Swipe distance / speed ..... endDrag + dismiss in initDeck (section 7)
   - Everything is saved in the browser via `store` (localStorage).
   ===================================================== */
'use strict';

/* ---------- 1. Helpers & storage ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
// Escape text before putting it into innerHTML (stops HTML injection)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Format a number as Indian rupees, e.g. 1499 -> ₹1,499
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
// True if the user asked their device for less motion (we then skip big effects)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Minimal line icons come from the SVG sprite at the top of each HTML page
const ic = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// Tiny localStorage wrapper that never throws (private mode, full storage…)
const store = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } }
};
// The only localStorage keys used by the site (theme key is shared with how-it-works.html)
const KEYS = { theme: 'eventify_theme', user: 'eventify_user', bookings: 'eventify_bookings', saved: 'eventify_saved' };

/* ---------- 2. Event data ---------- */
// Dates are relative to "today" so the demo always shows upcoming events.
const at = (days, hour, min = 0) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, min, 0, 0); return d.getTime(); };
// Builds an Unsplash image URL from a photo id (swap for your own image URLs any time)
const unsplash = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

/* One object per event. Fields:
   id        unique short name (used in code, not shown)
   title     name shown on cards         cat     category chip it belongs to (must exist in CATEGORIES)
   theme     which click effect to play (a key of `themes` in section 3)
   emoji     fallback only (the effect uses `ambient`)     grad   [colour1, colour2] for placeholders/glow
   img       poster photo                date    use at(daysFromToday, hour, minute)
   price     rupees per ticket           cap     total seats      sold   seats already taken (demo data)
   featured  true = shown in the swipe deck + "Featured" row
   short     one line for the card       desc    longer text for the pop-up    tags   small pills in the pop-up
   ambient   emojis floating in the pop-up poster during the effect */
const EVENTS = [
  {
    id: 'diwali', title: 'Diwali Dhamaka Night', cat: 'Festival', theme: 'diwali', emoji: '🪔', grad: ['#f59e0b', '#b91c1c'],
    img: unsplash('photo-1492684223066-81342ee5ff30'), date: at(5, 18, 30), venue: 'Skyline Rooftop Arena', city: 'Mumbai',
    price: 499, cap: 400, sold: 312, host: 'Festival Folks Co.', duration: '5 hours', featured: true,
    short: 'Fireworks, rangoli, live dhol and a grand festive dinner under a sky full of diyas.',
    desc: 'Celebrate the festival of lights with fireworks, a rangoli contest, live dhol performers and a festive dinner. Come dressed in your best ethnic wear — the best outfit wins a surprise hamper!',
    tags: ['Fireworks', 'Dinner included', 'Ethnic wear', 'Family friendly'], ambient: ['🪔', '✨', '🎆']
  },
  {
    id: 'halloween', title: 'Haunted Halloween Bash', cat: 'Party', theme: 'halloween', emoji: '🎃', grad: ['#6d28d9', '#111827'],
    img: unsplash('photo-1509557965875-b88c97052f0e'), date: at(12, 20, 0), venue: 'The Dark Manor Club', city: 'Bengaluru',
    price: 699, cap: 250, sold: 190, host: 'Nightmare Events', duration: '6 hours', featured: true,
    short: 'Costume contest, spooky cocktails, a haunted maze and a DJ that never sleeps.',
    desc: 'Step into the haunted manor! Walk through a spooky maze, join the costume contest and dance till dawn with a horror-themed DJ set. Scary costumes get free entry to the photo booth.',
    tags: ['Costume contest', 'Haunted maze', 'DJ night', '18+'], ambient: ['👻', '🎃', '🦇']
  },
  {
    id: 'disco', title: 'Neon Disco Fever', cat: 'Party', theme: 'disco', emoji: '🪩', grad: ['#a855f7', '#ec4899'],
    img: unsplash('photo-1516450360452-9312f5e86fc7'), date: at(7, 21, 0), venue: 'Club Mirage', city: 'Delhi',
    price: 599, cap: 300, sold: 205, host: 'DJ Aurora', duration: '5 hours', featured: true,
    short: 'Retro-meets-neon dance floor with glow paint, mirror balls and non-stop 80s & 90s hits.',
    desc: 'Put on your dancing shoes! A glow-in-the-dark disco with a giant mirror ball, UV paint station and a playlist full of 80s, 90s and Bollywood throwbacks.',
    tags: ['Glow paint', 'Retro hits', 'Dance floor', 'Free welcome drink'], ambient: ['🪩', '💃', '✨']
  },
  {
    id: 'karaoke', title: 'Karaoke Superstar Night', cat: 'Singing', theme: 'singing', emoji: '🎤', grad: ['#ec4899', '#6366f1'],
    img: unsplash('photo-1516280440614-37939bbacd81'), date: at(4, 19, 0), venue: 'Melody Lounge', city: 'Chennai',
    price: 299, cap: 120, sold: 88, host: 'Sur & Taal Studio', duration: '3 hours', featured: false,
    short: 'Grab the mic and sing your heart out. Solo, duet or group — everyone gets a turn!',
    desc: 'A friendly open-mic karaoke night with a huge song library in Hindi, Tamil and English. Judges pick the Superstar of the night, and the crowd votes for the Best Performance.',
    tags: ['Open mic', 'Prizes', 'Group songs', 'All ages'], ambient: ['🎵', '🎶', '🎤']
  },
  {
    id: 'flashmob', title: 'Campus Flash Mob Fest', cat: 'Flash Mob', theme: 'flashmob', emoji: '💃', grad: ['#06b6d4', '#8b5cf6'],
    img: unsplash('photo-1504609813442-a8924e83f76e'), date: at(9, 16, 0), venue: 'City Central Plaza', city: 'Pune',
    price: 99, cap: 500, sold: 260, host: 'Move Mob Crew', duration: '2 hours', featured: false,
    short: 'Learn a 3-minute routine in the morning and surprise the city in the evening!',
    desc: 'Join hundreds of dancers for a surprise flash mob. Choreographers teach the routine at a short workshop, and then we hit the plaza together. No dance experience needed — only energy!',
    tags: ['Beginner friendly', 'Workshop', 'Group energy', 'Photo moments'], ambient: ['💃', '🕺', '🎉']
  },
  {
    id: 'concert', title: 'Electric Echoes Live Concert', cat: 'Concert', theme: 'concert', emoji: '🎸', grad: ['#ef4444', '#1e1b4b'],
    img: unsplash('photo-1470229722913-7c0e2dbbafd3'), date: at(15, 19, 30), venue: 'Grand Arena Stadium', city: 'Hyderabad',
    price: 1499, cap: 1000, sold: 760, host: 'Echo Entertainment', duration: '4 hours', featured: true,
    short: 'Headline indie-rock band, laser light show and a massive standing crowd.',
    desc: 'Three bands, one massive night. Feel the bass, watch the laser show and sing along to the anthems. Gates open at 5 PM and food trucks stay until the last song.',
    tags: ['Live band', 'Laser show', 'Food trucks', 'Standing zone'], ambient: ['🎸', '🥁', '🤘']
  },
  {
    id: 'holi', title: 'Colour Splash Carnival', cat: 'Festival', theme: 'holi', emoji: '🎨', grad: ['#22c55e', '#e11d48'],
    img: unsplash('photo-1576085898323-218337e3e43c'), date: at(20, 10, 0), venue: 'Green Meadows Park', city: 'Jaipur',
    price: 349, cap: 600, sold: 350, host: 'Rang Utsav Team', duration: '6 hours', featured: false,
    short: 'Organic colours, rain dance, folk music and street food — a rainbow of fun.',
    desc: 'Play with skin-safe organic colours, enjoy a rain dance, folk music and a street-food market. Bring a white t-shirt and a smile.',
    tags: ['Organic colours', 'Rain dance', 'Street food', 'Family friendly'], ambient: ['🎨', '🌈', '💦']
  },
  {
    id: 'christmas', title: 'Winter Wonderland Market', cat: 'Festival', theme: 'christmas', emoji: '🎄', grad: ['#0ea5e9', '#1e3a8a'],
    img: unsplash('photo-1512389142860-9c449e58a543'), date: at(50, 17, 0), venue: 'Lakeside Promenade', city: 'Kolkata',
    price: 199, cap: 800, sold: 120, host: 'Frost & Co.', duration: '5 hours', featured: false,
    short: 'Christmas market with carols, cakes, Santa photos and a glittering tree-lighting.',
    desc: 'A cosy winter evening with carol singers, plum cakes, handmade gifts and a grand tree-lighting ceremony. Santa will be around for photos!',
    tags: ['Carols', 'Cakes', 'Santa photos', 'Family friendly'], ambient: ['❄️', '🎄', '🎁']
  },
  {
    id: 'comedy', title: 'Laugh Riot Stand-up Night', cat: 'Comedy', theme: 'comedy', emoji: '😂', grad: ['#facc15', '#ea580c'],
    img: unsplash('photo-1585699324551-f6c309eedeca'), date: at(6, 20, 0), venue: 'The Punchline Theatre', city: 'Mumbai',
    price: 449, cap: 180, sold: 150, host: 'Open Mic Gang', duration: '2.5 hours', featured: false,
    short: 'Five comedians, one stage, zero chill. Get ready to laugh till your stomach hurts.',
    desc: 'A line-up of five rising stand-up comedians performing fresh material. Expect observational humour, crowd work and plenty of surprises.',
    tags: ['Stand-up', '5 comedians', '16+', 'Snacks available'], ambient: ['😂', '🤣', '🎤']
  },
  {
    id: 'battle', title: 'Rock the Stage: Battle of Bands', cat: 'Concert', theme: 'concert', emoji: '🥁', grad: ['#14b8a6', '#4c1d95'],
    img: unsplash('photo-1501386761578-eac5c94b800a'), date: at(11, 17, 0), venue: 'Open Air Amphitheatre', city: 'Bengaluru',
    price: 399, cap: 450, sold: 210, host: 'Campus Beats', duration: '5 hours', featured: false,
    short: 'Eight college bands compete for the trophy. You vote for the crowd favourite!',
    desc: 'Eight bands, one trophy. Watch the best college talent battle it out across rock, pop and fusion. The audience votes for the Crowd Favourite award.',
    tags: ['8 bands', 'Audience vote', 'Fusion', 'Open air'], ambient: ['🥁', '🎸', '🎶']
  },
  {
    id: 'hackathon', title: 'CodeStorm 24-Hour Hackathon', cat: 'Hackathon', theme: 'hackathon', emoji: '💻', grad: ['#10b981', '#064e3b'],
    img: unsplash('photo-1504384308090-c894fdcc538d'), date: at(14, 9, 0), venue: 'Innovation Hub, Tech Park', city: 'Bhubaneswar',
    price: 199, cap: 300, sold: 140, host: 'Dev Club', duration: '24 hours', featured: false,
    short: 'Team up, build a working project in 24 hours and win cash prizes and internship offers.',
    desc: 'Form a team of 2–4, pick a problem statement and build a prototype in 24 hours with help from mentors. Meals and energy drinks are on us. Top teams win cash prizes and fast-track interviews with partner companies.',
    tags: ['Teams of 2–4', 'Cash prizes', 'Mentors', 'Meals included'], ambient: ['💻', '⚡', '🧠']
  },
  {
    id: 'collegefest', title: 'Spectrum Inter-College Fest', cat: 'College Fest', theme: 'collegefest', emoji: '🎓', grad: ['#f59e0b', '#db2777'],
    img: unsplash('photo-1523580494863-6f3031224c94'), date: at(18, 10, 0), venue: 'University Main Grounds', city: 'Chennai',
    price: 149, cap: 900, sold: 430, host: 'Student Council', duration: 'Full day', featured: true,
    short: 'Dance, music, gaming and cultural contests from colleges across the city, all in one day.',
    desc: 'The biggest inter-college fest of the season: dance battles, band performances, gaming arena, art contests and a celebrity night. Register with your friends and represent your college!',
    tags: ['Dance battle', 'Gaming arena', 'Celebrity night', 'Student pass'], ambient: ['🎓', '🎈', '⭐']
  },
  {
    id: 'food', title: 'Street Food Carnival', cat: 'Food Carnival', theme: 'food', emoji: '🍔', grad: ['#f97316', '#b91c1c'],
    img: unsplash('photo-1555939594-58d7cb561ad1'), date: at(8, 12, 0), venue: 'Riverside Food Park', city: 'Hyderabad',
    price: 249, cap: 700, sold: 380, host: 'Foodies United', duration: '8 hours', featured: false,
    short: '50+ food stalls, live music and tasting passes. Come hungry, leave happy!',
    desc: 'Taste your way through 50+ stalls serving street food from across India and the world. Enjoy live music, eating contests and a dessert street. Your pass includes 5 tasting coupons.',
    tags: ['50+ stalls', 'Tasting coupons', 'Live music', 'Family friendly'], ambient: ['🍕', '🍔', '🍩']
  },
  {
    id: 'funrun', title: 'City Fun Run 5K', cat: 'Sports', theme: 'sports', emoji: '🏃', grad: ['#38bdf8', '#16a34a'],
    img: unsplash('photo-1452626038306-9aae5e071dd3'), date: at(22, 6, 0), venue: 'Marine Drive Promenade', city: 'Mumbai',
    price: 299, cap: 1000, sold: 520, host: 'RunClub India', duration: '3 hours', featured: false,
    short: 'A friendly 5K run or walk by the sea with medals, music and a healthy breakfast.',
    desc: 'Run, jog or walk! Every finisher gets a medal and a healthy breakfast. Warm-up starts at 6:00 AM sharp, with live music along the route.',
    tags: ['5K route', 'Finisher medal', 'Breakfast', 'All fitness levels'], ambient: ['🏃', '🏅', '👟']
  }
];
// Order matters: the first 5 are shown, the rest appear behind the "+ More" button
const CATEGORIES = ['All', 'Concert', 'Party', 'Festival', 'College Fest', 'Hackathon', 'Food Carnival', 'Singing', 'Flash Mob', 'Comedy', 'Sports'];
const VISIBLE_CATS = 5;

// ---- small data helpers used everywhere ----
const byId = id => EVENTS.find(e => e.id === id);
// Seats booked by this visitor (from localStorage) for one event
const bookedSeats = id => store.get(KEYS.bookings, []).filter(b => b.eventId === id).reduce((n, b) => n + b.qty, 0);
// Seats still free = capacity - demo "sold" - seats this visitor booked
const seatsLeft = e => Math.max(0, e.cap - e.sold - bookedSeats(e.id));
const fmtDate = ts => new Date(ts).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = ts => new Date(ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

/* ---------- 3. Effects engine (canvas particles) ---------- */
// Every event has a `theme`. Clicking an event plays that theme's full-screen effect.
const FX = (() => {
  const cvs = $('#fx'), ctx = cvs.getContext('2d'), tint = $('#fxTint');
  const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  let W = 0, H = 0, parts = [], raf = 0, t0 = 0, last = 0, cur = null, faded = false;

  // ----- tiny random helpers -----
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  // How many particles to spawn this frame for a "per second" rate
  const rate = (dt, perSec) => { const n = perSec * dt; return Math.floor(n) + (Math.random() < n % 1 ? 1 : 0); };

  // Keep the canvas the same size as the window
  function resize() {
    const d = Math.min(devicePixelRatio || 1, 1.25); // lower resolution = far fewer pixels to fill each frame
    W = innerWidth; H = innerHeight;
    cvs.width = W * d; cvs.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  addEventListener('resize', resize); resize();

  // Create one particle. `p` overrides the defaults below (x/y position, vx/vy speed, g gravity, fr friction,
  // size, rot/vr rotation, wob/wf side-to-side wobble, life in seconds, kind = emoji|glyph|spark|rocket|confetti|splash)
  function add(p) {
    if (parts.length > 300) return; // keep the frame time low
    parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, fr: 1, size: 10, rot: 0, vr: 0, wob: 0, wf: 3, seed: Math.random() * 9, age: 0, kind: 'dot', color: '#fff', emoji: '' }, p, { max: p.life }));
  }
  // Shortcuts: spawn a random emoji / monospace character from a list
  const emoji = (list, x, y, o = {}) => add(Object.assign({ kind: 'emoji', emoji: pick(list), x, y }, o));
  const glyph = (chars, x, y, o = {}) => add(Object.assign({ kind: 'glyph', emoji: pick(chars), x, y }, o)); // monospace characters

  // Firework explosion: `count` sparks flying out from (x, y)
  function burst(x, y, count, palette, speed) {
    for (let i = 0; i < count; i++) {
      const a = rnd(0, Math.PI * 2), s = rnd(.25, 1) * speed;
      add({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 140, fr: .965, life: rnd(.9, 1.7), size: rnd(1.6, 3.2), color: pick(palette) });
    }
  }

  // Shared colour lists + confetti cannon used by several themes
  const CONFETTI = ['#f43f5e', '#fb923c', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
  const DISCO = Array.from({ length: 12 }, (_, i) => `hsl(${i * 30},100%,68%)`);
  function confettiSpawn(t, dt, n) {
    if (t > 1.5) return;
    for (let i = 0, c = rate(dt, n); i < c; i++) {
      const left = Math.random() < .5;
      add({ kind: 'confetti', x: left ? 0 : W, y: H, vx: (left ? 1 : -1) * rnd(250, 900), vy: -rnd(550, 1050), g: 900, fr: .99,
        vr: rnd(-12, 12), size: rnd(8, 14), color: pick(CONFETTI), life: rnd(2, 2.8) });
    }
  }

  // Each theme: dur = length in seconds, tint = screen colour overlay (CSS background),
  // spawn(t, dt) = add particles every frame (t = seconds so far, dt = frame time),
  // bg(t, k) = optional drawing behind the particles (k fades 0→1→0).
  // To make a new effect: copy a theme below, rename it, then set `theme: 'yourName'` on an event.
  const themes = {
    // 🪔 Diwali – rockets that explode into fireworks, floating diyas, warm flicker
    diwali: {
      dur: 3.0, tint: 'radial-gradient(circle at 50% 100%, rgba(255,170,40,.38), rgba(50,8,0,.5))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 2.4); i < c; i++)
          add({ kind: 'rocket', x: rnd(W * .1, W * .9), y: H, vx: rnd(-30, 30), vy: -rnd(520, 780), ty: rnd(H * .12, H * .5), life: 3, size: 3, color: '#ffd166' });
        for (let i = 0, c = rate(dt, 3); i < c; i++)
          emoji(['🪔', '✨', '🪔'], rnd(0, W), H + 20, { vy: -rnd(70, 140), wob: 25, wf: rnd(1, 3), size: rnd(26, 40), life: 4 });
      },
      bg(t, k) { ctx.fillStyle = `rgba(255,190,70,${.07 * k * (.5 + .5 * Math.sin(t * 18))})`; ctx.fillRect(0, 0, W, H); }
    },
    // 🎃 Halloween – darkness, ghosts rising, pumpkins falling, bats flying, lightning
    halloween: {
      dur: 3.0, tint: 'radial-gradient(circle, rgba(15,0,30,.35), rgba(0,0,0,.9))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 4); i < c; i++) emoji(['👻'], rnd(0, W), H + 40, { vy: -rnd(90, 190), wob: 45, wf: rnd(2, 4), size: rnd(44, 80), life: 4.5 });
        for (let i = 0, c = rate(dt, 3); i < c; i++) emoji(['🎃'], rnd(0, W), -40, { vy: rnd(120, 220), g: 60, vr: rnd(-2, 2), size: rnd(36, 60), life: 4 });
        for (let i = 0, c = rate(dt, 3); i < c; i++) {
          const dir = Math.random() < .5 ? 1 : -1;
          emoji(['🦇'], dir > 0 ? -30 : W + 30, rnd(H * .08, H * .6), { vx: dir * rnd(220, 420), wob: 0, size: rnd(28, 48), life: 4 });
        }
      },
      bg(t, k) { // two quick lightning flashes
        if ((t > .35 && t < .45) || (t > 1.4 && t < 1.52)) { ctx.fillStyle = `rgba(255,255,255,${.4 * k})`; ctx.fillRect(0, 0, W, H); }
      }
    },
    // 🪩 Disco – sweeping coloured beams, sparkles, mirror ball, dancers
    disco: {
      dur: 3.0, tint: 'radial-gradient(circle at 50% 0%, rgba(168,85,247,.38), rgba(10,5,30,.72))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 34); i < c; i++) add({ kind: 'spark', x: rnd(0, W), y: rnd(0, H), life: rnd(.3, .7), size: rnd(2, 5), color: pick(DISCO) });
        for (let i = 0, c = rate(dt, 2); i < c; i++) emoji(['💃', '🕺'], rnd(0, W), H + 20, { vy: -rnd(120, 220), wob: 20, size: rnd(40, 60), life: 3.5 });
      },
      bg(t, k) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 6; i++) {
          const x0 = W * (i + .5) / 6, ang = Math.sin(t * 2.2 + i * .9) * .7, len = H * 1.3, sp = .13;
          const g = ctx.createLinearGradient(x0, 0, x0 + Math.sin(ang) * len, Math.cos(ang) * len);
          g.addColorStop(0, `hsla(${(i * 60 + t * 160) % 360},100%,60%,${.42 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, 0);
          ctx.lineTo(x0 + Math.sin(ang - sp) * len, Math.cos(ang - sp) * len);
          ctx.lineTo(x0 + Math.sin(ang + sp) * len, Math.cos(ang + sp) * len); ctx.fill();
        }
        ctx.restore();
        const b = (92 + Math.sin(t * 6) * 6) * 1.45;
        ctx.globalAlpha = k; ctx.drawImage(emojiSprite('🪩'), W / 2 - b / 2, 70 - b / 2, b, b); ctx.globalAlpha = 1;
      }
    },
    // 🎤 Singing – music notes floating up
    singing: {
      dur: 2.8, tint: 'radial-gradient(circle at 50% 100%, rgba(236,72,153,.34), rgba(20,5,40,.58))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 14); i < c; i++) emoji(['🎵', '🎶', '🎤', '🎼'], rnd(0, W), H + 20, { vy: -rnd(130, 320), wob: rnd(20, 45), wf: rnd(2, 4), vr: rnd(-.6, .6), size: rnd(26, 56), life: 3.6 });
        for (let i = 0, c = rate(dt, 12); i < c; i++) add({ kind: 'spark', x: rnd(0, W), y: rnd(H * .3, H), life: .6, size: rnd(2, 4), color: pick(['#f9a8d4', '#c4b5fd', '#fde68a']) });
      }
    },
    // 💃 Flash mob – confetti cannons + dancers popping up
    flashmob: {
      dur: 2.8, tint: 'radial-gradient(circle, rgba(56,189,248,.2), rgba(30,10,60,.45))',
      spawn(t, dt) {
        confettiSpawn(t, dt, 110);
        for (let i = 0, c = rate(dt, 4); i < c; i++) emoji(['💃', '🕺', '🎉'], rnd(W * .05, W * .95), rnd(H * .3, H * .9), { vy: -rnd(40, 90), size: rnd(42, 70), life: 1.8 });
      }
    },
    // Used for the booking-success celebration
    confetti: { dur: 2.4, tint: 'radial-gradient(circle, rgba(255,255,255,0), rgba(0,0,0,.15))', spawn(t, dt) { confettiSpawn(t, dt, 120); } },
    // 🎸 Concert – laser beams, stage cones, sparks (no shadowBlur: it is very slow on canvas)
    concert: {
      dur: 3.0, tint: 'radial-gradient(circle at 50% 100%, rgba(244,63,94,.32), rgba(5,5,20,.78))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 28); i < c; i++) add({ kind: 'spark', x: rnd(0, W), y: H, vy: -rnd(200, 520), life: rnd(.8, 1.4), size: rnd(2, 4), color: pick(['#fde047', '#f43f5e', '#22d3ee', '#ffffff']) });
        for (let i = 0, c = rate(dt, 3); i < c; i++) emoji(['🎸', '🥁', '🎤', '🤘'], rnd(0, W), H + 20, { vy: -rnd(160, 300), wob: 15, size: rnd(36, 60), life: 3 });
      },
      bg(t, k) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
          const ang = (i - 3) * .28 + Math.sin(t * 3 + i) * .25, col = i % 2 ? '34,211,238' : '244,63,94';
          ctx.beginPath(); ctx.moveTo(W / 2, H); ctx.lineTo(W / 2 + Math.sin(ang) * H * 1.4, H - Math.cos(ang) * H * 1.4);
          ctx.strokeStyle = `rgba(${col},${.16 * k})`; ctx.lineWidth = 12; ctx.stroke();   // soft glow
          ctx.strokeStyle = `rgba(${col},${.85 * k})`; ctx.lineWidth = 2.2; ctx.stroke();  // bright core
        }
        [0, W].forEach((x, idx) => { // warm stage cones from the corners
          const a = (idx ? -1 : 1) * (.5 + Math.sin(t * 2) * .25), g = ctx.createLinearGradient(x, H, x + Math.sin(a) * H, H - Math.cos(a) * H);
          g.addColorStop(0, `rgba(253,224,71,${.35 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, H);
          ctx.lineTo(x + Math.sin(a - .12) * H * 1.3, H - Math.cos(a - .12) * H * 1.3); ctx.lineTo(x + Math.sin(a + .12) * H * 1.3, H - Math.cos(a + .12) * H * 1.3); ctx.fill();
        });
        ctx.restore();
      }
    },
    // 🎨 Holi – colour splashes
    holi: {
      dur: 2.8, tint: 'radial-gradient(circle, rgba(255,255,255,.08), rgba(80,20,120,.38))',
      spawn(t, dt) {
        const pal = ['#ec4899', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6', '#f97316'];
        for (let i = 0, c = rate(dt, 7); i < c; i++) {
          const x = rnd(W * .08, W * .92), y = rnd(H * .1, H * .85), col = pick(pal);
          add({ kind: 'splash', x, y, size: rnd(90, 210), life: 1.7, color: col });
          for (let j = 0; j < 14; j++) { const a = rnd(0, 6.28), s = rnd(80, 320); add({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 220, fr: .96, life: rnd(.7, 1.3), size: rnd(2.5, 5), color: col }); }
        }
      }
    },
    // ❄️ Christmas – snowfall
    christmas: {
      dur: 3.0, tint: 'radial-gradient(circle at 50% 0%, rgba(147,197,253,.28), rgba(10,30,60,.58))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 34); i < c; i++) emoji(['❄️', '❄️', '❄️', '🎄', '🎁'], rnd(0, W), -30, { vy: rnd(90, 200), wob: rnd(15, 35), wf: rnd(1, 3), vr: rnd(-1, 1), size: rnd(14, 36), life: 6 });
      }
    },
    // 😂 Comedy – laughing emoji rain
    comedy: {
      dur: 2.8, tint: 'radial-gradient(circle, rgba(250,204,21,.22), rgba(60,20,0,.5))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 16); i < c; i++) emoji(['😂', '🤣', '😆', '😹'], rnd(0, W), -40, { vy: rnd(160, 320), g: 220, vr: rnd(-3, 3), size: rnd(30, 58), life: 4 });
      }
    },
    // 💻 Hackathon – "matrix" code rain
    hackathon: {
      dur: 3.0, tint: 'radial-gradient(circle, rgba(16,185,129,.14), rgba(0,10,5,.82))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 70); i < c; i++)
          glyph('01{}<>/;=+$#'.split(''), Math.round(rnd(0, W) / 18) * 18, -20, { vy: rnd(260, 520), size: rnd(14, 22), color: pick(['#34d399', '#10b981', '#a7f3d0']), life: 3.2 });
        for (let i = 0, c = rate(dt, 2); i < c; i++) emoji(['💻', '⚡', '🧠', '🚀'], rnd(0, W), H + 20, { vy: -rnd(120, 240), wob: 20, size: rnd(34, 54), life: 3.4 });
      }
    },
    // 🎟️ Cancelled booking – tickets drift down, soft grey-blue glow (gentle, not celebratory)
    cancelled: {
      dur: 2.6, tint: 'radial-gradient(circle at 50% 0%, rgba(148,163,184,.25), rgba(8,12,30,.62))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 7); i < c; i++) emoji(['🎟️'], rnd(0, W), -30, { vy: rnd(90, 200), g: 40, wob: rnd(15, 35), wf: rnd(1, 3), vr: rnd(-1.4, 1.4), size: rnd(22, 42), life: 5 });
        for (let i = 0, c = rate(dt, 16); i < c; i++) add({ kind: 'spark', x: rnd(0, W), y: -10, vy: rnd(120, 260), life: rnd(1.2, 2), size: rnd(1.6, 3), color: pick(['#94a3b8', '#cbd5e1', '#64748b']) });
      }
    },
    // 🎓 College fest – confetti, balloons, caps and stars
    collegefest: {
      dur: 3.0, tint: 'radial-gradient(circle, rgba(236,72,153,.2), rgba(30,10,60,.42))',
      spawn(t, dt) {
        confettiSpawn(t, dt, 80);
        for (let i = 0, c = rate(dt, 6); i < c; i++) emoji(['🎈'], rnd(0, W), H + 30, { vy: -rnd(140, 260), wob: 25, wf: rnd(1, 3), size: rnd(40, 66), life: 4.2 });
        for (let i = 0, c = rate(dt, 3); i < c; i++) emoji(['🎓', '⭐', '🎉'], rnd(W * .05, W * .95), rnd(H * .2, H * .8), { vy: -rnd(30, 80), vr: rnd(-1, 1), size: rnd(34, 58), life: 1.8 });
      }
    },
    // 🍔 Food carnival – food raining down
    food: {
      dur: 2.8, tint: 'radial-gradient(circle, rgba(251,146,60,.26), rgba(60,15,0,.5))',
      spawn(t, dt) {
        for (let i = 0, c = rate(dt, 15); i < c; i++) emoji(['🍕', '🍔', '🍟', '🌮', '🍩', '🍦', '🍜', '🍗'], rnd(0, W), -40, { vy: rnd(160, 320), g: 200, vr: rnd(-3, 3), size: rnd(32, 60), life: 4 });
      }
    },
    // 🏃 Sports – runners dash across the screen, medals and confetti
    sports: {
      dur: 2.8, tint: 'radial-gradient(circle at 50% 100%, rgba(56,189,248,.3), rgba(10,40,20,.5))',
      spawn(t, dt) {
        confettiSpawn(t, dt, 60);
        for (let i = 0, c = rate(dt, 4); i < c; i++) emoji(['🏃', '🏃‍♀️', '👟', '🏅'], -40, rnd(H * .45, H * .92), { vx: rnd(380, 700), vy: 0, size: rnd(40, 64), life: 3.4 });
        for (let i = 0, c = rate(dt, 2); i < c; i++) emoji(['🏆', '🥇', '🏅'], rnd(W * .1, W * .9), rnd(H * .2, H * .6), { vy: -rnd(30, 70), size: rnd(36, 56), life: 1.8 });
      }
    }
  };

  // ----- sprite cache (speed) -----
  // Pre-rendered sprites: drawing a cached bitmap is far cheaper than calling fillText for every particle every frame
  const sprites = new Map();
  function sprite(key, w, h, paint) {
    let c = sprites.get(key);
    if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); sprites.set(key, c); }
    return c;
  }
  const emojiSprite = ch => sprite('e' + ch, 128, 128, (c, w, h) => { c.font = `88px ${EMOJI_FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, w / 2, h / 2 + 4); });
  const glyphSprite = (ch, col) => sprite('g' + ch + col, 48, 48, (c, w, h) => { c.fillStyle = col; c.font = 'bold 36px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, w / 2, h / 2); });
  const dotSprite = col => sprite('d' + col, 32, 32, (c, w, h) => {
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, col); g.addColorStop(.4, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  });

  // Move one particle forward by dt seconds (physics + rocket trail/explosion)
  function step(p, dt) {
    p.age += dt; p.life -= dt;
    p.vy += p.g * dt;
    if (p.fr !== 1) { const f = Math.pow(p.fr, dt * 60); p.vx *= f; p.vy *= f; }
    p.x += (p.vx + (p.wob ? Math.sin(p.age * p.wf + p.seed) * p.wob : 0)) * dt;
    p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.kind === 'rocket') {
      add({ kind: 'spark', x: p.x, y: p.y, vx: rnd(-15, 15), vy: rnd(10, 40), life: .35, size: 2, color: '#ffe8a3' });
      if (p.y <= p.ty) { p.life = 0; burst(p.x, p.y, 60, ['#ffd166', '#ff6b6b', '#4ecdc4', '#ffffff', '#f72585', '#b5179e'], 300); }
    }
  }

  // Particles fade out during the last 35% of their life
  const fade = p => Math.max(0, Math.min(1, p.life / (p.max * .35)));

  // Draw one non-glowing particle (emoji, glyph, confetti, splash)
  function draw(p) {
    ctx.globalAlpha = fade(p);
    if (p.kind === 'emoji') {
      const s = p.size * 1.45;
      ctx.save(); ctx.translate(p.x, p.y); if (p.rot) ctx.rotate(p.rot); ctx.drawImage(emojiSprite(p.emoji), -s / 2, -s / 2, s, s); ctx.restore();
    } else if (p.kind === 'glyph') {
      const s = p.size * 1.33; ctx.drawImage(glyphSprite(p.emoji, p.color), p.x - s / 2, p.y - s / 2, s, s);
    } else if (p.kind === 'confetti') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore();
    } else if (p.kind === 'splash') {
      const prog = 1 - p.life / p.max;
      ctx.globalAlpha = .5 * (p.life / p.max); ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * Math.sqrt(prog), 0, 6.283); ctx.fill();
    }
  }
  function drawDot(p) { // glowing sparks (drawn together in one additive pass)
    ctx.globalAlpha = fade(p); const s = p.size * 3.2;
    ctx.drawImage(dotSprite(p.color), p.x - s / 2, p.y - s / 2, s, s);
  }

  // Runs every animation frame while an effect is playing
  function frame(now) {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    if (t < cur.dur) cur.spawn(t, dt);
    if (cur.bg) cur.bg(t, Math.min(1, t / .25) * Math.max(0, Math.min(1, (cur.dur + .5 - t) / .5)));
    let n = 0; // update and compact in place (no new arrays each frame)
    for (let i = 0; i < parts.length; i++) { const p = parts[i]; step(p, dt); if (p.life > 0) parts[n++] = p; }
    parts.length = n;
    const dots = [];
    for (let i = 0; i < n; i++) { const p = parts[i]; if (p.kind === 'spark' || p.kind === 'rocket') dots.push(p); else draw(p); }
    if (dots.length) { ctx.globalCompositeOperation = 'lighter'; dots.forEach(drawDot); ctx.globalCompositeOperation = 'source-over'; }
    ctx.globalAlpha = 1;
    if (t > cur.dur && !faded) { faded = true; tint.classList.remove('on'); cvs.classList.remove('on'); } // CSS fades it out
    if (t > cur.dur + .7) return stop();
    raf = requestAnimationFrame(frame);
  }

  // Stop immediately and clear the screen
  function stop() {
    cancelAnimationFrame(raf); parts = []; ctx.clearRect(0, 0, W, H);
    tint.classList.remove('on'); cvs.classList.remove('on'); document.body.classList.remove('fx-on');
  }

  // Start an effect by theme name (unknown names fall back to confetti)
  function play(name) {
    if (reduceMotion) return; // respect the user's accessibility setting
    stop();
    cur = themes[name] || themes.confetti; faded = false;
    document.body.classList.add('fx-on'); // pauses the animated page background while the effect runs
    tint.style.background = cur.tint; tint.classList.add('on'); cvs.classList.add('on');
    t0 = last = performance.now(); raf = requestAnimationFrame(frame);
  }
  return { play, stop }; // public: FX.play('diwali'), FX.stop()
})();

/* ---------- 4. Rendering cards ---------- */
// Current filter settings (changed by the chips, search box and sort menu)
const state = { cat: 'All', q: '', sort: 'date' };
let showAllCats = false; // "+ More" toggle for the category chips
let saved = store.get(KEYS.saved, []);
let onSavedChange = () => {}; // the swipe deck hooks in here to keep its heart button in sync

// All sort options (value of the <select> -> comparison function)
const popularity = e => e.sold + bookedSeats(e.id);
const SORTERS = {
  date: (a, b) => a.date - b.date,                                   // soonest first
  dateDesc: (a, b) => b.date - a.date,                               // latest first
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  cityAZ: (a, b) => a.city.localeCompare(b.city) || a.date - b.date,
  cityZA: (a, b) => b.city.localeCompare(a.city) || a.date - b.date,
  popular: (a, b) => popularity(b) - popularity(a),
  seats: (a, b) => seatsLeft(a) - seatsLeft(b)
};

// HTML for one event card (used by the grid and the featured row). `i` only staggers the reveal animation.
function cardHTML(e, i = 0) {
  const left = seatsLeft(e);
  const low = left > 0 && left <= 25 ? `<span class="low">${ic('zap')}Only ${left} left</span>` : left === 0 ? '<span class="low">Sold out</span>' : '';
  return `
  <article class="card reveal" data-open="${e.id}" tabindex="0" style="--c1:${e.grad[0]};--c2:${e.grad[1]};--i:${i}" aria-label="${esc(e.title)}">
    <div class="card-media">
      <div class="poster"><span class="poster-emoji">${ic('ticket')}</span></div>
      <img src="${e.img}" alt="${esc(e.title)}" loading="lazy" onerror="this.parentElement.classList.add('noimg');this.remove()" />
      <span class="badge">${e.cat}</span>
      <button class="heart ${saved.includes(e.id) ? 'on' : ''}" data-heart="${e.id}" aria-label="Save ${esc(e.title)}">${ic('heart')}</button>
      <span class="card-cd">${ic('clock')}<span data-cd="${e.date}"></span></span>
    </div>
    <div class="card-body">
      <h3>${e.title}</h3>
      <p class="meta">${ic('calendar')}<span>${fmtDate(e.date)} · ${fmtTime(e.date)}</span></p>
      <p class="meta">${ic('pin')}<span>${e.venue}, ${e.city}</span></p>
      <p class="desc">${e.short}</p>
      <div class="card-foot">
        <div><span class="price">${inr(e.price)}<small>per ticket</small></span>${low}</div>
        <button class="btn btn-primary btn-sm" tabindex="-1">Book now</button>
      </div>
    </div>
  </article>`;
}

// 3D tilt + moving shine on hover (skipped for touch)
function bindCard(card) {
  card.addEventListener('pointermove', ev => {
    if (ev.pointerType === 'touch') return;
    const r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
    card.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
    card.style.setProperty('--mx', (x * 100).toFixed(0) + '%');
    card.style.setProperty('--my', (y * 100).toFixed(0) + '%');
  });
  card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
}

// Scroll reveal: elements with class .reveal fade in when they enter the screen
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); } });
}, { threshold: .12 });
const observeReveals = root => $$('.reveal:not(.in)', root).forEach(el => revealObserver.observe(el));

// Shows only the first few categories; "+ More" reveals the rest (so the row never looks flooded)
function renderChips(animate = false) {
  const hidden = CATEGORIES.slice(VISIBLE_CATS);
  let list = showAllCats ? CATEGORIES : CATEGORIES.slice(0, VISIBLE_CATS);
  if (!showAllCats && hidden.includes(state.cat)) list = [...list, state.cat]; // keep the active filter visible
  const chip = (c, i) => `<button class="chip ${c === state.cat ? 'on' : ''} ${animate && i >= VISIBLE_CATS ? 'new' : ''}" style="--i:${i - VISIBLE_CATS}" role="tab" aria-selected="${c === state.cat}" data-cat="${c}">${c}</button>`;
  $('#chips').innerHTML = list.map(chip).join('') +
    `<button class="chip more" data-more aria-expanded="${showAllCats}">${showAllCats ? '− Less' : '+ More'}</button>`;
}

// True when no filter/search/sort is applied (the Reset button dims in that case)
const isDefaultFilters = () => state.cat === 'All' && !state.q.trim() && state.sort === 'date';
// Put category, search and sort back to defaults
function resetFilters() {
  state.cat = 'All'; state.q = ''; state.sort = 'date'; showAllCats = false;
  $('#searchInput').value = ''; $('#sortSelect').value = 'date';
  renderChips(); renderGrid(); toast('Filters reset');
}

// Apply category + search text, then sort. Search looks in title, venue, city, category and short text.
function filteredEvents() {
  const q = state.q.trim().toLowerCase();
  let list = EVENTS.filter(e => (state.cat === 'All' || e.cat === state.cat) &&
    (!q || [e.title, e.venue, e.city, e.cat, e.short].some(s => s.toLowerCase().includes(q))));
  list.sort(SORTERS[state.sort] || SORTERS.date);
  return list;
}

// Redraw the "All events" grid from the current filters
function renderGrid() {
  const list = filteredEvents(), grid = $('#eventGrid');
  grid.innerHTML = list.map((e, i) => cardHTML(e, i % 6)).join('');
  $$('.card', grid).forEach(bindCard);
  $('#emptyState').hidden = list.length > 0;
  $('#resetBtn').classList.toggle('idle', isDefaultFilters()); // dimmed when nothing to reset
  $('#resultCount').textContent = `Showing ${list.length} of ${EVENTS.length} events`;
  observeReveals(grid); tick();
}

// Redraw the horizontal "Featured & Upcoming" row
function renderFeatured() {
  const row = $('#featuredRow');
  row.innerHTML = EVENTS.filter(e => e.featured).sort((a, b) => a.date - b.date).map((e, i) => cardHTML(e, i)).join('');
  $$('.card', row).forEach(bindCard); observeReveals(row);
}

/* ---------- Live countdowns (cards + modal) ---------- */
// Split milliseconds into [days, hours, minutes, seconds]
const parts4 = ms => { const s = Math.max(0, ms) / 1000 | 0; return [s / 86400 | 0, (s % 86400) / 3600 | 0, (s % 3600) / 60 | 0, s % 60]; };
// Short text for cards, e.g. "3d 4h 20m"
function countdownText(ms) {
  if (ms <= 0) return 'Live now';
  const [d, h, m, s] = parts4(ms);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;
}
// Updates every countdown on the page (cards use data-cd, the pop-up boxes use data-cdbox)
function tick() {
  const now = Date.now();
  $$('[data-cd]').forEach(el => { el.textContent = countdownText(+el.dataset.cd - now); });
  $$('[data-cdbox]').forEach(box => {
    const p = parts4(+box.dataset.cdbox - now);
    $$('b', box).forEach((b, i) => { b.textContent = String(p[i]).padStart(2, '0'); });
  });
}
setInterval(tick, 1000);

/* ---------- Toasts, saved events ---------- */
// Small message that pops up at the bottom and disappears after ~3 s
function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('#toasts').appendChild(el); setTimeout(() => el.remove(), 3100);
}
// Heart button: add/remove an event from the saved list (stored in localStorage)
function toggleSave(id) {
  const adding = !saved.includes(id);
  saved = adding ? [...saved, id] : saved.filter(s => s !== id);
  store.set(KEYS.saved, saved);
  onSavedChange();
  $$(`[data-heart="${id}"]`).forEach(h => h.classList.toggle('on', adding));
  toast(adding ? 'Saved to your profile' : 'Removed from saved');
  if ($('#profileDrawer').classList.contains('open')) renderProfile();
}

/* ---------- 5. Event details + booking form ---------- */
// Form rules: each returns '' when valid, otherwise the error message shown under the field
const validators = {
  name: v => /^[A-Za-z][A-Za-z .'-]{2,}$/.test(v.trim()) ? '' : 'Enter your full name (letters only, at least 3 characters).',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, e.g. name@example.com',
  phone: v => /^[6-9]\d{9}$/.test(normPhone(v)) ? '' : 'Enter a valid 10-digit mobile number.',
  event: v => v ? '' : 'Please select an event.'
};
// Removes spaces/dashes and a +91 / 91 / 0 prefix so only the 10 digits remain
const normPhone = v => v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');

// Validate one field of any form that uses the .field wrapper; shows/clears the error message
function validateField(form, key) {
  const input = form.elements[key]; if (!input) return true;
  const wrap = input.closest('.field'), msg = validators[key](input.value);
  wrap.classList.toggle('invalid', !!msg); wrap.classList.toggle('valid', !msg);
  $('.err', wrap).textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

const eventModal = $('#eventModal'), modalCard = $('#modalCard');
let modalEventId = null; // id of the event currently open in the pop-up

// Open an event: plays its effect, then shows the pop-up (prefill = optional form values)
function openEvent(id, { fx = true, prefill } = {}) {
  const e = byId(id); if (!e) return;
  if (fx) FX.play(e.theme);
  const delay = fx && !reduceMotion ? 250 : 0; // let the effect start before the modal slides in
  setTimeout(() => showModal(e, prefill), delay);
}

let lastFocus = null;
// Builds the pop-up content: poster, countdown, details and the registration form.
// To add a form field, add a .field block here, a rule in `validators`, and read it in bindForm's submit handler.
function modalHTML(e, pre = {}) {
  const left = seatsLeft(e), user = store.get(KEYS.user, {}), maxQ = Math.min(6, left);
  const qty = Math.min(pre.qty || 1, Math.max(1, maxQ));
  const ambient = Array.from({ length: 14 }, (_, i) => `<span style="left:${(i * 7.3 + 3) % 95}%;font-size:${18 + (i * 5) % 22}px;animation-duration:${5 + (i * 1.3) % 5}s;animation-delay:${(i * .7) % 5}s">${e.ambient[i % e.ambient.length]}</span>`).join('');
  const v = k => esc(pre[k] ?? user[k] ?? '');
  return `
  <button class="modal-x" data-close aria-label="Close">${ic('x')}</button>
  <div class="m-grid" style="--c1:${e.grad[0]};--c2:${e.grad[1]}">
    <div class="m-poster">
      <div class="poster"><span class="poster-emoji">${ic('ticket')}</span></div>
      <img src="${e.img}" alt="" onerror="this.parentElement.classList.add('noimg');this.remove()" />
      <div class="ambient" aria-hidden="true">${ambient}</div>
      <div class="m-poster-info"><span class="badge">${e.cat}</span><h2 id="mTitle">${e.title}</h2><p>Hosted by ${esc(e.host)}</p></div>
    </div>
    <div class="m-body">
      <div class="cd-boxes" data-cdbox="${e.date}" aria-label="Time until event">
        <div><b>00</b><small>Days</small></div><div><b>00</b><small>Hours</small></div><div><b>00</b><small>Mins</small></div><div><b>00</b><small>Secs</small></div>
      </div>
      <ul class="info">
        <li>${ic('calendar')}<span>${fmtDate(e.date)}</span></li>
        <li>${ic('clock')}<span>${fmtTime(e.date)} · ${e.duration}</span></li>
        <li>${ic('pin')}<span>${esc(e.venue)}, ${e.city}</span></li>
        <li>${ic('ticket')}<span>${inr(e.price)} · <span data-seatsleft="${e.id}">${left} seats left</span></span></li>
      </ul>
      <h4>About this event</h4>
      <p class="about">${e.desc}</p>
      <ul class="tags">${e.tags.map(t => `<li>${t}</li>`).join('')}</ul>

      <div class="book" id="bookingArea">
        <form id="bookForm" novalidate>
          <h3 class="reg-title">${ic('ticket')}Register for this event</h3>
          <div class="field"><input id="fName" name="name" placeholder=" " autocomplete="name" value="${v('name')}" /><label for="fName">Full name</label><small class="err"></small></div>
          <div class="two">
            <div class="field"><input id="fEmail" name="email" type="email" placeholder=" " autocomplete="email" value="${v('email')}" /><label for="fEmail">Email address</label><small class="err"></small></div>
            <div class="field"><input id="fPhone" name="phone" type="tel" inputmode="numeric" placeholder=" " autocomplete="tel" value="${v('phone')}" /><label for="fPhone">Phone number</label><small class="err"></small></div>
          </div>
          <div class="field float locked">
            <input id="fEventName" value="${esc(e.title)}" readonly tabindex="-1" aria-readonly="true" />
            <input type="hidden" name="event" value="${e.id}" />
            <label for="fEventName">Selected event</label>${ic('lock', 'lock')}<small class="err"></small>
          </div>
          <p class="lock-note">Want a different event? Close this window and pick another one.</p>
          <div class="qty-row">
            <div class="stepper" role="group" aria-label="Number of tickets">
              <button type="button" data-step="-1" aria-label="Fewer tickets">${ic('minus')}</button><output id="qty" data-v="${qty}" aria-live="polite">${qty}</output><button type="button" data-step="1" aria-label="More tickets">${ic('plus')}</button>
            </div>
            <div class="total">Total <b id="total">${inr(qty * e.price)}</b></div>
          </div>
          <label class="check"><input type="checkbox" name="save" ${user.name ? '' : 'checked'} /> Save my details to my profile for next time</label>
          <button type="submit" class="btn btn-primary btn-block btn-submit" ${left === 0 ? 'disabled' : ''}>${left === 0 ? 'Sold out' : 'Confirm registration'}</button>
          <p class="hint">Max 6 tickets per booking · No payment needed for this demo</p>
        </form>
      </div>
    </div>
  </div>`;
}

// Put the pop-up on screen and wire up its form
function showModal(e, prefill) {
  modalEventId = e.id; lastFocus = document.activeElement;
  modalCard.innerHTML = modalHTML(e, prefill);
  eventModal.classList.add('open'); eventModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lock');
  bindForm(e); tick();
  // the small floating emojis belong to the click effect: fade them out when it ends so only the original photo stays
  const amb = $('.ambient', modalCard);
  if (amb) setTimeout(() => { amb.style.opacity = '0'; setTimeout(() => amb.remove(), 900); }, 3000);
  const body = $('.m-body', modalCard); if (body) body.scrollTop = 0;
  modalCard.scrollTop = 0;
  setTimeout(() => { const x = $('.modal-x', modalCard); if (x) x.focus({ preventScroll: true }); }, 60);
}

// Close the pop-up and give keyboard focus back to what opened it
function closeModal() {
  eventModal.classList.remove('open'); eventModal.setAttribute('aria-hidden', 'true');
  modalEventId = null; syncLock();
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
}
// Page scrolling is locked while the pop-up or profile drawer is open
const syncLock = () => document.body.classList.toggle('lock', eventModal.classList.contains('open') || $('#profileDrawer').classList.contains('open'));

// Registration form behaviour: ticket stepper, live validation, submit -> save booking -> confirmation
function bindForm(e) {
  const form = $('#bookForm'); if (!form) return;
  const qtyEl = $('#qty'), totalEl = $('#total'); let qty = +qtyEl.dataset.v;
  const refresh = () => { qtyEl.textContent = qty; qtyEl.dataset.v = qty; totalEl.textContent = inr(qty * e.price); };

  $$('[data-step]', form).forEach(btn => btn.addEventListener('click', () => {
    const n = qty + (+btn.dataset.step), cap = Math.min(6, seatsLeft(e));
    if (n < 1) return;
    if (n > cap) { toast(cap < 6 ? `Only ${cap} seat${cap === 1 ? '' : 's'} left` : 'Maximum 6 tickets per booking'); return; }
    qty = n; refresh();
  }));

  ['name', 'email', 'phone'].forEach(k => {
    const input = form.elements[k];
    input.addEventListener('blur', () => validateField(form, k));
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('invalid')) validateField(form, k); });
  });

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const allOk = ['name', 'email', 'phone', 'event'].map(k => validateField(form, k)).every(Boolean);
    if (!allOk) {
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      const bad = $('.field.invalid input, .field.invalid select', form); if (bad) bad.focus();
      return;
    }
    if (qty > seatsLeft(e)) { toast('Not enough seats left for that many tickets'); return; }

    const btn = $('.btn-submit', form); btn.disabled = true; btn.classList.add('loading'); btn.textContent = 'Booking';
    setTimeout(() => { // short delay = feels like real processing
      const data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), phone: normPhone(form.elements.phone.value) };
      const booking = { id: 'EVT-' + Math.random().toString(36).slice(2, 8).toUpperCase(), eventId: e.id, ...data, qty, total: qty * e.price, at: Date.now() };
      const all = store.get(KEYS.bookings, []); all.unshift(booking); store.set(KEYS.bookings, all);
      if (form.elements.save.checked) store.set(KEYS.user, data);
      updateProfileButton(); updateSeatBadges(); showConfirm(e, booking); FX.play('confetti');
    }, 900);
  });
}

// Deterministic, decorative "QR" pattern generated from the booking id
function qrSVG(seedStr) {
  let s = 2166136261; for (const c of seedStr) { s ^= c.charCodeAt(0); s = Math.imul(s, 16777619); }
  s = (s >>> 0) || 1;
  const rand = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const n = 11, finder = (x, y) => (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4);
  let out = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (finder(x, y)) { const cx = x % (n - 3), cy = y % (n - 3); out += (cx === 1 && cy === 1) ? '' : `<rect x="${x}" y="${y}" width="1" height="1"/>`; }
    else if (rand() > .5) out += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg viewBox="0 0 ${n} ${n}" fill="currentColor" shape-rendering="crispEdges" role="img" aria-label="Ticket code">${out}</svg>`;
}

// Replace the form with the success message + ticket
function showConfirm(e, b) {
  $('#bookingArea').innerHTML = `
  <div class="confirm" role="status">
    <svg class="tick" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28"/><path d="M17 31l9 9 17-19"/></svg>
    <h3>You're in, ${esc(b.name.split(' ')[0])}!</h3>
    <p>Registration successful. A confirmation was saved to your profile.</p>
    <div class="ticket">
      <div class="ticket-main">
        <h4>${esc(e.title)}</h4>
        <div>${ic('calendar')}<span><b>${fmtDate(e.date)}</b> · ${fmtTime(e.date)}</span></div>
        <div>${ic('pin')}<span>${esc(e.venue)}, ${e.city}</span></div>
        <div>${ic('ticket')}<span><b>${b.qty}</b> ticket${b.qty > 1 ? 's' : ''} · <b>${inr(b.total)}</b></span></div>
        <div>${ic('badge-check')}<span>Booking ID: <b>${b.id}</b></span></div>
      </div>
      <div class="ticket-qr">${qrSVG(b.id)}</div>
    </div>
    <div class="confirm-btns">
      <button class="btn btn-primary btn-sm" id="viewBookings">View my bookings</button>
      <button class="btn btn-ghost btn-sm" data-close>Done</button>
    </div>
  </div>`;
  $('#viewBookings').addEventListener('click', () => { closeModal(); openProfile('bookings'); });
  const body = $('.m-body', modalCard); if (body) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
}

// After a booking/cancel: refresh "seats left" text and redraw cards
function updateSeatBadges() {
  $$('[data-seatsleft]').forEach(el => { const e = byId(el.dataset.seatsleft); if (e) el.textContent = `${seatsLeft(e)} seats left`; });
  renderFeatured(); renderGrid();
}

/* ---------- Cancel booking pop-ups ---------- */
// Step 1 (askCancel): "Are you sure?" dialog.  Step 2 (showCancelled): success pop-up + screen effect.
// To change the wording or the effect, edit the two functions below (effect name: 'cancelled' in section 3).
const cancelModal = $('#cancelModal'), cancelCard = $('#cancelCard');

function openCancelModal(html) {
  cancelCard.innerHTML = html;
  cancelModal.classList.add('open'); cancelModal.setAttribute('aria-hidden', 'false');
  const first = $('button[data-focus]', cancelCard); if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
}
function closeCancelModal() {
  cancelModal.classList.remove('open'); cancelModal.setAttribute('aria-hidden', 'true');
}

// Booking summary used in both steps
const bookingSummary = (e, b) => `
  <div class="cancel-sum">
    <h4>${esc(e.title)}</h4>
    <div>${ic('calendar')}<span>${fmtDate(e.date)} · ${fmtTime(e.date)}</span></div>
    <div>${ic('ticket')}<span>${b.qty} ticket${b.qty > 1 ? 's' : ''} · ${inr(b.total)}</span></div>
    <div>${ic('badge-check')}<span>Booking ID: <b>${b.id}</b></span></div>
  </div>`;

// Generic "Are you sure?" pop-up used instead of the browser's plain confirm box.
// opts: title, text, extra (HTML shown under the text), yes (button label), onYes (function run on confirm)
function askConfirm({ title, text, extra = '', yes, onYes }) {
  openCancelModal(`
    <div class="cancel-ico warn">${ic('help')}</div>
    <h3 id="cTitle">${title}</h3>
    <p>${text}</p>${extra}
    <div class="cancel-btns">
      <button class="btn btn-ghost btn-sm" data-close-cancel data-focus>Keep it</button>
      <button class="btn btn-danger btn-sm" id="confirmYes">${yes}</button>
    </div>`);
  $('#confirmYes').addEventListener('click', onYes);
}

// Step 1: ask before cancelling a booking
function askCancel(bookingId) {
  const b = store.get(KEYS.bookings, []).find(x => x.id === bookingId), e = b && byId(b.eventId);
  if (!b || !e) return;
  askConfirm({
    title: 'Cancel this booking?',
    text: `Your ${b.qty} seat${b.qty > 1 ? 's' : ''} will be released for other people. This can't be undone.`,
    extra: bookingSummary(e, b), yes: 'Yes, cancel it',
    onYes() {
      store.set(KEYS.bookings, store.get(KEYS.bookings, []).filter(x => x.id !== b.id)); // remove the booking
      updateProfileButton(); updateSeatBadges(); renderProfile();
      showCancelled(e, b);
    }
  });
}

// "Clear all my data" (profile > My details): same pop-up style, then a short success pop-up
function askClearData() {
  askConfirm({
    title: 'Clear all your data?',
    text: 'This removes your profile, bookings and saved events from this device. This can\'t be undone.',
    yes: 'Yes, clear everything',
    onYes() {
      Object.values(KEYS).filter(k => k !== KEYS.theme).forEach(k => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
      saved = []; $$('.heart.on').forEach(h => h.classList.remove('on'));
      updateProfileButton(); updateSeatBadges(); onSavedChange(); renderProfile();
      FX.play('cancelled');
      openCancelModal(`
        <div class="cancel-ico done"><svg class="xmark" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28"/><path d="M20 20l20 20M40 20L20 40"/></svg></div>
        <h3 id="cTitle">All data cleared</h3>
        <p>Your profile, bookings and saved events were removed from this device.</p>
        <div class="cancel-btns"><button class="btn btn-primary btn-sm" data-close-cancel data-focus>Done</button></div>`);
    }
  });
}

// Step 2: success pop-up with an animated cross, plus the full-screen 'cancelled' effect
function showCancelled(e, b) {
  FX.play('cancelled');
  openCancelModal(`
    <div class="cancel-ico done"><svg class="xmark" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="28"/><path d="M20 20l20 20M40 20L20 40"/></svg></div>
    <h3 id="cTitle">Booking cancelled</h3>
    <p>${b.qty} seat${b.qty > 1 ? 's' : ''} released. A refund of <b>${inr(b.total)}</b> would be processed in a real booking (this demo has no payments).</p>
    ${bookingSummary(e, b)}
    <div class="cancel-btns">
      <button class="btn btn-ghost btn-sm" data-close-cancel data-focus>Done</button>
      <button class="btn btn-primary btn-sm" id="rebook">Book another event</button>
    </div>`);
  $('#rebook').addEventListener('click', () => { closeCancelModal(); closeProfile(); location.hash = '#events'; });
}

/* ---------- 6. Profile drawer ---------- */
const drawer = $('#profileDrawer'), drawerBackdrop = $('#drawerBackdrop');
let profileTab = 'bookings';

// "Ansh Jairaj" -> "AJ" (shown in the profile avatar)
const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

// Top-right profile button: initials (or user icon) + number of bookings
function updateProfileButton() {
  const u = store.get(KEYS.user, null), n = store.get(KEYS.bookings, []).length;
  $('#avatarText').innerHTML = u && u.name ? esc(initials(u.name)) : ic('user');
  const dot = $('#bookingDot'); dot.hidden = n === 0; dot.textContent = n;
}

// Open / close the slide-in profile drawer (tab = 'bookings' | 'saved' | 'details')
function openProfile(tab) {
  if (tab) profileTab = tab;
  renderProfile();
  drawer.classList.add('open'); drawerBackdrop.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lock');
}
function closeProfile() {
  drawer.classList.remove('open'); drawerBackdrop.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); syncLock();
}

// Draws the drawer for the current tab (bookings, saved events or details form)
function renderProfile() {
  const user = store.get(KEYS.user, null), bookings = store.get(KEYS.bookings, []);
  const tabs = [['bookings', 'ticket', `Bookings (${bookings.length})`], ['saved', 'heart', `Saved (${saved.length})`], ['details', 'user', 'My details']];
  const thumb = e => `<div class="li-thumb" style="background-image:url('${e.img}'),linear-gradient(145deg,${e.grad[0]},${e.grad[1]})"></div>`;

  let body = '';
  if (profileTab === 'bookings') {
    body = bookings.length ? bookings.map((b, i) => {
      const e = byId(b.eventId); if (!e) return '';
      return `<div class="list-item" style="animation-delay:${i * 60}ms">
        ${thumb(e)}
        <div class="li-main"><h4>${esc(e.title)}</h4>
          <div>${ic('calendar')}<span>${fmtDate(e.date)} · ${fmtTime(e.date)}</span></div>
          <div>${ic('ticket')}<span>${b.qty} ticket${b.qty > 1 ? 's' : ''} · ${inr(b.total)}</span></div>
          <div>${ic('badge-check')}<span>${b.id}</span></div>
          <div class="li-actions"><button class="link-btn" data-view="${e.id}">View event</button><button class="link-btn danger" data-cancel="${b.id}">Cancel booking</button></div>
        </div></div>`;
    }).join('') : `<div class="d-empty"><div class="d-ico">${ic('ticket')}</div><p>No bookings yet.<br/>Pick an event and book your first ticket.</p><button class="btn btn-primary btn-sm" data-goto="events">Explore events</button></div>`;
  } else if (profileTab === 'saved') {
    body = saved.length ? saved.map((id, i) => {
      const e = byId(id); if (!e) return '';
      return `<div class="list-item" style="animation-delay:${i * 60}ms">
        ${thumb(e)}
        <div class="li-main"><h4>${esc(e.title)}</h4><div>${ic('calendar')}<span>${fmtDate(e.date)}</span></div><div>${ic('pin')}<span>${esc(e.venue)}, ${e.city}</span></div>
          <div class="li-actions"><button class="link-btn" data-view="${e.id}">Book now</button><button class="link-btn danger" data-unsave="${e.id}">Remove</button></div>
        </div></div>`;
    }).join('') : `<div class="d-empty"><div class="d-ico">${ic('heart')}</div><p>Nothing saved yet.<br/>Tap the heart on any event to save it here.</p></div>`;
  } else {
    const u = user || {};
    body = `<form id="profileForm" novalidate>
      <div class="field"><input id="pName" name="name" placeholder=" " value="${esc(u.name || '')}" autocomplete="name" /><label for="pName">Full name</label><small class="err"></small></div>
      <div class="field"><input id="pEmail" name="email" type="email" placeholder=" " value="${esc(u.email || '')}" autocomplete="email" /><label for="pEmail">Email address</label><small class="err"></small></div>
      <div class="field"><input id="pPhone" name="phone" type="tel" placeholder=" " value="${esc(u.phone || '')}" autocomplete="tel" /><label for="pPhone">Phone number</label><small class="err"></small></div>
      <button class="btn btn-primary btn-block" type="submit">Save details</button>
      <p class="hint">Saved on this device only. Used to auto-fill your booking form.</p>
      <p class="hint"><button type="button" class="link-btn danger" id="clearData">Clear all my data</button></p>
    </form>`;
  }

  drawer.innerHTML = `
    <div class="d-head">
      <div class="d-avatar">${user && user.name ? esc(initials(user.name)) : ic('user')}</div>
      <div><h3>${user && user.name ? esc(user.name) : 'Welcome, guest'}</h3><p>${user && user.email ? esc(user.email) : 'Add your details to book faster'}</p></div>
      <button class="d-close" data-close-drawer aria-label="Close profile">${ic('x')}</button>
    </div>
    <div class="tabs" role="tablist">${tabs.map(([k, icon, l]) => `<button class="tab ${k === profileTab ? 'on' : ''}" role="tab" data-tab="${k}">${ic(icon)}${l}</button>`).join('')}</div>
    <div class="d-body">${body}</div>`;

  const pf = $('#profileForm');
  if (pf) {
    ['name', 'email', 'phone'].forEach(k => pf.elements[k].addEventListener('blur', () => validateField(pf, k)));
    pf.addEventListener('submit', ev => {
      ev.preventDefault();
      if (!['name', 'email', 'phone'].map(k => validateField(pf, k)).every(Boolean)) return;
      store.set(KEYS.user, { name: pf.elements.name.value.trim(), email: pf.elements.email.value.trim(), phone: normPhone(pf.elements.phone.value) });
      updateProfileButton(); toast('Profile saved'); renderProfile();
    });
    $('#clearData').addEventListener('click', () => {
      askClearData(); // pop-up instead of the browser confirm box
    });
  }
}

// One click handler for everything inside the drawer (tabs, cancel, remove, view event, go to events)
drawer.addEventListener('click', ev => {
  const tab = ev.target.closest('[data-tab]'); if (tab) { profileTab = tab.dataset.tab; renderProfile(); return; }
  const cancel = ev.target.closest('[data-cancel]');
  if (cancel) {
    askCancel(cancel.dataset.cancel); return; // opens the confirmation pop-up (see "Cancel booking pop-ups")
  }
  const unsave = ev.target.closest('[data-unsave]'); if (unsave) { toggleSave(unsave.dataset.unsave); return; }
  const view = ev.target.closest('[data-view]'); if (view) { closeProfile(); openEvent(view.dataset.view); return; }
  const go = ev.target.closest('[data-goto]'); if (go) { closeProfile(); location.hash = '#' + go.dataset.goto; }
});

/* ---------- 7. Swipe deck, theme, nav, scroll, init ---------- */
/* Tinder-style swipe deck: drag the top card left (skip) or right (save), tap to open.
   Buttons and arrow keys do the same; "undo" brings the last card back. */
function initDeck() {
  const deck = $('#deck'); if (!deck) return;
  const list = EVENTS.filter(e => e.featured).sort((a, b) => a.date - b.date);
  // els = card elements by id, history = swiped cards (for undo), order = current stack (first = top card)
  const els = {}, history = [];
  let order = list.map(e => e.id), busy = false, drag = null;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  deck.innerHTML = list.map(e => `
    <article class="deck-card" data-id="${e.id}" style="--c1:${e.grad[0]};--c2:${e.grad[1]}" aria-hidden="true">
      <img src="${e.img}" alt="" draggable="false" onerror="this.remove()" />
      <div class="dc-shade"></div><div class="dc-sheen"></div>
      <span class="stamp like">${ic('heart')}Save</span><span class="stamp nope">${ic('x')}Skip</span>
      <div class="dc-info">
        <span class="badge">${e.cat}</span>
        <h3>${e.title}</h3>
        <div class="dc-meta"><span>${ic('calendar')}${fmtDate(e.date)} · ${fmtTime(e.date)}</span><span>${ic('pin')}${esc(e.venue)}, ${e.city}</span></div>
        <div class="dc-foot"><span class="dc-price">${inr(e.price)}<small>per ticket</small></span><span class="dc-cd">${ic('clock')}<span data-cd="${e.date}"></span></span></div>
      </div>
    </article>`).join('');
  $('#deckDots').innerHTML = list.map(() => '<i></i>').join('');
  list.forEach(e => { els[e.id] = deck.querySelector(`[data-id="${e.id}"]`); });

  function place(el, depth) { // resting position: cards peek out from behind the top one
    const d = Math.min(depth, 3);
    el.style.transform = `translate3d(0, ${d * 16}px, 0) scale(${1 - d * .055})`;
    el.style.opacity = depth > 2 ? 0 : 1;
  }
  // Show/hide the SAVE / SKIP stamps on a card (0 to 1 opacity)
  function stamps(el, like, nope) { el.querySelector('.like').style.opacity = like; el.querySelector('.nope').style.opacity = nope; }
  // Put every card in its resting place (top card on top, others peeking behind)
  function layout() {
    order.forEach((id, i) => {
      const el = els[id]; el.style.zIndex = list.length - i;
      el.classList.toggle('top', i === 0); el.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      place(el, i);
    });
    syncSave();
  }
  function syncSave() { // heart button + dots only (never touches card positions)
    const top = order[0], on = saved.includes(top);
    $('#deckSave').classList.toggle('on', on); $('#deckSave').setAttribute('aria-pressed', on);
    $$('#deckDots i').forEach((d, i) => d.classList.toggle('on', list[i].id === top));
  }
  onSavedChange = syncSave;

  function pose(el, dx, dy) { // follow the finger / mouse
    el.style.transform = `translate3d(${dx}px, ${dy * .35}px, 0) rotate(${dx / 18}deg)`;
    stamps(el, clamp(dx / 90, 0, 1), clamp(-dx / 90, 0, 1));
    const p = clamp(Math.abs(dx) / 170, 0, 1);
    [1, 2].forEach(i => { // the cards behind grow as the top one leaves
      const c = els[order[i]]; if (!c) return;
      const d = i - p; c.style.transform = `translate3d(0, ${d * 16}px, 0) scale(${1 - d * .055})`;
    });
  }
  // Big heart / x icon that pops up after a swipe
  function pop(kind) {
    const s = document.createElement('span'); s.className = 'deck-pop ' + (kind === 'heart' ? 'heart-pop' : '');
    s.innerHTML = ic(kind); deck.parentElement.appendChild(s); setTimeout(() => s.remove(), 800);
  }

  // Fly the top card away. dir: 1 = right (save), -1 = left (skip)
  function dismiss(dir, dy = 0) {
    if (busy) return; busy = true;
    const id = order[0], el = els[id];
    deck.classList.remove('is-dragging'); el.classList.remove('dragging'); el.classList.remove('hint');
    el.classList.add('flying');
    el.style.transform = `translate3d(${dir * innerWidth * .8}px, ${dy * .35 - 30}px, 0) rotate(${dir * 24}deg)`;
    el.style.opacity = 0; stamps(el, dir > 0 ? 1 : 0, dir < 0 ? 1 : 0);
    let added = false;
    if (dir > 0) { added = !saved.includes(id); if (added) toggleSave(id); pop('heart'); } else pop('x');
    history.push({ id, dir, added });
    order.push(order.shift());           // next card moves up straight away
    order.forEach((oid, i) => { if (oid === id) return; const c = els[oid]; c.style.zIndex = list.length - i; c.classList.toggle('top', i === 0); c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'); place(c, i); });
    $$('#deckDots i').forEach((d, i) => d.classList.toggle('on', list[i].id === order[0]));
    setTimeout(() => { // send the dismissed card to the back of the deck, invisibly
      el.classList.remove('flying'); el.style.transition = 'none'; stamps(el, 0, 0);
      place(el, order.length - 1); void el.offsetWidth; el.style.transition = '';
      layout(); busy = false;
    }, 430);
  }

  // Bring the last swiped card back (and un-save it if the swipe saved it)
  function undo() {
    if (busy || !history.length) return; busy = true;
    const { id, dir, added } = history.pop();
    if (added) toggleSave(id);
    const el = els[id];
    order.unshift(order.pop());          // the dismissed card is always last
    el.style.transition = 'none'; el.style.opacity = 0;
    el.style.transform = `translate3d(${dir * innerWidth * .6}px, -20px, 0) rotate(${dir * 20}deg)`;
    void el.offsetWidth; el.style.transition = '';
    layout(); setTimeout(() => { busy = false; }, 460);
  }

  // ----- pointer handling (mouse, touch and pen) -----
  deck.addEventListener('pointerdown', ev => {
    const el = ev.target.closest('.deck-card.top'); if (!el || busy || ev.button > 0) return;
    el.classList.remove('hint');
    drag = { id: el.dataset.id, x0: ev.clientX, y0: ev.clientY, dx: 0, dy: 0, moved: false, pid: ev.pointerId, s: [] };
    try { el.setPointerCapture(ev.pointerId); } catch { /* ignore */ }
    el.classList.add('dragging'); deck.classList.add('is-dragging');
  });
  deck.addEventListener('pointermove', ev => {
    if (!drag) { // hover shine on the top card (mouse only)
      const el = ev.pointerType === 'mouse' && ev.target.closest('.deck-card.top');
      if (el) { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100) + '%'); el.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100) + '%'); }
      return;
    }
    if (ev.pointerId !== drag.pid) return;
    drag.dx = ev.clientX - drag.x0; drag.dy = ev.clientY - drag.y0;
    if (!drag.moved && Math.hypot(drag.dx, drag.dy) > 8) drag.moved = true;
    if (!drag.moved) return;
    const now = performance.now(); drag.s.push([now, drag.dx]); drag.s = drag.s.filter(p => now - p[0] < 100);
    pose(els[drag.id], drag.dx, drag.dy);
  });
  // Finger/mouse released: decide between fling away, spring back, or tap-to-open.
  // Tweak the numbers: 110 = distance in px to count as a swipe, .6 = fling speed.
  const endDrag = ev => {
    if (!drag || ev.pointerId !== drag.pid) return;
    const d = drag, el = els[d.id]; drag = null;
    const s = d.s, vx = s.length > 1 ? (s[s.length - 1][1] - s[0][1]) / Math.max(1, s[s.length - 1][0] - s[0][0]) : 0;
    deck.classList.remove('is-dragging'); el.classList.remove('dragging');
    if (ev.type === 'pointercancel') { layout(); stamps(el, 0, 0); return; }   // e.g. the page started scrolling
    if (!d.moved) { openEvent(d.id); return; }                                  // a tap opens the event
    if (Math.abs(d.dx) > 110 || (Math.abs(vx) > .6 && Math.abs(d.dx) > 30)) dismiss(d.dx > 0 ? 1 : -1, d.dy);
    else { layout(); stamps(el, 0, 0); }                                        // not far enough: spring back
  };
  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointercancel', endDrag);

  // ----- buttons + keyboard -----
  $('#deckPass').addEventListener('click', () => dismiss(-1));
  $('#deckSave').addEventListener('click', () => dismiss(1));
  $('#deckUndo').addEventListener('click', undo);
  $('#deckBook').addEventListener('click', () => openEvent(order[0]));
  deck.addEventListener('keydown', ev => {
    const k = ev.key;
    if (k === 'ArrowRight') dismiss(1); else if (k === 'ArrowLeft') dismiss(-1);
    else if (k === 'Enter' || k === ' ') openEvent(order[0]);
    else if (k === 'Backspace' || k === 'z') undo(); else return;
    ev.preventDefault();
  });

  layout();
  if (!reduceMotion) { const first = els[order[0]]; first.classList.add('hint'); first.addEventListener('animationend', () => first.classList.remove('hint'), { once: true }); }
}

// Featured row: drag with the mouse to scroll (touch already scrolls natively)
function initRowDrag() {
  const row = $('#featuredRow'); if (!row) return;
  let down = false, moved = false, sx = 0, sl = 0;
  row.addEventListener('pointerdown', ev => { if (ev.pointerType !== 'mouse' || ev.button) return; down = true; moved = false; sx = ev.clientX; sl = row.scrollLeft; });
  addEventListener('pointermove', ev => {
    if (!down) return;
    const dx = ev.clientX - sx;
    if (!moved && Math.abs(dx) > 6) { moved = true; row.classList.add('drag'); }
    if (moved) row.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { if (!down) return; down = false; row.classList.remove('drag'); setTimeout(() => { moved = false; }, 0); });
  row.addEventListener('click', ev => { if (moved) { ev.stopPropagation(); ev.preventDefault(); } }, true); // a drag must not open an event
}

// Hero stat numbers count up from 0 on load
function countUp() {
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const run = now => { const p = Math.min(1, (now - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN') + suffix; if (p < 1) requestAnimationFrame(run); };
    requestAnimationFrame(run);
  });
}

// Switch dark/light: sets data-theme on <html> (CSS reads it), swaps the icon and remembers the choice
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeBtn').innerHTML = ic(theme === 'dark' ? 'moon' : 'sun');
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#0a0a14' : '#f5f5fb';
  store.set(KEYS.theme, theme);
}

// Navbar: shadow on scroll, scroll progress bar, active link highlight, mobile menu
function initNav() {
  const nav = $('#nav'), bar = $('#scrollBar'), links = $$('#navLinks a');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // highlight the nav link of the section in view
  const secObs = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'featured', 'events'].forEach(id => secObs.observe($('#' + id)));

  const menu = $('#menuBtn'), navLinks = $('#navLinks');
  const setMenu = open => { navLinks.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); menu.innerHTML = ic(open ? 'x' : 'menu'); };
  menu.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
}

// Start-up: runs once when the page loads
function init() {
  // theme: saved choice → system preference → dark
  setTheme(store.get(KEYS.theme, matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  $('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  $('#statEvents').dataset.count = EVENTS.length;             // stats follow the data automatically
  $('#statCats').dataset.count = CATEGORIES.length - 1;
  initDeck(); renderFeatured(); initRowDrag(); renderChips(); renderGrid(); updateProfileButton(); initNav(); countUp();
  observeReveals(document); tick();

  // Filters: category chips, search (debounced 150 ms), sort menu, reset buttons
  $('#chips').addEventListener('click', ev => {
    if (ev.target.closest('[data-more]')) { showAllCats = !showAllCats; renderChips(true); return; }
    const c = ev.target.closest('[data-cat]'); if (!c) return;
    state.cat = c.dataset.cat; renderChips(); renderGrid();
  });
  let debounce; $('#searchInput').addEventListener('input', ev => { clearTimeout(debounce); debounce = setTimeout(() => { state.q = ev.target.value; renderGrid(); }, 150); });
  $('#sortSelect').addEventListener('change', ev => { state.sort = ev.target.value; renderGrid(); });
  $('#resetFilters').addEventListener('click', resetFilters);
  $('#resetBtn').addEventListener('click', () => { if (isDefaultFilters()) { toast('Nothing to reset'); return; } resetFilters(); });
  $('#searchBtn').addEventListener('click', () => { $('#events').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#searchInput').focus({ preventScroll: true }), 600); });

  // One delegated click handler: hearts, opening events, closing modal, ripple
  document.addEventListener('click', ev => {
    const btn = ev.target.closest('.btn');
    if (btn && !reduceMotion) {
      const r = btn.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
      s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${ev.clientX - r.left - d / 2}px;top:${ev.clientY - r.top - d / 2}px`;
      btn.appendChild(s); setTimeout(() => s.remove(), 600);
    }
    const heart = ev.target.closest('[data-heart]'); if (heart) { ev.stopPropagation(); toggleSave(heart.dataset.heart); return; }
    if (ev.target.closest('[data-close]')) { closeModal(); return; }
    if (ev.target.closest('[data-close-drawer]')) { closeProfile(); return; }
    if (ev.target.closest('[data-close-cancel]')) { closeCancelModal(); return; }
    const open = ev.target.closest('[data-open]'); if (open) openEvent(open.dataset.open);
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { if (cancelModal.classList.contains('open')) { closeCancelModal(); return; } if (drawer.classList.contains('open')) closeProfile(); else if (eventModal.classList.contains('open')) closeModal(); }
    if (ev.key === 'Enter' && ev.target.matches('.card[data-open]')) openEvent(ev.target.dataset.open);
  });

  // Profile button + Escape closes the top-most pop-up (handled above)
  $('#profileBtn').addEventListener('click', () => openProfile());

  // keep keyboard focus inside the pop-up while it is open
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Tab' || !eventModal.classList.contains('open')) return;
    const f = $$('button:not([disabled]), input:not([type=hidden]):not([readonly]), a[href]', modalCard).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  // Arrow buttons of the featured row
  $('#rowPrev').addEventListener('click', () => $('#featuredRow').scrollBy({ left: -330, behavior: 'smooth' }));
  $('#rowNext').addEventListener('click', () => $('#featuredRow').scrollBy({ left: 330, behavior: 'smooth' }));

  // soft glow following the mouse (desktop only)
  const glow = $('#cursorGlow');
  addEventListener('pointermove', ev => {
    if (ev.pointerType === 'touch') return;
    document.body.classList.add('has-pointer'); glow.style.transform = `translate(${ev.clientX}px,${ev.clientY}px)`;
  }, { passive: true });
}

init(); // go!
