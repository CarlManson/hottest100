# Event brand assets

Everything event-specific lives here and in `src/config/brand.ts`.

| File | Used for | Notes |
|------|----------|-------|
| `logo.png` | Header, TV mode, browser tab icon | Transparent PNG/SVG, wide format |
| `mascot.png` | Character/badge in the header corner (desktop) | Set `images.mascot` to `null` to hide |
| `background.jpg` | Header, home hero and login backgrounds | ~2400px wide, busy textures are fine (it's darkened) |
| `background-tv.jpg` | TV mode backdrop | Pre-blurred works best |

To rebrand for a new event:

1. Replace the files above (same names), or add new ones and update the imports in `src/config/brand.ts`.
2. In `src/config/brand.ts`, set `appName`, `tagline`, `countdownYear` and `colors`.
   - `primary`, `secondary`, `tertiary` drive buttons, tabs, gradients and highlights.
     Light/dark shades are derived automatically (`bg-primary-50` … `bg-primary-700`).
   - `surface` is the menu bar colour.
   - `cold` / `hot` are the ends of the countdown "hotness" scale (accent colours that heat up towards #1).
3. Optional: set `images.favicon` to a square icon.

Preview the TV escalation with your new colours at `/?rehearsal#tv`.
