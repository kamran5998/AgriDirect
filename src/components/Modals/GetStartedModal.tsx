import React, { useState } from 'react';
import { X, CheckCircle2, Sprout, Building2, MapPin, ArrowRight, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCropForPreview?: (cropId: string) => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<'individual_farmer' | 'fpo' | 'buyer'>('individual_farmer');
  const [stateName, setStateName] = useState('Madhya Pradesh');
  const [primaryCrop, setPrimaryCrop] = useState('Wheat (Sharbati)');
  const [harvestVolume, setHarvestVolume] = useState('120');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="emerald" size="sm" icon={<Sparkles className="w-3 h-3 text-emerald-400" />}>
              Free Farmer Access
            </Badge>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">Onboard to AgriDirect Intelligence</h3>
          <p className="text-xs text-slate-300 mt-1">Get customized mandi rate notifications and direct purchase tenders for your crops.</p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Crop Profile Registered!</h4>
              <p className="text-sm text-slate-600 mt-1.5 max-w-xs mx-auto">
                Your mandi tracking dashboard is configured. Real-time SMS price alerts are active for <strong>{primaryCrop}</strong>.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                Live Spot Rates Initialized
              </div>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Your Participant Type
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <div
                  onClick={() => setUserType('individual_farmer')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    userType === 'individual_farmer'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Individual Farmer / Producer</h5>
                      <p className="text-xs text-slate-500">Track local mandis, compare distant hubs & sell harvest.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={userType === 'individual_farmer'}
                    onChange={() => setUserType('individual_farmer')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </div>

                <div
                  onClick={() => setUserType('fpo')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    userType === 'fpo'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Farmer Producer Organization (FPO)</h5>
                      <p className="text-xs text-slate-500">Aggregate member produce & negotiate bulk corporate contracts.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={userType === 'fpo'}
                    onChange={() => setUserType('fpo')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </div>

                <div
                  onClick={() => setUserType('buyer')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    userType === 'buyer'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Institutional Buyer / Miller</h5>
                      <p className="text-xs text-slate-500">Procure directly from verified farm gates and cooperatives.</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={userType === 'buyer'}
                    onChange={() => setUserType('buyer')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(2)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Continue to Crop Preferences
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State / Region</label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Madhya Pradesh</option>
                    <option>Punjab</option>
                    <option>Haryana</option>
                    <option>Maharashtra</option>
                    <option>Gujarat</option>
                    <option>Rajasthan</option>
                    <option>Andhra Pradesh</option>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Commodity</label>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Wheat (Sharbati)</option>
                    <option>Basmati Rice (1121)</option>
                    <option>Soybean (Yellow)</option>
                    <option>Cotton (Shankar-6)</option>
                    <option>Mustard Seed</option>
                    <option>Chana (Desi Chickpea)</option>
                    <option>Red Chili (G-4)</option>
                    <option>Tomato (Hybrid)</option>
                    <option>Onion (Nashik Red)</option>
                    <option>Turmeric (Salem)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Harvest / Lot Size (Quintals)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={harvestVolume}
                    onChange={(e) => setHarvestVolume(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 150"
                  />
                  <div className="absolute right-3 top-2 text-xs text-slate-400 font-medium">Quintals (q)</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number for Mandi Daily SMS Alert
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => setStep(1)} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" variant="primary" size="md" className="w-2/3">
                  Activate Market Watch
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
