import React from 'react';
import {
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  Phone,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';

export const SavedMarketsView: React.FC = () => {
  const savedMandis = [
    {
      id: 'm-1',
      name: 'Sehore APMC Mandi',
      district: 'Sehore, MP',
      distance: '8 km from farm',
      dailyVolume: '4,200 Quintals',
      activeCommodities: 'Wheat, Soybean, Gram (Chana)',
      openingHours: '07:00 AM - 05:00 PM',
      secretaryPhone: '+91 7562 224102',
      electronicWeighbridge: true,
    },
    {
      id: 'm-2',
      name: 'Indore Grain Terminal Market',
      district: 'Indore, MP',
      distance: '58 km from farm',
      dailyVolume: '14,800 Quintals',
      activeCommodities: 'Wheat, Soybean, Maize, Mustard',
      openingHours: '06:30 AM - 06:00 PM',
      secretaryPhone: '+91 731 2548900',
      electronicWeighbridge: true,
    },
    {
      id: 'm-3',
      name: 'Dewas Krishi Mandi Yard',
      district: 'Dewas, MP',
      distance: '36 km from farm',
      dailyVolume: '5,600 Quintals',
      activeCommodities: 'Soybean, Wheat, Garlic',
      openingHours: '07:30 AM - 04:30 PM',
      secretaryPhone: '+91 7272 231500',
      electronicWeighbridge: true,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <Badge variant="emerald" size="sm">Watchlist Mandis</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
          Saved APMC Mandis & Market Yards
        </h2>
        <p className="text-xs text-slate-500">
          Your pinned markets for automated morning price digests and auction schedule notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {savedMandis.map((mandi) => (
          <div
            key={mandi.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-700">Pinned</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{mandi.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {mandi.district} ({mandi.distance})
              </p>

              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Arrival:</span>
                  <span className="font-bold text-slate-900 font-mono">{mandi.dailyVolume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trading Hours:</span>
                  <span className="font-bold text-slate-700">{mandi.openingHours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weighbridge:</span>
                  <span className="font-bold text-emerald-700">e-NAM Digital</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                Major crops: <strong className="text-slate-700">{mandi.activeCommodities}</strong>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {mandi.secretaryPhone}
              </span>
              <span className="font-bold text-emerald-700 hover:underline cursor-pointer">
                View Yard Depth →
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
