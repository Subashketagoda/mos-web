import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full border border-mosphere-gold flex items-center justify-center mb-6 shadow-goldGlow">
        <span className="font-serif text-2xl font-bold text-mosphere-gold">M</span>
      </div>

      <span className="text-xs uppercase tracking-[0.3em] text-mosphere-gold font-medium block mb-4">
        404 — NOT FOUND
      </span>

      <h1 className="font-serif text-3xl sm:text-5xl font-light text-white mb-6">
        &ldquo;THIS SPACE IS CURRENTLY UNDISCOVERED.&rdquo;
      </h1>

      <p className="text-xs sm:text-sm text-white/50 max-w-md mb-8 font-light">
        The sanctuary you are looking for has been moved or does not exist.
      </p>

      <Link
        href="/"
        className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider text-black bg-gradient-to-r from-mosphere-gold via-mosphere-goldLight to-mosphere-goldDark shadow-goldGlow uppercase"
      >
        BACK TO MOSPHERE
      </Link>
    </div>
  );
}
