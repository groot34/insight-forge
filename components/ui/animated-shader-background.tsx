"use client";

import React from 'react';
import Image from 'next/image';

const AnoAI = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#0a0a1a] to-[#1a1a2e] opacity-80" />
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
         {/* Using CSS gradient as a lightweight alternative to the heavy shader */}
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-slow-spin bg-[conic-gradient(from_0deg_at_50%_50%,#000000_0deg,#1a1a2e_60deg,#2e1a4d_120deg,#000000_180deg,#1a1a2e_240deg,#2e1a4d_300deg,#000000_360deg)] filter blur-[100px]" />
      </div>
    </div>
  );
};

export default AnoAI;
