# SHELFLIFE — Four-World Waste Explainer

Portfolio expansion 02 of 07 · Gemini 3.8 Flash / Antigravity · Self-contained build specification

**Idea:** A four-world waste explanation lab that separates issuing-policy effects, ordering-policy effects, and their interaction.

**Recruiter-facing moment:** “Both stores received the same stock and demand. This batch-selection decision explains why one threw stock away.”

---
## BUILD PROMPT

Build **SHELFLIFE**, a four-world waste explanation laboratory for a fictional campus food counter. Implement the actual simulation, a fair policy benchmark, a batch-level visual explanation, and replayable exports. The policy interaction decomposition specified below is mandatory; a two-policy comparison alone is incomplete.

I am a BCA Data Analytics student. My portfolio already contains retail revenue exploration and forecasting. This project adds inventory state transitions and operational decisions. Historical sales are not the same as demand; never manufacture inventory outcomes from a transaction dataset that has no stock or expiry fields.

### 1. Constraints and architecture

Core budget is ₹0 additional service spending. Use React, strict TypeScript, Vite, SVG/ECharts, a Web Worker, and local fixtures. No paid API, hosted backend, account, runtime LLM, Docker, or GPU. Python may be used for an independent reference check, but normal demo startup must need only Node dependencies and the bundled fixtures.

Use a pure TypeScript simulator shared by the worker and benchmark CLI. Organize `src/domain`, `src/simulation`, `src/policies`, `src/workers`, `src/features`, `fixtures`, `scripts`, `tests`, and `docs`. Charts read simulation receipts; they must not own business logic.

Inspect repository instructions and existing files first. Keep `BUILD_STATUS.md` updated after each verified milestone. Choose compatible dependencies, lock them, and consult official documentation for uncertain APIs.

### 2. User problem and exact scope

A small operator wants to compare policies before changing how stock is issued or ordered. The lab asks:

**“Under these explicit demand and supplier assumptions, which policy combination trades less waste for acceptable availability?”**

The core models one outlet and one SKU at a time, with three selectable fictional SKUs. Comparisons run independently per SKU; do not imply shared cold-storage capacity is modeled unless implemented. There are no actual orders, customers, payments, supplier integrations, or food-safety recommendations.

Support two issuing policies: first-in-first-out (FIFO) by receipt time, and first-expiry-first-out (FEFO) by expiry time. Support two ordering policies: fixed daily quantity and a base-stock target based on a trailing demand estimate. Keep these two decisions separate in the UI.

### 3. Data and units

Generate a clearly labeled synthetic, versioned 60-day scenario:

```text
sku: id, name, unitCostPaise, sellingPricePaise
batch: id, skuId, receivedDay, expiryDayExclusive, initialUnits
demand: day, skuId, requestedUnits
purchaseOrder: id, placedDay, arrivalDay, quantity, shelfLifeOnArrivalDays
scenario: seed, horizonDays, openingBatches, supplierRules, costAssumptions
```

Use integer units and integer paise. Require nonnegative quantities and costs. Define expiry as exclusive: an expiryDayExclusive of 3 permits selling on days 0, 1, and 2, but not day 3.

V1 supplier lead time is at least one full day. Shelf life at receipt can vary by batch and may make newer batches expire sooner. That is the key case where FIFO and FEFO differ. Invalid or already expired arrivals go to an explicit rejected receipt bucket.

Preserve random exogenous demand and delivery realizations independently of policy execution. Generate them before running policies so a different number of random draws cannot unfairly give one policy easier demand.

### 4. Simulation contract

For each day, execute:

1. Remove expired opening units to waste.
2. Receive scheduled deliveries; reject invalid/expired units and record capacity-free receipt.
3. Observe this day's demand, issue sellable stock under the selected FIFO/FEFO rule, and record unmet demand as lost sales.
4. Accrue holding cost on closing sellable units.
5. Place next replenishment order using only demand observed through this day and the declared pipeline inventory.

