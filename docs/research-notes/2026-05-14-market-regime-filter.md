# Market Regime Filter Sweep - 2026-05-14

Source reports:

- Strategy summary: `reports/portfolio-market-regime-sweep-2026-05-14.csv`
- Strategy trade audit: `reports/portfolio-market-regime-sweep-2026-05-14-trades.csv`
- Strategy equity audit: `reports/portfolio-market-regime-sweep-2026-05-14-equity.csv`
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

Regime settings tested:

- `marketRegimeMa=0`: no market regime filter
- `marketRegimeSymbol=SPY`, `marketRegimeMa=200`: only allow new entries and add-ons when `SPY` prior close is above its prior 200-day simple moving average

Max unit settings tested:

- `1`
- `2`
- `4`

## Executive Summary

The market regime filter worked mechanically, but it did not rescue the strategy.

The important nuance is that it helped the conservative `maxUnits=1` version:

- average CAGR improved from `10.14%` to `10.73%`
- average max drawdown fell from `29.33%` to `25.00%`
- average Sharpe improved from `0.545` to `0.612`

That is a real improvement. The filter reduced exposure, blocked many breakouts, and improved risk-adjusted behavior.

But it hurt the pyramiding versions:

- `maxUnits=2` average CAGR fell from `8.59%` to `6.68%`
- `maxUnits=4` average CAGR fell from `9.62%` to `8.39%`
- the `maxUnits=2` raw return was nearly cut in half

So the result is not "regime filter bad." It is more specific:

> The SPY 200-day regime filter improves the single-unit strategy, but it interferes with the add-on behavior that made the pyramiding variants interesting.

That means the regime filter may be useful for a conservative version of the strategy, but it is not the missing lever that makes the strategy beat the broad ETFs or same-universe buy-and-hold.

## Filter Mechanics

The filter is an entry and add-on gate.

For each simulation day, the strategy checks:

```text
SPY prior close > SPY prior 200-day SMA
```

If true:

- new breakout entries are allowed,
- add-on units are allowed,
- stops and channel exits work normally.

If false:

- new breakout entries are blocked,
- add-on units are blocked,
- existing positions are not forcibly liquidated,
- stops and channel exits still work normally.

The filter uses prior data only. It does not use same-day SPY close to decide same-day entries.

The runner also fetches warmup data before each strategy range so the 200-day moving average can be evaluated at the start of the backtest window.

## Average Results By Max Units

