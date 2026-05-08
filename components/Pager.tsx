'use client';

import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface PagerProps {
  level: number;
  no: number;
  max: number;
}

export default function Pager({ level, no, max }: PagerProps) {
  const router = useRouter();

  const canPrev = no > 1;
  const canNext = no < max;

  const goPrev = () => {
    if (canPrev) router.push(`/labyrinth/${level}/${no - 1}`);
  };
  const goNext = () => {
    if (canNext) router.push(`/labyrinth/${level}/${no + 1}`);
  };

  return (
    <div
      className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30"
      aria-label="分页"
    >
      <button
        type="button"
        onClick={goPrev}
        disabled={!canPrev}
        className={clsx(
          'flex items-center justify-center transition-opacity',
          !canPrev && 'opacity-40 cursor-not-allowed',
        )}
        style={{
          width: 36,
          height: 36,
          background:
            'linear-gradient(180deg, rgba(60,40,22,0.85) 0%, rgba(35,22,12,0.85) 100%)',
          border: '1px solid rgba(180,130,60,0.6)',
          borderRadius: 4,
          color: '#f3c14b',
          fontSize: 18,
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.6)',
        }}
        aria-label="上一关"
      >
        <ChevronUp />
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={!canNext}
        className={clsx(
          'flex items-center justify-center transition-opacity',
          !canNext && 'opacity-40 cursor-not-allowed',
        )}
        style={{
          width: 36,
          height: 36,
          background:
            'linear-gradient(180deg, rgba(60,40,22,0.85) 0%, rgba(35,22,12,0.85) 100%)',
          border: '1px solid rgba(180,130,60,0.6)',
          borderRadius: 4,
          color: '#f3c14b',
          fontSize: 18,
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.6)',
        }}
        aria-label="下一关"
      >
        <ChevronDown />
      </button>
    </div>
  );
}

function ChevronUp() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15 L12 9 L18 15" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9 L12 15 L18 9" />
    </svg>
  );
}
