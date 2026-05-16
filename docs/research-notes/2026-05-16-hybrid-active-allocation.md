# Hybrid Active Allocation Sweep - 2026-05-16

Source reports:

- Hybrid summary: `reports/hybrid-spy-core-active-allocation-2026-05-16.csv`
- Hybrid equity audit: `reports/hybrid-spy-core-active-allocation-2026-05-16-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`

Universe:

- Active sleeve: `universes/sp500-top100-established.txt`
- `96` current large-cap S&P 500 symbols
- Passive core: `SPY`

Hybrid setup:

- Core sleeve: buy-and-hold `SPY`
- Active sleeve: relative-strength trend-following
- No periodic rebalancing between sleeves
- Initial allocation only: `activeAllocationPct=10,20,30,40,50,60`

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

The allocation curve is strange, but not random.

The average results do not show a clean "more active is always better" pattern. They show a broad plateau around `30-60%` active, with the best average CAGR at `40%` active and the best average return at `60%` active.

Average results by active allocation, combining both relative-strength lookbacks:

| Active Allocation | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `55.00%` | `12.35%` | `24.95%` | `2.336` | `0.782` | `1.067` |
| `20%` | `56.62%` | `12.57%` | `23.95%` | `2.479` | `0.805` | `1.103` |
| `30%` | `57.50%` | `12.77%` | `23.17%` | `2.609` | `0.828` | `1.137` |
| `40%` | `58.29%` | `12.86%` | `23.06%` | `2.653` | `0.829` | `1.135` |
| `50%` | `57.53%` | `12.67%` | `23.37%` | `2.547` | `0.811` | `1.102` |
| `60%` | `58.34%` | `12.82%` | `23.32%` | `2.593` | `0.800` | `1.080` |

Average `SPY` benchmark:

- return: `55.30%`
- CAGR: `12.39%`
- max drawdown: `25.95%`
- return/drawdown: `2.272`
- Sharpe: `0.764`
- Sortino: `1.037`

So the hybrid still improves the average profile versus pure `SPY`, especially from `20%` active upward. But the improvement is not large enough to call decisive.

The key interpretation:

> Higher active allocation helps in the strongest recent window, but hurts or weakens several earlier windows. The average improvement is real, but it is regime-dependent.

## The Shape Of The Curve

The user's U-curve read makes sense at the row level, but the fuller picture is more subtle.

The average return curve:

```text
10% active: 55.00%
20% active: 56.62%
30% active: 57.50%
40% active: 58.29%
50% active: 57.53%
60% active: 58.34%
```

That is not a sharp U. It is more like:

1. improvement from `10%` to `40%`,
2. a dip at `50%`,
3. a rebound at `60%`.

The average CAGR curve is even flatter:

```text
10% active: 12.35%
20% active: 12.57%
30% active: 12.77%
40% active: 12.86%
50% active: 12.67%
60% active: 12.82%
```

That suggests `30-60%` active is a broad neighborhood, not a precise optimum.

The important part is that the different date ranges disagree with each other. This is why the allocation curve looks odd.

## Range-Level Pattern

Average across both relative-strength lookbacks:

| Range | Best Active Allocation By CAGR | Best CAGR | Interpretation |
| --- | ---: | ---: | --- |
| `2020-2024` | `20%` | `12.52%` | Larger active sleeves give up too much SPY upside. |
| `2021-2023` | `10%` | `8.55%` | Active sleeve mostly hurts return; smaller is better. |
| `2022-2024` | `40%` | `6.85%` | Active sleeve helps risk control; `84` lookback matters. |
| `2023-2026` | `60%` | `28.28%` | Active sleeve shines in the strong recent trend window. |

This is the whole story.

The active sleeve is not uniformly better. It is better when the market environment rewards the active trend filter, and worse when SPY itself is already the cleaner instrument.

### `2020-2024`

| Active Allocation | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe |
| ---: | ---: | ---: | ---: | ---: |
| `10%` | `77.66%` | `12.19%` | `30.82%` | `0.683` |
| `20%` | `80.28%` | `12.52%` | `27.50%` | `0.728` |
| `30%` | `75.79%` | `11.96%` | `25.30%` | `0.727` |
| `40%` | `74.25%` | `11.75%` | `24.62%` | `0.740` |
| `50%` | `69.95%` | `11.19%` | `25.26%` | `0.724` |
| `60%` | `64.66%` | `10.49%` | `25.93%` | `0.698` |

`SPY` for this range:

- return: `80.40%`
- CAGR: `12.53%`
- max drawdown: `34.10%`
- Sharpe: `0.667`

This range argues against too much active allocation. `20%` active is roughly tied with `SPY` on return and CAGR while materially reducing drawdown. Higher active allocations reduce drawdown further, but they give up too much return.

