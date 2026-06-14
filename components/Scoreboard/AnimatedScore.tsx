'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedScoreProps {
  score: number;
  teamColor: string;
  side?: 'left' | 'right'; // consumed by parent layout only
}

export function AnimatedScore({ score, teamColor }: AnimatedScoreProps) {
  const prevScore = useRef(score);
  const [displayScore, setDisplayScore] = useState(score);
  const [showBall, setShowBall] = useState(false);
  const [flash, setFlash] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);

  useEffect(() => {
    if (score !== prevScore.current && score > prevScore.current) {
      setShowBall(true);
      setFlash(true);
      setBounceKey((k) => k + 1);

      const t1 = setTimeout(() => {
        setDisplayScore(score);
        prevScore.current = score;
      }, 380);

      const t2 = setTimeout(() => {
        setShowBall(false);
        setFlash(false);
      }, 1100);

      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else if (score !== prevScore.current) {
      setDisplayScore(score);
      prevScore.current = score;
    }
  }, [score]);

  return (
    <div className="relative flex items-center">
      {/* Bouncing basketball */}
      <AnimatePresence>
        {showBall && (
          <motion.span
            key={bounceKey}
            initial={{ y: -44, opacity: 0, scale: 0.5 }}
            animate={{
              y: [null, 0, -12, 0, -5, 0],
              opacity: [null, 1, 1, 1, 1, 0],
              scale: [null, 1.15, 0.92, 1.06, 0.97, 1],
            }}
            transition={{ duration: 0.85, times: [0, 0.3, 0.5, 0.7, 0.85, 1], ease: 'easeOut' }}
            className="absolute -top-9 left-0 right-0 text-2xl text-center select-none pointer-events-none"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,0,0.7))' }}
            aria-hidden="true"
          >
            🏀
          </motion.span>
        )}
      </AnimatePresence>

      {/* Score digit */}
      <motion.div
        animate={flash ? { backgroundColor: [`${teamColor}00`, `${teamColor}38`, `${teamColor}00`] } : {}}
        transition={{ duration: 0.55 }}
        style={{ borderRadius: 6, padding: '0 2px' }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayScore}
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -28, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="block text-[2.1rem] font-black tabular-nums leading-none"
            style={{
              color: flash ? teamColor : 'rgba(255,255,255,0.92)',
              textShadow: flash ? `0 0 16px ${teamColor}` : 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {displayScore}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
