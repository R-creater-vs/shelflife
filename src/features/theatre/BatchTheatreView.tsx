import React, { useState } from 'react';
import type { ScenarioConfig, SimulationResult } from '../../domain/types.ts';
import { simulateWorld } from '../../simulation/simulator.ts';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface BatchTheatreViewProps {
  scenario: ScenarioConfig;
}

export const BatchTheatreView: React.FC<BatchTheatreViewProps> = ({ scenario }) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Simulate both FIFO and FEFO for side-by-side batch comparison
  const fifoResult: SimulationResult = simulateWorld(scenario, 'FIFO', 'FIXED', 'W00');
  const fefoResult: SimulationResult = simulateWorld(scenario, 'FEFO', 'FIXED', 'W10');

  const maxDay = scenario.horizonDays - 1;

  // Auto-play timer
  React.useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedDay((prev) => {
          if (prev >= maxDay) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxDay]);

  const fifoReceipt = fifoResult.dailyReceipts[selectedDay];
  const fefoReceipt = fefoResult.dailyReceipts[selectedDay];

  return (
    <div className="space-y-6">
      {/* Top Scrubber & Playback Controls */}
      <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              isPlaying ? 'bg-[#C76A15] text-white' : 'bg-[#352642] text-white hover:bg-[#4A365B]'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
          </button>

          <button
            onClick={() => setSelectedDay(Math.min(maxDay, selectedDay + 1))}
            disabled={selectedDay >= maxDay}
            className="p-1.5 rounded-lg border border-[#D5C9B5] bg-[#FDFBF7] text-[#352642] hover:bg-[#EFEAF4] disabled:opacity-40"
            title="Step One Day"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            onClick={() => { setIsPlaying(false); setSelectedDay(0); }}
            className="p-1.5 rounded-lg border border-[#D5C9B5] bg-[#FDFBF7] text-[#352642] hover:bg-[#EFEAF4]"
            title="Reset to Day 0"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Scrubber Slider */}
        <div className="flex-1 max-w-lg w-full flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={maxDay}
            value={selectedDay}
            onChange={(e) => {
              setIsPlaying(false);
              setSelectedDay(Number(e.target.value));
            }}
            className="w-full accent-[#386947] cursor-pointer h-1.5 bg-[#E8E0D2] rounded-lg"
          />
          <span className="font-mono text-xs font-bold text-[#352642] whitespace-nowrap min-w-[80px] text-right">
            Day {selectedDay} / {maxDay}
          </span>
        </div>

        {/* Selected Day Status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-[#FDFBF7] border border-[#E8E0D2] px-3 py-1 rounded">
            <span className="text-slate-500 mr-1.5">Demand Today:</span>
            <strong className="text-[#352642]">{fifoReceipt?.demandRequested ?? 0} units</strong>
          </div>
        </div>
      </div>

      {/* Side-by-Side Batch Lifelines (FIFO vs FEFO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: FIFO World */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#EFEAF4] text-[#352642] font-bold">
                FIFO Issuing
              </span>
              <h3 className="text-sm font-bold text-[#352642] mt-1">First-In First-Out Lifelines</h3>
            </div>
            <div className="text-xs font-mono text-right">
              <div>Waste: <strong className="text-rose-700">{fifoReceipt?.expiredUnitsPurged ?? 0}u</strong></div>
              <div>Lost: <strong className="text-amber-700">{fifoReceipt?.demandLost ?? 0}u</strong></div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono text-slate-500 uppercase block">Active & Tracked Batches</span>
            {fifoResult.allBatches.slice(0, 8).map((b) => {
              const isExpired = b.expiryDayExclusive <= selectedDay;

              return (
                <div key={b.id} className="p-2.5 rounded-lg border border-[#E8E0D2] bg-[#FDFBF7] text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#352642]">{b.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isExpired ? 'bg-[#FDE8E8] text-rose-700' : 'bg-[#E8F2EC] text-[#386947]'
                    }`}>
                      {isExpired ? 'EXPIRED' : 'SELLABLE'}
                    </span>
                  </div>

                  {/* Horizontal Visual Lifeline */}
                  <div className="w-full bg-[#E8E0D2] h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, Math.max(10, ((b.initialUnits - b.remainingUnits) / b.initialUnits) * 100))}%` }}
                      className="bg-[#386947] h-full"
                      title="Sold Units"
                    ></div>
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, (b.remainingUnits / b.initialUnits) * 100))}%` }}
                      className="bg-[#E4A16E] h-full"
                      title="Remaining Sellable"
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Rec: Day {b.receivedDay}</span>
                    <span>Expires: <strong>Day {b.expiryDayExclusive}</strong> (excl)</span>
                    <span>Units: <strong>{b.initialUnits}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: FEFO World */}
        <div className="bg-[#FFFFFF] border-2 border-[#386947] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#386947] text-white font-bold">
                FEFO Issuing
              </span>
              <h3 className="text-sm font-bold text-[#386947] mt-1">First-Expiry First-Out Lifelines</h3>
            </div>
            <div className="text-xs font-mono text-right">
              <div>Waste: <strong className="text-emerald-700">{fefoReceipt?.expiredUnitsPurged ?? 0}u</strong></div>
              <div>Lost: <strong className="text-emerald-700">{fefoReceipt?.demandLost ?? 0}u</strong></div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono text-slate-500 uppercase block">Active & Tracked Batches</span>
            {fefoResult.allBatches.slice(0, 8).map((b) => {
              const isExpired = b.expiryDayExclusive <= selectedDay;

              return (
                <div key={b.id} className="p-2.5 rounded-lg border border-[#E8E0D2] bg-[#FDFBF7] text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#352642]">{b.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isExpired ? 'bg-[#FDE8E8] text-rose-700' : 'bg-[#E8F2EC] text-[#386947]'
                    }`}>
                      {isExpired ? 'EXPIRED' : 'SELLABLE'}
                    </span>
                  </div>

                  {/* Horizontal Visual Lifeline */}
                  <div className="w-full bg-[#E8E0D2] h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, Math.max(10, ((b.initialUnits - b.remainingUnits) / b.initialUnits) * 100))}%` }}
                      className="bg-[#386947] h-full"
                      title="Sold Units"
                    ></div>
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, (b.remainingUnits / b.initialUnits) * 100))}%` }}
                      className="bg-[#E4A16E] h-full"
                      title="Remaining Sellable"
                    ></div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Rec: Day {b.receivedDay}</span>
                    <span>Expires: <strong>Day {b.expiryDayExclusive}</strong> (excl)</span>
                    <span>Units: <strong>{b.initialUnits}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
