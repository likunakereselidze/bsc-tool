'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function show() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const left = Math.min(r.left, window.innerWidth - 272);
    setPos({ top: r.bottom + 6, left: Math.max(4, left) });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className="inline-block align-middle">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
        className="ml-1 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-blue-200 text-gray-500 hover:text-blue-700 transition-colors cursor-help select-none"
        style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, fontStyle: 'italic' }}
        aria-label="More info"
      >
        i
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] w-64 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 shadow-lg text-xs text-blue-800 leading-relaxed pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          {text}
        </div>,
        document.body
      )}
    </span>
  );
}
