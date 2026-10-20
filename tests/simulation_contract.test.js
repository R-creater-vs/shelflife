import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateWorld, runFourWorldAnalysis } from '../src/simulation/simulator.ts';
import {
  getHandCheckableFixture,
  getInteractionProbeScenario,
  generateScenario
} from '../src/domain/scenarioGenerator.ts';

test('SHELFLIFE Contract 1: Hand-Checkable Distinguishing Fixture (FIFO vs FEFO)', () => {
  const scenario = getHandCheckableFixture();

  // Run FIFO
  const fifoResult = simulateWorld(scenario, 'FIFO', 'FIXED', 'W00');
  assert.equal(fifoResult.totalSoldUnits, 5, 'FIFO must sell exactly 5 units');
  assert.equal(fifoResult.totalWasteUnits, 5, 'FIFO must expire exactly 5 units from Batch B');
  assert.equal(fifoResult.totalLostUnits, 5, 'FIFO must lose 5 units of day-1 demand');

  // Run FEFO
  const fefoResult = simulateWorld(scenario, 'FEFO', 'FIXED', 'W10');
  assert.equal(fefoResult.totalSoldUnits, 10, 'FEFO must sell all 10 units');
  assert.equal(fefoResult.totalWasteUnits, 0, 'FEFO must produce 0 waste');
  assert.equal(fefoResult.totalLostUnits, 0, 'FEFO must lose 0 demand');
});

test('SHELFLIFE Contract 2: Order Equals Expiry Control (Policies Coincide)', () => {
  const baseScenario = getHandCheckableFixture();
  // Modify batches so receipt order EQUALS expiry order
  const controlScenario = {
    ...baseScenario,
    openingBatches: [
      {
        id: 'batch-1',
        skuId: baseScenario.sku.id,
        receivedDay: -2,
        expiryDayExclusive: 1, // earlier receipt expires earlier
        initialUnits: 5,
        remainingUnits: 5
      },
      {
        id: 'batch-2',
        skuId: baseScenario.sku.id,
        receivedDay: -1,
        expiryDayExclusive: 4, // later receipt expires later
        initialUnits: 5,
        remainingUnits: 5
      }
    ]
  };

  const fifoRes = simulateWorld(controlScenario, 'FIFO', 'FIXED');
  const fefoRes = simulateWorld(controlScenario, 'FEFO', 'FIXED');

  assert.equal(fifoRes.totalSoldUnits, fefoRes.totalSoldUnits, 'Sold units must coincide');
  assert.equal(fifoRes.totalWasteUnits, fefoRes.totalWasteUnits, 'Waste units must coincide');
  assert.equal(fifoRes.totalLostUnits, fefoRes.totalLostUnits, 'Lost units must coincide');
});

test('SHELFLIFE Contract 3: Four-World Factorial Attribution Identity', () => {
  // Test on full 60-day scenario
  const scenario = generateScenario('sku-sourdough', 101, 60);
  const analysis = runFourWorldAnalysis(scenario);

  // Invariant: issuingContrast + orderingContrast + interaction == jointDifference
  const calculatedJoint = analysis.issuingContrast + analysis.orderingContrast + analysis.interaction;
  assert.equal(
    calculatedJoint,
    analysis.jointDifference,
    `Attribution bridge must strictly balance: ${calculatedJoint} === ${analysis.jointDifference}`
  );
  assert.equal(analysis.balancePreserved, true);

  // Test on Interaction Probe scenario from feasibility-checks.mjs
  const probeScenario = getInteractionProbeScenario();
  const probeAnalysis = runFourWorldAnalysis(probeScenario);

  assert.equal(probeAnalysis.W00.totalWasteUnits, 5, 'W00 waste in probe must be 5');
  assert.equal(probeAnalysis.W10.totalWasteUnits, 5, 'W10 waste in probe must be 5');
  assert.equal(probeAnalysis.W01.totalWasteUnits, 5, 'W01 waste in probe must be 5');
  assert.equal(probeAnalysis.W11.totalWasteUnits, 0, 'W11 waste in probe must be 0');
  assert.equal(probeAnalysis.interaction, -5, 'Interaction effect in probe must equal -5 units');
});

test('SHELFLIFE Contract 4: Full Inventory Conservation & Demand Balance', () => {
  const scenario = generateScenario('sku-yogurt', 202, 30);
  const result = simulateWorld(scenario, 'FEFO', 'BASE_STOCK');

  // 1. Inventory Conservation: Opening + Accepted = Sold + Expired + Closing
  const totalInflow = result.openingUnits + result.totalAcceptedUnits;
  const totalOutflow = result.totalSoldUnits + result.totalWasteUnits + result.closingUnits;
  assert.equal(
    totalInflow,
    totalOutflow,
    `Inventory conservation must balance: inflow (${totalInflow}) === outflow (${totalOutflow})`
  );

  // 2. Demand Balance: Requested = Fulfilled + Lost
  assert.equal(
    result.totalRequestedUnits,
    result.totalSoldUnits + result.totalLostUnits,
    `Demand balance must balance: requested (${result.totalRequestedUnits}) === sold + lost`
  );
});

test('SHELFLIFE Contract 5: Strict Future Demand Isolation', () => {
  const scenarioA = generateScenario('sku-salad', 303, 30);

  // Scenario B: identical up to day 10, but radically different demand on day 20
  const scenarioB = {
    ...scenarioA,
    dailyDemands: scenarioA.dailyDemands.map(d => {
      if (d.day >= 20) {
        return { ...d, requestedUnits: 999 };
      }
      return { ...d };
    })
  };

  const resA = simulateWorld(scenarioA, 'FEFO', 'BASE_STOCK');
  const resB = simulateWorld(scenarioB, 'FEFO', 'BASE_STOCK');

  // Verify that on day 0 through day 10, all receipts, orders, and decisions are IDENTICAL
  for (let day = 0; day <= 10; day++) {
    const rA = resA.dailyReceipts[day];
    const rB = resB.dailyReceipts[day];
    assert.equal(rA.demandFulfilled, rB.demandFulfilled, `Day ${day} fulfilled must be identical`);
    assert.equal(rA.orderPlaced?.quantity, rB.orderPlaced?.quantity, `Day ${day} order must be identical`);
    assert.equal(rA.closingUnits, rB.closingUnits, `Day ${day} closing units must be identical`);
  }
});
