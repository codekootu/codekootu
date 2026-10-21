'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';

// The image paths are now generated dynamically in the JSX using the ID.
const MEMBERS = [
  // Software Wing
  { id: 'CS-S-01', name: 'Noel Mathews', title: 'Chief Systems Architect & Technical Director', wing: 'Software' },
  { id: 'CS-S-02', name: 'Gokul G Krishna', title: 'Backend & Cloud Infrastructure Engineer', wing: 'Software' },
  { id: 'CY-S-14', name: 'Sayed Ibrahim', title: 'Systems Security & Web Experience Lead', wing: 'Software' },
  { id: 'CS-S-06', name: 'Ameen Puthiyottil', title: 'Application & Core Logic Developer', wing: 'Software' },
  { id: 'CS-S-05', name: 'Kevin Paul', title: 'Integration & Middleware Engineer', wing: 'Software' },
  { id: 'CS-S-11', name: 'Abdullah Ikhwan K A', title: 'Embedded Software & Firmware Engineer', wing: 'Software' },
  // Hardware Wing
  { id: 'ME-H-07', name: 'Austin M J', title: 'Lead Mechanical & Structural Engineer', wing: 'Hardware' },
  { id: 'EC-H-15', name: 'Muhammed Shahbaz K P', title: 'Lead Embedded Systems & Telemetry Engineer', wing: 'Hardware' },
  { id: 'CS-H-03', name: 'Abhinav Sanil', title: 'Circuit Architecture & Power Systems Specialist', wing: 'Hardware' },
  { id: 'CE-H-04', name: 'Sreehari Subhash', title: 'Environmental Sensing & Structural Dynamics Specialist', wing: 'Hardware' },
  { id: 'AD-H-12', name: 'Nevil Biju Mathew', title: 'Hardware Intelligence & Data Systems Specialist', wing: 'Hardware' },
  { id: 'AD-H-13', name: 'Arjun', title: 'Hardware Reliability & Field QA Specialist', wing: 'Hardware' },
  // Operations Wing
  { id: 'CS-P-10', name: 'Bestin George', title: 'Head of Product Strategy & Community Triage', wing: 'Operations' },
  { id: 'CS-P-08', name: 'Adwaith Ciju', title: 'Chief Pitch Architect & Communications Lead', wing: 'Operations' },
  { id: 'CS-P-09', name: 'Advaith B Nair', title: 'Brand Director & Media Production Lead', wing: 'Operations' },
];

export default function MembersPage() {
  const [selected, setSelected] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const closeModal = () => {
    setIsFlipped(false);
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <main className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] selection:bg-[#e0231c] selection:text-white pb-24">
      <nav className="sticky top-0 z-50 border-b border-[#dfe7e0]/10 bg-[#05070a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-[#dfe7e0] hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-[0.2em] uppercase">Back to Home</span>
          </Link>
          <div className="text-sm font-medium tracking-[0.25em] text-[#e0231c] uppercase">The Collective</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32">
        <div className="max-w-3xl mb-20">
          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#e0231c] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e0231c] shadow-[0_0_10px_#e0231c]" />
            Full Roster
          </div>
          <h1 className="text-5xl md:text-7xl font-normal tracking-tight mb-6">15 Minds.<br/>One Collective.</h1>
          <p className="text-lg md:text-xl text-[#aab4ad] leading-relaxed">
            Click any member to view their digital membership card.
          </p>
        </div>

        {['Software', 'Hardware', 'Operations'].map((wing) => (
          <div key={wing} className="mb-20">
            <div className="flex items-end justify-between border-b border-[#dfe7e0]/10 pb-4 mb-8">
              <h2 className="text-3xl font-normal tracking-tight">{wing} Wing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEMBERS.filter(m => m.wing === wing).map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelected(member)}
                  className="text-left group relative p-6 md:p-8 bg-[#0a0e12] border border-[#dfe7e0]/5 hover:border-[#e0231c]/40 transition-all duration-300 rounded-xl overflow-hidden"
                >
                  <div className="text-[10px] font-mono tracking-widest text-[#78837c] mb-4">{member.id}</div>
                  <h3 className="text-xl font-medium text-[#dfe7e0] mb-2 group-hover:text-white transition-colors">{member.name}</h3>
                  <p className="text-sm text-[#aab4ad] leading-relaxed mb-4">{member.title}</p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#dfe7e0]/10">
                    <span className="text-[10px] uppercase tracking-widest text-[#e0231c]">View Card →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3D Flip Card Modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 perspective-1500">
          <div 
            className="absolute inset-0 bg-[#05070a]/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={closeModal}
          />
          
          <div className="relative z-10 w-full max-w-sm">
            <button 
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Flip Container */}
            <div 
              className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d cursor-pointer shadow-2xl shadow-black/80 rounded-2xl`}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
            >
              
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden border border-[#dfe7e0]/20">
                <img 
                  src={`/cards/${selected.id}-front.png`} 
                  alt={`${selected.name} Front`} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x900/0a0e12/dfe7e0?text=Front+Missing'; }}
                />
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden border border-[#dfe7e0]/20" style={{ transform: 'rotateY(180deg)' }}>
                <img 
                  src={`/cards/${selected.id}-back.png`} 
                  alt={`${selected.name} Back`} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x900/0a0e12/dfe7e0?text=Back+Missing'; }}
                />
              </div>

            </div>
            
            <div className="text-center mt-6 text-[10px] uppercase tracking-widest text-[#78837c] animate-pulse">
              Tap card to flip
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
