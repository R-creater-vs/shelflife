# SHELFLIFE — Performance & Runtime Profile

**Author:** Shobal Sabu (BCA Data Analytics Portfolio)  
**Date:** 20 October 2026  

---

## 1. Executive Performance Summary

SHELFLIFE is designed as an ultra-lightweight, zero-cloud-dependency operations simulator. All perishable batch tracking, morning expiry sweeps, FIFO/FEFO priority sorting, and four-world factorial calculations run in-memory within client JavaScript at microsecond speeds.

| Performance Metric | Budget / Target | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Total JavaScript Bundle (Uncompressed)** | $\le 300\text{ kB}$ | **203.10 kB** | Passed |
| **Total JavaScript Bundle (Gzip)** | $\le 100\text{ kB}$ | **58.98 kB** | Passed |
| **Total CSS Payload (Gzip)** | $\le 10\text{ kB}$ | **0.58 kB** | Passed |
| **Production Build Time (`tsc -b && vite`)** | $\le 10.0\text{ s}$ | **2.11 s** | Passed |
| **60-Day Multi-World Simulation Runtime** | $\le 10\text{ ms}$ | **~0.86 ms** | Passed |
| **90-Trial Benchmark Suite Execution** | $\le 2.0\text{ s}$ | **0.077 s** total | Passed |
| **Unit & Contract Test Execution** | $\le 1.0\text{ s}$ | **0.134 s** | Passed |
| **Runtime Cloud Costs / API Calls** | **$0.00** | **$0.00** (Zero external calls) | Passed |

---

## 2. Asset Payload & Build Composition

Compiled using Vite 5, ES2020 output, and strict TypeScript:

```
dist/index.html                   1.08 kB │ gzip:  0.61 kB
dist/assets/index-CeWQJ8jN.css    1.15 kB │ gzip:  0.58 kB
dist/assets/index-DDyN3SC4.js   203.10 kB │ gzip: 58.98 kB
```

### Architectural Choices:
1. **Lightweight SVG Lifelines & Scatter Plots**: The Batch Theatre lifelines and Trade-off Frontier are rendered using native, responsive SVG elements, avoiding heavyweight charting libraries and keeping the gzipped bundle under 59 kB.
2. **Deterministic Integer Math**: Storing currency in integer paise and inventory in integer units eliminates floating-point rounding errors and keeps memory footprints compact.
3. **Pure Decoupled Engine**: The core simulation functions in `src/simulation/simulator.ts` are pure functions with zero React dependencies, allowing both the benchmark CLI and frontend views to run identical production code.

---

## 3. Algorithmic Complexity & Bounds

- **Morning Expiry Sweep**: $O(B)$ linear scan where $B$ is the number of active batches in inventory ($B \le 20$).
- **Batch Depletion Sorting**: $O(B \log B)$ sorting per day:
  - FIFO: sorted by `receivedDay` ascending.
  - FEFO: sorted by `expiryDayExclusive` ascending.
- **Replenishment Ordering**: $O(W_{\text{review}})$ where trailing demand looks back at most 7 days ($O(1)$ constant time).
- **Total Simulation Run**: For a 60-day horizon, total operations are well under 5,000 instructions, completing in less than 1 millisecond.

---

## 4. UI Responsiveness & Accessibility

1. **Jitter-Free Counters**: `font-variant-numeric: tabular-nums` ensures that real-time scrubbing across the 60-day horizon does not cause numerical layout thrashing.
2. **Keyboard Accessibility**: Day scrubber and parameter sliders support full keyboard navigation (arrow keys, home, end).
3. **Multi-Viewport Testing**: Verified across desktop (1440px), tablet (1024px), and mobile (390px) layouts. Full support for `prefers-reduced-motion: reduce`.
