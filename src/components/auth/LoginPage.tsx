import React, { useState } from 'react';
import { Sprout, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, ArrowLeft, Radio, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateHome,
  onLoginSuccess,
}) => {
  const { login, error: authError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [loginIdentifier, setLoginIdentifier] = useState('ADP-FMR-10001');
  const [password, setPassword] = useState('Kisan@Demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'farmer') {
      setLoginIdentifier('ADP-FMR-10001');
      setPassword('Kisan@Demo123');
    } else if (role === 'buyer') {
      setLoginIdentifier('ADP-BYR-20001');
      setPassword('Buyer@1234');
    } else {
      setLoginIdentifier('ADP-ADM-00001');
      setPassword('Admin@1234');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const success = await login({
        mobileOrEmail: loginIdentifier.trim(),
        password: password,
        role: selectedRole,
      });
      setIsSubmitting(false);
      if (success) {
        onLoginSuccess(selectedRole);
      } else {
        setErrorMessage(authError || 'Invalid credentials or role mismatch.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Authentication failed. Please retry.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotPasswordOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-0 sm:py-6">
      
      {/* Top Header Strip */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AgriDirect Pulse</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono text-slate-500">Mandi Server 01: Live</span>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-grow flex items-center justify-center">
        <div className="bg-white w-full rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: Login Form */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950 font-['Outfit',sans-serif]">
                    AgriDirect<span className="text-emerald-600">Pulse</span>
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">National Agricultural Market Intelligence</p>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to Your Terminal
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access real-time mandi spot prices, predictive forecasts, and verified trade contracts.
                </p>
              </div>

              {/* Role Switcher Tabs */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Signing in as:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('farmer')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    🌾 Farmer / FPO
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('buyer')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                      selectedRole === 'buyer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    🏢 Buyer / Miller
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    🛡️ Admin / APMC
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <span>⚠️ {errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Identifier Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {selectedRole === 'farmer'
                        ? 'Kisan ID or Mobile Number'
                        : selectedRole === 'buyer'
                        ? 'Buyer ID, Mobile or Email'
                        : 'Admin ID or Email'}
                    </label>
                    <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {selectedRole === 'farmer' ? 'ADP-FMR-XXXXXX' : selectedRole === 'buyer' ? 'ADP-BYR-XXXXXX' : 'ADP-ADM-XXXXXX'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {selectedRole === 'farmer' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'farmer'
                          ? 'ADP-FMR-10001 or 9876543210'
                          : selectedRole === 'buyer'
                          ? 'ADP-BYR-20001 or 9823456789'
                          : 'ADP-ADM-00001 or admin.ops@agridirect.gov.in'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Keep me signed in on this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full shadow-md shadow-emerald-600/20 text-sm font-bold"
                    icon={isSubmitting ? undefined : <ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {isSubmitting ? 'Verifying Credentials...' : `Sign In as ${selectedRole === 'farmer' ? 'Farmer' : selectedRole === 'buyer' ? 'Buyer' : 'Admin'}`}
                  </Button>
                </div>

                {/* Google Sign-in Placeholder */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onLoginSuccess(selectedRole)}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign In with Google / Kisan Identity</span>
                </button>
              </form>
            </div>

            {/* Bottom Register Link */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-600">
              <span>New to AgriDirect Pulse? </span>
              <button
                type="button"
                onClick={onNavigateRegister}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Register & Create Free Account →
              </button>
            </div>
          </div>

          {/* Right Column: Premium Agriculture & Market Intelligence Visual Showcase */}
          <div className="hidden lg:flex lg:col-span-6 bg-slate-900 text-white p-10 flex-col justify-between relative overflow-hidden border-l border-slate-800">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Stat Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Ingestion: 2,480+ Mandis Active</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">SIH-2026 EDITION</span>
            </div>

            {/* Center Showcase Card */}
            <div className="relative z-10 my-8 space-y-4">
              <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      🌾
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Sharbati Wheat (Grade A)</h4>
                      <p className="text-[11px] text-slate-400">Sehore APMC Mandi, MP</p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">
                    +₹180 / q Net Gain
                  </Badge>
                </div>

                <div className="flex items-baseline justify-between py-3 border-y border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Real-Time Spot Price</span>
                    <div className="text-2xl font-extrabold text-white font-mono mt-0.5">₹2,860 <span className="text-xs font-normal text-slate-400">/ quintal</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Buyer Demand</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">Surge (28 Tenders)</div>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Optimal Selling Window: <strong>Next 48 Hours</strong></span>
                </div>
              </div>

              {/* Key Platform Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Zero Middlemen
                  </div>
                  <p className="text-[11px] text-slate-400">Direct institutional millers and retail chains.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Predictive Trends
                  </div>
                  <p className="text-[11px] text-slate-400">Multi-season historical and weather price models.</p>
                </div>
              </div>
            </div>

            {/* Bottom Testimonial Snippet */}
            <div className="relative z-10 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <p className="italic text-slate-300 leading-relaxed">
                "Connecting directly to verified buyers through AgriDirect gave our FPO an extra ₹420/quintal on Basmati rice."
              </p>
              <div className="mt-2 text-[11px] font-bold text-emerald-400">
                — Baldev Singh, Progressive Farmer (Patiala, Punjab)
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Reset Your Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered mobile number or email address to receive a secure recovery PIN.
            </p>

            {forgotSuccess ? (
              <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900">Recovery PIN Dispatched!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Please check your SMS inbox for the 6-digit reset code.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 my-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="+91 98765 43210 or email"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="w-1/3"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" className="w-2/3">
                    Send Reset PIN
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
