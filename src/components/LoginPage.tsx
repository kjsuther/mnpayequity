import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertCircle, Lock, Mail, Building2, ArrowLeft } from 'lucide-react';
import type { Jurisdiction } from '../lib/supabase';

export function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jurisdictionId, setJurisdictionId] = useState('');
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingJurisdictions, setLoadingJurisdictions] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadJurisdictions();
  }, []);

  const loadJurisdictions = async () => {
    try {
      const { data, error } = await supabase
        .from('jurisdictions')
        .select('*')
        .order('name');

      if (error) throw error;
      setJurisdictions(data || []);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
    } finally {
      setLoadingJurisdictions(false);
    }
  };

  const filteredJurisdictions = jurisdictions.filter(j =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.jurisdiction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJurisdictionSelect = (jurisdiction: Jurisdiction) => {
    setJurisdictionId(jurisdiction.jurisdiction_id);
    setSearchTerm(`${jurisdiction.name} (${jurisdiction.jurisdiction_id})`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (showResetPassword) {
        if (!email.trim()) {
          setError('Email address is required');
          setLoading(false);
          return;
        }
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setError('Password reset email sent! Please check your inbox.');
          setTimeout(() => {
            setShowResetPassword(false);
            setError(null);
            setEmail('');
          }, 3000);
        }
      } else if (isSignUp) {
        if (!jurisdictionId.trim()) {
          setError('Jurisdiction selection is required for registration');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, jurisdictionId);
        if (error) {
          setError(error.message);
        } else {
          setError('Account created successfully! You can now sign in.');
        }
      } else {
        const isAdminEmail = email.toLowerCase() === 'admin@admin.com';

        if (!isAdminEmail && !jurisdictionId.trim()) {
          setError('Please select your jurisdiction');
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password, jurisdictionId);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowResetPassword(false);
    setIsSignUp(false);
    setError(null);
    setJurisdictionId('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003865] via-[#004d7a] to-[#003865] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#003865] to-[#78BE21] p-8 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/mmb_reversed_logo.png"
                alt="MMB Logo"
                className="h-16 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Pay Equity Reporting System
            </h1>
            <p className="text-white/90 text-sm">
              Secure access for jurisdiction reporting
            </p>
          </div>

          <div className="p-8">
            {showInstructions && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• New users must contact the MMB Pay Equity Unit to have an account created</li>
                  <li>• Once your account is created, sign in using your email and the password you were provided</li>
                  <li>• Select your jurisdiction from the dropdown when signing in</li>
                  <li>• If you forgot your password, use the "Forgot Password?" link below</li>
                </ul>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Close Instructions
                </button>
              </div>
            )}

            {showResetPassword ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-sm text-[#003865] hover:text-[#78BE21] font-medium mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h2>
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                      error.includes('sent') || error.includes('check your inbox')
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <AlertCircle
                        size={20}
                        className={error.includes('sent') ? 'text-green-600 flex-shrink-0 mt-0.5' : 'text-red-600 flex-shrink-0 mt-0.5'}
                      />
                      <span className={`text-sm ${
                        error.includes('sent') ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {error}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#003865] to-[#004d7a] text-white py-3 rounded-lg font-semibold hover:from-[#004d7a] hover:to-[#003865] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                      setJurisdictionId('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      !isSignUp
                        ? 'bg-[#003865] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      isSignUp
                        ? 'bg-[#003865] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {isSignUp ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">New User Registration</h3>
                      <p className="text-gray-700 mb-4">
                        If you are a new user, please contact the MMB Pay Equity Unit to register:
                      </p>
                      <div className="space-y-3 text-left bg-white rounded-lg p-4 border border-blue-300">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email:</p>
                          <a
                            href="mailto:payequity.mmb@state.mn.us"
                            className="text-[#003865] hover:text-[#78BE21] font-semibold transition-colors"
                          >
                            payequity.mmb@state.mn.us
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Phone:</p>
                          <a
                            href="tel:651-259-3824"
                            className="text-[#003865] hover:text-[#78BE21] font-semibold transition-colors"
                          >
                            651-259-3824
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Office Hours:</p>
                          <p className="text-gray-700">Monday - Friday</p>
                          <p className="text-gray-700">8:00 AM - 4:30 PM Central Time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  {email.toLowerCase() !== 'admin@admin.com' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jurisdiction *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => setShowDropdown(true)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          placeholder="Search by name or ID..."
                          required
                        />
                        {showDropdown && searchTerm && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loadingJurisdictions ? (
                              <div className="p-3 text-sm text-gray-500">Loading jurisdictions...</div>
                            ) : filteredJurisdictions.length > 0 ? (
                              filteredJurisdictions.map((jurisdiction) => (
                                <button
                                  key={jurisdiction.id}
                                  type="button"
                                  onClick={() => handleJurisdictionSelect(jurisdiction)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{jurisdiction.name}</div>
                                  <div className="text-sm text-gray-500">ID: {jurisdiction.jurisdiction_id}</div>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-sm text-gray-500">No jurisdictions found</div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Start typing to search for your jurisdiction
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                    </div>
                    {isSignUp && (
                      <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg ${
                      error.includes('created') || error.includes('check your email')
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <AlertCircle
                        size={20}
                        className={error.includes('created') ? 'text-green-600 flex-shrink-0 mt-0.5' : 'text-red-600 flex-shrink-0 mt-0.5'}
                      />
                      <span className={`text-sm ${
                        error.includes('created') ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {error}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#003865] to-[#004d7a] text-white py-3 rounded-lg font-semibold hover:from-[#004d7a] hover:to-[#003865] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Please wait...' : 'Sign In'}
                  </button>
                </form>
                )}

                {!isSignUp && (
                  <div className="mt-4 text-center space-y-2">
                    <button
                      type="button"
                      className="text-sm text-[#003865] hover:text-[#78BE21] font-medium transition-colors"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Forgot Password?
                    </button>
                    <div>
                      <button
                        type="button"
                        className="text-sm text-[#003865] hover:text-[#78BE21] font-medium transition-colors"
                        onClick={() => setShowInstructions(!showInstructions)}
                      >
                        Need help? View instructions
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              For technical support, contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
