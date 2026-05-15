# Rescue Max Units Sweep - 2026-05-14

Source reports:

- Strategy summary: `reports/portfolio-rescue-maxunits-sweep-2026-05-14.csv`
- Strategy trade audit: `reports/portfolio-rescue-maxunits-sweep-2026-05-14-trades.csv`
- Strategy equity audit: `reports/portfolio-rescue-maxunits-sweep-2026-05-14-equity.csv`
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

Channel and max unit combinations tested:

- `55/20`, `55/50`, `100/20`, `100/50`
- `maxUnits=1`, `2`, and `4`

The `55/20` pair was included as an extra comparison because the command swept `entryPeriod=55,100` against `exitPeriod=20,50`.

## Executive Summary

Your read is directionally right, but the full result is more nuanced:

- Higher `maxUnits` helps some of the slower-channel variants a lot.
- It does not help every variant.
- Across all tested rows, `maxUnits=1` still has the best broad average CAGR, drawdown, Sharpe, and profit factor.
- The most interesting rescue candidate is now `55/50` with pyramiding enabled.

The best average row remains `55/50 / maxUnits=1` by CAGR:

- average return: `47.85%`
- average CAGR: `10.14%`
- average max drawdown: `29.33%`
- average Sharpe: `0.545`
- average profit factor: `1.662`

But `55/50 / maxUnits=2` has the highest average raw return:

- average return: `50.26%`
- average CAGR: `8.59%`
- average max drawdown: `27.84%`
- average Sharpe: `0.482`
- average profit factor: `1.635`

And `55/50 / maxUnits=4` is also viable:

- average return: `47.24%`
- average CAGR: `9.62%`
- average max drawdown: `28.17%`
- average Sharpe: `0.520`
- average profit factor: `1.701`

So pyramiding is not a blanket fix. But with the slower `55/50` channel, it is no longer obviously harmful. That is a meaningful change from the earlier gap-aware max-units sweep.

## Average Results By Channel And Max Units

