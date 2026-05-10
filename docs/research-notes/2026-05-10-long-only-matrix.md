# Long-Only Matrix Review - 2026-05-10

Source reports:

- Long-only: `reports/matrix-long-only-2026-05-10.csv`
- Baseline long/short: `reports/matrix-results-2026-05-10T22-27-20-441Z.csv`

This note compares the first long-only matrix run against the prior baseline run with shorts enabled. The experiment tested the hypothesis from the earlier diagnostics review: short trades were a major aggregate drag and should be disabled or filtered before pursuing more complex strategy changes.

## Executive Summary

The long-only run is dramatically better than the long/short baseline across almost every aggregate metric.

| Metric | Long/Short Baseline | Long-Only |
| --- | ---: | ---: |
| Mean return | `35.08%` | `87.07%` |
| Median return | `12.41%` | `49.44%` |
| Mean max drawdown | `39.48%` | `24.64%` |
| Median max drawdown | `37.78%` | `22.32%` |
| Worst max drawdown | `71.49%` | `44.69%` |
| Mean return/max drawdown | `1.125` | `3.968` |
| Median return/max drawdown | `0.305` | `2.029` |
| Mean profit factor | `1.189` | `2.184` |
| Median profit factor | `1.091` | `1.976` |
| Positive runs | `42 / 72` | `67 / 72` |
| Return/max drawdown > 1 | `24 / 72` | `48 / 72` |
| Return/max drawdown > 2 | `18 / 72` | `36 / 72` |
| Profit factor > 1 | `42 / 72` | `67 / 72` |
| Profit factor > 1.5 | `17 / 72` | `47 / 72` |
| Max drawdown > 50% | `13 / 72` | `0 / 72` |

The hypothesis is strongly supported: removing shorts improved the current strategy configuration substantially.

## Pairwise Comparison

Across the same 72 symbol/date-range combinations:

| Change | Count |
| --- | ---: |
| Return improved | `66 / 72` |
| Return worsened | `6 / 72` |
| Max drawdown decreased | `70 / 72` |
| Max drawdown increased | `2 / 72` |
| Return/max drawdown improved | `70 / 72` |
| Return/max drawdown worsened | `2 / 72` |
| Profit factor improved | `70 / 72` |
| Profit factor worsened | `2 / 72` |

This is not a subtle result. Long-only is not merely cleaner; it is better in almost every paired case.

## Aggregate PnL

| Metric | Long/Short Baseline | Long-Only |
| --- | ---: | ---: |
| Total PnL | `+$2,526,084` | `+$6,268,706` |
| Long PnL | `+$5,380,610` | `+$6,268,706` |
| Short PnL | `-$2,854,526` | `$0` |
| Base-unit PnL | `+$911,504` | `+$1,874,986` |
| Added-unit PnL | `+$1,614,580` | `+$4,393,721` |
| Positive added-unit runs | `37 / 72` | `63 / 72` |
| Negative added-unit runs | `35 / 72` | `9 / 72` |

Pyramiding looks much healthier once shorts are removed. In the baseline, added units were split almost evenly between helping and hurting. In the long-only run, added units were positive in most runs and became a central contributor to total returns.

## Biggest Improvements

| Symbol / Range | Baseline Return | Long-Only Return | Return Delta | Baseline DD | Long-Only DD |
| --- | ---: | ---: | ---: | ---: | ---: |
| NVDA 2020-2024 | `323.13%` | `703.89%` | `+380.76` | `39.50%` | `30.65%` |
| AAPL 2020-2024 | `251.01%` | `475.08%` | `+224.07` | `30.78%` | `20.07%` |
| LLY 2020-2024 | `147.50%` | `321.10%` | `+173.60` | `39.62%` | `22.35%` |
| NVDA 2023-2026 | `77.59%` | `225.74%` | `+148.15` | `41.50%` | `21.17%` |
| MSFT 2020-2024 | `-9.17%` | `102.25%` | `+111.42` | `44.13%` | `22.54%` |
| CAT 2023-2026 | `214.19%` | `315.03%` | `+100.84` | `28.53%` | `20.71%` |

The long-only configuration not only improved the already-strong trend names; it also transformed some weak baseline runs, such as MSFT and JPM, into profitable runs by removing harmful shorts.

## Cases That Worsened

Only 6 runs had lower total return after disabling shorts:

| Symbol / Range | Baseline Return | Long-Only Return | Return Delta | Baseline DD | Long-Only DD |
| --- | ---: | ---: | ---: | ---: | ---: |
| XLE 2020-2024 | `82.94%` | `67.63%` | `-15.31` | `39.57%` | `24.05%` |
| UNH 2023-2026 | `35.74%` | `22.34%` | `-13.40` | `42.28%` | `26.13%` |
| XOM 2020-2024 | `42.02%` | `30.97%` | `-11.05` | `63.56%` | `39.85%` |
| IWM 2020-2024 | `13.70%` | `3.89%` | `-9.81` | `44.75%` | `29.45%` |
| AMZN 2021-2023 | `18.49%` | `11.64%` | `-6.85` | `28.15%` | `30.13%` |
| COST 2021-2023 | `156.26%` | `154.84%` | `-1.42` | `38.32%` | `20.29%` |

