import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Sprout,
  Scale,
  MapPin,
  Calendar,
  Truck,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Store,
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
  Sparkles,
} from 'lucide-react';
import { FarmerListing } from '../../data/directMarketData';
import { farmerApi } from '../../api/farmerApi';
import { Button } from '../common/Button';
import { INDIAN_STATES_DATA } from '../../data/locationData';
import { AiCropListingWizard } from '../farmer-app/crop-flow/AiCropListingWizard';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveListing: (listing: FarmerListing) => void;
  initialCrop?: string;
  initialQuantity?: string;
  initialState?: string;
  initialDistrict?: string;
  farmerDistrict?: string;
  farmerState?: string;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSaveListing,
  initialCrop = 'Wheat',
  initialQuantity = '100',
  initialState,
  initialDistrict,
  farmerDistrict = 'Sehore',
  farmerState = 'Madhya Pradesh',
}) => {
  const [modalMode, setModalMode] = useState<'ai' | 'manual'>('ai');
  const [cropName, setCropName] = useState(initialCrop);
  const [variety, setVariety] = useState('Standard FAQ');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [expectedPrice, setExpectedPrice] = useState('5100');
  const [qualityGrade, setQualityGrade] = useState<'Grade A' | 'Grade B' | 'Grade C' | string>('Grade A');
  const [qualityRemarks, setQualityRemarks] = useState('Clean, sun-dried harvest lot with minimal admixture.');
  
  // Crop Image Upload States
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location states
  const [selectedState, setSelectedState] = useState(initialState || farmerState);
  const availableDistricts =
    INDIAN_STATES_DATA.find((s) => s.state === selectedState)?.districts || [];
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialDistrict && availableDistricts.includes(initialDistrict)
      ? initialDistrict
      : availableDistricts[0] || farmerDistrict
  );
  const [village, setVillage] = useState('Kanpur Grain Yard');
  
  const [availableDate, setAvailableDate] = useState('Immediate / Ready in Barn');
  const [deliveryOption, setDeliveryOption] = useState<'Farm-gate Pickup Only' | 'Farmer Delivery to Depot' | 'Flexible'>('Flexible');
  const [fpoLotId, setFpoLotId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens with initial props
  useEffect(() => {
    if (isOpen) {
      const crop = initialCrop || 'Wheat';
      setCropName(crop);
      setQuantity(initialQuantity || '20');
      
      const st = initialState || farmerState;
      setSelectedState(st);
      const dists = INDIAN_STATES_DATA.find((s) => s.state === st)?.districts || [];
      const dist = (initialDistrict && dists.includes(initialDistrict)) ? initialDistrict : (dists[0] || farmerDistrict);
      setSelectedDistrict(dist);
      setVillage(`${dist} Harvest Shed`);

      // Set default variety and price based on crop
      if (crop.includes('Chana') || crop.includes('Gram')) {
        setVariety('Desi Bold FAQ');
        setExpectedPrice('5100');
      } else if (crop.includes('Wheat')) {
        setVariety('Sharbati Lokwan Grade-A');
        setExpectedPrice('2920');
      } else if (crop.includes('Soybean')) {
        setVariety('Yellow Seed (JS-9560)');
        setExpectedPrice('4850');
      } else if (crop.includes('Mustard')) {
        setVariety('Sarson High Oil');
        setExpectedPrice('5500');
      } else if (crop.includes('Cotton')) {
        setVariety('Shankar-6');
        setExpectedPrice('7200');
      } else if (crop.includes('Basmati')) {
        setVariety('Pusa 1121 Export Grade');
        setExpectedPrice('3950');
      } else {
        setVariety('Standard FAQ');
        setExpectedPrice('3500');
      }
      setErrorMessage(null);
      setImageError(null);
    }
  }, [isOpen, initialCrop, initialQuantity, initialState, initialDistrict, farmerState, farmerDistrict]);

  if (!isOpen) return null;

  const handleStateSelect = (newState: string) => {
    setSelectedState(newState);
    const dists = INDIAN_STATES_DATA.find((s) => s.state === newState)?.districts || [];
    if (dists.length > 0) {
      setSelectedDistrict(dists[0]);
      setVillage(`${dists[0]} Mandi Yard`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setImageError('Please select a valid image file (JPG, JPEG, PNG, or WEBP). Non-image files are not supported.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Optimize resolution via canvas to keep JSON store fast and responsive
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setCropImageUrl(compressed);
            setImageFileName(file.name);
          } else {
            setCropImageUrl(result);
            setImageFileName(file.name);
          }
        };
        img.onerror = () => {
          setCropImageUrl(result);
          setImageFileName(file.name);
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCropImageUrl(null);
    setImageFileName(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qtyNum = parseFloat(quantity);
    if (!qtyNum || qtyNum <= 0) {
      setErrorMessage('Please enter a valid quantity greater than 0 Quintals.');
      return;
    }

    const priceNum = parseFloat(expectedPrice);
    if (!priceNum || priceNum <= 0) {
      setErrorMessage('Please enter a valid expected price per Quintal.');
      return;
    }

    if (!selectedState || !selectedDistrict) {
      setErrorMessage('Please select both State and District.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await farmerApi.createListing({
        cropName,
        variety: variety || 'Standard FAQ',
        quantityQuintals: qtyNum,
        expectedPricePerQuintal: priceNum,
        qualityGrade,
        qualityRemarks: qualityRemarks || 'Clean, sun-dried harvest lot with minimal admixture.',
        cropImageUrl: cropImageUrl || undefined,
        locationVillage: village ? `${village}, ${selectedDistrict}` : `${selectedDistrict}, ${selectedState}`,
        district: selectedDistrict,
        state: selectedState,
        availableDate,
        deliveryOption,
        fpoLotId: fpoLotId || undefined,
      });

      onSaveListing(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create listing:', err);
      setErrorMessage(err?.message || 'Failed to publish crop listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Publish Crop Lot to Buyer Marketplace
              </h3>
              <p className="text-xs text-slate-500">
                Directly list harvest inventory for verified bulk buyers, millers & processors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 pb-1 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalMode('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              modalMode === 'ai'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Fast Listing (Photo-Driven)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              modalMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>📝 Manual Form</span>
          </button>
        </div>

        {modalMode === 'ai' ? (
          <div className="p-6 overflow-y-auto flex-grow">
            <AiCropListingWizard
              initialState={selectedState}
              initialDistrict={selectedDistrict}
              initialVillage={village}
              lang="en"
              onListingCreated={(listing) => {
                onSaveListing(listing);
              }}
              onClose={onClose}
            />
          </div>
        ) : (
          <>
            {/* Validation error */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-grow text-slate-800">
          
          {/* Crop & Variety Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Commodity / Crop <span className="text-red-500">*</span>
              </label>
              <select
                value={cropName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCropName(val);
                  if (val === 'Wheat') {
                    setVariety('Sharbati Lokwan Grade-A');
                    setExpectedPrice('2920');
                  } else if (val === 'Soybean') {
                    setVariety('Yellow Seed (JS-9560)');
                    setExpectedPrice('4850');
                  } else if (val === 'Chana / Gram') {
                    setVariety('Desi Bold FAQ');
                    setExpectedPrice('5100');
                  } else if (val === 'Mustard Seed') {
                    setVariety('Sarson High Oil');
                    setExpectedPrice('5500');
                  } else if (val === 'Cotton') {
                    setVariety('Shankar-6');
                    setExpectedPrice('7200');
                  } else if (val === 'Basmati Rice') {
                    setVariety('Pusa 1121 Export Grade');
                    setExpectedPrice('3950');
                  } else {
                    setVariety('Standard FAQ');
                    setExpectedPrice('3500');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                <option value="Chana / Gram">Chana / Gram (चना)</option>
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Mustard Seed">Mustard / Sarson (सरसों)</option>
                <option value="Cotton">Cotton / Kapas (कपास)</option>
                <option value="Basmati Rice">Basmati Rice (बासमती धान)</option>
                <option value="Maize">Maize / Corn (मक्का)</option>
                <option value="Red Chili">Red Chili (लाल मिर्च)</option>
                <option value="Turmeric">Turmeric (हल्दी)</option>
                <option value="Other">Other Crop (अन्य)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Variety / Seedline
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Desi Bold, Sharbati, JS-9560"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quantity & Expected Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Available Lot Quantity (Quintals) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  Quintals (q)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                ≈ {(parseFloat(quantity || '0') / 10).toFixed(1)} Metric Tons (MT)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expected Price (₹ / Quintal) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="100"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">/ q</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Est. Lot Value: ₹{((parseFloat(quantity || '0') * parseFloat(expectedPrice || '0'))).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Location Selection: State, District, Village */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Lot Location & Barn Address
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                >
                  {INDIAN_STATES_DATA.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / District <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setVillage(`${e.target.value} Mandi Yard / Barn`);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Village / Barn / Depot Shed
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Ashta Barn / Farm Yard / Kanpur Depot"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quality Grade & Crop Image Upload */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Quality Grade & Visual Crop Lot Evidence
              </span>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Visual Inspection
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality Grade <span className="text-red-500">*</span>
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
                >
                  <option value="Grade A">Grade A (Premium / Clean / High Quality)</option>
                  <option value="Grade B">Grade B (Standard FAQ Quality)</option>
                  <option value="Grade C">Grade C (Commercial Milling / Feed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality Remarks / Lot Highlights
                </label>
                <input
                  type="text"
                  value={qualityRemarks}
                  onChange={(e) => setQualityRemarks(e.target.value)}
                  placeholder="e.g. Sun-dried, luster high, clean lot"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Upload Crop Image Section */}
            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Upload Crop Image</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Optional, Recommended)</span>
                </label>
              </div>

              <p className="text-[11px] text-slate-500">
                Upload a clear image of your crop lot to help buyers visually assess the produce.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{imageError}</span>
                </div>
              )}

              {!cropImageUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-white hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 block">
                      Click to choose crop photo
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPG, JPEG, PNG, WEBP
                    </span>
                  </div>
                </button>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={cropImageUrl}
                        alt="Crop preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{imageFileName || 'Crop Lot Image'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Ready to attach to listing
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quality verification disclaimer */}
              <div className="flex items-start gap-1.5 pt-1 text-[10px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Visual crop-quality evidence: Helps buyers visually inspect the produce before sending an offer. Does not replace laboratory/instrument quality testing.
                </span>
              </div>
            </div>
          </div>

          {/* Availability Date & Delivery Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Availability & Dispatch Timeline
              </label>
              <select
                value={availableDate}
                onChange={(e) => setAvailableDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                <option value="Immediate / Ready in Barn">Immediate / Ready in Barn</option>
                <option value="Available in 3-5 Days">Available in 3-5 Days</option>
                <option value="Ready within 10 Days">Ready within 10 Days</option>
                <option value="Upcoming Harvest (Next 2 Weeks)">Upcoming Harvest (Next 2 Weeks)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fulfillment Preference
              </label>
              <select
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer"
              >
                <option value="Flexible">Flexible (Any Mode - Farm-gate or Depot)</option>
                <option value="Farm-gate Pickup Only">Farm-gate Pickup Only (Buyer Brings Truck)</option>
                <option value="Farmer Delivery to Depot">Farmer Delivery to Depot</option>
              </select>
            </div>
          </div>

          {/* Trust Guarantee Note */}
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>100% Free Listing Protection:</strong> Zero listing fees or hidden commissions. Buyer verification and digital gate pass authorization are automatically enabled.
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              icon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
              className="font-bold shadow-md shadow-emerald-600/20"
            >
              {isSubmitting ? 'Publishing Lot...' : 'Publish Crop Lot'}
            </Button>
          </div>

        </form>
        </>
        )}
      </div>
    </div>
  );
};
