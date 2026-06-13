'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedScoreProps {
  score: number;
  teamColor: string;
  side: 'left' | 'right';
}

export function AnimatedScore({ score, teamColor, side }: AnimatedScoreProps) {
  const prevScore = useRef(score);
  const [displayScore, setDisplayScore] = useState(score);
  const [showBall, setShowBall] = useState(false);
  const [flash, setFlash] = useState(false);
  const [bounceKey, setBounceKey] = useState(0);

  useEffect(() => {
    if (score !== prevScore.current && score > prevScore.current) {
      const diff = score - prevScore.current;
      // Trigger the ball bounce animation
      setShowBall(true);
      setFlash(true);
      setBounceKey((k) => k + 1);

      // Update score mid-animation
      const timer1 = setTimeout(() => {
        setDisplayScore(score);
        prevScore.current = score;
      }, 400);

      const timer2 = setTimeout(() => {
        setShowBall(false);
        setFlash(false);
      }, 1200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else if (score !== prevScore.current) {
      setDisplayScore(score);
      prevScore.current = score;
    }
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Bouncing basketball */}
      <AnimatePresence>
        {showBall && (
          <motion.div
            key={bounceKey}
            initial={{ y: -60, opacity: 0, scale: 0.5 }}
            animate={{
              y: [null, 0, -15, 0, -6, 0],
              opacity: [null, 1, 1, 1, 1, 0],
              scale: [null, 1.2, 0.9, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 0.9,
              times: [0, 0.3, 0.5, 0.7, 0.85, 1],
              ease: 'easeOut',
            }}
            className="absolute -top-10 text-3xl select-none z-10"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,107,0,0.8))' }}
          >
            🏀
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score number */}
      <motion.div
        className="relative overflow-hidden"
        animate={flash ? { backgroundColor: [`${teamColor}00`, `${teamColor}44`, `${teamColor}00`] } : {}}
        transition={{ duration: 0.6 }}
        style={{ borderRadius: 8 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayScore}
            initial={{ y: 40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="block text-6xl md:text-7xl font-black tabular-nums"
            style={{
              color: flash ? teamColor : 'white',
              textShadow: flash ? `0 0 20px ${teamColor}` : '0 2px 8px rgba(0,0,0,0.5)',
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
