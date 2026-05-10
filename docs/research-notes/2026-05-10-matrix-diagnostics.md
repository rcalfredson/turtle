# Matrix Diagnostics Review - 2026-05-10

Source report:

- `reports/matrix-results-2026-05-10T22-27-20-441Z.csv`

This note summarizes the first richer diagnostic pass after adding side-specific PnL, return/drawdown, profit factor, largest-winner dependence, and base-vs-added-unit attribution to the matrix runner.

## High-Level Read

The current system looks mechanically plausible, but not yet investable as-is. It behaves mostly like a long-side trend catcher with large drawdowns and uneven payoff distribution.

Across 72 single-symbol runs:

| Metric | Value |
| --- | ---: |
| Mean return | `35.08%` |
| Median return | `12.41%` |
| Mean max drawdown | `39.48%` |
| Median max drawdown | `37.78%` |
| Positive runs | `42 / 72` |
| Return/max drawdown > 1 | `24 / 72` |
| Return/max drawdown > 2 | `18 / 72` |
| Profit factor > 1 | `42 / 72` |
| Profit factor > 1.5 | `17 / 72` |

The median case still has too much pain for too little return.

## Main Finding: Shorts Are a Major Drag

Aggregate side-specific PnL:

| Side | Total PnL | Positive Runs |
| --- | ---: | ---: |
| Long | `+$5,380,610` | `67 / 72` |
| Short | `-$2,854,526` | `3 / 72` |

This does not prove that long-only is automatically better, because removing shorts changes sequencing, capital availability, and exposure. But it is the loudest diagnostic signal in the report.

Next experiment: run the same matrix with shorts disabled and compare against the current long/short version.

## Pyramiding Is Powerful But Unstable

Aggregate unit attribution:

| Unit Group | Total PnL |
| --- | ---: |
| Base units | `+$911,504` |
| Added units | `+$1,614,580` |

Added units were positive in `37` runs and negative in `35` runs.

Interpretation: pyramiding is doing exactly what trend-following expects. It pays heavily in strong trends, but it worsens the damage in choppy or mismatched regimes. Do not remove it blindly; test `maxUnits` sweeps and possibly add filters around when new units are allowed.

## Strongest Runs

| Symbol / Range | Return | Max DD | Return/DD | Profit Factor |
| --- | ---: | ---: | ---: | ---: |
| NVDA 2020-2024 | `323.13%` | `39.50%` | `8.181` | `2.061` |
| AAPL 2020-2024 | `251.01%` | `30.78%` | `8.156` | `1.819` |
| CAT 2023-2026 | `214.19%` | `28.53%` | `7.508` | `2.976` |
| NVDA 2022-2024 | `153.27%` | `28.21%` | `5.434` | `2.075` |
| META 2022-2024 | `144.98%` | `27.14%` | `5.342` | `2.030` |

These winners are mostly strong long-trend names. They are evidence that the engine can capture large trends, not evidence that the system is broadly robust.

## Worst Runs

| Symbol / Range | Return | Max DD | Return/DD | Profit Factor |
| --- | ---: | ---: | ---: | ---: |
| UNH 2020-2024 | `-63.56%` | `71.49%` | `-0.889` | `0.400` |
| XOM 2022-2024 | `-55.35%` | `63.97%` | `-0.865` | `0.313` |
| DIA 2023-2026 | `-34.75%` | `44.76%` | `-0.776` | `0.523` |
| UNH 2022-2024 | `-39.67%` | `56.62%` | `-0.701` | `0.469` |
| XLE 2023-2026 | `-34.64%` | `55.43%` | `-0.625` | `0.623` |

These should be inspected manually in the app or through trade logs. They likely reveal repeated whipsaws, harmful shorts, harmful add-ons, ticker/regime mismatch, or some combination.

## Fragility / Outlier Dependence

Among positive runs:

| Condition | Count |
| --- | ---: |
| Largest winner > 100% of net profit | `20 / 72` |
| Largest winner > 50% of net profit | `35 / 72` |

This is not automatically bad for trend-following. Large winners are expected. But it means a single-symbol result can look good while being highly dependent on one event. Portfolio-level testing is essential.

## Current Hypothesis

The biggest immediate improvement is likely to come from disabling or filtering shorts, not from complex predictive models.

Pyramiding should be studied carefully rather than removed. It appears central to the best results, but it also amplifies bad regimes.

## Recommended Next Experiments

1. Add matrix options for `allowShort`, `maxUnits`, `entryPeriod`, and `exitPeriod`.
2. Run long-only versus long/short on the same symbols and ranges.
3. Run a pyramiding sweep with `maxUnits=1,2,3,4`.
4. Add comparison reports so these sweeps can be digested without manually reading giant CSVs.
5. After side and pyramiding behavior are clearer, build portfolio-level backtesting with shared capital, concurrent positions, and portfolio risk limits.

## Caution

These are simulated historical results. They are useful for research and system design, not evidence of future profitability. The current drawdown profile is severe enough that risk control should be treated as a central design problem, not a finishing touch.
