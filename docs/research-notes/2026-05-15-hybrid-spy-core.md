# Hybrid SPY Core Test - 2026-05-15

Source reports:

- Hybrid summary: `reports/hybrid-spy-core-relative-strength-2026-05-15.csv`
- Hybrid equity audit: `reports/hybrid-spy-core-relative-strength-2026-05-15-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`

Universe:

- Active sleeve: `universes/sp500-top100-established.txt`
- `96` current large-cap S&P 500 symbols
- Passive core: `SPY`

Hybrid setup:

- Core sleeve: buy-and-hold `SPY`
- Active sleeve: current best relative-strength trend-following setup
- No periodic rebalancing between sleeves
- Initial allocation only: `activeAllocationPct=10,20,30,40`

Active sleeve settings:

- `gapAwareFills=true`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=5`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1`
- `relativeStrengthSymbol=SPY`
- `relativeStrengthLookback=63,84`

## Executive Summary

This is one of the more constructive tests in the recent rescue phase.

The hybrid version does not magically crush the market, but it does improve the overall profile versus pure `SPY` in several average metrics. The best average row is:

```text
60% SPY core
40% active trend sleeve
relativeStrengthLookback=84
```

Average result:

- return: `59.02%`
- CAGR: `13.07%`
- max drawdown: `23.17%`
- return/drawdown: `2.660`
- Sharpe: `0.836`
- Sortino: `1.151`

Average `SPY` benchmark:

- return: `55.30%`
- CAGR: `12.39%`
- max drawdown: `25.95%`
- return/drawdown: `2.272`
- Sharpe: `0.764`
- Sortino: `1.037`

So the best hybrid row beats `SPY` by:

- `+3.72` percentage points of average total return,
- `+0.69` percentage points of average CAGR,
- `-2.78` percentage points of average max drawdown,
- `+0.388` return/drawdown,
- `+0.073` Sharpe.

That is genuinely better than the previous "active strategy as full replacement" framing.

But the result is still ambiguous. Most of the upside advantage comes from the `2023-2026` window. In the earlier windows, the hybrid often improves drawdown and Sharpe but does not consistently beat `SPY` on return or CAGR.

The current interpretation:

> The active sleeve looks more useful as a supplement to SPY than as a replacement for SPY, but the edge is still not large or consistent enough to treat as proven.

## Average Results By Allocation

| Active Allocation | RS Lookback | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `63` | `54.50%` | `12.24%` | `24.96%` | `2.310` | `0.776` | `1.058` | `98.15%` |
| `10%` | `84` | `55.50%` | `12.45%` | `24.94%` | `2.363` | `0.788` | `1.076` | `97.99%` |
| `20%` | `63` | `57.14%` | `12.63%` | `23.86%` | `2.502` | `0.807` | `1.105` | `96.61%` |
| `20%` | `84` | `56.09%` | `12.51%` | `24.03%` | `2.456` | `0.803` | `1.101` | `96.14%` |
| `30%` | `63` | `57.50%` | `12.78%` | `23.07%` | `2.619` | `0.832` | `1.138` | `94.94%` |
| `30%` | `84` | `57.50%` | `12.75%` | `23.27%` | `2.599` | `0.824` | `1.135` | `94.30%` |
| `40%` | `63` | `57.56%` | `12.64%` | `22.95%` | `2.646` | `0.823` | `1.121` | `93.29%` |
| `40%` | `84` | `59.02%` | `13.07%` | `23.17%` | `2.660` | `0.836` | `1.151` | `92.50%` |

The broad pattern is encouraging:

- increasing the active sleeve generally lowers drawdown,
- increasing the active sleeve generally improves return/drawdown,
- increasing the active sleeve generally improves Sharpe,
- average exposure falls because the active sleeve is not always fully invested.

The best average row is `40% active / RS 84`. The best drawdown row is `40% active / RS 63`.

That said, the return improvement is modest. The best CAGR is `13.07%`, compared with `12.39%` for `SPY`. That is better, but not a giant gap.

## Benchmark Context

