# Rescue Channel Sweep - 2026-05-14

Source reports:

- Strategy summary: `reports/portfolio-rescue-channel-sweep-2026-05-14.csv`
- Strategy trade audit: `reports/portfolio-rescue-channel-sweep-2026-05-14-trades.csv`
- Strategy equity audit: `reports/portfolio-rescue-channel-sweep-2026-05-14-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`

Universe:

- `universes/sp500-top100-established.txt`
- `96` current large-cap S&P 500 symbols

Strategy settings:

- `gapAwareFills=true`
- `maxUnits=1`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=5`
- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`

Channel pairs tested:

- `20/10`
- `40/10`
- `40/20`
- `55/10`
- `55/20`
- `55/50`
- `100/10`
- `100/20`
- `100/50`

## Executive Summary

Your read is right: the channel sweep is encouraging, but ambiguous.

The clearest result is that longer exits help. The strongest average performers are:

- `55/50`
- `100/50`
- `100/20`
- `55/20`

That suggests the earlier `20/10` setting was too reactive for the large-cap, momentum-ranked, diversified version of the strategy. It exited too quickly and created too much churn.

The best average channel pair is `55/50`:

- average return: `47.85%`
- average CAGR: `10.14%`
- average max drawdown: `29.33%`
- average Sharpe: `0.545`
- average profit factor: `1.662`

That is a major improvement over the prior rescue baseline:

- `20/10` average return: `17.59%`
- `20/10` average CAGR: `4.60%`
- `20/10` average profit factor: `1.126`

But this is still not a clean victory. No one channel pair dominates every date range, and the strongest long-exit variants get a large boost from the strong `2023-2026` trend window.

## Average Results By Channel Pair

| Entry/Exit | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure | Avg Profit Factor | Avg Trades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `55/50` | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` | `0.712` | `83.69%` | `1.662` | `160.3` |
| `100/50` | `46.61%` | `9.98%` | `26.20%` | `1.625` | `0.550` | `0.704` | `77.83%` | `1.803` | `150.0` |
| `100/20` | `27.69%` | `6.81%` | `21.72%` | `1.223` | `0.492` | `0.650` | `74.49%` | `1.312` | `245.8` |
| `55/20` | `24.05%` | `5.31%` | `24.98%` | `0.915` | `0.391` | `0.516` | `80.48%` | `1.211` | `272.3` |
| `20/10` | `17.59%` | `4.60%` | `24.77%` | `0.789` | `0.355` | `0.498` | `86.48%` | `1.126` | `493.5` |
| `40/20` | `11.28%` | `2.36%` | `27.35%` | `0.348` | `0.180` | `0.234` | `82.99%` | `1.089` | `295.5` |
| `40/10` | `6.48%` | `1.78%` | `23.82%` | `0.247` | `0.181` | `0.265` | `81.16%` | `1.055` | `455.8` |
| `100/10` | `4.90%` | `1.27%` | `18.27%` | `0.317` | `0.144` | `0.180` | `71.81%` | `1.046` | `395.5` |
| `55/10` | `-1.48%` | `-0.94%` | `24.98%` | `-0.083` | `-0.010` | `-0.016` | `78.25%` | `0.967` | `439.3` |

The pattern is very strong:

- Fast exits such as `/10` mostly underperform.
- Slower exits such as `/20` and especially `/50` perform better.
- `100/50` has the best drawdown-adjusted profile among the high-return variants.
- `55/50` has the highest average return and CAGR.

The strategy appears to need more room to hold trends once it enters.

## Range-Level Winners

| Range | Best Return Pair | Best Return | Best Sharpe Pair | Best Sharpe |
| --- | --- | ---: | --- | ---: |
| 2020-2024 | `55/20` | `50.87%` | `55/20` | `0.607` |
| 2021-2023 | `100/20` | `18.32%` | `100/20` | `0.495` |
| 2022-2024 | `100/20` | `7.33%` | `100/20` | `0.238` |
| 2023-2026 | `55/50` | `136.93%` | `55/50` | `1.301` |

The `100/20` pair is interesting because it wins the two middle windows, including the difficult `2022-2024` period. It does not produce the best average return, but it may be the more robust setting.

The `55/50` pair is strongest overall, but its average is heavily helped by the `2023-2026` row:

- `55/50` in `2023-2026`: `136.93%`
- `100/50` in `2023-2026`: `129.03%`

Those are very strong rows. They are also exactly the kind of rows that can tempt overfitting if read too eagerly.

## Compared With The Prior Rescue Baseline

Prior large-universe rescue baseline:

- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`

That baseline now looks too fast.

