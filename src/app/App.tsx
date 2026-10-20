import React, { useState, useMemo } from 'react';
import { HeaderRail, ActiveTab } from '../components/HeaderRail.tsx';
import { FourWorldView } from '../features/attribution/FourWorldView.tsx';
import { BatchTheatreView } from '../features/theatre/BatchTheatreView.tsx';
import { PolicyBenchView } from '../features/bench/PolicyBenchView.tsx';
import { TradeoffFrontierView } from '../features/frontier/TradeoffFrontierView.tsx';
import { ReceiptsDrawerView } from '../features/receipts/ReceiptsDrawerView.tsx';
import { ScenarioNotebookView } from '../features/notebook/ScenarioNotebookView.tsx';
import {
  getHandCheckableFixture,
  getInteractionProbeScenario,
  generateScenario
} from '../domain/scenarioGenerator.ts';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('attribution');
  const [selectedSkuId, setSelectedSkuId] = useState<string>('sku-sourdough');
  const [preset, setPreset] = useState<string>('full60');

  // Load selected scenario
  const scenario = useMemo(() => {
    switch (preset) {
      case 'canonical':
        return getHandCheckableFixture();
      case 'probe':
        return getInteractionProbeScenario();
      case 'full60':
      default:
        return generateScenario(selectedSkuId, 101, 60);
    }
  }, [preset, selectedSkuId]);

  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#352642] flex flex-col font-sans selection:bg-[#386947] selection:text-white">
      {/* Top Header Rail */}
      <HeaderRail
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedSkuId={selectedSkuId}
        onSkuChange={setSelectedSkuId}
        preset={preset}
        onPresetChange={setPreset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Scenario Provenance Banner */}
        <div className="bg-[#FFFFFF] border border-[#E8E0D2] rounded-lg px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono text-slate-600 gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#386947] animate-pulse"></span>
            <span>SKU: <strong className="text-[#352642]">{scenario.sku.name}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Horizon: <strong className="text-slate-800">{scenario.horizonDays} days</strong></span>
            <span className="text-slate-300">|</span>
            <span>Shelf Life: <strong className="text-[#386947]">{scenario.shelfLifeOnArrivalDays}d (excl)</strong></span>
            <span className="text-slate-300">|</span>
            <span>Lead Time: <strong className="text-slate-800">{scenario.leadTimeDays}d</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Seed:</span>
            <strong className="text-[#352642]">{scenario.seed}</strong>
          </div>
        </div>

        {/* Dynamic View Mount */}
        {activeTab === 'attribution' && <FourWorldView scenario={scenario} />}
        {activeTab === 'theatre' && <BatchTheatreView scenario={scenario} />}
        {activeTab === 'bench' && <PolicyBenchView scenario={scenario} />}
        {activeTab === 'frontier' && <TradeoffFrontierView scenario={scenario} />}
        {activeTab === 'receipts' && <ReceiptsDrawerView scenario={scenario} />}
        {activeTab === 'notebook' && <ScenarioNotebookView scenario={scenario} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E0D2] bg-[#FFFFFF] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SHELFLIFE &bull; Four-World Waste Explainer &bull; Zero-Cloud In-Memory Perishable Inventory Simulator &bull; Campus Counter Provenance
      </footer>
    </div>
  );
};
