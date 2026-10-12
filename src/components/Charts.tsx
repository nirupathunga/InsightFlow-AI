import React, { useState } from 'react';

interface SentimentChartProps {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export const SentimentDonutChart: React.FC<SentimentChartProps> = ({ positive, neutral, negative, total }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  if (total === 0) {
    return <div className="h-44 flex items-center justify-center text-slate-400 text-xs font-mono">No data available</div>;
  }

  const posPct = Math.round((positive / total) * 100);
  const neuPct = Math.round((neutral / total) * 100);
  const negPct = Math.max(0, 100 - posPct - neuPct);

  // SVG circle calculations (circumference = 2 * PI * 42 = 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 10;

  const posOffset = 0;
  const posStroke = (posPct / 100) * circumference;

  const neuOffset = -posStroke;
  const neuStroke = (neuPct / 100) * circumference;

  const negOffset = -(posStroke + neuStroke);
  const negStroke = (negPct / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {posPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#059669"
              strokeWidth={hovered === 'positive' ? strokeWidth + 2 : strokeWidth}
              strokeDasharray={`${posStroke} ${circumference}`}
              strokeDashoffset={posOffset}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered('positive')}
              onMouseLeave={() => setHovered(null)}
            />
          )}
          {neuPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#d97706"
              strokeWidth={hovered === 'neutral' ? strokeWidth + 2 : strokeWidth}
              strokeDasharray={`${neuStroke} ${circumference}`}
              strokeDashoffset={neuOffset}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered('neutral')}
              onMouseLeave={() => setHovered(null)}
            />
          )}
          {negPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#dc2626"
              strokeWidth={hovered === 'negative' ? strokeWidth + 2 : strokeWidth}
              strokeDasharray={`${negStroke} ${circumference}`}
              strokeDashoffset={negOffset}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered('negative')}
              onMouseLeave={() => setHovered(null)}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">{total}</span>
          <span className="text-[11px] text-slate-500 font-medium">Entries</span>
        </div>
      </div>

      <div className="w-full sm:w-52 space-y-2 text-xs">
        <div 
          className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
            hovered === 'positive' ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200/70 hover:bg-slate-50'
          }`}
          onMouseEnter={() => setHovered('positive')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-emerald-600"></span>
            <span className="text-slate-700 font-medium">Positive</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="text-slate-900 font-semibold">{positive}</span>
            <span className="text-slate-500 text-[11px]">({posPct}%)</span>
          </div>
        </div>

        <div 
          className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
            hovered === 'neutral' ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200/70 hover:bg-slate-50'
          }`}
          onMouseEnter={() => setHovered('neutral')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-amber-600"></span>
            <span className="text-slate-700 font-medium">Neutral</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="text-slate-900 font-semibold">{neutral}</span>
            <span className="text-slate-500 text-[11px]">({neuPct}%)</span>
          </div>
        </div>

        <div 
          className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
            hovered === 'negative' ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200/70 hover:bg-slate-50'
          }`}
          onMouseEnter={() => setHovered('negative')}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[2px] bg-rose-600"></span>
            <span className="text-slate-700 font-medium">Negative</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <span className="text-slate-900 font-semibold">{negative}</span>
            <span className="text-slate-500 text-[11px]">({negPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CategoryBarChartProps {
  categories: { name: string; count: number; color?: string }[];
  total: number;
  onSelectCategory?: (cat: string) => void;
  selectedCategory?: string;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  categories,
  total,
  onSelectCategory,
  selectedCategory,
}) => {
  const maxCount = Math.max(...categories.map(c => c.count), 1);

  const getBarColor = (name: string, isSelected: boolean) => {
    if (isSelected) return 'bg-slate-900';
    switch (name) {
      case 'Fraud and Scam':
        return 'bg-rose-600';
      case 'Operational Issues':
        return 'bg-amber-600';
      case 'Customer Service':
        return 'bg-slate-600';
      case 'Product Feedback':
        return 'bg-blue-600';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-3 py-1">
      {categories.map((cat) => {
        const pct = Math.round((cat.count / (total || 1)) * 100);
        const widthPct = Math.max(3, Math.round((cat.count / maxCount) * 100));
        const isSelected = selectedCategory === cat.name;

        return (
          <div
            key={cat.name}
            className={`p-2 rounded border transition-colors cursor-pointer ${
              isSelected ? 'bg-slate-50 border-slate-400' : 'bg-white border-transparent hover:bg-slate-50'
            }`}
            onClick={() => onSelectCategory && onSelectCategory(isSelected ? 'ALL' : cat.name)}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-800 font-medium flex items-center gap-1.5">
                {cat.name}
                {isSelected && (
                  <span className="text-[10px] text-slate-500 font-mono">(active filter)</span>
                )}
              </span>
              <div className="font-mono tabular-nums text-slate-700">
                <span className="font-semibold">{cat.count}</span>
                <span className="text-slate-400 text-[11px] ml-1">({pct}%)</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-xs overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getBarColor(cat.name, isSelected)}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface PriorityBarProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export const PriorityDistributionBar: React.FC<PriorityBarProps> = ({
  critical,
  high,
  medium,
  low,
  total,
}) => {
  if (total === 0) return null;

  const critPct = Math.round((critical / total) * 100);
  const highPct = Math.round((high / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const lowPct = Math.max(0, 100 - critPct - highPct - medPct);

  return (
    <div className="space-y-2.5">
      <div className="h-2 w-full bg-slate-100 rounded-xs overflow-hidden flex">
        {critPct > 0 && (
          <div
            className="h-full bg-rose-600 transition-all duration-200"
            style={{ width: `${critPct}%` }}
            title={`Critical: ${critical} (${critPct}%)`}
          />
        )}
        {highPct > 0 && (
          <div
            className="h-full bg-amber-600 transition-all duration-200"
            style={{ width: `${highPct}%` }}
            title={`High: ${high} (${highPct}%)`}
          />
        )}
        {medPct > 0 && (
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: `${medPct}%` }}
            title={`Medium: ${medium} (${medPct}%)`}
          />
        )}
        {lowPct > 0 && (
          <div
            className="h-full bg-slate-400 transition-all duration-200"
            style={{ width: `${lowPct}%` }}
            title={`Low: ${low} (${lowPct}%)`}
          />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums text-slate-600 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-rose-600"></span>
          <span>Crit: <strong className="text-slate-900 font-semibold">{critical}</strong> <span className="text-[10px] text-slate-400">({critPct}%)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-amber-600"></span>
          <span>High: <strong className="text-slate-900 font-semibold">{high}</strong> <span className="text-[10px] text-slate-400">({highPct}%)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-blue-600"></span>
          <span>Med: <strong className="text-slate-900 font-semibold">{medium}</strong> <span className="text-[10px] text-slate-400">({medPct}%)</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-slate-400"></span>
          <span>Low: <strong className="text-slate-900 font-semibold">{low}</strong> <span className="text-[10px] text-slate-400">({lowPct}%)</span></span>
        </div>
      </div>
    </div>
  );
};