| Channel | Avg Return | Avg CAGR | Avg DD | Avg Sharpe | Avg Profit Factor | Avg Trades |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `20/10` | `17.59%` | `4.60%` | `24.77%` | `0.355` | `1.126` | `493.5` |
| `55/50` | `47.85%` | `10.14%` | `29.33%` | `0.545` | `1.662` | `160.3` |
| `100/50` | `46.61%` | `9.98%` | `26.20%` | `0.550` | `1.803` | `150.0` |
| `100/20` | `27.69%` | `6.81%` | `21.72%` | `0.492` | `1.312` | `245.8` |

The slower pairs trade far less and have much higher profit factor. That is a good sign. It suggests they are reducing whipsaw rather than merely taking more risk.

## Benchmark Context

The strategy is getting closer, but it still does not beat the main passive hurdles.

Average benchmark CAGRs:

- Same-universe equal-weight: `19.83%`
- `SPY`: `12.39%`
- `QQQ`: `17.36%`
- `IWM`: `5.47%`
- `DIA`: `8.43%`

Best strategy CAGRs from this sweep:

- `55/50`: `10.14%`
- `100/50`: `9.98%`
- `100/20`: `6.81%`

This means the best strategy variants are now better than `IWM` and `DIA` on average CAGR, but still below `SPY`, `QQQ`, and same-universe buy-and-hold.

That is a meaningful improvement from where the large-universe strategy started, but it is not yet enough to call the strategy competitive.

## Robustness Notes

The strongest pair by average return is `55/50`, but the more robust-looking pair may be `100/20`.

Why `55/50` is attractive:

- best average return,
- best average CAGR,
- excellent `2023-2026` result,
- strong profit factor,
- fewer trades.

Why `100/20` is attractive:

- best result in `2021-2023`,
- best result in `2022-2024`,
- lowest average drawdown among the top four performers,
- lower exposure,
- less dependence on the huge `2023-2026` win.

That creates the ambiguity:

> `55/50` looks best if we prioritize upside; `100/20` looks better if we prioritize robustness.

## Symbol Concentration

For the top average pair, `55/50`, the biggest contributors were concentrated:

| Symbol | Net PnL | Trades | Wins | Losses |
| --- | ---: | ---: | ---: | ---: |
| `WDC` | `48739.89` | `13` | `1` | `12` |
| `STX` | `43966.34` | `4` | `2` | `2` |
| `META` | `28410.86` | `5` | `4` | `1` |
| `CRWD` | `24244.79` | `16` | `6` | `10` |
| `NVDA` | `18438.31` | `13` | `5` | `8` |

This is classic trend-following behavior: many small losses, a few large winners.

The concern is that the result depends heavily on a small set of winners. That is normal for trend following, but it means we should be cautious about treating one channel pair as proven from four date windows.

## Current Best Interpretation

The rescue path is now much more credible than it was after the first large-cap test.

The progression has been:

| Version | Avg CAGR | Avg DD | Avg Sharpe |
| --- | ---: | ---: | ---: |
| Alphabetical, `1.0%` risk, `20/10` | `-4.03%` | `37.36%` | `-0.071` |
| `momentum126`, `1.0%` risk, `20/10` | `0.33%` | `39.95%` | `0.130` |
| `momentum126`, `0.25%` risk, `20/10` | `4.60%` | `24.77%` | `0.355` |
| `momentum126`, `0.25%` risk, `55/50` | `10.14%` | `29.33%` | `0.545` |
| `momentum126`, `0.25%` risk, `100/50` | `9.98%` | `26.20%` | `0.550` |

That is real progress.

The strategy is no longer obviously bad. But it still has not cleared the benchmark hurdle.

## Recommended Next Step

The next test should revisit `maxUnits`, but only narrowly.

Reasoning:

- We have now improved selection, risk sizing, and channel length.
- The best longer-channel variants hold trends better.
- Pyramiding was harmful under the old fast-channel/gap-aware setup.
- But pyramiding might behave differently with slower channels and lower risk.

The clean next experiment would be:

- keep `entryRank=momentum126`,
- keep `riskPercent=0.25`,
- keep `maxOpenPositions=10`,
- keep `gapAwareFills=true`,
- keep `slippageBps=5`,
- test `maxUnits=1,2,4`,
- only on the top channel candidates: `55/50`, `100/50`, and `100/20`.

This avoids a giant parameter search while checking whether pyramiding can help the newly improved version.

If pyramiding still hurts, then we probably keep `maxUnits=1` and move to a different rescue lever, such as:

- relative-strength filters versus `SPY`,
- market regime filters,
- or position allocation caps.

## Current Conclusion

The channel sweep is the strongest rescue result so far.

Longer entry/exit periods, especially longer exits, materially improve the large-universe strategy. The best variants now approach respectable returns, though they still trail `SPY`, `QQQ`, and same-universe buy-and-hold.

The most promising candidates are:

- `55/50` for highest average return,
- `100/50` for a similar return with lower average drawdown,
- `100/20` for robustness across the middle windows.

The strategy is still not ready. But it has moved from "probably dead" to "worth one more controlled round of rescue testing."
