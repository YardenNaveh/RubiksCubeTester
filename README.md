# 🧩 Rubik's Cube Tester

A web-based training app for speedcubers to sharpen their Rubik's Cube skills. Practice color recognition, cube orientation, and F2L (First Two Layers) pair spotting with interactive 3D visualization.

## Features

### 🎯 Color Sensei
Train your brain to instantly recognize cube face colors based on orientation clues. Given two reference faces and their colors, quickly identify what color appears on a target face. Perfect for developing the mental model needed for blindfolded solving or faster lookahead.

### 🥷 F2L Pair Ninja
Practice spotting F2L corner-edge pairs on a fully interactive 3D cube. The app generates scrambles with all four F2L pairs hidden around the cube—find them as fast as you can! Features:
- Interactive 3D cube (rotate to inspect all angles)
- Timer tracking for each scramble
- Click on pairs when you spot them
- Celebration animation on completion

### 📊 Statistics
Track your progress over time with detailed stats:
- Reaction times and averages
- Current and best streaks
- Session history with charts
- F2L completion times and miss counts

### ⚙️ Settings
- **Sound toggle**: Enable/disable audio feedback
- **Bottom color preference**: Choose a fixed bottom color or random for varied practice

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Three.js** + **React Three Fiber** for 3D cube rendering
- **Tailwind CSS** for styling
- **Chart.js** for statistics visualization
- **Workbox** for PWA/offline support
- **Jest** for testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd RubiksCubeTester

# Install dependencies
npm install
```

### Development

```bash
# Start the development server (runs on port 5174)
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

### Running Tests

```bash
npm test
```

### Deployment

The app is configured for GitHub Pages deployment:

```bash
npm run deploy
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── f2l/         # F2L-specific components (3D cube, cubies)
│   ├── AnswerPad.tsx
│   ├── Cube.tsx
│   └── Header.tsx
├── hooks/           # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useSound.ts
├── logic/           # Core game logic
│   ├── f2l/         # F2L scramble generation & pair detection
│   ├── cubeConstants.ts
│   └── orientation.ts
├── pages/           # Route pages
│   ├── DrillPage.tsx      # Color Sensei
│   ├── F2LNinjaPage.tsx   # F2L Pair Ninja
│   ├── F2LStatsPage.tsx
│   └── StatsPage.tsx
└── state/           # State management
    └── f2lStore.ts
```

## PWA Support

This app works offline! It uses a service worker to cache assets for offline use. Install it on your device for quick access during practice sessions.

## License

MIT
