import React from 'react';
import { GitCompare, Clock, Sliders, TrendingUp, Receipt, FileText } from 'lucide-react';
import { CATALOG_SKUS } from '../domain/scenarioGenerator.ts';

export type ActiveTab = 'attribution' | 'theatre' | 'bench' | 'frontier' | 'receipts' | 'notebook';

interface HeaderRailProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedSkuId: string;
  onSkuChange: (skuId: string) => void;
  preset: string;
  onPresetChange: (preset: string) => void;
}

export const HeaderRail: React.FC<HeaderRailProps> = ({
  activeTab,
  onTabChange,
  selectedSkuId,
  onSkuChange,
  preset,
  onPresetChange
}) => {
  const tabs = [
    { id: 'attribution', label: 'Four-World Attribution', icon: GitCompare, badge: 'Signature' },
    { id: 'theatre', label: 'Batch Theatre', icon: Clock },
    { id: 'bench', label: 'Policy Bench', icon: Sliders },
    { id: 'frontier', label: 'Trade-off Frontier', icon: TrendingUp },
    { id: 'receipts', label: 'Receipts Drawer', icon: Receipt },
    { id: 'notebook', label: 'Scenario Notebook', icon: FileText }
  ];

  return (
    <header className="border-b border-[#E8E0D2] bg-[#FFFFFF] px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#352642] to-[#386947] flex items-center justify-center p-0.5 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 stroke-white" strokeWidth="2.5">
              <path d="M12 3v18" strokeLinecap="round"/>
              <path d="M18 9l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="15" r="4" fill="#E4A16E"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-[#352642] uppercase">
                SHELFLIFE
              </h1>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#EFEAF4] text-[#352642] border border-[#D5C9B5]">
                v1.0.0-PROD
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Four-World Waste Explainer & Perishable Inventory Lab
            </p>
          </div>
        </div>

        {/* Selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-sans font-medium">Catalog SKU:</span>
            <select
              value={selectedSkuId}
              onChange={(e) => onSkuChange(e.target.value)}
              className="bg-[#FDFBF7] border border-[#D5C9B5] text-[#352642] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#386947]"
            >
              {CATALOG_SKUS.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.name} ({sku.defaultShelfLifeDays}d shelf life)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-sans font-medium">Scenario:</span>
            <select
              value={preset}
              onChange={(e) => onPresetChange(e.target.value)}
              className="bg-[#FDFBF7] border border-[#D5C9B5] text-[#352642] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#386947]"
            >
              <option value="canonical">Canonical Worked Fixture (2 Days)</option>
              <option value="probe">Interaction Probe Scenario (5 Days)</option>
              <option value="full60">Full 60-Day Campus Counter</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as ActiveTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#352642] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#352642] hover:bg-[#EFEAF4]/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1 rounded font-mono ${
                    isActive ? 'bg-[#4A365B] text-white' : 'bg-[#E8F2EC] text-[#386947] border border-[#386947]/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
