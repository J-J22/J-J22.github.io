# Jaiwardhan Joshi | Pixel Portfolio

A Bleach-inspired pixel portfolio for my personal projects. Plain HTML, CSS and JS, no build step.

## Features
- Title-screen hero: pixel night sky, crescent moon, town skyline and a rooftop silhouette, all drawn on a canvas
- Original pixel sprites (sword, mask, butterflies, project icons) drawn from pixel maps in `script.js`, so they recolour with the theme
- Two themes: **Ichigo** (black/orange/crimson) and **Rukia** (moonlit ice blue), remembered between visits
- Drifting hell-butterflies, sword cursor, spirit-energy sparks behind the cursor, typewriter intro
- Responsive, keyboard friendly, respects reduced-motion

## Projects
| Project | Link |
|---|---|
| Vision: AI agents that interview, debate, build and prove an app | https://github.com/J-J22/Vision |
| Smriti: offline memory companion for elders (built for an SIH 2026 problem statement) | https://github.com/J-J22/smriti |
| ReiatsuFlow: study planner for Linux that keeps me from quitting after 3 days | https://github.com/J-J22/reiatsuflow |

## Run locally
Open `index.html`, or `python3 -m http.server` and visit http://localhost:8000.

## Deploy
Push to GitHub and enable **Pages** (Settings → Pages → deploy from branch), or import the repo on Vercel (Framework: Other).

## Customise
- Text and projects: `index.html`
- Colours: the `[data-theme]` blocks at the top of `style.css`
- Sprites: the `SPRITES` maps in `script.js` (each letter is a colour, `.` is transparent)

## Credits
Pixel art is original. Fonts: Press Start 2P and VT323 (SIL Open Font License, see `assets/fonts`).
Inspired by Bleach; not affiliated with Tite Kubo, Shueisha or Studio Pierrot.
