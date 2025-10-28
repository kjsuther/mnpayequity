import { Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Jurisdiction } from '../lib/supabase';

interface JurisdictionSearchProps {
  jurisdictions: Jurisdiction[];
  currentJurisdiction: Jurisdiction | null;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
}

export function JurisdictionSearch({
  jurisdictions,
  currentJurisdiction,
  onJurisdictionChange,
}: JurisdictionSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredJurisdictions = jurisdictions.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.jurisdiction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (jurisdiction: Jurisdiction) => {
    onJurisdictionChange(jurisdiction);
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = currentJurisdiction
    ? `${currentJurisdiction.jurisdiction_id} - ${currentJurisdiction.name}`
    : '';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Select Jurisdiction</h2>

      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder={displayValue || "Search by name or ID..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={20} className="text-gray-400" />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {filteredJurisdictions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                No jurisdictions found
              </div>
            ) : (
              filteredJurisdictions.map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleSelect(j)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    currentJurisdiction?.id === j.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{j.name}</div>
                  <div className="text-sm text-gray-500">ID: {j.jurisdiction_id}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
