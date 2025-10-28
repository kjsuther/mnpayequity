import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Lock, Mail, Building2, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jurisdictionId, setJurisdictionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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
          setError('Jurisdiction ID is required for registration');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, jurisdictionId);
        if (error) {
          setError(error.message);
        } else {
          setError('Account created! Please check your email to verify your account.');
        }
      } else {
        const { error } = await signIn(email, password);
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
                  <li>• First-time users should create an account using their jurisdiction ID</li>
                  <li>• If you forgot your jurisdiction ID, contact your administrator</li>
                  <li>• Check your email after registration to verify your account</li>
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jurisdiction ID
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={jurisdictionId}
                          onChange={(e) => setJurisdictionId(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          placeholder="Enter your jurisdiction ID"
                          required={isSignUp}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="mt-1 text-xs text-[#003865] hover:text-[#78BE21] font-medium"
                      >
                        Don't know your jurisdiction ID?
                      </button>
                    </div>
                  )}

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
                    {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                </form>

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
