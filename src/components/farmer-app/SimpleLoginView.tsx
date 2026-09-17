import React, { useState } from 'react';
import {
  Sprout,
  Building2,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  MapPin,
  User,
  Sparkles,
  Copy,
  Check,
  KeyRound,
  FileBadge,
} from 'lucide-react';
import { Language, TRANSLATIONS, FarmerTab } from './types';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LanguageSelector } from '../common/LanguageSelector';
import { INDIAN_STATES_DATA } from '../../data/locationData';

interface SimpleLoginViewProps {
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onLoginSuccess: (destinationTab: FarmerTab, role: UserRole) => void;
}

export const SimpleLoginView: React.FC<SimpleLoginViewProps> = ({
  lang,
  onSelectLang,
  onLoginSuccess,
}) => {
  const { login, register, isLoading: authLoading, error: authError, clearError } = useAuth();

  // Role Selection: 'farmer' (Default), 'buyer', 'admin'
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer' | 'admin'>('farmer');

  // Login credentials state
  const [identifier, setIdentifier] = useState<string>('ADP-FMR-10001');
  const [password, setPassword] = useState<string>('Kisan@Demo123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Common UI State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [regRole, setRegRole] = useState<'farmer' | 'buyer'>('farmer');
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regState, setRegState] = useState<string>('Madhya Pradesh');
  const [regDistrict, setRegDistrict] = useState<string>('Sehore');
  const [regVillage, setRegVillage] = useState<string>('Ashta');
  // Buyer-specific
  const [regBusinessName, setRegBusinessName] = useState<string>('');
  const [regGstin, setRegGstin] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');

  // Registration Success Card State
  const [regSuccessResult, setRegSuccessResult] = useState<{
    id: string;
    name: string;
    phone: string;
    role: 'farmer' | 'buyer';
    district?: string;
    state?: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Available districts for chosen registration state
  const currentDistricts =
    INDIAN_STATES_DATA.find((s) => s.state === regState)?.districts || ['Sehore', 'Indore', 'Dewas', 'Bhopal'];

  // Handle switching roles on the login screen
  const handleSelectRole = (role: 'farmer' | 'buyer' | 'admin') => {
    setSelectedRole(role);
    setErrorMessage(null);
    clearError();
    if (role === 'farmer') {
      setIdentifier('ADP-FMR-10001');
      setPassword('Kisan@Demo123');
    } else if (role === 'buyer') {
      setIdentifier('ADP-BYR-20001');
      setPassword('Buyer@1234');
    } else {
      setIdentifier('ADP-ADM-00001');
      setPassword('Admin@1234');
    }
  };

  // Quick 1-tap demo credentials loader
  const handleFillDemo = (role: 'farmer' | 'buyer' | 'admin') => {
    handleSelectRole(role);
  };

  // --- Handle Login Submission ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    clearError();

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया अपना आईडी या मोबाइल नंबर दर्ज करें'
          : lang === 'mr'
          ? 'कृपया तुमचा आयडी किंवा मोबाईल नंबर टाका'
          : 'Please enter your ID or mobile number'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया अपना पासवर्ड दर्ज करें'
          : lang === 'mr'
          ? 'कृपया तुमचा पासवर्ड टाका'
          : 'Please enter your password'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login({
        mobileOrEmail: cleanIdentifier,
        password: password,
        role: selectedRole as UserRole,
      });

      if (success) {
        if (selectedRole === 'admin') {
          onLoginSuccess('advisor', 'admin');
        } else if (selectedRole === 'buyer') {
          onLoginSuccess('buyers', 'buyer');
        } else {
          onLoginSuccess('my-crops', 'farmer');
        }
      } else {
        setErrorMessage(
          authError ||
            (lang === 'hi'
              ? 'लॉगिन विफल रहा। कृपया आईडी और पासवर्ड की जांच करें।'
              : lang === 'mr'
              ? 'लॉगिन अयशस्वी. कृपया आयडी आणि पासवर्ड तपासा.'
              : 'Login failed. Please check your credentials.')
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Registration Submission ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!regName.trim()) {
      setErrorMessage(
        lang === 'hi' ? 'कृपया पूरा नाम दर्ज करें' : lang === 'mr' ? 'कृपया पूर्ण नाव टाका' : 'Please enter full name'
      );
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें'
          : lang === 'mr'
          ? 'कृपया वैध 10-अंकी मोबाईल नंबर टाका'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage(
        lang === 'hi'
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'
          : lang === 'mr'
          ? 'पासवर्ड किमान 6 अक्षरांचा असावा'
          : 'Password must be at least 6 characters long'
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage(
        lang === 'hi'
          ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते'
          : lang === 'mr'
          ? 'पासवर्ड जुळत नाहीत'
          : 'Passwords do not match'
      );
      return;
    }
    if (regRole === 'buyer' && !regBusinessName.trim()) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया व्यापार / मिल का नाम दर्ज करें'
          : 'Please enter Business / Mill name'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: regName.trim(),
        mobileNumber: cleanPhone,
        email: regEmail.trim() || `${cleanPhone}@agridirect.in`,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: regRole,
        state: regState,
        district: regDistrict,
        village: regRole === 'farmer' ? regVillage.trim() || 'Rural Area' : undefined,
        companyName: regRole === 'buyer' ? regBusinessName.trim() : undefined,
        gstin: regRole === 'buyer' ? regGstin.trim() || '23AAACP1234F1Z8' : undefined,
      };

      const result = await register(payload);
      if (result.success && result.user) {
        const generatedId =
          result.user.platformId ||
          (regRole === 'farmer' ? result.user.kisanId : result.user.buyerId) ||
          (regRole === 'farmer' ? 'ADP-FMR-10001' : 'ADP-BYR-20001');

        setRegSuccessResult({
          id: generatedId,
          name: result.user.fullName,
          phone: result.user.mobileNumber,
          role: regRole,
          district: regDistrict,
          state: regState,
        });
      } else {
        setErrorMessage(result.error || 'Registration failed. Please check your inputs.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Generated ID to clipboard
  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2500);
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Top Header */}
      <header className="bg-white border-b border-slate-200/90 shadow-xs px-4 py-3 sm:py-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-slate-950 tracking-tight font-['Outfit',sans-serif]">
                  AgriDirect <span className="text-emerald-600">Pulse</span>
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                {t.loginTagline}
              </p>
            </div>
          </div>

          {/* Language Selector (English | हिंदी | मराठी) */}
          <LanguageSelector
            currentLang={lang}
            onSelectLang={onSelectLang}
            showIcon={false}
            compact={true}
          />
        </div>
      </header>

      {/* 2. Main Authentication Canvas */}
      <main className="max-w-md w-full mx-auto px-4 py-6 sm:py-8 space-y-6 flex-grow">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          
          {/* Section: Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
              {lang === 'mr' ? 'तुमची भूमिका निवडा' : lang === 'hi' ? 'अपनी भूमिका चुनें' : 'Choose Account Role'}
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Farmer */}
              <button
                type="button"
                id="role-btn-farmer"
                onClick={() => handleSelectRole('farmer')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col items-start gap-2.5 cursor-pointer relative ${
                  selectedRole === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300'
                }`}
              >
                {selectedRole === 'farmer' && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'farmer'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black font-['Outfit',sans-serif]">
                    {t.farmerRoleTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    {lang === 'mr' ? 'किसान आयडी + पासवर्ड' : lang === 'hi' ? 'किसान आईडी + पासवर्ड' : 'Kisan ID + Password'}
                  </div>
                </div>
              </button>

              {/* Option 2: Buyer / Miller */}
              <button
                type="button"
                id="role-btn-buyer"
                onClick={() => handleSelectRole('buyer')}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col items-start gap-2.5 cursor-pointer relative ${
                  selectedRole === 'buyer'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300'
                }`}
              >
                {selectedRole === 'buyer' && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'buyer'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black font-['Outfit',sans-serif]">
                    {t.buyerRoleTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    {lang === 'mr' ? 'खरेदीदार आयडी + पासवर्ड' : lang === 'hi' ? 'खरीदार आईडी + पासवर्ड' : 'Buyer ID + Password'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {(errorMessage || authError) && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <span className="font-bold">{errorMessage || authError}</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LOGIN FORM (ID + PASSWORD)                                */}
          {/* ========================================================= */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: User Identifier (Kisan ID / Buyer ID / Mobile / Email) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {selectedRole === 'farmer'
                    ? lang === 'hi'
                      ? 'किसान आईडी या मोबाइल नंबर:'
                      : lang === 'mr'
                      ? 'शेतकरी आयडी किंवा मोबाईल नंबर:'
                      : 'Kisan ID or Mobile Number:'
                    : selectedRole === 'buyer'
                    ? lang === 'hi'
                      ? 'खरीदार आईडी या मोबाइल नंबर:'
                      : lang === 'mr'
                      ? 'खरेदीदार आयडी किंवा मोबाईल नंबर:'
                      : 'Buyer ID or Mobile Number:'
                    : 'Admin ID or Email:'}
                </label>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {selectedRole === 'farmer' ? 'ADP-FMR-XXXXXX' : selectedRole === 'buyer' ? 'ADP-BYR-XXXXXX' : 'ADP-ADM-XXXXXX'}
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {selectedRole === 'farmer' ? (
                    <FileBadge className="w-4 h-4 text-emerald-600" />
                  ) : selectedRole === 'buyer' ? (
                    <Building2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <input
                  type="text"
                  id="login-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === 'farmer'
                      ? 'ADP-FMR-10001 or 9876543210'
                      : selectedRole === 'buyer'
                      ? 'ADP-BYR-20001 or 9823456789'
                      : 'ADP-ADM-00001 or admin.ops@agridirect.gov.in'
                  }
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedRole === 'farmer'
                  ? lang === 'hi'
                    ? 'अपनी किसान आईडी (उदा. ADP-FMR-10001) या पंजीकृत मोबाइल नंबर दर्ज करें'
                    : lang === 'mr'
                    ? 'तुमचा शेतकरी आयडी (उदा. ADP-FMR-10001) किंवा मोबाईल नंबर टाका'
                    : 'Enter your unique Kisan ID or registered 10-digit mobile number'
                  : selectedRole === 'buyer'
                  ? lang === 'hi'
                    ? 'अपनी खरीदार आईडी (उदा. ADP-BYR-20001) या पंजीकृत मोबाइल दर्ज करें'
                    : 'Enter your unique Buyer ID or registered mobile/email'
                  : 'Enter your Admin credentials'}
              </p>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {lang === 'hi' ? 'पासवर्ड:' : lang === 'mr' ? 'पासवर्ड:' : 'Password:'}
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting || authLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting || authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'hi' ? 'प्रमाणित किया जा रहा है...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole === 'farmer'
                      ? lang === 'hi'
                        ? 'किसान डैशबोर्ड में प्रवेश करें'
                        : lang === 'mr'
                        ? 'शेतकरी डॅशबोर्डवर जा'
                        : 'Login to Farmer Dashboard'
                      : selectedRole === 'buyer'
                      ? lang === 'hi'
                        ? 'खरीदार डैशबोर्ड में लॉगिन करें'
                        : lang === 'mr'
                        ? 'खरेदीदार डॅशबोर्ड लॉगिन'
                        : 'Login as Verified Buyer'
                      : 'Login to Admin Terminal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Tap Demo Credentials Switcher */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t.quickDemoLogin}</span>
              <span className="text-[10px] text-emerald-600 font-semibold lowercase">1-tap auto-fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-farmer-btn"
                onClick={() => handleFillDemo('farmer')}
                className={`p-2 rounded-xl border text-left text-[11px] transition-all cursor-pointer ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50/60'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Farmer</span>
                </div>
                <div className="font-mono text-[9px] text-slate-500 truncate mt-0.5">
                  ADP-FMR-10001
                </div>
              </button>

              <button
                type="button"
                id="demo-buyer-btn"
                onClick={() => handleFillDemo('buyer')}
                className={`p-2 rounded-xl border text-left text-[11px] transition-all cursor-pointer ${
                  selectedRole === 'buyer'
                    ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50/60'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                  <span>Buyer</span>
                </div>
                <div className="font-mono text-[9px] text-slate-500 truncate mt-0.5">
                  ADP-BYR-20001
                </div>
              </button>

              <button
                type="button"
                id="demo-admin-btn"
                onClick={() => handleFillDemo('admin')}
                className={`p-2 rounded-xl border text-left text-[11px] transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-purple-50 text-purple-900 border-purple-300 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50/60'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                  <span>Admin</span>
                </div>
                <div className="font-mono text-[9px] text-slate-500 truncate mt-0.5">
                  ADP-ADM-00001
                </div>
              </button>
            </div>
          </div>

          {/* Registration Link Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              id="open-register-modal-btn"
              onClick={() => {
                setIsRegisterOpen(true);
                setRegRole(selectedRole === 'buyer' ? 'buyer' : 'farmer');
                setRegSuccessResult(null);
                setErrorMessage(null);
                clearError();
              }}
              className="text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {selectedRole === 'farmer'
                  ? lang === 'hi'
                    ? 'नया किसान पंजीकरण (तुरंत किसान आईडी प्राप्त करें)'
                    : lang === 'mr'
                    ? 'नवीन शेतकरी नोंदणी (शेतकरी आयडी मिळवा)'
                    : 'New Farmer Registration (Get Instant Kisan ID)'
                  : lang === 'hi'
                  ? 'नया खरीदार पंजीकरण (खरीदार आईडी प्राप्त करें)'
                  : 'New Buyer Registration (Get Instant Buyer ID)'}
              </span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        AgriDirect Pulse • Ministry of Agriculture & Farmers Welfare • Digital Identity System
      </footer>

      {/* ========================================================= */}
      {/* 3. REGISTRATION MODAL WITH INSTANT ID GENERATION          */}
      {/* ========================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-950 font-['Outfit',sans-serif]">
                    {regSuccessResult
                      ? lang === 'hi'
                        ? 'पंजीकरण सफल!'
                        : 'Registration Successful!'
                      : regRole === 'farmer'
                      ? lang === 'hi'
                        ? 'नया किसान पंजीकरण'
                        : lang === 'mr'
                        ? 'नवीन शेतकरी नोंदणी'
                        : 'New Farmer Registration'
                      : lang === 'hi'
                      ? 'नया खरीदार पंजीकरण'
                      : 'New Buyer Registration'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {regSuccessResult
                    ? 'Your unique permanent AgriDirect ID is generated.'
                    : regRole === 'farmer'
                    ? lang === 'hi'
                      ? 'पंजीकरण के तुरंत बाद अपनी अद्वितीय किसान आईडी प्राप्त करें'
                      : 'Create your account to receive your permanent Kisan ID'
                    : 'Institutional buyer & agro-processor registration'}
                </p>
              </div>
              <button
                type="button"
                id="close-register-modal-btn"
                onClick={() => {
                  setIsRegisterOpen(false);
                  setRegSuccessResult(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* A. SUCCESS CARD (Shown immediately after registration) */}
            {regSuccessResult ? (
              <div className="space-y-4 py-2">
                {/* Celebratory Badge */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-950 font-['Outfit',sans-serif]">
                    {regSuccessResult.role === 'farmer'
                      ? lang === 'hi'
                        ? '🎉 किसान आईडी सफलतापूर्वक उत्पन्न!'
                        : lang === 'mr'
                        ? '🎉 शेतकरी आयडी तयार झाला!'
                        : '🎉 Kisan ID Generated Successfully!'
                      : '🎉 Buyer ID Generated Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {lang === 'hi'
                      ? `नमस्ते ${regSuccessResult.name}, आपका खाता सक्रिय कर दिया गया है।`
                      : `Welcome, ${regSuccessResult.name}! Your account is now active.`}
                  </p>
                </div>

                {/* PROMINENT ID CARD WITH COPY BUTTON */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-4 text-white shadow-md space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold">
                    <span>{regSuccessResult.role === 'farmer' ? 'AgriDirect Kisan ID' : 'AgriDirect Buyer ID'}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                      Permanent
                    </span>
                  </div>

                  {/* Monospace Generated ID */}
                  <div className="bg-slate-950/40 rounded-xl p-3 flex items-center justify-between gap-2 border border-white/10">
                    <span className="font-mono text-2xl font-black tracking-widest text-emerald-300 select-all">
                      {regSuccessResult.id}
                    </span>
                    <button
                      type="button"
                      id="copy-generated-id-btn"
                      onClick={() => handleCopyId(regSuccessResult.id)}
                      className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary row */}
                  <div className="text-[11px] text-emerald-100/90 grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                    <div>
                      <span className="opacity-75 block">Registered Mobile:</span>
                      <span className="font-bold text-white font-mono">+91 {regSuccessResult.phone}</span>
                    </div>
                    {regSuccessResult.district && (
                      <div>
                        <span className="opacity-75 block">Location:</span>
                        <span className="font-bold text-white truncate block">
                          {regSuccessResult.district}, {regSuccessResult.state}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Important Advisory Note */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {lang === 'hi' ? 'महत्वपूर्ण सूचना: ' : 'Important: '}
                    </span>
                    <span>
                      {lang === 'hi'
                        ? 'कृपया अपनी किसान आईडी नोट कर लें। भविष्य में कभी भी लॉगिन करने के लिए आप इस आईडी या पंजीकृत मोबाइल नंबर और अपने पासवर्ड का उपयोग करेंगे।'
                        : lang === 'mr'
                        ? 'कृपया आपला शेतकरी आयडी लिहून ठेवा. भविष्यात लॉगिन करण्यासाठी आपण हा आयडी आणि पासवर्ड वापरू शकता.'
                        : 'Please note down your ID. You will use this ID (or your registered mobile) along with your password for all future logins.'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    id="proceed-to-dashboard-btn"
                    onClick={() => {
                      setIsRegisterOpen(false);
                      if (regSuccessResult.role === 'farmer') {
                        onLoginSuccess('my-crops', 'farmer');
                      } else {
                        onLoginSuccess('buyers', 'buyer');
                      }
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>
                      {regSuccessResult.role === 'farmer'
                        ? lang === 'hi'
                          ? 'किसान डैशबोर्ड पर जाएं'
                          : lang === 'mr'
                          ? 'शेतकरी डॅशबोर्डवर जा'
                          : 'Proceed to Farmer Dashboard'
                        : 'Proceed to Buyer Dashboard'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    id="login-with-new-id-btn"
                    onClick={() => {
                      setIsRegisterOpen(false);
                      setSelectedRole(regSuccessResult.role);
                      setIdentifier(regSuccessResult.id);
                      setPassword(regPassword || 'Kisan@Demo123');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    {lang === 'hi' ? 'लॉगिन स्क्रीन पर यह आईडी भरें' : 'Sign in with this ID'}
                  </button>
                </div>
              </div>
            ) : (
              /* B. REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Role Switcher in Modal */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('farmer');
                      setErrorMessage(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      regRole === 'farmer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌾 {lang === 'hi' ? 'किसान (Farmer)' : 'Farmer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('buyer');
                      setErrorMessage(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      regRole === 'buyer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏢 {lang === 'hi' ? 'खरीदार (Buyer)' : 'Buyer'}
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {regRole === 'farmer'
                      ? lang === 'hi'
                        ? 'पूरा नाम:'
                        : 'Farmer Full Name:'
                      : 'Contact / Executive Name:'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="reg-fullname-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={regRole === 'farmer' ? 'e.g. Ramesh Patel' : 'e.g. Anil Agarwal'}
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* If Buyer: Business Name */}
                {regRole === 'buyer' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Business / Mill Name:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="reg-business-name-input"
                        value={regBusinessName}
                        onChange={(e) => setRegBusinessName(e.target.value)}
                        placeholder="e.g. Patanjali Agro Processing Ltd"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'hi' ? 'मोबाइल नंबर:' : 'Mobile Number (10 Digits):'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="reg-mobile-input"
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      required
                      className="w-full pl-11 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {lang === 'hi' ? 'पासवर्ड:' : 'Password (min 6):'}
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        id="reg-password-input"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {lang === 'hi' ? 'पासवर्ड पुष्टि:' : 'Confirm Password:'}
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        id="reg-confirm-password-input"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location: State & District */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">State:</label>
                    <select
                      id="reg-state-select"
                      value={regState}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setRegState(newState);
                        const match = INDIAN_STATES_DATA.find((s) => s.state === newState);
                        if (match && match.districts.length > 0) {
                          setRegDistrict(match.districts[0]);
                        }
                      }}
                      className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
                    >
                      {INDIAN_STATES_DATA.map((s) => (
                        <option key={s.state} value={s.state}>
                          {s.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">District:</label>
                    <select
                      id="reg-district-select"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
                    >
                      {currentDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Village (if farmer) */}
                {regRole === 'farmer' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {lang === 'hi' ? 'गांव / तहसील (वैकल्पिक):' : 'Village / Tehsil (Optional):'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        id="reg-village-input"
                        value={regVillage}
                        onChange={(e) => setRegVillage(e.target.value)}
                        placeholder="e.g. Ashta"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-register-btn"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating ID & Registering...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {regRole === 'farmer'
                            ? lang === 'hi'
                              ? 'पंजीकरण करें और किसान आईडी पाएं'
                              : lang === 'mr'
                              ? 'नोंदणी करा आणि शेतकरी आयडी मिळवा'
                              : 'Register & Generate Kisan ID'
                            : 'Register & Generate Buyer ID'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default SimpleLoginView;
