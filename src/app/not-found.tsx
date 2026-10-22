'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NotFound() {
  // 1. Mouse Tracking for 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // 2. Glitch Effect State
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ perspective: '1200px' }} // Inline style guarantees this works
    >
      {/* --- BACKGROUND ELEMENTS --- */}
      
      {/* Glowing Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#e0231c 1px, transparent 1px), linear-gradient(90deg, #e0231c 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)'
        }}
      />

      {/* Massive Ambient Glows (Using standard classes for reliability) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#e0231c]/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#2dd4bf]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#e0231c]/50 blur-sm pointer-events-none"
          animate={{
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            bottom: '-10%',
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* --- MAIN 3D CONTENT --- */}
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 text-center flex flex-col items-center w-full max-w-3xl"
      >
        {/* 3D Extruded 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transform: "translateZ(60px)" }}
          className="relative"
        >
          {/* Glitch Layers */}
          <div className={`absolute inset-0 text-[140px] md:text-[240px] font-black tracking-tighter leading-none text-[#e0231c] transition-opacity duration-100 ${glitch ? 'opacity-70 translate-x-2 -translate-y-2 blur-[1px]' : 'opacity-0'}`}>
            404
          </div>
          <div className={`absolute inset-0 text-[140px] md:text-[240px] font-black tracking-tighter leading-none text-[#2dd4bf] transition-opacity duration-100 ${glitch ? 'opacity-70 -translate-x-2 translate-y-2 blur-[1px]' : 'opacity-0'}`}>
            404
          </div>

          {/* Main Text */}
          <div 
            className="text-[140px] md:text-[240px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-[#dfe7e0] to-[#78837c] relative z-10"
            style={{ textShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 80px rgba(224,35,28,0.2)' }}
          >
            404
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          style={{ transform: "translateZ(40px)" }}
          className="mt-8 flex flex-col items-center"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white drop-shadow-lg">
            Lost in the void.
          </h1>
          <p className="text-[#78837c] max-w-lg mx-auto mb-12 text-base md:text-lg leading-relaxed">
            The page you are looking for does not exist or has been moved into another dimension. Let's get you back to safety.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4" style={{ transform: "translateZ(50px)" }}>
            {/* Primary Back to Home Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/" 
                className="relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#dfe7e0] text-[#05070a] text-sm font-bold uppercase tracking-[0.15em] rounded-full overflow-hidden group shadow-[0_0_30px_rgba(223,231,224,0.2)] hover:shadow-[0_0_50px_rgba(223,231,224,0.4)] transition-all"
              >
                <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Home className="w-5 h-5 relative z-10 group-hover:-translate-y-1 transition-transform" /> 
                <span className="relative z-10">Back to Home</span>
              </Link>
            </motion.div>

            {/* Secondary Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/portal" 
                className="relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white text-sm font-bold uppercase tracking-[0.15em] rounded-full hover:bg-white/5 hover:border-white/40 transition-all"
              >
                <ArrowLeft className="w-5 h-5" /> 
                <span>Portal</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
