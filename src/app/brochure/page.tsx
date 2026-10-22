'use client';

import React from 'react';
import { Printer, ArrowRight, Code2, Cpu, Rocket } from 'lucide-react';

export default function BrochurePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#05070a] text-[#dfe7e0] font-sans antialiased selection:bg-[#e0231c] selection:text-white relative">
      
      {/* Print Styles to ensure backgrounds and page breaks work */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          .page-break { 
            page-break-after: always; 
            break-after: page; 
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}} />

      {/* Floating Print Button (Hidden when printing) */}
      <button 
        onClick={handlePrint}
        className="print-hidden fixed bottom-8 right-8 z-50 bg-[#e0231c] hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(224,35,28,0.4)] transition-all"
      >
        <Printer className="w-4 h-4" /> Print / Save PDF
      </button>

      {/* ================= PAGE 1: COVER ================= */}
      <div className="page-break w-full h-screen flex flex-col justify-between p-16 md:p-24 relative overflow-hidden bg-[#05070a]">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#dfe7e0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#e0231c]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start border-b border-[#dfe7e0]/10 pb-6">
          <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#e0231c]">Official Brief</div>
          <div className="font-mono text-xs tracking-[0.2em] text-[#78837c]">EST. 2026</div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center my-auto">
          {/* Using text to mimic your logo style */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl">
            CODE KOOTU<span className="text-[#e0231c]">.</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light tracking-tight text-[#dfe7e0] mb-4">
            We build what we wish existed.
          </p>
          <p className="text-sm md:text-base font-mono tracking-widest text-[#78837c] uppercase max-w-md mx-auto">
            An elite engineering collective turning real-world problems into functional prototypes.
          </p>
        </div>

        <div className="relative z-10 flex justify-between items-end border-t border-[#dfe7e0]/10 pt-6">
          <div className="font-mono text-xs tracking-widest text-[#78837c]">15 MINDS<br/>MULTIPLE DISCIPLINES<br/>ONE COLLECTIVE</div>
          <div className="w-12 h-12 bg-[#e0231c] flex items-center justify-center">
            <div className="w-4 h-4 bg-[#05070a]" />
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: THE COLLECTIVE ================= */}
      <div className="page-break w-full h-screen flex flex-col p-16 md:p-24 relative bg-[#05070a]">
        <div className="flex justify-between items-center border-b border-[#dfe7e0]/10 pb-4 mb-16">
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#e0231c] uppercase">01 // The Collective</h2>
          <span className="text-xs font-mono text-[#78837c]">CODE KOOTU</span>
        </div>

        <div className="space-y-12 flex-1">
          <div>
            <h3 className="text-4xl font-light tracking-tight mb-6">The Mission.</h3>
            <p className="text-lg text-[#aab4ad] leading-relaxed max-w-3xl">
              To discover and solve real-world problems by studying them deeply and engineering functional, life-ready prototypes. We empower individuals—from students to local business owners—to bring their ideas to life through collaborative innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#dfe7e0]/10">
            <div>
              <Code2 className="w-8 h-8 text-[#e0231c] mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Software Wing</h4>
              <p className="text-sm text-[#78837c] leading-relaxed">Architecture, Cloud Infrastructure, Security, and Embedded Firmware.</p>
            </div>
            <div>
              <Cpu className="w-8 h-8 text-[#e0231c] mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Hardware Wing</h4>
              <p className="text-sm text-[#78837c] leading-relaxed">Mechanical Engineering, RF Telemetry, Circuits, and Edge AI.</p>
            </div>
            <div>
              <Rocket className="w-8 h-8 text-[#e0231c] mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">Operations Wing</h4>
              <p className="text-sm text-[#78837c] leading-relaxed">Product Strategy, Community Triage, Brand Direction, and Pitching.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 3: THE PROTOCOL ================= */}
      <div className="page-break w-full h-screen flex flex-col p-16 md:p-24 relative bg-[#05070a]">
        <div className="flex justify-between items-center border-b border-[#dfe7e0]/10 pb-4 mb-16">
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#e0231c] uppercase">02 // The Intake Protocol</h2>
          <span className="text-xs font-mono text-[#78837c]">CODE KOOTU</span>
        </div>

        <h3 className="text-4xl font-light tracking-tight mb-12">From Brief to Build.</h3>

        <div className="space-y-8 flex-1 relative border-l border-[#dfe7e0]/10 ml-4 pl-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#05070a] border-2 border-[#e0231c] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#e0231c] rounded-full" />
            </div>
            <h4 className="text-xl font-medium text-white mb-2">01 // Submit Your Brief</h4>
            <p className="text-sm text-[#78837c]">Innovators log in to the Public Portal at codekootu.codes to submit their problems, ideas, or technical challenges.</p>
          </div>
          
          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#05070a] border-2 border-[#78837c]" />
            <h4 className="text-xl font-medium text-white mb-2">02 // The Workbench Review</h4>
            <p className="text-sm text-[#78837c]">A specialized member from our Software, Hardware, and Production wings reviews the idea, scoring it for technical feasibility and real-world impact.</p>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#05070a] border-2 border-[#78837c]" />
            <h4 className="text-xl font-medium text-white mb-2">03 // Executive Evaluation</h4>
            <p className="text-sm text-[#78837c]">The Chief Systems Architect conducts the final review, assessing the blueprint and approving the project for active deployment.</p>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-[#05070a] border-2 border-[#e0231c] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#e0231c] rounded-full" />
            </div>
            <h4 className="text-xl font-medium text-white mb-2">04 // Build & Track</h4>
            <p className="text-sm text-[#78837c]">Once approved, the project goes live. Our collective builds the prototype while the submitter tracks progress in real-time via their dashboard.</p>
          </div>
        </div>
      </div>

      {/* ================= PAGE 4: PARTNERSHIP ================= */}
      <div className="w-full h-screen flex flex-col p-16 md:p-24 relative bg-[#05070a]">
        <div className="flex justify-between items-center border-b border-[#dfe7e0]/10 pb-4 mb-16">
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#e0231c] uppercase">03 // Partnership & Scale</h2>
          <span className="text-xs font-mono text-[#78837c]">CODE KOOTU</span>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div>
              <h4 className="text-2xl font-medium text-white mb-2">You are a Co-Lead.</h4>
              <p className="text-sm text-[#78837c] leading-relaxed">When your idea is accepted, you become an active external team member. You work directly with our engineers to bring the prototype to life.</p>
            </div>
            <div>
              <h4 className="text-2xl font-medium text-white mb-2">The Scale-Up Pathway.</h4>
              <p className="text-sm text-[#78837c] leading-relaxed">We validate ideas rapidly at a small scale using ESP32, Arduino, and Web Apps. Once proven, we transition to larger production and funding.</p>
            </div>
            <div>
              <h4 className="text-2xl font-medium text-white mb-2">Fair Commission Sharing.</h4>
              <p className="text-sm text-[#78837c] leading-relaxed">We don't monetize small prototypes. However, for commercial solutions that generate revenue, commissions and profits are shared directly with you.</p>
            </div>
          </div>

          <div className="w-full md:w-[300px] bg-[#0a0e12] border border-[#dfe7e0]/10 p-8 flex flex-col items-center justify-center text-center rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#e0231c]/10 blur-[40px]" />
             <h5 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Join the Collective</h5>
             <p className="text-xs text-[#78837c] mb-6">Have a problem that needs solving? Scan to submit your brief.</p>
             
             {/* Dynamic QR Code using a public API */}
             <img 
               src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.codekootu.codes&bgcolor=0a0e12&color=dfe7e0" 
               alt="Scan to Portal" 
               className="w-40 h-40 rounded-lg mb-6"
             />
             
             <p className="text-[10px] font-mono tracking-widest text-[#e0231c] uppercase">www.codekootu.codes</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#dfe7e0]/10 flex justify-between items-center text-[10px] font-mono text-[#78837c] tracking-widest">
          <span>IDEAS / BUILD / SOLVE / TOGETHER</span>
          <span>© 2026 CODE KOOTU</span>
        </div>
      </div>

    </div>
  );
}
