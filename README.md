# 🎟️ Eventify – Responsive Event Management Website

A modern, BookMyShow-inspired event website where users can explore upcoming events, view details, and register in a few clicks. Every event comes alive with its own **themed full-screen effect** (fireworks for Diwali, ghosts and pumpkins for Halloween, laser lights for concerts…).

**Live demo:** `<add your Vercel / Netlify / GitHub Pages link here>`
**Repository:** `<add your GitHub repo link here>`

Built for the task *"Design and Develop a Responsive Event Management Website"* using plain **HTML5, CSS3 and JavaScript** (no frameworks).

---

## ✨ Features

### Required
| Requirement | How it is done |
|---|---|
| Hero section | Animated dark-maroon abstract background, live stats and a **Tinder-style swipe deck** of featured events |
| Upcoming & featured events | Scrollable "Featured & Upcoming" row with live countdowns |
| Event cards | Name, date, venue, image, short description, price and a "Book now" button |
| Browse / search / filter | Live search (event, venue, city), category chips (5 shown, rest behind a **+ More** button), grouped sort menu (date, price, location, popularity) and a **Reset** button |
| Event details | Pop-up with poster, countdown, venue, time, about, highlights and seats left |
| Registration form | Name, email, phone and selected event (plus ticket count) |
| JavaScript validation | Real-time field validation, inline error messages, shake animation, seat-limit check |
| Confirmation message | Animated tick, ticket with booking ID and a code-style graphic |
| Responsive | Mobile, tablet and desktop layouts (hamburger menu, stacked modal, fluid grid) |
| UI/UX | Consistent design tokens, smooth transitions, hover states, focus styles, toasts |

### Bonus challenge
- **Dark / light mode** – remembers your choice (and follows your system by default)
- ⏳ **Event countdown timers** – on cards, hero slider and inside the event pop-up
- 🎞️ **Animations** – scroll reveal, 3D card tilt, button ripple, parallax, animated counters
- 💾 **LocalStorage data management** – bookings, profile and saved events persist in the browser

### Extra ideas added
- 🎆 **Themed event effects** – click an event and its theme plays on a full-screen canvas:

  | Event | Effect |
  |---|---|
  | Diwali Dhamaka Night | Rockets exploding into fireworks, floating diyas, warm glow |
  | Haunted Halloween Bash | Darkness, lightning, rising ghosts, falling pumpkins, flying bats |
  | Neon Disco Fever | Sweeping colour beams, mirror ball, sparkles, dancers |
  | Karaoke Superstar Night | Music notes floating up |
  | Campus Flash Mob Fest | Confetti cannons and dancers popping up |
  | Electric Echoes Concert / Battle of Bands | Laser beams, stage lights, sparks |
  | Colour Splash Carnival | Holi colour splashes |
  | Winter Wonderland Market | Snowfall |
  | Laugh Riot Stand-up Night | Laughing-emoji rain |

  | CodeStorm Hackathon | Green "code rain" with laptops and rockets |
  | Inter-College Fest | Confetti, balloons and graduation caps |
  | Street Food Carnival | Food raining down |
  | City Fun Run 5K | Runners dashing across with medals |

  Booking successfully also fires a confetti celebration. Effects are skipped automatically if the user's device has *"reduce motion"* turned on.
- **All confirmations are centered pop-ups** (no browser alert boxes): cancel booking and "Clear all my data" both use the same `askConfirm()` pop-up
- **Cancel booking pop-ups** – cancelling asks "Cancel this booking?" in a pop-up, then shows a "Booking cancelled" pop-up with an animated cross and a gentle falling-tickets screen effect
- Save events with a heart button
- Simple profile drawer: **My bookings** (with cancel), **Saved events**, **My details** (auto-fills the form)
- "Only N left" seat counters that update after every booking

---

### Swipe deck (home page)
- Drag the top card **right to save** it or **left to skip**; a short drag springs back, a tap opens the event.
- Buttons (skip, undo, save, open) and keyboard (← → Enter, Backspace to undo) do the same. The deck loops forever.
- The featured row below can also be scrolled by dragging with the mouse.

