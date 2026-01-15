# Commentary Speech Bubble Customization Guide

The commentary quips (both song and podium) use SCSS classes defined in `_commentary.scss` for easy customization.

## File Location
`src/styles/_commentary.scss`

## Class Structure

The commentary uses BEM (Block Element Modifier) naming convention:

```
.commentary-quip                    // Main container
  .commentary-quip__tail            // Triangle pointing to the widget above
  .commentary-quip__bubble          // Main speech bubble background
  .commentary-quip__content         // Inner content wrapper
  .commentary-quip__icon            // Commentator emoji circle
  .commentary-quip__text-wrapper    // Text container
  .commentary-quip__text            // The actual quote text
.commentary-quip--animated          // Modifier for slide-in animation
```

## Common Customizations

### Change Bubble Color
```scss
.commentary-quip__bubble {
  // Current: Orange gradient
  background: linear-gradient(to bottom right, #fed7aa, #ffedd5);

  // Example: Blue gradient
  background: linear-gradient(to bottom right, #bfdbfe, #dbeafe);
}

// Don't forget to update the tail color too!
.commentary-quip__tail {
  background: linear-gradient(to bottom right, #bfdbfe, #dbeafe);
  border-top-color: #bfdbfe;
  border-left-color: #bfdbfe;
}
```

### Change Icon Colors
```scss
.commentary-quip__icon {
  // Current: Orange to red gradient
  background: linear-gradient(to bottom right, #f97316, #ef4444);

  // Example: Purple gradient
  background: linear-gradient(to bottom right, #a855f7, #ec4899);
}
```

### Adjust Sizes
```scss
.commentary-quip__icon {
  width: 3rem;      // Icon size
  height: 3rem;
  font-size: 1.75rem; // Emoji size
}

.commentary-quip__text {
  font-size: 1.125rem; // Text size (default: 1rem)
}

.commentary-quip__bubble {
  padding: 1.5rem 2rem; // Internal spacing
  border-radius: 1.5rem; // Corner roundness
}
```

### Change Animation
```scss
// Modify the slide-in animation
@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px); // Slide from further up
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Or disable animation by removing the modifier class
// In CountdownQuip.tsx, change:
// <div className="commentary-quip commentary-quip--animated">
// to:
// <div className="commentary-quip">
```

### Add Border Effects
```scss
.commentary-quip__bubble {
  border: 3px solid #f97316; // Thicker border
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); // Larger shadow
}
```

### Change Text Style
```scss
.commentary-quip__text {
  font-style: normal;     // Remove italic
  font-weight: 600;       // Make bolder
  color: #0f172a;         // Darker text
  text-align: center;     // Center align

  // Remove quotes
  &::before,
  &::after {
    content: '';
  }
}
```

### Adjust Tail Position
```scss
.commentary-quip__tail {
  left: 4rem; // Move tail to the right
  top: -0.5rem; // Move tail down
  width: 2rem; // Make tail bigger
  height: 2rem;
}
```

## Responsive Breakpoints

The SCSS uses standard breakpoints:
- `640px` (sm) - Small tablets and large phones
- No explicit lg/xl needed - styles scale naturally

Example of adding a custom breakpoint:
```scss
.commentary-quip__text {
  font-size: 0.875rem;

  @media (min-width: 640px) {
    font-size: 1rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.125rem;
  }
}
```

## Tips

1. **Test on mobile** - The commentary is responsive, make sure your changes work on smaller screens
2. **Keep tail and bubble colors matched** - Otherwise the tail won't blend into the bubble
3. **Use variables** - Consider defining colors in `_variables.scss` for consistency
4. **Preview changes** - The dev server hot-reloads SCSS changes automatically

## Example: Dark Theme

```scss
.commentary-quip__bubble {
  background: linear-gradient(to bottom right, #374151, #1f2937);
  border-color: #4b5563;
}

.commentary-quip__tail {
  background: linear-gradient(to bottom right, #374151, #1f2937);
  border-top-color: #4b5563;
  border-left-color: #4b5563;
}

.commentary-quip__text {
  color: #e5e7eb; // Light gray text
}
```
