import { useState, useRef, useEffect, useId, useCallback } from 'react';
import woordenlijst from '../lib/woordenlijst';

interface TooltipProps {
  term: string;
}

export default function Tooltip({ term }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [openBelow, setOpenBelow] = useState(false);
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const item = woordenlijst[term];

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !tooltipRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    // Open below if the tooltip would overflow above the viewport
    setOpenBelow(buttonRect.top - tooltipRect.height - 8 < 0);
  }, []);

  useEffect(() => {
    if (!open) return;

    // Wait one frame so the tooltip is rendered and measurable
    requestAnimationFrame(updatePosition);

    function handleClickOutside(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, updatePosition]);

  if (!item) return null;

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 text-[10px] leading-none cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg ${
            openBelow ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}
        >
          <span className="block font-semibold mb-1">{item.titel}</span>
          <span className="block leading-relaxed">{item.uitleg}</span>
          {openBelow ? (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
          ) : (
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          )}
        </span>
      )}
    </span>
  );
}
