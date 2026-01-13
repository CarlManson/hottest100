# SCSS Style Library

Modular SCSS structure for the Hottest 100 Tracker application.

## Structure

```
src/styles/
├── _variables.scss      # Color palette, dimensions, breakpoints
├── _header.scss         # Header and logo styles
├── _podium.scss         # Podium visualization styles
├── _song-cards.scss     # Song card background styles
├── _banner.scss         # Full-page banner backgrounds
├── _utilities.scss      # Common mixins and utilities
└── index.scss           # Main entry point (imports all modules)
```

## Usage

### Variables

All design tokens (colors, sizes, breakpoints) are defined in `_variables.scss`. Update these to change the app's theme globally.

```scss
// Example: Change podium colors
$podium-gold-start: #facc15;
$podium-gold-end: #eab308;
```

### Mixins

Common patterns are available as mixins in `_utilities.scss`:

```scss
// Progress bar
@include progress-bar($height, $border-radius);
@include progress-fill($start-color, $end-color);

// Responsive text
@include text-responsive($mobile-size, $desktop-size);

// Hover effects
@include hover-scale($scale);
```

### Song Cards

Song card mixins in `_song-cards.scss`:

```scss
// Overlay gradient
@include song-card-overlay($opacity-top, $opacity-bottom);

// Fallback gradient (no thumbnail)
@include song-card-fallback($start-color, $end-color);
```

### Banner

Banner overlay mixins in `_banner.scss`:

```scss
// Darken banner
@include banner-overlay($color, $opacity);

// Gradient overlay
@include banner-gradient-overlay($start, $end, $direction);
```

## Importing

The entire style library is imported via `index.scss`:

```css
/* In src/index.css */
@import "./styles/index.scss";
```

## Adding New Components

1. Create a new `_component-name.scss` file
2. Use `@use 'variables' as *;` to access variables
3. Import it in `index.scss`: `@use 'component-name';`

## Notes

- Files starting with `_` are partials (won't compile standalone)
- `index.scss` is the main entry point
- Variables must be imported in each file that uses them
- Inline styles are still needed for dynamic values (widths, URLs, etc.)