### `2021-2023`

| Active Allocation | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe |
| ---: | ---: | ---: | ---: | ---: |
| `10%` | `27.73%` | `8.55%` | `25.23%` | `0.568` |
| `20%` | `25.70%` | `7.97%` | `24.90%` | `0.547` |
| `30%` | `25.13%` | `7.81%` | `24.68%` | `0.553` |
| `40%` | `22.38%` | `7.01%` | `25.23%` | `0.512` |
| `50%` | `21.23%` | `6.67%` | `25.39%` | `0.497` |
| `60%` | `21.37%` | `6.70%` | `25.32%` | `0.502` |

`SPY` for this range:

- return: `28.88%`
- CAGR: `8.84%`
- max drawdown: `25.36%`
- Sharpe: `0.570`

This is the hardest range for the hybrid. More active allocation mostly makes the result worse. The active sleeve does not add enough return, and the drawdown improvement is too small to compensate.

This is also the clearest warning against leaning too hard into the high-active result from `2023-2026`.

### `2022-2024`

| Active Allocation | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe |
| ---: | ---: | ---: | ---: | ---: |
| `10%` | `21.62%` | `6.76%` | `24.55%` | `0.477` |
| `20%` | `22.24%` | `6.94%` | `23.86%` | `0.498` |
| `30%` | `21.68%` | `6.77%` | `23.13%` | `0.498` |
| `40%` | `21.95%` | `6.85%` | `22.36%` | `0.510` |
| `50%` | `19.70%` | `6.19%` | `21.80%` | `0.474` |
| `60%` | `18.51%` | `5.81%` | `20.99%` | `0.454` |

`SPY` for this range:

- return: `22.69%`
- CAGR: `7.06%`
- max drawdown: `25.36%`
- Sharpe: `0.478`

This range is mixed. Higher active allocation improves drawdown, but return peaks at `20%` and then fades. The `40%` row has the best Sharpe and a much lower drawdown than `SPY`, but it still trails SPY on raw return.

The active sleeve is providing defensive value here, not clear return superiority.

### `2023-2026`

| Active Allocation | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe |
| ---: | ---: | ---: | ---: | ---: |
| `10%` | `93.00%` | `21.88%` | `19.19%` | `1.401` |
| `20%` | `98.25%` | `22.86%` | `19.53%` | `1.448` |
| `30%` | `107.40%` | `24.54%` | `19.58%` | `1.533` |
| `40%` | `114.57%` | `25.83%` | `20.04%` | `1.554` |
| `50%` | `119.23%` | `26.63%` | `21.02%` | `1.550` |
| `60%` | `128.84%` | `28.28%` | `21.03%` | `1.545` |

`SPY` for this range:

- return: `89.24%`
- CAGR: `21.12%`
- max drawdown: `19.00%`
- Sharpe: `1.339`

This is the range where high active allocation looks excellent. Return and CAGR increase almost monotonically as the active sleeve gets larger. Drawdown rises slightly above SPY, but Sharpe remains better than SPY.

This result explains why the average curve recovers at `60%` active. The recent window is strong enough to offset the weakness in earlier windows.

## Best Individual Rows

Best rows by range:

| Range | Best Row By CAGR | CAGR | Return | Max DD | Sharpe |
| --- | --- | ---: | ---: | ---: | ---: |
| `2020-2024` | `20% active`, `RS 63` | `12.78%` | `82.40%` | `27.50%` | `0.742` |
| `2021-2023` | `10% active`, `RS 63` | `8.80%` | `28.58%` | `25.14%` | `0.581` |
| `2022-2024` | `40% active`, `RS 84` | `7.91%` | `25.57%` | `21.73%` | `0.571` |
| `2023-2026` | `60% active`, `RS 63` | `28.75%` | `131.64%` | `20.76%` | `1.595` |

There is no stable single allocation that wins every range.

The closest thing to a balanced default remains around `30-40%` active. `60%` active is interesting, but it looks much more regime-dependent.

## Relative Strength Lookback

Average by allocation and lookback:

| Active Allocation | RS Lookback | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `10%` | `63` | `54.50%` | `12.24%` | `24.96%` | `0.776` |
| `10%` | `84` | `55.50%` | `12.45%` | `24.94%` | `0.788` |
| `20%` | `63` | `57.14%` | `12.63%` | `23.86%` | `0.807` |
| `20%` | `84` | `56.09%` | `12.51%` | `24.03%` | `0.803` |
| `30%` | `63` | `57.50%` | `12.78%` | `23.07%` | `0.832` |
| `30%` | `84` | `57.50%` | `12.75%` | `23.27%` | `0.824` |
| `40%` | `63` | `57.56%` | `12.64%` | `22.95%` | `0.823` |
| `40%` | `84` | `59.02%` | `13.07%` | `23.17%` | `0.836` |
| `50%` | `63` | `57.03%` | `12.58%` | `22.89%` | `0.812` |
| `50%` | `84` | `58.02%` | `12.76%` | `23.85%` | `0.810` |
| `60%` | `63` | `57.18%` | `12.59%` | `23.06%` | `0.792` |
| `60%` | `84` | `59.51%` | `13.05%` | `23.58%` | `0.808` |

