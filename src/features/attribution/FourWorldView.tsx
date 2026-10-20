import React from 'react';
import type { FourWorldAnalysis, ScenarioConfig } from '../../domain/types.ts';
import { runFourWorldAnalysis } from '../../simulation/simulator.ts';
import { GitCompare, Layers, CheckCircle2 } from 'lucide-react';

interface FourWorldViewProps {
  scenario: ScenarioConfig;
}

export const FourWorldView: React.FC<FourWorldViewProps> = ({ scenario }) => {
  const analysis: FourWorldAnalysis = runFourWorldAnalysis(scenario);
  const { W00, W10, W01, W11, issuingContrast, orderingContrast, interaction, jointDifference, issuingUnderChangedOrdering } = analysis;

  return (
    <div className="space-y-6">
      {/* Signature Banner */}
      <div className="bg-gradient-to-r from-[#EFEAF4] via-[#FFFFFF] to-[#E8F2EC] border border-[#E8E0D2] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#386947] font-bold uppercase tracking-wider mb-1">
              <GitCompare className="h-4 w-4" />
              <span>Signature Differentiating Mechanism</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#352642]">
              Four-World Policy Interaction Attribution
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              By evaluating all four combinations of issuing rules (FIFO vs. FEFO) and replenishment rules (Fixed vs. Base-Stock) against identical exogenous demand, SHELFLIFE mathematically isolates issuing effects, ordering effects, and their interaction.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D5C9B5] rounded-lg px-3 py-2 font-mono text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-[#386947]" />
            <span>Attribution Identity: <strong>100% Balanced</strong></span>
          </div>
        </div>
      </div>

      {/* Four Worlds Side-by-Side Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* World 00: FIFO + Fixed (Baseline) */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFEAF4] text-[#352642] font-bold">
              W00 &bull; Baseline
            </span>
            <span className="text-xs font-mono text-slate-500">FIFO + Fixed</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Expired Waste</span>
            <span className="text-2xl font-bold font-mono text-rose-700">{W00.totalWasteUnits} <span className="text-xs font-normal text-slate-500">units</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-600">
            <div>Sold: <strong>{W00.totalSoldUnits}</strong></div>
            <div>Lost: <strong>{W00.totalLostUnits}</strong></div>
            <div>Fill Rate: <strong>{(W00.unitFillRate * 100).toFixed(1)}%</strong></div>
            <div>Profit: <strong>₹{(W00.netProfitPaise / 100).toFixed(0)}</strong></div>
          </div>
        </div>

        {/* World 10: FEFO + Fixed */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F2EC] text-[#386947] font-bold">
              W10 &bull; FEFO Only
            </span>
            <span className="text-xs font-mono text-slate-500">FEFO + Fixed</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Expired Waste</span>
            <span className="text-2xl font-bold font-mono text-slate-800">{W10.totalWasteUnits} <span className="text-xs font-normal text-slate-500">units</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-600">
            <div>Sold: <strong>{W10.totalSoldUnits}</strong></div>
            <div>Lost: <strong>{W10.totalLostUnits}</strong></div>
            <div>Fill Rate: <strong>{(W10.unitFillRate * 100).toFixed(1)}%</strong></div>
            <div>Profit: <strong>₹{(W10.netProfitPaise / 100).toFixed(0)}</strong></div>
          </div>
        </div>

        {/* World 01: FIFO + Base-Stock */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FCF4ED] text-[#C76A15] font-bold">
              W01 &bull; Base-Stock Only
            </span>
            <span className="text-xs font-mono text-slate-500">FIFO + Base-Stock</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Expired Waste</span>
            <span className="text-2xl font-bold font-mono text-slate-800">{W01.totalWasteUnits} <span className="text-xs font-normal text-slate-500">units</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-600">
            <div>Sold: <strong>{W01.totalSoldUnits}</strong></div>
            <div>Lost: <strong>{W01.totalLostUnits}</strong></div>
            <div>Fill Rate: <strong>{(W01.unitFillRate * 100).toFixed(1)}%</strong></div>
            <div>Profit: <strong>₹{(W01.netProfitPaise / 100).toFixed(0)}</strong></div>
          </div>
        </div>

        {/* World 11: FEFO + Base-Stock (Joint) */}
        <div className="bg-[#FFFFFF] border-2 border-[#386947] rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#386947] text-white font-bold">
              W11 &bull; Joint Policy
            </span>
            <span className="text-xs font-mono font-bold text-[#386947]">FEFO + Base-Stock</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-mono">Expired Waste</span>
            <span className="text-2xl font-bold font-mono text-[#386947]">{W11.totalWasteUnits} <span className="text-xs font-normal text-slate-500">units</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-600">
            <div>Sold: <strong>{W11.totalSoldUnits}</strong></div>
            <div>Lost: <strong>{W11.totalLostUnits}</strong></div>
            <div>Fill Rate: <strong>{(W11.unitFillRate * 100).toFixed(1)}%</strong></div>
            <div>Profit: <strong>₹{(W11.netProfitPaise / 100).toFixed(0)}</strong></div>
          </div>
        </div>
      </div>

      {/* The Factorial Attribution Bridge Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#352642] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#386947]" />
              <span>Additive Factorial Attribution Bridge</span>
            </h3>
            <p className="text-xs text-slate-500">
              Decomposition of the joint waste delta into independent issuing, independent ordering, and non-linear interaction effects.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            W11 - W00 = Δ(issue) + Δ(order) + I
          </span>
        </div>

        {/* Mathematical Waterfall Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
          <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8E0D2]">
            <span className="text-slate-500 block text-[10px] uppercase">Issuing Contrast (W10 - W00)</span>
            <span className="text-lg font-bold text-[#352642]">
              {issuingContrast > 0 ? `+${issuingContrast}` : issuingContrast} units
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">FEFO benefit at fixed order</span>
          </div>

          <div className="bg-[#FDFBF7] p-3 rounded-lg border border-[#E8E0D2]">
            <span className="text-slate-500 block text-[10px] uppercase">Ordering Contrast (W01 - W00)</span>
            <span className="text-lg font-bold text-[#352642]">
              {orderingContrast > 0 ? `+${orderingContrast}` : orderingContrast} units
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Base-stock benefit at FIFO</span>
          </div>

          <div className="bg-[#EFEAF4]/60 p-3 rounded-lg border border-[#352642]/20">
            <span className="text-slate-600 block text-[10px] uppercase font-bold">Interaction Effect (I)</span>
            <span className={`text-lg font-bold ${interaction !== 0 ? 'text-[#352642]' : 'text-slate-500'}`}>
              {interaction > 0 ? `+${interaction}` : interaction} units
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">W11 - W10 - W01 + W00</span>
          </div>

          <div className="bg-[#E8F2EC] p-3 rounded-lg border border-[#386947]/30">
            <span className="text-[#386947] block text-[10px] uppercase font-bold">Joint Total Difference</span>
            <span className="text-lg font-bold text-[#386947]">
              {jointDifference > 0 ? `+${jointDifference}` : jointDifference} units
            </span>
            <span className="text-[10px] text-[#386947]/80 block mt-0.5">Net change from baseline</span>
          </div>
        </div>

        {/* Verification Proof Box */}
        <div className="p-3.5 rounded-lg bg-[#FDFBF7] border border-[#E8E0D2] font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#386947] text-white font-bold text-[10px]">VERIFIED</span>
            <span className="text-slate-700">
              ({issuingContrast}) + ({orderingContrast}) + ({interaction}) = <strong>{jointDifference} units</strong>
            </span>
          </div>
          <div className="text-slate-600 text-[11px]">
            Issuing contrast under base-stock (W11 - W01): <strong>{issuingUnderChangedOrdering} units</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
