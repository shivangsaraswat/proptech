# Mobile-First Design Guide

## Philosophy

**Design for mobile FIRST, enhance for desktop LATER.**

This system is built for property managers, tenants, and technicians who are often on-the-go. Mobile is the primary interface, not an afterthought.

---

## Mobile Viewport Targets

| Device | Width | Height | Notes |
|--------|-------|--------|-------|
| iPhone SE | 320px | 568px | Minimum supported width |
| iPhone 12/13 Mini | 375px | 812px | Common small phone |
| iPhone 12/13/14 | 390px | 844px | Most common iPhone |
| iPhone 14 Pro Max | 428px | 926px | Large phone |
| Android (avg) | 360px - 412px | Variable | Most Android devices |

**Design target: 320px - 428px width, thumb-optimized navigation**

---

## Touch Targets

### Minimum Sizes
- **Apple HIG:** 44x44px minimum
- **Material Design:** 48x48px recommended
- **Our standard:** 48x48px for primary actions, 44x44px minimum for secondary

### Examples
```css
/* Primary button */
.btn-primary {
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
}

/* Icon button */
.btn-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* List item (full-width tap) */
.list-item {
  min-height: 64px;
  padding: 12px 16px;
  cursor: pointer;
}

/* Bottom nav item */
.nav-item {
  width: 64px;
  height: 64px;
  flex-direction: column;
  gap: 4px;
}
```

---

## Typography

### Prevent iOS Auto-Zoom
iOS Safari auto-zooms when focusing input fields with font-size < 16px.

```css
/* ✅ Correct - prevents zoom */
input, textarea, select {
  font-size: 16px;
  line-height: 1.5;
}

/* ❌ Avoid - triggers zoom */
input {
  font-size: 14px; /* Will zoom on focus */
}
```

### Mobile Type Scale
```css
/* Headings */
.text-h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
.text-h2 { font-size: 24px; font-weight: 600; line-height: 1.3; }
.text-h3 { font-size: 20px; font-weight: 600; line-height: 1.4; }

/* Body */
.text-body { font-size: 16px; line-height: 1.5; }
.text-sm { font-size: 14px; line-height: 1.5; }
.text-xs { font-size: 12px; line-height: 1.4; }

/* Labels */
.text-label { font-size: 14px; font-weight: 500; letter-spacing: 0.5px; }
```

---

## Navigation Patterns

### Bottom Tab Bar (Primary on Mobile)

**Anatomy:**
- Height: 64px
- Positioned: Fixed bottom
- Safe area: Add padding-bottom for home indicator
- Max items: 5 (more requires "More" tab)
- Active state: Bold text + colored icon

```tsx
// Bottom Nav Component
<nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-gray-200 safe-area-bottom">
  <div className="flex justify-around items-center h-full">
    <NavItem icon={HomeIcon} label="Home" active />
    <NavItem icon={TicketIcon} label="Tickets" />
    <NavItem icon={PlusIcon} label="New" />
    <NavItem icon={BellIcon} label="Alerts" badge={3} />
    <NavItem icon={UserIcon} label="Me" />
  </div>
</nav>
```

**Thumb Zone Optimization:**
- Most comfortable: Bottom 1/3 of screen
- Hardest to reach: Top corners
- Place primary actions at bottom
- Place secondary actions at top

### Sidebar (Desktop Only)

```tsx
// Responsive sidebar
<aside className="hidden lg:block w-64 border-r border-gray-200">
  {/* Desktop sidebar content */}
</aside>
```

---

## Layout Patterns

### Mobile-First Grid

```css
/* Default: Single column (mobile) */
.grid-responsive {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3-4 columns */
@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Stats Cards
```tsx
// Mobile: 2x2 grid
<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
  <StatCard label="Open" value={12} />
  <StatCard label="Assigned" value={8} />
  <StatCard label="In Progress" value={15} />
  <StatCard label="Urgent" value={3} />
</div>
```

### Full-Width Cards (Mobile)
```tsx
// Mobile-first card
<div className="w-full bg-white rounded-lg shadow p-4 active:bg-gray-50">
  {/* Card content */}
