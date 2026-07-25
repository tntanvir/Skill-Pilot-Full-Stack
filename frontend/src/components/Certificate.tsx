'use client';

import React from 'react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  validationId: string;
}

export default function Certificate({ studentName, courseName, completionDate, validationId }: CertificateProps) {
  return (
    <div id="certificate-container" className="w-[900px] h-[630px] bg-[#f9f9f9] relative font-sans text-slate-800 p-8 shadow-xl mx-auto overflow-hidden border border-slate-200">
      {/* Import Dancing Script for signatures via global CSS variable */}
      <style dangerouslySetInnerHTML={{ __html: `
        .font-signature {
          font-family: var(--font-dancing-script), cursive;
        }
      `}} />

      {/* Subtle Texture Overlay (using simple linear gradient for fast rendering) */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none" 
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(226,232,240,0.5) 100%)' }}
      ></div>

      {/* Gold Outer Border */}
      <div className="absolute inset-4 border-2 border-[#d4af37] rounded-sm z-10 pointer-events-none">
        {/* Corner Ornaments */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full border-2 border-[#d4af37] bg-[#f9f9f9]"></div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-[#d4af37] bg-[#f9f9f9]"></div>
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full border-2 border-[#d4af37] bg-[#f9f9f9]"></div>
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-[#d4af37] bg-[#f9f9f9]"></div>
      </div>

      {/* Inner Subtle Border */}
      <div className="absolute inset-6 border border-[#d4af37] opacity-30 rounded-sm z-10 pointer-events-none"></div>

      {/* Blue Ribbon (Left) */}
      <div className="absolute top-0 left-16 w-28 h-80 bg-[#002b5e] z-20 shadow-md flex flex-col items-center justify-end"
           style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}>
      </div>

      {/* Ribbon Seal Overlay */}
      <div className="absolute top-16 left-[50px] w-32 h-32 bg-[#004085] rounded-full z-30 shadow-lg border-[6px] border-white flex items-center justify-center"
           style={{ outline: '2px solid #002b5e' }}>
        <div className="w-28 h-28 rounded-full border-2 border-dashed border-white/50 flex flex-col items-center justify-center text-white text-center">
          <div className="flex gap-1 mb-1">
            <span className="text-[10px]">★</span>
            <span className="text-[10px] -mt-1">★</span>
            <span className="text-[10px]">★</span>
          </div>
          <span className="text-sm font-bold font-serif tracking-wider">SkillPilot</span>
          <div className="flex gap-1 mt-1">
            <span className="text-[10px]">★</span>
            <span className="text-[10px] mt-1">★</span>
            <span className="text-[10px]">★</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 h-full ml-[180px] flex flex-col pt-8 pl-8 pr-12">
        
        {/* Header Logo & Title */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">SP</div>
          <span className="text-2xl font-bold text-slate-600 tracking-widest">SkillPilot.io</span>
        </div>

        <h1 className="text-[44px] leading-none font-black text-slate-800 tracking-tight mb-8">
          CERTIFICATE OF ACHIEVEMENT
        </h1>

        <p className="text-base text-slate-500 mb-2 font-medium">This Certificate is proudly presented to</p>
        
        <div className="border-b-[3px] border-slate-700 pb-2 mb-8 inline-block w-[85%]">
          <h2 className="text-4xl font-bold text-slate-900">{studentName}</h2>
        </div>

        <p className="text-base text-slate-500 mb-2 font-medium">has successfully completed the</p>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-6">{courseName}</h3>

        <p className="text-sm text-slate-500 leading-relaxed max-w-lg mb-10">
          For successfully completing all modules and earning a certificate of excellence during {completionDate} at skillpilot.io.
        </p>

        {/* Footer removed per request */}

        {/* Validation Info (Absolute to the certificate bottom) */}
        <div className="flex justify-between text-[10px] text-slate-400 absolute bottom-4 w-[85%] pr-4">
          <p>Validation Number: {validationId}</p>
          <p>Validate at: http://skillpilot.io/verification</p>
        </div>

      </div>
    </div>
  );
}
