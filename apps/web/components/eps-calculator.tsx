"use client";

import { useState, useCallback } from "react";
import { Card } from "@biogrow/ui/components/card";

// Constants
const BLOCK_VOLUME_FT3 = 153;
const LABOR_COST_PER_BLOCK = 9;
const ENERGY_COST_PER_BLOCK = 3;
const INFRA_COST_PER_BLOCK = 12;
const FIXED_COST_SUM = LABOR_COST_PER_BLOCK + ENERGY_COST_PER_BLOCK + INFRA_COST_PER_BLOCK;

const DENSITY_YIELDS: Record<string, number> = {
  "15": 15,
  "18": 13,
};

const SHIFT_BLOCKS: Record<string, number> = {
  "8": 64,
  "16": 128,
  "24": 192,
};

const CONSTRUCTION_FORMATS = [
  { id: "eifs", label: "Wall Insulation (EIFS)", sublabel: '24"x48"', wIn: 24, hIn: 48, defaultT: 1 },
  { id: "floors", label: "Floor Insulation (Under Slab)", sublabel: '48"x48"/96"', wIn: 48, hIn: 48, defaultT: 2 },
  { id: "roofs", label: "Roof (Rigid Sheets)", sublabel: '24"x96"', wIn: 24, hIn: 96, defaultT: 1.5 },
  { id: "caseton", label: "Void Form / Caseton (Slab)", sublabel: 'Caseton 20"x48"', wIn: 20, hIn: 48, defaultT: 4 },
  { id: "geofoam", label: "Geofoam Blocks (Fills)", sublabel: '48"x96"', wIn: 48, hIn: 96, defaultT: 12 },
];

const CRAFT_FORMATS = [
  { id: "smooth_std", category: "Blocks & Cubes", label: "SmoothFoM Block (Std)", wIn: 3.9, lIn: 11.9, tIn: 1.9 },
  { id: "smooth_sq", category: "Blocks & Cubes", label: "SmoothFoM Block (Sq)", wIn: 11.9, lIn: 11.9, tIn: 0.6 },
  { id: "craft_lg", category: "Blocks & Cubes", label: "CraftFoM Block (Lg)", wIn: 12, lIn: 19.9, tIn: 1.2 },
  { id: "craft_md", category: "Blocks & Cubes", label: "CraftFoM Block (Md)", wIn: 7.8, lIn: 3.8, tIn: 1.9 },
  { id: "foam_bricks", category: "Blocks & Cubes", label: "Foam Bricks", wIn: 2.8, lIn: 5.8, tIn: 1.3 },
  { id: "cake_10", category: "Cake Forms", label: "Square Base (Cake Form) 10\"", wIn: 10, lIn: 10, tIn: 3 },
  { id: "cake_8", category: "Cake Forms", label: "Square Base (Cake Form) 8\"", wIn: 8, lIn: 8, tIn: 3 },
  { id: "cake_6", category: "Cake Forms", label: "Square Base (Cake Form) 6\"", wIn: 6, lIn: 6, tIn: 3 },
  { id: "foam_giant", category: "Rigid Panels", label: "Giant Foam Board", wIn: 40, lIn: 60, tIn: 0.19 },
  { id: "foam_lg", category: "Rigid Panels", label: "Large Foam Board", wIn: 32, lIn: 40, tIn: 0.12 },
  { id: "mighty_core", category: "Rigid Panels", label: "Mighty Core (Heavy Duty)", wIn: 32, lIn: 40, tIn: 0.19 },
  { id: "foam_std", category: "Rigid Panels", label: "Standard Foam Board", wIn: 20, lIn: 30, tIn: 0.25 },
  { id: "foam_xtra", category: "Rigid Panels", label: "Extra Thick Foam Board", wIn: 20, lIn: 30, tIn: 0.5 },
  { id: "ghostline_grid", category: "Rigid Panels", label: "Ghostline (Grid)", wIn: 22, lIn: 28, tIn: 0.19 },
  { id: "ghostline_sm", category: "Rigid Panels", label: "Ghostline (Sm)", wIn: 11, lIn: 14, tIn: 0.19 },
  { id: "project_fold", category: "Rigid Panels", label: "Project Board (Foldable)", wIn: 36, lIn: 48, tIn: 0.19 },
  { id: "sheet_thick", category: "Rigid Sheets", label: "Craft Foam Sheet (Thick)", wIn: 12, lIn: 48, tIn: 0.9 },
  { id: "sheet_med", category: "Rigid Sheets", label: "Craft Foam Sheet (Med)", wIn: 12, lIn: 48, tIn: 0.4 },
  { id: "sheet_white", category: "Rigid Sheets", label: "White Foam Sheets (Pack)", wIn: 11, lIn: 14, tIn: 0.1 },
];

