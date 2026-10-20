import React, { useState } from 'react';
import type { ScenarioConfig, IssuingPolicy, OrderingPolicy, SimulationResult } from '../../domain/types.ts';
import { simulateWorld } from '../../simulation/simulator.ts';
import { Sliders } from 'lucide-react';

interface PolicyBenchViewProps {
  scenario: ScenarioConfig;
}

export const PolicyBenchView: React.FC<PolicyBenchViewProps> = ({ scenario }) => {
  const [issuingPolicy, setIssuingPolicy] = useState<IssuingPolicy>('FEFO');
  const [orderingPolicy, setOrderingPolicy] = useState<OrderingPolicy>('BASE_STOCK');
  const [fixedOrderQty, setFixedOrderQty] = useState<number>(scenario.fixedOrderQuantity || 15);
  const [safetyUnits, setSafetyUnits] = useState<number>(scenario.safetyUnits || 5);
  const [leadTime, setLeadTime] = useState<number>(scenario.leadTimeDays || 1);

  // Custom scenario config
  const customConfig: ScenarioConfig = {
    ...scenario,
    fixedOrderQuantity: fixedOrderQty,
    safetyUnits,
    leadTimeDays: leadTime
  };

  const result: SimulationResult = simulateWorld(customConfig, issuingPolicy, orderingPolicy, 'CUSTOM', 'Bench Sandbox Policy');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-[#E8E0D2] pb-4">
        <h2 className="text-base font-bold text-[#352642] flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#386947]" />
          <span>Interactive Policy Configuration Bench</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Tune issuing rules, replenishment targets, and lead-time assumptions to simulate custom inventory performance over {scenario.horizonDays} days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-[#E8E0D2] pb-2">
            Policy Parameters
          </h3>

          {/* Issuing Policy */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#352642] block">Issuing Depletion Rule:</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setIssuingPolicy('FIFO')}
                className={`py-2 px-3 rounded-lg border font-semibold ${
                  issuingPolicy === 'FIFO'
                    ? 'bg-[#352642] text-white border-[#352642]'
                    : 'bg-[#FDFBF7] text-slate-600 border-[#D5C9B5]'
                }`}
              >
                FIFO (Receipt)
              </button>
              <button
                onClick={() => setIssuingPolicy('FEFO')}
                className={`py-2 px-3 rounded-lg border font-semibold ${
                  issuingPolicy === 'FEFO'
                    ? 'bg-[#386947] text-white border-[#386947]'
                    : 'bg-[#FDFBF7] text-slate-600 border-[#D5C9B5]'
                }`}
              >
                FEFO (Expiry)
              </button>
            </div>
          </div>

          {/* Ordering Policy */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-mono font-bold text-[#352642] block">Replenishment Order Rule:</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setOrderingPolicy('FIXED')}
                className={`py-2 px-3 rounded-lg border font-semibold ${
                  orderingPolicy === 'FIXED'
                    ? 'bg-[#352642] text-white border-[#352642]'
                    : 'bg-[#FDFBF7] text-slate-600 border-[#D5C9B5]'
                }`}
              >
                Fixed Order Qty
              </button>
              <button
                onClick={() => setOrderingPolicy('BASE_STOCK')}
                className={`py-2 px-3 rounded-lg border font-semibold ${
                  orderingPolicy === 'BASE_STOCK'
                    ? 'bg-[#386947] text-white border-[#386947]'
                    : 'bg-[#FDFBF7] text-slate-600 border-[#D5C9B5]'
                }`}
              >
                Dynamic Base-Stock
              </button>
            </div>
          </div>

          {/* Dynamic Sliders based on ordering policy */}
          {orderingPolicy === 'FIXED' ? (
            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Fixed Daily Order:</span>
                <strong className="text-[#352642]">{fixedOrderQty} units</strong>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={fixedOrderQty}
                onChange={(e) => setFixedOrderQty(Number(e.target.value))}
                className="w-full accent-[#386947] cursor-pointer h-1.5 bg-[#E8E0D2] rounded"
              />
            </div>
          ) : (
            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Safety Stock Buffer:</span>
                <strong className="text-[#386947]">{safetyUnits} units</strong>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={safetyUnits}
                onChange={(e) => setSafetyUnits(Number(e.target.value))}
                className="w-full accent-[#386947] cursor-pointer h-1.5 bg-[#E8E0D2] rounded"
              />
            </div>
          )}

          {/* Lead Time Slider */}
          <div className="space-y-2 pt-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Supplier Lead Time:</span>
              <strong className="text-[#352642]">{leadTime} day(s)</strong>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={leadTime}
              onChange={(e) => setLeadTime(Number(e.target.value))}
              className="w-full accent-[#386947] cursor-pointer h-1.5 bg-[#E8E0D2] rounded"
            />
          </div>
        </div>

        {/* Live Evaluated Results Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Evaluated Policy Outcome</span>
                <h3 className="text-base font-bold text-[#352642] font-mono">
                  {issuingPolicy} Issuing &bull; {orderingPolicy} Replenishment
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#E8F2EC] text-[#386947] font-bold">
                Fill Rate: {(result.unitFillRate * 100).toFixed(1)}%
              </span>
            </div>

            {/* Core KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8E0D2]">
                <span className="text-slate-500 block text-[10px] uppercase">Sold Units</span>
                <span className="text-lg font-bold text-[#386947]">{result.totalSoldUnits}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8E0D2]">
                <span className="text-slate-500 block text-[10px] uppercase">Expired Waste</span>
                <span className="text-lg font-bold text-rose-700">{result.totalWasteUnits}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8E0D2]">
                <span className="text-slate-500 block text-[10px] uppercase">Lost Demand</span>
                <span className="text-lg font-bold text-amber-700">{result.totalLostUnits}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8E0D2]">
                <span className="text-slate-500 block text-[10px] uppercase">Waste Fraction</span>
                <span className="text-lg font-bold text-[#352642]">{(result.wasteFraction * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Financial Ledger Summary */}
            <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E8E0D2] space-y-2 font-mono text-xs text-slate-700">
              <span className="font-bold text-[#352642] block uppercase text-[10px] border-b border-[#E8E0D2] pb-1">
                Monetary Breakdown (Integer Paise Arithmetic)
              </span>
              <div className="flex justify-between">
                <span>Gross Merchandise Sales Revenue:</span>
                <strong className="text-[#386947]">₹{(result.totalRevenuePaise / 100).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Operating Costs (Procurement + Holding + Disposal + Lost Penalty):</span>
                <strong className="text-rose-700">₹{(result.totalCostPaise / 100).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E8E0D2] text-sm">
                <span>Net Simulated Profit:</span>
                <strong className={result.netProfitPaise >= 0 ? 'text-[#386947]' : 'text-rose-700'}>
                  ₹{(result.netProfitPaise / 100).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