</div>
```

---

## Modals & Sheets

### Mobile: Bottom Sheet (Slide-Up)
```tsx
// Use Shadcn Sheet for mobile modals
<Sheet>
  <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
    <SheetHeader>
      <SheetTitle>Filter Tickets</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

### Desktop: Centered Dialog
```tsx
<Dialog>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Filter Tickets</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Responsive Modal Hook
```tsx
const isMobile = useMediaQuery("(max-width: 768px)");

return isMobile ? (
  <Sheet>{/* Sheet content */}</Sheet>
) : (
  <Dialog>{/* Dialog content */}</Dialog>
);
```

---

## Forms

### Mobile-Optimized Inputs

```tsx
<input
  type="email"
  inputMode="email" // Shows email keyboard
  autoComplete="email"
  className="w-full h-12 px-4 text-base rounded-lg border"
/>

<input
  type="tel"
  inputMode="tel" // Shows phone keyboard
  autoComplete="tel"
  className="w-full h-12 px-4 text-base rounded-lg border"
/>

<input
  type="text"
  inputMode="numeric" // Shows number keyboard
  pattern="[0-9]*"
  className="w-full h-12 px-4 text-base rounded-lg border"
/>
```

### Input Modes
- `inputMode="text"` - Standard keyboard
- `inputMode="email"` - Email keyboard (@, .)
- `inputMode="tel"` - Phone keyboard (numbers, +)
- `inputMode="numeric"` - Number keyboard (0-9)
- `inputMode="decimal"` - Decimal keyboard (0-9, .)
- `inputMode="search"` - Search keyboard (Go button)

### Priority Selector (Mobile-Friendly)

```tsx
// ❌ Avoid: Small radio buttons
<RadioGroup>
  <Radio value="low">Low</Radio>
  <Radio value="medium">Medium</Radio>
</RadioGroup>

// ✅ Better: Large radio cards
<div className="grid grid-cols-2 gap-3">
  <RadioCard value="low" icon={<CircleIcon />}>
    <span className="text-sm">Low</span>
  </RadioCard>
  <RadioCard value="medium" icon={<AlertIcon />}>
    <span className="text-sm">Medium</span>
  </RadioCard>
  <RadioCard value="high" icon={<WarningIcon />}>
    <span className="text-sm">High</span>
  </RadioCard>
  <RadioCard value="urgent" icon={<FireIcon />}>
    <span className="text-sm">Urgent</span>
  </RadioCard>
</div>
```

### Sticky Submit Button

```tsx
<form>
  <div className="pb-20"> {/* Add padding for sticky button */}
    {/* Form fields */}
  </div>
  
  <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t safe-area-bottom">
    <button type="submit" className="w-full h-12 bg-blue-600 text-white rounded-lg">
      Submit Ticket
    </button>
  </div>
</form>
```

---

## Images & Media

### Mobile Camera Integration

```tsx
import { useDropzone } from "react-dropzone";

const ImageUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: handleUpload,
  });

  return (
    <div {...getRootProps()} className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
      <input {...getInputProps()} capture="environment" /> {/* Opens camera on mobile */}
      <div className="text-center">
        <CameraIcon className="w-8 h-8 mx-auto mb-2" />
        <p>Tap to capture or upload</p>
      </div>
    </div>
  );
};
```

### Image Gallery (Swipeable)

```tsx
// Use Embla Carousel or similar for swipeable image gallery
<Carousel>
  {images.map((img) => (
    <CarouselItem key={img.id}>
      <img src={img.url} alt="" className="w-full h-64 object-cover" />
    </CarouselItem>
  ))}
</Carousel>
```

### Lazy Loading

```tsx
<img
  src={image.url}
  alt={image.alt}
  loading="lazy"
  className="w-full h-auto"
/>
```

---

## Gestures

### Pull-to-Refresh
```tsx
// Use a library like react-pull-to-refresh
import PullToRefresh from "react-pull-to-refresh";

<PullToRefresh onRefresh={refetch}>
  <TicketList tickets={tickets} />
</PullToRefresh>
```

### Swipe Actions
```tsx
// Use react-swipeable or similar
import { useSwipeable } from "react-swipeable";

const handlers = useSwipeable({
  onSwipedLeft: () => handleDelete(),
  onSwipedRight: () => handleArchive(),
});

