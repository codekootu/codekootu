'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';

type Member = { id: string | null; name: string; title: string; dept: string; wing: string; bridge?: string };

// id = membership/credential ID (used to load /cards/<id>-front.png). Use null if a member has no card yet.
const MEMBERS: Member[] = [
  // Software Engineering
  { id: 'CS-S-01', name: 'Noel Mathews', title: 'Chief Systems Architect & Technical Director', dept: 'CSE', wing: 'Software', bridge: 'Team Lead' },
  { id: 'CS-S-02', name: 'Gokul G Krishna', title: 'Backend & Cloud Infrastructure Engineer', dept: 'CSE', wing: 'Software' },
  { id: 'CS-S-05', name: 'Kevin Paul', title: 'Integration & Middleware Engineer', dept: 'CSE', wing: 'Software' },
  { id: 'CS-S-06', name: 'Ameen Puthiyottil', title: 'Application & Core Logic Developer', dept: 'CSE', wing: 'Software' },
  { id: 'CS-S-11', name: 'Abdullah Ikhwan K A', title: 'Embedded Software & Firmware Engineer', dept: 'CSE', wing: 'Software', bridge: 'Bridge: Software ↔ Hardware' },
  { id: 'CS-S-16', name: 'Darshana D Shenoy', title: 'Frontend / Web Developer', dept: 'CSE', wing: 'Software' },
  { id: 'CS-S-17', name: 'Feba Bobby George', title: 'Full Stack Developer', dept: 'CSE', wing: 'Software' },
  // Cyber Security
  { id: 'CY-S-14', name: 'Sayed Ibrahim', title: 'Systems Security & Web Experience Lead', dept: 'Cyber Security', wing: 'Cyber', bridge: 'Bridge: Software ↔ Cyber' },
  { id: 'CY-P-18', name: 'Sanjay S', title: 'Security Analyst / Penetration Tester', dept: 'Cyber Security', wing: 'Cyber' },
  { id: 'VL-C-19', name: 'Edwin M John', title: 'Hardware Security & Embedded Silicon Engineer', dept: 'Cyber Security', wing: 'Cyber' },
  { id: 'CS-S-09', name: 'Aaron Regi Thomas', title: 'Application Security & DevSecOps Engineer', dept: 'CSE', wing: 'Cyber' },
  // Hardware Engineering
  { id: 'EC-H-15', name: 'Muhammed Shahbaz K P', title: 'Lead Embedded Systems & Telemetry Engineer', dept: 'EC', wing: 'Hardware' },
  { id: 'CS-H-03', name: 'Abhinav Sanil', title: 'Circuit Architecture & Power Systems Specialist', dept: 'CSE', wing: 'Hardware' },
  { id: 'AD-H-12', name: 'Nevil Biju Mathew', title: 'Hardware Intelligence & Data Systems Specialist', dept: 'AI / DS', wing: 'Hardware' },
  { id: 'EC-H-20', name: 'Christy Kuruvilla', title: 'VLSI Design / PCB Layout Engineer', dept: 'VLSI', wing: 'Hardware' },
  { id: 'ME-H-07', name: 'Austin M J', title: 'Lead Mechanical & Structural Engineer', dept: 'Mechanical / Civil', wing: 'Hardware' },
  { id: 'CE-H-04', name: 'Sreehari Subhash', title: 'Environmental Sensing & Structural Dynamics Specialist', dept: 'Civil / Mech', wing: 'Hardware', bridge: 'Bridge: Hardware ↔ Software' },
  { id: 'AD-H-13', name: 'Arjun', title: 'Hardware Reliability & Field QA Specialist', dept: 'Mechanical', wing: 'Hardware' },
  // Media & Outreach
  { id: 'CS-P-10', name: 'Bestin George', title: 'Head of Product Strategy & Community Triage', dept: 'Outreach', wing: 'Media & Outreach' },
  { id: 'CS-P-08', name: 'Adwaith Ciju', title: 'Chief Pitch Architect & Communications Lead', dept: 'Outreach', wing: 'Media & Outreach' },
];