### Design notes
- Minimal line icons (inline SVG sprite) are used everywhere in the interface instead of emoji.
- The event pop-up is locked to the event you clicked: to pick another event, close the pop-up and choose again.
- Click effects run on a canvas with cached sprites and the page animation pauses while they play, so they stay smooth (about 60 fps in testing).

### Extra pages
- **How it works** – 3 simple steps and tips.
- **Support** – help cards (paid but no ticket, change a booking, cancel/refund, other) with the support email arsang.pvt@gmail.com, a checklist of what to include, and Email / Copy buttons.
- **Contact** – card for custom web design requests.
- **About me** – minimal intro with photo, status pill, Gmail / LinkedIn / GitHub buttons and a "Work with me" button.

## 🗂️ Project structure

```
eventify/
├── index.html          # home page (hero + swipe deck, featured, browse events, modal and drawer)
├── how-it-works.html   # How it works + Support + Contact (custom web design) + About me
├── styles.css          # design tokens, layout, animations, responsive rules (both pages)
├── script.js           # events data, effects engine, swipe deck, rendering, booking, profile, storage
├── page.js             # small script for how-it-works.html (theme, menu, copy email)
├── assets/
│   └── arsang-logo.png # logo used in the About section and as the tab icon
└── README.md
```

### How the code is organised (`script.js`)
1. **Helpers & storage** – small `localStorage` wrapper that never throws
2. **Event data** – the `EVENTS` array (add or edit events here)
3. **Effects engine (`FX`)** – lightweight canvas particle system, one entry per theme
4. **Rendering** – cards, filters, search, sorting, live countdowns
5. **Event details + booking** – modal, form validation, confirmation ticket
6. **Profile drawer** – bookings, saved events, user details
7. **Init** – hero slider, theme toggle, navbar, scroll effects

### Adding your own event
Add an object to the `EVENTS` array in `script.js`:

```js
{
  id: 'my-event', title: 'My Event', cat: 'Party', theme: 'disco', emoji: '🎉',
  grad: ['#f43f5e', '#7c3aed'], img: 'https://…/photo.jpg',
  date: at(10, 19, 0),               // 10 days from today at 7:00 PM
  venue: 'My Venue', city: 'Chennai', price: 299, cap: 200, sold: 0,
  host: 'My Team', duration: '3 hours', featured: false,
  short: 'One-line description for the card.',
  desc: 'Longer description shown in the pop-up.',
  tags: ['Tag one', 'Tag two'], ambient: ['🎉', '✨']
}
```
`theme` can be: `diwali`, `halloween`, `disco`, `singing`, `flashmob`, `concert`, `holi`, `christmas`, `comedy`, `hackathon`, `collegefest`, `food`, `sports`. To add a new category chip, add its name to the `CATEGORIES` array.

---

## 🚀 Run locally

No build step needed.

```bash
git clone <your-repo-url>
cd eventify
# just open index.html in a browser, or use a tiny server:
npx serve .
```

## 🌐 Deploy

**GitHub Pages:** repo → *Settings → Pages* → Source: `main` branch, `/ (root)` → Save.
**Netlify:** drag-and-drop the project folder at app.netlify.com/drop, or connect the repo.
**Vercel:** import the repo at vercel.com/new (framework preset: *Other*).

## 🧰 Git workflow (suggested commits)

```bash
git init
git add index.html && git commit -m "Add page structure"
git add styles.css && git commit -m "Add styling, themes and responsive layout"
git add script.js && git commit -m "Add events, filters, booking form and effects"
git add how-it-works.html page.js assets && git commit -m "Add How it works, contact and About pages"
git add README.md && git commit -m "Add README"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 📝 Notes
- Event images load from Unsplash. If an image fails to load, the card automatically shows a colourful poster with an emoji instead, so the layout never breaks. You can swap in your own images anytime.
- This is a front-end demo: there is no payment or server. Bookings are stored only in the visitor's browser (`localStorage`).
- The "QR" on the ticket is a decorative pattern generated from the booking ID.

## 👤 Author
Ansh Kanwal Jairaj
