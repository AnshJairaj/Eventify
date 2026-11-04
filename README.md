# Eventify

**Discover events. Book in seconds. Feel the moment.**

Eventify is a responsive event discovery and registration website inspired by the simplicity of BookMyShow. Browse concerts, festivals, hackathons and food carnivals, swipe through featured picks, and register in a few taps. Every event has its own full-screen visual effect, so clicking on a Diwali party feels different from clicking on a Halloween bash.

It is built with plain **HTML5, CSS3 and JavaScript**: no frameworks, no build step and no dependencies, so it opens and deploys anywhere.

|  |  |
|---|---|
| **Live demo** | `<add your deployed link here>` |
| **Repository** | `<add your GitHub repository link here>` |

---

## Highlights

- **Swipe to discover.** Featured events appear as a Tinder-style card deck. Swipe right to save, left to skip, or tap to open.
- **Every event has its own effect.** Fireworks, ghosts, laser beams, snowfall, code rain and more play when you open an event.
- **Booking that stays simple.** Pick an event, fill in three fields, confirm, and get a ticket with a booking ID.
- **Everything is remembered.** Bookings, saved events, your details and your theme choice are stored in the browser.
- **Looks right on any screen.** Layouts adapt from phones to wide desktops, in dark or light mode.

---

## Features

### Browsing and discovery

| Feature | What it does |
|---|---|
| Hero with swipe deck | An animated maroon background, live stats and a stack of featured event cards |
| Featured and upcoming row | A scrollable row of top events, each with a live countdown |
| Event cards | Name, date, venue, photo, short description, price and a *Book now* button |
| Search | Live search across event name, venue, city and category |
| Category chips | The first five categories are shown, and a **+ More** button reveals the rest so the row never feels crowded |
| Sorting | A grouped menu: date (soonest or latest), price (low or high), location (A to Z or Z to A), popularity and seats left |
| Reset | A fixed Reset button that returns search, category and sort to their defaults |

### Booking

| Feature | What it does |
|---|---|
| Event details | A pop-up with the poster, countdown, venue, time, description, highlights and seats left |
| Registration form | Name, email, phone and ticket count, with the selected event locked to the one you clicked |
| Validation | Checks as you type, clear inline messages, a shake animation on errors and a seat-limit check |
| Confirmation | An animated tick, a ticket with a booking ID and a code-style graphic |
| Seat tracking | "Only N left" badges that update after every booking or cancellation |

### Your profile

- **My bookings** lists every ticket and lets you cancel it.
- **Saved events** keeps the events you hearted.
- **My details** stores your name, email and phone so the booking form fills itself in next time.
- **Clear all my data** wipes everything from the device after a confirmation.

### Pop-ups and confirmations

Every confirmation is a centered pop-up rather than a browser alert box. Cancelling a ticket asks for confirmation first, then shows a "Booking cancelled" pop-up with an animated cross and a gentle falling-tickets effect. Clearing your data works the same way.

### Themed event effects

Open an event and its theme plays on a full-screen canvas.

| Event | Effect |
|---|---|
| Diwali Dhamaka Night | Rockets that burst into fireworks, floating diyas and a warm glow |
| Haunted Halloween Bash | Darkness, lightning, rising ghosts, falling pumpkins and flying bats |
| Neon Disco Fever | Sweeping colour beams, a mirror ball, sparkles and dancers |
| Karaoke Superstar Night | Music notes floating upward |
| Campus Flash Mob Fest | Confetti cannons and dancers popping up |
| Electric Echoes Concert and Battle of Bands | Laser beams, stage lights and sparks |
| Colour Splash Carnival | Holi colour splashes |
| Winter Wonderland Market | Snowfall |
| Laugh Riot Stand-up Night | A rain of laughing faces |
| CodeStorm Hackathon | Green code rain with laptops and rockets |
| Spectrum Inter-College Fest | Confetti, balloons and graduation caps |
| Street Food Carnival | Food raining down |
| City Fun Run 5K | Runners dashing across with medals |
| Successful booking | A confetti celebration |
| Cancelled booking | Tickets drifting down over a soft grey glow |

The effects use cached sprites and pause the page's background animation while they play, so they stay smooth. They are skipped automatically for visitors who have **reduce motion** turned on.

### The swipe deck

- Drag the top card **right to save** it or **left to skip**. A short drag springs back, and a tap opens the event.
- The skip, undo, save and open buttons do the same thing, as do the keyboard keys (arrow keys, Enter, Backspace to undo).
- The deck loops, so you never run out of cards.
- The featured row below can also be scrolled by dragging with the mouse.

