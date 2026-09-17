import React, { useState } from 'react';
import { Sprout, User, Phone, Mail, Lock, MapPin, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft, Radio, Building2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { INDIAN_STATES_DATA } from '../../data/locationData';
import { FarmerProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
  onRegisterSuccess: (initialProfile: Partial<FarmerProfile>) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateLogin,
  onNavigateHome,
  onRegisterSuccess,
}) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('Rajinder Singh');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [email, setEmail] = useState('rajinder.singh@farmmail.in');
  const [password, setPassword] = useState('Kisan@Demo123');
  const [confirmPassword, setConfirmPassword] = useState('Kisan@Demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [village, setVillage] = useState('Ashta');
  const [selectedState, setSelectedState] = useState('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Sehore');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdKisanId, setCreatedKisanId] = useState<string | null>(null);

  // Available districts for chosen state
  const currentDistricts = INDIAN_STATES_DATA.find((s) => s.state === selectedState)?.districts || [
    'Central District',
    'North District',
    'South District',
  ];

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const districtsForNewState = INDIAN_STATES_DATA.find((s) => s.state === newState)?.districts;
    if (districtsForNewState && districtsForNewState.length > 0) {
      setSelectedDistrict(districtsForNewState[0]);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setErrorMessage(null);

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        fullName,
        mobileNumber: cleanPhone,
        email,
        password,
        confirmPassword,
        role: 'farmer',
        village,
        state: selectedState,
        district: selectedDistrict,
      });

      if (result.success && result.user) {
        const kId = result.user.kisanId || result.user.platformId || 'ADP-FMR-10001';
        setCreatedKisanId(kId);
        setIsSubmitting(false);
      } else {
        setErrorMessage(result.error || 'Registration failed. Please check your inputs.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
      setIsSubmitting(false);
    }
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
          <span className="text-xs font-mono text-slate-500">Kisan Registration Portal</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex-grow flex items-center justify-center">
        <div className="bg-white w-full rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
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
                  <p className="text-[11px] text-slate-500 font-medium">Join 45,000+ Cultivators and FPOs</p>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Create Your Free Account
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Start accessing real-time mandi prices, accurate price trend predictions, and verified buyers.
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <span>⚠️ {errorMessage}</span>
                </div>
              )}

              {createdKisanId ? (
                /* Registration Success Card */
                <div className="space-y-5 py-4">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
                      🎉 Kisan Account Created Successfully!
                    </h3>
                    <p className="text-xs text-slate-600">
                      Welcome, <span className="font-bold text-slate-800">{fullName}</span>! Your permanent Kisan Identity ID has been generated.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-5 text-white shadow-lg space-y-3">
                    <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold">
                      <span>AgriDirect Permanent Kisan ID</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">VERIFIED</span>
                    </div>

                    <div className="bg-slate-950/40 rounded-xl p-3.5 flex items-center justify-between border border-white/10">
                      <span className="font-mono text-2xl font-black tracking-widest text-emerald-300">
                        {createdKisanId}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(createdKisanId);
                            alert('Kisan ID copied to clipboard!');
                          }
                        }}
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow hover:bg-emerald-50 cursor-pointer"
                      >
                        Copy ID
                      </button>
                    </div>

                    <div className="text-xs text-emerald-100/90 pt-1 border-t border-white/10 flex justify-between">
                      <span>Phone: +91 {mobileNumber}</span>
                      <span>{selectedDistrict}, {selectedState}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">Important: </span>
                    <span>Please save your Kisan ID. You can use it along with your password to log in anytime.</span>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      onRegisterSuccess({
                        fullName,
                        mobileNumber,
                        email,
                        village,
                        state: selectedState,
                        district: selectedDistrict,
                      });
                    }}
                    className="w-full shadow-md text-sm font-bold"
                  >
                    Proceed to Farmer Dashboard →
                  </Button>
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  
                  {/* Full Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rajinder Singh"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                          +91
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="farmer@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
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
                  </div>

                {/* Location Fields: Village, State, District */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Primary Farm / Operational Location
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Town</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="e.g. Ashta"
                          className="w-full pl-8 pr-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <select
                        value={selectedState}
                        onChange={handleStateChange}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {INDIAN_STATES_DATA.map((s) => (
                          <option key={s.state} value={s.state}>
                            {s.state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {currentDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>
                      I accept the{' '}
                      <span className="font-semibold text-emerald-700 hover:underline">Terms of Fair Trade</span> and{' '}
                      <span className="font-semibold text-emerald-700 hover:underline">Farmer Data Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting || !agreeTerms}
                    className="w-full shadow-md shadow-emerald-600/20 text-sm font-bold"
                    icon={isSubmitting ? undefined : <ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {isSubmitting ? 'Creating Secure Account...' : 'Create Account & Continue to Role Profile'}
                  </Button>
                </div>

              </form>
            )}
            </div>

            {/* Bottom Login Link */}
            <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-600">
              <span>Already have an AgriDirect account? </span>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Sign In to Terminal →
              </button>
            </div>
          </div>

          {/* Right Column: Platform Value Showcase */}
          <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white p-10 flex-col justify-between relative overflow-hidden border-l border-slate-800">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Free Forever for Farmers</span>
              </div>

              <h3 className="text-2xl font-extrabold text-white tracking-tight leading-snug font-['Outfit',sans-serif]">
                Why 45,000+ Cultivators Trust AgriDirect Pulse
              </h3>

              <div className="mt-6 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Live Inter-Mandi Price Intelligence</h5>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Instant visibility into modal rates across nearby and regional mandis to calculate true freight net gain.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Direct Institutional Buyer Access</h5>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Direct contract offers from verified millers, food processors, and supermarket supply chains.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Daily SMS & WhatsApp Alerts</h5>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Automated morning notifications tailored to your specific crops and nearest APMC yard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Commission Guarantee</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                AgriDirect does not charge commissions on farmer produce. Our mission is transparent, sovereign agricultural empowerment.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
