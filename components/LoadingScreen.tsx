'use client';

import React, { useState, useEffect } from 'react';
import CinematicLoader from './CinematicLoader';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('mosphere_intro_seen');
    if (!hasLoaded) {
      setLoading(true);
    }
  }, []);

  if (!loading) return null;

  return (
    <CinematicLoader
      onComplete={() => {
        setLoading(false);
        try {
          sessionStorage.setItem('mosphere_intro_seen', 'true');
        } catch {}
      }}
    />
  );
}

