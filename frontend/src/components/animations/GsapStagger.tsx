import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface GsapStaggerProps {
  children: React.ReactNode;
  selector?: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
  className?: string;
}

export const GsapStagger: React.FC<GsapStaggerProps> = ({
  children,
  selector = '.gsap-item',
  stagger = 0.08,
  duration = 0.6,
  delay = 0.1,
  y = 20,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll(selector);
      if (elements.length === 0) return;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default GsapStagger;
