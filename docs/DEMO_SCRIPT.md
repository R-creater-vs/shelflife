# SHELFLIFE Demo Script: 60-Second Executive Walkthrough

**Target Audience:** VP of Supply Chain / Lead Operations Research Engineer / Head of Grocery & Quick-Commerce Logistics  
**Core Thesis:** *"When you switch your warehouse to FEFO or tighten your order points, neither change acts alone. SHELFLIFE unrolls the 4 counterfactual parallel worlds to show exactly which policy eliminated waste, which averted lost sales, and how much was created by their non-linear interaction."*

---

## Act I: The Real Warehouse Problem (0:00 - 0:15)
*Open browser to the Four-World View with SKU `MILK-1L` selected.*

> "In perishable retail, supply chain teams often announce: *'We switched our pickers from FIFO to FEFO and waste dropped by 30%!'*  
> Or the forecasting team says: *'We deployed dynamic shelf-life-aware base stock reordering, and holding waste fell by 25%!'*  
> But if you implement both together, the total savings is rarely the sum of the parts. In fact, they collide non-linearly.  
> This is SHELFLIFE: an in-browser deterministic perishable inventory twin that simulates 4 parallel universes over the identical customer demand trace to prove exact factorial attribution down to the single unit and rupee."

---

## Act II: The 4 Parallel Worlds (0:15 - 0:30)
*Hover over the 4 World Cards in the Four-World Waterfall View.*

> "Here are the four counterfactual worlds:
> 1. **World 00 (Legacy Baseline):** FIFO issuing, naive base-stock ordering. Notice our waste: ₹15,640 and 7.8% lost sales.
> 2. **World 10 (Issuing Only):** FEFO picking, naive reordering. Waste drops, but stockouts remain.
> 3. **World 01 (Ordering Only):** FIFO picking, shelf-life-aware reordering.
> 4. **World 11 (Joint System):** FEFO picking + shelf-life-aware reordering.
>
> Look at the attribution waterfall below:  
> Notice how the pure issuing policy contributes $-\Delta_{\text{issue}}$, pure ordering contributes $-\Delta_{\text{order}}$, but there is a non-zero **interaction term** $I = W_{11} - W_{10} - W_{01} + W_{00}$.  
> In perishable inventory, $I$ is negative: joint adoption saves *more* than independent sum because FEFO clears older stock before reorders arrive, preventing the pile-up cascade."

---

## Act III: Batch Theatre & Day Scrubber (0:30 - 0:45)
*Click tab **Batch Theatre**, drag day scrubber across Days 8 to 18.*

> "Switch over to the **Batch Theatre**.  
> Here we see individual discrete batches moving across time. Each batch has an immutable arrival date, batch ID, and hard expiry timestamp.  
> Under FIFO on the left, an older batch sits in the back of the queue while newer stock arriving behind it is ignored until demand catches up, leading to a sudden expiry cliff on Day 14.  
> Under FEFO on the right, the simulator picks from the batch with the closest expiry date first. Watch the lifeline shrink to zero waste before the expiry boundary."

---

## Act IV: Policy Bench & Daily Receipts (0:45 - 1:00)
*Switch to **Policy Bench**, adjust shelf-life target, then click **Daily Receipts Drawer**.*

> "In the **Policy Bench**, we can tune holding cost, disposal penalty, lead time, and base-stock target.  
> Notice that every single transition obeys our strict Conservation Identity:
> $$\text{Starting Stock} + \text{Received} = \text{Sold} + \text{Expired} + \text{Ending Stock}$$
> Zero float drift, zero phantom stock, all costs tracked in integer Indian paise.  
> Everything runs 100% client-side in WebAssembly/TypeScript in under 2 milliseconds per 60-day year, complete with scenario export and print-ready PDF briefs."
