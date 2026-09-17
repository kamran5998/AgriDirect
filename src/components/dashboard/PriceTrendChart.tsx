import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface PriceDataPoint {
  date: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volume: number; // in Quintals
  msp: number;
}

const HISTORICAL_CHART_DATA: Record<string, Record<string, PriceDataPoint[]>> = {
  Wheat: {
    '7D': [
      { date: '13 Aug', price: 2785, minPrice: 2720, maxPrice: 2810, volume: 4200, msp: 2425 },
      { date: '14 Aug', price: 2800, minPrice: 2740, maxPrice: 2830, volume: 4600, msp: 2425 },
      { date: '15 Aug', price: 2810, minPrice: 2750, maxPrice: 2840, volume: 3800, msp: 2425 },
      { date: '16 Aug', price: 2830, minPrice: 2760, maxPrice: 2865, volume: 5100, msp: 2425 },
      { date: '17 Aug', price: 2845, minPrice: 2780, maxPrice: 2880, volume: 4900, msp: 2425 },
      { date: '18 Aug', price: 2850, minPrice: 2790, maxPrice: 2890, volume: 5300, msp: 2425 },
      { date: '19 Aug (Today)', price: 2860, minPrice: 2800, maxPrice: 2910, volume: 5800, msp: 2425 },
    ],
    '30D': [
      { date: '21 Jul', price: 2640, minPrice: 2580, maxPrice: 2680, volume: 3800, msp: 2425 },
      { date: '26 Jul', price: 2680, minPrice: 2610, maxPrice: 2710, volume: 4100, msp: 2425 },
      { date: '31 Jul', price: 2710, minPrice: 2650, maxPrice: 2750, volume: 4400, msp: 2425 },
      { date: '05 Aug', price: 2750, minPrice: 2690, maxPrice: 2790, volume: 4700, msp: 2425 },
      { date: '10 Aug', price: 2780, minPrice: 2710, maxPrice: 2820, volume: 5000, msp: 2425 },
      { date: '15 Aug', price: 2820, minPrice: 2750, maxPrice: 2860, volume: 5200, msp: 2425 },
      { date: '19 Aug', price: 2860, minPrice: 2800, maxPrice: 2910, volume: 5800, msp: 2425 },
    ],
    '3M': [
      { date: 'May', price: 2520, minPrice: 2460, maxPrice: 2580, volume: 6800, msp: 2425 },
      { date: 'Jun', price: 2590, minPrice: 2520, maxPrice: 2640, volume: 5400, msp: 2425 },
      { date: 'Jul', price: 2680, minPrice: 2610, maxPrice: 2740, volume: 4600, msp: 2425 },
      { date: 'Aug', price: 2860, minPrice: 2800, maxPrice: 2910, volume: 5800, msp: 2425 },
    ],
  },
  Soybean: {
    '7D': [
      { date: '13 Aug', price: 4610, minPrice: 4500, maxPrice: 4680, volume: 3200, msp: 4892 },
      { date: '14 Aug', price: 4630, minPrice: 4520, maxPrice: 4700, volume: 3400, msp: 4892 },
      { date: '15 Aug', price: 4640, minPrice: 4540, maxPrice: 4710, volume: 3100, msp: 4892 },
      { date: '16 Aug', price: 4660, minPrice: 4550, maxPrice: 4730, volume: 3600, msp: 4892 },
      { date: '17 Aug', price: 4675, minPrice: 4570, maxPrice: 4750, volume: 3800, msp: 4892 },
      { date: '18 Aug', price: 4670, minPrice: 4560, maxPrice: 4740, volume: 3500, msp: 4892 },
      { date: '19 Aug (Today)', price: 4680, minPrice: 4580, maxPrice: 4760, volume: 3900, msp: 4892 },
    ],
    '30D': [
      { date: '21 Jul', price: 4480, minPrice: 4380, maxPrice: 4550, volume: 2900, msp: 4892 },
      { date: '31 Jul', price: 4530, minPrice: 4420, maxPrice: 4600, volume: 3100, msp: 4892 },
      { date: '10 Aug', price: 4620, minPrice: 4510, maxPrice: 4690, volume: 3400, msp: 4892 },
      { date: '19 Aug', price: 4680, minPrice: 4580, maxPrice: 4760, volume: 3900, msp: 4892 },
    ],
    '3M': [
      { date: 'May', price: 4390, minPrice: 4300, maxPrice: 4460, volume: 4100, msp: 4892 },
      { date: 'Jun', price: 4450, minPrice: 4360, maxPrice: 4520, volume: 3500, msp: 4892 },
      { date: 'Jul', price: 4530, minPrice: 4420, maxPrice: 4600, volume: 3100, msp: 4892 },
      { date: 'Aug', price: 4680, minPrice: 4580, maxPrice: 4760, volume: 3900, msp: 4892 },
    ],
  },
  'Basmati Rice': {
    '7D': [
      { date: '13 Aug', price: 3790, minPrice: 3680, maxPrice: 3880, volume: 2100, msp: 3200 },
      { date: '14 Aug', price: 3810, minPrice: 3700, maxPrice: 3900, volume: 2300, msp: 3200 },
      { date: '15 Aug', price: 3820, minPrice: 3710, maxPrice: 3920, volume: 2000, msp: 3200 },
      { date: '16 Aug', price: 3835, minPrice: 3730, maxPrice: 3940, volume: 2400, msp: 3200 },
      { date: '17 Aug', price: 3840, minPrice: 3740, maxPrice: 3950, volume: 2500, msp: 3200 },
      { date: '18 Aug', price: 3845, minPrice: 3750, maxPrice: 3960, volume: 2400, msp: 3200 },
      { date: '19 Aug (Today)', price: 3850, minPrice: 3750, maxPrice: 3980, volume: 2700, msp: 3200 },
    ],
    '30D': [
      { date: '21 Jul', price: 3620, minPrice: 3500, maxPrice: 3700, volume: 1800, msp: 3200 },
      { date: '31 Jul', price: 3710, minPrice: 3600, maxPrice: 3800, volume: 2100, msp: 3200 },
      { date: '10 Aug', price: 3790, minPrice: 3680, maxPrice: 3890, volume: 2300, msp: 3200 },
      { date: '19 Aug', price: 3850, minPrice: 3750, maxPrice: 3980, volume: 2700, msp: 3200 },
    ],
    '3M': [
      { date: 'May', price: 3450, minPrice: 3350, maxPrice: 3550, volume: 2400, msp: 3200 },
      { date: 'Jun', price: 3550, minPrice: 3440, maxPrice: 3650, volume: 2100, msp: 3200 },
      { date: 'Jul', price: 3710, minPrice: 3600, maxPrice: 3800, volume: 2100, msp: 3200 },
      { date: 'Aug', price: 3850, minPrice: 3750, maxPrice: 3980, volume: 2700, msp: 3200 },
    ],
  },
  Cotton: {
    '7D': [
      { date: '13 Aug', price: 7120, minPrice: 6950, maxPrice: 7250, volume: 1400, msp: 7121 },
      { date: '14 Aug', price: 7150, minPrice: 6980, maxPrice: 7280, volume: 1550, msp: 7121 },
      { date: '15 Aug', price: 7170, minPrice: 7000, maxPrice: 7300, volume: 1300, msp: 7121 },
      { date: '16 Aug', price: 7190, minPrice: 7020, maxPrice: 7320, volume: 1600, msp: 7121 },
      { date: '17 Aug', price: 7210, minPrice: 7040, maxPrice: 7340, volume: 1700, msp: 7121 },
      { date: '18 Aug', price: 7230, minPrice: 7060, maxPrice: 7360, volume: 1650, msp: 7121 },
      { date: '19 Aug (Today)', price: 7240, minPrice: 7080, maxPrice: 7380, volume: 1800, msp: 7121 },
    ],
    '30D': [
      { date: '21 Jul', price: 6940, minPrice: 6800, maxPrice: 7050, volume: 1200, msp: 7121 },
      { date: '31 Jul', price: 7050, minPrice: 6900, maxPrice: 7160, volume: 1400, msp: 7121 },
      { date: '10 Aug', price: 7140, minPrice: 6970, maxPrice: 7260, volume: 1550, msp: 7121 },
      { date: '19 Aug', price: 7240, minPrice: 7080, maxPrice: 7380, volume: 1800, msp: 7121 },
    ],
    '3M': [
      { date: 'May', price: 6820, minPrice: 6680, maxPrice: 6940, volume: 1600, msp: 7121 },
      { date: 'Jun', price: 6910, minPrice: 6760, maxPrice: 7020, volume: 1400, msp: 7121 },
      { date: 'Jul', price: 7050, minPrice: 6900, maxPrice: 7160, volume: 1400, msp: 7121 },
      { date: 'Aug', price: 7240, minPrice: 7080, maxPrice: 7380, volume: 1800, msp: 7121 },
    ],
  },
  Mustard: {
    '7D': [
      { date: '13 Aug', price: 5410, minPrice: 5300, maxPrice: 5500, volume: 2200, msp: 5650 },
      { date: '14 Aug', price: 5430, minPrice: 5320, maxPrice: 5520, volume: 2400, msp: 5650 },
      { date: '15 Aug', price: 5440, minPrice: 5330, maxPrice: 5530, volume: 2100, msp: 5650 },
      { date: '16 Aug', price: 5460, minPrice: 5350, maxPrice: 5550, volume: 2500, msp: 5650 },
      { date: '17 Aug', price: 5475, minPrice: 5360, maxPrice: 5570, volume: 2600, msp: 5650 },
      { date: '18 Aug', price: 5480, minPrice: 5370, maxPrice: 5580, volume: 2450, msp: 5650 },
      { date: '19 Aug (Today)', price: 5490, minPrice: 5380, maxPrice: 5600, volume: 2800, msp: 5650 },
    ],
    '30D': [
      { date: '21 Jul', price: 5280, minPrice: 5180, maxPrice: 5360, volume: 1900, msp: 5650 },
      { date: '31 Jul', price: 5360, minPrice: 5250, maxPrice: 5440, volume: 2150, msp: 5650 },
      { date: '10 Aug', price: 5420, minPrice: 5310, maxPrice: 5510, volume: 2350, msp: 5650 },
      { date: '19 Aug', price: 5490, minPrice: 5380, maxPrice: 5600, volume: 2800, msp: 5650 },
    ],
    '3M': [
      { date: 'May', price: 5120, minPrice: 5020, maxPrice: 5200, volume: 2600, msp: 5650 },
      { date: 'Jun', price: 5220, minPrice: 5120, maxPrice: 5300, volume: 2200, msp: 5650 },
      { date: 'Jul', price: 5360, minPrice: 5250, maxPrice: 5440, volume: 2150, msp: 5650 },
      { date: 'Aug', price: 5490, minPrice: 5380, maxPrice: 5600, volume: 2800, msp: 5650 },
    ],
  },
};

