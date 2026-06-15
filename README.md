# 3D Live Sports

Watch NBA games without a stream. Live play-by-play data rendered as real-time 3D animations — every dunk, three-pointer, and fadeaway, right when it happens.

## What it does

Most fans watching a game they can't stream are stuck refreshing a score ticker. This replaces that with something worth actually looking at.

When a play happens (via ESPN's live data), the app:

1. Parses the play description into a typed action — dunk, 3-pointer, layup, miss, etc.
2. Positions a 3D player figure at the correct spot on the court
3. Animates the shot with motion specific to the play type (the fadeaway leans backward, the hook shot sweeps sideways, the dunk launches both arms overhead)
4. Flies the ball on the correct arc toward the right basket — and if the shot misses, deflects it off the rim
5. Flips the camera to whichever end of the court the scoring team is attacking

The scoreboard and play feed update live alongside the animation, so you always have context.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS |
| 3D | React Three Fiber + Three.js |
| Animations | Framer Motion |
| Data | ESPN unofficial API (proxied via Next.js API routes) |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API key required — the ESPN endpoints are public. If there are no live games, use the **Demo** mode on the homepage to see the full animation system running with a simulated GSW vs BOS game.

## Project structure

```
app/
  page.tsx                  # Homepage — live + today's games
  game/[gameId]/            # Game view — 3D court + scoreboard + play feed
  api/espn/                 # ESPN proxy routes

components/
  Scene3D/
    BasketballScene.tsx     # Canvas root, camera control, play→animation pipeline
    Court.tsx               # Full court geometry (paint, arcs, baskets, markings)
    PlayerFigure.tsx        # Articulated player with per-shot-type animation
    BallTrajectory.tsx      # Shot arc (make vs miss paths), arc preview dots
    ScoreParticles.tsx      # Particle burst on scored baskets
  Scoreboard/               # Broadcast HUD with animated score digits
  PlayFeed/                 # Live play-by-play list
  GameCard.tsx              # Game tile on the homepage

hooks/
  useGameData.ts            # Polls ESPN for live play-by-play
  useDemoMode.ts            # Simulates a live game for offline/demo use

lib/
  play-parser.ts            # Converts raw ESPN play text → typed ParsedPlay
  types.ts                  # Shared types (GameData, ParsedPlay, etc.)
```

## How the animation works

Each play goes through a simple pipeline:

```
ESPN play text
  → play-parser (type + distance + made/miss + team)
  → basketZ (which end of the court: home = −12.5, away = +12.5)
  → shooter position (derived from play type and distance)
  → CatmullRomCurve3 arc (4 control points for misses, 3 for makes)
  → PlayerFigure (shot-specific joint rotations keyed to progress 0→1)
  → camera lerps toward the active basket
```

Missed shots use a different arc — the ball clips the rim edge and deflects away — and the arc-preview dots turn red so the outcome is clear before the ball lands.

## Design intent

The court is the product. Every UI element frames it. The visual language is broadcast-first — compact scoreboard overlay, play announcement inside the court view, nothing competing with the 3D scene for attention.

Anti-references: SaaS dashboards, fantasy/gambling apps, plain score tickers, WebGL showcases.
