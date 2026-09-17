import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CropAnalyticsProfile, ForecastPoint } from '../../data/cropAnalyticsData';
import { Badge } from '../common/Badge';

interface PriceForecastChartProps {
  data: CropAnalyticsProfile;
}

export const PriceForecastChart: React.FC<PriceForecastChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<'all' | '14d' | '30d'>('all');
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);

  const series = data.forecastSeries;

  // Chart dimensions & math
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 30, right: 40, bottom: 40, left: 60 };

  const allPrices: number[] = [];
  series.forEach((p) => {
    if (p.actualPrice) allPrices.push(p.actualPrice);
    if (p.forecastPrice) allPrices.push(p.forecastPrice);
    if (p.lowerBound) allPrices.push(p.lowerBound);
    if (p.upperBound) allPrices.push(p.upperBound);
  });

  const minVal = Math.floor(Math.min(...allPrices) * 0.96);
  const maxVal = Math.ceil(Math.max(...allPrices) * 1.04);
  const range = maxVal - minVal || 1;

  const getX = (index: number) => {
    const usableWidth = chartWidth - padding.left - padding.right;
    return padding.left + (index / (series.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = chartHeight - padding.top - padding.bottom;
    return padding.top + usableHeight - ((val - minVal) / range) * usableHeight;
  };

  // Separate historical vs forecast indices
  const historicalPoints = series.filter((p) => !p.isForecast);
  const forecastPoints = series.filter((p) => p.isForecast);

  // Historical Path
  const historicalPath = historicalPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(p.actualPrice || 0)}`)
    .join(' ');

  // Connect last historical point to first forecast point
  const lastHistoricalIndex = historicalPoints.length - 1;
  const lastHistPoint = series[lastHistoricalIndex];

  // Forecast Path
  const forecastPath = [
    `M ${getX(lastHistoricalIndex)},${getY(lastHistPoint.actualPrice || 0)}`,
    ...forecastPoints.map((p, idx) => {
      const globalIdx = lastHistoricalIndex + 1 + idx;
      return `L ${getX(globalIdx)},${getY(p.forecastPrice || 0)}`;
    }),
  ].join(' ');

  // Upper Bound & Lower Bound Confidence Cone Polygon
  const upperConePoints = [
    `M ${getX(lastHistoricalIndex)},${getY(lastHistPoint.actualPrice || 0)}`,
    ...forecastPoints.map((p, idx) => {
      const globalIdx = lastHistoricalIndex + 1 + idx;
      return `L ${getX(globalIdx)},${getY(p.upperBound || p.forecastPrice || 0)}`;
    }),
  ];

  const lowerConePoints = [
    ...forecastPoints
      .slice()
      .reverse()
      .map((p, idx) => {
        const globalIdx = series.length - 1 - idx;
        return `L ${getX(globalIdx)},${getY(p.lowerBound || p.forecastPrice || 0)}`;
      }),
    `L ${getX(lastHistoricalIndex)},${getY(lastHistPoint.actualPrice || 0)} Z`,
  ];

  const confidencePolygonPath = `${upperConePoints.join(' ')} ${lowerConePoints.join(' ')}`;

  // Default active point to the end of forecast
  const activeDataPoint: ForecastPoint =
    hoveredIndex !== null ? series[hoveredIndex] : series[series.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Probabilistic Price Forecast & Confidence Band
            </h3>
            <Badge variant="purple" size="sm">
              30-Day Predictive Model
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Machine learning forecast trained on 10-year APMC seasonality, institutional buyer order books, and climatic yield indicators.
          </p>
        </div>

        {/* Confidence Band Toggle & Legend */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 font-bold text-purple-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showConfidenceBand}
              onChange={(e) => setShowConfidenceBand(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Show Confidence Envelope (85-94%)</span>
          </label>
        </div>
      </div>

      {/* Forecast Disclaimer Pill */}
      <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-purple-900">
        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-bold flex items-center gap-2">
            <span>Simulated Predictive AI Forecast (Python Prophet / XGBoost Schema)</span>
            <span className="text-[10px] font-mono bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
              Model Acc: 91.4%
            </span>
          </div>
          <p className="text-[11px] text-purple-700 mt-0.5">
            Dashed trajectory indicates <strong>predicted future values</strong>. Shaded purple area represents the statistical confidence band based on market volatility.
          </p>
        </div>
      </div>

      {/* Live Hover Snapshot Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-sans font-medium">{activeDataPoint.label}:</span>
          
          {activeDataPoint.isForecast ? (
            <>
              <span className="font-bold text-purple-700 font-mono text-sm">
                Predicted: ₹{activeDataPoint.forecastPrice?.toLocaleString()} / q
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Range: ₹{activeDataPoint.lowerBound} - ₹{activeDataPoint.upperBound}
              </span>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {activeDataPoint.confidenceScore}% Model Confidence
              </span>
            </>
          ) : (
            <>
              <span className="font-bold text-emerald-800 font-mono text-sm">
                Actual Spot: ₹{activeDataPoint.actualPrice?.toLocaleString()} / q
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Verified Agmarknet Quote
              </span>
            </>
          )}
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="w-3 h-0.5 bg-emerald-600"></span>
            <span>Historical Actuals</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-700">
            <span className="w-3 h-0.5 bg-purple-600 border-dashed border-purple-700"></span>
            <span>AI Projection</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[650px]"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Y-Axis Grid Lines */}
          {[minVal, minVal + Math.round(range * 0.33), minVal + Math.round(range * 0.66), maxVal].map((p) => {
            const y = getY(p);
            return (
              <g key={p}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 font-semibold"
                >
                  ₹{p}
                </text>
              </g>
            );
          })}

          {/* Division Line (Today / Prediction boundary) */}
          <line
            x1={getX(lastHistoricalIndex)}
            y1={padding.top}
            x2={getX(lastHistoricalIndex)}
            y2={chartHeight - padding.bottom}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth="1.5"
          />
          <text
            x={getX(lastHistoricalIndex)}
            y={padding.top - 10}
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-700 uppercase"
          >
            Today (Forecast Threshold)
          </text>

          {/* Shaded Confidence Cone (Future Prediction Envelope) */}
          {showConfidenceBand && (
            <defs>
              <linearGradient id="forecastConeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          )}
          {showConfidenceBand && (
            <path
              d={confidencePolygonPath}
              fill="url(#forecastConeGradient)"
              stroke="#c084fc"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Historical Actual Price Curve (Solid Emerald) */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Forecast Price Curve (Dashed Purple) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#9333ea"
            strokeWidth="3"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Data Points & Hover Targets */}
          {series.map((p, i) => {
            const cx = getX(i);
            const price = p.isForecast ? (p.forecastPrice || 0) : (p.actualPrice || 0);
            const cy = getY(price);
            const isHovered = hoveredIndex === i;

            return (
              <g key={p.date}>
                {/* Invisible Hover Rect */}
                <rect
                  x={cx - 16}
                  y={padding.top}
                  width="32"
                  height={chartHeight - padding.top - padding.bottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {/* X-axis label */}
                <text
                  x={cx}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className={`text-[10px] ${
                    isHovered
                      ? 'fill-slate-900 font-bold'
                      : p.isForecast
                      ? 'fill-purple-700 font-semibold'
                      : 'fill-slate-400'
                  }`}
                >
                  {p.label}
                </text>

                {/* Vertical Crosshair Line if hovered */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={chartHeight - padding.bottom}
                    stroke={p.isForecast ? '#9333ea' : '#10b981'}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : p.isForecast ? 4 : 4.5}
                  fill={isHovered ? (p.isForecast ? '#9333ea' : '#10b981') : '#ffffff'}
                  stroke={p.isForecast ? '#9333ea' : '#10b981'}
                  strokeWidth="2.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

    </div>
  );
};