| Entry/Exit/Units | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Profit Factor | Avg Trades | Avg Added Unit PnL |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `55/50/1` | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` | `0.712` | `1.662` | `160.3` | `0` |
| `100/50/1` | `46.61%` | `9.98%` | `26.20%` | `1.625` | `0.550` | `0.704` | `1.803` | `150.0` | `0` |
| `55/50/4` | `47.24%` | `9.62%` | `28.17%` | `1.772` | `0.520` | `0.752` | `1.701` | `106.3` | `25328` |
| `55/20/4` | `44.96%` | `8.66%` | `32.51%` | `1.328` | `0.424` | `0.620` | `1.406` | `160.0` | `29179` |
| `55/50/2` | `50.26%` | `8.59%` | `27.84%` | `1.906` | `0.482` | `0.704` | `1.635` | `122.5` | `20581` |
| `100/50/2` | `38.38%` | `7.85%` | `26.89%` | `1.449` | `0.475` | `0.629` | `1.526` | `111.3` | `15927` |
| `100/20/1` | `27.69%` | `6.80%` | `21.71%` | `1.223` | `0.492` | `0.650` | `1.312` | `245.8` | `0` |
| `100/20/2` | `25.36%` | `5.69%` | `26.67%` | `0.883` | `0.364` | `0.494` | `1.238` | `179.0` | `12314` |
| `55/20/1` | `24.04%` | `5.31%` | `24.98%` | `0.915` | `0.391` | `0.516` | `1.211` | `272.3` | `0` |
| `55/20/2` | `21.46%` | `4.77%` | `29.09%` | `0.688` | `0.320` | `0.446` | `1.195` | `198.3` | `8397` |
| `100/50/4` | `35.97%` | `4.50%` | `34.04%` | `1.054` | `0.255` | `0.343` | `1.323` | `111.0` | `22128` |
| `100/20/4` | `-0.67%` | `-1.75%` | `34.93%` | `-0.026` | `-0.037` | `-0.053` | `0.953` | `160.3` | `72` |

The strongest result is not "more units is always better."

The cleaner pattern is:

- `55/50` handles add-ons reasonably well.
- `100/50` handles `maxUnits=2`, but `maxUnits=4` becomes much weaker.
- `100/20` is damaged badly by `maxUnits=4`.
- `55/20` benefits from `maxUnits=4` in raw return but takes a much larger drawdown.

That makes sense mechanically. Pyramiding needs time. It is most useful when the exit is slow enough to keep the full position alive through a real trend. When the channel exits too quickly, or when entries are too late, add-ons can create larger positions near trend exhaustion.

## Average Results By Max Units

| Max Units | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe | Avg Profit Factor | Avg Added Units | Avg Added Unit PnL |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `36.55%` | `8.06%` | `25.56%` | `0.495` | `1.497` | `0.0` | `0` |
| `2` | `33.86%` | `6.73%` | `27.62%` | `0.410` | `1.398` | `85.8` | `14305` |
| `4` | `31.88%` | `5.26%` | `32.41%` | `0.291` | `1.346` | `141.1` | `19177` |

This table is the main reason not to overstate the result.

The added units are profitable in aggregate, but the strategy gives back enough elsewhere that higher `maxUnits` does not improve the overall average. More pyramiding increases position intensity, and that extra intensity is not distributed evenly across time windows.

So `maxUnits=4` is not a new default. It is a candidate only in combination with specific channel settings.

## Range-Level Winners

| Range | Best Return Setting | Best Return | Best Sharpe Setting | Best Sharpe |
| --- | --- | ---: | --- | ---: |
| 2020-2024 | `55/50/2` | `153.50%` | `55/50/2` | `0.973` |
| 2021-2023 | `55/50/2` | `22.11%` | `100/20/1` | `0.495` |
| 2022-2024 | `55/50/4` | `13.34%` | `100/50/2` | `0.312` |
| 2023-2026 | `55/50/1` | `136.93%` | `55/50/1` | `1.301` |

This is promising for `55/50`.

`55/50/2` wins the first two ranges, and `55/50/4` wins the difficult `2022-2024` range by return. But `55/50/1` still dominates the latest strong window.

That suggests add-ons are helping in some historical regimes, but the optimal amount of pyramiding is unstable.

## Channel-Specific Read

### `55/50`

This is now the main rescue channel.

| Max Units | Avg Return | Avg CAGR | Avg DD | Avg Sharpe | Avg Profit Factor |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `47.85%` | `10.14%` | `29.33%` | `0.545` | `1.662` |
| `2` | `50.26%` | `8.59%` | `27.84%` | `0.482` | `1.635` |
| `4` | `47.24%` | `9.62%` | `28.17%` | `0.520` | `1.701` |

There is no clean winner. `maxUnits=1` has the best average CAGR and Sharpe, `2` has the best average raw return and return/drawdown, and `4` has the best profit factor.

This channel is worth more study.

### `100/50`

`100/50` becomes less convincing once pyramiding is added.

| Max Units | Avg Return | Avg CAGR | Avg DD | Avg Sharpe | Avg Profit Factor |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `46.61%` | `9.98%` | `26.20%` | `0.550` | `1.803` |
| `2` | `38.38%` | `7.85%` | `26.89%` | `0.475` | `1.526` |
| `4` | `35.97%` | `4.50%` | `34.04%` | `0.255` | `1.323` |

The base version is still very attractive, but add-ons dilute it. The long entry period may already be late enough that pyramiding adds too much after the trend is mature.

### `100/20`

This was the robustness candidate in the channel sweep, but pyramiding hurts it.

| Max Units | Avg Return | Avg CAGR | Avg DD | Avg Sharpe | Avg Profit Factor |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `27.69%` | `6.80%` | `21.71%` | `0.492` | `1.312` |
| `2` | `25.36%` | `5.69%` | `26.67%` | `0.364` | `1.238` |
| `4` | `-0.67%` | `-1.75%` | `34.93%` | `-0.037` | `0.953` |

This is a clear warning. Pyramiding can turn an okay trend-following setup into a fragile one if the add-ons are not paired with a compatible exit.

## Biggest Contributors

For `55/50/2`, the largest contributors were:

| Symbol | Net PnL | Base PnL | Added Unit PnL | Trades | Wins/Losses |
| --- | ---: | ---: | ---: | ---: | ---: |
| `META` | `62678` | `31701` | `30976` | `4` | `4/0` |
| `DELL` | `50559` | `28169` | `22390` | `14` | `4/10` |
| `NVDA` | `31548` | `15891` | `15658` | `16` | `3/13` |
| `CRWD` | `28843` | `14595` | `14248` | `15` | `3/12` |
| `TSLA` | `15977` | `17723` | `-1746` | `12` | `5/7` |

For `55/50/4`, the largest contributors were:

| Symbol | Net PnL | Base PnL | Added Unit PnL | Trades | Wins/Losses |
| --- | ---: | ---: | ---: | ---: | ---: |
| `META` | `104182` | `27090` | `77092` | `4` | `4/0` |
| `NVDA` | `44742` | `11560` | `33182` | `10` | `3/7` |
| `DELL` | `35134` | `21538` | `13596` | `6` | `3/3` |
| `TSLA` | `24813` | `15212` | `9602` | `11` | `4/7` |
| `APH` | `15849` | `3977` | `11872` | `1` | `1/0` |

This is classic trend-following behavior. The add-ons make a small number of large winners much larger, while many individual symbol trade records still have more losing exits than winning exits.

That is not automatically bad, but it means the strategy's success depends on catching and pressing a small subset of major trends.

## Benchmark Context

Average benchmark results from the same large-cap universe report:

| Benchmark | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `3.971` | `1.042` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` |