Do not backorder lost sales in v1. Resolve ties by stable batch ID. Partial batch issues must be supported.

For the base-stock rule, estimate next lead-time-plus-review-period demand from a trailing seven-day mean of **observed demand in this synthetic experiment**, with a documented warm-up default. An operator would not ordinarily observe all lost demand; explicitly state that assumption. Order `max(0, target - onHand - onOrder)` rounded up to the declared pack multiple, then apply a documented maximum-order bound. Demand estimates cannot inspect tomorrow.

Use a fixed safety-unit parameter; do not call it statistically calibrated service protection. An optional later extension can compare a sales-only estimator to the known-demand estimator.

Maintain conservation:

```text
opening units + accepted receipts
  = sold + expired waste + closing sellable inventory
requested units = fulfilled units + lost units
```

Report rejected receipts separately. Each transition produces a batch receipt with before, action, after, day, and policy reason.

Costs: procurement + holding + disposal + user-specified lost-unit penalty. Label the last term a hypothetical planning penalty, not measured lost profit. Show sales value separately. Avoid double-counting procurement cost as disposal cost; disposal is an additional handling assumption.

### 5. Hand-checkable distinguishing case

At day 0, batch A contains 5 units, received day -2, expiring exclusively on day 4. Batch B contains 5 units, received day -1, expiring exclusively on day 1. No deliveries. Demand is 5 on day 0 and 5 on day 1.

FIFO sells A first; B expires before day-1 sales. Result: 5 sold, 5 wasted, 5 lost demand.

FEFO sells B first, then A. Result: 10 sold, 0 wasted, 0 lost demand.

The UI must compute these outcomes from receipts. Add the control where receipt order equals expiry order; policies should coincide. FEFO is not a universal proof of optimal replenishment or real-world savings.

### 6. Product views

**Mandatory differentiating mechanism — four-world policy attribution:** A FIFO/FEFO comparison alone is not this project. For identical exogenous inputs, run the four combinations of FIFO/FEFO and fixed/base-stock ordering. Let waste be W00, W10, W01, W11, with the first bit changing issuing and the second ordering. Compute:

```text
issuing contrast at baseline ordering = W10 - W00
ordering contrast at baseline issuing = W01 - W00
interaction = W11 - W10 - W01 + W00
joint difference = W11 - W00
```

The two baseline contrasts plus interaction must equal the joint difference. Show that assigning the entire improvement to one policy can be misleading when interaction is nonzero. Also show the issuing contrast under changed ordering, W11-W01.

Link each world to its actual batch receipts. Use stable IDs for shared opening batches and scheduled exogenous deliveries; policy-created orders may exist in only some worlds and must be labeled world-specific. Never fabricate one-to-one matches for batches not shared.

Provide a four-panel “same day, different choices” view and an additive attribution bridge. This is factorial simulation analysis, not causal attribution for a real store or a newly invented statistical method. Implement an independently checked arithmetic fixture and conservation checks in each world. Require this view, its exported four-world receipt bundle, and an interaction example for completion.

**Batch theatre:** Horizontal lifelines for each batch, with receipt, sale segments, remaining stock, and expiry. A day scrubber updates the side-by-side policies. Selecting a lost-demand day highlights which batches were unavailable and why.

**Policy bench:** Configure issue rule, order rule, target, pack size, lead time, and hypothetical cost weights. Show actual simulated outcomes and a visible “rerun required” state when inputs change.

**Tradeoff frontier:** Plot waste fraction against unit fill rate and annotate cost. Define waste fraction as expired units divided by opening-plus-accepted units; fill rate as fulfilled/requested. Zero denominators render unavailable. Highlight nondominated evaluated configurations, not “globally optimal” ones.

**Batch receipt drawer:** Source batch, each movement, conservation total, and which prior observation triggered an order. Provide a small table alongside the visual.

