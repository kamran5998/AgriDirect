import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Shield,
  Gauge,
  Wheat,
  X,
} from 'lucide-react';
import { CropAiAnalysisResult } from '../../../api/cropAiService';
import { Language } from '../types';

interface CropAIAnalysisStepProps {
  imagePreview: string;
  isAnalyzing: boolean;
  analysisError?: string | null;
  analysisResult: CropAiAnalysisResult | null;
  cropName: string;
  variety: string;
  qualityGrade: string;
  qualityScore: number;
  confidence: number;
  qualityRemarks: string;
  lang: Language;
  onUpdateCropField: (
    field: 'cropName' | 'variety' | 'qualityGrade' | 'qualityScore' | 'qualityRemarks',
    value: any
  ) => void;
  onReAnalyze: () => void;
  onBack: () => void;
  onProceedToLocation: () => void;
}

const COMMON_CROPS = [
  'Wheat',
  'Soybean',
  'Cotton',
  'Basmati Rice',
  'Mustard Seed',
  'Chana / Gram',
  'Maize',
  'Red Chili',
  'Turmeric',
  'Tomato',
  'Onion',
  'Potato',
];

const VARIETY_OPTIONS: Record<string, string[]> = {
  Wheat: ['Lokwan', 'Sharbati Gold', 'C-306 Sharbati', 'HI-1544', 'Standard FAQ'],
  Soybean: ['JS-9560 (Yellow Seed)', 'JS-335', 'NRC-37', 'Standard FAQ'],
  Cotton: ['Shankar-6', 'MCU-5', 'Bunny Bt', 'Medium Staple FAQ'],
  'Basmati Rice': ['Pusa 1121 (Aged)', 'Traditional Basmati', 'Pusa 1509', '1401 Super'],
  'Mustard Seed': ['Sarson High Oil (Pusa Bold)', 'Kanti Yellow', 'Varuna', 'Black Mustard FAQ'],
  'Chana / Gram': ['Desi Bold FAQ', 'Kabuli Dollar', 'JG-11', 'Annigeri-1'],
  Maize: ['Yellow Corn Feed Grade', 'Sweet Corn Hybrid', 'Standard FAQ'],
};

const QUALITY_GRADES = [
  'Good Quality (Grade A)',
  'Grade A Premium',
  'Grade A',
  'Grade B',
  'FAQ Standard',
  'Organic Certified',
];

