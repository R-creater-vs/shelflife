# SHELFLIFE — Prior Art & Technical Attribution

**Author:** Shobal Sabu (BCA Data Analytics Portfolio)  
**Date:** 20 October 2026  

---

## 1. Academic & Industrial Foundations

Perishable inventory modeling and batch-level issuing rules have a rich history spanning over fifty years of operations research. SHELFLIFE builds upon these established concepts and does not claim to have invented FEFO issuing, base-stock replenishment, or factorial analysis.

| Pioneer System / Literature | Core Principles Established | SHELFLIFE Focus & Differentiation |
| :--- | :--- | :--- |
| **[Stockpyl](https://github.com/LarrySnyder/stockpyl)** (Snyder et al.) | Open-source Python library for supply chain and inventory optimization models (base-stock, $(s, S)$, multi-echelon). | Translates abstract mathematical inventory equations into an interactive, visual batch-level lifecycle theatre in the browser. |
| **[Perishable Inventory Decision Lab](https://github.com/DiogoRibeiro7/perishable-inventory-decision-lab)** | Simulation of perishable retail inventory policies and shelf-life tracking. | Adds a strict **Four-World Factorial Decomposition**, proving why non-zero interaction terms prevent attributing waste reduction solely to one policy. |
| **[FEFO Inventory Analysis Case](https://github.com/dech6/inventory-analysis-case)** | Comparison of FIFO vs. FEFO issuing policies in grocery warehousing. | Enforces identical exogenous demand and delivery schedules, guaranteeing that differences stem purely from policy decisions. |
| **Nahmias (1982)**, *Perishable Inventory Theory: A Review* (Operations Research) | Foundational theory on fixed-lifetime inventory models, FIFO vs. LIFO depletion, and critical order quantities. | Grounded in integer paise and discrete batch conservation; exports reproducible JSON scenarios for regression audits. |

---

## 2. System Boundaries & Honest Limitations

1. **Exogenous vs. Endogenous Demand**: In real supermarkets, customers may dig through shelves to pick the newest expiration date (LIFO customer behavior) while operators push FEFO. SHELFLIFE models an operator-controlled counter where staff issue batches directly.
2. **Censored Demand**: In our base model, lost demand is observed. In real physical stores, when a shelf is empty, true demand is censored because lost customers rarely report their intent.
3. **Discrete Factorial Scope**: The four-world decomposition uses standard $2^2$ factorial experimental design. It decomposes the specific discrete policies evaluated; it does not claim to find the global continuous optimum across all replenishment intervals.
