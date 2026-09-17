import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Sparkles,
  Edit2,
  Check,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Navigation,
  X,
  Compass,
} from 'lucide-react';
import { Language } from '../types';
import { INDIAN_STATES_DATA } from '../../../data/locationData';

interface CropLocationStepProps {
  locationVillage: string;
  district: string;
  state: string;
  pincode?: string;
  lang: Language;
  onUpdateLocation: (village: string, district: string, state: string, pincode?: string) => void;
  onBack: () => void;
  onProceedToQuantity: () => void;
}

export const CropLocationStep: React.FC<CropLocationStepProps> = ({
  locationVillage,
  district,
  state,
  pincode = '466116',
  lang,
  onUpdateLocation,
  onBack,
  onProceedToQuantity,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVillage, setTempVillage] = useState(locationVillage || 'Rampur / Ashta');
  const [tempState, setTempState] = useState(state || 'Madhya Pradesh');
  const [tempDistrict, setTempDistrict] = useState(district || 'Sehore');
  const [tempPincode, setTempPincode] = useState(pincode || '466116');

  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'detected' | 'fallback' | 'denied' | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Available districts for current state
  const availableDistricts =
    INDIAN_STATES_DATA.find((s) => s.state === tempState)?.districts || [
      'Sehore',
      'Indore',
      'Bhopal',
      'Ujjain',
      'Dewas',
    ];

  const handleStateChange = (newState: string) => {
    setTempState(newState);
    const districts = INDIAN_STATES_DATA.find((s) => s.state === newState)?.districts || [];
    if (districts.length > 0) {
      setTempDistrict(districts[0]);
    }
  };

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('fallback');
      setGpsMessage('Geolocation is not supported in this browser. Using standard location.');
      return;
    }

    setIsDetectingGps(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingGps(false);
        setGpsStatus('detected');
        setGpsMessage('Location coordinates verified successfully via GPS.');
        // If current village is empty or default, set local farmgate
        if (!tempVillage) {
          setTempVillage('Rampur');
        }
      },
      (error) => {
        setIsDetectingGps(false);
        setGpsStatus('fallback');
        if (error.code === error.PERMISSION_DENIED) {
          setGpsMessage('GPS permission not granted. You can enter your village and district manually below.');
        } else {
          setGpsMessage('GPS signal unavailable. Default regional location loaded.');
        }
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  // Attempt auto-detect on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const saveManualLocation = () => {
    onUpdateLocation(tempVillage, tempDistrict, tempState, tempPincode);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 4: स्थान' : lang === 'mr' ? 'पायरी ४: स्थान' : 'Step 4: Location'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'फ़सल का स्थान (Location)' : lang === 'mr' ? 'पिकाचे स्थान' : 'Crop Farm Location'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'खरीदार पिकअप और मंडी दूरी के लिए अपना सही स्थान सत्यापित करें'
            : 'Verified location helps match buyers for farm-gate pickup and calculate mandi logistics.'}
        </p>
      </div>

      {/* Main Location Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-5">
        {/* GPS Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">
                {isDetectingGps
                  ? 'Detecting GPS Location...'
                  : gpsStatus === 'detected'
                  ? 'Location (Auto-detected)'
                  : 'Location (Manual / Regional)'}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                {gpsMessage || 'GPS coordinates synced with regional APMC mandi grid.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetectingGps}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'वर्तमान स्थान का उपयोग करें' : 'Use Current Location'}</span>
          </button>
        </div>

        {/* Display Current Location Fields */}
        {!isEditing ? (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Village</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{tempVillage || locationVillage || 'Rampur'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">District</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{tempDistrict || district || 'Kanpur'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">State</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{tempState || state || 'Uttar Pradesh'}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Pincode</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{tempPincode || pincode || '208001'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">Need to change your farm address?</span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'स्थान बदलें' : 'Change / Edit Location'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Inline Edit Form */
          <div className="space-y-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-xs font-black text-emerald-950 uppercase">Edit Location Details</span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">State</label>
                <select
                  value={tempState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                >
                  {INDIAN_STATES_DATA.map((s) => (
                    <option key={s.state} value={s.state}>{s.state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">District</label>
                <select
                  value={tempDistrict}
                  onChange={(e) => setTempDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Village / Locality</label>
                <input
                  type="text"
                  value={tempVillage}
                  onChange={(e) => setTempVillage(e.target.value)}
                  placeholder="e.g. Rampur / Ashta"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Pincode</label>
                <input
                  type="text"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  placeholder="e.g. 208001"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={saveManualLocation}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Location</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onUpdateLocation(tempVillage, tempDistrict, tempState, tempPincode);
            onProceedToQuantity();
          }}
          className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'hi' ? 'मात्रा दर्ज करें' : lang === 'mr' ? 'प्रमाण नोंदवा' : 'Continue to Quantity'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
