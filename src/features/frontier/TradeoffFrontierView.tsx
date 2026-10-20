import React, { useState } from 'react';
import type { ScenarioConfig } from '../../domain/types.ts';
import { simulateWorld } from '../../simulation/simulator.ts';
import { TrendingUp } from 'lucide-react';

interface TradeoffFrontierViewProps {
  scenario: ScenarioConfig;
}

export const TradeoffFrontierView: React.FC<TradeoffFrontierViewProps> = ({ scenario }) => {
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Evaluate a grid of safety stock buffers across both FIFO and FEFO
  const safetyStockGrid = [0, 2, 5, 8, 12, 15, 20];
  const evaluatedPoints: {
    issuing: 'FIFO' | 'FEFO';
    safetyStock: number;
    wasteFraction: number;
    fillRate: number;
    profitPaise: number;
    wasteUnits: number;
    lostUnits: number;
  }[] = [];

  for (const ss of safetyStockGrid) {
    const customCfg: ScenarioConfig = { ...scenario, safetyUnits: ss };
    const fifoRes = simulateWorld(customCfg, 'FIFO', 'BASE_STOCK');
    const fefoRes = simulateWorld(customCfg, 'FEFO', 'BASE_STOCK');

    evaluatedPoints.push({
      issuing: 'FIFO',
      safetyStock: ss,
      wasteFraction: fifoRes.wasteFraction,
      fillRate: fifoRes.unitFillRate,
      profitPaise: fifoRes.netProfitPaise,
      wasteUnits: fifoRes.totalWasteUnits,
      lostUnits: fifoRes.totalLostUnits
    });

    evaluatedPoints.push({
      issuing: 'FEFO',
      safetyStock: ss,
      wasteFraction: fefoRes.wasteFraction,
      fillRate: fefoRes.unitFillRate,
      profitPaise: fefoRes.netProfitPaise,
      wasteUnits: fefoRes.totalWasteUnits,
      lostUnits: fefoRes.totalLostUnits
    });
  }

  // Find Non-Dominated (Pareto) points:
  // A point p is non-dominated if no other point has (strictly lower waste AND higher/equal fill rate) OR (strictly higher fill rate AND lower/equal waste)
  const paretoPoints = evaluatedPoints.filter(p => {
    return !evaluatedPoints.some(other => {
      const betterWaste = other.wasteFraction < p.wasteFraction;
      const equalWaste = other.wasteFraction === p.wasteFraction;
      const betterFill = other.fillRate > p.fillRate;
      const equalFill = other.fillRate === p.fillRate;

      return (betterWaste && (betterFill || equalFill)) || (betterFill && (betterWaste || equalWaste));
    });
  });

  // SVG dimensions
  const width = 680;
  const height = 340;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  const scaleX = (waste: number) => padding.left + (Math.min(0.5, waste) / 0.5) * (width - padding.left - padding.right);
  const scaleY = (fill: number) => (height - padding.bottom) - ((Math.max(0.5, Math.min(1.0, fill)) - 0.5) / 0.5) * (height - padding.top - padding.bottom);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8E0D2] pb-4">
        <h2 className="text-base font-bold text-[#352642] flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#386947]" />
          <span>Waste Fraction vs. Unit Fill Rate Trade-off Frontier</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Evaluates safety stock variations under Base-Stock replenishment. Highlights non-dominated Pareto configurations trading acceptable fill rate against minimal expired waste.
        </p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E8E0D2] pb-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#352642]">
              <span className="h-3 w-3 rounded-full bg-[#352642]"></span> FIFO Issuing
            </span>
            <span className="flex items-center gap-1.5 text-[#386947]">
              <span className="h-3 w-3 rounded-full bg-[#386947]"></span> FEFO Issuing
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 font-bold">
              <span className="h-3 w-3 rounded-full border-2 border-amber-600 bg-amber-100"></span> Non-Dominated (Pareto)
            </span>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {evaluatedPoints.length} evaluated configurations
          </span>
        </div>

        {/* SVG Scatter Plot */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none bg-[#FDFBF7] rounded-lg border border-[#E8E0D2]">
            {/* Grid lines */}
            {[0.6, 0.7, 0.8, 0.9, 1.0].map((fill) => {
              const y = scaleY(fill);
              return (
                <g key={fill}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E8E0D2" strokeDasharray="3,3" />
                  <text x={padding.left - 8} y={y + 3} fill="#7A6888" fontSize="9" textAnchor="end" fontFamily="monospace">
                    {(fill * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {[0.0, 0.1, 0.2, 0.3, 0.4, 0.5].map((waste) => {
              const x = scaleX(waste);
              return (
                <g key={waste}>
                  <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="#E8E0D2" strokeDasharray="3,3" />
                  <text x={x} y={height - padding.bottom + 16} fill="#7A6888" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    {(waste * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#352642" strokeWidth="1.5" />
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#352642" strokeWidth="1.5" />

            <text x={width / 2} y={height - 8} fill="#352642" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              Waste Fraction (Expired Units / Inflow Units)
            </text>
            <text x={-height / 2} y="16" fill="#352642" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold" transform="rotate(-90)">
              Unit Fill Rate (Fulfilled / Requested)
            </text>

            {/* Render evaluated points */}
            {evaluatedPoints.map((p, idx) => {
              const cx = scaleX(p.wasteFraction);
              const cy = scaleY(p.fillRate);
              const isPareto = paretoPoints.includes(p);
              const isFefo = p.issuing === 'FEFO';

              return (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)}>
                  {isPareto && (
                    <circle cx={cx} cy={cy} r="9" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="2,2" />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isPareto ? 5.5 : 4.5}
                    fill={isFefo ? '#386947' : '#352642'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-transform hover:scale-125"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hovered Tooltip Card */}
        {hoveredPoint && (
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#D5C9B5] font-mono text-xs flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-700">
            <span>Policy: <strong className="text-[#352642]">{hoveredPoint.issuing}</strong></span>
            <span>Safety Stock: <strong className="text-[#352642]">{hoveredPoint.safetyStock} units</strong></span>
            <span>Waste Fraction: <strong className="text-rose-700">{(hoveredPoint.wasteFraction * 100).toFixed(1)}%</strong> ({hoveredPoint.wasteUnits}u)</span>
            <span>Fill Rate: <strong className="text-[#386947]">{(hoveredPoint.fillRate * 100).toFixed(1)}%</strong></span>
            <span>Lost Demand: <strong>{hoveredPoint.lostUnits} units</strong></span>
            <span>Simulated Profit: <strong>₹{(hoveredPoint.profitPaise / 100).toFixed(0)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
