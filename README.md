# Birthday Surprise Web Experience

An interactive, cinematic birthday celebration with 8 animated scenes.

## Getting Started

```bash
# Option 1: Using the built-in Node.js server
node server.js
# Then open http://localhost:8080

# Option 2: Using any static server
npx serve .
npx http-server .
python -m http.server 8080

# Option 3: Deploy to any static hosting
```

## Features

- 8 interactive scenes (envelope → reveal → cake → gallery → letter → timeline → gift → final)
- Canvas-based 3D/2.5D cake with animated candles
- Web Audio API for background music and sound effects (no external dependencies)
- Touch gestures (tap, swipe, hold) with mouse fallbacks
- Haptic feedback on supported devices
- Confetti and particle systems with Canvas + CSS
- Reduced-motion accessibility support
- Mobile-first responsive design with safe-area insets
- Deep-linking via `?scene=N&name=YourName`
- Lazy-loaded animations triggered on scene transition
- Progress bar indicator
- Shareable, bookmarkable URLs

## Deep Linking

```
?scene=2      → Skip to birthday reveal
?name=Aria    → Personalize the name on scene 2
```

## No External Dependencies

All code is self-contained. No CDN libraries required.