export const CropAIAnalysisStep: React.FC<CropAIAnalysisStepProps> = ({
  imagePreview,
  isAnalyzing,
  analysisError,
  analysisResult,
  cropName,
  variety,
  qualityGrade,
  qualityScore,
  confidence,
  qualityRemarks,
  lang,
  onUpdateCropField,
  onReAnalyze,
  onBack,
  onProceedToLocation,
}) => {
  const [editingField, setEditingField] = useState<'crop' | 'variety' | 'quality' | 'score' | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const startEdit = (field: 'crop' | 'variety' | 'quality' | 'score', currentVal: string | number) => {
    setEditingField(field);
    setTempValue(String(currentVal));
  };

  const saveEdit = (field: 'crop' | 'variety' | 'quality' | 'score') => {
    if (field === 'crop') {
      onUpdateCropField('cropName', tempValue);
      // default variety for newly selected crop
      const varieties = VARIETY_OPTIONS[tempValue] || ['Standard FAQ'];
      onUpdateCropField('variety', varieties[0]);
    } else if (field === 'variety') {
      onUpdateCropField('variety', tempValue);
    } else if (field === 'quality') {
      onUpdateCropField('qualityGrade', tempValue);
    } else if (field === 'score') {
      const num = Number(tempValue);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        onUpdateCropField('qualityScore', num);
      }
    }
    setEditingField(null);
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-8 max-w-xl mx-auto py-10 text-center">
        <div className="relative mx-auto w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-emerald-500/40">
          <img src={imagePreview} alt="Scanning" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
          </div>
          {/* Laser scanning bar effect */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-lg shadow-emerald-400/80" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>
              {lang === 'hi'
                ? 'AI विश्लेषण प्रगति पर है...'
                : lang === 'mr'
                ? 'AI विश्लेषण सुरू आहे...'
                : 'AI Analysis in Progress...'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
            {lang === 'hi' ? 'फ़सल के दानों व रंग का परीक्षण' : lang === 'mr' ? 'पिकाच्या दर्जाचे परीक्षण' : 'Inspecting Grain & Color Quality'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {lang === 'hi'
              ? 'AI फोटो से दानों की चमक, आकार, नमी और गुणवत्ता का मिलान कर रहा है।'
              : 'AI is analyzing color, grain size, fullness and overall crop appearance.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto flex items-center justify-center gap-3 text-xs text-slate-500 font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Processing with Gemini Agricultural Vision Model</span>
        </div>
      </div>
    );
  }

  // Error State Handling
  if (analysisError || (!isAnalyzing && !analysisResult && !cropName)) {
    return (
      <div className="space-y-6 max-w-xl mx-auto text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 font-['Outfit',sans-serif]">
            {lang === 'hi' ? 'AI विश्लेषण पूर्ण नहीं हो सका' : lang === 'mr' ? 'AI विश्लेषण पूर्ण होऊ शकले नाही' : 'AI analysis could not be completed.'}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {analysisError || (lang === 'hi'
              ? 'AI इस छवि से फ़सल की पहचान नहीं कर सका। कृपया अपनी कटी हुई फ़सल का स्पष्ट फ़ोटो अपलोड करें।'
              : lang === 'mr'
              ? 'AI या फोटोमधून पीक ओळखू शकले नाही. कृपया तुमच्या काढणी केलेल्या पिकाचा स्पष्ट फोटो अपलोड करा.'
              : 'AI analysis could not identify a clear agricultural crop from this image. Please upload a clear photo of your harvested crop.')}
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left space-y-1">
          <p className="font-bold">
            {lang === 'hi' ? 'सफल AI पहचान के लिए सुझाव:' : lang === 'mr' ? 'यशस्वी AI ओळखीसाठी टिप्स:' : 'Tips for successful AI detection:'}
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
            <li>
              {lang === 'hi'
                ? 'अच्छी प्राकृतिक रोशनी सुनिश्चित करें और सीधे अपनी कटी हुई उपज या दानों पर फ़ोकस करें।'
                : lang === 'mr'
                ? 'चांगला नैसर्गिक प्रकाश असल्याची खात्री करा आणि थेट तुमच्या काढणी केलेल्या धान्यावर किंवा उत्पादनावर फोकस करा.'
                : 'Ensure good natural lighting and focus directly on the harvested grains or produce.'}
            </li>
            <li>
              {lang === 'hi'
                ? 'धुंधली, बहुत अंधेरी, अत्यधिक चमक वाली या गैर-कृषि तस्वीरों से बचें।'
                : lang === 'mr'
                ? 'अस्पष्ट, खूप अंधाऱ्या, जास्त उजेडाच्या किंवा शेतीशी संबंधित नसलेल्या फोटोंना टाळा.'
                : 'Avoid blurry, too dark, overexposed, or non-crop photos.'}
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'फोटो बदलें' : lang === 'mr' ? 'फोटो बदला' : 'Replace Photo'}</span>
          </button>
          <button
            type="button"
            onClick={onReAnalyze}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{lang === 'hi' ? 'पुनः प्रयास करें' : lang === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Retry Analysis'}</span>
          </button>
        </div>
      </div>
    );
  }

  const effectiveConfidence = confidence || analysisResult?.confidence || 85;
  const effectiveQualityScore = qualityScore || analysisResult?.qualityScore || 80;
  const effectiveQualityLabel = qualityGrade || analysisResult?.qualityGrade || 'Grade A';

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 3: AI विश्लेषण परिणाम' : lang === 'mr' ? 'पायरी ३: AI विश्लेषण निकाल' : 'Step 3: AI Analysis Result'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'AI विश्लेषण परिणाम' : lang === 'mr' ? 'AI विश्लेषण निकाल' : 'AI Analysis Result'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'AI ने रंग, दाने का आकार, परिपक्वता और फ़सल की समग्र गुणवत्ता का विश्लेषण किया है।'
            : 'AI analyzed color, grain size, fullness and overall crop appearance.'}
        </p>
      </div>

      {/* Main Result Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-sm space-y-5">
        {/* Top Summary Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80">
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Crop thumbnail"
              className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-emerald-950">{cropName}</span>
                <span className="text-[11px] text-emerald-700 font-medium">({variety})</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                <span>Quality (AI Estimated): {effectiveQualityLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Confidence: {effectiveConfidence}%</span>
            </span>
          </div>
        </div>

        {/* Detected Details Table with individual Edit actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {lang === 'hi' ? 'पहचाने गए विवरण (Detected Details)' : 'Detected Details'}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {lang === 'hi' ? '✏️ संपादन करने के लिए एडिट दबाएं' : '✏️ Tap Edit to correct any field'}
            </span>
          </div>

          {/* FIELD 1: Crop Name */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                🌾
              </span>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Crop Name</span>
                {editingField === 'crop' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-emerald-500 rounded-lg text-xs font-bold text-slate-900"
                    >
                      {COMMON_CROPS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => saveEdit('crop')}
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingField(null)}
                      className="p-1 rounded-md bg-slate-200 text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-black text-slate-900">{cropName}</p>
                )}
              </div>
            </div>

            {editingField !== 'crop' && (
              <button
                type="button"
                onClick={() => startEdit('crop', cropName)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* FIELD 2: Variety */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                🌱
              </span>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Variety</span>
                {editingField === 'variety' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-emerald-500 rounded-lg text-xs font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit('variety')}
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingField(null)}
                      className="p-1 rounded-md bg-slate-200 text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-black text-slate-900">{variety}</p>
                )}
              </div>
            </div>

            {editingField !== 'variety' && (
              <button
                type="button"
                onClick={() => startEdit('variety', variety)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* FIELD 3: Quality (AI Estimated) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                ⭐
              </span>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Quality (AI Estimated)</span>
                {editingField === 'quality' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-emerald-500 rounded-lg text-xs font-bold text-slate-900"
                    >
                      {QUALITY_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => saveEdit('quality')}
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingField(null)}
                      className="p-1 rounded-md bg-slate-200 text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
                    <span>{effectiveQualityLabel}</span>
                  </p>
                )}
              </div>
            </div>

            {editingField !== 'quality' && (
              <button
                type="button"
                onClick={() => startEdit('quality', effectiveQualityLabel)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* FIELD 4: Quality Score */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                🎯
              </span>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Quality Score</span>
                {editingField === 'score' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-20 px-2.5 py-1 bg-white border border-emerald-500 rounded-lg text-xs font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit('score')}
                      className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingField(null)}
                      className="p-1 rounded-md bg-slate-200 text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-black text-purple-900">{effectiveQualityScore}/100</p>
                )}
              </div>
            </div>

            {editingField !== 'score' && (
              <button
                type="button"
                onClick={() => startEdit('score', effectiveQualityScore)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Short explanation box */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            AI analyzed color, grain size, fullness and overall crop appearance. All detected values can be modified before publishing.
          </p>
        </div>
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
          onClick={onProceedToLocation}
          className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'hi' ? 'स्थान विवरण पर आगे बढ़ें' : lang === 'mr' ? 'स्थान माहितीकडे पुढे जा' : 'Continue to Location'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
