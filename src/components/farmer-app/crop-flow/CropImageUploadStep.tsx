import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Language } from '../types';

interface CropImageUploadStepProps {
  imagePreview: string | null;
  fileName: string | null;
  lang: Language;
  onImageSelected: (base64Image: string, fileName: string, visualFeatures?: any) => void;
  onImageRemoved: () => void;
  onProceedToAnalyze: () => void;
  onBack?: () => void;
}

function calculateHue(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max === min) {
    h = 0;
  } else if (max === r) {
    h = (60 * ((g - b) / (max - min)) + 360) % 360;
  } else if (max === g) {
    h = 60 * ((b - r) / (max - min)) + 120;
  } else if (max === b) {
    h = 60 * ((r - g) / (max - min)) + 240;
  }
  return h;
}

function extractCanvasFeatures(ctx: CanvasRenderingContext2D, width: number, height: number) {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let rSum = 0, gSum = 0, bSum = 0;
    let sampleCount = 0;
    let brightPixels = 0;
    let darkPixels = 0;
    let yellowPixels = 0;
    let redPixels = 0;
    let amberPixels = 0;

    const step = Math.max(4, Math.floor(data.length / (4 * 2000))) * 4;
    for (let i = 0; i < data.length; i += step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      rSum += r;
      gSum += g;
      bSum += b;
      sampleCount++;

      const brightness = (r + g + b) / 3;
      if (brightness > 180) brightPixels++;
      if (brightness < 75) darkPixels++;
      if (r > 150 && g > 130 && b < 110) yellowPixels++;
      if (r > 150 && r > g * 1.3 && r > b * 1.3) redPixels++;
      if (r > 140 && g > 95 && b < 85 && g > b) amberPixels++;
    }

    const avgR = sampleCount > 0 ? rSum / sampleCount : 128;
    const avgG = sampleCount > 0 ? gSum / sampleCount : 128;
    const avgB = sampleCount > 0 ? bSum / sampleCount : 128;
    const avgBrightness = (avgR + avgG + avgB) / 3;

    return {
      avgR,
      avgG,
      avgB,
      avgBrightness,
      avgSaturation: Math.abs(avgR - avgB) / (avgR + avgG + avgB + 1),
      avgHue: calculateHue(avgR, avgG, avgB),
      brightPixelRatio: sampleCount > 0 ? brightPixels / sampleCount : 0,
      darkPixelRatio: sampleCount > 0 ? darkPixels / sampleCount : 0,
      yellowPixelRatio: sampleCount > 0 ? yellowPixels / sampleCount : 0,
      redPixelRatio: sampleCount > 0 ? redPixels / sampleCount : 0,
      amberPixelRatio: sampleCount > 0 ? amberPixels / sampleCount : 0,
      variance: 10,
    };
  } catch {
    return undefined;
  }
}

export const CropImageUploadStep: React.FC<CropImageUploadStepProps> = ({
  imagePreview,
  fileName,
  lang,
  onImageSelected,
  onImageRemoved,
  onProceedToAnalyze,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया एक वैध फोटो फ़ाइल (JPG, PNG, WEBP) चुनें।'
          : lang === 'mr'
          ? 'कृपया एक वैध फोटो फाइल (JPG, PNG, WEBP) निवडा.'
          : 'Please select a valid image file (JPG, PNG, WEBP).'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        lang === 'hi'
          ? 'फ़ोटो 10MB से छोटी होनी चाहिए।'
          : lang === 'mr'
          ? 'फोटो 10MB पेक्षा लहान असणे आवश्यक आहे.'
          : 'Image size must be less than 10MB.'
      );
      return;
    }

    // Downscale and read base64 safely
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
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
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const visualFeatures = extractCanvasFeatures(ctx, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            onImageSelected(optimizedBase64, file.name, visualFeatures);
          } else {
            onImageSelected(result, file.name);
          }
        };
        img.onerror = () => {
          onImageSelected(result, file.name);
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to process image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Step Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'hi' ? 'चरण 2: फोटो अपलोड' : lang === 'mr' ? 'पायरी २: फोटो अपलोड' : 'Step 2: Upload Crop Image'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit',sans-serif]">
          {lang === 'hi' ? 'अपनी फ़सल की फ़ोटो' : lang === 'mr' ? 'तुमच्या पिकाचा फोटो' : 'Crop Photo'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          {lang === 'hi'
            ? 'स्पष्ट फोटो अपलोड करें — AI स्वचालित रूप से विवरण निकालेगा'
            : lang === 'mr'
            ? 'स्पष्ट फोटो अपलोड करा — AI आपोआप तपशील भरेल'
            : 'AI will analyze this photo to identify crop type, variety, and quality grade.'}
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Image Preview & Controls */}
      {imagePreview ? (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/30 bg-slate-950 shadow-md">
            <img
              src={imagePreview}
              alt="Uploaded crop"
              className="w-full h-72 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-xs font-black backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'फोटो तैयार है' : lang === 'mr' ? 'फोटो तयार आहे' : 'Photo Ready'}</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="truncate max-w-[200px] font-medium opacity-90 drop-shadow">
                {fileName || 'crop_image.jpg'}
              </span>
              <button
                type="button"
                onClick={onImageRemoved}
                className="px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'हटाएं' : lang === 'mr' ? 'काढून टाका' : 'Remove'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'फोटो बदलें' : lang === 'mr' ? 'फोटो बदला' : 'Change Image'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Drop Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 bg-slate-50/50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900">
              {lang === 'hi' ? 'फोटो चुनने के लिए क्लिक करें' : lang === 'mr' ? 'फोटो निवडण्यासाठी क्लिक करा' : 'Click to Upload Crop Image'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' ? 'या फाइल को यहाँ ड्रैग करें (JPG, PNG, WEBP)' : 'or drag and drop photo here (JPG, PNG, WEBP)'}
            </p>
          </div>
        </div>
      )}

      {/* Simple Tips Card */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{lang === 'hi' ? 'बेहतर AI परिणामों के लिए सुझाव:' : lang === 'mr' ? 'उत्तम AI परिणामांसाठी टीपा:' : 'Simple tips for better results:'}</span>
        </div>
        <ul className="text-xs text-emerald-800/90 space-y-1 pl-6 list-disc">
          <li>{lang === 'hi' ? 'साफ़ और रोशनी वाली फोटो का उपयोग करें' : lang === 'mr' ? 'स्पष्ट आणि पुरेशा प्रकाशातील फोटो वापरा' : 'Use clear and bright image'}</li>
          <li>{lang === 'hi' ? 'सीधे फसल/दानों पर फोकस करें' : lang === 'mr' ? 'थेट पिकावर/धान्यावर लक्ष केंद्रित करा' : 'Focus on the crop'}</li>
          <li>{lang === 'hi' ? 'धुंधली (blur) फोटो से बचें' : lang === 'mr' ? 'अस्पष्ट (blur) फोटो टाळा' : 'Avoid blur'}</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}</span>
          </button>
        ) : <div />}

        <button
          type="button"
          disabled={!imagePreview}
          onClick={onProceedToAnalyze}
          className={`flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            imagePreview
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/25'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'hi' ? 'AI से विश्लेषण करें' : lang === 'mr' ? 'AI द्वारे विश्लेषण करा' : 'Analyze with AI'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
