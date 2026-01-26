# CSS & Styling Documentation

## Overview

The Hottest 100 Tracker uses a hybrid styling approach combining **Tailwind CSS v4** for utility classes with **custom SCSS modules** for component-specific styling.

---

## CSS Framework: Tailwind CSS v4

### What is Tailwind CSS?
Tailwind is a utility-first CSS framework that provides low-level utility classes for building designs directly in HTML/JSX.

### Key Features in This Project
- **Utility Classes**: Most styling is done inline with classes like `bg-white`, `text-xl`, `p-4`, `rounded-lg`
- **Responsive Design**: Built-in breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- **No Config File**: Tailwind v4 uses `@import "tailwindcss"` directly (see `src/index.css`)
- **PostCSS Processing**: Configured in `postcss.config.js`

### Common Tailwind Patterns Used

#### Spacing
- `p-4` = padding: 1rem (16px)
- `px-6` = padding left/right: 1.5rem
- `mb-4` = margin-bottom: 1rem
- `gap-2` = grid/flex gap: 0.5rem

#### Sizing
- `w-full` = width: 100%
- `max-w-7xl` = max-width: 80rem
- `h-screen` = height: 100vh

#### Colors
- `bg-gradient-to-r from-orange-500 via-red-500 to-pink-500`
- `text-white`, `text-gray-800`
- `bg-orange-50` (lighter), `bg-orange-600` (darker)

#### Layout
- `flex items-center justify-between`
- `grid grid-cols-1 xl:grid-cols-2`

#### Responsive Breakpoints
- Default: 0px (mobile)
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

Example:
```jsx
className="text-sm sm:text-lg xl:text-2xl"
// Mobile: small text
// 640px+: large text
// 1280px+: 2xl text
```

---

## Custom SCSS Modules

Custom styles are organized in **modular SCSS files** located in `src/styles/`.

### File Structure

```
src/styles/
├── index.scss              # Main entry point (imports all modules)
├── _variables.scss         # Color palette, dimensions, breakpoints
├── _banner.scss            # Hero banner background
├── _countdown.scss         # Countdown timer widget
├── _commentary.scss        # Speech bubble quips
├── _podium.scss            # Winner podium display
├── _song-cards.scss        # Song card backgrounds
├── _messages.scss          # Welcome message positioning
├── _menu.scss              # Navigation menu
├── _header.scss            # Header/logo
└── _utilities.scss         # Utility classes
```

### How to Use
1. Import in `src/main.tsx`: `import './styles/index.scss'`
2. Compiled CSS output: `src/styles/compiled.css`

---

## Variables (`_variables.scss`)

All colors, dimensions, and breakpoints are centralized here for easy theming.

### Color Palette
```scss
$white: #ffffff;
$grey: #374151;
$black: #111827;
$orange: #f97316;
$red: #ef4444;
$pink: #ec4899;
$yellow: #fbbf24;
$navy: #3c4367;
$blue: #3c85b5;
```

### Gradients
```scss
$gradient-orange: $orange;
$gradient-red: $red;
$gradient-pink: $pink;
$gradient-yellow: $yellow;
```

### Podium Dimensions
```scss
$podium-first-width: 35%;
$podium-second-width: 30%;
$podium-third-width: 30%;

$podium-first-height: 160px;
$podium-second-height: 120px;
$podium-third-height: 90px;
```

### Breakpoints (matching Tailwind)
```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

---

## Homepage Widget Styling

### 1. Hero Banner (`PublicHome.tsx`)

**Tailwind Classes:**
```jsx
<div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 py-12 sm:py-20 mb-8 full-banner-background">
```

**Custom SCSS:** `_banner.scss`
```scss
.full-banner-background {
  background-image: var(--banner-image);
  background-size: cover;
  background-position: center;
}
```

**Location:** Lines 142-233 in `PublicHome.tsx`

---

### 2. Countdown Timer

**HTML Structure:**
```jsx
<div className="countdown">
  <h3>Countdown Starts In</h3>
  <div className="countdown-timer">
    <div className="countdown-ticker">
      <div className="big-number">00</div>
      <div className="small-text">Days</div>
    </div>
  </div>