<div {...handlers} className="ticket-card">
  {/* Card content */}
</div>
```

---

## Safe Areas (iPhone X+)

### CSS Environment Variables

```css
/* Account for notch and home indicator */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}
```

### Tailwind Plugin
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
};
```

---

## Performance Optimizations

### Mobile-Specific
1. **Code Splitting:** Load mobile components separately
2. **Image Optimization:** WebP format, srcset for responsive images
3. **Lazy Loading:** Images, components, routes
4. **Service Worker:** Offline support (optional)
5. **Bundle Size:** Keep JS bundle < 200KB gzipped

### React Query Settings for Mobile
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 10, // 10 min
      retry: 1, // Limit retries on slow networks
      refetchOnWindowFocus: false, // Disable on mobile (drains battery)
      refetchOnReconnect: true, // Refetch when network returns
    },
  },
});
```

---

## Testing Checklist

### Device Testing
- [ ] iPhone SE (320px) - Smallest screen
- [ ] iPhone 12/13 (390px) - Most common
- [ ] iPhone Pro Max (428px) - Largest iPhone
- [ ] Android device (360px-412px) - Most common Android
- [ ] Tablet (768px-1024px) - iPad
- [ ] Desktop (>1024px) - Progressive enhancement

### Browser Testing
- [ ] Safari iOS (most important)
- [ ] Chrome Android
- [ ] Samsung Internet (common in Asia)

### Network Testing
- [ ] Fast 3G (Chrome DevTools)
- [ ] Slow 3G (worst case)
- [ ] Offline mode (should show error, not crash)

### Interaction Testing
- [ ] One-handed thumb operation
- [ ] Landscape mode (optional)
- [ ] Accessibility (VoiceOver, TalkBack)
- [ ] Swipe gestures work
- [ ] Pull-to-refresh works
- [ ] Form submission doesn't zoom
- [ ] No horizontal scroll

---

## Common Mobile Pitfalls

### ❌ Don't
- Use hover states (no hover on mobile)
- Use small touch targets (<44px)
- Force landscape mode
- Use modal dialogs that cover entire screen without dismiss
- Use tiny font sizes (<16px for inputs)
- Rely on tooltips (no hover)
- Use horizontal scroll without visual indicators
- Block pinch-to-zoom unnecessarily

### ✅ Do
- Use active states (tap feedback)
- Use large touch targets (48px+)
- Support both orientations
- Use bottom sheets on mobile
- Use readable font sizes (16px+)
- Use clear icons with labels
- Show scroll indicators
- Allow zoom when needed

---

## Responsive Breakpoints

```css
/* Tailwind breakpoints (mobile-first) */
/* sm: 640px  - Large phone landscape */
/* md: 768px  - Tablet portrait */
/* lg: 1024px - Tablet landscape / Small desktop */
/* xl: 1280px - Desktop */
/* 2xl: 1536px - Large desktop */

/* Custom breakpoints for this app */
@media (max-width: 767px) {
  /* Mobile: Bottom nav, full-width cards, stacked layout */
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet: Side nav (collapsible), 2-column grids */
}

@media (min-width: 1024px) {
  /* Desktop: Permanent sidebar, multi-column */
}
```

---

## Mobile-First Component Patterns

### Responsive Container
```tsx
<div className="
  w-full px-4 mx-auto
  md:max-w-3xl md:px-6
  lg:max-w-5xl lg:px-8
">
  {children}
</div>
```

### Responsive Button
```tsx
<button className="
  w-full h-12 px-4 text-base font-semibold rounded-lg
  md:w-auto md:px-6
  lg:h-10
">
  Submit
</button>
```

### Responsive Navigation
```tsx
{/* Mobile: Bottom nav */}
<nav className="fixed bottom-0 inset-x-0 lg:hidden">
  <BottomNav />
</nav>

{/* Desktop: Sidebar */}
<aside className="hidden lg:block">
  <Sidebar />
</aside>
```

---

## Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://m2.material.io/design/usability/accessibility.html#layout-and-typography)
- [iOS Safe Areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Input Types & Modes](https://better-mobile-inputs.netlify.app/)
