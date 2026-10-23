'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Particle System
    const NUM_PARTICLES = 60;
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
    
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.8,
      });
    }

    const focalLength = 450;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const projected: { px: number; py: number; scale: number; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Reset particles that go too far
        if (p.z <= 10) p.z = 1000;
        if (p.z > 1000) p.z = 20;

        const scale = focalLength / p.z;
        const px = width / 2 + p.x * scale;
        const py = height / 2 + p.y * scale;
        const alpha = Math.min(Math.max((1 - p.z / 1000) * 0.8, 0.05), 0.9);

        projected.push({ px, py, scale, alpha });

        // Draw particle
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`; // Teal particles
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#2dd4bf';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw connecting lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            // Fade lines based on distance
            ctx.strokeStyle = `rgba(223, 231, 224, ${(1 - dist / 150) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#05070a]">
      {/* 3D Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#dfe7e0 1px, transparent 1px), linear-gradient(90deg, #dfe7e0 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Massive Floating Glowing Orbs */}
      <motion.div 
        animate={{ 
          x: ['-20%', '20%', '-20%'], 
          y: ['-10%', '30%', '-10%'],
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }} 
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-0 left-0 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-[#e0231c] rounded-full blur-[200px]" 
      />
      
      <motion.div 
        animate={{ 
          x: ['20%', '-20%', '20%'], 
          y: ['20%', '-20%', '20%'],
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.15, 0.05]
        }} 
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
        className="absolute bottom-0 right-0 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[#2dd4bf] rounded-full blur-[180px]" 
      />

      {/* Vignette to darken edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#05070a_100%)]" />
    </div>
  );
}
