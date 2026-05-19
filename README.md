# Velour Studio

Single-page site for a luxury creative production house.

## Stack

- Vite + React 18 + JavaScript
- Tailwind CSS (utilities only; motion code uses inline styles)
- Custom scroll math — no Framer Motion, GSAP, or Lenis
- Deployed to Vercel

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Known TODOs

- Replace tagline placeholder (`TBD`) with real client copy
- Swap `AtmosphericHero` SVG with real atmospheric footage when available (drop in a `<video>` inside `src/fx/AtmosphericHero.jsx`)
