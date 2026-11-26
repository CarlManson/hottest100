# Event brand assets

Everything event-specific lives here and in `src/config/brand.ts`.

| File | Used for | Notes |
|------|----------|-------|
| `logo.png` | Header, TV mode | Transparent PNG/SVG, wide format |
| `mascot.png` | Character/badge in the header corner (desktop) | Set `images.mascot` to `null` to hide |
| `background.jpg` | Header, home hero and login backgrounds | ~2400px wide, busy textures are fine (it's darkened) |
| `background-tv.jpg` | TV mode backdrop | Pre-blurred works best |
| `app-icon.png` | Browser tab icon and the home screen icon when someone adds the site to their phone | Square 512×512 PNG with a solid background (iPhones turn transparent areas black; they round the corners for you) |

To rebrand for a new event:

1. Replace the files above (same names), or add new ones and update the imports in `src/config/brand.ts`.
2. In `src/config/brand.ts`, set `appName`, `tagline`, `countdownYear` and `colors`.
   - `primary`, `secondary`, `tertiary` drive buttons, tabs, gradients and highlights.
     Light/dark shades are derived automatically (`bg-primary-50` … `bg-primary-700`).
   - `surface` is the menu bar colour.
   - `cold` / `hot` are the ends of the countdown "hotness" scale (accent colours that heat up towards #1).
3. Replace `app-icon.png`. The home screen name and colour come from `appName` and `colors.surface`.
   Optional: set `images.favicon` to use a different tab icon from the home screen one.

Preview the TV escalation with your new colours at `/?rehearsal#tv`.
