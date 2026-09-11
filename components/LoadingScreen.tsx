'use client';

import React, { useState, useEffect } from 'react';
import CinematicLoader from './CinematicLoader';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  if (!loading) return null;

  return (
    <CinematicLoader
      durationMs={3000}
      onComplete={() => setLoading(false)}
    />
  );
}