interface CalculatorState {
  rawMaterialCost: number;
  blockDensity: string;
  shift: string;
  pieceH: number;
  pieceW: number;
  pieceT: number;
  pieceDensity: string;
  pieceQuantity: number;
  wastePercentage: number;
  salesPrices: Record<string, number>;
  salesQuantities: Record<string, number>;
  salesThicknesses: Record<string, number>;
  craftPricePerFt3: number;
  craftQuantities: Record<string, number>;
}

const initialState: CalculatorState = {
  rawMaterialCost: 2000,
  blockDensity: "15",
  shift: "8",
  pieceH: 10,
  pieceW: 10,
  pieceT: 2,
  pieceDensity: "15",
  pieceQuantity: 1,
  wastePercentage: 10,
  salesPrices: { eifs: 8.5, floors: 7.5, roofs: 8.0, caseton: 6.5, geofoam: 5.5 },
  salesQuantities: {},
  salesThicknesses: Object.fromEntries(CONSTRUCTION_FORMATS.map((f) => [f.id, f.defaultT])),
  craftPricePerFt3: 15.0,
  craftQuantities: {},
};

interface CalculationResults {
  blockCost: number;
  costPerFt3: number;
  unitCost: number;
  totalCost: number;
  shiftCapacity: string;
  constructionRows: Array<{
    id: string;
    volume: number;
    mfgCost: number;
    revenue: number;
    profit: number;
  }>;
  craftRows: Array<{
    id: string;
    volume: number;
    salePrice: number;
    mfgCost: number;
    revenue: number;
    profit: number;
  }>;
  totalRevenue: number;
  totalVolume: number;
  totalBlocks: number;
  totalDays: number;
  totalProfit: number;
}

