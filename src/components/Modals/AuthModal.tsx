import React, { useState } from 'react';
import { X, ShieldCheck, Phone, Mail, ArrowRight, UserCheck, Building, Sprout, Lock } from 'lucide-react';
import { Button } from '../common/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'farmer' | 'buyer' | 'fpo';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialRole = 'farmer' }) => {
  const [role, setRole] = useState<'farmer' | 'buyer' | 'fpo'>(initialRole);
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setOtpSent(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setOtpSent(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Secure Portal Login</span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">Access AgriDirect Terminal</h3>
          <p className="text-xs text-slate-300 mt-1">Real-time market intelligence, verified quotes & direct trade.</p>

          {/* Role Switcher */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 bg-slate-800/80 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                role === 'farmer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              Farmer
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                role === 'buyer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Buyer / Mill
            </button>
            <button
              type="button"
              onClick={() => setRole('fpo')}
              className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                role === 'fpo' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              FPO / Coop
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submittedSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Authenticated Successfully</h4>
              <p className="text-xs text-slate-500 mt-1">Connecting to your verified {role.toUpperCase()} terminal session...</p>
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {role === 'farmer' ? 'Registered Mobile Number (e-Kisan / Aadhaar Linked)' : 'Official Mobile Number or Work Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={role === 'farmer' ? '+91 98765 43210' : 'name@company.com or +91...'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">We will send a 6-digit verification code for secure 2FA sign-in.</p>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  Send Verification Code
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Need assistance?</span>
                <span className="text-emerald-700 font-semibold cursor-pointer hover:underline">Toll Free: 1800-419-AGRI</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter 6-Digit OTP sent to {identifier}
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-full text-center py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Verify & Enter Terminal
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Didn't receive code?{' '}
                <button type="button" onClick={() => setOtp(['', '', '', '', '', ''])} className="text-emerald-600 font-semibold hover:underline">
                  Resend in 24s
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