| Max Units | Regime | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Profit Factor | Avg Exposure | Avg Entries | Avg Adds |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | off | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` | `0.712` | `1.662` | `83.69%` | `160.3` | `0.0` |
| `1` | `SPY 200SMA` | `49.05%` | `10.73%` | `25.00%` | `1.972` | `0.612` | `0.770` | `1.778` | `73.42%` | `136.3` | `0.0` |
| `2` | off | `50.26%` | `8.59%` | `27.84%` | `1.906` | `0.482` | `0.651` | `1.635` | `87.01%` | `122.5` | `67.0` |
| `2` | `SPY 200SMA` | `26.73%` | `6.68%` | `28.57%` | `1.032` | `0.443` | `0.578` | `1.480` | `72.72%` | `112.3` | `59.3` |
| `4` | off | `47.24%` | `9.62%` | `28.17%` | `1.772` | `0.520` | `0.708` | `1.701` | `86.62%` | `106.3` | `111.8` |
| `4` | `SPY 200SMA` | `38.70%` | `8.39%` | `31.78%` | `1.653` | `0.544` | `0.760` | `1.925` | `72.03%` | `103.8` | `84.8` |

The strongest filtered row is `maxUnits=1`.

That matters because the filter did what a conservative market filter is supposed to do:

- reduce average exposure,
- reduce drawdown,
- improve Sharpe,
- improve profit factor,
- and improve CAGR slightly.

But the same filter is destructive for `maxUnits=2`, and mixed for `maxUnits=4`. It improves `maxUnits=4` profit factor and Sharpe, but still lowers CAGR and raises average max drawdown.

## Signal Blocking

| Max Units | Regime Active Days | Avg Blocked Entries | Avg Blocked Adds |
| ---: | ---: | ---: | ---: |
| `1` | `75.69%` | `914.5` | `0.0` |
| `2` | `75.69%` | `945.8` | `47.3` |
| `4` | `75.69%` | `952.0` | `82.0` |

The filter was active about three quarters of the time, so it was not overly restrictive in a crude calendar sense. But it still blocked a lot of breakout signals.

The add-on blocking is especially important:

- `maxUnits=2` had an average of `47.3` blocked add-on signals,
- `maxUnits=4` had an average of `82.0` blocked add-on signals.

This helps explain why the filter hurt the pyramiding variants. Pyramiding needs access to follow-through. The SPY 200-day filter sometimes prevented the strategy from adding during individual-stock trends, even when those trends later proved valuable.

## Base Unit And Added Unit PnL

| Max Units | Regime | Avg Base Unit PnL | Avg Added Unit PnL |
| ---: | --- | ---: | ---: |
| `1` | off | `47853` | `0` |
| `1` | `SPY 200SMA` | `49042` | `0` |
| `2` | off | `29674` | `20581` |
| `2` | `SPY 200SMA` | `17171` | `9564` |
| `4` | off | `21910` | `25328` |
| `4` | `SPY 200SMA` | `11932` | `26769` |

For `maxUnits=1`, the filter improved base-unit PnL. That is clean and encouraging.

For `maxUnits=2`, it reduced both base-unit and added-unit PnL. That is the clearest failure case.

For `maxUnits=4`, added-unit PnL actually improved, but base-unit PnL fell sharply and drawdown increased. That suggests the filter may have changed the timing and composition of trades in a way that preserved some larger add-on wins while weakening the broader trade base.

## Range-Level Results

### `maxUnits=1`

| Range | Off Return | Filtered Return | Off CAGR | Filtered CAGR | Off DD | Filtered DD | Off Sharpe | Filtered Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `43.85%` | `35.49%` | `7.54%` | `6.26%` | `30.99%` | `26.31%` | `0.510` | `0.478` |
| `2021-2023` | `9.58%` | `10.14%` | `3.10%` | `3.28%` | `30.18%` | `30.72%` | `0.269` | `0.297` |
| `2022-2024` | `1.05%` | `9.82%` | `0.35%` | `3.17%` | `23.17%` | `18.12%` | `0.100` | `0.298` |
| `2023-2026` | `136.93%` | `140.73%` | `29.58%` | `30.20%` | `32.98%` | `24.84%` | `1.301` | `1.375` |

This is the best argument for the filter.

The filter hurt the full `2020-2024` window, but it helped the other three windows. It was especially helpful in the difficult `2022-2024` range.

### `maxUnits=2`

| Range | Off Return | Filtered Return | Off CAGR | Filtered CAGR | Off DD | Filtered DD | Off Sharpe | Filtered Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `153.50%` | `17.99%` | `20.45%` | `3.37%` | `25.88%` | `33.58%` | `0.973` | `0.281` |
| `2021-2023` | `22.11%` | `0.27%` | `6.90%` | `0.09%` | `25.67%` | `34.60%` | `0.428` | `0.083` |
| `2022-2024` | `-0.21%` | `19.91%` | `-0.07%` | `6.24%` | `29.18%` | `18.94%` | `0.082` | `0.438` |
| `2023-2026` | `25.62%` | `68.76%` | `7.09%` | `17.02%` | `30.65%` | `27.15%` | `0.443` | `0.968` |

This is a split result, but the average damage is severe.

The filter dramatically improves `2022-2024` and `2023-2026`, but it destroys the huge unfiltered `2020-2024` result. The unfiltered `55/50/2` result depended heavily on trends that the SPY 200-day filter partly blocked.

### `maxUnits=4`

| Range | Off Return | Filtered Return | Off CAGR | Filtered CAGR | Off DD | Filtered DD | Off Sharpe | Filtered Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `102.26%` | `71.24%` | `15.13%` | `11.36%` | `25.31%` | `43.32%` | `0.703` | `0.687` |
| `2021-2023` | `9.57%` | `3.66%` | `3.10%` | `1.21%` | `29.26%` | `34.45%` | `0.252` | `0.155` |
| `2022-2024` | `13.34%` | `87.54%` | `4.26%` | `23.34%` | `30.10%` | `17.17%` | `0.301` | `1.355` |
| `2023-2026` | `63.79%` | `-7.63%` | `15.97%` | `-2.36%` | `28.02%` | `32.18%` | `0.825` | `-0.021` |

This is the strangest result.

The filter massively improves `2022-2024`, but it badly hurts `2023-2026`. That instability is not a great sign. It suggests the filter is interacting with pyramiding timing in a regime-dependent way rather than simply improving signal quality.

## Benchmark Context

Average benchmark CAGRs from the large-cap benchmark report:

- Same-universe equal-weight: `19.83%`
- `QQQ`: `17.36%`
- `SPY`: `12.39%`
- `DIA`: `8.43%`
- `IWM`: `5.47%`

Best filtered strategy result from this sweep:

- `55/50`, `maxUnits=1`, `SPY 200SMA`: `10.73%` average CAGR

That improves the strategy, but it still does not clear the core benchmarks:

- still below `SPY`,
- still well below `QQQ`,
- still far below same-universe equal-weight buy-and-hold.

It does remain above `IWM` and `DIA` on average CAGR, but that is not enough for our stated goal.

## Interpretation

The market regime filter answers the question:

> Is the broad market healthy enough to take fresh long-side risk?

The answer was useful, but incomplete.

For a one-unit strategy, the filter removes some weak-market breakouts and improves risk-adjusted returns. That is exactly what we hoped it would do.

For a pyramiding strategy, the same filter blocks too much follow-through. It can prevent add-ons while individual stocks are still developing strong trends. This is especially important because our best rescue attempts have depended on a small number of large trend wins.

In other words:

> The market filter is better at preventing some bad trades than it is at identifying the best individual-stock trends.

That points toward the next research direction. We probably need a stock-specific strength filter rather than a broad-market permission switch.

## Current Best Candidate

The best filtered candidate is:

- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `marketRegimeSymbol=SPY`
- `marketRegimeMa=200`

This candidate has:

- average return: `49.05%`
- average CAGR: `10.73%`
- average max drawdown: `25.00%`
- average Sharpe: `0.612`
- average profit factor: `1.778`

This is cleaner than the unfiltered `maxUnits=1` version, but still not competitive enough against `SPY`, `QQQ`, or same-universe buy-and-hold.

## Recommended Next Step

The next test should probably be a relative-strength filter against `SPY`.

Reasoning:

- The broad-market filter helped only modestly.
- It blocked too many useful individual-stock opportunities in the pyramiding variants.
- The strategy's problem may not be "avoid weak markets" as much as "only buy stocks that are clearly beating the market."

A clean next filter would be:

```text
symbol prior 126-day return > SPY prior 126-day return
```

or possibly:

```text
symbol prior 63-day return > SPY prior 63-day return
symbol prior 126-day return > SPY prior 126-day return
```

That would preserve the core breakout system, but require the candidate stock to show market-relative strength before entry.

For the first pass, keep the grid narrow:

- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1,2,4`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `gapAwareFills=true`
- `slippageBps=5`
- compare relative strength filter off versus `SPY` 126-day relative strength.

## Current Conclusion

The SPY 200-day market regime filter is a partial improvement, not a breakthrough.

It is useful enough to keep in the toolkit, especially for a conservative one-unit version of the system. But it does not redeem the strategy against the main benchmark hurdle.

The next rescue attempt should shift from broad-market regime detection to stock-specific relative strength.
