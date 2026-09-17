import { apiClient } from './client';
import {
  CropAnalyticsProfile,
  ForecastPoint,
  MarketOpportunityItem,
  ExplainabilityFactor,
} from '../data/cropAnalyticsData';

export interface ForecastQueryParams {
  cropId?: string;
  horizonDays?: 7 | 15 | 30 | 60;
  mandiRegion?: string;
}

export interface HoldVsSellRecommendation {
  cropName: string;
  recommendation: 'STRONG_HOLD' | 'HOLD' | 'CONSIDER_SELLING' | 'STRONG_SELL';
  confidenceScore: number;
  currentSpotPrice: number;
  projectedPeakPrice: number;
  projectedPeakDate: string;
  expectedNetGainPerQuintal: number;
  monthlyStorageCostPerQuintal: number;
  breakevenDays: number;
  summaryReasoning: string;
  riskFactors: string[];
}

export const cropApi = {
  /**
   * Fetch all predictive crop forecast profiles
   * GET /api/crops/profiles
   */
  async getProfiles(params?: ForecastQueryParams): Promise<CropAnalyticsProfile[]> {
    return apiClient.get<CropAnalyticsProfile[]>('/crops/profiles', { params, requiresAuth: false });
  },

  /**
   * Fetch forecast profile for a specific crop by ID
   * GET /api/crops/profiles/:cropId
   */
  async getProfileByCropId(cropId: string, horizonDays: number = 30): Promise<CropAnalyticsProfile> {
    return apiClient.get<CropAnalyticsProfile>(`/crops/profiles/${cropId}`, {
      params: { horizonDays },
      requiresAuth: false,
    });
  },

  /**
   * Fetch forecasted price trajectory data points
   * GET /api/crops/:cropId/forecast-series
   */
  async getForecastSeries(cropId: string, days: number = 30): Promise<ForecastPoint[]> {
    return apiClient.get<ForecastPoint[]>(`/crops/${cropId}/forecast-series`, {
      params: { days },
      requiresAuth: false,
    });
  },

  /**
   * Fetch spatial market arbitrage opportunities for a crop
   * GET /api/crops/:cropId/opportunities
   */
  async getMarketOpportunities(cropId: string): Promise<MarketOpportunityItem[]> {
    return apiClient.get<MarketOpportunityItem[]>(`/crops/${cropId}/opportunities`, {
      requiresAuth: false,
    });
  },

  /**
   * Fetch AI explainability feature contribution factors
   * GET /api/crops/:cropId/explainability
   */
  async getExplainabilityFactors(cropId: string): Promise<ExplainabilityFactor[]> {
    return apiClient.get<ExplainabilityFactor[]>(`/crops/${cropId}/explainability`, {
      requiresAuth: false,
    });
  },

  /**
   * Fetch AI Hold vs. Sell strategy advisory for a farmer's crop inventory
   * POST /api/crops/hold-vs-sell-advice
   */
  async getHoldVsSellAdvice(cropName: string, volumeQuintals: number, currentMandi?: string): Promise<HoldVsSellRecommendation> {
    return apiClient.post<HoldVsSellRecommendation>(
      '/crops/hold-vs-sell-advice',
      { cropName, volumeQuintals, currentMandi },
      { requiresAuth: false }
    );
  },
};

export default cropApi;
