import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  MapPin,
  Scale,
  IndianRupee,
  Building,
  Store,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { FarmerProfile } from '../../types';
import { Language, FarmerTab } from './types';
import { farmerApi } from '../../api/farmerApi';
import { FarmerListing } from '../../data/directMarketData';
import { AiCropListingWizard } from './crop-flow/AiCropListingWizard';
import { useConnectivity } from '../../context/ConnectivityContext';
import { offlineStorage } from '../../services/offlineStorageService';
import { LastSyncedBadge } from '../common/LastSyncedBadge';

interface MyCropsViewProps {
  profile: FarmerProfile;
  lang: Language;
  onNavigateTab: (tab: FarmerTab) => void;
  onUpdateProfileCrops?: (
    crops: string[],
    volumes: Record<string, string>,
    state?: string,
    district?: string
  ) => void;
}

// Sample demo images for quick testing
const SAMPLE_PRESETS = [
  {
    name: 'Wheat (गेहूं)',
    variety: 'Sharbati Lokwan',
    crop: 'Wheat',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Soybean (सोयाबीन)',
    variety: 'JS-9560 Yellow Seed',
    crop: 'Soybean',
    image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cotton (कपास)',
    variety: 'Shankar-6 Premium',
    crop: 'Cotton',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Mustard (सरसों)',
    variety: 'Pusa Bold High Oil',
    crop: 'Mustard Seed',
    image: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?w=600&auto=format&fit=crop&q=80',
  },
];

export const MyCropsView: React.FC<MyCropsViewProps> = ({
  profile,
  lang,
  onNavigateTab,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard active state & selected image data
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [initialFileName, setInitialFileName] = useState<string | null>(null);

  // Connectivity & offline caching
  const { isOffline } = useConnectivity();
  const [cachedTimestamp, setCachedTimestamp] = useState<number | null>(null);

  // Recent Farmer Listings
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fetchListings = async () => {
    setIsLoadingListings(true);
    try {
      if (isOffline) {
        const cached = await offlineStorage.getCachedItem<FarmerListing[]>('farmer_my_listings');
        if (cached && cached.data) {
          setListings(cached.data);
          setCachedTimestamp(cached.lastUpdated);
          setIsLoadingListings(false);
          return;
        }
      }

      const data = await farmerApi.getListings();
      setListings(data);
      const now = Date.now();
      setCachedTimestamp(now);
      await offlineStorage.setCachedItem('farmer_my_listings', data, 'server_live');
    } catch (err) {
      console.warn('Error fetching farmer listings, loading cache:', err);
      const cached = await offlineStorage.getCachedItem<FarmerListing[]>('farmer_my_listings');
      if (cached && cached.data) {
        setListings(cached.data);
        setCachedTimestamp(cached.lastUpdated);
      }
    } finally {
      setIsLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [isOffline]);

  const handleFilePicked = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(lang === 'hi' ? 'कृपया एक वैध फोटो फ़ाइल चुनें।' : 'Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setInitialImage(result);
      setInitialFileName(file.name);
      setIsWizardOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFilePicked(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilePicked(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = async (sample: (typeof SAMPLE_PRESETS)[0]) => {
    try {
      // Load sample image as data url
      setInitialImage(sample.image);
      setInitialFileName(`${sample.crop.toLowerCase()}_sample.jpg`);
      setIsWizardOpen(true);
    } catch {
      setInitialImage(sample.image);
      setInitialFileName('sample_crop.jpg');
      setIsWizardOpen(true);
    }
  };

  // If Wizard is Open, render the Full Step-by-Step AI Wizard
  if (isWizardOpen) {
    return (
      <AiCropListingWizard
        initialImage={initialImage}
        initialFileName={initialFileName}
        lang={lang}
        onCancel={() => {
          setIsWizardOpen(false);
          setInitialImage(null);
          setInitialFileName(null);
        }}
        onListingCreated={() => {
          fetchListings();
        }}
      />
    );
  }

  // STEP 1: MY CROPS (Default Dashboard Screen)
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Screen Title & Subtitle */}
      <div className="text-left space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'मेरी फसलें और बिक्री' : lang === 'mr' ? 'माझी पिके आणि विक्री' : 'My Crops & Listings'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'मेरी फसलें' : lang === 'mr' ? 'माझी पिके' : 'My Crops'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'अपनी फसल की फोटो खींचें और AI की मदद से सीधे राष्ट्रीय खरीदारों को बेचें।'
            : 'Upload a crop photo to auto-detect details and publish harvest lots directly to institutional buyers.'}
        </p>
      </div>

      {/* PRIMARY ACTION: Large Farmer-Friendly Upload Hero Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-2 transition-all p-6 sm:p-10 text-center ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
            : 'border-emerald-500/30 bg-gradient-to-b from-emerald-900 via-emerald-850 to-slate-950 text-white shadow-xl shadow-emerald-950/20'
        }`}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          {/* Camera / Image Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 backdrop-blur-xs group">
            <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
              {lang === 'hi' ? 'फ़सल की फ़ोटो अपलोड करें' : lang === 'mr' ? 'पिकाचा फोटो अपलोड करा' : 'Upload Crop Image'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-md mx-auto">
              {lang === 'hi'
                ? 'AI आपकी फ़सल की पहचान करेगा और विवरण स्वतः भर देगा।'
                : 'AI will identify your crop and fill the details automatically.'}
            </p>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-slate-950 font-black text-sm sm:text-base transition-all shadow-lg shadow-emerald-400/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-5 h-5 text-slate-950" />
              <span>{lang === 'hi' ? 'फ़ोटो अपलोड करें' : lang === 'mr' ? 'फोटो अपलोड करा' : 'Upload Crop Image'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Quick Demo Sample Badges */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
              {lang === 'hi' ? 'या तुरंत परीक्षण के लिए नमूना चुनें:' : 'Or tap a sample for instant AI demo:'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SAMPLE_PRESETS.map((sample) => (
                <button
                  key={sample.crop}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: YOUR RECENT CROPS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif] tracking-tight">
              {lang === 'hi' ? 'आपकी हालिया फसलें' : lang === 'mr' ? 'तुमची अलीकडील पिके' : 'Your Recent Crops'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'hi'
                ? 'बाज़ार में लाइव और खरीदारों से जुड़ी सक्रिय फसल लिस्टिंग'
                : 'Active harvest lots published and matched with verified institutional buyers.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LastSyncedBadge
              timestamp={cachedTimestamp}
              lang={lang}
              isOffline={isOffline}
              onRefresh={fetchListings}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'hi' ? '+ नई फसल जोड़ें' : lang === 'mr' ? '+ नवीन पीक जोडा' : '+ Add New Crop'}</span>
            </button>
          </div>
        </div>

        {/* Listings List / Grid */}
        {isLoadingListings ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading your active crops...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-black text-slate-900">No crop lots listed yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your first crop image above to auto-detect details and publish to buyers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Crop Image</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-300 transition-all shadow-xs hover:shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {listing.cropImageUrl ? (
                      <img
                        src={listing.cropImageUrl}
                        alt={listing.cropName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
                        🌾
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">{listing.cropName}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {listing.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {listing.variety || 'Sharbati Lokwan'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                      ₹{listing.expectedPricePerQuintal.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 block">/ Qtl</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold">{listing.quantityQuintals} Quintals</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{listing.district || 'Sehore'}, {listing.state || 'MP'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>3 Verified Buyers Matched</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('direct-buyers')}
                    className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Buyers</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