### Extra pages and sections

The **How it works** page holds:

- **How it works:** three simple steps and a few handy tips.
- **Support:** help cards for payment issues, booking changes, cancellations and general questions, with the support email, a checklist of what to include, and *Email support* and *Copy email* buttons.
- **Contact:** a card for custom web design enquiries.
- **About me:** a minimal introduction with a photo, a status line, Gmail, LinkedIn and GitHub buttons and a *Work with me* button.

### Design and experience

- **Dark and light mode** that follows the system by default and remembers your choice across both pages.
- **Minimal line icons** (an inline SVG sprite) used throughout instead of emoji.
- **Smooth motion:** scroll reveals, 3D card tilt, button ripples, an animated maroon background, animated counters and live countdown timers.
- **Accessible by default:** focus states, keyboard navigation, a focus trap inside pop-ups, ARIA labels and reduced-motion support.
- **Responsive layouts** with a hamburger menu on small screens and a stacked pop-up on phones.

---

## Project structure

```
eventify/
├── index.html          Home page: hero and swipe deck, featured row, event browser, pop-ups, profile drawer
├── how-it-works.html   How it works, Support, Contact and About me
├── styles.css          Design tokens, layout, animations and responsive rules for both pages
├── script.js           Event data, effects engine, swipe deck, rendering, booking, profile and storage
├── page.js             Small script for the second page: theme, menu, scroll effects, copy email
├── assets/
│   └── arsang-logo.png Logo used in the About section and as the tab icon
└── README.md
```

### How `script.js` is organised

1. **Helpers and storage:** small utilities and a `localStorage` wrapper that never throws.
2. **Event data:** the `EVENTS` and `CATEGORIES` lists. This is where you add or edit events.
3. **Effects engine:** a lightweight canvas particle system with one entry per theme.
4. **Rendering:** cards, filters, search, sorting and live countdowns.
5. **Event details and booking:** the pop-up, form validation and the confirmation ticket.
6. **Cancel pop-ups and profile drawer:** confirmations, bookings, saved events and user details.
7. **Swipe deck, theme, navigation and start-up.**

Each file opens with a short "I want to change..." guide, and every function carries a plain-language comment, so edits are easy to find.

---

## Customising

### Add an event

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

- `theme` can be `diwali`, `halloween`, `disco`, `singing`, `flashmob`, `concert`, `holi`, `christmas`, `comedy`, `hackathon`, `collegefest`, `food` or `sports`.
- Set `featured: true` to show the event in the swipe deck and the featured row.
- To add a new category chip, add its name to the `CATEGORIES` array.

### Create a new effect

Copy any entry in the `themes` object inside the effects engine, rename it, adjust its particles and colours, then set `theme: 'yourName'` on an event.

### Change the look

Colours, corner radius and spacing live in the design tokens at the top of `styles.css`. Dark and light themes share the same token names, so changing a value updates the whole site.

### Change the support email

Edit the two `mailto` links and the `data-email` value on the *Copy email* button in the Support section of `how-it-works.html`.

---

## Deployment

Eventify is a static site, so any static host works.

- **GitHub Pages:** open the repository's *Settings*, then *Pages*, choose the `main` branch and the root folder, and save.
- **Netlify:** drag and drop the project folder at app.netlify.com/drop, or connect the repository.
- **Vercel:** import the repository at vercel.com/new and choose *Other* as the framework preset.

---

## Good to know

- **Images:** event photos load from Unsplash. If one fails to load, the card shows a coloured poster with a ticket icon instead, so the layout never breaks. You can swap in your own images at any time.
- **Demo data:** this is a front-end project with no server or payment system. Bookings, saved events and profile details live only in the visitor's browser (`localStorage`) and can be cleared from the profile drawer.
- **Ticket graphic:** the code on the ticket is a decorative pattern generated from the booking ID, not a scannable QR code.
- **Browsers:** built for current versions of Chrome, Edge, Firefox and Safari.

---

## Author

**Ansh Kanwal Jairaj**
B.Tech Computer Science and Engineering (AI and ML), KIIT

- Email: [anshjairaj@gmail.com](mailto:anshjairaj@gmail.com)
- LinkedIn: [linkedin.com/in/ansh-jairaj-964036386](https://linkedin.com/in/ansh-jairaj-964036386)
- GitHub: [github.com/AnshJairaj](https://github.com/AnshJairaj)

For custom web design projects or support questions, write to [arsang.pvt@gmail.com](mailto:arsang.pvt@gmail.com).