// Shown in his own section at the very end of the page.
const ADVAITH: Member = { id: 'CS-P-09', name: 'Advaith B Nair', title: 'Brand Director & Media Production Lead', dept: 'Founding Member', wing: 'Forever Kootu' };
// Wing display order
const WINGS = ['Software', 'Cyber', 'Hardware', 'Media & Outreach'];
const WING_LABELS: Record<string, string> = {
  'Software': 'Software Engineering',
  'Cyber': 'Cyber Security',
  'Hardware': 'Hardware Engineering',
  'Media & Outreach': 'Media & Outreach',
};

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
          <h1 className="text-5xl md:text-7xl font-normal tracking-tight mb-6">20 Minds.<br/>One Collective.</h1>
          <p className="text-lg md:text-xl text-[#aab4ad] leading-relaxed">
            Click any member to view their digital membership card.
          </p>
        </div>

        {WINGS.map((wing, wi) => (
          <div key={wing} className="mb-20">
            <div className="flex items-end justify-between border-b border-[#dfe7e0]/10 pb-4 mb-8">
              <h2 className="text-3xl font-normal tracking-tight">
                <span className="text-[#e0231c] font-mono text-sm tracking-widest mr-3">0{wi + 1}</span>{WING_LABELS[wing]}
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-[#78837c]">{MEMBERS.filter(m => m.wing === wing).length} members</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {MEMBERS.filter(m => m.wing === wing).map((member) => (
                <button
                  key={member.id}
                  onClick={() => member.id && setSelected(member)}
                  className="text-left group relative w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] p-6 md:p-8 bg-[#0a0e12] border border-[#e0231c]/30 hover:border-[#e0231c] shadow-[0_0_30px_rgba(224,35,28,0.12)] hover:shadow-[0_0_40px_rgba(224,35,28,0.25)] transition-all duration-300 rounded-xl overflow-hidden"
                >
                  <div className="text-[10px] font-mono tracking-widest text-[#78837c] mb-4">{member.id ?? 'ID PENDING'}</div>
                  <h3 className="text-xl font-medium text-[#dfe7e0] mb-2 group-hover:text-white transition-colors">{member.name}</h3>
                  <p className="text-sm text-[#aab4ad] leading-relaxed mb-2">{member.title}</p>
                  <p className="text-[11px] text-[#78837c] mb-2">{member.dept}</p>
                  {member.bridge && <p className="text-[10px] uppercase tracking-widest text-[#2dd4bf]">{member.bridge}</p>}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#dfe7e0]/10">
                    <span className="text-[10px] uppercase tracking-widest text-[#e0231c]">{member.id ? 'View Card →' : 'Card coming soon'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Forever Kootu: dedicated section */}
        <div className="mt-8 mb-10 pt-16 border-t border-[#dfe7e0]/10 text-center max-w-2xl mx-auto">
          <div className="text-[10px] font-medium tracking-[0.32em] uppercase text-[#e0231c] mb-6 flex items-center justify-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e0231c] shadow-[0_0_10px_#e0231c]" />
            Forever Kootu
          </div>
          <h2 className="text-3xl md:text-4xl font-normal tracking-tight mb-4">Always one of us.</h2>
          <p className="text-[#aab4ad] leading-relaxed mb-10">
            Advaith decided to pursue MBBS and hence had to leave team codekootu, but he will always be one of us in our hearts.
            The collective was built with him, and his mark stays on everything we make.
          </p>
          <div className="text-left relative w-full max-w-md mx-auto p-6 md:p-8 bg-[#0a0e12] border border-[#e0231c]/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(224,35,28,0.12)]">
            <h3 className="text-xl font-medium text-white mb-2">{ADVAITH.name}</h3>
            <p className="text-sm text-[#aab4ad] leading-relaxed">{ADVAITH.title}</p>
            <div className="mt-6 pt-6 border-t border-[#dfe7e0]/10">
              <span className="text-[10px] uppercase tracking-widest text-[#e0231c]">Forever part of the collective</span>
            </div>
          </div>
        </div>
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
              className={`relative w-full aspect-[2/3] transition-transform duration-700 transform-style-3d cursor-pointer shadow-2xl shadow-black/80`}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
            >
              
              {/* FRONT OF CARD */}
              <div className="absolute inset-0 backface-hidden bg-transparent">
                <img 
                  src={`/cards/${selected.id}-front.png`} 
                  alt={`${selected.name} Front`} 
                  className="w-full h-full object-contain rounded-2xl" 
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x900/0a0e12/dfe7e0?text=Front+Missing'; }}
                />
              </div>

              {/* BACK OF CARD */}
              <div className="absolute inset-0 backface-hidden bg-transparent" style={{ transform: 'rotateY(180deg)' }}>
                <img 
                  src={`/cards/${selected.id}-back.png`} 
                  alt={`${selected.name} Back`} 
                  className="w-full h-full object-contain rounded-2xl" 
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
