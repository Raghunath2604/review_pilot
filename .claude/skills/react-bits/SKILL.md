---
name: react-bits
description: Master React Bits skill for implementing copy-paste animated React components, interactive statement pieces, dynamic backgrounds, and text animations (SpotlightCard, DecryptedText, BlurText, ShinyText, Hyperspeed, Particles, Waves, Magnet, PixelTrail). Use when elevating UI aesthetics to award-winning quality.
repository: https://github.com/DavidHDev/react-bits
website: https://reactbits.dev
---

# React Bits (Interactive UI & Animation System)

Comprehensive guide for implementing **React Bits** (`reactbits.dev`) components in modern React 18 / 19 applications using Tailwind CSS and Framer Motion / GSAP.

---

## 1. Dependencies Setup

React Bits components rely on Tailwind CSS and lightweight animation primitives:

```bash
npm install framer-motion lucide-react clsx tailwind-merge
```

### Utility Helper (`src/utils/cn.ts`)

```typescript
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 2. Component Categories Overview

| Category | Popular Components | Use Case |
| :--- | :--- | :--- |
| **Text Animations** | `SplitText`, `BlurText`, `DecryptedText`, `ShinyText`, `TrueFocus` | Hero headings, badges, interactive titles, loading reveals |
| **Backgrounds** | `Hyperspeed`, `Waves`, `Particles`, `Aurora`, `GridDistortion`, `Iridescence` | SaaS hero sections, full-page immersive backgrounds |
| **Components** | `SpotlightCard`, `TiltedCard`, `PixelCard`, `StarBorder`, `Magnet` | Dashboard cards, feature highlights, call-to-action buttons |
| **Animations** | `FadeContent`, `BlobCursor`, `PixelTrail`, `SplashCursor` | Micro-interactions, cursor trails, organic transitions |

---

## 3. Top Implementation Patterns

### A. SpotlightCard (Interactive Radial Glow on Hover)

```tsx
import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = 'rgba(99, 102, 241, 0.15)', // Indigo glow
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
```

### B. DecryptedText (Cyberpunk Hacker Text Reveal)

```tsx
import React, { useEffect, useState } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  characters = CHARS,
  className = '',
}) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / (maxIterations / text.length);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, characters]);

  return <span className={`font-mono ${className}`}>{displayText}</span>;
};
```

### C. Magnet (Magnetic Cursor Follow Effect)

```tsx
import React, { useRef, useState } from 'react';

export const Magnet: React.FC<{ children: React.ReactElement; padding?: number }> = ({
  children,
  padding = 100,
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetRef.current) return;
    const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distX = Math.abs(centerX - e.clientX);
    const distY = Math.abs(centerY - e.clientY);

    if (distX < width / 2 + padding && distY < height / 2 + padding) {
      setPosition({
        x: (e.clientX - centerX) * 0.25,
        y: (e.clientY - centerY) * 0.25,
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.15s ease-out',
      }}
      className="inline-block"
    >
      {children}
    </div>
  );
};
```

---

## 4. Best Practices for Production SaaS

1. **Avoid Overuse**: Use statement pieces (like `Hyperspeed` or `SplashCursor`) selectively on hero banners, landing headers, or empty-state moments rather than data-heavy dashboard tables.
2. **Accessible Contrast**: Always ensure text over animated backgrounds maintains a minimum WCAG AA contrast ratio of 4.5:1.
3. **Hardware Acceleration**: Set `will-change: transform` or `transform: translate3d(0, 0, 0)` on canvas/WebGL based components (`Waves`, `Particles`) to delegate rasterization to the GPU.
