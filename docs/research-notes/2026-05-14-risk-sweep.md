# Risk Percent Sweep - 2026-05-14

Source reports:

- Strategy summary: `reports/portfolio-risk-sweep-2026-05-14.csv`
- Strategy trade audit: `reports/portfolio-risk-sweep-2026-05-14-trades.csv`
- Strategy equity audit: `reports/portfolio-risk-sweep-2026-05-14-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`

Note: the generated trade/equity audit files for this run were produced before `riskPercent` was added to those audit row schemas. The summary CSV has the correct `riskPercent` values and is the main source for this note.

Universe:

- `universes/sp500-top100-established.txt`
- `96` current large-cap S&P 500 symbols

Strategy settings:

- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=5`
- `entryRank=momentum126`
- `maxOpenPositions=10`

Risk levels:

- `0.25%`
- `0.5%`
- `1.0%`

## Executive Summary

This is another real improvement, but still not enough.

Lowering `riskPercent` from `1.0%` to `0.25%` improves the strategy materially:

- average return improves from `1.18%` to `17.59%`,
- average CAGR improves from `0.33%` to `4.60%`,
- average max drawdown falls from `39.95%` to `24.77%`,
- average Sharpe rises from `0.130` to `0.355`,
- average profit factor rises from `1.012` to `1.126`,
- and max open positions reaches `10` in every tested window.

That is the best sign of life so far in the large-cap universe.

But the strategy still badly trails passive benchmarks. Same-universe buy-and-hold averaged `19.83%` CAGR, `SPY` averaged `12.39%`, and `QQQ` averaged `17.36%`. The best risk setting here, `0.25%`, averages only `4.60%` CAGR.

So risk diversification helps. It does not yet make the strategy competitive.

## Average Results By Risk Percent

| Risk % | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure | Avg Profit Factor | Avg Trades | Avg Max Open |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0.25` | `17.59%` | `4.60%` | `24.77%` | `0.789` | `0.355` | `0.498` | `86.48%` | `1.126` | `493.5` | `10.00` |
| `0.5` | `5.74%` | `0.50%` | `34.25%` | `0.196` | `0.088` | `0.119` | `88.18%` | `1.016` | `279.5` | `7.75` |
| `1.0` | `1.18%` | `0.33%` | `39.95%` | `-0.004` | `0.130` | `0.177` | `83.74%` | `1.012` | `138.0` | `4.25` |

The relationship is not perfectly monotonic, but the overall direction is clear:

- `0.25%` is the best risk setting,
- `1.0%` is too concentrated,
- `0.5%` is oddly weak because of a severe `2022-2024` result,
- and lower risk allows the system to take many more trades and hold more names.

This supports the diversification thesis from the entry-rank report.

## Range-Level Results

| Range | Best Risk | Best Return | `0.25%` Return | `0.5%` Return | `1.0%` Return | `0.25%` DD | `0.5%` DD | `1.0%` DD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `0.25` | `18.78%` | `18.78%` | `13.37%` | `-9.38%` | `28.88%` | `32.44%` | `34.70%` |
| 2021-2023 | `1.0` | `14.41%` | `12.73%` | `0.10%` | `14.41%` | `27.97%` | `34.42%` | `39.78%` |
| 2022-2024 | `0.25` | `5.62%` | `5.62%` | `-29.19%` | `-17.37%` | `23.94%` | `36.81%` | `37.48%` |
| 2023-2026 | `0.5` | `38.69%` | `33.21%` | `38.69%` | `17.07%` | `18.30%` | `33.32%` | `47.83%` |

`0.25%` is the most stable risk level. It is not the top return in every window, but it avoids the worst failures and has the best drawdown profile.

The `2022-2024` row is especially important:

- `0.25%`: `5.62%`
- `0.5%`: `-29.19%`
- `1.0%`: `-17.37%`

This shows that position breadth can make a major difference during harder regimes.

## Benchmark Comparison

The improvement still does not clear the passive hurdle.

Average benchmark results:

| Model | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: |
| Strategy, `0.25%` risk | `17.59%` | `4.60%` | `24.77%` | `0.355` |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `1.043` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `0.764` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `0.826` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.348` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `0.608` |

At `0.25%` risk, the strategy becomes more defensible as a lower-drawdown system. It nearly matches same-universe buy-and-hold drawdown and beats `QQQ` and `IWM` drawdown on average.

But the return gap is still enormous:

- `0.25%` risk strategy CAGR: `4.60%`
- same-universe CAGR: `19.83%`
- `SPY` CAGR: `12.39%`
- `QQQ` CAGR: `17.36%`

This is not close enough yet.

## What The Sweep Teaches

The strategy is very sensitive to portfolio construction.

At `1.0%` risk, the system only averaged `4.25` max open positions. At `0.25%` risk, it hit the `10` position cap in every window.

That is a major clue:

> The strategy was not only suffering from bad signal selection; it was also too concentrated.

With lower per-trade risk, the strategy can hold more names. That improves both return and drawdown. This suggests the large-universe version needs to behave more like a diversified trend-following portfolio, not a concentrated breakout picker.

## Current Best Large-Universe Baseline

The current best large-universe baseline is now:

- `entryRank=momentum126`
- `riskPercent=0.25`
- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `slippageBps=5`
- `maxOpenPositions=10`

This is much better than the original large-cap baseline:

| Version | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe | Avg Max Open |
| --- | ---: | ---: | ---: | ---: | ---: |
| Alphabetical, `1.0%` risk | `-12.80%` | `-4.03%` | `37.36%` | `-0.071` | `4.50` |
| `momentum126`, `1.0%` risk | `1.18%` | `0.33%` | `39.95%` | `0.130` | `4.25` |
| `momentum126`, `0.25%` risk | `17.59%` | `4.60%` | `24.77%` | `0.355` | `10.00` |

That is a real progression. The strategy has moved from clearly broken to weak but diagnosable.

## Recommended Next Step

The next step should be another diversification move, not pyramiding or channel tuning yet.

Because `0.25%` risk hits `maxOpenPositions=10` in every window, the next question is:

> Does allowing more concurrent positions improve diversification further, or does it just add lower-quality breakouts?

The clean next experiment is a `maxOpenPositions` sweep:

- keep `riskPercent=0.25`,
- keep `entryRank=momentum126`,
- keep `entryPeriod=20` and `exitPeriod=10`,
- test `maxOpenPositions=10,20,30`,
- and compare return, drawdown, Sharpe, exposure, and trade count.

This is more informative than immediately tuning channels. If the portfolio is still capped at 10 names, channel changes might only tell us which signals work best under an artificial concentration limit.

After the max-open-positions test, channel tuning becomes more meaningful.

## Current Conclusion

The strategy is not saved, but it is no longer falling straight into the wastepaper basket.

Two rescue moves have helped:

1. `entryRank=momentum126`
2. `riskPercent=0.25`

Together, they turn the large-universe test from a losing system into a modestly profitable, lower-drawdown system.

But the benchmark gap remains too large. A strategy returning `4.60%` CAGR while `SPY` earns `12.39%` and same-universe buy-and-hold earns `19.83%` is not a practical replacement for passive investing.

The next test should determine whether broader position count can close more of that gap without blowing up drawdown.