**Scenario notebook:** Import/export validated JSON, generator manifest, assumptions, policy definitions, benchmark results, and printable decision brief. Export all configuration needed to rerun the scenario.

### 7. Visual design

Use warm off-white `#F7F2E9`, deep plum `#352642`, leaf green `#386947`, and restrained apricot `#E4A16E`. Use stacked batch ribbons and stock-age distributions as the main visual identity. Avoid repeating TRACE's financial KPI-card layout.

Animations should follow recorded stock movement and pause with the scrubber. Use labels and patterns for expired, sold, and remaining units. Include keyboard-operable sliders and numeric alternatives, reduced motion, clear empty/error states, 200% zoom, and mobile stacked comparisons.

### 8. Fair evaluation and tests

Evaluate all four issue/order combinations on at least 30 predeclared scenario seeds, three demand regimes, and fixed parameter grids. Keep tuning scenarios separate from evaluation scenarios. Publish complete per-run outcomes and paired policy differences. If summarizing uncertainty, resample whole independent scenario runs, not individual dependent days.

No policy is required to win. Show cases where reduced waste increases stockouts or cost. Keep a table of assumptions that drive the result.

Production-engine tests: canonical FIFO/FEFO example, equal-expiry ties, expiry equality, partial batches, no demand, no stock, pack rounding, delayed delivery, full conservation at every day, deterministic seeds, input immutability, no future-demand access, and import/export reproduction. A reference implementation on tiny cases should be written independently.

Playwright journey: open canonical scenario → run both policies → select expired B → view its receipt → change a policy → recompute → export/import → reproduce totals. Inspect at 390/1024/1440px with keyboard and reduced motion.

### 9. Milestones and completion

1. Specify `docs/SIMULATION_CONTRACT.md`; implement and test the tiny example.
2. Connect actual simulation receipts to a working batch theatre.
3. Add ordering, tradeoff evaluation, and repeatable scenario import/export.
4. Execute the full benchmark, inspect screenshots, fix visual and logic defects.
5. Deliver documentation and a measured portfolio demonstration.

Ship `npm run dev`, `build`, `preview`, `test`, `test:e2e`, `benchmark`; lockfile; reusable engine; synthetic generator; raw benchmark output; README; assumptions; prior art; validation; performance; five genuine screenshots; a 60-second script; and interview notes.

LinkedIn hook after verification: “I built a simulator where every expired item has an explanation.” Use actual fixture or benchmark outcomes and label simulation. Never claim money or food saved by a real business.

Interview notes must explain why sales censor demand, why common inputs matter, why FEFO can differ from FIFO, and why an evaluated frontier is not global optimality.

### 10. Prior work

Review [Stockpyl](https://github.com/LarrySnyder/stockpyl), the close [perishable-inventory decision lab](https://github.com/DiogoRibeiro7/perishable-inventory-decision-lab), and [FEFO inventory analysis](https://github.com/dech6/inventory-analysis-case).

Inventory simulation and FEFO are established. The intended contribution is an inspectable batch-level explanation, shared-demand comparisons, and exportable counterexamples showing when receipt order disagrees with expiry order. Do not describe a standard policy comparison as a new algorithm.

Begin milestone 1 now. Completion requires the real batch simulator, reconciled receipts, a measured multi-seed comparison, and the working browser journey.

### Continuation prompt

Read PROJECT_SPEC.md and BUILD_STATUS.md. Resume the first incomplete milestone in the existing SHELFLIFE code. Preserve day ordering, exclusive expiry, conservation, shared exogenous inputs, and synthetic labels. Run the production engine before styling new views. Record actual checks.

### Final audit prompt

Verify SHELFLIFE using the hand fixture and independent small reference. Trace every unit under both policies, test expiry boundaries and future-demand isolation, rerun the paired benchmark, and reproduce an exported scenario. Fix defects before preparing any business-impact claims.