</div>
```

**Custom SCSS:** `_countdown.scss`
```scss
.countdown {
  color: $white;
  text-align: center;

  h3 {
    font-size: 1.25rem;
    text-transform: uppercase;
    font-weight: bold;
    color: $orange;
  }

  &-timer {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-ticker {
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(20px) brightness(0.7);
    border-radius: 1rem;
    padding: 1rem;

    .big-number {
      font-size: 3rem;
      font-weight: bold;
    }

    .small-text {
      font-size: 0.875rem;
      text-transform: uppercase;
      opacity: 0.7;
    }

    // Hides seconds on mobile
    &:nth-child(4n) {
      @media (max-width:640px) { display: none; }
    }
  }
}
```

**Location:** Lines 188-210 in `PublicHome.tsx`

---

### 3. Podium Display

**Tailwind Classes:**
```jsx
<div className="flex items-end justify-center gap-4">
  <div className="podium-first podium-base-first bg-gradient-to-br from-yellow-400 to-orange-500">
```

**Custom SCSS:** `_podium.scss`
```scss
.podium-first {
  width: $podium-first-width; // 35%
}

.podium-second,
.podium-third {
  width: $podium-second-width; // 30%
}

.podium-base-first {
  height: $podium-first-height; // 160px
}

.podium-base-second {
  height: $podium-second-height; // 120px
}

.podium-base-third-short {
  height: $podium-third-height; // 90px
}
```

**Component:** `src/components/Podium.tsx`

---

### 4. Commentary Quips (Speech Bubbles)

**HTML Structure:**
```jsx
<div className="commentary-quip">
  <div className="commentary-quip__tail"></div>
  <div className="commentary-quip__bubble">
    <div className="commentary-quip__content">
      <div className="commentary-quip__icon">🎙️</div>
      <div className="commentary-quip__text-wrapper">
        <p className="commentary-quip__text">{quip}</p>
      </div>
    </div>
  </div>
</div>
```

**Custom SCSS:** `_commentary.scss`
```scss
$commentary-bg: var(--color-yellow-400);

.commentary-quip {
  position: relative;
  margin-top: 1.5rem;
  filter: drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.15));

  &__tail {
    position: absolute;
    top: -0.75rem;
    left: calc(50% - 0.75rem);
    width: 1.5rem;
    height: 1.5rem;
    background: $commentary-bg;
    transform: rotate(45deg);
  }

  &__bubble {
    background: $commentary-bg;
    border-radius: 1rem;
    padding: 1rem 1.25rem;
  }

  &__icon {
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(to bottom right, #f97316, #ef4444);
    border-radius: 9999px;
  }

  &__text {
    font-size: 0.875rem;
    font-style: italic;
    font-weight: 500;

    &::before { content: '"'; }
    &::after { content: '"'; }
  }
}
```

**Component:** `src/components/CountdownQuip.tsx`

---

### 5. Song Cards

**Tailwind Classes:**
```jsx
<div
  className="relative w-full max-w-md aspect-square rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 song-card-background"
  style={{
    backgroundImage: song.thumbnail
      ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${song.thumbnail})`
      : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  }}
>
```

**Custom SCSS:** `_song-cards.scss`
```scss
.song-card-background {
  background-size: cover;
  background-position: center;
}
```

**Location:** Lines 188-396 in `PublicHome.tsx`

---

### 6. Leaderboard Cards

**Tailwind Classes:**
```jsx
<div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200">
  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-2">
    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50">
```

**Key Features:**
- Responsive grid: 1 column mobile → 2 columns on 2xl screens (1536px+)
- Conditional highlighting for top 3: `bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300`
- Efficiency progress bar: `bg-gradient-to-r from-green-400 to-blue-500`

**Location:** Lines 421-509, 605-693 in `PublicHome.tsx`

---

### 7. Welcome Message

**Tailwind Classes:**
```jsx
<div className="bg-gradient-to-r from-orange-100 via-yellow-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 sm:p-6 mb-6 welcome-message">
```

**Custom SCSS:** `_messages.scss`
```scss
.welcome-message {
  margin-top: -4rem;
}
```

**Location:** Lines 698-735 in `PublicHome.tsx`

---

## TV Display Optimization Tips

### Common Issues on Large Screens

1. **Text Too Small**
   - Increase base font sizes in Tailwind classes
   - Example: Change `text-sm sm:text-lg` → `text-lg sm:text-2xl`

2. **Content Too Narrow**
   - Adjust `max-w-7xl` (1280px max) → `max-w-[95vw]` for wider content
   - Remove max-width constraints on outer containers

3. **Spacing Too Tight**
   - Increase padding: `p-4 sm:p-6` → `p-6 sm:p-10`
   - Increase gaps: `gap-2` → `gap-6`

4. **Podium Too Small**
   - Edit `_variables.scss`:
     ```scss
     $podium-first-height: 240px;  // was 160px
     $podium-second-height: 180px; // was 120px
     ```

5. **Countdown Timer Too Small**
   - Edit `_countdown.scss`:
     ```scss
     .big-number {
       font-size: 5rem; // was 3rem
     }
     ```

### Recommended TV-Specific Adjustments

Create a custom media query for very large screens:

```scss
// Add to _variables.scss
$breakpoint-tv: 1920px;

// Use in component files
@media (min-width: $breakpoint-tv) {
  .countdown-ticker {
    padding: 2rem;
    .big-number {
      font-size: 6rem;
    }
  }
}
```

Or use Tailwind's arbitrary values:

```jsx
<h1 className="text-3xl xl:text-6xl 2xl:text-[5rem]">
```

---

## Making CSS Changes

### 1. Editing Tailwind Classes
Simply modify the `className` prop in components:

```jsx
// Before (too small on TV)
<h1 className="text-3xl sm:text-5xl">

// After (larger on TV)
<h1 className="text-4xl sm:text-6xl xl:text-7xl 2xl:text-8xl">
```

### 2. Editing SCSS Modules

1. Open the relevant file in `src/styles/`
2. Make your changes
3. Save (Vite auto-compiles)
4. Check `src/styles/compiled.css` (auto-generated)

**Example:** Make countdown bigger
```scss
// src/styles/_countdown.scss
.countdown-ticker {
  padding: 2rem; // was 1rem

  .big-number {
    font-size: 5rem; // was 3rem
  }
}
```

### 3. Testing Changes

```bash
npm run dev
```

Open in browser and test at different screen sizes using DevTools device emulation.

---

## Build Process

1. **Development:**
   ```bash
   npm run dev
   ```
   - Tailwind classes → processed by PostCSS
   - SCSS files → compiled to CSS
   - Hot reload on changes

2. **Production:**
   ```bash
   npm run build
   ```
   - Unused Tailwind classes removed (tree-shaking)
   - SCSS compiled and minified
   - Output: `dist/assets/index-*.css`

---

## Additional Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Tailwind v4 Changes:** https://tailwindcss.com/blog/tailwindcss-v4-alpha
- **SCSS/Sass Docs:** https://sass-lang.com/documentation
- **Component Locations:**
  - Podium: `src/components/Podium.tsx`
  - Countdown Quips: `src/components/CountdownQuip.tsx`
  - Public Home: `src/components/PublicHome.tsx`

---

## Quick Reference: Class Name Patterns

### Responsiveness
```
mobile → sm: → md: → lg: → xl: → 2xl:
0px    640px  768px  1024px 1280px  1536px
```

### Common Gradient
```jsx
className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
```

### Typical Card
```jsx
className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-orange-200"
```

### Flexbox Center
```jsx
className="flex items-center justify-center gap-4"
```

### Grid Responsive
```jsx
className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
```

---

**Last Updated:** January 2026
**Tailwind Version:** v4 (latest)
**Build Tool:** Vite + PostCSS
