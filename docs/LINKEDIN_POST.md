# LinkedIn Post Draft: SHELFLIFE

---

Most grocery supply chain teams believe that switching warehouse pickers from FIFO to FEFO is an independent improvement from reorder point optimization.

They test FEFO in one depot, tweak base-stock safety buffers in another, and then add the savings together in a spreadsheet:
Total Savings = Issuing Savings + Ordering Savings.

Except that's mathematically false. 📉

In perishable inventory with finite shelf life and non-zero lead time, policy changes don't add up cleanly—they interact. Sometimes they amplify each other; sometimes they cannibalize each other.

To prove this, I built **SHELFLIFE**: a deterministic, browser-based discrete-event perishable inventory twin with exact **Four-World Factorial Attribution**.

Here is what happens under the hood:

### 1. The 4 Parallel Universes
For every product scenario, SHELFLIFE simulates four counterfactual worlds simultaneously over the identical customer demand vector:
- **World 00:** FIFO Picking + Naive Base-Stock Reordering (Baseline)
- **World 10:** FEFO Picking + Naive Base-Stock Reordering
- **World 01:** FIFO Picking + Shelf-Life Aware Reordering
- **World 11:** FEFO Picking + Shelf-Life Aware Reordering (Joint)

### 2. The Factorial Attribution Waterfall
Because all four worlds face the exact same arrival and demand events, we decompose the total waste reduction $\Delta_{\text{total}}$ into:
$$\Delta_{\text{total}} = \Delta_{\text{issue}} + \Delta_{\text{order}} + I$$

Where $I = W_{11} - W_{10} - W_{01} + W_{00}$ is the non-linear interaction effect. 

In our 90-trial empirical benchmark across 3 fresh grocery categories (dairy, berries, prepared salads):
- FEFO alone averted an average of 42% of waste.
- Shelf-aware ordering alone prevented over-ordering during low-velocity periods.
- But the interaction term $I$ was consistently negative: adopting both together averted *more* waste than the sum of the two isolated policies. Why? Because FEFO empties near-expiry batches before fresh pipeline orders arrive, breaking the pile-up death spiral.

### 3. Visual Batch Theatre & Zero-Drift Financials
- **Batch Theatre:** Interactive scrubber that lets you trace every individual batch through its lifespan—from receiving dock to picking bin to customer basket or morning disposal cliff.
- **Integer Paise Financial Ledger:** Zero IEEE-754 floating-point drift. Every unit, rupee, and paisa satisfies the conservation law:
  $$\text{Opening Stock} + \text{Received} \equiv \text{Sold} + \text{Expired} + \text{Closing Stock}$$
- **100% Client-Side:** Written in TypeScript + React + Vite, executing 90 full 60-day parallel simulations in 77 milliseconds.

Zero paid APIs, zero cloud compute costs, pure deterministic operations research.

Live Demo & Code: [Link in comments]

What is the biggest operational hurdle you've faced when transitioning a dark store or fulfillment center from FIFO to FEFO? Pick-face density? Scanner latency? Picker compliance?

#SupplyChain #OperationsResearch #Logistics #InventoryManagement #TypeScript #SystemsEngineering #QuickCommerce
