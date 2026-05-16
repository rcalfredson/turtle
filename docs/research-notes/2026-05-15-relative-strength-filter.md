# Relative Strength Filter Sweep - 2026-05-15

Source reports:

- Strategy summary: `reports/portfolio-relative-strength-sweep-2026-05-15.csv`
- Strategy trade audit: `reports/portfolio-relative-strength-sweep-2026-05-15-trades.csv`
- Strategy equity audit: `reports/portfolio-relative-strength-sweep-2026-05-15-equity.csv`
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
- no market regime filter

Relative strength settings tested:

- `relativeStrengthLookback=0`: no relative strength filter
- `relativeStrengthSymbol=SPY`, `relativeStrengthLookback=126`: only allow entries where the symbol's prior 126-day return is greater than SPY's prior 126-day return

Max unit settings tested:

- `1`
- `2`
- `4`

## Executive Summary

The relative strength filter is useful, but not universally.

The cleanest result is:

> Relative strength helps the `maxUnits=1` version, is mixed for `maxUnits=2`, and hurts `maxUnits=4`.

For `maxUnits=1`, the filter improved the overall quality of the strategy:

- average CAGR rose from `10.14%` to `10.54%`
- average max drawdown fell from `29.33%` to `25.84%`
- average Sharpe rose from `0.545` to `0.633`
- average profit factor rose from `1.662` to `1.774`

That is a good result. It means the filter is doing what we hoped: removing some weaker breakouts while preserving enough winners.

But the filter did not redeem the strategy against the main benchmarks. The best relative-strength result still trails:

- `SPY` average CAGR: `12.39%`
- `QQQ` average CAGR: `17.36%`
- same-universe equal-weight average CAGR: `19.83%`

So this is a quality improvement, not the breakthrough.

## Average Results By Max Units