function calculate(state: CalculatorState): CalculationResults {
  const wasteFactor = 1 + state.wastePercentage / 100;

  // Reference Block Cost
  const factoryYield = DENSITY_YIELDS[state.blockDensity];
  const factoryBaseCostPerBlock = state.rawMaterialCost / factoryYield + FIXED_COST_SUM;
  const factoryAdjustedCostPerBlock = factoryBaseCostPerBlock * wasteFactor;

  // Piece Cost
  const pieceYield = DENSITY_YIELDS[state.pieceDensity];
  const pieceBaseCostPerBlock = state.rawMaterialCost / pieceYield + FIXED_COST_SUM;
  const pieceAdjustedCostPerBlock = pieceBaseCostPerBlock * wasteFactor;
  const pieceCostPerFt3 = pieceAdjustedCostPerBlock / BLOCK_VOLUME_FT3;

  const pieceVolIn3 = state.pieceH * state.pieceW * state.pieceT;
  const pieceVolFt3 = pieceVolIn3 / 1728;
  const unitCost = pieceVolFt3 * pieceCostPerFt3;
  const totalCost = unitCost * state.pieceQuantity;

  // Internal cost for sales prediction
  const internalCostPerFt3 = (state.rawMaterialCost / factoryYield + FIXED_COST_SUM) / BLOCK_VOLUME_FT3;

  // Construction market calculations
  const constructionRows = CONSTRUCTION_FORMATS.map((f) => {
    const qty = state.salesQuantities[f.id] || 0;
    const thickness = state.salesThicknesses[f.id] || 1;
    const salePrice = state.salesPrices[f.id] || 0;

    const itemVolFt3 = (f.wIn * f.hIn * thickness) / 1728 * qty;
    const itemRevenue = itemVolFt3 * salePrice;
    const itemMfgCost = itemVolFt3 * internalCostPerFt3;
    const itemProfit = itemRevenue - itemMfgCost;

    return { id: f.id, volume: itemVolFt3, mfgCost: itemMfgCost, revenue: itemRevenue, profit: itemProfit };
  });

  // Craft market calculations
  const craftRows = CRAFT_FORMATS.map((f) => {
    const qty = state.craftQuantities[f.id] || 0;
    const salePricePerFt3 = state.craftPricePerFt3 || 0;

    const itemVolFt3 = (f.wIn * f.lIn * f.tIn) / 1728 * qty;
    const itemRevenue = itemVolFt3 * salePricePerFt3;
    const itemMfgCost = itemVolFt3 * internalCostPerFt3;
    const itemProfit = itemRevenue - itemMfgCost;

    return { id: f.id, volume: itemVolFt3, salePrice: salePricePerFt3, mfgCost: itemMfgCost, revenue: itemRevenue, profit: itemProfit };
  });

  // Totals
  const totalRevenue = [...constructionRows, ...craftRows].reduce((sum, r) => sum + r.revenue, 0);
  const totalVolume = [...constructionRows, ...craftRows].reduce((sum, r) => sum + r.volume, 0);
  const totalMfgCost = [...constructionRows, ...craftRows].reduce((sum, r) => sum + r.mfgCost, 0);
  const totalBlocks = totalVolume / BLOCK_VOLUME_FT3;
  const blocksPerDay = SHIFT_BLOCKS[state.shift] || 64;
  const totalDays = totalBlocks / blocksPerDay;
  const totalProfit = totalRevenue - totalMfgCost;

  return {
    blockCost: factoryAdjustedCostPerBlock,
    costPerFt3: factoryAdjustedCostPerBlock / BLOCK_VOLUME_FT3,
    unitCost,
    totalCost,
    shiftCapacity: `${SHIFT_BLOCKS[state.shift]} Blocks`,
    constructionRows,
    craftRows,
    totalRevenue,
    totalVolume,
    totalBlocks,
    totalDays,
    totalProfit,
  };
}

