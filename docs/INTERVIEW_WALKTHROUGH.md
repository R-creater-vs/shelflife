# SHELFLIFE: Senior Supply Chain & Operations Research Interview Walkthrough

This document prepares you for technical and behavioral interviews for Senior/Staff Operations Research, Supply Chain Optimization, and Distributed Systems roles (e.g., Blinkit, Zepto, Amazon SCOT, Instacart, Walmart Global Tech, Deliveroo).

---

## 1. System Design & Architectural Framing

### Q: "Why build a discrete-event simulator for perishable inventory instead of using an analytical model like $(s, S)$ or Newsvendor?"
**Answer:**
> "The classic Newsvendor formula assumes single-period single-batch dynamics with linear disposal. Classic $(s, S)$ policies or base-stock models (e.g., Scarf, Clark-Scarf) assume infinite or constant shelf-life where items never expire.
>
> When shelf-life $m$ is finite ($m \ge 2$) with non-zero lead times $L \ge 1$:
> 1. The inventory state is no longer a scalar $I_t$, but an $m$-dimensional vector $\mathbf{x}_t = (x_{t,1}, x_{t,2}, \dots, x_{t,m})$ representing stock aged $1, \dots, m$ periods (Nahmias 1982).
> 2. The optimal policy is notoriously high-dimensional and non-stationary. As proven by Fries (1975) and Nahmias (1976), the optimal replenishment policy is not a simple base-stock policy because the decision to order depends on the age vector of existing on-hand inventory.
> 3. SHELFLIFE uses deterministic counterfactual replay: we evaluate exact FIFO vs. FEFO issuing policies crossed factorially with naive base-stock vs. shelf-life-aware inventory position adjustments over empirical discrete customer demand vectors."

---

## 2. Mathematical Rigor & Factorial Decomposition

### Q: "Explain the Four-World Factorial Decomposition. Why is there an interaction term?"
**Answer:**
> "Consider two binary interventions:
> - Factor $A$ (Issuing rule): $0 = \text{FIFO}$ (First-In, First-Out), $1 = \text{FEFO}$ (First-Expired, First-Out).
> - Factor $B$ (Replenishment rule): $0 = \text{Naive Base-Stock}$, $1 = \text{Shelf-Life Aware}$.
>
> This gives four parallel simulation runs over identical demand $\{d_t\}_{t=1}^T$:
> - $W_{00}$: Baseline (FIFO, Naive)
> - $W_{10}$: Issuing only (FEFO, Naive)
> - $W_{01}$: Ordering only (FIFO, Shelf-Aware)
> - $W_{11}$: Joint policy (FEFO, Shelf-Aware)
>
> Let $Y(W)$ be any outcome metric (e.g., Total Units Expired or Total Net Cost).
> The standard factorial attribution identity is:
> $$\Delta_{\text{total}} = Y(W_{11}) - Y(W_{00})$$
> $$\Delta_{\text{issue}} = Y(W_{10}) - Y(W_{00})$$
> $$\Delta_{\text{order}} = Y(W_{01}) - Y(W_{00})$$
>
> Crucially, $\Delta_{\text{total}} \ne \Delta_{\text{issue}} + \Delta_{\text{order}}$. The discrepancy is the **interaction effect**:
> $$I = \Delta_{\text{total}} - (\Delta_{\text{issue}} + \Delta_{\text{order}}) = Y(W_{11}) - Y(W_{10}) - Y(W_{01}) + Y(W_{00})$$
>
> In perishable inventory, $I$ is frequently non-zero (verified $-5\text{ units}$ in our canonical fixture). Under FIFO, a high inventory position causes old batches to linger and rot behind newer arrivals. When FEFO is combined with shelf-aware ordering, the shelf-aware ordering prevents reorders when young batches are arriving, and FEFO prioritizes clearing older batches before those new ones arrive. They amplify each other synergistically."

---

## 3. Financial Integrity: Integer Paise vs Floating Point

### Q: "Why did you implement all accounting in integer paise rather than JavaScript `Number` or IEEE-754 floats?"
**Answer:**
> "In inventory ledgers that accumulate over 60–365 days across thousands of batch splits and holding charges:
> - Floating point representation introduces non-associative accumulation errors: `0.1 + 0.2 !== 0.3`.
> - Even tiny rounding drifts ($\pm 0.0000001$) break strict conservation audits: $\text{Opening} + \text{Receipts} = \text{Closing} + \text{Sales} + \text{Waste}$.
> - We define monetary values as integer Indian paise ($1 \text{ INR} = 100 \text{ paise}$). All unit calculations use integer units and integer paise. The result is 100% exact penny-accurate financial ledgers with zero drift."

---

## 4. Edge Cases Handled in the Simulation Loop

### Q: "What order of operations did you choose for the daily simulation cycle and why?"
**Answer:**
> "A realistic supply chain daily loop must prevent cheating (e.g. using today's sales to offset morning spoilage or using afternoon deliveries to satisfy morning demand without transit delay).
>
> SHELFLIFE enforces a strict 5-stage daily transition:
> 1. **Morning Expiry Audit (00:00 - 06:00):** Batches whose `expiryDayExclusive <= currentDay` are purged to the waste ledger. They cannot be sold today.
> 2. **Inbound Delivery Intake (06:00 - 08:00):** Purchase orders placed $L$ days ago that mature today (`expectedArrivalDay == currentDay`) are admitted to on-hand inventory.
> 3. **Demand Realization & Fulfillment (08:00 - 20:00):** Customer demand is realized. Depending on the issuing policy (FIFO or FEFO), batches are drained. If on-hand stock is insufficient, unmet demand is recorded as `unmetUnits` (lost sales or backorders).
> 4. **EOD Holding Cost Assessment (20:00 - 23:59):** Remaining stock on hand incurs holding cost based on unit cost $\times h$.
> 5. **Replenishment Reordering (23:59):** Inventory position is computed: $\text{IP} = \text{On-Hand} + \text{On-Order}$. If $\text{IP} < S$, a new purchase order is emitted with maturation at $t + L$. Under shelf-life-aware ordering, stock expiring before $t+L$ is discounted from effective inventory position."
