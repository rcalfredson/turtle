# Channel Period Sweep Review - 2026-05-11

Source report:

- `reports/matrix-long-only-channel-sweep-2026-05-11.csv`

This note reviews the first channel-period sweep after settling on the current research defaults of `allowShort=false` and `maxUnits=4`.

The sweep tested valid combinations from:

- `entryPeriod=20,40,55`
- `exitPeriod=10,20,30`

Invalid combinations where `exitPeriod >= entryPeriod` were skipped, leaving seven settings: `20/10`, `40/10`, `40/20`, `40/30`, `55/10`, `55/20`, and `55/30`.

## Executive Summary

The existing `20/10` setting remains the best all-around research default.

The user's simple read is mostly right: shorter channel periods, especially the original `20/10`, look favored by return, CAGR, return/drawdown, and Sharpe-like behavior. The nuance is that `40/20` slightly beats `20/10` on mean raw return and total PnL, while `55/20` has the best median return. Still, `20/10` wins most often across individual symbol/range runs and remains the most balanced setting.

## Aggregate Results

| Entry / Exit | Mean Return | Median Return | Mean CAGR | Median CAGR | Total PnL |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `20/10` | `87.07%` | `49.44%` | `16.03%` | `12.41%` | `+$6,268,706` |
| `40/10` | `61.35%` | `34.97%` | `11.50%` | `7.36%` | `+$4,416,901` |
| `40/20` | `87.85%` | `47.59%` | `15.57%` | `12.88%` | `+$6,324,889` |
| `40/30` | `80.09%` | `43.95%` | `14.35%` | `11.22%` | `+$5,766,587` |
| `55/10` | `54.19%` | `33.23%` | `10.51%` | `8.11%` | `+$3,901,484` |
| `55/20` | `77.04%` | `52.00%` | `13.83%` | `11.77%` | `+$5,547,264` |
| `55/30` | `66.64%` | `39.20%` | `12.31%` | `9.98%` | `+$4,797,773` |

`40/20` produced the highest mean return and total PnL by a very small margin over `20/10`. But `20/10` had the highest mean CAGR and remained close to the top in median return.

## Drawdown And Risk-Adjusted Metrics

| Entry / Exit | Mean Max DD | Median Max DD | Worst Max DD | Mean Return/DD | Median Return/DD | Mean Sharpe |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `20/10` | `24.64%` | `22.31%` | `44.69%` | `3.968` | `2.029` | `0.680` |
| `40/10` | `24.78%` | `24.48%` | `48.31%` | `2.982` | `1.178` | `0.519` |
| `40/20` | `27.43%` | `27.54%` | `42.87%` | `3.841` | `1.842` | `0.636` |
| `40/30` | `30.40%` | `30.59%` | `48.28%` | `3.109` | `1.550` | `0.565` |
| `55/10` | `22.72%` | `23.04%` | `39.94%` | `2.706` | `1.442` | `0.485` |
| `55/20` | `25.85%` | `25.14%` | `39.95%` | `3.381` | `1.975` | `0.566` |
| `55/30` | `29.01%` | `29.36%` | `43.35%` | `2.546` | `1.313` | `0.493` |

`20/10` has the best mean return/drawdown, median return/drawdown, and mean Sharpe. `55/10` has the lowest mean drawdown and lowest worst drawdown, but its return profile is much weaker.

## Trade Quality Counts

| Entry / Exit | Positive Runs | Return/DD > 2 | Profit Factor > 1.5 | DD > 30% | DD > 40% |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `20/10` | `67 / 72` | `36 / 72` | `47 / 72` | `16 / 72` | `3 / 72` |
| `40/10` | `56 / 72` | `29 / 72` | `43 / 72` | `19 / 72` | `2 / 72` |
| `40/20` | `60 / 72` | `35 / 72` | `47 / 72` | `24 / 72` | `2 / 72` |
| `40/30` | `59 / 72` | `30 / 72` | `47 / 72` | `37 / 72` | `4 / 72` |
| `55/10` | `59 / 72` | `27 / 72` | `47 / 72` | `7 / 72` | `0 / 72` |
| `55/20` | `58 / 72` | `35 / 72` | `47 / 72` | `16 / 72` | `0 / 72` |
| `55/30` | `57 / 72` | `27 / 72` | `46 / 72` | `31 / 72` | `4 / 72` |