| Max Units | RS Filter | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Profit Factor | Avg Exposure | Avg Entries | Avg Adds |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | off | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` | `0.712` | `1.662` | `83.69%` | `160.3` | `0.0` |
| `1` | `SPY 126` | `45.77%` | `10.54%` | `25.84%` | `1.723` | `0.633` | `0.804` | `1.774` | `76.94%` | `142.0` | `0.0` |
| `2` | off | `50.26%` | `8.59%` | `27.84%` | `1.906` | `0.482` | `0.651` | `1.635` | `87.01%` | `122.5` | `67.0` |
| `2` | `SPY 126` | `33.06%` | `7.84%` | `26.24%` | `1.381` | `0.502` | `0.641` | `1.572` | `78.61%` | `108.5` | `55.3` |
| `4` | off | `47.24%` | `9.62%` | `28.17%` | `1.772` | `0.520` | `0.708` | `1.701` | `86.62%` | `106.3` | `111.8` |
| `4` | `SPY 126` | `28.63%` | `6.08%` | `29.11%` | `1.033` | `0.372` | `0.477` | `1.418` | `78.87%` | `101.5` | `101.5` |

The filter reduces exposure in every case. That is expected because it blocks entries where the stock is not beating SPY over the prior 126 trading days.

The key distinction is whether the lost exposure was worth it:

- for `maxUnits=1`, yes,
- for `maxUnits=2`, only partially,
- for `maxUnits=4`, no.

## Average Deltas From The Filter

| Max Units | Return Delta | CAGR Delta | DD Delta | Sharpe Delta | Profit Factor Delta | Exposure Delta |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `-2.08%` | `+0.39%` | `-3.49%` | `+0.088` | `+0.112` | `-6.74%` |
| `2` | `-17.20%` | `-0.75%` | `-1.61%` | `+0.021` | `-0.063` | `-8.40%` |
| `4` | `-18.61%` | `-3.54%` | `+0.94%` | `-0.148` | `-0.283` | `-7.75%` |

This table is probably the most useful read.

The `maxUnits=1` filter is a classic quality improvement:

- slightly lower raw return,
- better CAGR,
- materially lower drawdown,
- better Sharpe,
- better profit factor.

The `maxUnits=2` filter is ambiguous:

- lower return and CAGR,
- lower drawdown,
- slightly better Sharpe,
- worse profit factor.

The `maxUnits=4` filter is mostly worse.

## Entry Blocking

| Max Units | Avg Blocked Entries | Avg Missing Symbol Momentum |
| ---: | ---: | ---: |
| `1` | `2747.5` | `579.8` |
| `2` | `2759.3` | `579.8` |
| `4` | `2760.0` | `579.8` |

The filter blocked a large number of raw breakout candidates. That does not mean it blocked actual trades one-for-one, because the portfolio can only hold up to `10` symbols and entries are ranked by `momentum126`.

Still, this tells us the filter is meaningful. It is not a cosmetic setting. It aggressively narrows the candidate pool before ranking and capital allocation.

The missing symbol momentum count is mostly a warmup effect: some symbols did not have enough prior data to compute a 126-day return at the time of a breakout candidate.

## Range-Level Results

### `maxUnits=1`

| Range | Off Return | RS Return | Off CAGR | RS CAGR | Off DD | RS DD | Off Sharpe | RS Sharpe | Off PF | RS PF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `43.85%` | `62.64%` | `7.54%` | `10.22%` | `30.99%` | `28.60%` | `0.510` | `0.614` | `1.440` | `1.656` |
| `2021-2023` | `9.58%` | `12.14%` | `3.10%` | `3.90%` | `30.18%` | `26.71%` | `0.269` | `0.327` | `1.204` | `1.281` |
| `2022-2024` | `1.05%` | `28.79%` | `0.35%` | `8.81%` | `23.17%` | `17.45%` | `0.100` | `0.599` | `1.020` | `1.692` |
| `2023-2026` | `136.93%` | `79.52%` | `29.58%` | `19.21%` | `32.98%` | `30.61%` | `1.301` | `0.992` | `2.984` | `2.466` |

This is a strong result for the filter.

It improves the first three windows, including a large improvement in the hard `2022-2024` window. It hurts the latest `2023-2026` window, but that window was also the one where the unfiltered version caught especially large winners.

For the one-unit version, the filter looks like a real robustness improvement.

### `maxUnits=2`

| Range | Off Return | RS Return | Off CAGR | RS CAGR | Off DD | RS DD | Off Sharpe | RS Sharpe | Off PF | RS PF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `153.50%` | `58.84%` | `20.45%` | `9.70%` | `25.88%` | `25.94%` | `0.973` | `0.559` | `2.695` | `1.675` |
| `2021-2023` | `22.11%` | `12.18%` | `6.90%` | `3.91%` | `25.67%` | `26.13%` | `0.428` | `0.303` | `1.481` | `1.302` |
| `2022-2024` | `-0.21%` | `33.77%` | `-0.07%` | `10.19%` | `29.18%` | `16.61%` | `0.082` | `0.670` | `0.996` | `1.857` |
| `2023-2026` | `25.62%` | `27.45%` | `7.09%` | `7.56%` | `30.65%` | `36.27%` | `0.443` | `0.478` | `1.366` | `1.452` |

This result is mixed.

The filter dramatically improves `2022-2024`, and it slightly improves `2023-2026`. But it gives up the huge `2020-2024` unfiltered result.

This is similar to the market-regime finding: filters help difficult windows, but they can also cut off the exact large winners that make pyramiding work.

### `maxUnits=4`

| Range | Off Return | RS Return | Off CAGR | RS CAGR | Off DD | RS DD | Off Sharpe | RS Sharpe | Off PF | RS PF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `102.26%` | `71.86%` | `15.13%` | `11.44%` | `25.31%` | `30.19%` | `0.703` | `0.589` | `2.087` | `1.774` |
| `2021-2023` | `9.57%` | `2.49%` | `3.10%` | `0.83%` | `29.26%` | `33.00%` | `0.252` | `0.144` | `1.212` | `1.057` |
| `2022-2024` | `13.34%` | `35.08%` | `4.26%` | `10.55%` | `30.10%` | `23.29%` | `0.301` | `0.583` | `1.256` | `1.748` |
| `2023-2026` | `63.79%` | `5.08%` | `15.97%` | `1.50%` | `28.02%` | `29.97%` | `0.825` | `0.173` | `2.249` | `1.093` |

This is not encouraging for `maxUnits=4`.

The filter improves `2022-2024`, but it damages the other three windows. It also worsens average drawdown and risk-adjusted return.

## Contributor Notes

For `maxUnits=1`, the filtered version changed the leading contributors:

| Version | Top Contributors |
| --- | --- |
| Unfiltered | `WDC`, `STX`, `META`, `CRWD`, `NVDA` |
| `SPY 126` filter | `DELL`, `STX`, `WDC`, `META`, `CRWD`, `NVDA` |

The filter did not simply remove all large winners. It kept several leaders and added `DELL` as the top contributor. That supports the idea that the filter improved selection in the one-unit setup.

For `maxUnits=2`, the filtered version kept some strong names, but it reduced the size of the largest unfiltered wins:

| Symbol | Unfiltered Net PnL | Filtered Net PnL |
| --- | ---: | ---: |
| `META` | `62678` | `39531` |
| `DELL` | `50559` | not in top 8 |
| `NVDA` | `31548` | not in top 8 |
| `CRWD` | `28843` | `38860` |

This is why the filtered `maxUnits=2` average is weaker despite good results in some windows. It improved some trade quality, but clipped too much of the large-winner engine.

For `maxUnits=4`, the filtered version still had large winners such as `META` and `NVDA`, but the total result deteriorated. That suggests the issue is not just whether the top winners remain; it is also timing, concentration, and which add-on sequences survive the filter.

## Benchmark Context

Average benchmark results from the large-cap benchmark report:

| Benchmark | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `3.971` | `1.042` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` |

