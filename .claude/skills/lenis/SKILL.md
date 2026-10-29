---
name: lenis
description: Master Lenis Smooth Scroll skill for high-performance, butter-smooth virtual scrolling, momentum scrolling, and sync with GSAP ScrollTrigger in modern React/Next.js/vanilla web apps. Use when building smooth scroll experiences, parallax effects, or buttery page transitions without scroll hijacking.
repository: https://github.com/darkroomengineering/lenis
---

# Lenis Smooth Scroll

Comprehensive guide for implementing **Lenis**, the lightweight, robust, accessible smooth scroll library by **Darkroom Engineering**.

---

## 1. Installation

```bash
# Core vanilla package
npm install lenis

# React wrapper (React 18 & 19 compatible)
npm install lenis
```

---

## 2. React 18 Implementation (`lenis/react`)

```tsx
import React from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Optional: listen to scroll events
  const lenis = useLenis(({ scroll, velocity, direction, progress }) => {
    // Called on every scroll tick
  });

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,          // Lower = smoother / heavier momentum (default: 0.1)
        duration: 1.2,      // Duration of scroll animation
        smoothWheel: true,  // Enable smooth scroll for mouse wheel
        wheelMultiplier: 1, // Sensitivity multiplier
        touchMultiplier: 2, // Touch swipe sensitivity
        infinite: false,
      }}
    >
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </main>
    </ReactLenis>
  );
};
```

---

## 3. Synchronizing Lenis with GSAP ScrollTrigger

To prevent jitter between Lenis's virtual scroll and GSAP's scroll measurement, bind the GSAP ticker directly to Lenis:

```typescript
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useLenisGsapSync() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    });

    // 1. Sync Lenis scroll with ScrollTrigger updates
    lenis.on('scroll', ScrollTrigger.update);

    // 2. Drive Lenis updates with GSAP's high-precision ticker loop
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000); // GSAP provides time in seconds, Lenis expects milliseconds
    };
    gsap.ticker.add(updateTicker);

    // 3. Disable lag smoothing in GSAP to prevent timing desync
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);
}
```

---

## 4. Programmatic Scrolling & Anchor Links

Lenis handles smooth navigation to targets, IDs, or scroll positions:

```typescript
import { useLenis } from 'lenis/react';

export const ScrollToTopButton: React.FC = () => {
  const lenis = useLenis();

  const handleScrollToTop = () => {
    lenis?.scrollTo(0, {
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom exponential ease-out
    });
  };

  const handleScrollToSection = (targetId: string) => {
    lenis?.scrollTo(`#${targetId}`, {
      offset: -80, // Offset for sticky header navbar
      duration: 1.2,
    });
  };

  return (
    <button
      onClick={handleScrollToTop}
      className="p-3 bg-indigo-600 text-white rounded-full shadow-lg"
    >
      Scroll to Top
    </button>
  );
};
```

---

## 5. CSS Requirements & Best Practices

```css
/* Crucial Lenis CSS to ensure smooth scrolling behavior */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important; /* Disables native scroll-behavior to prevent conflict */
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain; /* Allows inner nested scroll containers without parent scrolling */
}

.lenis.lenis-stopped {
  overflow: hidden; /* Applied when modal is opened to lock scroll */
}
```
