import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Building,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Plus,
  AlertCircle,
  Check,
  X,
  Phone,
  Loader2,
} from 'lucide-react';
import { StorageFacility, StorageBooking } from '../../data/directMarketData';
import { farmerApi } from '../../api/farmerApi';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface StorageFacilitiesSectionProps {
  farmerDistrict?: string;
  farmerState?: string;
}

export const StorageFacilitiesSection: React.FC<StorageFacilitiesSectionProps> = ({
  farmerDistrict = 'Sehore',
  farmerState = 'Madhya Pradesh',
}) => {
  const [facilities, setFacilities] = useState<StorageFacility[]>([]);
  const [bookings, setBookings] = useState<StorageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [needStorage, setNeedStorage] = useState(true);

  // Booking modal
  const [selectedFacility, setSelectedFacility] = useState<StorageFacility | null>(null);
  const [bookingCrop, setBookingCrop] = useState('Wheat');
  const [bookingQuantity, setBookingQuantity] = useState('100');
  const [bookingDuration, setBookingDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facs, existingBookings] = await Promise.all([
        farmerApi.getStorageFacilities(farmerDistrict),
        farmerApi.getStorageBookings(),
      ]);
      if (Array.isArray(facs)) {
        const normalizedFacs: StorageFacility[] = facs.map((f: any) => ({
          id: f.id,
          name: f.name,
          location: f.location || `${f.district}, ${f.state}`,
          district: f.district || farmerDistrict,
          state: f.state || farmerState,
          distanceKm: f.distanceKm ?? f.distance_km ?? 10,
          totalCapacityMt: f.totalCapacityMt ?? f.total_capacity_mt ?? f.capacity ?? 10000,
          availableCapacityMt: f.availableCapacityMt ?? f.available_capacity_mt ?? f.available_capacity ?? 2000,
          estimatedCostPerQtlMonth: f.estimatedCostPerQtlMonth ?? f.estimated_cost_per_qtl_month ?? (f.rate_per_quintal_per_day ? f.rate_per_quintal_per_day * 30 : 12),
          storageType: f.storageType ?? f.storage_type ?? 'Scientific Warehouse',
          accreditation: f.accreditation ?? 'WDRA Certified & e-NWR Linked',
          insuranceCovered: f.insuranceCovered ?? f.insurance_covered ?? true,
          contactPhone: f.contactPhone ?? f.contact_phone ?? '+91 7562 224150',
          isSampleData: f.isSampleData ?? f.is_sample_data ?? false,
        }));
        setFacilities(normalizedFacs);
      } else {
        setFacilities([]);
      }

      if (Array.isArray(existingBookings)) {
        const normalizedBookings: StorageBooking[] = existingBookings.map((b: any) => ({
          id: b.id,
          facilityId: b.facilityId ?? b.facility_id,
          facilityName: b.facilityName ?? b.facility_name ?? 'Certified Storage Hub',
          farmerId: b.farmerId ?? b.farmer_id ?? 1,
          farmerName: b.farmerName ?? b.farmer_name ?? 'Farmer Partner',
          cropName: b.cropName ?? b.crop_name ?? b.crop ?? 'Grain Crop',
          quantityQuintals: b.quantityQuintals ?? b.quantity_quintals ?? b.quantity ?? 50,
          requiredDurationDays: b.requiredDurationDays ?? b.required_duration_days ?? b.duration_days ?? 30,
          location: b.location ?? 'Hub Depot',
          estimatedCostTotal: b.estimatedCostTotal ?? b.estimated_cost_total ?? 600,
          status: b.status || 'CONFIRMED',
          createdAt: b.createdAt ?? (b.created_at ? new Date(b.created_at).toLocaleString() : 'Recently'),
        }));
        setBookings(normalizedBookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Failed to load storage facilities and bookings:', err);
      setFacilities([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmerDistrict]);

  const handleBookSlot = (fac: StorageFacility) => {
    setSelectedFacility(fac);
    setBookingSubmitted(false);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;

    const qty = Number(bookingQuantity) || 100;
    const dur = Number(bookingDuration) || 30;
    const months = Math.ceil(dur / 30);
    const estCost = qty * selectedFacility.estimatedCostPerQtlMonth * months;

    setIsSubmitting(true);
    try {
      const res = await farmerApi.bookStorageSlot({
        facility_id: selectedFacility.id,
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        crop: bookingCrop,
        crop_name: bookingCrop,
        cropName: bookingCrop,
        quantity: qty,
        quantity_quintals: qty,
        quantityQuintals: qty,
        duration_days: dur,
        required_duration_days: dur,
        requiredDurationDays: dur,
        location: selectedFacility.location,
      });

      if (res) {
        setBookingSubmitted(true);
        await loadData();
        setTimeout(() => {
          setSelectedFacility(null);
          setBookingSubmitted(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to book storage slot:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">
              WDRA / CWC / MPSWC Certified
            </Badge>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Avoid Distress Sale
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] tracking-tight">
            Scientific Post-Harvest Storage & Warehousing
          </h2>
          <p className="text-xs text-slate-500">
            Store harvested grains safely in certified silos and warehouses with e-NWR negotiable receipt pledge loan eligibility.
          </p>
        </div>

        {/* Toggle Storage Need */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 shrink-0">
          <div className="text-xs">
            <span className="font-bold text-emerald-950 block">Need Storage Slot?</span>
            <span className="text-[11px] text-emerald-700">Find nearby WDRA depots</span>
          </div>
          <button
            onClick={() => setNeedStorage(!needStorage)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              needStorage ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                needStorage ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active Bookings (if any) */}
      {bookings.length > 0 && (
        <div className="bg-emerald-900 text-white rounded-3xl p-5 sm:p-6 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Your Active Storage Space Reservations
            </h3>
            <span className="text-xs font-mono bg-emerald-800 px-2 py-0.5 rounded-md">
              {bookings.length} Slot(s) Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookings.map((b) => (
              <div key={b.id} className="p-3 bg-emerald-800/80 rounded-2xl border border-emerald-700 text-xs space-y-1">
                <div className="font-bold text-white text-sm">{b.facilityName}</div>
                <div className="text-emerald-200">
                  {b.cropName} • {b.quantityQuintals} Quintals • Duration: {b.requiredDurationDays} Days
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-emerald-300">Est. Total Cost: ₹{b.estimatedCostTotal.toLocaleString()}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Loading verified storage facilities from database...</p>
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Warehouse className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No storage facilities found in {farmerDistrict}.</p>
          <p className="text-xs text-slate-400 mt-1">Check neighboring districts or clear location filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between gap-4 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <Badge variant="amber" size="sm">
                    {fac.storageType}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{fac.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {fac.location} ({fac.distanceKm} km from farm)
                  </p>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Available Capacity:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {fac.availableCapacityMt} MT / {fac.totalCapacityMt} MT
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Storage Rent:</span>
                    <span className="font-black text-emerald-700 font-mono">
                      ₹{fac.estimatedCostPerQtlMonth} / qtl / month
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Accreditation:</span>
                    <span className="font-semibold text-slate-900 text-[11px]">{fac.accreditation}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Insurance Cover:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Comprehensive
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Contact Desk: {fac.contactPhone}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400">Verified Storage Depot</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBookSlot(fac)}
                  className="font-bold text-xs"
                >
                  Reserve Space
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Reserve Storage Slot
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[220px]">
                    {selectedFacility.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Slot Reserved Successfully</h4>
                <p className="text-xs text-slate-600">
                  Depot in-charge notified. You can deliver harvest lot with Gate Pass.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Commodity</label>
                  <select
                    value={bookingCrop}
                    onChange={(e) => setBookingCrop(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="Chana">Chana (चना)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (Quintals)</label>
                    <input
                      type="number"
                      min="10"
                      value={bookingQuantity}
                      onChange={(e) => setBookingQuantity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
                    <select
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="30">30 Days (1 Month)</option>
                      <option value="60">60 Days (2 Months)</option>
                      <option value="90">90 Days (3 Months)</option>
                      <option value="180">180 Days (6 Months)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-500">Estimated Monthly Cost:</span>
                  <span className="font-black font-mono text-emerald-700 text-sm">
                    ₹{(
                      Number(bookingQuantity || 0) *
                      selectedFacility.estimatedCostPerQtlMonth *
                      Math.ceil(Number(bookingDuration || 30) / 30)
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button variant="outline" size="sm" type="button" onClick={() => setSelectedFacility(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="font-bold shadow-xs">
                    Confirm Reservation
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
