import React from 'react';
import {
  Plus,
  Sprout,
  Scale,
  MapPin,
  Calendar,
  Truck,
  Eye,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { FarmerListing } from '../../data/directMarketData';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface MyListingsSectionProps {
  listings: FarmerListing[];
  onOpenCreateListing: () => void;
  onViewMatchingBuyers: (cropName: string) => void;
  onDeleteListing?: (id: string) => void;
}

export const MyListingsSection: React.FC<MyListingsSectionProps> = ({
  listings,
  onOpenCreateListing,
  onViewMatchingBuyers,
  onDeleteListing,
}) => {
  const totalQuintalsListed = listings.reduce((acc, curr) => acc + curr.quantityQuintals, 0);
  const totalEstimatedValue = listings.reduce(
    (acc, curr) => acc + curr.quantityQuintals * curr.expectedPricePerQuintal,
    0
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Portfolio Metrics */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <Badge variant="emerald" size="sm">
            Farmer Harvest Inventory
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight mt-1">
            My Published Crop Lots
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your live farm inventory visible to over 240+ verified institutional buyers across India.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Active Lots</span>
            <span className="text-lg font-black text-emerald-950 font-mono">{listings.length}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Volume</span>
            <span className="text-lg font-black text-slate-900 font-mono">{totalQuintalsListed}q</span>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenCreateListing}
            icon={<Plus className="w-4 h-4" />}
            className="font-bold shadow-md shadow-emerald-600/20"
          >
            Create New Listing
          </Button>
        </div>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No active crop listings yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              List your harvested grain, oilseed, or cotton to receive direct purchase bids from verified millers and exporters.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onOpenCreateListing}>
            List Your First Crop Lot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-slate-300 transition-all"
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {item.cropName}
                        </h3>
                        <Badge variant="emerald" size="sm">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.variety}</p>
                    </div>
                  </div>

                  {/* Views / Created Tag */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{item.viewsCount} views</span>
                  </div>
                </div>

                {/* Specs Box */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Lot Quantity</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {item.quantityQuintals} <span className="text-xs font-normal text-slate-500">Quintals</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">≈ {(item.quantityQuintals / 10).toFixed(1)} MT</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Expected Price</span>
                    <span className="text-base font-black text-emerald-700 font-mono">
                      ₹{item.expectedPricePerQuintal}
                    </span>
                    <span className="text-xs text-slate-500"> / q</span>
                    <span className="text-[10px] text-emerald-800 font-bold block">
                      Val: ₹{(item.quantityQuintals * item.expectedPricePerQuintal).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Quality & Logistics */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Quality Grade:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {item.qualityGrade} ({item.moisturePercent}% Moisture)
                    </span>
                  </div>

                  {(item.foreignMatterPercent !== undefined || item.grainDamagePercent !== undefined) && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Purity Specs:</span>
                      <span className="font-semibold text-slate-700">
                        FM: {item.foreignMatterPercent ?? 0.5}% | Damage: {item.grainDamagePercent ?? 0.8}%
                      </span>
                    </div>
                  )}

                  {item.fpoLotId && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Aggregated Under:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        {item.fpoLotId}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {item.locationVillage}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dispatch Availability:</span>
                    <span className="font-semibold text-emerald-700">{item.availableDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  <Building className="w-3.5 h-3.5" />
                  <span>{item.matchedBuyersCount} Verified Tenders Match</span>
                </div>

                <div className="flex items-center gap-2">
                  {onDeleteListing && (
                    <button
                      onClick={() => onDeleteListing(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Withdraw listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewMatchingBuyers(item.cropName)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                    className="font-bold text-xs"
                  >
                    View Matching Buyers
                  </Button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
