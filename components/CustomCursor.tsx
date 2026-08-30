'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'view' | 'explore'>('default');
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only enable on desktop fine pointer devices
    const checkIsDesktop = () => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isWideScreen = window.innerWidth >= 1024;
      const enabled = isFinePointer && isWideScreen;
      setIsDesktop(enabled);
      if (enabled) {
        document.body.classList.add('custom-cursor-enabled');
      } else {
        document.body.classList.remove('custom-cursor-enabled');
      }
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Inspect target element for cursor hints
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const galleryEl = target.closest('[data-cursor="view"]');
      const serviceEl = target.closest('[data-cursor="explore"]');
      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"], .interactive-hover');

      if (galleryEl) {
        setCursorVariant('view');
        setCursorText('VIEW');
      } else if (serviceEl) {
        setCursorVariant('explore');
        setCursorText('EXPLORE');
      } else if (interactiveEl) {
        setCursorVariant('hover');
        setCursorText('');
      } else {
        setCursorVariant('default');
        setCursorText('');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('resize', checkIsDesktop);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, [isVisible]);

  if (!isDesktop || !isVisible) return null;

  const variants = {
    default: {
      x: mousePosition.x - 5,
      y: mousePosition.y - 5,
      height: 10,
      width: 10,
      backgroundColor: '#D4AF37',
      border: '1px solid rgba(212, 175, 55, 0.8)',
    },
    hover: {
      x: mousePosition.x - 18,
      y: mousePosition.y - 18,
      height: 36,
      width: 36,
      backgroundColor: 'rgba(212, 175, 55, 0.15)',
      border: '1.5px solid #D4AF37',
      backdropFilter: 'blur(2px)',
    },
    view: {
      x: mousePosition.x - 32,
      y: mousePosition.y - 32,
      height: 64,
      width: 64,
      backgroundColor: 'rgba(212, 175, 55, 0.92)',
      border: '1.5px solid #F3E5AB',
    },
    explore: {
      x: mousePosition.x - 36,
      y: mousePosition.y - 36,
      height: 72,
      width: 72,
      backgroundColor: 'rgba(212, 175, 55, 0.92)',
      border: '1.5px solid #F3E5AB',
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full flex items-center justify-center text-center shadow-[0_0_20px_rgba(212,175,55,0.4)]"
      variants={variants}
      animate={cursorVariant}
      transition={{
        type: 'spring',
        stiffness: 700,
        damping: 38,
        mass: 0.2,
      }}
    >
      {cursorText && (
        <span className="text-[9px] font-sans font-bold tracking-[0.2em] text-black uppercase select-none">
          {cursorText}
        </span>
      )}
    </motion.div>
  );
}
