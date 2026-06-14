'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParsedPlay } from '@/lib/types';

const TYPE_BADGE: Record<string, string> = {
  THREE_POINTER: '3PT',
  FADEAWAY: 'FDW',
  DUNK: 'DNK',
  ALLEY_OOP: 'A-O',
  LAYUP: 'LAY',
  FREE_THROW: 'FT',
  JUMPER: 'JMP',
  HOOK_SHOT: 'HKS',
  PUTBACK: 'PUT',
  MISS: 'MISS',
};

const TYPE_COLOR: Record<string, string> = {
  THREE_POINTER: '#FF6B00',
  FADEAWAY: '#9B59B6',
  DUNK: '#E74C3C',
  ALLEY_OOP: '#E74C3C',
  LAYUP: '#3498DB',
  FREE_THROW: '#2ECC71',
  JUMPER: '#F39C12',
  HOOK_SHOT: '#1ABC9C',
  PUTBACK: '#E74C3C',
  MISS: '#4B5563',
};

interface PlayFeedProps {
  plays: ParsedPlay[];
  highlightPlay?: ParsedPlay | null;
}

export function PlayFeed({ plays, highlightPlay }: PlayFeedProps) {
  const displayed = plays.slice(0, 25);

  return (
    <div className="flex flex-col h-full">
      <div className="text-[10px] font-semibold tracking-[0.14em] text-white/30 px-1 mb-3 uppercase">
        Play-by-Play
      </div>
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 pr-0.5" style={{ scrollbarWidth: 'none' }}>
        <AnimatePresence mode="popLayout">
          {displayed.map((play, i) => {
            const isLatest = play === highlightPlay || i === 0;
            const color = TYPE_COLOR[play.type] ?? '#4B5563';
            const badge = TYPE_BADGE[play.type] ?? '—';
            const isMade = play.made;

            return (
              <motion.div
                key={`${play.rawText}-${i}`}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: isLatest ? 1 : 0.52 - i * 0.016 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg"
                style={{
                  background: isLatest
                    ? `linear-gradient(135deg, ${color}12 0%, transparent 80%)`
                    : 'transparent',
                  borderLeft: isLatest ? `2px solid ${color}70` : '2px solid transparent',
                }}
              >
                {/* Type badge */}
                <div className="shrink-0 mt-px">
                  <span
                    className="inline-block text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: isMade ? color : 'rgba(255,255,255,0.2)',
                      background: isMade ? `${color}1a` : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {badge}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] leading-snug"
                    style={{ color: isLatest ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.48)' }}
                  >
                    {play.rawText}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {play.clock && (
                      <span className="text-white/24 text-[9px] font-mono tabular-nums">{play.clock}</span>
                    )}
                    {play.distance && play.distance > 0 && (
                      <span className="text-white/24 text-[9px]">{play.distance} ft</span>
                    )}
                    {play.points > 0 && (
                      <span
                        className="text-[9px] font-bold"
                        style={{ color }}
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
