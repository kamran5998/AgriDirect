import { apiClient } from './client';

export interface PredictionConfidenceRange {
  lower_bound: number;
  upper_bound: number;
  standard_error: number;
}

export interface FeatureImportanceItem {
  feature_name: string;
  display_name: string;
  importance_percent: number;
  impact_description: string;
}

export interface ModelEvaluationSummary {
  model_name: string;
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
  train_samples: number;
  test_samples: number;
  is_selected_best_model: boolean;
}

export interface ForecastPoint {
  date: string;
  day_offset: number;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  trend_label: string;
}

export interface PricePredictionResponse {
  status: string;
  has_sufficient_data: boolean;
  crop_id: number;
  crop_name: string;
  market_id: number;
  market_name: string;
  district: string;
  state: string;
  current_spot_price: number;
  predicted_price: number;
  prediction_date: string;
  horizon_days: number;
  predicted_change_amount: number;
  predicted_change_percent: number;
  predicted_range: PredictionConfidenceRange;
  model_confidence_score: number;
  model_confidence_rating: 'High Confidence' | 'Moderate Confidence' | 'Low Confidence' | string;
  important_factors: FeatureImportanceItem[];
  model_evaluation: ModelEvaluationSummary;
  baseline_comparison?: ModelEvaluationSummary[];
  forecast_timeseries: ForecastPoint[];
  historical_samples_count: number;
  disclaimer: string;
}

export interface InsufficientDataResponse {
  status: string;
  has_sufficient_data: boolean;
  crop_id: number;
  crop_name?: string;
  market_id: number;
  market_name?: string;
  historical_samples_count: number;
  minimum_required_samples: number;
  message: string;
}

export const predictionApi = {
  /**
   * Fetch ML price prediction for a crop at a target market
   * GET /api/predictions/{crop_id}/{market_id}?horizon_days={horizon_days}
   */
  async getPrediction(
    cropId: number,
    marketId: number = 1,
    horizonDays: number = 7
  ): Promise<PricePredictionResponse | null> {
    try {
      const res = await apiClient.get<PricePredictionResponse | InsufficientDataResponse>(
        `/predictions/${cropId}/${marketId}`,
        { params: { horizon_days: horizonDays } }
      );
      if (res && res.has_sufficient_data && (res as PricePredictionResponse).predicted_price !== undefined) {
        return res as PricePredictionResponse;
      }
      return null;
    } catch (err) {
      console.warn('Prediction API call failed or insufficient samples:', err);
      return null;
    }
  },
};

export default predictionApi;