The `20/10` setting produced the highest number of positive runs. Longer entry periods generally reduced the number of profitable symbol/range combinations.

## Best Setting Counts

Across each of the 72 symbol/range groups, the best setting by metric was:

| Metric | `20/10` | `40/10` | `40/20` | `40/30` | `55/10` | `55/20` | `55/30` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Best total return | `30` | `0` | `12` | `10` | `9` | `10` | `1` |
| Best return/drawdown | `28` | `5` | `10` | `6` | `9` | `13` | `1` |
| Best profit factor | `17` | `0` | `8` | `14` | `10` | `18` | `5` |
| Best Sharpe | `30` | `2` | `12` | `7` | `11` | `10` | `0` |
| Lowest drawdown | `24` | `6` | `3` | `1` | `29` | `8` | `1` |

This is the most compelling argument for keeping `20/10`. It wins most often by total return, return/drawdown, and Sharpe. It is not always best, but it is the most frequently best.

`55/10` wins most often on lowest drawdown, which makes sense: a slower entry with a fast exit is more conservative.

## Comparison To Current Default

The current default is `20/10`.

### `20/10 -> 40/10`

| Metric | Count / Delta |
| --- | ---: |
| Return improved | `13 / 72` |
| Return worsened | `59 / 72` |
| Drawdown lower | `35 / 72` |
| Drawdown higher | `37 / 72` |
| Return/DD improved | `19 / 72` |
| Profit factor improved | `26 / 72` |
| Average return delta | `-25.72 pts` |
| Average drawdown delta | `+0.14 pts` |

`40/10` is clearly worse than `20/10` in this sweep.

### `20/10 -> 40/20`

| Metric | Count / Delta |
| --- | ---: |
| Return improved | `29 / 72` |
| Return worsened | `43 / 72` |
| Drawdown lower | `19 / 72` |
| Drawdown higher | `53 / 72` |
| Return/DD improved | `27 / 72` |
| Profit factor improved | `41 / 72` |
| Average return delta | `+0.78 pts` |
| Average drawdown delta | `+2.78 pts` |

`40/20` is the closest competitor. It slightly improves mean raw return and total PnL, but it does so with higher drawdown, fewer positive runs, worse median return/drawdown, and worse Sharpe.

### `20/10 -> 55/20`

| Metric | Count / Delta |
| --- | ---: |
| Return improved | `27 / 72` |
| Return worsened | `45 / 72` |
| Drawdown lower | `26 / 72` |
| Drawdown higher | `46 / 72` |
| Return/DD improved | `27 / 72` |
| Profit factor improved | `44 / 72` |
| Average return delta | `-10.02 pts` |
| Average drawdown delta | `+1.21 pts` |

`55/20` is interesting because it has the highest median return and solid profit factor behavior, but it does not beat `20/10` often enough to replace it as the default.

## Notable Improvements Over `20/10`

Some longer settings improved specific symbols/ranges materially:

| Change | Symbol / Range | Return Before | Return After | Drawdown Before | Drawdown After |
| --- | --- | ---: | ---: | ---: | ---: |
| `20/10 -> 40/20` | META 2020-2024 | `148.12%` | `287.92%` | `43.14%` | `24.00%` |
| `20/10 -> 40/20` | META 2021-2023 | `46.73%` | `171.14%` | `33.70%` | `19.69%` |
| `20/10 -> 40/20` | QQQ 2023-2026 | `58.92%` | `182.79%` | `26.53%` | `19.75%` |
| `20/10 -> 55/20` | NVDA 2020-2024 | `703.89%` | `851.74%` | `30.65%` | `24.41%` |
| `20/10 -> 55/20` | META 2020-2024 | `148.12%` | `292.86%` | `43.14%` | `20.54%` |
| `20/10 -> 55/30` | CAT 2023-2026 | `315.03%` | `464.05%` | `20.71%` | `19.78%` |