| Benchmark | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `3.971` | `1.042` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` |
| Best hybrid: `40% active`, `RS 84` | `59.02%` | `13.07%` | `23.17%` | `2.660` | `0.836` |

This is the first framing where the current strategy variant looks meaningfully useful against `SPY`.

The hybrid beats `SPY` on average CAGR, drawdown, return/drawdown, and Sharpe. It also beats `QQQ` on average drawdown and Sharpe, though not on return or CAGR.

It still does not come close to same-universe equal-weight buy-and-hold. That comparison remains hindsight-biased because the universe is built from current large-cap winners, but it is still a useful reminder: the active sleeve is not extracting anything like the full upside from this stock set.

## Range-Level Results

### `2020-2024`

| Active Allocation | RS Lookback | Return | CAGR | Max DD | Sharpe | SPY CAGR Delta | SPY DD Delta |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `63` | `77.74%` | `12.20%` | `30.82%` | `0.685` | `-0.33%` | `-3.28%` |
| `10%` | `84` | `77.57%` | `12.18%` | `30.82%` | `0.682` | `-0.35%` | `-3.28%` |
| `20%` | `63` | `82.40%` | `12.78%` | `27.50%` | `0.742` | `+0.25%` | `-6.60%` |
| `20%` | `84` | `78.16%` | `12.25%` | `27.50%` | `0.713` | `-0.28%` | `-6.60%` |
| `30%` | `63` | `73.87%` | `11.71%` | `24.91%` | `0.718` | `-0.82%` | `-9.19%` |
| `30%` | `84` | `77.71%` | `12.20%` | `25.70%` | `0.736` | `-0.33%` | `-8.40%` |
| `40%` | `63` | `73.38%` | `11.64%` | `23.86%` | `0.740` | `-0.89%` | `-10.24%` |
| `40%` | `84` | `75.13%` | `11.87%` | `25.37%` | `0.741` | `-0.66%` | `-8.73%` |

`SPY` for this range:

- return: `80.40%`
- CAGR: `12.53%`
- max drawdown: `34.10%`
- Sharpe: `0.667`

This range is mostly a drawdown improvement story. The hybrid usually does not beat `SPY` on CAGR, except for `20% active / RS 63`, but it consistently reduces drawdown and improves Sharpe.

### `2021-2023`

| Active Allocation | RS Lookback | Return | CAGR | Max DD | Sharpe | SPY CAGR Delta | SPY DD Delta |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `63` | `28.58%` | `8.80%` | `25.14%` | `0.581` | `-0.04%` | `-0.22%` |
| `10%` | `84` | `26.88%` | `8.31%` | `25.33%` | `0.554` | `-0.53%` | `-0.03%` |
| `20%` | `63` | `27.23%` | `8.41%` | `24.28%` | `0.573` | `-0.43%` | `-1.08%` |
| `20%` | `84` | `24.18%` | `7.53%` | `25.51%` | `0.522` | `-1.31%` | `+0.15%` |
| `30%` | `63` | `26.80%` | `8.29%` | `24.17%` | `0.583` | `-0.55%` | `-1.19%` |
| `30%` | `84` | `23.47%` | `7.33%` | `25.18%` | `0.523` | `-1.51%` | `-0.18%` |
| `40%` | `63` | `22.69%` | `7.10%` | `24.98%` | `0.516` | `-1.74%` | `-0.38%` |
| `40%` | `84` | `22.08%` | `6.92%` | `25.48%` | `0.508` | `-1.92%` | `+0.12%` |

`SPY` for this range:

- return: `28.88%`
- CAGR: `8.84%`
- max drawdown: `25.36%`
- Sharpe: `0.570`

This range is the main caution flag. The hybrid does not beat `SPY` on return or CAGR. The `63`-day versions are close, and several rows improve Sharpe slightly, but there is no strong victory here.

### `2022-2024`

| Active Allocation | RS Lookback | Return | CAGR | Max DD | Sharpe | SPY CAGR Delta | SPY DD Delta |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `63` | `20.56%` | `6.45%` | `24.69%` | `0.459` | `-0.61%` | `-0.67%` |
| `10%` | `84` | `22.67%` | `7.07%` | `24.41%` | `0.494` | `+0.01%` | `-0.95%` |
| `20%` | `63` | `20.74%` | `6.50%` | `24.16%` | `0.473` | `-0.56%` | `-1.20%` |
| `20%` | `84` | `23.74%` | `7.38%` | `23.56%` | `0.523` | `+0.32%` | `-1.80%` |
| `30%` | `63` | `19.66%` | `6.18%` | `23.53%` | `0.464` | `-0.88%` | `-1.83%` |
| `30%` | `84` | `23.69%` | `7.36%` | `22.74%` | `0.532` | `+0.30%` | `-2.62%` |
| `40%` | `63` | `18.34%` | `5.79%` | `22.99%` | `0.450` | `-1.27%` | `-2.37%` |
| `40%` | `84` | `25.57%` | `7.91%` | `21.73%` | `0.571` | `+0.85%` | `-3.63%` |

`SPY` for this range:

- return: `22.69%`
- CAGR: `7.06%`
- max drawdown: `25.36%`
- Sharpe: `0.478`

This is the cleanest argument for `RS 84`. It beats `SPY` on CAGR in every active allocation except the result is essentially tied at `10% active`, and it reduces drawdown more as the active sleeve grows.

The best row is `40% active / RS 84`:

- CAGR delta versus SPY: `+0.85%`
- drawdown delta versus SPY: `-3.63%`
- Sharpe delta versus SPY: `+0.093`

### `2023-2026`

| Active Allocation | RS Lookback | Return | CAGR | Max DD | Sharpe | SPY CAGR Delta | SPY DD Delta |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `63` | `91.14%` | `21.52%` | `19.20%` | `1.380` | `+0.40%` | `+0.20%` |
| `10%` | `84` | `94.87%` | `22.23%` | `19.18%` | `1.421` | `+1.11%` | `+0.18%` |
| `20%` | `63` | `98.19%` | `22.85%` | `19.51%` | `1.442` | `+1.73%` | `+0.51%` |
| `20%` | `84` | `98.30%` | `22.87%` | `19.55%` | `1.454` | `+1.75%` | `+0.55%` |
| `30%` | `63` | `109.68%` | `24.95%` | `19.69%` | `1.562` | `+3.83%` | `+0.69%` |
| `30%` | `84` | `105.12%` | `24.13%` | `19.47%` | `1.504` | `+3.01%` | `+0.47%` |
| `40%` | `63` | `115.84%` | `26.05%` | `19.96%` | `1.584` | `+4.93%` | `+0.96%` |
| `40%` | `84` | `113.30%` | `25.60%` | `20.11%` | `1.525` | `+4.48%` | `+1.11%` |

`SPY` for this range:

- return: `89.24%`
- CAGR: `21.12%`
- max drawdown: `19.00%`
- Sharpe: `1.339`

This is where the hybrid shines. More active allocation clearly helps return and CAGR. Drawdown is slightly worse than pure `SPY`, but Sharpe improves.

The best row is `40% active / RS 63`:

- CAGR delta versus SPY: `+4.93%`
- return delta versus SPY: `+26.60%`
- Sharpe delta versus SPY: `+0.245`
- max drawdown delta versus SPY: `+0.96%`

This is a meaningful win, but it is also the hottest and most favorable window in the test. We should not let this one period dominate the conclusion.

## Lookback Comparison

The `63` and `84` lookbacks remain close.

Average read:

- `84` is best at `10%` and `40%` active.
- `63` is best at `20%` and very slightly best at `30%`.
- `84` is better in `2022-2024`.
- `63` is better in `2021-2023`.
- `63` is slightly better in the hottest `2023-2026` window at higher active allocations.

This reinforces the prior conclusion that there is a stable neighborhood rather than a single magic setting. For now:

- `63` is the slightly more balanced setting,
- `84` is the best average setting in this hybrid sweep,
- both deserve to stay in the candidate set.

## Interpretation

This hybrid framing is stronger than the full-active framing.

The reason is straightforward: the passive core captures the broad equity risk premium, while the active sleeve only has to improve the margin. The active strategy no longer has to solve the whole problem by itself.

That makes the active sleeve more realistic:

- it can sit in cash without dragging the entire portfolio into cash,
- it can add selection value during favorable windows,
- it can reduce drawdown in some harder windows,
- it does not need to beat SPY every single year to be useful.

But the result is still not strong enough to declare victory.

The core weaknesses:

- the average CAGR edge over SPY is small,
- the strongest advantage is concentrated in `2023-2026`,
- `2021-2023` remains weak versus SPY,
- same-universe buy-and-hold still dominates,
- the universe is still current-membership biased.

So the practical conclusion is:

> A SPY core plus active trend sleeve is now a plausible research direction, but it is not yet a live-capital-grade case.

## Current Best Candidate

The best average candidate from this sweep is:

```text
coreSymbol=SPY
activeAllocationPct=40
entryPeriod=55
exitPeriod=50
maxUnits=1
riskPercent=0.25
maxOpenPositions=10
entryRank=momentum126
relativeStrengthSymbol=SPY
relativeStrengthLookback=84
gapAwareFills=true
slippageBps=5
```

Average metrics:

- return: `59.02%`
- CAGR: `13.07%`
- max drawdown: `23.17%`
- return/drawdown: `2.660`
- Sharpe: `0.836`
- Sortino: `1.151`

The more balanced sibling is:

```text
activeAllocationPct=30
relativeStrengthLookback=63
```

Average metrics:

- return: `57.50%`
- CAGR: `12.78%`
- max drawdown: `23.07%`
- return/drawdown: `2.619`
- Sharpe: `0.832`
- Sortino: `1.138`

This version gives up a little return but has slightly lower drawdown and nearly the same Sharpe.

## Recommended Next Step

The hybrid test deserves one more robustness pass before we tune anything more.

Best next tests:

1. Add `50%` active to see whether the improvement continues or starts breaking down.
2. Compare against a `QQQ` core, because this universe and strategy often behave like growth/momentum exposure.
3. Test annual or calendar-year breakdowns, because the average result is hiding meaningful inconsistency.

The cleanest immediate next run is probably:

```text
coreSymbol=SPY
activeAllocationPct=0,10,20,30,40,50
relativeStrengthLookback=63,84
```

However, the current runner requires active allocation to be greater than `0`, so `0% active` is still represented by the existing benchmark report rather than the hybrid script.

The most important conceptual next step is:

> Treat the active sleeve as a possible portfolio enhancer, not as a full portfolio replacement.

That framing is where the strategy finally starts to look useful again.
