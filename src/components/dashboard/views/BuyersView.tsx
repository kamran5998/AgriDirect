import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';

export const BuyersView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Buyers');
  const [acceptedTender, setAcceptedTender] = useState<string | null>(null);

  const buyers = [
    {
      id: 'b-1',
      name: 'Patanjali Agro Processing Ltd',
      type: 'Food Processor & Brand',
      cropTarget: 'Wheat (Sharbati Grade A)',
      volumeWanted: '500 Quintals',
      priceOffered: 2920,
      mandiRef: 2860,
      premium: '+₹60 / quintal premium',
      location: 'Sehore Industrial Hub, MP (14 km)',
      settlementSpeed: '24-Hour Digital Escrow',
      verified: true,
      moistureLimit: '< 11.5%',
    },
    {
      id: 'b-2',
      name: 'ITC e-Choupal Procurement Center',
      type: 'Agri Export & Domestic Retail',
      cropTarget: 'Soybean (Yellow Seed)',
      volumeWanted: '350 Quintals',
      priceOffered: 4740,
      mandiRef: 4680,
      premium: '+₹60 / quintal premium',
      location: 'Dewas Yard, MP (32 km)',
      settlementSpeed: 'Instant Weighment & Bank Transfer',
      verified: true,
      moistureLimit: '< 10.0%',
    },
    {
      id: 'b-3',
      name: 'Adani Wilmar Edible Oils Hub',
      type: 'Oil Extraction & Solvent Plant',
      cropTarget: 'Mustard Seed (Sarson)',
      volumeWanted: '800 Quintals',
      priceOffered: 5560,
      mandiRef: 5490,
      premium: '+₹70 / quintal premium',
      location: 'Indore Bypass Depot (48 km)',
      settlementSpeed: 'Same-day NEFT Direct Credit',
      verified: true,
      moistureLimit: '< 8.0%',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <Badge variant="emerald" size="sm">Direct Market Access</Badge>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
          Verified Institutional Buyers & Direct Tenders
        </h2>
        <p className="text-xs text-slate-500">
          Sell directly to verified millers, processors, and retail chains with 0% middleman commission.
        </p>
      </div>

      {/* Tender List Cards */}
      <div className="space-y-4">
        {buyers.map((b) => {
          const isDone = acceptedTender === b.id;
          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                    KYC Verified Buyer
                  </Badge>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {b.premium}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{b.name}</h3>
                <p className="text-xs text-slate-500">{b.type}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="text-slate-700 font-medium">
                    Commodity: <strong>{b.cropTarget}</strong> ({b.volumeWanted})
                  </div>
                  <div className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{b.location}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {b.settlementSpeed}
                  </span>
                  <span>• Moisture Spec: {b.moistureLimit}</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex flex-col items-start lg:items-end justify-between shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹{b.priceOffered.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 font-sans ml-1">/ Quintal</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 mb-3">
                  Local Mandi Rate: ₹{b.mandiRef}/q
                </span>

                {isDone ? (
                  <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Contract Locked & SMS Dispatched!
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setAcceptedTender(b.id)}
                    className="font-bold shadow-md shadow-emerald-600/20"
                  >
                    Accept Offer & Request Gate Pass
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
