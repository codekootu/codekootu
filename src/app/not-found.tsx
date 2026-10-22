'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function NotFound() {
  // Mouse tracking for 3D Parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movements
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to rotation degrees (how much it tilts)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  // Track mouse movement across the whole screen
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

  return (
    <main 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] flex flex-col items-center justify-center px-6 relative overflow-hidden perspective-[1000px]"
    >
      {/* Ambient Background Glows (Animated) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#e0231c]/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#78837c]/10 rounded-full blur-[100px] pointer-events-none" 
      />

      {/* 3D Container */}
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        {/* 3D Extruded 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transform: "translateZ(50px)" }}
          className="relative group"
        >
          <div className="text-[120px] md:text-[200px] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-[#78837c] drop-shadow-2xl">
            404
          </div>
          
          {/* Floating shadow for 3D depth */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 text-[120px] md:text-[200px] font-bold tracking-tighter leading-none text-[#e0231c]/20 blur-xl -z-10 translate-y-8"
          >
            404
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ transform: "translateZ(30px)" }}
          className="mt-6 flex flex-col items-center"
        >
          <h1 className="text-2xl md:text-4xl font-medium mb-4 tracking-tight">Lost in the void.</h1>
          <p className="text-[#78837c] max-w-md mx-auto mb-10 text-sm md:text-base">
            The page you are looking for does not exist or has been moved into another dimension. Let's get you back to safety.
          </p>

          {/* Animated Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ transform: "translateZ(40px)" }}
          >
            <Link 
              href="/" 
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-[#dfe7e0] text-[#05070a] text-xs font-bold uppercase tracking-[0.2em] rounded-full overflow-hidden group shadow-[0_0_40px_rgba(223,231,224,0.1)] hover:shadow-[0_0_60px_rgba(223,231,224,0.3)] transition-all"
            >
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              
              <ArrowLeft className="w-4 h-4 relative z-10 group-hover:-translate-x-1 transition-transform" /> 
              <span className="relative z-10">Return to Base</span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
