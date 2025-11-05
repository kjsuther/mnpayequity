import { LogOut, ChevronDown, HelpCircle, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { ComprehensiveHelpGuide } from './ComprehensiveHelpGuide';

type HeaderProps = {
  currentView?: 'home' | 'dashboard' | 'reports' | 'changePassword' | 'sendEmail' | 'jobs' | 'testResults' | 'jurisdictionLookup' | 'notes' | 'userManagement' | 'mnPayEquity' | 'reportView' | 'dataGuide';
  onNavigate?: (view: 'home' | 'dashboard' | 'reports' | 'changePassword' | 'sendEmail' | 'jobs' | 'testResults' | 'jurisdictionLookup' | 'notes' | 'userManagement' | 'mnPayEquity' | 'reportView' | 'dataGuide') => void;
  hasActiveReport?: boolean;
  hasActiveJurisdiction?: boolean;
  onShowHelp?: () => void;
  isAdmin?: boolean;
};

export function Header({ currentView = 'home', onNavigate, hasActiveReport = false, hasActiveJurisdiction = false, onShowHelp, isAdmin = false }: HeaderProps = {}) {
  const { signOut } = useAuth();
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isGoToOpen, setIsGoToOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showComprehensiveGuide, setShowComprehensiveGuide] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const utilitiesRef = useRef<HTMLLIElement>(null);
  const goToRef = useRef<HTMLLIElement>(null);
  const adminRef = useRef<HTMLLIElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (utilitiesRef.current && !utilitiesRef.current.contains(event.target as Node)) {
        setIsUtilitiesOpen(false);
      }
      if (goToRef.current && !goToRef.current.contains(event.target as Node)) {
        setIsGoToOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
        setIsAdminOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowLogoutConfirm(false);
    await signOut();
  };

  const handleChangePassword = () => {
    setIsUtilitiesOpen(false);
    onNavigate?.('changePassword');
  };

  const handleSendEmail = () => {
    setIsAdminOpen(false);
    onNavigate?.('sendEmail');
  };

  const handleGoToNavigation = (view: 'jobs' | 'testResults' | 'reports') => {
    setIsGoToOpen(false);
    onNavigate?.(view);
  };

  const handleAdminNavigation = (view: 'jurisdictionLookup' | 'userManagement') => {
    setIsAdminOpen(false);
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
            <div ref={helpRef} className="relative">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded transition-colors"
                title="Help & Resources"
              >
                <HelpCircle size={20} />
                <span className="text-sm">Help</span>
                <ChevronDown size={16} className={`transition-transform ${isHelpOpen ? 'rotate-180' : ''}`} />
              </button>
              {isHelpOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded border border-gray-200 min-w-[240px] z-50">
                  <button
                    onClick={() => {
                      setIsHelpOpen(false);
                      setShowComprehensiveGuide(true);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
                  >
                    <Book className="w-5 h-5 text-[#003865]" />
                    <div>
                      <div className="font-medium">Complete Help Guide</div>
                      <div className="text-xs text-gray-500">Step-by-step instructions</div>
                    </div>
                  </button>
                  {onShowHelp && (
                    <button
                      onClick={() => {
                        setIsHelpOpen(false);
                        onShowHelp();
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
                    >
                      <HelpCircle className="w-5 h-5 text-[#003865]" />
                      <div>
                        <div className="font-medium">Help Center</div>
                        <div className="text-xs text-gray-500">Search articles & FAQs</div>
                      </div>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsHelpOpen(false);
                      onNavigate?.('mnPayEquity');
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Book className="w-5 h-5 text-[#003865]" />
                    <div>
                      <div className="font-medium">MN Pay Equity</div>
                      <div className="text-xs text-gray-500">Official resources & guidance</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
                onClick={() => onNavigate?.('dashboard')}
                className={`block py-3 px-2 text-white hover:bg-[#005a9f] transition-colors ${
                  currentView === 'dashboard' ? 'border-b-2 border-[#78BE21]' : ''
                }`}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate?.('home')}
                className={`block py-3 px-2 text-white hover:bg-[#005a9f] transition-colors ${
                  currentView === 'home' ? 'border-b-2 border-[#78BE21]' : ''
                }`}
              >
                Jurisdiction Info
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
                </div>
              )}
            </li>
            {isAdmin && (
              <li
                ref={adminRef}
                className="relative"
                onMouseEnter={() => setIsAdminOpen(true)}
                onMouseLeave={() => setIsAdminOpen(false)}
              >
                <button
                  className="flex items-center gap-1 py-3 px-2 text-white hover:bg-[#005a9f] transition-colors"
                >
                  Admin
                  <ChevronDown size={16} className={`transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAdminOpen && (
                  <div className="absolute left-0 top-full mt-0 bg-white shadow-lg rounded-b border border-gray-200 min-w-[200px] z-50">
                    <button
                      onClick={handleSendEmail}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Send Email
                    </button>
                    <button
                      onClick={() => handleAdminNavigation('jurisdictionLookup')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Jurisdiction Lookup
                    </button>
                    <button
                      onClick={() => handleAdminNavigation('userManagement')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
                    >
                      User Account Management
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>

      {showComprehensiveGuide && (
        <ComprehensiveHelpGuide onClose={() => setShowComprehensiveGuide(false)} />
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
