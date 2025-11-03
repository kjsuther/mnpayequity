import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

type HelpTooltipProps = {
  content: string;
  title?: string;
};

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-[#003865] transition-colors ml-1"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-72 p-4 bg-white border border-gray-200 rounded-lg shadow-lg left-0 top-6">
          <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45" />
          {title && (
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}