The `84` lookback tends to have better return at higher active allocations, while `63` often has slightly better drawdown. This is consistent with the prior reports.

For a growth-oriented version:

- `40-60% active`
- `relativeStrengthLookback=84`

For a more balanced version:

- `30-40% active`
- `relativeStrengthLookback=63`

## Win Counts Versus SPY

Each active allocation has `8` tested rows: four date ranges times two relative-strength lookbacks.

| Active Allocation | CAGR Wins Vs SPY | Sharpe Wins Vs SPY | Drawdown Wins Vs SPY |
| ---: | ---: | ---: | ---: |
| `10%` | `3 / 8` | `6 / 8` | `6 / 8` |
| `20%` | `4 / 8` | `6 / 8` | `5 / 8` |
| `30%` | `3 / 8` | `6 / 8` | `6 / 8` |
| `40%` | `3 / 8` | `5 / 8` | `5 / 8` |
| `50%` | `3 / 8` | `5 / 8` | `5 / 8` |
| `60%` | `3 / 8` | `5 / 8` | `5 / 8` |

This is important. The hybrid looks better than SPY on average, but it does not consistently beat SPY on CAGR across windows.

Its more consistent edge is risk-adjusted:

- Sharpe improves more often than CAGR.
- Drawdown improves more often than CAGR.

That means the strategy may be more valuable as a smoothing/diversification sleeve than as a raw return enhancer.

## Interpretation

The active allocation sweep suggests three things.

First, the hybrid framing still works better than full-active replacement. The active sleeve can improve average risk-adjusted performance when paired with SPY.

Second, the allocation decision is regime-sensitive. High active allocation looks great in the strong recent window, but smaller active allocation is better in the earlier windows.

Third, the active sleeve is not yet strong enough to be trusted as a dominant allocation. At `50-60%`, the portfolio starts to depend heavily on the recent regime continuing.

The practical conclusion:

> The best current use case is not "replace SPY with the strategy." It is "test whether a 20-40% active sleeve can improve a mostly passive portfolio."

## Current Best Candidates

Balanced candidate:

```text
coreSymbol=SPY
activeAllocationPct=30
relativeStrengthLookback=63
entryPeriod=55
exitPeriod=50
maxUnits=1
riskPercent=0.25
maxOpenPositions=10
entryRank=momentum126
gapAwareFills=true
slippageBps=5
```

Average metrics:

- return: `57.50%`
- CAGR: `12.78%`
- max drawdown: `23.07%`
- return/drawdown: `2.619`
- Sharpe: `0.832`
- Sortino: `1.138`

Higher-return candidate:

```text
coreSymbol=SPY
activeAllocationPct=40
relativeStrengthLookback=84
```

Average metrics:

- return: `59.02%`
- CAGR: `13.07%`
- max drawdown: `23.17%`
- return/drawdown: `2.660`
- Sharpe: `0.836`
- Sortino: `1.151`

Aggressive/regime-dependent candidate:

```text
coreSymbol=SPY
activeAllocationPct=60
relativeStrengthLookback=84
```

Average metrics:

- return: `59.51%`
- CAGR: `13.05%`
- max drawdown: `23.58%`
- return/drawdown: `2.614`
- Sharpe: `0.808`
- Sortino: `1.095`

The `60%` row has strong return, but it is less attractive on Sharpe and more dependent on `2023-2026`.

## Recommended Next Step

This sweep argues for pausing allocation tuning and testing structure.

The next best experiment is a rebalanced hybrid:

- start at a target allocation, such as `70% SPY / 30% active`,
- rebalance annually or quarterly back to target,
- compare against the current initial-allocation-only hybrid.

Why this matters:

- The current hybrid lets sleeves drift.
- A strong active sleeve can become a larger part of the portfolio over time.
- A weak active sleeve can shrink and become less relevant.
- Rebalancing would tell us whether the edge comes from persistent allocation value or from letting a winning sleeve run.

If rebalancing improves consistency, the strategy becomes more practical. If rebalancing hurts badly, then the active sleeve may be relying on occasional large runs rather than steady value.

After that, the other high-value test is a `QQQ` core comparison. This would answer whether the active sleeve is adding real selection value or just recreating a growth/momentum tilt that `QQQ` captures more simply.