Best filtered result from this sweep:

- `maxUnits=1`, `SPY 126` filter: `10.54%` average CAGR, `25.84%` average max drawdown, `0.633` Sharpe

That is cleaner than the unfiltered `maxUnits=1` strategy and competitive with `DIA`, but it still falls short of:

- `SPY`,
- `QQQ`,
- and same-universe equal-weight buy-and-hold.

So the same core conclusion remains: relative strength helps, but does not yet make the strategy benchmark-beating.

## Interpretation

The relative strength filter is more promising than the market regime filter for the conservative version of the strategy.

Why:

- It directly filters stock-level leadership.
- It improves the difficult `2022-2024` window materially.
- It improves drawdown, Sharpe, Sortino, and profit factor for `maxUnits=1`.
- It does not depend on a broad market switch that may be too blunt for individual-stock trends.

But it also reinforces a recurring pattern:

> Filters make the strategy cleaner, but they can suppress the big-winner behavior that pyramiding needs.

That means our current best version is drifting toward:

- fewer units,
- cleaner entry selection,
- slower channels,
- lower risk,
- and less dependence on pyramiding.

This is a more realistic strategy profile, but also a less explosive one.

## Current Best Candidate

The best filtered candidate from this sweep is:

- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `relativeStrengthSymbol=SPY`
- `relativeStrengthLookback=126`

Average metrics:

- return: `45.77%`
- CAGR: `10.54%`
- max drawdown: `25.84%`
- return/drawdown: `1.723`
- Sharpe: `0.633`
- profit factor: `1.774`

This is arguably the cleanest strategy variant so far, even though it is not the highest-return variant.

## Recommended Next Step

The next experiment should not jump straight to more complexity.

First, we should test whether this filter is robust to the lookback choice:

- `relativeStrengthLookback=0,63,126`
- maybe `252` if we want a slower leadership test

Keep the rest narrow:

- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `gapAwareFills=true`
- `slippageBps=5`

The key question is:

> Is 126-day relative strength genuinely special, or is any reasonable relative-strength filter helpful?

If `63` and `126` both improve risk-adjusted performance, the idea has more credibility. If only `126` works, we should be more cautious about overfitting.

After that, a stricter two-lookback filter could be tested:

```text
symbol prior 63-day return > SPY prior 63-day return
symbol prior 126-day return > SPY prior 126-day return
```

But that should come later. The next clean move is a lookback sweep.

## Current Conclusion

The relative strength filter does more good than bad for the conservative one-unit strategy.

It does not redeem the system against the main benchmarks, but it moves the strategy in a healthier direction. It improves selection quality and risk-adjusted behavior, especially in the difficult middle windows.

For pyramiding, the result is much less compelling. `maxUnits=2` is mixed and `maxUnits=4` is worse.

For now, the best research default candidate should probably shift toward:

```text
entryPeriod=55
exitPeriod=50
maxUnits=1
riskPercent=0.25
entryRank=momentum126
relativeStrengthSymbol=SPY
relativeStrengthLookback=126
```

The next question is whether that relative-strength lookback choice is robust.
