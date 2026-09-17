export interface ForecastPoint {
  date: string;
  label: string;
  isForecast: boolean;
  actualPrice?: number;
  forecastPrice?: number;
  lowerBound?: number;
  upperBound?: number;
  demandIndex: number; // 0 to 100
  confidenceScore?: number; // e.g. 88%
}

export interface MarketOpportunityItem {
  id: string;
  mandi: string;
  district: string;
  state: string;
  distanceKm: number;
  spotPrice: number;
  freightPerQtl: number;
  netRealization: number;
  opportunityTier: 'high' | 'medium' | 'low';
  score: number; // 0 - 100
  buyerLiquidity: string;
  recommendationNote: string;
}

export interface ExplainabilityFactor {
  id: string;
  title: string;
  impact: 'positive' | 'negative' | 'neutral';
  impactPercentage: number;
  weight: string;
  description: string;
  category: 'Demand & Tenders' | 'Seasonality' | 'Weather & Yield' | 'Govt Policy';
}

export interface CropAnalyticsProfile {
  id: string;
  cropName: string;
  variety: string;
  category: string;
  state: string;
  district: string;
  defaultMandi: string;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  change24h: number;
  change7d: number;
  demandLevel: 'Surge' | 'High' | 'Moderate' | 'Steady' | 'Low';
  demandScore: number; // 0 - 100
  marketAvailability: {
    status: 'High Liquidity' | 'Moderate Flow' | 'Tight Supply' | 'Glut';
    dailyArrivalQtl: number;
    warehouseCapacityUsedPercent: number;
    activeAuctions: number;
    activeBuyersCount: number;
  };
  forecastSeries: ForecastPoint[];
  demandTrend: {
    currentScore: number;
    predictedScoreNextMonth: number;
    historicalAverageScore: number;
    seasonalPeakMonth: string;
    trendDirection: 'Surging' | 'Steady Growth' | 'Stable' | 'Declining';
    institutionalDemandNote: string;
  };
  opportunities: MarketOpportunityItem[];
  insights: {
    priceTrendInsight: {
      headline: string;
      expectedChangePercent: number;
      horizon: string;
      confidence: number;
      actionableAdvice: string;
    };
    demandInsight: {
      headline: string;
      buyerActivity: string;
      procurementTendersCount: number;
      demandSummary: string;
    };
    marketOpportunityInsight: {
      headline: string;
      bestMarket: string;
      extraProfitPerQtl: number;
      logisticsAdvice: string;
    };
  };
  explainability: {
    overallConfidence: number;
    primaryDriver: string;
    factors: ExplainabilityFactor[];
  };
}

