'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParsedPlay } from '@/lib/types';

const PLAY_EMOJI: Record<string, string> = {
  THREE_POINTER: '🔥',
  FADEAWAY: '🌀',
  DUNK: '💥',
  ALLEY_OOP: '🚀',
  LAYUP: '🏃',
  FREE_THROW: '🎯',
  JUMPER: '⬆️',
  HOOK_SHOT: '🪝',
  PUTBACK: '💪',
  MISS: '😮',
  UNKNOWN: '🏀',
};

const PLAY_COLORS: Record<string, string> = {
  THREE_POINTER: '#FF6B00',
  FADEAWAY: '#9B59B6',
  DUNK: '#E74C3C',
  ALLEY_OOP: '#E74C3C',
  LAYUP: '#3498DB',
  FREE_THROW: '#2ECC71',
  JUMPER: '#F39C12',
  HOOK_SHOT: '#1ABC9C',
  PUTBACK: '#E74C3C',
  MISS: '#95A5A6',
  UNKNOWN: '#7F8C8D',
};

interface PlayFeedProps {
  plays: ParsedPlay[];
  highlightPlay?: ParsedPlay | null;
}

export function PlayFeed({ plays, highlightPlay }: PlayFeedProps) {
  const displayed = plays.slice(0, 25);

  return (
    <div className="flex flex-col gap-0.5 overflow-hidden">
      <div className="text-xs font-bold uppercase tracking-widest text-white/40 px-1 mb-2">
        Play-by-Play
      </div>
      <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {displayed.map((play, i) => {
            const isHighlight = highlightPlay === play || i === 0;
            const color = PLAY_COLORS[play.type] ?? '#7F8C8D';

            return (
              <motion.div
                key={`${play.rawText}-${i}`}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i === 0 ? 0 : 0 }}
                className={`flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                  isHighlight && i === 0 ? 'ring-1' : ''
                }`}
                style={{
                  backgroundColor: isHighlight && i === 0 ? `${color}15` : 'rgba(255,255,255,0.02)',
                  outline: isHighlight && i === 0 ? `1px solid ${color}60` : 'none',
                }}
              >
                {/* Icon */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm"
                  style={{ backgroundColor: `${color}25` }}
                >
                  {play.made ? PLAY_EMOJI[play.type] : '❌'}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-white/80 leading-tight text-[11px] ${isHighlight && i === 0 ? 'font-semibold' : ''}`}>
                    {play.rawText}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {play.clock && (
                      <span className="text-white/30 text-[10px] font-mono">{play.clock}</span>
                    )}
                    {play.distance && (
                      <span className="text-white/30 text-[10px]">📏 {play.distance}ft</span>
                    )}
                    {play.points > 0 && (
                      <span
                        className="text-[10px] font-bold px-1 rounded"
                        style={{ color, backgroundColor: `${color}20` }}
                      >
                        +{play.points}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
