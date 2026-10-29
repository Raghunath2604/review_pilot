import React, { useRef, useState } from 'react';

interface MagnetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  padding?: number;
  className?: string;
}

export const MagnetButton: React.FC<MagnetButtonProps> = ({
  children,
  padding = 60,
  className = '',
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    if (Math.abs(distX) < width / 2 + padding && Math.abs(distY) < height / 2 + padding) {
      setPosition({
        x: distX * 0.2,
        y: distY * 0.2,
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      className={`relative inline-flex items-center justify-center font-semibold rounded-xl transition-all shadow-md active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
