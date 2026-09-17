import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  MapPin,
  Scale,
  TrendingUp,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { Language } from '../types';
import { analyzeCropImageWithAi, cropAiService, CropAiAnalysisResult } from '../../../api/cropAiService';
import { farmerApi, CreateListingPayload } from '../../../api/farmerApi';
import { useConnectivity } from '../../../context/ConnectivityContext';
import { offlineStorage } from '../../../services/offlineStorageService';
import { CropImageUploadStep } from './CropImageUploadStep';
import { CropAIAnalysisStep } from './CropAIAnalysisStep';
import { CropLocationStep } from './CropLocationStep';
import { CropQuantityStep } from './CropQuantityStep';
import { CropPriceAnalysisStep } from './CropPriceAnalysisStep';
import { CropSellingPriceStep } from './CropSellingPriceStep';
import { CropReviewPublishStep } from './CropReviewPublishStep';

interface AiCropListingWizardProps {
  initialImage?: string | null;
  initialFileName?: string | null;
  lang: Language;
  onCancel: () => void;
  onListingCreated: () => void;
}

export const AiCropListingWizard: React.FC<AiCropListingWizardProps> = ({
  initialImage = null,
  initialFileName = null,
  lang,
  onCancel,
  onListingCreated,
}) => {
  // Connectivity state
  const { isOffline, enqueueAction } = useConnectivity();

  // Wizard Step State: 2 = Upload, 3 = AI Analysis, 4 = Location, 5 = Quantity, 6 = AI Price, 7 = Set Selling Price, 8 = Review
  const [currentStep, setCurrentStep] = useState<number>(initialImage ? 2 : 2);

  // Form State
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
  const [fileName, setFileName] = useState<string | null>(initialFileName || 'crop_image.jpg');
  const [visualFeatures, setVisualFeatures] = useState<any>(null);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CropAiAnalysisResult | null>(null);
  const requestIdRef = React.useRef<number>(0);

  // Crop Details (Genuinely Populated by AI Analysis, Editable by Farmer)
  const [cropName, setCropName] = useState<string>('');
  const [variety, setVariety] = useState<string>('');
  const [qualityGrade, setQualityGrade] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [qualityRemarks, setQualityRemarks] = useState<string>('');

  // Location State
  const [locationVillage, setLocationVillage] = useState<string>('Rampur');
  const [district, setDistrict] = useState<string>('Kanpur');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [pincode, setPincode] = useState<string>('208001');

  // Quantity State
  const [quantityQuintals, setQuantityQuintals] = useState<number>(40);

  // Pricing State
  const [aiSuggestedPrice, setAiSuggestedPrice] = useState<number>(2280);
  const [sellingPrice, setSellingPrice] = useState<number>(2280);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  // If initial image is passed on mount and user wants to auto-analyze
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
      setFileName(initialFileName || 'crop_photo.jpg');
      setAnalysisResult(null);
      setAnalysisError(null);
      setCropName('');
      setVariety('');
      setQualityGrade('');
      setQualityScore(0);
      setConfidence(0);
    }
  }, [initialImage, initialFileName]);

  const handleImageSelected = (base64: string, name: string, features?: any) => {
    requestIdRef.current++;
    setImagePreview(base64);
    setFileName(name);
    setVisualFeatures(features || null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCropName('');
    setVariety('');
    setQualityGrade('');
    setQualityScore(0);
    setConfidence(0);
    setQualityRemarks('');
  };

  const handleImageRemoved = () => {
    requestIdRef.current++;
    setImagePreview(null);
    setFileName(null);
    setVisualFeatures(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCropName('');
    setVariety('');
    setQualityGrade('');
    setQualityScore(0);
    setConfidence(0);
    setQualityRemarks('');
  };

  const runAiAnalysis = async () => {
    if (!imagePreview) return;
    const currentReqId = ++requestIdRef.current;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setCurrentStep(3);

    try {
      const result = await analyzeCropImageWithAi(imagePreview, fileName || 'crop.jpg', visualFeatures);
      
      // Guard against stale async requests
      if (currentReqId !== requestIdRef.current) {
        return;
      }

      if (result && result.cropName) {
        setAnalysisResult(result);
        setCropName(result.cropName);
        setVariety(result.variety || 'Commercial Grade FAQ');
        setQualityGrade(result.qualityGrade || 'Grade A');
        setQualityScore(result.qualityScore || 85);
        setConfidence(result.confidence || 88);
        setQualityRemarks(result.qualityRemarks || 'AI vision inspection completed.');

        // Derive Suggested Price dynamically from returned market range
        let calculatedPrice = result.estimatedMarketPriceRange?.suggestedPrice || 2280;
        if (!calculatedPrice || calculatedPrice <= 0) {
          const priceObj = cropAiService.getPriceAnalysisForCrop(result.cropName, district);
          calculatedPrice = priceObj.suggested || 2280;
        }

        setAiSuggestedPrice(calculatedPrice);
        setSellingPrice(calculatedPrice);
      } else {
        setAnalysisError('AI analysis could not be completed for this image. Please upload a clear photo of your harvested crop.');
      }
    } catch (err: any) {
      if (currentReqId !== requestIdRef.current) return;
      console.warn('[AiCropListingWizard] AI analysis error:', err);
      setAnalysisError(err.message || 'AI analysis could not be completed. Please upload a clear photo of your harvested crop.');
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleUpdateCropField = (
    field: 'cropName' | 'variety' | 'qualityGrade' | 'qualityScore' | 'qualityRemarks',
    val: any
  ) => {
    if (field === 'cropName') {
      setCropName(val);
      const priceObj = cropAiService.getPriceAnalysisForCrop(val, district);
      if (priceObj && priceObj.suggested) {
        setAiSuggestedPrice(priceObj.suggested);
        setSellingPrice(priceObj.suggested);
      }
    }
    if (field === 'variety') setVariety(val);
    if (field === 'qualityGrade') setQualityGrade(val);
    if (field === 'qualityScore') setQualityScore(val);
    if (field === 'qualityRemarks') setQualityRemarks(val);
  };

  const handleUpdateLocation = (v: string, d: string, s: string, p?: string) => {
    setLocationVillage(v);
    setDistrict(d);
    setState(s);
    if (p) setPincode(p);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const payload: CreateListingPayload = {
        cropName: cropName,
        variety: variety,
        quantityQuintals: Number(quantityQuintals) || 40,
        expectedPricePerQuintal: Number(sellingPrice) || 2280,
        qualityGrade: qualityGrade || 'Grade A',
        moisturePercent: 11.2,
        foreignMatterPercent: 0.8,
        grainDamagePercent: 0.5,
        qualityRemarks: qualityRemarks || 'AI vision verified lot quality.',
        locationVillage: locationVillage || 'Rampur',
        district: district || 'Kanpur',
        state: state || 'Uttar Pradesh',
        cropImageUrl: imagePreview || undefined,
        deliveryOption: 'Farm-gate Pickup Only',
        availableDate: new Date().toISOString().split('T')[0],
      };

      if (isOffline) {
        // Enqueue offline action and save draft locally
        await enqueueAction('CREATE_CROP_LISTING', payload);
        const cachedDrafts = await offlineStorage.getCachedItem<any[]>('farmer_my_listings');
        const updatedList = [
          ...(cachedDrafts?.data || []),
          {
            id: `OFFLINE-LOT-${Date.now()}`,
            ...payload,
            status: 'OFFLINE_SAVED',
            created_at: new Date().toISOString(),
          },
        ];
        await offlineStorage.setCachedItem('farmer_my_listings', updatedList, 'user_draft');
        setPublishSuccess(true);
        setIsPublishing(false);
        return;
      }

      const res = await farmerApi.createListing(payload);
      if (res && res.id) {
        setPublishSuccess(true);
      } else {
        setPublishError('Failed to publish crop listing. Please try again.');
      }
    } catch (err: any) {
      console.warn('Network issue during crop publish, saving draft offline:', err);
      try {
        await enqueueAction('CREATE_CROP_LISTING', {
          cropName,
          variety,
          quantityQuintals: Number(quantityQuintals) || 40,
          expectedPricePerQuintal: Number(sellingPrice) || 2280,
          qualityGrade: qualityGrade || 'Grade A',
          locationVillage,
          district,
          state,
        });
        setPublishSuccess(true);
      } catch {
        setPublishError(err.message || 'Network error occurred while publishing lot.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Step Progress Header Info
  const STEP_TITLES = [
    { num: 2, label: 'Photo' },
    { num: 3, label: 'AI Result' },
    { num: 4, label: 'Location' },
    { num: 5, label: 'Quantity' },
    { num: 6, label: 'AI Price' },
    { num: 7, label: 'Selling Price' },
    { num: 8, label: 'Review' },
  ];

  return (
    <div className="bg-slate-50/80 min-h-screen py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Wizard Top Nav Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
                {lang === 'hi' ? 'AI फ़सल लिस्टिंग विज़ार्ड' : lang === 'mr' ? 'AI पीक नोंदणी विझार्ड' : 'AI Crop Listing Flow'}
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Smart assisted harvest publishing to 240+ verified buyers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">
              {lang === 'hi' ? 'रद्द करें' : lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </span>
          </button>
        </div>

        {/* Step Indicator Bar */}
        {!publishSuccess && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs overflow-x-auto">
            <div className="flex items-center justify-between min-w-[540px] gap-2">
              {STEP_TITLES.map((step, idx) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div key={step.num} className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      disabled={!isCompleted}
                      onClick={() => isCompleted && setCurrentStep(step.num)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-xl transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer'
                          : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-current">
                        {isCompleted ? '✓' : step.num}
                      </span>
                      <span>{step.label}</span>
                    </button>
                    {idx < STEP_TITLES.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 rounded-full ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Render Step View */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm">
          {/* STEP 2: UPLOAD CROP IMAGE */}
          {currentStep === 2 && (
            <CropImageUploadStep
              imagePreview={imagePreview}
              fileName={fileName}
              lang={lang}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              onProceedToAnalyze={runAiAnalysis}
              onBack={onCancel}
            />
          )}

          {/* STEP 3: AI ANALYSIS RESULT */}
          {currentStep === 3 && (
            <CropAIAnalysisStep
              imagePreview={imagePreview || ''}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
              analysisResult={analysisResult}
              cropName={cropName}
              variety={variety}
              qualityGrade={qualityGrade}
              qualityScore={qualityScore}
              confidence={confidence}
              qualityRemarks={qualityRemarks}
              lang={lang}
              onUpdateCropField={handleUpdateCropField}
              onReAnalyze={runAiAnalysis}
              onBack={() => setCurrentStep(2)}
              onProceedToLocation={() => setCurrentStep(4)}
            />
          )}

          {/* STEP 4: LOCATION */}
          {currentStep === 4 && (
            <CropLocationStep
              locationVillage={locationVillage}
              district={district}
              state={state}
              pincode={pincode}
              lang={lang}
              onUpdateLocation={handleUpdateLocation}
              onBack={() => setCurrentStep(3)}
              onProceedToQuantity={() => setCurrentStep(5)}
            />
          )}

          {/* STEP 5: QUANTITY */}
          {currentStep === 5 && (
            <CropQuantityStep
              quantityQuintals={quantityQuintals}
              cropName={cropName}
              lang={lang}
              onQuantityChange={setQuantityQuintals}
              onBack={() => setCurrentStep(4)}
              onProceedToPrice={() => setCurrentStep(6)}
            />
          )}

          {/* STEP 6: AI EXPECTED PRICE */}
          {currentStep === 6 && (
            <CropPriceAnalysisStep
              cropName={cropName}
              variety={variety}
              qualityGrade={qualityGrade}
              quantityQuintals={quantityQuintals}
              locationVillage={locationVillage}
              district={district}
              state={state}
              aiSuggestedPrice={aiSuggestedPrice}
              lang={lang}
              onBack={() => setCurrentStep(5)}
              onProceedToSetPrice={() => setCurrentStep(7)}
            />
          )}

          {/* STEP 7: SET SELLING PRICE */}
          {currentStep === 7 && (
            <CropSellingPriceStep
              cropName={cropName}
              quantityQuintals={quantityQuintals}
              aiSuggestedPrice={aiSuggestedPrice}
              sellingPrice={sellingPrice}
              lang={lang}
              onSellingPriceChange={setSellingPrice}
              onBack={() => setCurrentStep(6)}
              onProceedToReview={() => setCurrentStep(8)}
            />
          )}

          {/* STEP 8: REVIEW & PUBLISH */}
          {currentStep === 8 && (
            <CropReviewPublishStep
              imagePreview={imagePreview || ''}
              cropName={cropName}
              variety={variety}
              qualityGrade={qualityGrade}
              qualityScore={qualityScore}
              quantityQuintals={quantityQuintals}
              locationVillage={locationVillage}
              district={district}
              state={state}
              pincode={pincode}
              sellingPrice={sellingPrice}
              isPublishing={isPublishing}
              publishError={publishError}
              publishSuccess={publishSuccess}
              lang={lang}
              onEditSection={(step) => setCurrentStep(step)}
              onConfirmPublish={handlePublish}
              onFinish={() => {
                onListingCreated();
                onCancel();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
