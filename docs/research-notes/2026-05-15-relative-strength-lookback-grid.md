# Relative Strength Lookback Grid - 2026-05-15

Source reports:

- Strategy summary: `reports/portfolio-relative-strength-lookback-grid-2026-05-15.csv`
- Strategy trade audit: `reports/portfolio-relative-strength-lookback-grid-2026-05-15-trades.csv`
- Strategy equity audit: `reports/portfolio-relative-strength-lookback-grid-2026-05-15-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`

Universe:

- `universes/sp500-top100-established.txt`
- `96` current large-cap S&P 500 symbols

Strategy settings:

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
- no market regime filter

Relative strength settings tested:

- `relativeStrengthLookback=0`: no relative strength filter
- `relativeStrengthSymbol=SPY`
- `relativeStrengthLookback=21,42,63,84,126`

## Executive Summary

The expanded relative-strength grid confirms the useful part of the prior finding:

> The relative-strength filter helps, and the stable neighborhood appears to be around `63` to `84` trading days.

The best average result in this sweep is `relativeStrengthLookback=84`:

- average return: `63.25%`
- average CAGR: `13.38%`
- average max drawdown: `27.21%`
- average return/drawdown: `2.250`
- average Sharpe: `0.694`
- average profit factor: `1.962`

That is the strongest version of the current large-cap trend-following strategy so far. It also finally clears `SPY` on average CAGR:

- strategy CAGR: `13.38%`
- `SPY` CAGR: `12.39%`

But your caution is right. This is not a decisive win over the S&P 500.

The strategy still trails `SPY` on risk-adjusted quality:

- strategy max drawdown: `27.21%`
- `SPY` max drawdown: `25.95%`
- strategy return/drawdown: `2.250`
- `SPY` return/drawdown: `2.272`
- strategy Sharpe: `0.694`
- `SPY` Sharpe: `0.764`

So the practical conclusion is:

> The `84`-day relative-strength filter is promising, but the edge over SPY is too narrow to justify much confidence yet, especially after accounting for operational burden, model risk, and universe bias.

## Average Results

| RS Lookback | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Profit Factor | Avg Exposure | Avg Entries | Avg Blocked Entries |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0` | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` | `0.712` | `1.662` | `83.69%` | `160.3` | `0.0` |
| `21` | `54.58%` | `10.91%` | `27.53%` | `1.912` | `0.557` | `0.732` | `1.776` | `83.89%` | `158.0` | `864.3` |
| `42` | `48.90%` | `10.33%` | `27.75%` | `1.657` | `0.563` | `0.744` | `1.711` | `83.62%` | `160.8` | `967.8` |
| `63` | `55.65%` | `12.02%` | `24.67%` | `2.172` | `0.653` | `0.847` | `1.847` | `83.29%` | `150.8` | `1496.8` |
| `84` | `63.25%` | `13.38%` | `27.21%` | `2.250` | `0.694` | `0.895` | `1.962` | `81.30%` | `148.5` | `2161.0` |
| `126` | `45.77%` | `10.54%` | `25.84%` | `1.723` | `0.633` | `0.804` | `1.774` | `76.94%` | `142.0` | `2747.5` |

The filter gets more restrictive as the lookback length increases. That is visible in:

- fewer entries,
- lower average exposure,
- more blocked entries,
- more missing symbol momentum warmup cases.

The important result is that restrictiveness is not the same thing as quality. `126` is stricter than `84`, but it performs worse on return and CAGR. `84` appears to be a better balance between selectivity and opportunity capture.

## Benchmark Context

Average benchmark results from the large-cap benchmark report:

