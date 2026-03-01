# AXÉ — Capoeira Progression Guide

A vibrant, interactive web app for capoeiristas worldwide to track their training progression, explore movements, and connect with the global capoeira community.

## Features

### Training Paths
- **Golpes (Kicks & Strikes)** — From fundamental ginga to advanced spinning kicks
- **Floreios (Acrobatics)** — Cartwheels, flips, and expressive movements
- **Jogo de Chão (Ground Game)** — Sweeps, negativas, and low-flow sequences
- **Música & Cultura** — Berimbau, pandeiro, songs, and capoeira history

### Capoeira Styles
- **Regional / Contemporânea** — The faster, more acrobatic style developed by Mestre Bimba
- **Angola** — The traditional, slower, more strategic game rooted in African heritage

### Cord System
Build and track your own cord (belt) progression with custom colors, patterns, and meanings — reflecting the tradition of your group or escola.

### Events & Community
Discover and create rodas, workshops, batizados, and festivals. Track attendance and stay connected with the capoeira calendar.

### Kids Mode (Crianças)
A dedicated mode with simplified language, playful visuals, and age-appropriate progressions for young capoeiristas.

### Custom Training
Add your own drills, combos, and techniques — automatically categorized into the right training path.

## One Roda, Every Nation

Capoeira unites practitioners across 160+ countries — from street rodas in Bahia to academies in Berlin, Seoul, and Nairobi. AXÉ is built for all capoeiristas, wherever you train. You are part of the roda.

## Tech Stack

- **React 19** — UI framework
- **Vite 7** — Build tool and dev server
- **Pure CSS & SVG animations** — No animation libraries; all motion is hand-crafted
- **Zero UI dependencies** — Lightweight, fast, self-contained

## Getting Started

```bash
# Install dependencies
cd ginga-app
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Build

```bash
cd ginga-app
npm run build
```

Production files are output to `ginga-app/dist/`.

## Project Structure

```
capoeira/
├── README.md
├── ginga-app/
│   ├── src/
│   │   ├── CapoeiraApp.jsx   # Main application component
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── ginga-capoeira.jsx        # Standalone component file
```

## License

MIT