export function EPSCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const results = calculate(state);

  const updateState = useCallback((updates: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSalesQuantity = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      salesQuantities: { ...prev.salesQuantities, [id]: value },
    }));
  }, []);

  const updateSalesPrice = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      salesPrices: { ...prev.salesPrices, [id]: value },
    }));
  }, []);

  const updateSalesThickness = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      salesThicknesses: { ...prev.salesThicknesses, [id]: value },
    }));
  }, []);

  const updateCraftQuantity = useCallback((id: string, value: number) => {
    setState((prev) => ({
      ...prev,
      craftQuantities: { ...prev.craftQuantities, [id]: value },
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Prime Blocks Tech
        </h1>
        <p className="text-gray-400 mt-2">EPS Piece Cost Calculator</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manufacturing Assumptions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-cyan-400 rounded"></span>
            1. Manufacturing Assumptions
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Raw Material Cost (USD/Ton)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-semibold">$</span>
                <input
                  type="number"
                  value={state.rawMaterialCost}
                  onChange={(e) => updateState({ rawMaterialCost: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pl-8 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Factory Block Density</label>
                <select
                  value={state.blockDensity}
                  onChange={(e) => updateState({ blockDensity: e.target.value, pieceDensity: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="15">15 kg Density</option>
                  <option value="18">18 kg Density</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Production Shift</label>
                <select
                  value={state.shift}
                  onChange={(e) => updateState({ shift: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="8">8 Hours (64 Blocks)</option>
                  <option value="16">16 Hours (128 Blocks)</option>
                  <option value="24">24 Hours (192 Blocks)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div className="bg-gray-800/30 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-400 block">Reference Block Vol.</span>
                <strong className="text-cyan-400">153 ft³</strong>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-400 block">Labor Cost/Block</span>
                <strong className="text-cyan-400">${LABOR_COST_PER_BLOCK.toFixed(2)}</strong>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-400 block">Energy Cost/Block</span>
                <strong className="text-cyan-400">${ENERGY_COST_PER_BLOCK.toFixed(2)}</strong>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-400 block">Infra & Insurance</span>
                <strong className="text-cyan-400">${INFRA_COST_PER_BLOCK.toFixed(2)}</strong>
              </div>
              <div className="col-span-2 bg-gray-800/30 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-400 block">Total Fixed Costs per Block</span>
                <strong className="text-xl text-cyan-400">${FIXED_COST_SUM.toFixed(2)}</strong>
              </div>
              <div className="col-span-2 bg-gray-800/30 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-400 block">Current Shift Capacity</span>
                <strong className="text-cyan-400">{results.shiftCapacity}</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Piece Specifications */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-cyan-400 rounded"></span>
            2. Piece Specifications
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Height</label>
                <div className="relative">
                  <input
                    type="number"
                    value={state.pieceH}
                    onChange={(e) => updateState({ pieceH: parseFloat(e.target.value) || 0 })}
                    step="0.5"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">in</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Width</label>
                <div className="relative">
                  <input
                    type="number"
                    value={state.pieceW}
                    onChange={(e) => updateState({ pieceW: parseFloat(e.target.value) || 0 })}
                    step="0.5"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">in</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Thickness</label>
                <div className="relative">
                  <input
                    type="number"
                    value={state.pieceT}
                    onChange={(e) => updateState({ pieceT: parseFloat(e.target.value) || 0 })}
                    step="0.1"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">in</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Piece Density</label>
                <select
                  value={state.pieceDensity}
                  onChange={(e) => updateState({ pieceDensity: e.target.value })}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="15">15 kg Density</option>
                  <option value="18">18 kg Density</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Safety Waste Margin</label>
                <div className="relative">
                  <input
                    type="number"
                    value={state.wastePercentage}
                    onChange={(e) => updateState({ wastePercentage: parseFloat(e.target.value) || 0 })}
                    min="0"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Quantity to Produce (Units)</label>
              <input
                type="number"
                value={state.pieceQuantity}
                onChange={(e) => updateState({ pieceQuantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-cyan-400/10 border border-cyan-400/30 p-4 rounded-xl text-center">
              <h3 className="text-xs text-gray-400 uppercase mb-1">Block Cost (153 ft³)</h3>
              <div className="text-2xl font-bold text-white">${results.blockCost.toFixed(2)}</div>
              <div className="text-sm text-cyan-400">${results.costPerFt3.toFixed(2)}/ft³</div>
            </div>
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-xl text-center text-white">
              <h3 className="text-xs uppercase mb-1 opacity-80">Piece Unit Cost</h3>
              <div className="text-3xl font-bold">${results.unitCost.toFixed(4)}</div>
            </div>
            <div className="bg-cyan-400/10 border border-cyan-400/30 p-4 rounded-xl text-center">
              <h3 className="text-xs text-gray-400 uppercase mb-1">Order Total</h3>
              <div className="text-2xl font-bold text-white">${results.totalCost.toFixed(2)}</div>
              <div className="text-xs text-gray-400">{state.pieceQuantity} Units</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Prediction Module */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-cyan-400 rounded"></span>
          3. Sales Prediction Module
        </h2>

        {/* Construction Market */}
        <div className="bg-gray-800/30 p-4 rounded-lg mb-4 border-l-4 border-cyan-400">
          <h3 className="text-lg font-semibold">Construction Market</h3>
          <p className="text-sm text-gray-400">Define quantities and selling price per ft³</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase">
                <th className="text-left p-2">Format / Product</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Thick (in)</th>
                <th className="p-2">Volume (ft³)</th>
                <th className="p-2">Sale ($/ft³)</th>
                <th className="p-2">Mfg Cost</th>
                <th className="p-2">Total Sale</th>
                <th className="p-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {CONSTRUCTION_FORMATS.map((f) => {
                const row = results.constructionRows.find((r) => r.id === f.id)!;
                return (
                  <tr key={f.id} className="border-b border-gray-800">
                    <td className="p-2">
                      <span className="font-medium block">{f.label}</span>
                      <span className="text-xs text-gray-500">{f.sublabel}</span>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={state.salesQuantities[f.id] || 0}
                        onChange={(e) => updateSalesQuantity(f.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={state.salesThicknesses[f.id] || f.defaultT}
                        onChange={(e) => updateSalesThickness(f.id, parseFloat(e.target.value) || 0.1)}
                        step="0.5"
                        min="0.1"
                        className="w-16 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-gray-300">{row.volume.toFixed(2)}</td>
                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="number"
                          value={state.salesPrices[f.id] || 0}
                          onChange={(e) => updateSalesPrice(f.id, parseFloat(e.target.value) || 0)}
                          step="0.5"
                          className="w-20 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 pl-6 text-white text-sm focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="p-2 text-gray-400">${row.mfgCost.toFixed(2)}</td>
                    <td className="p-2 font-medium">${row.revenue.toFixed(2)}</td>
                    <td className={`p-2 font-medium ${row.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${row.profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Craft Market */}
        <div className="bg-gray-800/30 p-4 rounded-lg mt-6 mb-4 border-l-4 border-cyan-400">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Craft Market</h3>
              <p className="text-sm text-gray-400">Foam boards, panels, and craft products</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Sale Price per ft³:</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={state.craftPricePerFt3}
                  onChange={(e) => updateState({ craftPricePerFt3: parseFloat(e.target.value) || 0 })}
                  step="0.5"
                  className="w-24 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 pl-6 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase">
                <th className="text-left p-2">Format / Product</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Volume (ft³)</th>
                <th className="p-2">Sale Price</th>
                <th className="p-2">Mfg Cost</th>
                <th className="p-2">Total Sale</th>
                <th className="p-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {CRAFT_FORMATS.map((f) => {
                const row = results.craftRows.find((r) => r.id === f.id)!;
                return (
                  <tr key={f.id} className="border-b border-gray-800">
                    <td className="p-2">
                      <span className="font-medium block">{f.label}</span>
                      <span className="text-xs text-gray-500">{f.wIn}"x{f.lIn}"x{f.tIn}"</span>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={state.craftQuantities[f.id] || 0}
                        onChange={(e) => updateCraftQuantity(f.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-cyan-400 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-gray-300">{row.volume.toFixed(3)}</td>
                    <td className="p-2 text-gray-400">${row.salePrice.toFixed(2)}</td>
                    <td className="p-2 text-gray-400">${row.mfgCost.toFixed(2)}</td>
                    <td className="p-2 font-medium">${row.revenue.toFixed(2)}</td>
                    <td className={`p-2 font-medium ${row.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ${row.profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="border border-cyan-400/30 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase block mb-1">Total Sales Revenue</span>
            <strong className="text-xl text-cyan-400">${results.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="border border-cyan-400/30 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase block mb-1">Production Volume</span>
            <strong className="text-xl text-cyan-400">{results.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })} ft³</strong>
          </div>
          <div className="border border-cyan-400/30 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase block mb-1">Total Blocks Required</span>
            <strong className="text-xl text-cyan-400">{results.totalBlocks.toFixed(2)}</strong>
          </div>
          <div className="border border-cyan-400/30 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase block mb-1">Production Days</span>
            <strong className="text-xl text-cyan-400">{results.totalDays.toFixed(2)}</strong>
          </div>
          <div className="border border-green-400/30 bg-green-400/5 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase block mb-1">Net Profit Projection</span>
            <strong className="text-xl text-green-400">${results.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}