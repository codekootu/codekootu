import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#e0231c]/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 text-center flex flex-col items-center">
        <div className="text-[120px] md:text-[180px] font-normal tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-[#78837c] mb-6">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-medium mb-4">Lost in the void.</h1>
        <p className="text-[#78837c] max-w-md mx-auto mb-10">
          The page you are looking for does not exist or has been moved. Let's get you back to safety.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#dfe7e0] text-[#05070a] text-xs font-medium uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Base
        </Link>
      </div>
    </main>
  );
}
