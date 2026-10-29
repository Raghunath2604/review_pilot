---
name: gsap
description: Master GSAP (GreenSock Animation Platform) skill for high-performance web animations, timelines, transforms, scroll-driven interactions, and React 18 integration (useGSAP, ScrollTrigger). Use when building or optimizing complex UI animations, SVG morphs, page transitions, or scroll effects.
repository: https://github.com/greensock/GSAP
---

# GSAP (GreenSock Animation Platform)

Comprehensive guide for implementing professional, 60+ FPS web animations using **GSAP 3** across React, modern frameworks, and vanilla JavaScript.

---

## 1. Installation & Setup

```bash
# Core package
npm install gsap

# For React applications (official GSAP React hook)
npm install @gsap/react
```

### Essential Imports & Plugin Registration

```typescript
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

// Always register plugins before using them
gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);
```

---

## 2. React 18 Integration with `useGSAP`

Always use `useGSAP` instead of raw `useEffect` to ensure automatic memory cleanup, context isolation, and React 18 StrictMode compatibility.

```tsx
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export const AnimatedCard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Scoped selector: only elements inside containerRef
      gsap.from('.stagger-item', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="stagger-item text-xl font-bold">ReviewPilot Analytics</h2>
      <p className="stagger-item text-slate-500">Real-time automated code health</p>
      <button className="stagger-item mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl">
        Inspect
      </button>
    </div>
  );
};
```

---

## 3. Timeline Sequencing

Timelines allow deterministic, controllable multi-step animations without nested `setTimeout` or callback hell.

```typescript
const tl = gsap.timeline({
  defaults: { duration: 0.6, ease: 'power2.out' },
  onComplete: () => console.log('Animation sequence complete'),
});

tl.from('.modal-backdrop', { opacity: 0 })
  .from('.modal-window', { scale: 0.92, opacity: 0, y: 20 }, '-=0.2') // Starts 0.2s before backdrop finishes
  .from('.modal-content > *', { y: 15, opacity: 0, stagger: 0.08 });
```

---

## 4. Scroll-Driven Animations (`ScrollTrigger`)

Link animations smoothly to page scroll position.

```typescript
gsap.from('.metric-card', {
  scrollTrigger: {
    trigger: '.metrics-grid',
    start: 'top 80%',     // When top of grid reaches 80% of viewport height
    end: 'bottom 20%',
    toggleActions: 'play none none reverse', // onEnter, onLeave, onEnterBack, onLeaveBack
    markers: false,        // Set true during development for visual debug pins
  },
  y: 40,
  opacity: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: 'power3.out',
});
```

---

## 5. Performance & Best Practices

1. **Only Animate GPU-Accelerated Properties**:
   - Prefer: `x`, `y`, `scale`, `rotation`, `opacity` (uses `transform` and `opacity` which do not trigger browser layout reflow).
   - Avoid: `top`, `left`, `width`, `height`, `margin` (triggers expensive CPU reflow).
2. **Batching & Staggering**:
   - Use `{ stagger: 0.1 }` instead of separate tweens.
3. **Accessibility**:
   - Respect `prefers-reduced-motion`:
     ```typescript
     const mm = gsap.matchMedia();
     mm.add('(prefers-reduced-motion: reduce)', () => {
       gsap.set('.animated-element', { opacity: 1, y: 0 });
     });
     ```