export const CROP_ANALYTICS_DATASET: Record<string, CropAnalyticsProfile> = {
  'wheat-sharbati': {
    id: 'wheat-sharbati',
    cropName: 'Wheat',
    variety: 'Sharbati (Grade A Premium)',
    category: 'Grains',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    defaultMandi: 'Sehore APMC Yard',
    currentPrice: 2860,
    minPrice: 2680,
    maxPrice: 2940,
    avgPrice: 2820,
    change24h: 2.8,
    change7d: 5.4,
    demandLevel: 'Surge',
    demandScore: 92,
    marketAvailability: {
      status: 'High Liquidity',
      dailyArrivalQtl: 4200,
      warehouseCapacityUsedPercent: 68,
      activeAuctions: 16,
      activeBuyersCount: 28,
    },
    forecastSeries: [
      { date: '2026-08-05', label: '05 Aug', isForecast: false, actualPrice: 2740, demandIndex: 82 },
      { date: '2026-08-08', label: '08 Aug', isForecast: false, actualPrice: 2770, demandIndex: 84 },
      { date: '2026-08-11', label: '11 Aug', isForecast: false, actualPrice: 2810, demandIndex: 87 },
      { date: '2026-08-14', label: '14 Aug', isForecast: false, actualPrice: 2835, demandIndex: 89 },
      { date: '2026-08-17', label: '17 Aug', isForecast: false, actualPrice: 2850, demandIndex: 90 },
      { date: '2026-08-19', label: 'Today', isForecast: false, actualPrice: 2860, demandIndex: 92 },
      // Predictions
      { date: '2026-08-22', label: '+3 Days', isForecast: true, forecastPrice: 2895, lowerBound: 2860, upperBound: 2930, demandIndex: 93, confidenceScore: 94 },
      { date: '2026-08-26', label: '+7 Days', isForecast: true, forecastPrice: 2940, lowerBound: 2890, upperBound: 2990, demandIndex: 95, confidenceScore: 91 },
      { date: '2026-08-30', label: '+11 Days', isForecast: true, forecastPrice: 2980, lowerBound: 2920, upperBound: 3040, demandIndex: 96, confidenceScore: 88 },
      { date: '2026-09-04', label: '+16 Days', isForecast: true, forecastPrice: 3020, lowerBound: 2940, upperBound: 3090, demandIndex: 97, confidenceScore: 85 },
      { date: '2026-09-10', label: '+22 Days', isForecast: true, forecastPrice: 3060, lowerBound: 2960, upperBound: 3150, demandIndex: 98, confidenceScore: 82 },
      { date: '2026-09-18', label: '+30 Days', isForecast: true, forecastPrice: 3110, lowerBound: 2990, upperBound: 3220, demandIndex: 98, confidenceScore: 79 },
    ],
    demandTrend: {
      currentScore: 92,
      predictedScoreNextMonth: 97,
      historicalAverageScore: 74,
      seasonalPeakMonth: 'September - October (Festive Restocking)',
      trendDirection: 'Surging',
      institutionalDemandNote: '14 roller flour mills in Central India are aggressively filling bulk contracts for premium grade milling wheat.',
    },
    opportunities: [
      {
        id: 'opp-1',
        mandi: 'Indore Grain Terminal',
        district: 'Indore',
        state: 'Madhya Pradesh',
        distanceKm: 58,
        spotPrice: 2980,
        freightPerQtl: 65,
        netRealization: 2915,
        opportunityTier: 'high',
        score: 96,
        buyerLiquidity: '64 Active Institutional Buyers',
        recommendationNote: 'Optimal destination. Net profit is ₹55/q higher than local mandi even after transport costs.',
      },
      {
        id: 'opp-2',
        mandi: 'Dewas Krishi Mandi',
        district: 'Dewas',
        state: 'Madhya Pradesh',
        distanceKm: 36,
        spotPrice: 2910,
        freightPerQtl: 45,
        netRealization: 2865,
        opportunityTier: 'medium',
        score: 82,
        buyerLiquidity: '29 Active Buyers',
        recommendationNote: 'Steady absorption with fast digital settlement (<2 hours).',
      },
      {
        id: 'opp-3',
        mandi: 'Sehore Local APMC Yard',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        distanceKm: 8,
        spotPrice: 2860,
        freightPerQtl: 25,
        netRealization: 2835,
        opportunityTier: 'medium',
        score: 78,
        buyerLiquidity: '28 Active Buyers',
        recommendationNote: 'Zero transit risk. Good for small lots below 30 quintals.',
      },
      {
        id: 'opp-4',
        mandi: 'Harda Grain Market',
        district: 'Harda',
        state: 'Madhya Pradesh',
        distanceKm: 110,
        spotPrice: 2840,
        freightPerQtl: 115,
        netRealization: 2725,
        opportunityTier: 'low',
        score: 48,
        buyerLiquidity: '14 Active Buyers',
        recommendationNote: 'Freight overhead reduces net realization below MSP equivalent.',
      },
    ],
    insights: {
      priceTrendInsight: {
        headline: 'Projected +5.6% Bullish Run over next 2 weeks',
        expectedChangePercent: 5.6,
        horizon: '14 Days',
        confidence: 91,
        actionableAdvice: 'Consider staggering sales over the next 10-15 days rather than liquidating all inventory immediately.',
      },
      demandInsight: {
        headline: 'High Institutional Deficit for Grade A Sharbati',
        buyerActivity: '28 Vetted Corporate & Mill Buyers Active',
        procurementTendersCount: 14,
        demandSummary: 'Heavy demand from pan-India packaged atta manufacturers creating spot price premiums over standard milling wheat.',
      },
      marketOpportunityInsight: {
        headline: 'Indore Terminal delivers maximum net arbitrage',
        bestMarket: 'Indore Grain Terminal (58 km)',
        extraProfitPerQtl: 55,
        logisticsAdvice: 'Pool transport with neighboring farms to reduce per-quintal trucking to ₹45/q.',
      },
    },
    explainability: {
      overallConfidence: 89,
      primaryDriver: 'Festive Atta Manufacturer Procurement & Low Carryover Stocks',
      factors: [
        {
          id: 'f-1',
          title: 'Institutional Bulk Tenders',
          impact: 'positive',
          impactPercentage: 38,
          weight: 'High Weight (38%)',
          description: '14 active purchase contracts logged from roller flour mills and FMCG brands with delivery deadlines within 3 weeks.',
          category: 'Demand & Tenders',
        },
        {
          id: 'f-2',
          title: 'Festive Seasonality Pattern',
          impact: 'positive',
          impactPercentage: 27,
          weight: 'Medium-High (27%)',
          description: '10-year historical APMC records show an average 4.8% price appreciation in the August-September window.',
          category: 'Seasonality',
        },
        {
          id: 'f-3',
          title: 'Regional Warehouse Carryover',
          impact: 'positive',
          impactPercentage: 20,
          weight: 'Medium (20%)',
          description: 'Private warehouse carryover in Malwa basin is 18% lower than 5-year median, keeping supply tight.',
          category: 'Weather & Yield',
        },
        {
          id: 'f-4',
          title: 'Govt MSP Floor Support',
          impact: 'neutral',
          impactPercentage: 15,
          weight: 'Baseline (15%)',
          description: 'Current market quote is ₹435 above official MSP (₹2,425), ensuring strong downside cushion.',
          category: 'Govt Policy',
        },
      ],
    },
  },

  'soybean-yellow': {
    id: 'soybean-yellow',
    cropName: 'Soybean',
    variety: 'Yellow Seed JS-9560 / JS-335',
    category: 'Oilseeds',
    state: 'Madhya Pradesh',
    district: 'Dewas',
    defaultMandi: 'Dewas Krishi Mandi',
    currentPrice: 4680,
    minPrice: 4510,
    maxPrice: 4790,
    avgPrice: 4640,
    change24h: 1.5,
    change7d: 3.1,
    demandLevel: 'High',
    demandScore: 84,
    marketAvailability: {
      status: 'Moderate Flow',
      dailyArrivalQtl: 3800,
      warehouseCapacityUsedPercent: 74,
      activeAuctions: 18,
      activeBuyersCount: 29,
    },
    forecastSeries: [
      { date: '2026-08-05', label: '05 Aug', isForecast: false, actualPrice: 4580, demandIndex: 78 },
      { date: '2026-08-08', label: '08 Aug', isForecast: false, actualPrice: 4610, demandIndex: 80 },
      { date: '2026-08-11', label: '11 Aug', isForecast: false, actualPrice: 4630, demandIndex: 81 },
      { date: '2026-08-14', label: '14 Aug', isForecast: false, actualPrice: 4650, demandIndex: 82 },
      { date: '2026-08-17', label: '17 Aug', isForecast: false, actualPrice: 4660, demandIndex: 83 },
      { date: '2026-08-19', label: 'Today', isForecast: false, actualPrice: 4680, demandIndex: 84 },
      // Predictions
      { date: '2026-08-22', label: '+3 Days', isForecast: true, forecastPrice: 4710, lowerBound: 4650, upperBound: 4760, demandIndex: 85, confidenceScore: 92 },
      { date: '2026-08-26', label: '+7 Days', isForecast: true, forecastPrice: 4760, lowerBound: 4680, upperBound: 4820, demandIndex: 86, confidenceScore: 88 },
      { date: '2026-08-30', label: '+11 Days', isForecast: true, forecastPrice: 4810, lowerBound: 4720, upperBound: 4890, demandIndex: 88, confidenceScore: 84 },
      { date: '2026-09-04', label: '+16 Days', isForecast: true, forecastPrice: 4860, lowerBound: 4750, upperBound: 4950, demandIndex: 89, confidenceScore: 80 },
      { date: '2026-09-10', label: '+22 Days', isForecast: true, forecastPrice: 4910, lowerBound: 4780, upperBound: 5020, demandIndex: 90, confidenceScore: 76 },
      { date: '2026-09-18', label: '+30 Days', isForecast: true, forecastPrice: 4950, lowerBound: 4800, upperBound: 5100, demandIndex: 91, confidenceScore: 73 },
    ],
    demandTrend: {
      currentScore: 84,
      predictedScoreNextMonth: 89,
      historicalAverageScore: 72,
      seasonalPeakMonth: 'September - October (Crushing Season Kickoff)',
      trendDirection: 'Steady Growth',
      institutionalDemandNote: 'Solvent extraction plants seeking high-protein lots for de-oiled cake (DOC) export contracts to Southeast Asia.',
    },
    opportunities: [
      {
        id: 'opp-s1',
        mandi: 'Latur APMC Market',
        district: 'Latur',
        state: 'Maharashtra',
        distanceKm: 420,
        spotPrice: 4720,
        freightPerQtl: 180,
        netRealization: 4540,
        opportunityTier: 'medium',
        score: 72,
        buyerLiquidity: '41 Active Solvent Plants',
        recommendationNote: 'Higher spot price, but long distance freight offsets gross margin.',
      },
      {
        id: 'opp-s2',
        mandi: 'Dewas Krishi Mandi',
        district: 'Dewas',
        state: 'Madhya Pradesh',
        distanceKm: 8,
        spotPrice: 4680,
        freightPerQtl: 30,
        netRealization: 4650,
        opportunityTier: 'high',
        score: 94,
        buyerLiquidity: '29 Active Buyers',
        recommendationNote: 'Optimal net yield for local farmers. Low freight costs guarantee highest gate return.',
      },
      {
        id: 'opp-s3',
        mandi: 'Ujjain Grain Market',
        district: 'Ujjain',
        state: 'Madhya Pradesh',
        distanceKm: 44,
        spotPrice: 4660,
        freightPerQtl: 50,
        netRealization: 4610,
        opportunityTier: 'medium',
        score: 80,
        buyerLiquidity: '22 Active Buyers',
        recommendationNote: 'Good fallback with competitive bidding on yellow bold variety.',
      },
      {
        id: 'opp-s4',
        mandi: 'Kota Mandi',
        district: 'Kota',
        state: 'Rajasthan',
        distanceKm: 260,
        spotPrice: 4620,
        freightPerQtl: 130,
        netRealization: 4490,
        opportunityTier: 'low',
        score: 52,
        buyerLiquidity: '18 Active Buyers',
        recommendationNote: 'Local Rajasthan arrivals have increased, subduing outside trade interest.',
      },
    ],
    insights: {
      priceTrendInsight: {
        headline: 'Gradual Climb toward ₹4,850/q expected as solvent crushers ramp up',
        expectedChangePercent: 3.8,
        horizon: '21 Days',
        confidence: 86,
        actionableAdvice: 'Test seed moisture (<10%) to command a ₹60-80/q quality premium at the weighbridge.',
      },
      demandInsight: {
        headline: 'DOC Export Orders Boosting Solvent Crusher Bids',
        buyerActivity: '29 Oil Mills & Solvent Extractors Active',
        procurementTendersCount: 9,
        demandSummary: 'Strong international demand for non-GMO Indian soy meal keeping domestic crushing margins positive.',
      },
      marketOpportunityInsight: {
        headline: 'Sell at Dewas Mandi for maximum net realization',
        bestMarket: 'Dewas Krishi Mandi (8 km)',
        extraProfitPerQtl: 40,
        logisticsAdvice: 'Local delivery minimizes transport risk and enables immediate UPI same-day bank settlement.',
      },
    },
    explainability: {
      overallConfidence: 85,
      primaryDriver: 'Global Edible Oil Import Parity & Domestic Solvent Crushing Demand',
      factors: [
        {
          id: 'sf-1',
          title: 'Domestic Crushing Utilization',
          impact: 'positive',
          impactPercentage: 35,
          weight: 'High (35%)',
          description: 'Solvent plants in Dewas and Pithampur are operating at 78% capacity with active spot buying.',
          category: 'Demand & Tenders',
        },
        {
          id: 'sf-2',
          title: 'Global Soy Oil Import Duties',
          impact: 'neutral',
          impactPercentage: 25,
          weight: 'Medium (25%)',
          description: 'Import duty structure on crude palm & soy oil is supporting domestic seed realization.',
          category: 'Govt Policy',
        },
        {
          id: 'sf-3',
          title: 'Kharif Harvest Crop Estimates',
          impact: 'positive',
          impactPercentage: 25,
          weight: 'Medium (25%)',
          description: 'Satellite crop health monitoring indicates normal acreage, preventing speculative crash.',
          category: 'Weather & Yield',
        },
        {
          id: 'sf-4',
          title: 'Seasonal Stock Depletion',
          impact: 'positive',
          impactPercentage: 15,
          weight: 'Low (15%)',
          description: 'Old crop inventories are nearing exhaustion ahead of new October arrivals.',
          category: 'Seasonality',
        },
      ],
    },
  },

  'cotton-shankar': {
    id: 'cotton-shankar',
    cropName: 'Cotton',
    variety: 'Shankar-6 Long Staple',
    category: 'Cash Crops',
    state: 'Gujarat',
    district: 'Rajkot',
    defaultMandi: 'Rajkot APMC Market',
    currentPrice: 7240,
    minPrice: 6980,
    maxPrice: 7420,
    avgPrice: 7180,
    change24h: 1.9,
    change7d: 3.7,
    demandLevel: 'Surge',
    demandScore: 89,
    marketAvailability: {
      status: 'High Liquidity',
      dailyArrivalQtl: 6100,
      warehouseCapacityUsedPercent: 62,
      activeAuctions: 29,
      activeBuyersCount: 58,
    },
    forecastSeries: [
      { date: '2026-08-05', label: '05 Aug', isForecast: false, actualPrice: 7040, demandIndex: 82 },
      { date: '2026-08-08', label: '08 Aug', isForecast: false, actualPrice: 7100, demandIndex: 84 },
      { date: '2026-08-11', label: '11 Aug', isForecast: false, actualPrice: 7150, demandIndex: 86 },
      { date: '2026-08-14', label: '14 Aug', isForecast: false, actualPrice: 7180, demandIndex: 87 },
      { date: '2026-08-17', label: '17 Aug', isForecast: false, actualPrice: 7210, demandIndex: 88 },
      { date: '2026-08-19', label: 'Today', isForecast: false, actualPrice: 7240, demandIndex: 89 },
      // Predictions
      { date: '2026-08-22', label: '+3 Days', isForecast: true, forecastPrice: 7290, lowerBound: 7210, upperBound: 7370, demandIndex: 90, confidenceScore: 91 },
      { date: '2026-08-26', label: '+7 Days', isForecast: true, forecastPrice: 7360, lowerBound: 7260, upperBound: 7460, demandIndex: 92, confidenceScore: 87 },
      { date: '2026-08-30', label: '+11 Days', isForecast: true, forecastPrice: 7430, lowerBound: 7310, upperBound: 7550, demandIndex: 93, confidenceScore: 83 },
      { date: '2026-09-04', label: '+16 Days', isForecast: true, forecastPrice: 7500, lowerBound: 7360, upperBound: 7640, demandIndex: 94, confidenceScore: 80 },
      { date: '2026-09-10', label: '+22 Days', isForecast: true, forecastPrice: 7570, lowerBound: 7400, upperBound: 7740, demandIndex: 95, confidenceScore: 76 },
      { date: '2026-09-18', label: '+30 Days', isForecast: true, forecastPrice: 7640, lowerBound: 7440, upperBound: 7850, demandIndex: 96, confidenceScore: 72 },
    ],
    demandTrend: {
      currentScore: 89,
      predictedScoreNextMonth: 94,
      historicalAverageScore: 76,
      seasonalPeakMonth: 'October - November (Ginning Season)',
      trendDirection: 'Surging',
      institutionalDemandNote: 'Spinning mills in Gujarat and Tamil Nadu booking 29mm+ staple lots on firm yarn export inquiries.',
    },
    opportunities: [
      {
        id: 'opp-c1',
        mandi: 'Rajkot APMC Market',
        district: 'Rajkot',
        state: 'Gujarat',
        distanceKm: 12,
        spotPrice: 7240,
        freightPerQtl: 35,
        netRealization: 7205,
        opportunityTier: 'high',
        score: 97,
        buyerLiquidity: '58 Ginners & Exporters',
        recommendationNote: 'Benchmark price hub for Shankar-6 in India. Highest transparent bidding.',
      },
      {
        id: 'opp-c2',
        mandi: 'Surendranagar Mandi',
        district: 'Surendranagar',
        state: 'Gujarat',
        distanceKm: 85,
        spotPrice: 7190,
        freightPerQtl: 75,
        netRealization: 7115,
        opportunityTier: 'medium',
        score: 79,
        buyerLiquidity: '26 Ginners',
        recommendationNote: 'Good demand for 28mm staple, slightly lower than Rajkot benchmark.',
      },
      {
        id: 'opp-c3',
        mandi: 'Amreli Cotton Yard',
        district: 'Amreli',
        state: 'Gujarat',
        distanceKm: 105,
        spotPrice: 7160,
        freightPerQtl: 90,
        netRealization: 7070,
        opportunityTier: 'medium',
        score: 75,
        buyerLiquidity: '20 Buyers',
        recommendationNote: 'Moderate auctions with steady daily clearing.',
      },
      {
        id: 'opp-c4',
        mandi: 'Abohar Cotton Market',
        district: 'Fazilka',
        state: 'Punjab',
        distanceKm: 1100,
        spotPrice: 7120,
        freightPerQtl: 420,
        netRealization: 6700,
        opportunityTier: 'low',
        score: 35,
        buyerLiquidity: '32 Buyers',
        recommendationNote: 'Distance makes inter-state transit economically unviable.',
      },
    ],
    insights: {
      priceTrendInsight: {
        headline: 'Long Staple Shankar-6 trending toward ₹7,500/q',
        expectedChangePercent: 4.3,
        horizon: '14 Days',
        confidence: 89,
        actionableAdvice: 'Ensure low trash percentage (<3%) to capture the upper grade bidding bracket.',
      },
      demandInsight: {
        headline: 'Spinning Mills Actively Replenishing Raw Fiber',
        buyerActivity: '58 Vetted Ginning Units & Textile Mills Active',
        procurementTendersCount: 18,
        demandSummary: 'Textile export order books for cotton yarn have grown 8% quarter-on-quarter.',
      },
      marketOpportunityInsight: {
        headline: 'Rajkot APMC offers deepest buyer liquidity',
        bestMarket: 'Rajkot APMC Market (12 km)',
        extraProfitPerQtl: 90,
        logisticsAdvice: 'Take advantage of Rajkot electronic weighment and digital lot assays.',
      },
    },
    explainability: {
      overallConfidence: 87,
      primaryDriver: 'Spinning Mill Yarn Orders & High Micronaire Premium',
      factors: [
        {
          id: 'cf-1',
          title: 'Spinning Mill Inquiries',
          impact: 'positive',
          impactPercentage: 40,
          weight: 'High (40%)',
          description: 'Spinning mills in South & West India running at 82% utilization with low cotton bale pipeline.',
          category: 'Demand & Tenders',
        },
        {
          id: 'cf-2',
          title: 'Global ICE Cotton Futures',
          impact: 'positive',
          impactPercentage: 25,
          weight: 'Medium (25%)',
          description: 'Firm international benchmarks preventing cheaper foreign lint dumping.',
          category: 'Demand & Tenders',
        },
        {
          id: 'cf-3',
          title: 'MSP Floor Support (₹7,121)',
          impact: 'positive',
          impactPercentage: 20,
          weight: 'Medium (20%)',
          description: 'Govt CCI procurement operations at MSP ensure firm bottom support.',
          category: 'Govt Policy',
        },
        {
          id: 'cf-4',
          title: 'Saurashtra Rainfall & Boll Health',
          impact: 'neutral',
          impactPercentage: 15,
          weight: 'Low (15%)',
          description: 'Monsoon distribution has been favorable across key Saurashtra cotton tracts.',
          category: 'Weather & Yield',
        },
      ],
    },
  },

  'basmati-1121': {
    id: 'basmati-1121',
    cropName: 'Basmati Rice',
    variety: 'Pusa 1121 (Extra Long Grain)',
    category: 'Grains',
    state: 'Haryana',
    district: 'Karnal',
    defaultMandi: 'Karnal Basmati Hub',
    currentPrice: 4350,
    minPrice: 4120,
    maxPrice: 4480,
    avgPrice: 4290,
    change24h: 3.2,
    change7d: 6.8,
    demandLevel: 'Surge',
    demandScore: 95,
    marketAvailability: {
      status: 'High Liquidity',
      dailyArrivalQtl: 8400,
      warehouseCapacityUsedPercent: 65,
      activeAuctions: 22,
      activeBuyersCount: 48,
    },
    forecastSeries: [
      { date: '2026-08-05', label: '05 Aug', isForecast: false, actualPrice: 4120, demandIndex: 85 },
      { date: '2026-08-08', label: '08 Aug', isForecast: false, actualPrice: 4180, demandIndex: 88 },
      { date: '2026-08-11', label: '11 Aug', isForecast: false, actualPrice: 4220, demandIndex: 90 },
      { date: '2026-08-14', label: '14 Aug', isForecast: false, actualPrice: 4260, demandIndex: 92 },
      { date: '2026-08-17', label: '17 Aug', isForecast: false, actualPrice: 4310, demandIndex: 94 },
      { date: '2026-08-19', label: 'Today', isForecast: false, actualPrice: 4350, demandIndex: 95 },
      // Predictions
      { date: '2026-08-22', label: '+3 Days', isForecast: true, forecastPrice: 4410, lowerBound: 4340, upperBound: 4480, demandIndex: 96, confidenceScore: 93 },
      { date: '2026-08-26', label: '+7 Days', isForecast: true, forecastPrice: 4480, lowerBound: 4390, upperBound: 4570, demandIndex: 97, confidenceScore: 89 },
      { date: '2026-08-30', label: '+11 Days', isForecast: true, forecastPrice: 4550, lowerBound: 4440, upperBound: 4660, demandIndex: 98, confidenceScore: 86 },
      { date: '2026-09-04', label: '+16 Days', isForecast: true, forecastPrice: 4610, lowerBound: 4480, upperBound: 4740, demandIndex: 98, confidenceScore: 82 },
      { date: '2026-09-10', label: '+22 Days', isForecast: true, forecastPrice: 4670, lowerBound: 4520, upperBound: 4820, demandIndex: 99, confidenceScore: 78 },
      { date: '2026-09-18', label: '+30 Days', isForecast: true, forecastPrice: 4730, lowerBound: 4560, upperBound: 4900, demandIndex: 99, confidenceScore: 75 },
    ],
    demandTrend: {
      currentScore: 95,
      predictedScoreNextMonth: 99,
      historicalAverageScore: 78,
      seasonalPeakMonth: 'September - November (Middle East Export Season)',
      trendDirection: 'Surging',
      institutionalDemandNote: 'Gulf export shipments accelerating for Middle East festive window, with major rice export houses bidding aggressively.',
    },
    opportunities: [
      {
        id: 'opp-b1',
        mandi: 'Karnal Basmati Hub',
        district: 'Karnal',
        state: 'Haryana',
        distanceKm: 10,
        spotPrice: 4350,
        freightPerQtl: 30,
        netRealization: 4320,
        opportunityTier: 'high',
        score: 98,
        buyerLiquidity: '48 Rice Exporters & Millers',
        recommendationNote: 'World epicenter for Basmati trade. Top quality premiums paid for long grain length.',
      },
      {
        id: 'opp-b2',
        mandi: 'Khanna Grain Market',
        district: 'Ludhiana',
        state: 'Punjab',
        distanceKm: 140,
        spotPrice: 4280,
        freightPerQtl: 95,
        netRealization: 4185,
        opportunityTier: 'medium',
        score: 82,
        buyerLiquidity: '36 Millers',
        recommendationNote: 'High volume capacity but slightly lower net realization than Karnal for 1121 variety.',
      },
      {
        id: 'opp-b3',
        mandi: 'Taraori Mandi',
        district: 'Karnal',
        state: 'Haryana',
        distanceKm: 18,
        spotPrice: 4330,
        freightPerQtl: 35,
        netRealization: 4295,
        opportunityTier: 'high',
        score: 93,
        buyerLiquidity: '24 Millers',
        recommendationNote: 'Excellent close proximity alternative with fast unloading queues.',
      },
      {
        id: 'opp-b4',
        mandi: 'Narela Mandi',
        district: 'North Delhi',
        state: 'Delhi',
        distanceKm: 110,
        spotPrice: 4290,
        freightPerQtl: 85,
        netRealization: 4205,
        opportunityTier: 'medium',
        score: 79,
        buyerLiquidity: '30 Buyers',
        recommendationNote: 'Good wholesale demand but transport entry taxes into NCR apply.',
      },
    ],
    insights: {
      priceTrendInsight: {
        headline: 'Export demand projected to push Pusa 1121 past ₹4,600/q',
        expectedChangePercent: 6.2,
        horizon: '20 Days',
        confidence: 93,
        actionableAdvice: 'Aromatic grade grain with moisture below 13% is commanding an immediate ₹150/q premium.',
      },
      demandInsight: {
        headline: 'Record Export Registrations to GCC Nations',
        buyerActivity: '48 Registered Basmati Exporters Active',
        procurementTendersCount: 22,
        demandSummary: 'Shipments to UAE, Saudi Arabia, and Iraq have picked up speed with relaxation of minimum export price (MEP) thresholds.',
      },
      marketOpportunityInsight: {
        headline: 'Karnal Basmati Yard yields highest net return',
        bestMarket: 'Karnal Basmati Hub (10 km)',
        extraProfitPerQtl: 135,
        logisticsAdvice: 'Deliver directly to exporter yard gates for immediate e-NAM direct bank transfer.',
      },
    },
    explainability: {
      overallConfidence: 91,
      primaryDriver: 'Middle East Export Surge & MEP Policy Rationalization',
      factors: [
        {
          id: 'bf-1',
          title: 'Export Demand & Vessel Bookings',
          impact: 'positive',
          impactPercentage: 45,
          weight: 'High (45%)',
          description: 'Port container bookings for Basmati out of Kandla/Mundra are up 22% year-on-year.',
          category: 'Demand & Tenders',
        },
        {
          id: 'bf-2',
          title: 'Government Export Policy Support',
          impact: 'positive',
          impactPercentage: 25,
          weight: 'Medium (25%)',
          description: 'Removal of restrictive export tariffs has opened smooth international trade flows.',
          category: 'Govt Policy',
        },
        {
          id: 'bf-3',
          title: 'Crop Quality & Grain Length',
          impact: 'positive',
          impactPercentage: 20,
          weight: 'Medium (20%)',
          description: 'Pusa 1121 test cuttings show exceptional average cooked length >21mm.',
          category: 'Weather & Yield',
        },
        {
          id: 'bf-4',
          title: 'Pre-Festive Stock Accumulation',
          impact: 'positive',
          impactPercentage: 10,
          weight: 'Low (10%)',
          description: 'Domestic modern trade retail chains building festival season inventory.',
          category: 'Seasonality',
        },
      ],
    },
  },
};

export const CROP_SELECTOR_OPTIONS = [
  { id: 'wheat-sharbati', name: 'Wheat', variety: 'Sharbati Grade A', state: 'Madhya Pradesh', district: 'Sehore', defaultMandi: 'Sehore APMC Yard' },
  { id: 'soybean-yellow', name: 'Soybean', variety: 'Yellow Seed JS-9560', state: 'Madhya Pradesh', district: 'Dewas', defaultMandi: 'Dewas Krishi Mandi' },
  { id: 'cotton-shankar', name: 'Cotton', variety: 'Shankar-6 Long Staple', state: 'Gujarat', district: 'Rajkot', defaultMandi: 'Rajkot APMC Market' },
  { id: 'basmati-1121', name: 'Basmati Rice', variety: 'Pusa 1121 Extra Long', state: 'Haryana', district: 'Karnal', defaultMandi: 'Karnal Basmati Hub' },
];
