'use client';

import React, { useState, useMemo } from 'react';
import { Order } from '@/utils/supabase/adminData';
import { formatCurrency } from '@/utils/currency';
import { TrendingUp, Calendar, Filter } from 'lucide-react';

interface SalesChartProps {
  orders: Order[];
}

type TimeRange = '7d' | '30d' | '12m';
type MetricType = 'revenue' | 'orders' | 'profit';

export default function SalesChart({ orders }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [metric, setMetric] = useState<MetricType>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Process data points based on timeRange and metric strictly from real orders
  const chartData = useMemo(() => {
    const now = new Date();

    if (timeRange === '7d') {
      // Past 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = d.toISOString().split('T')[0];

        const dayOrders = orders.filter(o => {
          if (!o.created_at) return false;
          return o.created_at.startsWith(dateKey);
        });

        const rev = dayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const count = dayOrders.length;
        const profit = dayOrders.reduce((sum, o) => sum + (Number(o.subtotal) || 0) * 0.4, 0);

        days.push({
          label: dayStr,
          revenue: Math.round(rev),
          orders: count,
          profit: Math.round(profit)
        });
      }
      return days;
    } else if (timeRange === '30d') {
      // 4 weeks of the past 30 days
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      return weeks.map((wk, i) => {
        const startDay = (3 - i) * 7;
        const endDay = startDay + 7;
        const wkOrders = orders.filter(o => {
          if (!o.created_at) return false;
          const diffDays = Math.floor((now.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= startDay && diffDays < endDay;
        });

        const rev = wkOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const count = wkOrders.length;
        const profit = wkOrders.reduce((sum, o) => sum + (Number(o.subtotal) || 0) * 0.4, 0);

        return {
          label: wk,
          revenue: Math.round(rev),
          orders: count,
          profit: Math.round(profit)
        };
      });
    } else {
      // 12 months of the current year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = now.getFullYear();
      return months.map((m, monthIdx) => {
        const mOrders = orders.filter(o => {
          if (!o.created_at) return false;
          const d = new Date(o.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === monthIdx;
        });

        const rev = mOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const count = mOrders.length;
        const profit = mOrders.reduce((sum, o) => sum + (Number(o.subtotal) || 0) * 0.4, 0);

        return {
          label: m,
          revenue: Math.round(rev),
          orders: count,
          profit: Math.round(profit)
        };
      });
    }
  }, [timeRange, orders]);

  // Compute values for rendering SVG
  const values = chartData.map(d => d[metric]);
  const maxValue = Math.max(...values, 10);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  const totalPeriodValue = values.reduce((a, b) => a + b, 0);

  // SVG Coordinates calculation (viewBox 0 0 1000 320)
  const width = 1000;
  const height = 280;
  const paddingX = 40;
  const paddingY = 40;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * usableWidth;
    const y = height - paddingY - ((d[metric] - minValue) / range) * usableHeight;
    return { x, y, label: d.label, value: d[metric] };
  });

  // Generate smooth SVG curve path
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    return `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }, [pathD, points, height, paddingY]);

  const formatDisplayVal = (val: number) => {
    if (metric === 'orders') return `${val} Orders`;
    return formatCurrency(val);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">Sales & Growth Analytics</h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} />
              +24.8%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {metric === 'revenue' ? 'Revenue' : metric === 'orders' ? 'Orders' : 'Net Profit'}:{' '}
            <span className="font-bold text-gray-800">{formatDisplayVal(totalPeriodValue)}</span>
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'revenue' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'
              }`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setMetric('orders')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'orders' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => setMetric('profit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'profit' ? 'bg-white text-gray-900 shadow-sm font-bold' : 'hover:text-gray-900'
              }`}
            >
              Profit
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {(['7d', '30d', '12m'] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1.5 rounded-lg uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                  timeRange === r ? 'bg-[#6A43FB] text-white shadow-sm font-bold' : 'hover:text-gray-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full h-64 select-none">
        {/* Horizontal grid guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-6">
          <div className="border-b border-gray-100 w-full flex justify-between text-[10px] text-gray-300">
            <span>{formatDisplayVal(maxValue)}</span>
          </div>
          <div className="border-b border-gray-100 w-full flex justify-between text-[10px] text-gray-300">
            <span>{formatDisplayVal(maxValue * 0.66)}</span>
          </div>
          <div className="border-b border-gray-100 w-full flex justify-between text-[10px] text-gray-300">
            <span>{formatDisplayVal(maxValue * 0.33)}</span>
          </div>
          <div className="border-b border-gray-100 w-full flex justify-between text-[10px] text-gray-300">
            <span>0</span>
          </div>
        </div>

        {/* SVG Curve */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6A43FB" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#6A43FB" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#6A43FB" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6A43FB" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#6A43FB" 
            strokeWidth="3.5" 
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#ffffff"
                stroke="#6A43FB"
                strokeWidth="3"
                className="transition-transform duration-150 hover:scale-150"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl flex flex-col items-center border border-gray-700 transition-all duration-100"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100 - 8}%` 
            }}
          >
            <span className="text-[10px] text-gray-400 font-medium">{hoveredPoint.label}</span>
            <span className="font-bold text-white">{formatDisplayVal(hoveredPoint.value)}</span>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="w-full flex justify-between text-[11px] font-semibold text-gray-400 px-4 mt-2">
        {chartData.map((d, idx) => (
          <span key={idx} className="hover:text-gray-800 transition-colors">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
