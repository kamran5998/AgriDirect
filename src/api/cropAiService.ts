import { apiClient } from './client';
import { CROP_MARKET_DATA } from '../data/marketData';

export interface VisualIndicator {
  label: string;
  value: string;
  status: 'good' | 'average' | 'warning';
}

export interface CropAiAnalysisResult {
  cropName: string;
  variety: string;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade A Premium' | 'FAQ Standard' | 'Organic Certified';
  qualityScore: number;
  confidence: number;
  moisturePercent?: number;
  foreignMatterPercent?: number;
  grainDamagePercent?: number;
  qualityRemarks: string;
  visualIndicators: VisualIndicator[];
  estimatedMarketPriceRange: {
    min: number;
    max: number;
    suggestedPrice: number;
    mandiName: string;
  };
  source: 'ai_vision' | 'ai_image_analysis';
}

export const cropAiService = {
  /**
   * Analyze an uploaded crop image with AI vision API
   */
  async analyzeCropImage(
    imageDataUrl: string,
    fileName?: string,
    visualFeatures?: any
  ): Promise<CropAiAnalysisResult> {
    if (!imageDataUrl || typeof imageDataUrl !== 'string' || imageDataUrl.trim().length < 50) {
      throw new Error('Please select or upload a valid crop image.');
    }

    try {
      const res = await apiClient.post<any>(
        '/crop-ai/analyze-image',
        {
          image: imageDataUrl,
          fileName: fileName || 'crop_image.jpg',
          visualFeatures,
        },
        {
          timeout: 60000,
        }
      );

      if (res && res.success && res.cropName) {
        return {
          cropName: res.cropName,
          variety: res.variety || 'Commercial Grade FAQ',
          qualityGrade: res.qualityGrade || 'Grade A',
          qualityScore: typeof res.qualityScore === 'number' ? res.qualityScore : 85,
          confidence: typeof res.confidence === 'number' ? res.confidence : 88,
          moisturePercent: res.moisturePercent,
          foreignMatterPercent: res.foreignMatterPercent,
          grainDamagePercent: res.grainDamagePercent,
          qualityRemarks: res.qualityRemarks || 'AI visual assessment completed.',
          visualIndicators: res.visualIndicators || [
            { label: 'Grain Lustre & Color', value: 'High Visual Cleanliness', status: 'good' },
            { label: 'Visual Cleanliness', value: 'Clean Lot', status: 'good' },
          ],
          estimatedMarketPriceRange: res.estimatedMarketPriceRange || {
            min: 2150,
            max: 2350,
            suggestedPrice: 2280,
            mandiName: 'Nearby Regional Mandi',
          },
          source: res.source || 'ai_vision',
        };
      }

      if (res && res.error) {
        throw new Error(res.error);
      }

      throw new Error('AI analysis could not be completed for this image. Please upload a clear photo of your crop.');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'AI analysis could not be completed. Please check your image and try again.';
      console.warn('[cropAiService] Image analysis failed:', message);
      throw new Error(message);
    }
  },

  /**
   * Get dynamic price intelligence for a specific crop and location
   */
  getPriceAnalysisForCrop(cropName: string, district?: string): { min: number; max: number; suggested: number; mandiName: string } {
    const matched = CROP_MARKET_DATA.find((c) =>
      c.name.toLowerCase().includes(cropName.toLowerCase()) ||
      cropName.toLowerCase().includes(c.name.toLowerCase())
    );

    if (matched) {
      return {
        min: matched.minPrice,
        max: matched.maxPrice,
        suggested: matched.currentPrice,
        mandiName: `${district ? `${district} / ` : ''}${matched.mandi}`,
      };
    }

    // Default price benchmarks based on crop name
    const clower = cropName.toLowerCase();
    if (clower.includes('wheat')) return { min: 2150, max: 2350, suggested: 2280, mandiName: `${district || 'Sehore'} APMC Mandi` };
    if (clower.includes('soybean')) return { min: 4500, max: 4850, suggested: 4720, mandiName: `${district || 'Indore'} Grain Terminal` };
    if (clower.includes('cotton')) return { min: 6900, max: 7400, suggested: 7200, mandiName: `${district || 'Rajkot'} Cotton Yard` };
    if (clower.includes('rice') || clower.includes('basmati')) return { min: 3800, max: 4300, suggested: 4150, mandiName: `${district || 'Karnal'} Grain Market` };
    if (clower.includes('mustard')) return { min: 5200, max: 5650, suggested: 5450, mandiName: `${district || 'Alwar'} Mandi` };
    if (clower.includes('chana') || clower.includes('gram')) return { min: 5000, max: 5400, suggested: 5200, mandiName: `${district || 'Akola'} Mandi` };
    if (clower.includes('chili')) return { min: 17500, max: 19200, suggested: 18400, mandiName: `${district || 'Guntur'} Spices Yard` };
    if (clower.includes('onion')) return { min: 1900, max: 2350, suggested: 2150, mandiName: `${district || 'Lasalgaon'} Mandi` };
    if (clower.includes('tomato')) return { min: 1400, max: 1800, suggested: 1650, mandiName: `${district || 'Kolar'} Market` };
    if (clower.includes('potato')) return { min: 1200, max: 1650, suggested: 1450, mandiName: `${district || 'Agra'} Market` };

    return { min: 2200, max: 2600, suggested: 2400, mandiName: `${district || 'Regional'} APMC Mandi` };
  },
};

export const analyzeCropImageWithAi = (
  imageDataUrl: string,
  fileName?: string,
  visualFeatures?: any
): Promise<CropAiAnalysisResult> => {
  return cropAiService.analyzeCropImage(imageDataUrl, fileName, visualFeatures);
};
