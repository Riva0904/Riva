# Home Page - Digital Invitation Landing Page

## Overview
This is a complete landing page for the Digital Invitation application, converted from HTML to React components.

## Folder Structure

```
Home-page/
├── HomePage.tsx          # Main page component
├── styles.scss           # Shared styles (animations, effects)
└── components/           # Reusable components
    ├── Navbar.tsx        # Navigation bar with mobile menu toggle
    ├── MobileMenu.tsx    # Mobile responsive menu
    ├── Hero.tsx          # Hero section with title and image
    ├── Templates.tsx     # Templates showcase section
    ├── Features.tsx      # Features showcase section
    ├── Pricing.tsx       # Pricing plans section
    └── Footer.tsx        # Footer component
```

## Features Implemented

✅ **Responsive Design** - Mobile-first design using Tailwind CSS
✅ **Mobile Menu Toggle** - Hamburger menu for small screens
✅ **Animations** - Floating animations, shine effects, and smooth transitions
✅ **Gradient Text** - Custom gradient text styling
✅ **Feature Cards** - Glow border effects on hover
✅ **Pricing Cards** - Premium card with pulse animation
✅ **React Hooks** - Uses `useState` for menu state management
✅ **TypeScript** - Fully typed components with interfaces

## Component Details

### HomePage.tsx
Main container component that manages the menu state and renders all sections.

### Navbar.tsx
- Sticky navigation bar
- Brand logo with gradient text
- Desktop navigation links
- Mobile menu toggle button
- Login and Register buttons

### MobileMenu.tsx
- Hidden on desktop (md breakpoint)
- Shows/hides based on parent state
- Contains navigation links

### Hero.tsx
- Large heading with gradient text effect
- Floating animation on the image
- Call-to-action text

### Templates.tsx
- Displays 3 template cards
- Hover animations (lift and scale)
- Shine effect on cards

### Features.tsx
- 3 feature cards with icons
- Glow border effect on hover
- Dark background section

### Pricing.tsx
- 3 pricing plans
- Premium plan highlighted with pulse glow animation
- Different button styles for each plan

### Footer.tsx
- Simple footer with copyright

## Styling

All custom animations and effects are defined in `styles.scss`:
- `gradient-text` - Gradient text effect
- `float` - Floating animation
- `shine-card` - Shine effect on cards
- `card-hover` - Lift and scale on hover
- `nav-link` - Underline animation on hover
- `feature-card` - Glow border on hover
- `price-card` - Scale on hover
- `pulse-glow` - Pulsing glow animation

Tailwind CSS classes are used throughout for utility styling.

## Usage

The HomePage component is already integrated into App.tsx:

```tsx
import HomePage from './pages/Home-page/HomePage'

function App() {
  return <HomePage />
}
```

## Customization

- Update colors in the gradient-text class (currently purple to pink)
- Modify animation speeds in @keyframes
- Replace placeholder images in Templates.tsx
- Update links in Navbar and MobileMenu
- Adjust text content in each component

## Dependencies

- React 19+
- TypeScript
- Tailwind CSS (already configured in your project)
