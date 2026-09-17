import { GoogleGenAI } from '@google/genai';
import { CROP_MARKET_DATA } from '../data/marketData';

export interface VisualFeatures {
  avgR: number;
  avgG: number;
  avgB: number;
  avgBrightness: number;
  avgSaturation: number;
  avgHue: number;
  brightPixelRatio: number;
  darkPixelRatio: number;
  yellowPixelRatio: number;
  redPixelRatio: number;
  amberPixelRatio: number;
  greenPixelRatio: number;
  variance: number;
}

export interface CropAnalysisResponse {
  success: boolean;
  isCrop?: boolean;
  cropName?: string;
  variety?: string;
  qualityGrade?: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade A Premium' | 'FAQ Standard' | 'Organic Certified';
  qualityScore?: number;
  confidence?: number;
  moisturePercent?: number;
  foreignMatterPercent?: number;
  grainDamagePercent?: number;
  qualityRemarks?: string;
  visualIndicators?: Array<{ label: string; value: string; status: 'good' | 'average' | 'warning' }>;
  estimatedMarketPriceRange?: {
    min: number;
    max: number;
    suggestedPrice: number;
    mandiName: string;
  };
  source?: 'ai_vision' | 'ai_image_analysis';
  requestId?: string;
  analyzedAt?: string;
  error?: string;
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

/**
 * Extracts visual color and pixel statistics directly from image buffer
 */
function extractFeaturesFromBuffer(buffer: Buffer): VisualFeatures {
  const len = buffer.length;
  let rSum = 0, gSum = 0, bSum = 0;
  let samples = 0;
  let brightCount = 0;
  let darkCount = 0;
  let yellowCount = 0;
  let redCount = 0;
  let amberCount = 0;
  let greenCount = 0;

  // JPEG / PNG header offset safe sampling
  const start = Math.min(100, Math.floor(len * 0.05));
  const end = Math.max(start + 50, Math.floor(len * 0.95));
  const step = Math.max(3, Math.floor((end - start) / 2500)) * 3;

  for (let i = start; i < end - 3; i += step) {
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    rSum += r;
    gSum += g;
    bSum += b;
    samples++;

    const brightness = (r + g + b) / 3;
    if (brightness > 180) brightCount++;
    if (brightness < 60) darkCount++;
    if (r > 145 && g > 120 && b < 105 && r > b * 1.3) yellowCount++;
    if (r > 150 && r > g * 1.35 && r > b * 1.35) redCount++;
    if (r > 135 && g > 85 && b < 80 && g > b) amberCount++;
    if (g > 110 && g > r * 1.15 && g > b * 1.15) greenCount++;
  }

  const avgR = samples > 0 ? rSum / samples : 128;
  const avgG = samples > 0 ? gSum / samples : 128;
  const avgB = samples > 0 ? bSum / samples : 128;
  const avgBrightness = (avgR + avgG + avgB) / 3;

  return {
    avgR,
    avgG,
    avgB,
    avgBrightness,
    avgSaturation: (Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB)) / (avgBrightness + 1),
    avgHue: calculateHue(avgR, avgG, avgB),
    brightPixelRatio: samples > 0 ? brightCount / samples : 0,
    darkPixelRatio: samples > 0 ? darkCount / samples : 0,
    yellowPixelRatio: samples > 0 ? yellowCount / samples : 0,
    redPixelRatio: samples > 0 ? redCount / samples : 0,
    amberPixelRatio: samples > 0 ? amberCount / samples : 0,
    greenPixelRatio: samples > 0 ? greenCount / samples : 0,
    variance: Math.abs(avgR - avgG) + Math.abs(avgG - avgB),
  };
}

/**
 * Detects accurate MIME type directly from buffer magic bytes to guarantee Gemini API compatibility
 */
function detectMimeTypeFromBuffer(buffer: Buffer, fallback: string = 'image/jpeg'): string {
  if (!buffer || buffer.length < 4) return fallback;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer.length >= 12) {
    const riffType = buffer.toString('ascii', 8, 12);
    if (riffType === 'WEBP') return 'image/webp';
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif';
  }
  return fallback;
}

/**
 * Resolves image buffer and base64 from data URI or remote HTTP URL
 */
