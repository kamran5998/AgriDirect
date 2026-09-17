import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Truck,
  TrendingUp,
  Bell,
  Smartphone,
  Check,
  Info,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FarmerProfile } from '../../types';
import { INDIAN_STATES_DATA, AVAILABLE_CROPS_LIST } from '../../data/locationData';

interface FarmerOnboardingProps {
  initialProfile?: Partial<FarmerProfile>;
  onCompleteOnboarding: (finalProfile: FarmerProfile) => void;
  onNavigateBackToRoles: () => void;
}

export const FarmerOnboarding: React.FC<FarmerOnboardingProps> = ({
  initialProfile,
  onCompleteOnboarding,
  onNavigateBackToRoles,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Basic Profile State
  const [fullName, setFullName] = useState(initialProfile?.fullName || 'Rajinder Singh');
  const [farmSize, setFarmSize] = useState('5-10 Acres');
  const [farmingType, setFarmingType] = useState('Conventional High-Yield');
  const [experienceYears, setExperienceYears] = useState('10+ Years (Experienced)');
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi (हिन्दी)');

  // Step 2: Location State
  const [selectedState, setSelectedState] = useState(initialProfile?.state || 'Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(initialProfile?.district || 'Sehore');
  const [village, setVillage] = useState(initialProfile?.village || 'Ashta');
  const [pincode, setPincode] = useState(initialProfile?.pincode || '466116');
  const [selectedMandi, setSelectedMandi] = useState('Sehore APMC Mandi');
  const [autoDetectingGps, setAutoDetectingGps] = useState(false);

  // Step 3: Crops Grown State
  const [selectedCrops, setSelectedCrops] = useState<string[]>([
    'Wheat (Sharbati / Lokwan)',
    'Soybean (Yellow Seed)',
  ]);
  const [harvestVolumes, setHarvestVolumes] = useState<Record<string, string>>({
    'Wheat (Sharbati / Lokwan)': '150',
    'Soybean (Yellow Seed)': '80',
  });

  // Step 4: Preferred Markets & Logistics State
  const [selectedMandis, setSelectedMandis] = useState<string[]>([
    'Sehore APMC Mandi',
    'Indore Grain Market',
  ]);
  const [transportWillingness, setTransportWillingness] = useState('Up to 100 km (For higher price)');
  const [hasWarehouseStorage, setHasWarehouseStorage] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);

  // Step 5: Test Notification Triggered
  const [testAlertSent, setTestAlertSent] = useState(false);

  // Current state/district mandi list
  const stateEntry = INDIAN_STATES_DATA.find((s) => s.state === selectedState);
  const stateDistricts = stateEntry?.districts || ['District Central'];
  const stateMandis = stateEntry?.primaryMandis || ['Primary APMC Mandi'];

  const stepsHeader = [
    { number: 1, title: 'Basic Profile', desc: 'Farm & language' },
    { number: 2, title: 'Farm Location', desc: 'Mandi radius' },
    { number: 3, title: 'Crops Grown', desc: 'Commodity portfolio' },
    { number: 4, title: 'Market Preferences', desc: 'Trading logistics' },
    { number: 5, title: 'Profile Complete', desc: 'Live terminal launch' },
  ];

  // Helper toggle crop selection
  const toggleCrop = (cropName: string) => {
    if (selectedCrops.includes(cropName)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== cropName));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropName]);
      if (!harvestVolumes[cropName]) {
        setHarvestVolumes({ ...harvestVolumes, [cropName]: '100' });
      }
    }
  };

  // Helper toggle mandi selection
  const toggleMandi = (mandiName: string) => {
    if (selectedMandis.includes(mandiName)) {
      if (selectedMandis.length > 1) {
        setSelectedMandis(selectedMandis.filter((m) => m !== mandiName));
      }
    } else {
      setSelectedMandis([...selectedMandis, mandiName]);
    }
  };

  const handleSimulateGps = () => {
    setAutoDetectingGps(true);
    setTimeout(() => {
      setAutoDetectingGps(false);
      setSelectedState('Madhya Pradesh');
      setSelectedDistrict('Sehore');
      setVillage('Ashta Tehsil, Ward 4');
      setPincode('466116');
      setSelectedMandi('Sehore APMC Mandi');
    }, 900);
  };

  const handleTriggerTestAlert = () => {
    setTestAlertSent(true);
    setTimeout(() => setTestAlertSent(false), 4000);
  };

  const handleFinish = () => {
    const finalProfile: FarmerProfile = {
      fullName,
      mobileNumber: initialProfile?.mobileNumber || '9876543210',
      email: initialProfile?.email || 'farmer@agridirect.in',
      state: selectedState,
      district: selectedDistrict,
      village,
      pincode,
      farmSize,
      farmingType,
      experienceYears,
      preferredLanguage,
      selectedCrops,
      harvestVolumes,
      selectedMandis,
      transportWillingness,
      hasWarehouseStorage,
      smsAlertsEnabled,
      whatsappAlertsEnabled,
    };
    onCompleteOnboarding(finalProfile);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((prev) => (prev - 1) as any);
              } else {
                onNavigateBackToRoles();
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Back to Role Selection' : `Back to Step ${currentStep - 1}`}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Farmer Setup Wizard
            </span>
          </div>
        </div>

        {/* 5-Step Modern Progress Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 mb-8">
          <div className="flex items-center justify-between relative">
            
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-300 -z-0"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            ></div>

            {stepsHeader.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              return (
                <div
                  key={step.number}
                  onClick={() => {
                    if (step.number < currentStep) setCurrentStep(step.number as any);
                  }}
                  className={`flex flex-col items-center relative z-10 ${
                    step.number < currentStep ? 'cursor-pointer' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-slate-900 text-emerald-400 ring-4 ring-emerald-500/20'
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 text-white" /> : step.number}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-slate-900' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden md:block">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 mb-8 min-h-[480px] flex flex-col justify-between">
          
          {/* STEP 1: Basic Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Badge variant="emerald" size="sm">Step 1 of 5</Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
                  Basic Farm & Cultivator Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This helps our engine calibrate your daily volume capacity and local language alerts.
                </p>
              </div>

              <div className="space-y-5">
                {/* Farmer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farmer / Lead Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Farm Size */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Total Cultivated Landholding Size
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {['< 2 Acres (Marginal)', '2-5 Acres (Small)', '5-10 Acres (Medium)', '10-25 Acres (Large)', '25+ Acres / FPO'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFarmSize(size)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                          farmSize === size
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Farming Methodology */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Farming Methodology
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {[
                      { title: 'Conventional High-Yield', desc: 'Standard fertilizers & hybrid seeds' },
                      { title: 'Organic Certified (NPOP)', desc: 'Export & chemical-free premium' },
                      { title: 'Natural / Zero Budget (ZBNF)', desc: 'Desi cow & bio-inputs' },
                      { title: 'Mixed / Horticulture', desc: 'Multi-cropping system' },
                    ].map((item) => (
                      <div
                        key={item.title}
                        onClick={() => setFarmingType(item.title)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          farmingType === item.title
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language Preference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Preferred Language for Mandi Voice & SMS Alerts
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      'Hindi (हिन्दी)',
                      'Punjabi (ਪੰਜਾਬੀ)',
                      'Marathi (मराठी)',
                      'Gujarati (ગુજરાતી)',
                      'Telugu (తెలుగు)',
                      'Tamil (தமிழ்)',
                      'Kannada (ಕನ್ನಡ)',
                      'English',
                    ].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setPreferredLanguage(lang)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                          preferredLanguage === lang
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Mandi */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Badge variant="emerald" size="sm">Step 2 of 5</Badge>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
                    Farm Location & Primary Mandi Link
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We benchmark your local farm-gate against neighboring district APMC mandis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateGps}
                  disabled={autoDetectingGps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <MapPin className={`w-3.5 h-3.5 ${autoDetectingGps ? 'animate-bounce' : ''}`} />
                  <span>{autoDetectingGps ? 'Locating Nearest APMC...' : 'Auto-Detect via GPS'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        const match = INDIAN_STATES_DATA.find((s) => s.state === e.target.value);
                        if (match && match.districts.length > 0) {
                          setSelectedDistrict(match.districts[0]);
                          if (match.primaryMandis.length > 0) {
                            setSelectedMandi(match.primaryMandis[0]);
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {INDIAN_STATES_DATA.map((s) => (
                        <option key={s.state} value={s.state}>
                          {s.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District / Administrative Division</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {stateDistricts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Village / Tehsil */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Village / Tehsil Name</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Ashta Village"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Pin code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Area Postal PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 466116"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Primary Mandi Selection */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Nearest Primary Regulated APMC Mandi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stateMandis.map((m) => (
                      <div
                        key={m}
                        onClick={() => setSelectedMandi(m)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedMandi === m
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold">{m}</span>
                        </div>
                        <input
                          type="radio"
                          checked={selectedMandi === m}
                          onChange={() => setSelectedMandi(m)}
                          className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Crops Grown */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="emerald" size="sm">Step 3 of 5</Badge>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
                    Select Your Crops & Estimated Volume
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose one or more crops you cultivate. We will stream real-time price alerts for these commodities.
                  </p>
                </div>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  {selectedCrops.length} Crops Selected
                </div>
              </div>

              {/* Crop Grid Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                {AVAILABLE_CROPS_LIST.map((crop) => {
                  const isSelected = selectedCrops.includes(crop.name);
                  return (
                    <div
                      key={crop.id}
                      onClick={() => toggleCrop(crop.name)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{crop.icon}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {crop.name}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <span>{crop.category}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{crop.season}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Volume Configuration for Selected Crops */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Estimated Harvest Size (Quintals) for Selected Crops
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCrops.map((crop) => (
                    <div key={crop} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{crop}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={harvestVolumes[crop] || '100'}
                          onChange={(e) =>
                            setHarvestVolumes({
                              ...harvestVolumes,
                              [crop]: e.target.value,
                            })
                          }
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-right focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                        <span className="text-xs text-slate-500 font-semibold">q</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Preferred Markets & Logistics */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Badge variant="emerald" size="sm">Step 4 of 5</Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
                  Trading Preferences & Logistics Reach
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure which mandis to monitor for price arbitrage and how you receive alerts.
                </p>
              </div>

              <div className="space-y-5">
                {/* Mandis to Track */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Mandis to Track Daily (Multiple Choice)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {stateMandis.map((m) => {
                      const isTracked = selectedMandis.includes(m);
                      return (
                        <div
                          key={m}
                          onClick={() => toggleMandi(m)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isTracked
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold">{m}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isTracked}
                            onChange={() => toggleMandi(m)}
                            className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 rounded"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transport Reach */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Willingness to Transport for Premium Net Price
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { title: 'Local Only (≤ 25 km)', desc: 'Fastest turn-around' },
                      { title: 'Up to 100 km', desc: 'Worth extra +₹150/q gain' },
                      { title: 'Inter-State Hubs (200+ km)', desc: 'Bulk FPO truckload arbitrage' },
                    ].map((item) => (
                      <div
                        key={item.title}
                        onClick={() => setTransportWillingness(item.title)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          transportWillingness.includes(item.title.split(' ')[0])
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warehouse & Storage Availability */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Do you have on-farm or warehouse storage?</div>
                    <div className="text-[11px] text-slate-500">Allows holding produce for 30-60 days during seasonal price dips.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasWarehouseStorage(!hasWarehouseStorage)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      hasWarehouseStorage
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {hasWarehouseStorage ? 'Yes, Available' : 'No, Spot Sale'}
                  </button>
                </div>

                {/* Notifications Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Daily 7 AM SMS Digest</div>
                        <div className="text-[10px] text-slate-500">Mandi opening rates</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlertsEnabled}
                      onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">WhatsApp Price Surge Alert</div>
                        <div className="text-[10px] text-slate-500">Direct buyer tenders</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappAlertsEnabled}
                      onChange={(e) => setWhatsappAlertsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Complete Profile (Confirmation & Summary) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <Badge variant="emerald" size="sm">Step 5 of 5 — Ready!</Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
                  Farmer Profile Configured Successfully
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your personalized market intelligence engine is calibrated for maximum net revenue realization.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{fullName}</h4>
                    <p className="text-xs text-slate-400">
                      {village}, {selectedDistrict} ({selectedState}) • {farmSize}
                    </p>
                  </div>
                  <Badge variant="emerald" size="sm">
                    Verified Kisan Profile
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tracked Crops</span>
                    <span className="font-bold text-emerald-400">{selectedCrops.length} Commodities</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Mandi</span>
                    <span className="font-bold text-white truncate block">{selectedMandi.split(' ')[0]} APMC</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Alert Delivery</span>
                    <span className="font-bold text-emerald-400">SMS & WhatsApp</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Revenue Lift</span>
                    <span className="font-bold text-emerald-400 font-mono">+18% to +24%</span>
                  </div>
                </div>

                {/* Tracked Crops Pills */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                  {selectedCrops.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">
                      {c} ({harvestVolumes[c] || 100}q)
                    </span>
                  ))}
                </div>
              </div>

              {/* Test Alert Button & Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      {testAlertSent ? 'SMS Dispatched to Your Device!' : 'Simulate Your Daily Morning Mandi SMS Alert'}
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      {testAlertSent
                        ? 'Sample SMS: "AgriDirect: Sharbati Wheat at Sehore APMC opened @ ₹2,860/q (+2.8%). 28 buyers active."'
                        : 'Click to preview how spot prices and buyer alerts will arrive on your phone.'}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerTestAlert}
                  className="bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100/50 shrink-0"
                >
                  {testAlertSent ? 'Resend Sample' : 'Test SMS Alert'}
                </Button>
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous Step
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="font-bold shadow-md shadow-emerald-600/20"
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleFinish}
                icon={<Sparkles className="w-5 h-5" />}
                iconPosition="right"
                className="font-bold shadow-lg shadow-emerald-600/25 px-8"
              >
                Launch My Market Intelligence Terminal
              </Button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