This argues against treating `20/10` as universally optimal. Different instruments and regimes may prefer different channels.

## Notable Worsening Versus `20/10`

The longer settings also missed or delayed several strong opportunities:

| Change | Symbol / Range | Return Before | Return After | Drawdown Before | Drawdown After |
| --- | --- | ---: | ---: | ---: | ---: |
| `20/10 -> 40/10` | NVDA 2020-2024 | `703.89%` | `534.15%` | `30.65%` | `31.57%` |
| `20/10 -> 40/10` | LLY 2020-2024 | `321.10%` | `190.18%` | `22.35%` | `26.10%` |
| `20/10 -> 40/20` | AAPL 2020-2024 | `475.08%` | `270.68%` | `20.07%` | `21.20%` |
| `20/10 -> 55/20` | AAPL 2020-2024 | `475.08%` | `210.47%` | `20.07%` | `22.95%` |
| `20/10 -> 55/30` | AAPL 2020-2024 | `475.08%` | `147.74%` | `20.07%` | `27.56%` |
| `20/10 -> 55/30` | LLY 2020-2024 | `321.10%` | `175.97%` | `22.35%` | `33.20%` |

This is the central tradeoff: longer channels can avoid some noise but may enter too late or exit too slowly for major winners.

## Profit Factor Oddity

The longer-exit settings show much higher mean profit factor:

| Setting | Mean Profit Factor | Median Profit Factor |
| ---: | ---: | ---: |
| `20/10` | `2.184` | `1.976` |
| `40/20` | `3.207` | `2.204` |
| `40/30` | `4.724` | `2.127` |
| `55/20` | `3.019` | `2.335` |
| `55/30` | `4.373` | `2.031` |

This does not automatically mean those settings are better. Mean profit factor can become inflated when there are fewer losing trades or unusual winner/loss distributions. Because the higher profit-factor settings still had lower Sharpe, lower return/drawdown, fewer positive runs, or higher drawdown, profit factor should be treated as a supporting diagnostic rather than the primary objective.

## Interpretation

The sweep supports keeping:

- `allowShort=false`
- `maxUnits=4`
- `entryPeriod=20`
- `exitPeriod=10`

as the current research defaults.

The strongest competitor is `40/20`. It is close enough to deserve future attention, especially in portfolio testing, but it does not beat `20/10` as a general single-symbol default.

The longer settings show that channel length may eventually be worth adapting by asset, market regime, or portfolio context. But this is not the right time to overfit parameters. The current matrix is still single-symbol and gives each run isolated capital.

## Recommended Next Steps

1. Commit the entry/exit sweep support in `scripts/runMatrix.js`.
2. Keep the current research defaults at `allowShort=false`, `maxUnits=4`, `entryPeriod=20`, `exitPeriod=10`.
3. Consider saving `40/20` and `55/20` as alternative configurations to revisit during portfolio testing.
4. Avoid expanding into a much larger parameter grid yet. The current signal is good enough to move toward portfolio-level validation.
5. Start designing a portfolio backtester with shared capital, concurrent positions, exposure limits, and portfolio-level drawdown.

## Bottom Line

Shorter periods are favored overall, and the original `20/10` Turtle-style channel setting remains the best research default. It is not the top setting on every single aggregate metric, but it is the strongest all-around choice by frequency of wins, return/drawdown, Sharpe, and number of positive runs.

The next big question is no longer "which single-symbol channel period looks best?" It is whether the current default survives portfolio-level constraints.