export const PriceTrendChart: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [selectedMandi, setSelectedMandi] = useState<string>('Sehore APMC Mandi');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M'>('7D');
  const [hoveredPoint, setHoveredPoint] = useState<PriceDataPoint | null>(null);

  // Get active dataset
  const activeDataset =
    HISTORICAL_CHART_DATA[selectedCrop]?.[timeRange] ||
    HISTORICAL_CHART_DATA['Wheat']['7D'];

  const currentPrice = activeDataset[activeDataset.length - 1].price;
  const startPrice = activeDataset[0].price;
  const changeAmt = currentPrice - startPrice;
  const changePct = ((changeAmt / startPrice) * 100).toFixed(2);
  const mspBenchmark = activeDataset[0].msp;
  const mspDiff = currentPrice - mspBenchmark;

  // Chart mathematical bounding
  const prices = activeDataset.map((d) => d.price);
  const allValues = [...prices, mspBenchmark];
  const minVal = Math.floor(Math.min(...allValues) * 0.96);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.04);
  const valueRange = maxVal - minVal || 1;

  // Max volume for bottom volume bars
  const maxVolume = Math.max(...activeDataset.map((d) => d.volume));

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Generate coordinate points for price line
  const coordinates = activeDataset.map((d, index) => {
    const x = paddingLeft + (index / (activeDataset.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((d.price - minVal) / valueRange) * plotHeight;
    return { x, y, data: d };
  });

  const pathD = coordinates
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
    .join(' ');

  // Gradient area closed path
  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x} ${
    paddingTop + plotHeight
  } L ${coordinates[0].x} ${paddingTop + plotHeight} Z`;

  // MSP line Y position
  const mspY = paddingTop + plotHeight - ((mspBenchmark - minVal) / valueRange) * plotHeight;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      
      {/* Chart Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Price Trajectory
            </span>
            <Badge variant="emerald" size="sm">
              Live Mandi Feed
            </Badge>
          </div>
          
          <div className="flex items-baseline gap-3 mt-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
              ₹{currentPrice.toLocaleString()}
            </h2>
            <span className="text-xs font-semibold text-slate-500">/ quintal</span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{changePct}% ({timeRange})</span>
            </div>
          </div>
        </div>

        {/* Filters: Crop Selector, Market Selector, Timeframe */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Crop Selector */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {Object.keys(HISTORICAL_CHART_DATA).map((crop) => (
              <option key={crop} value={crop}>
                🌾 {crop}
              </option>
            ))}
          </select>

          {/* Market Selector */}
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="Sehore APMC Mandi">Sehore APMC (Local)</option>
            <option value="Indore Grain Market">Indore Grain Terminal (58 km)</option>
            <option value="Dewas Krishi Mandi">Dewas Krishi Mandi (36 km)</option>
            <option value="All Mandis Avg">Regional Mandis Average</option>
          </select>

          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['7D', '30D', '3M'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeRange === t
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === '7D' ? '7 Days' : t === '30D' ? '30 Days' : '3 Months'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 rounded-xl p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[320px] select-none"
        >
          <defs>
            {/* Emerald Gradient */}
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y-Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + plotHeight * ratio;
            const priceVal = Math.round(maxVal - ratio * valueRange);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="monospace"
                >
                  ₹{priceVal}
                </text>
              </g>
            );
          })}

          {/* Minimum Support Price (MSP) Benchmark Reference Line */}
          {mspY >= paddingTop && mspY <= paddingTop + plotHeight && (
            <g>
              <line
                x1={paddingLeft}
                y1={mspY}
                x2={svgWidth - paddingRight}
                y2={mspY}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={svgWidth - paddingRight - 4}
                y={mspY - 6}
                textAnchor="end"
                fontSize="10"
                fontWeight="bold"
                fill="#D97706"
              >
                Govt MSP: ₹{mspBenchmark}/q
              </text>
            </g>
          )}

          {/* Volume bars at bottom */}
          {activeDataset.map((d, idx) => {
            const x = paddingLeft + (idx / (activeDataset.length - 1)) * plotWidth;
            const barHeight = (d.volume / maxVolume) * 28;
            const barY = paddingTop + plotHeight - barHeight;
            return (
              <rect
                key={idx}
                x={x - 6}
                y={barY}
                width="12"
                height={barHeight}
                fill="#CBD5E1"
                opacity="0.6"
                rx="2"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#emeraldGradient)" />

          {/* Main Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Interactive Touch Circles */}
          {coordinates.map((coord, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={coord.x}
                cy={coord.y}
                r="4"
                fill="#FFFFFF"
                stroke="#10B981"
                strokeWidth="2.5"
              />
              {/* Invisible larger hover hit area */}
              <circle
                cx={coord.x}
                cy={coord.y}
                r="16"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(coord.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {/* X-Axis Date Labels */}
          {coordinates.map((coord, idx) => (
            <text
              key={idx}
              x={coord.x}
              y={svgHeight - 12}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#64748B"
            >
              {coord.data.date}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs font-mono z-20 pointer-events-none">
            <div className="font-bold text-emerald-400 font-sans">{hoveredPoint.date}</div>
            <div className="text-white font-bold text-sm mt-0.5">Spot Price: ₹{hoveredPoint.price}/q</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Range: ₹{hoveredPoint.minPrice} - ₹{hoveredPoint.maxPrice}</div>
            <div className="text-slate-400 text-[11px]">Arrivals: {hoveredPoint.volume.toLocaleString()} quintals</div>
          </div>
        )}
      </div>

      {/* Chart Footer Highlights */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Period High</span>
          <span className="font-extrabold text-slate-900 font-mono">₹{Math.max(...prices)} / q</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Low</span>
          <span className="font-extrabold text-slate-900 font-mono">₹{Math.min(...prices)} / q</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">MSP Premium</span>
          <span className={`font-extrabold font-mono ${mspDiff >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {mspDiff >= 0 ? `+₹${mspDiff}` : `-₹${Math.abs(mspDiff)}`} / q above MSP
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Algorithm Suggestion</span>
          <span className="font-extrabold text-emerald-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Favorable Sell Window
          </span>
        </div>
      </div>

    </div>
  );
};
