import React, { useState } from 'react';
import {
  TrendingUp,
  LineChart as LineChartIcon,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Eye,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { HISTORICAL_PRICE_SERIES_WHEAT, MarketTrendPoint } from '../../data/marketIntelligenceData';
import { Badge } from '../common/Badge';

export const PriceTrendAnalytics: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('Wheat (Sharbati)');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '1y'>('30d');
  const [showMA7, setShowMA7] = useState(true);
  const [showMA30, setShowMA30] = useState(true);
  const [showMSP, setShowMSP] = useState(true);
  const [showIndoreCurve, setShowIndoreCurve] = useState(true);
  const [showKhannaCurve, setShowKhannaCurve] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const data: MarketTrendPoint[] = HISTORICAL_PRICE_SERIES_WHEAT;

  // Chart bounds
  const minPrice = 2400; // includes MSP 2425
  const maxPrice = 3050;
  const priceRange = maxPrice - minPrice;

  const chartWidth = 760;
  const chartHeight = 260;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };

  const getX = (index: number) => {
    const usableWidth = chartWidth - padding.left - padding.right;
    return padding.left + (index / (data.length - 1)) * usableWidth;
  };

  const getY = (price: number) => {
    const usableHeight = chartHeight - padding.top - padding.bottom;
    return padding.top + usableHeight - ((price - minPrice) / priceRange) * usableHeight;
  };

  // Generate SVG paths
  const generatePath = (getter: (d: MarketTrendPoint) => number) => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(getter(d))}`)
      .join(' ');
  };

  const sehorePath = generatePath((d) => d.sehorePrice);
  const indorePath = generatePath((d) => d.indorePrice);
  const khannaPath = generatePath((d) => d.khannaPrice);
  const ma7Path = generatePath((d) => d.ma7);
  const ma30Path = generatePath((d) => d.ma30);
  const mspY = getY(2425);

  const hoveredData = hoveredPointIndex !== null ? data[hoveredPointIndex] : data[data.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      
      {/* Top Header & Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <LineChartIcon className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
              Commodity Price Trend & Moving Average Analytics
            </h3>
            <Badge variant="blue" size="sm">
              Terminal Analytics
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze historical momentum, 7-day / 30-day moving averages, and cross-mandi spreads against the official MSP floor.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['7d', '30d', '3m', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all uppercase cursor-pointer ${
                timeRange === r
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles & Current Hover Value Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 font-bold text-emerald-800 cursor-pointer">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span>Sehore APMC (Primary)</span>
          </label>

          <label className="flex items-center gap-1.5 text-blue-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showIndoreCurve}
              onChange={(e) => setShowIndoreCurve(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="w-3 h-1 bg-blue-600"></span>
            <span>Indore Terminal</span>
          </label>

          <label className="flex items-center gap-1.5 text-purple-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showKhannaCurve}
              onChange={(e) => setShowKhannaCurve(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="w-3 h-1 bg-purple-600"></span>
            <span>Khanna Mandi</span>
          </label>

          <label className="flex items-center gap-1.5 text-amber-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showMA7}
              onChange={(e) => setShowMA7(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="w-3 h-1 bg-amber-500 border-dashed border-amber-600"></span>
            <span>7D MA</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={showMSP}
              onChange={(e) => setShowMSP(e.target.checked)}
              className="rounded text-slate-600 focus:ring-slate-500"
            />
            <span className="w-3 h-1 bg-red-400"></span>
            <span>Govt MSP Floor (₹2,425)</span>
          </label>
        </div>

        {/* Hover Snapshot Display */}
        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-400 font-sans">{hoveredData.label}:</span>
          <span className="font-extrabold text-slate-900">
            Sehore: ₹{hoveredData.sehorePrice}
          </span>
          <span className="text-blue-700 font-bold">
            Indore: ₹{hoveredData.indorePrice}
          </span>
          <span className="text-emerald-700 font-bold">
            Vol: {hoveredData.volume}q
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-w-[620px]"
          onMouseLeave={() => setHoveredPointIndex(null)}
        >
          {/* Grid lines */}
          {[2500, 2650, 2800, 2950].map((p) => {
            const y = getY(p);
            return (
              <g key={p}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
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

          {/* MSP Benchmark Floor Line */}
          {showMSP && (
            <g>
              <line
                x1={padding.left}
                y1={mspY}
                x2={chartWidth - padding.right}
                y2={mspY}
                stroke="#ef4444"
                strokeDasharray="6 4"
                strokeWidth="1.5"
              />
              <text
                x={chartWidth - padding.right}
                y={mspY - 6}
                textAnchor="end"
                className="text-[10px] font-bold fill-red-600"
              >
                Official MSP Floor: ₹2,425 / q
              </text>
            </g>
          )}

          {/* 7D Moving Average Line */}
          {showMA7 && (
            <path
              d={ma7Path}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
            />
          )}

          {/* Indore Curve */}
          {showIndoreCurve && (
            <path
              d={indorePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeOpacity="0.85"
            />
          )}

          {/* Khanna Curve */}
          {showKhannaCurve && (
            <path
              d={khannaPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeOpacity="0.8"
            />
          )}

          {/* Primary Sehore Curve (Thick with Gradient Fill) */}
          <defs>
            <linearGradient id="sehoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={`${sehorePath} L ${getX(data.length - 1)},${chartHeight - padding.bottom} L ${getX(0)},${chartHeight - padding.bottom} Z`}
            fill="url(#sehoreGradient)"
          />
          <path
            d={sehorePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data Points on Primary Curve & Interactive Columns */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.sehorePrice);
            const isHovered = hoveredPointIndex === i;

            return (
              <g key={d.date}>
                {/* Vertical transparent hover trigger strip */}
                <rect
                  x={cx - 20}
                  y={padding.top}
                  width="40"
                  height={chartHeight - padding.top - padding.bottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(i)}
                />

                {/* X-axis date label */}
                <text
                  x={cx}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-sans ${
                    isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {d.label}
                </text>

                {/* Crosshair Line if hovered */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={chartHeight - padding.bottom}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#10b981' : '#ffffff'}
                  stroke="#10b981"
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