Best strategy rows from this sweep:

| Strategy | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| `55/50/1` | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` |
| `55/50/2` | `50.26%` | `8.59%` | `27.84%` | `1.906` | `0.482` |
| `55/50/4` | `47.24%` | `9.62%` | `28.17%` | `1.772` | `0.520` |
| `100/50/1` | `46.61%` | `9.98%` | `26.20%` | `1.625` | `0.550` |

The strategy is getting closer to `SPY`, but it still does not beat it on average CAGR, drawdown-adjusted return, or Sharpe.

It also still trails same-universe equal-weight by a wide margin. That benchmark is biased by the current large-cap universe, but it is still the right harsh comparison for this specific test.

## About A `maxUnits=10` Moonshot

A `maxUnits=10` test is worth running, but only if we treat it as a stress test rather than a likely default.

Why it might help:

- The best `55/50` results show that add-ons can materially improve winning trends.
- `maxUnits=4` was not obviously destructive for `55/50`.
- Trend-following systems often depend on pressing rare large winners.

Why it might mislead:

- The broad average gets worse as `maxUnits` rises from `1` to `4`.
- `100/20/4` becomes outright negative.
- The top contributors become more concentrated.
- A high `maxUnits` setting may simply lever the historical winners that happened to exist in this window.
- Real capital usage and gap risk become more important as positions grow.

So the next run can include `maxUnits=6,8,10`, but it should probably be narrow:

- only test `55/50`,
- keep `riskPercent=0.25`,
- keep `maxOpenPositions=10`,
- include `maxUnits=1,2,4,6,8,10`,
- interpret anything above `4` as exploratory until it survives other universes and out-of-sample windows.

## Current Best Interpretation

This sweep slightly improves the rescue story, but does not settle it.

The most important change is that pyramiding is no longer ruled out. Under the earlier gap-aware setup, `maxUnits=1` looked clearly preferable. After adding:

- `momentum126` entry ranking,
- lower `riskPercent`,
- slower channels,
- and the large-cap universe,

pyramiding becomes useful in selected settings.

The current candidate set should probably be:

- conservative candidate: `100/50/1`
- balanced candidate: `55/50/1`
- pyramiding candidate: `55/50/2`
- aggressive pyramiding candidate: `55/50/4`

I would not move `maxUnits=4` into the research default yet. The average-by-max-units table says that broad pyramiding still adds fragility. But `55/50` deserves a more focused follow-up.

## Recommended Next Step

The next clean test should be a narrow pyramiding stress test:

- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1,2,4,6,8,10`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `gapAwareFills=true`
- `slippageBps=5`

That directly answers the moonshot question without opening a giant parameter grid.

If `maxUnits=6-10` improves return without a severe drawdown or concentration penalty, then the strategy may need a more careful add-on policy. If it blows up the middle windows, then we have learned that pyramiding has a useful but limited range.

After that, the next non-pyramiding rescue levers should probably be:

- market regime filters,
- relative-strength filters versus `SPY`,
- or a stricter entry filter that requires both breakout and broad-market confirmation.

## Current Conclusion

The strategy is no longer on the brink of dismissal, but it has not earned real confidence yet.

The `55/50` channel has turned pyramiding from a liability into a plausible source of improvement. That is real progress. But the strategy still trails the major passive benchmarks, and higher `maxUnits` increases dependence on a small set of major winners.

For now, the best conclusion is:

> Pyramiding is worth testing further, but only in the slower `55/50` configuration. The next test should be a narrow `maxUnits` stress test, not a broad search.
