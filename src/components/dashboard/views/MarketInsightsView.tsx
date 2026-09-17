import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Truck,
  IndianRupee,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Info,
  Layers,
  BarChart3,
  Award,
  RefreshCw,
  Scale
} from 'lucide-react';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import {
  recommendationApi,
  RecommendationResponse,
  MarketRecommendationCard
} from '../../../api/recommendationApi';

const AVAILABLE_CROPS = [
  { id: 1, name: 'Wheat (Sharbati / Lokwan)' },
  { id: 2, name: 'Soybean (Yellow)' },
  { id: 3, name: 'Gram / Chana (Desi)' },
  { id: 4, name: 'Mustard (Black)' },
  { id: 5, name: 'Onion (Red)' },
  { id: 6, name: 'Cotton (Medium Staple)' },
  { id: 7, name: 'Maize (Yellow Feed)' },
  { id: 8, name: 'Paddy / Rice (Basmati)' },
];

const AVAILABLE_DISTRICTS = [
  'Sehore',
  'Indore',
  'Dewas',
  'Ujjain',
  'Bhopal',
  'Hoshangabad',
  'Vidisha',
  'Raisen',
  'Nashik',
  'Kota',
  'Guntur',
  'Bathinda',
];

export const MarketInsightsView: React.FC = () => {
  const [selectedCropId, setSelectedCropId] = useState<number>(1);
  const [quantityQuintals, setQuantityQuintals] = useState<number>(50);
  const [farmerDistrict, setFarmerDistrict] = useState<string>('Sehore');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(250);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [expandedMarketId, setExpandedMarketId] = useState<number | null>(null);
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ranking' | 'comparison' | 'methodology'>('ranking');

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await recommendationApi.getMarketRecommendations({
        crop_id: selectedCropId,
        quantity_quintals: quantityQuintals,
        farmer_district: farmerDistrict,
        farmer_state: 'Madhya Pradesh',
        max_distance_km: maxDistanceKm,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCropId, quantityQuintals, farmerDistrict, maxDistanceKm]);

  const toggleMarketExpand = (marketId: number) => {
    setExpandedMarketId(expandedMarketId === marketId ? null : marketId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreBadgeVariant = (rating: string): 'emerald' | 'blue' | 'amber' | 'rose' | 'default' => {
    switch (rating) {
      case 'Exceptional': return 'emerald';
      case 'Favorable': return 'blue';
      case 'Moderate': return 'amber';
      case 'Unfavorable': return 'rose';
      default: return 'default';
    }
  };

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'Surge':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            Surge Demand
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            High Demand
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Moderate Demand
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low Demand
          </span>
        );
    }
  };

  const getTrendIcon = (direction: string, rate: number) => {
    if (direction === 'Rising') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5" />
          +{rate.toFixed(1)}% (Rising)
        </span>
      );
    }
    if (direction === 'Falling') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          <TrendingDown className="w-3.5 h-3.5" />
          {rate.toFixed(1)}% (Falling)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
        <Minus className="w-3.5 h-3.5" />
        {rate.toFixed(1)}% (Stable)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">Decision Support Engine</Badge>
            <span className="text-xs text-slate-400 font-medium">Explainable Multi-Factor Ranking</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 font-['Outfit',sans-serif]">
            Market Selling Recommendations & Opportunity Scoring
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Evaluates spot prices, road logistics, buyer demand liquidity, and price momentum to help you maximize net farm-gate profit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMethodologyModal(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            Scoring Methodology
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-600" />
            Farmer Parameters & Selling Scenario
          </div>
          <span className="text-xs text-slate-400">
            Real-time APMC Mandi benchmarking
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Crop / Commodity
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {AVAILABLE_CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Harvest Lot Size (Quintals)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                Qtl
              </span>
            </div>
          </div>

          {/* Farmer District */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Farm District (Origin)
            </label>
            <select
              value={farmerDistrict}
              onChange={(e) => setFarmerDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {AVAILABLE_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} District
                </option>
              ))}
            </select>
          </div>

          {/* Travel Radius */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Max Transit Radius</span>
              <span className="text-emerald-600 font-extrabold">{maxDistanceKm} km</span>
            </label>
            <input
              type="range"
              min="25"
              max="300"
              step="25"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
            />
          </div>
        </div>
      </div>

      {/* KPI Hero Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Top Recommendation */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-800/80 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award className="w-24 h-24 text-emerald-300" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Top Recommended Mandi
            </div>
            <h3 className="text-lg font-black text-white truncate">
              {data.top_recommended_market || 'Indore APMC Mandi'}
            </h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">
                Score {data.recommendations[0]?.opportunity_score || 88.5}
              </span>
              <span className="text-xs text-emerald-200/80">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              Highest net farm-gate profit after road logistics
            </div>
          </div>

          {/* Additional Net Earnings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Arbitrage Opportunity Gain
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              +₹{data.max_additional_income.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500">
              Additional net earnings on <strong>{data.quantity_quintals}q</strong> choosing the #1 market over the lowest baseline.
            </p>
          </div>

          {/* Regional Benchmark Spot Price */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Regional Average Spot Rate
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{data.regional_benchmark_spot_price.toLocaleString()}<span className="text-xs text-slate-400 font-semibold">/q</span>
            </div>
            <p className="text-xs text-slate-500">
              Baseline spot price across {data.total_markets_evaluated} evaluated APMC trading yards.
            </p>
          </div>

          {/* Best Net Realization */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              Top Net Farm-Gate Price
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{data.recommendations[0]?.net_price_per_qtl.toLocaleString() || '2,903.95'}<span className="text-xs text-slate-400 font-semibold">/q</span>
            </div>
            <p className="text-xs text-slate-500">
              Gross mandi price minus estimated transport deduction.
            </p>
          </div>

        </div>
      )}

      {/* Tabs View Selector */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ranking'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Ranked Market Opportunities ({data?.recommendations.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Comparative Price & Net Revenue Table
        </button>
      </div>

      {/* TAB 1: Ranked Market Recommendations */}
      {activeTab === 'ranking' && data && (
        <div className="space-y-4">
          {data.recommendations.map((market: MarketRecommendationCard) => {
            const isExpanded = expandedMarketId === market.market_id;

            return (
              <div
                key={market.market_id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  market.rank === 1
                    ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-400/20'
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Main Card Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Left: Rank, Mandi Info & Badges */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Rank Circle */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        market.rank === 1
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : market.rank === 2
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      #{market.rank}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">
                          {market.market_name}
                        </h4>
                        {market.badge_label && (
                          <Badge variant="emerald" size="sm">
                            {market.badge_label}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {market.district}, {market.state} • <strong>{market.distance_km.toFixed(0)} km</strong> away
                        </span>
                      </div>

                      {/* Demand & Trend badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {getDemandBadge(market.demand_level)}
                        {getTrendIcon(market.trend_direction, market.trend_rate_pct)}
                        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          Freight: ~₹{market.estimated_freight_per_qtl}/q
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Pricing & Net Realization */}
                  <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Spot Price
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        ₹{market.spot_price_per_qtl.toLocaleString()}<span className="text-xs font-normal text-slate-500">/q</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600">
                        {market.price_diff_percent >= 0 ? `+${market.price_diff_percent}%` : `${market.price_diff_percent}%`} vs avg
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        Net Price (Farm-Gate)
                      </div>
                      <div className="text-lg font-black text-emerald-700">
                        ₹{market.net_price_per_qtl.toLocaleString()}<span className="text-xs font-normal text-slate-500">/q</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">
                        Total ₹{market.total_net_realization.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Opportunity Score Gauge & Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Opportunity Score
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-2xl font-black text-slate-900">
                          {market.opportunity_score.toFixed(1)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">/100</span>
                      </div>
                      <Badge variant={getScoreBadgeVariant(market.opportunity_rating)} size="sm">
                        {market.opportunity_rating}
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMarketExpand(market.market_id)}
                      className="text-xs font-semibold gap-1 shrink-0"
                    >
                      {isExpanded ? 'Hide Details' : 'Why this score?'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </Button>
                  </div>

                </div>

                {/* Key Reasons Narrative Banner */}
                <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{market.summary_explanation}</span>
                  </div>
                </div>

                {/* Expanded Multi-Factor Breakdown & Key Reasons */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200/80 bg-white space-y-5 animate-fadeIn">
                    
                    {/* Key Decision Reasons */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Key Reasons for Opportunity Ranking:
                      </h5>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {market.key_reasons.map((reason, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Transparent 5-Factor Score Decomposition */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-blue-600" />
                          Transparent Factor Scoring Breakdown:
                        </h5>
                        <span className="text-[11px] text-slate-400">
                          Weighted Contribution to Overall Score
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(market.factor_breakdown).map(([key, f]) => (
                          <div
                            key={key}
                            className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/70 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">{f.factor_name}</span>
                              <span className="font-extrabold text-emerald-700">{f.score.toFixed(0)}/100</span>
                            </div>
                            {/* Score progress bar */}
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Weight: {f.weight_percentage}%</span>
                              <span className="font-semibold text-slate-700">+{f.weighted_score.toFixed(1)} pts</span>
                            </div>
                            <p className="text-[11px] text-slate-600 pt-1 leading-snug">
                              {f.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/60 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          Full Lot Revenue Breakdown ({quantityQuintals} Quintals)
                        </div>
                        <div className="text-xs text-emerald-700">
                          Gross Value: ₹{market.total_gross_value.toLocaleString()} | Road Freight: -₹{market.total_freight_cost.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Net Farm-Gate Payout
                        </div>
                        <div className="text-xl font-black text-emerald-800">
                          ₹{market.total_net_realization.toLocaleString()}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Multi-Market Comparison Table */}
      {activeTab === 'comparison' && data && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cross-Mandi Arbitrage & Net Return Comparison
            </h4>
            <span className="text-xs text-slate-500">
              Evaluated for <strong>{quantityQuintals} Quintals</strong> from <strong>{farmerDistrict}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank & Market</th>
                  <th className="py-3 px-3">Distance</th>
                  <th className="py-3 px-3">Spot Rate</th>
                  <th className="py-3 px-3">Freight / Qtl</th>
                  <th className="py-3 px-3">Net Farm-Gate</th>
                  <th className="py-3 px-3">Demand</th>
                  <th className="py-3 px-3">7d Trend</th>
                  <th className="py-3 px-3">Total Net Payout</th>
                  <th className="py-3 px-4 text-right">Opportunity Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {data.recommendations.map((m) => (
                  <tr key={m.market_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 w-5">#{m.rank}</span>
                        <div>
                          <div className="font-bold text-slate-900">{m.market_name}</div>
                          <div className="text-[11px] text-slate-500">{m.district}, {m.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600">
                      {m.distance_km.toFixed(0)} km
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{m.spot_price_per_qtl.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      -₹{m.estimated_freight_per_qtl}
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-700">
                      ₹{m.net_price_per_qtl.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      {getDemandBadge(m.demand_level)}
                    </td>
                    <td className="py-3 px-3">
                      {getTrendIcon(m.trend_direction, m.trend_rate_pct)}
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      ₹{m.total_net_realization.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {m.opportunity_score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advisory Non-Guaranteed Disclaimer Notice */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-800">Advisory Decision Support Notice</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Market Opportunity Scores and net realization projections are statistical decision-support tools built on reported APMC arrival prices, estimated commercial vehicle road freight, and historical arrival volume. They do not constitute guaranteed financial returns or binding price commitments. Always confirm physical lot quality with mandi commission agents before transit.
          </p>
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodologyModal && data && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scaleUp max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Scoring Methodology & Weighting
                </h3>
              </div>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {data.methodology.description}
            </p>

            {/* Formula Block */}
            <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              {data.methodology.formula}
            </div>

            {/* Factor Weights Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Factor Weight Distribution:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(data.methodology.weights).map(([name, w]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                  >
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {w}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Scales */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Opportunity Rating Bands:
              </h4>
              <div className="space-y-1 text-xs">
                {Object.entries(data.methodology.rating_scale).map(([range, desc]) => (
                  <div key={range} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                    <span className="font-bold text-slate-900 shrink-0 w-16">{range}:</span>
                    <span className="text-slate-600">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowMethodologyModal(false)}
                className="w-full text-xs font-bold"
              >
                Understood, Return to Recommendations
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
