# 🧩 Rubik's Cube Trainer

A web-based training app for speedcubers to sharpen their Rubik's Cube skills. Practice color recognition, edge orientation, and F2L (First Two Layers) pair spotting with interactive 3D visualization.

**Live Demo:** [https://yardennaveh.github.io/RubiksCubeTester/](https://yardennaveh.github.io/RubiksCubeTester/)

## Features

### 🎯 Color Sensei
Train your brain to instantly recognize cube face colors based on orientation clues. Given two reference faces and their colors, quickly identify what color appears on a target face. Perfect for developing the mental model needed for blindfolded solving or faster lookahead.

### 🔄 EO Kata (Edge Orientation Kata)
Master edge orientation recognition with this ZZ-method focused drill. Given a scrambled cube and highlighted edge:
- Determine if the edge is **Good** (oriented) or **Bad** (misoriented)
- Works with any user-defined cube orientation (Bottom + Front color)
- Only highlights edges fully visible from the default camera angle—no rotation needed
- Detailed explanations after each answer to reinforce learning
- Toggle auto-advance for rapid drilling or manual continue to study each case

### 🥷 F2L Pair Ninja
Practice spotting F2L corner-edge pairs on a fully interactive 3D cube. The app generates scrambles with the cross solved but all four F2L pairs scrambled—find them as fast as you can!
- Interactive 3D cube (rotate to inspect all angles)
- Timer tracking for each scramble
- Click on corner-edge pairs when you spot them
- Celebration animation on completion
- Ensures no F2L pairs are pre-solved in the scramble

### 📊 Statistics
Track your progress over time with detailed stats for each game:
- **Color Sensei**: Reaction times, accuracy, current/best streaks
- **EO Kata**: Attempts, accuracy, U/D vs non-U/D edge breakdown, streaks
- **F2L Pair Ninja**: Solve times, averages, best times, miss counts, streaks
- Charts showing recent performance history

### ⚙️ Settings
- **Sound toggle**: Enable/disable audio feedback (ding for correct, buzz for incorrect)
- **Bottom color preference**: Choose a fixed bottom color or random for varied practice
- **Front color selection**: Available in EO Kata for full orientation control

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Three.js** + **React Three Fiber** for 3D cube rendering
- **Tailwind CSS** for styling
- **Chart.js** for statistics visualization
- **Workbox** for PWA/offline support
- **Jest** for testing
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YardenNaveh/RubiksCubeTester.git
cd RubiksCubeTester

# Install dependencies
npm install
```

### Development

```bash
# Start the development server (runs on port 5174)
npm run dev
```

Open [http://localhost:5174/RubiksCubeTester/](http://localhost:5174/RubiksCubeTester/) in your browser.

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
├── components/           # Reusable UI components
│   ├── edgeKata/        # EO Kata components (3D cube with highlighting)
│   ├── f2l/             # F2L-specific components (3D cube, cubies)
│   ├── AnswerPad.tsx
│   ├── Cube.tsx
│   ├── HamburgerMenu.tsx
│   └── Header.tsx
├── hooks/               # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useSound.ts
├── logic/               # Core game logic
│   ├── edgeKata/        # Edge orientation detection & round generation
│   │   ├── isGoodEdge.ts
│   │   ├── orientation.ts
│   │   └── generateEdgeKataRound.ts
│   ├── f2l/             # F2L scramble generation & pair detection
│   │   ├── cubePiece.ts
│   │   ├── cubeStateUtil.ts
│   │   ├── pairDetector.ts
│   │   └── scramble.ts
│   ├── cubeConstants.ts
│   └── orientation.ts
├── pages/               # Route pages
│   ├── DrillPage.tsx         # Color Sensei
│   ├── EdgeKataPage.tsx      # EO Kata
│   ├── EdgeKataStatsPage.tsx
│   ├── F2LPage.tsx           # F2L Pair Ninja
│   ├── F2LStatsPage.tsx
│   └── StatsPage.tsx         # Color Sensei Stats
├── state/               # State management
│   ├── edgeKataStore.ts
│   └── f2lStore.ts
└── App.tsx              # Main app with routing
```

## PWA Support

This app works offline! It uses a service worker to cache assets for offline use. Install it on your device for quick access during practice sessions.

## License

MIT