async function resolveImagePayload(imageInput: string): Promise<{
  mimeType: string;
  base64Data: string;
  buffer: Buffer;
}> {
  if (imageInput.startsWith('data:')) {
    const match = imageInput.match(/^data:([^;]+);base64,(.+)$/s);
    let declaredMime = match ? match[1].toLowerCase() : 'image/jpeg';
    let base64Data = match ? match[2] : imageInput.split(',')[1] || '';
    base64Data = base64Data.replace(/[\r\n\s]/g, '');
    if (declaredMime === 'image/jpg') declaredMime = 'image/jpeg';
    const buffer = Buffer.from(base64Data, 'base64');
    const detectedMime = detectMimeTypeFromBuffer(buffer, declaredMime);
    return { mimeType: detectedMime, base64Data, buffer };
  } else if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(`Unable to fetch sample image from URL (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let headerMime = (response.headers.get('content-type') || 'image/jpeg').toLowerCase();
    if (headerMime === 'image/jpg') headerMime = 'image/jpeg';
    const detectedMime = detectMimeTypeFromBuffer(buffer, headerMime);
    const base64Data = buffer.toString('base64');
    return { mimeType: detectedMime, base64Data, buffer };
  } else {
    // Plain base64
    const cleanBase64 = imageInput.replace(/[\r\n\s]/g, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const detectedMime = detectMimeTypeFromBuffer(buffer, 'image/jpeg');
    return { mimeType: detectedMime, base64Data: cleanBase64, buffer };
  }
}

/**
 * Get benchmark market price for a recognized crop
 */
function getMarketBenchmark(cropName: string) {
  const cLower = (cropName || '').toLowerCase();
  const matched = CROP_MARKET_DATA.find((c) =>
    c.name.toLowerCase().includes(cLower) || cLower.includes(c.name.toLowerCase())
  );

  if (matched) {
    return {
      min: matched.minPrice,
      max: matched.maxPrice,
      suggestedPrice: matched.currentPrice,
      mandiName: matched.mandi,
    };
  }

  if (cLower.includes('wheat') || cLower.includes('gehu')) return { min: 2150, max: 2450, suggestedPrice: 2280, mandiName: 'Sehore APMC Mandi' };
  if (cLower.includes('soybean') || cLower.includes('soya')) return { min: 4500, max: 4900, suggestedPrice: 4720, mandiName: 'Indore Grain Terminal' };
  if (cLower.includes('cotton') || cLower.includes('kapaas')) return { min: 6800, max: 7450, suggestedPrice: 7200, mandiName: 'Rajkot Cotton Yard' };
  if (cLower.includes('rice') || cLower.includes('basmati') || cLower.includes('paddy') || cLower.includes('dhan')) return { min: 3800, max: 4400, suggestedPrice: 4150, mandiName: 'Karnal Grain Market' };
  if (cLower.includes('mustard') || cLower.includes('sarson') || cLower.includes('rai')) return { min: 5200, max: 5700, suggestedPrice: 5450, mandiName: 'Alwar APMC Yard' };
  if (cLower.includes('chana') || cLower.includes('gram') || cLower.includes('chole')) return { min: 5000, max: 5500, suggestedPrice: 5200, mandiName: 'Akola Grain Market' };
  if (cLower.includes('maize') || cLower.includes('corn') || cLower.includes('makka')) return { min: 2050, max: 2350, suggestedPrice: 2180, mandiName: 'Davangere APMC' };
  if (cLower.includes('chili') || cLower.includes('mirch')) return { min: 17500, max: 19800, suggestedPrice: 18400, mandiName: 'Guntur Spices Yard' };
  if (cLower.includes('onion') || cLower.includes('pyaz')) return { min: 1900, max: 2450, suggestedPrice: 2150, mandiName: 'Lasalgaon Mandi' };
  if (cLower.includes('tomato') || cLower.includes('tamatar')) return { min: 1400, max: 1900, suggestedPrice: 1650, mandiName: 'Kolar APMC Market' };
  if (cLower.includes('potato') || cLower.includes('aalu')) return { min: 1200, max: 1700, suggestedPrice: 1450, mandiName: 'Agra Potato Market' };
  if (cLower.includes('turmeric') || cLower.includes('haldi')) return { min: 13500, max: 15200, suggestedPrice: 14200, mandiName: 'Erode Mandi' };
  if (cLower.includes('groundnut') || cLower.includes('moongfali') || cLower.includes('peanut')) return { min: 6100, max: 6700, suggestedPrice: 6350, mandiName: 'Bikaner Mandi' };
  if (cLower.includes('garlic') || cLower.includes('lahsun')) return { min: 8000, max: 11500, suggestedPrice: 9500, mandiName: 'Mandsaur Mandi' };
  if (cLower.includes('moong') || cLower.includes('green gram')) return { min: 7200, max: 7900, suggestedPrice: 7550, mandiName: 'Jaipur Grain Mandi' };
  if (cLower.includes('urad') || cLower.includes('black gram')) return { min: 6800, max: 7600, suggestedPrice: 7200, mandiName: 'Latur APMC Yard' };
  if (cLower.includes('toor') || cLower.includes('arhar')) return { min: 8800, max: 9700, suggestedPrice: 9250, mandiName: 'Gulbarga Mandi' };

  return { min: 2200, max: 2600, suggestedPrice: 2400, mandiName: 'Nearby Regional Mandi' };
}

/**
 * Main function: Analyzes crop image using Gemini Multimodal Vision AI with dynamic morphological classification
 */
export async function analyzeCropImage(
  imageDataUrl: string,
  fileName?: string,
  clientFeatures?: VisualFeatures
): Promise<CropAnalysisResponse> {
  const requestId = `crop_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const analyzedAt = new Date().toISOString();

  if (!imageDataUrl || typeof imageDataUrl !== 'string' || imageDataUrl.trim().length < 50) {
    return {
      success: false,
      requestId,
      analyzedAt,
      error: 'No valid crop image provided. Please upload a clear photo in JPG, PNG, or WEBP format.',
    };
  }

  let mimeType = 'image/jpeg';
  let base64Data = '';
  let buffer: Buffer | null = null;

  try {
    const resolved = await resolveImagePayload(imageDataUrl);
    mimeType = resolved.mimeType;
    base64Data = resolved.base64Data;
    buffer = resolved.buffer;
    console.log(`[CropVision][${requestId}] Image payload received: MIME=${mimeType}, size=${(buffer.length / 1024).toFixed(1)} KB, file="${fileName || 'unnamed'}"`);
  } catch (err: any) {
    console.warn(`[CropVision][${requestId}] Failed to resolve image buffer:`, err.message);
    return {
      success: false,
      requestId,
      analyzedAt,
      error: 'The uploaded image could not be decoded. Please try uploading another photo.',
    };
  }

  // Pre-flight image sanity check (pure darkness or blank overexposure check)
  const features = clientFeatures || (buffer ? extractFeaturesFromBuffer(buffer) : null);
  if (features) {
    if (features.avgBrightness < 10) {
      return {
        success: false,
        isCrop: false,
        requestId,
        analyzedAt,
        error: 'The photo is too dark to identify the crop. Please take a photo in good natural lighting.',
      };
    }
    if (features.avgBrightness > 252 && features.variance < 3 && features.avgSaturation < 0.03) {
      return {
        success: false,
        isCrop: false,
        requestId,
        analyzedAt,
        error: 'The photo appears overexposed or blank. Please upload a clear photo of your crop harvest.',
      };
    }
  }

  // 1. Primary: Multimodal Gemini Vision AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && base64Data.length > 100) {
    // High-availability multimodal models ordered by availability and latency
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
    ];

    const prompt = `You are an expert Indian and global agricultural commodity inspection and quality grader AI for AgriDirect Pulse.
Carefully inspect this actual photograph uploaded by a farmer.

OBJECTIVE:
Identify what agricultural crop or produce is VISIBLY PRESENT in the photo based purely on morphological features (grain shape, seed crease, pod structure, lint fibers, surface texture, color, botanical traits).

CRITICAL RULES:
1. Ground your identification purely in the VISIBLE IMAGE CONTENT.
   - Do NOT guess or infer from filename, previous state, default assumptions, or examples.
   - Do NOT limit yourself to a static crop whitelist; identify ANY legitimate agricultural crop, grain, pulse, oilseed, spice, vegetable, fruit, cash crop, plantation produce, or floral harvest.
2. Differentiate visually similar commodities with extreme care:
   - Raw Cotton: Fluffy white/cream lint fiber, seed cotton, bolls, or fiber locks. NEVER confuse cotton with mustard, wheat, or grains.
   - Mustard Seed: Tiny spherical dark brown/black or yellow seeds with smooth sheen. NEVER confuse mustard with cotton, wheat, or lentils.
   - Soybean: Smooth, spherical/oval golden-yellow or cream seeds with distinct visible hilum (eye). Distinguish from Chickpea (Chana) which has wrinkled/angular shape, and Moong which is green/cylindrical.
   - Wheat: Elongated golden-amber grains with a distinct central crease. Distinguish from Rice (slender husked or polished grains without wheat crease) and Maize (large yellow wedge kernels).
   - Fresh Vegetables & Spices: Tomatoes, Onions, Potatoes, Garlic, Ginger, Chilies, Turmeric, Cumin, Coriander, etc.
3. ACCEPT legitimate agricultural photos:
   - Accept photos showing farmer hands, gunny sacks, burlap bags, tarpaulin, field soil, outdoor daylight, threshers, or storage baskets holding produce.
4. NON-CROP REJECTION:
   - If and only if the image clearly depicts a non-agricultural object (e.g. sports equipment like tennis rackets/balls, footwear/shoes, clothing, consumer gadgets/phones/screens, vehicles/cars, room furniture, or selfies without crops), return JSON with "isCrop": false:
   {
     "isCrop": false,
     "error": "The uploaded photo does not appear to be an agricultural crop produce. Please upload a clear photo of your harvested crop."
   }
5. IF IT IS A CROP, return detailed JSON:
   - "cropName": Specific crop name (e.g. "Cotton", "Mustard Seed", "Wheat", "Soybean", "Rice", "Basmati Rice", "Chana / Gram", "Maize", "Groundnut", "Tomato", "Onion", "Potato", "Red Chili", "Turmeric", "Garlic", "Moong", "Urad", etc.).
   - "variety": Likely commercial or regional variety ONLY if visually distinguishable from grain shape/color (e.g. 'Shankar-6', 'Pusa Bold', 'Lokwan', 'JS-9560', 'Pusa 1121', 'Desi Bold', 'Garwa Red', 'Jyoti'). If variety cannot be identified with certainty from visual appearance alone, state "Commercial Standard / Variety not visually identifiable" or "Standard Farm Produce". NEVER invent fictitious names.
   - "qualityGrade": Realistic grade based on visual cleanliness, luster, fullness, and absence of damage ("Grade A Premium", "Grade A", "Grade B", "Grade C", or "FAQ Standard").
   - "qualityScore": Realistic integer between 50 and 98 reflecting visual grain soundness and cleanliness.
   - "confidence": Dynamic integer between 50 and 98 reflecting your visual confidence based on image sharpness, lighting, visibility, and morphological distinctiveness. Do NOT use fake fixed numbers.
   - "moisturePercent": Estimated visible moisture level based on dry sheen/luster (typically 9.0 to 14.0 for grains/pulses), or null if not assessable.
   - "foreignMatterPercent": Estimated dockage/chaff/foreign material percentage (typically 0.3% to 3.0%), or null if not assessable.
   - "grainDamagePercent": Estimated broken/damaged/discolored percentage (typically 0.2% to 2.5%), or null if not assessable.
   - "qualityRemarks": 1-2 concise sentences describing visual features (grain luster, seed coat fullness, cleanliness, absence of mold/debris).
   - "visualIndicators": Array of 2 to 3 visual indicators observed in this photo:
     [
       { "label": "Grain Lustre & Color", "value": "e.g. Natural golden sheen", "status": "good" },
       { "label": "Visual Cleanliness", "value": "e.g. Low visible dockage / clean lot", "status": "good" }
     ]

Output ONLY valid JSON matching this schema.`;

    for (const modelName of candidateModels) {
      const tModelStart = Date.now();
      try {
        console.log(`[CropVision][${requestId}] Invoking Gemini Vision model "${modelName}" (timeout 10s)...`);

        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build',
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        });

        clearTimeout(timeoutHandle);

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`[CropVision][${requestId}] Model "${modelName}" returned HTTP ${res.status} in ${Date.now() - tModelStart}ms: ${errText.substring(0, 150)}`);
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`[CropVision][${requestId}] Gemini Vision response received from "${modelName}" in ${Date.now() - tModelStart}ms (${rawText.length} chars)`);

        let cleanJson = rawText.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        }

        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.isCrop === false) {
            console.log(`[CropVision][${requestId}] Gemini identified non-crop image.`);
            return {
              success: false,
              isCrop: false,
              requestId,
              analyzedAt,
              error: parsed.error || 'The uploaded photo does not appear to be an agricultural crop produce. Please upload a clear photo of your harvested crop.',
              source: 'ai_vision',
            };
          }

          if (parsed.cropName) {
            const benchmark = getMarketBenchmark(parsed.cropName);
            const score = typeof parsed.qualityScore === 'number'
              ? Math.max(50, Math.min(98, Math.round(parsed.qualityScore)))
              : 82;
            const conf = typeof parsed.confidence === 'number'
              ? (parsed.confidence <= 1 ? Math.round(parsed.confidence * 100) : Math.max(50, Math.min(98, Math.round(parsed.confidence))))
              : 88;

            // Normalize visual indicators
            let normalizedIndicators: Array<{ label: string; value: string; status: 'good' | 'average' | 'warning' }> = [];
            if (Array.isArray(parsed.visualIndicators) && parsed.visualIndicators.length > 0) {
              normalizedIndicators = parsed.visualIndicators.map((ind: any, idx: number) => {
                if (typeof ind === 'string') {
                  const label = idx === 0 ? 'Grain Lustre & Color' : idx === 1 ? 'Visual Cleanliness' : 'Crop Integrity';
                  return { label, value: ind, status: 'good' as const };
                }
                if (ind && typeof ind === 'object') {
                  return {
                    label: String(ind.label || 'Inspection Parameter'),
                    value: String(ind.value || 'Verified from photo'),
                    status: ind.status === 'warning' || ind.status === 'average' ? ind.status : ('good' as const),
                  };
                }
                return { label: 'Appearance', value: 'Inspected', status: 'good' as const };
              });
            } else {
              normalizedIndicators = [
                { label: 'Grain Lustre & Color', value: 'Natural Crop Pigment', status: 'good' },
                { label: 'Visual Cleanliness', value: 'Inspected from photo', status: 'good' },
              ];
            }

            console.log(`[CropVision][${requestId}] Gemini classified successfully using "${modelName}": crop="${parsed.cropName}", variety="${parsed.variety}", score=${score}, conf=${conf}%`);
            return {
              success: true,
              isCrop: true,
              requestId,
              analyzedAt,
              cropName: String(parsed.cropName).trim(),
              variety: String(parsed.variety || 'Commercial Standard / Variety not visually identifiable').trim(),
              qualityGrade: parsed.qualityGrade || (score >= 85 ? 'Grade A' : 'Grade B'),
              qualityScore: score,
              confidence: conf,
              moisturePercent: typeof parsed.moisturePercent === 'number' ? parsed.moisturePercent : undefined,
              foreignMatterPercent: typeof parsed.foreignMatterPercent === 'number' ? parsed.foreignMatterPercent : undefined,
              grainDamagePercent: typeof parsed.grainDamagePercent === 'number' ? parsed.grainDamagePercent : undefined,
              qualityRemarks: parsed.qualityRemarks || 'Visual inspection completed successfully based on uploaded photo.',
              visualIndicators: normalizedIndicators,
              estimatedMarketPriceRange: benchmark,
              source: 'ai_vision',
            };
          }
        }
      } catch (aiErr: any) {
        const errMsg = aiErr.message || String(aiErr);
        console.warn(`[CropVision][${requestId}] Model ${modelName} call error after ${Date.now() - tModelStart}ms: ${errMsg}`);
        continue;
      }
    }
  }

  // If AI vision models could not analyze or all failed, DO NOT fabricate or guess a crop from heuristic colors!
  // Return an honest error so the farmer can retry or take a clearer photo.
  return {
    success: false,
    requestId,
    analyzedAt,
    error: 'AI analysis could not be completed for this image. Please ensure good lighting and upload a clear photo of your harvested crop.',
  };
}