| Benchmark | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `3.971` | `1.042` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` |

Best strategy result from this grid:

| Strategy | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| `55/50`, `maxUnits=1`, `SPY 84 RS` | `63.25%` | `13.38%` | `27.21%` | `2.250` | `0.694` |

This is a much better place than the strategy was before the relative-strength work. But as a replacement for passive `SPY`, it is still not convincing:

- it beats `SPY` by only `0.99` percentage points of average CAGR,
- it has slightly worse average drawdown,
- it has slightly worse return/drawdown,
- it has meaningfully worse Sharpe,
- it still lags `QQQ` and same-universe equal-weight buy-and-hold.

That small CAGR edge is not enough to count as a robust victory. It could easily be absorbed by operational friction, parameter fragility, data quirks, or out-of-sample decay.

## Range-Level Results

| Range | RS Lookback | Return | CAGR | Max DD | Sharpe | Profit Factor | Entries | Blocked Entries |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `0` | `43.85%` | `7.54%` | `30.99%` | `0.510` | `1.440` | `213` | `0` |
| `2020-2024` | `21` | `51.35%` | `8.64%` | `26.41%` | `0.564` | `1.519` | `208` | `1316` |
| `2020-2024` | `42` | `47.78%` | `8.13%` | `28.87%` | `0.540` | `1.473` | `212` | `1500` |
| `2020-2024` | `63` | `44.45%` | `7.63%` | `26.27%` | `0.522` | `1.471` | `209` | `2151` |
| `2020-2024` | `84` | `62.74%` | `10.23%` | `31.60%` | `0.633` | `1.637` | `204` | `2890` |
| `2020-2024` | `126` | `62.64%` | `10.22%` | `28.60%` | `0.614` | `1.656` | `196` | `3702` |
| `2021-2023` | `0` | `9.58%` | `3.10%` | `30.18%` | `0.269` | `1.204` | `136` | `0` |
| `2021-2023` | `21` | `10.68%` | `3.45%` | `30.17%` | `0.289` | `1.231` | `134` | `626` |
| `2021-2023` | `42` | `12.18%` | `3.91%` | `28.78%` | `0.317` | `1.263` | `133` | `674` |
| `2021-2023` | `63` | `19.54%` | `6.14%` | `24.36%` | `0.449` | `1.447` | `122` | `1149` |
| `2021-2023` | `84` | `10.89%` | `3.51%` | `28.60%` | `0.295` | `1.237` | `130` | `1785` |
| `2021-2023` | `126` | `12.14%` | `3.90%` | `26.71%` | `0.327` | `1.281` | `121` | `2287` |
| `2022-2024` | `0` | `1.05%` | `0.35%` | `23.17%` | `0.100` | `1.020` | `142` | `0` |
| `2022-2024` | `21` | `-6.03%` | `-2.05%` | `24.52%` | `-0.060` | `0.895` | `152` | `701` |
| `2022-2024` | `42` | `-0.61%` | `-0.20%` | `23.57%` | `0.070` | `0.990` | `153` | `755` |
| `2022-2024` | `63` | `7.57%` | `2.46%` | `22.25%` | `0.232` | `1.149` | `136` | `1198` |
| `2022-2024` | `84` | `22.58%` | `7.03%` | `20.27%` | `0.499` | `1.452` | `122` | `1771` |
| `2022-2024` | `126` | `28.79%` | `8.81%` | `17.45%` | `0.599` | `1.692` | `109` | `2099` |
| `2023-2026` | `0` | `136.93%` | `29.58%` | `32.98%` | `1.301` | `2.984` | `150` | `0` |
| `2023-2026` | `21` | `162.31%` | `33.60%` | `29.01%` | `1.437` | `3.461` | `138` | `814` |
| `2023-2026` | `42` | `136.24%` | `29.46%` | `29.76%` | `1.323` | `3.117` | `145` | `942` |
| `2023-2026` | `63` | `151.04%` | `31.85%` | `25.79%` | `1.408` | `3.320` | `136` | `1489` |
| `2023-2026` | `84` | `156.77%` | `32.74%` | `28.39%` | `1.347` | `3.523` | `138` | `2198` |
| `2023-2026` | `126` | `79.52%` | `19.21%` | `30.61%` | `0.992` | `2.466` | `142` | `2902` |

No single lookback dominates all windows:

- `84` is best in the average summary.
- `126` is strongest in the difficult `2022-2024` window.
- `63` is strongest in `2021-2023`.
- `21` is strongest in the hot `2023-2026` window.

That argues against treating `84` as a magic parameter. The better interpretation is that intermediate relative-strength confirmation helps, and the useful region is probably around `63` to `84` trading days.

## Contributor Notes

Top contributors by lookback:

| RS Lookback | Top Contributors |
| ---: | --- |
| `0` | `WDC`, `STX`, `META`, `CRWD`, `NVDA`, `AMD`, `MSFT`, `GLW` |
| `63` | `WDC`, `STX`, `CRWD`, `META`, `GLW`, `UBER`, `DELL`, `GE` |
| `84` | `DELL`, `WDC`, `STX`, `CRWD`, `NVDA`, `LLY`, `META`, `GLW` |
| `126` | `DELL`, `STX`, `WDC`, `META`, `CRWD`, `NVDA`, `BKNG`, `GE` |

The filter is not merely removing opportunity. The `63` and `84` versions retain several of the same winners while reshuffling the portfolio toward names whose own trend is beating SPY.

The `84`-day version is especially interesting because `DELL` becomes the largest contributor while the strategy still keeps major winners such as `WDC`, `STX`, `CRWD`, `NVDA`, and `META`.

That supports the idea that the relative-strength filter is doing real selection work. The remaining question is whether that selection is strong enough to beat a passive benchmark after all costs and practical burden.

## Interpretation

This result is encouraging, but not decisive.

The encouraging side:

- `84` beats unfiltered trend-following by a wide margin.
- `63` and `84` both improve the strategy's quality.
- `84` finally beats `SPY` on average CAGR.
- The filter works by improving stock selection, which has been the most promising rescue direction so far.

The skeptical side:

- `84` does not beat `SPY` on Sharpe.
- `84` does not beat `SPY` on return/drawdown.
- `84` has slightly worse drawdown than `SPY`.
- The CAGR edge over `SPY` is less than one percentage point.
- The strategy remains behind `QQQ` and same-universe equal-weight buy-and-hold.
- The universe is still based on current large-cap winners, so out-of-sample confidence should be limited.

So your read is right: the result is not strong enough yet to say this strategy is worth the logistical and administrative cost of running as a full replacement for passive index exposure.

The better conclusion is:

> Relative strength has made the active strategy respectable, but not yet compelling.

## Current Best Candidate

The current best candidate is:

```text
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

