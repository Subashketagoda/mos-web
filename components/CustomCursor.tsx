'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'view' | 'explore'>('default');
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const currentVariantRef = useRef<'default' | 'hover' | 'view' | 'explore'>('default');

  // Ultra-smooth Hardware GPU Motion Values (0 React Re-renders on mouse movement)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const cursorX = useSpring(mouseX, { damping: 35, stiffness: 600, mass: 0.15 });
  const cursorY = useSpring(mouseY, { damping: 35, stiffness: 600, mass: 0.15 });

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
    window.addEventListener('resize', checkIsDesktop, { passive: true });

    let lastTarget: EventTarget | null = null;

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      // Only check target hierarchy if target changed to save CPU cycles
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        const target = e.target as HTMLElement | null;
        if (!target) return;

        let nextVariant: 'default' | 'hover' | 'view' | 'explore' = 'default';
        let nextText = '';

        if (target.closest('[data-cursor="view"]')) {
          nextVariant = 'view';
          nextText = 'VIEW';
        } else if (target.closest('[data-cursor="explore"]')) {
          nextVariant = 'explore';
          nextText = 'EXPLORE';
        } else if (target.closest('button, a, input, select, textarea, [role="button"], .interactive-hover')) {
          nextVariant = 'hover';
          nextText = '';
        }

        if (nextVariant !== currentVariantRef.current) {
          currentVariantRef.current = nextVariant;
          setCursorVariant(nextVariant);
          setCursorText(nextText);
        }
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter, { passive: true });

    return () => {
      window.removeEventListener('resize', checkIsDesktop);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, []);

  if (!isDesktop || !isVisible) return null;

  const variantStyles = {
    default: {
      width: 10,
      height: 10,
      x: -5,
      y: -5,
      backgroundColor: '#D4AF37',
      borderColor: 'rgba(212, 175, 55, 0.8)',
    },
    hover: {
      width: 40,
      height: 40,
      x: -20,
      y: -20,
      backgroundColor: 'rgba(212, 175, 55, 0.18)',
      borderColor: '#D4AF37',
    },
    view: {
      width: 64,
      height: 64,
      x: -32,
      y: -32,
      backgroundColor: 'rgba(212, 175, 55, 0.92)',
      borderColor: '#F3E5AB',
    },
    explore: {
      width: 72,
      height: 72,
      x: -36,
      y: -36,
      backgroundColor: 'rgba(212, 175, 55, 0.92)',
      borderColor: '#F3E5AB',
    },
  };

  const currentStyle = variantStyles[cursorVariant];

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full flex items-center justify-center text-center shadow-[0_0_20px_rgba(212,175,55,0.4)] border will-change-transform transform-gpu"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: currentStyle.x,
        translateY: currentStyle.y,
        width: currentStyle.width,
        height: currentStyle.height,
        backgroundColor: currentStyle.backgroundColor,
        borderColor: currentStyle.borderColor,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 32,
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
