'use client';

import React, { useRef, useState } from 'react';

interface IdeaCard3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function IdeaCard3D({ children, className = '', glowColor = '#e0231c' }: IdeaCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 9;
    const rotateY = ((x - centerX) / centerX) * 9;

    setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-2xl bg-[#0a0e12]/90 backdrop-blur-xl border border-[#dfe7e0]/10 transition-colors shadow-2xl overflow-hidden group ${className}`}
    >
      {/* 3D dynamic cursor glare */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, ${glowColor}, transparent 70%)`,
          opacity: glare.opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