- return: `63.25%`
- CAGR: `13.38%`
- max drawdown: `27.21%`
- return/drawdown: `2.250`
- Sharpe: `0.694`
- profit factor: `1.962`

The more conservative sibling is:

```text
relativeStrengthLookback=63
```

Average metrics:

- return: `55.65%`
- CAGR: `12.02%`
- max drawdown: `24.67%`
- return/drawdown: `2.172`
- Sharpe: `0.653`
- profit factor: `1.847`

The `63` setting is less impressive on return, but it has the best average max drawdown in the grid.

## Recommended Next Step

The next step should not be another minor lookback tweak.

The practical bar is now:

> Can this system add value on top of a passive core, rather than trying to replace the passive core?

A reasonable next experiment is a hybrid structure:

- keep a fixed passive index allocation, such as `SPY`,
- reserve a smaller sleeve for the trend-following strategy,
- measure whether the active sleeve improves total portfolio CAGR, drawdown, Sharpe, or return/drawdown.

Example research framing:

```text
80% SPY buy-and-hold
20% trend-following sleeve
```

or:

```text
70% SPY buy-and-hold
30% trend-following sleeve
```

This matches the direction suggested by the results: let the index carry the broad equity risk premium, and let the trend system try to add stock-selection and timing value around the edges.

That would be a more realistic hurdle than asking the active system to beat SPY outright while holding frequent cash and bearing more operational complexity.
