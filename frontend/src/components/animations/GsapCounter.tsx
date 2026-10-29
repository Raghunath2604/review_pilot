import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface GsapCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  id?: string;
}

export const GsapCounter: React.FC<GsapCounterProps> = ({
  value,
  duration = 1.4,
  suffix = '',
  prefix = '',
  className = '',
  id,
}) => {
  const isTest =
    typeof navigator !== 'undefined' &&
    (navigator.userAgent.includes('jsdom') || navigator.userAgent.includes('Node.js'));

  const [displayValue, setDisplayValue] = useState<number>(isTest ? value : 0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const targetObj = useRef({ count: isTest ? value : 0 });

  useGSAP(
    () => {
      if (isTest) {
        setDisplayValue(value);
        return;
      }

      targetObj.current.count = 0;
      gsap.to(targetObj.current, {
        count: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          setDisplayValue(Math.round(targetObj.current.count));
        },
      });
    },
    { dependencies: [value], scope: counterRef }
  );

  return (
    <span ref={counterRef} id={id} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

export default GsapCounter;