Even here, most drawdowns improved meaningfully. AMZN 2021-2023 and META 2021-2023 were the only paired cases where drawdown increased, and the increases were small.

## Best Long-Only Runs

| Symbol / Range | Return | Max DD | Return/DD | Profit Factor |
| --- | ---: | ---: | ---: | ---: |
| AAPL 2020-2024 | `475.08%` | `20.07%` | `23.673` | `4.350` |
| NVDA 2020-2024 | `703.89%` | `30.65%` | `22.967` | `4.583` |
| CAT 2023-2026 | `315.03%` | `20.71%` | `15.213` | `5.437` |
| LLY 2020-2024 | `321.10%` | `22.35%` | `14.370` | `3.697` |
| NVDA 2022-2024 | `241.50%` | `19.44%` | `12.422` | `4.388` |
| NVDA 2021-2023 | `238.06%` | `20.29%` | `11.735` | `3.790` |

These numbers are strong enough that they deserve manual validation. Specifically inspect trade logs for fill assumptions, add-on sequencing, adjusted-price behavior, and whether the results depend on a small number of large moves.

## Weak Long-Only Runs

The long-only run still has some poor or barely useful cases:

| Symbol / Range | Return | Max DD | Return/DD | Profit Factor |
| --- | ---: | ---: | ---: | ---: |
| XOM 2022-2024 | `-27.91%` | `40.59%` | `-0.688` | `0.461` |
| GOOGL 2022-2024 | `-15.48%` | `28.00%` | `-0.553` | `0.674` |
| UNH 2022-2024 | `-8.00%` | `27.30%` | `-0.293` | `0.813` |
| UNH 2020-2024 | `-5.80%` | `27.36%` | `-0.212` | `0.920` |
| DIA 2023-2026 | `-0.67%` | `23.70%` | `-0.028` | `0.983` |

These are much less catastrophic than the baseline losers, but they show that long-only does not solve ticker/regime mismatch. A portfolio system will still need universe selection, risk limits, or regime filters.

## Symbol-Level Read

Best average return improvements by symbol:

| Symbol | Baseline Avg Return | Long-Only Avg Return | Delta | Baseline Avg DD | Long-Only Avg DD |
| --- | ---: | ---: | ---: | ---: | ---: |
| NVDA | `173.55%` | `352.30%` | `+178.75` | `34.36%` | `22.89%` |
| AAPL | `97.71%` | `209.17%` | `+111.46` | `30.37%` | `17.05%` |
| LLY | `109.65%` | `208.23%` | `+98.58` | `33.82%` | `22.20%` |
| MSFT | `-5.00%` | `55.73%` | `+60.73` | `36.54%` | `21.33%` |
| JPM | `-11.81%` | `47.48%` | `+59.30` | `46.88%` | `25.78%` |

Weakest average long-only symbols by return/drawdown remained IWM, UNH, XOM, DIA, GOOGL, XLE, and AMZN. The worst group improved, but many still do not look compelling as isolated symbols.

## Remaining Cautions

The long-only result is a major improvement, but not a finished trading system.

Outlier dependence is still high:

| Condition | Long/Short Baseline | Long-Only |
| --- | ---: | ---: |
| Largest winner > 100% of net profit | `20 / 72` | `21 / 72` |
| Largest winner > 50% of net profit | `35 / 72` | `46 / 72` |

This is expected in trend-following, but it reinforces the need for portfolio-level testing. The system relies on catching large trends, and single-symbol results remain fragile.

The current matrix also still gives each symbol/date-range its own isolated account. It does not yet test shared capital, simultaneous positions, exposure limits, correlation, or portfolio-level drawdown.

## Current Hypothesis

The short side should remain disabled by default for this equity-focused strategy until there is a specific, tested short filter.

The next best research target is not re-enabling shorts. It is studying pyramiding and position risk in the long-only system, because added units now look like a major source of both performance and risk.

## Recommended Next Experiments

1. Commit the `--allowShort` matrix option so long-only runs are reproducible.
2. Add matrix options for `maxUnits`, `entryPeriod`, and `exitPeriod`.
3. Run a long-only pyramiding sweep with `maxUnits=1,2,3,4`.
4. Compare whether most long-only gains come from pyramiding or from the base breakout entries.
5. Add a comparison script/report so paired matrix runs can be summarized automatically.
6. After the pyramiding sweep, begin portfolio-level backtesting with shared capital and concurrent positions.

## Bottom Line

Disabling shorts is the clearest improvement so far. It increased returns, reduced drawdowns, improved profit factor, and removed all `50%+` drawdown cases in this matrix.

The system now looks less like "the turtle occasionally finds a huge winner while absorbing severe damage" and more like "a promising long-side trend system that still needs portfolio construction and risk control."
