import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

type HeaderProps = {
  currentView?: 'home' | 'dashboard' | 'reports' | 'changePassword' | 'sendEmail' | 'jobs' | 'testResults' | 'jurisdictionLookup' | 'notes';
  onNavigate?: (view: 'home' | 'dashboard' | 'reports' | 'changePassword' | 'sendEmail' | 'jobs' | 'testResults' | 'jurisdictionLookup' | 'notes') => void;
  hasActiveReport?: boolean;
  hasActiveJurisdiction?: boolean;
};

export function Header({ currentView = 'home', onNavigate, hasActiveReport = false, hasActiveJurisdiction = false }: HeaderProps = {}) {
  const { signOut } = useAuth();
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isGoToOpen, setIsGoToOpen] = useState(false);
  const utilitiesRef = useRef<HTMLLIElement>(null);
  const goToRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (utilitiesRef.current && !utilitiesRef.current.contains(event.target as Node)) {
        setIsUtilitiesOpen(false);
      }
      if (goToRef.current && !goToRef.current.contains(event.target as Node)) {
        setIsGoToOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await signOut();
    }
  };

  const handleChangePassword = () => {
    setIsUtilitiesOpen(false);
    onNavigate?.('changePassword');
  };

  const handleSendEmail = () => {
    setIsUtilitiesOpen(false);
    onNavigate?.('sendEmail');
  };

  const handleGoToNavigation = (view: 'jobs' | 'testResults' | 'reports' | 'jurisdictionLookup' | 'notes') => {
    setIsGoToOpen(false);
    onNavigate?.(view);
  };

  return (
    <header className="bg-[#003865] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/mmb_reversed_logo copy.png"
              alt="Management and Budget Logo"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-white">
                MN Pay Equity Management System
              </h1>
              <p className="text-sm text-gray-200">
                Management and Budget
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate?.('reports')}
              className="px-4 py-2 border border-white text-white text-sm font-normal rounded hover:bg-white/10 transition-colors"
            >
              Enter Jobs
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#004a7f] rounded transition-colors"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-[#004a7f]">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex gap-6 text-sm">
            <li>
              <button
                onClick={() => onNavigate?.('home')}
                className={`block py-3 px-2 text-white hover:bg-[#005a9f] transition-colors ${
                  currentView === 'home' ? 'border-b-2 border-[#78BE21]' : ''
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('dashboard')}
                className={`block py-3 px-2 text-white hover:bg-[#005a9f] transition-colors ${
                  currentView === 'dashboard' ? 'border-b-2 border-[#78BE21]' : ''
                }`}
              >
                Dashboard
              </button>
            </li>
            <li
              ref={goToRef}
              className="relative"
              onMouseEnter={() => setIsGoToOpen(true)}
              onMouseLeave={() => setIsGoToOpen(false)}
            >
              <button
                className="flex items-center gap-1 py-3 px-2 text-white hover:bg-[#005a9f] transition-colors"
              >
                Go To
                <ChevronDown size={16} className={`transition-transform ${isGoToOpen ? 'rotate-180' : ''}`} />
              </button>
              {isGoToOpen && (
                <div className="absolute left-0 top-full mt-0 bg-white shadow-lg rounded-b border border-gray-200 min-w-[200px] z-50">
                  <button
                    onClick={() => handleGoToNavigation('jobs')}
                    disabled={!hasActiveJurisdiction}
                    className={`block w-full text-left px-4 py-2 transition-colors ${
                      hasActiveJurisdiction
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Jobs
                  </button>
                  <button
                    onClick={() => handleGoToNavigation('testResults')}
                    disabled={!hasActiveJurisdiction}
                    className={`block w-full text-left px-4 py-2 transition-colors ${
                      hasActiveJurisdiction
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Test Results
                  </button>
                  <button
                    onClick={() => handleGoToNavigation('reports')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Reports
                  </button>
                  <button
                    onClick={() => handleGoToNavigation('jurisdictionLookup')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Jurisdiction LookUp
                  </button>
                  <button
                    onClick={() => handleGoToNavigation('notes')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Notes
                  </button>
                </div>
              )}
            </li>
            <li
              ref={utilitiesRef}
              className="relative"
              onMouseEnter={() => setIsUtilitiesOpen(true)}
              onMouseLeave={() => setIsUtilitiesOpen(false)}
            >
              <button
                className="flex items-center gap-1 py-3 px-2 text-white hover:bg-[#005a9f] transition-colors"
              >
                Utilities
                <ChevronDown size={16} className={`transition-transform ${isUtilitiesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUtilitiesOpen && (
                <div className="absolute left-0 top-full mt-0 bg-white shadow-lg rounded-b border border-gray-200 min-w-[180px] z-50">
                  <button
                    onClick={handleChangePassword}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Send Email
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
