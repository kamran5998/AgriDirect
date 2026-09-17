import React, { useState } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Bell,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { FarmerProfile } from '../../../types';

interface FarmerProfileViewProps {
  profile: FarmerProfile;
  onUpdateProfile: (updated: Partial<FarmerProfile>) => void;
}

export const FarmerProfileView: React.FC<FarmerProfileViewProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [mobileNumber, setMobileNumber] = useState(profile.mobileNumber);
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage);
  const [smsAlerts, setSmsAlerts] = useState(profile.smsAlertsEnabled);
  const [whatsappAlerts, setWhatsappAlerts] = useState(profile.whatsappAlertsEnabled);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName,
      mobileNumber,
      preferredLanguage,
      smsAlertsEnabled: smsAlerts,
      whatsappAlertsEnabled: whatsappAlerts,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <Badge variant="emerald" size="sm">Verified Identity</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
          Farmer Profile & Operational Preferences
        </h2>
        <p className="text-xs text-slate-500">
          Manage your farm details, mandi notification channels, and language settings.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile and Alert preferences saved successfully!</span>
        </div>
      )}

      {/* Profile Form Card */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Personal & Farm Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Cultivator Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number for SMS Alerts</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Village / Tehsil</span>
              <span className="font-bold text-slate-800">{profile.village}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">District & State</span>
              <span className="font-bold text-slate-800">{profile.district}, {profile.state}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Landholding Scale</span>
              <span className="font-bold text-emerald-800">{profile.farmSize}</span>
            </div>
          </div>
        </div>

        {/* Alert Channel Toggles */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Notification & Language Preferences
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Preferred Mandi Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full sm:w-72 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              <option value="Punjabi (ਪੰਜਾਬੀ)">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Marathi (मराठी)">Marathi (मराठी)</option>
              <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
              <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Daily 7:00 AM Morning SMS</div>
                  <div className="text-[11px] text-slate-500">Mandi opening spot rate snapshot</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">WhatsApp Instant Buyer Alert</div>
                  <div className="text-[11px] text-slate-500">When buyer offers exceed Mandi spot rate</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" variant="primary" size="md" className="font-bold shadow-md shadow-emerald-600/20 px-6">
            Save Changes
          </Button>
        </div>
      </form>

    </div>
  );
};
