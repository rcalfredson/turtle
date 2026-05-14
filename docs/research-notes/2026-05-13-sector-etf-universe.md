# Sector ETF Universe - 2026-05-13

Source reports:

- Strategy summary: `reports/portfolio-sector-etfs-2026-05-13.csv`
- Strategy trade audit: `reports/portfolio-sector-etfs-2026-05-13-trades.csv`
- Strategy equity audit: `reports/portfolio-sector-etfs-2026-05-13-equity.csv`
- Benchmark summary: `reports/benchmark-sector-etfs-2026-05-13.csv`
- Benchmark equity audit: `reports/benchmark-sector-etfs-2026-05-13-equity.csv`

Universe:

- `SPY`
- `QQQ`
- `IWM`
- `DIA`
- `XLB`
- `XLC`
- `XLE`
- `XLF`
- `XLI`
- `XLK`
- `XLP`
- `XLRE`
- `XLU`
- `XLV`
- `XLY`

Strategy settings:

- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=5`

## Executive Summary

Your read is right: on this sector ETF universe, buy-and-hold benchmarks substantially outperform the trend-following strategy on return.

This is the first universe-realism test, and it changes the interpretation in a meaningful way.

The strategy still controls drawdown better than the passive benchmarks, but it gives up too much upside. Average strategy CAGR is only `4.25%`, compared with:

- `9.80%` for equal-weight buy-and-hold of the same ETF universe,
- `12.39%` for `SPY`,
- `17.36%` for `QQQ`,
- `5.47%` for `IWM`,
- and `8.43%` for `DIA`.

So this is not a close raw-return result. On a diversified ETF universe, the current `20/10`, `maxUnits=1`, gap-aware strategy looks too conservative and too often out of the market.

## Average Results

| Model | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Strategy | `15.81%` | `4.25%` | `12.57%` | `1.410` | `0.398` | `0.526` | `58.54%` |
| Same-universe equal-weight | `41.81%` | `9.80%` | `23.95%` | `1.854` | `0.666` | `0.906` | `100.00%` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` | `1.037` | `100.00%` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` | `1.163` | `100.00%` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` | `0.541` | `100.00%` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` | `0.851` | `100.00%` |

The only average category where the strategy clearly wins is drawdown. Its average max drawdown is `12.57%`, roughly half of the same-universe benchmark's `23.95%`.

But the return penalty is large. The same-universe ETF basket earns more than twice the average return, and `SPY` earns more than three times the average return.

## Same-Universe Comparison

| Range | Strategy Return | Same-Universe Return | Strategy CAGR | Same-Universe CAGR | Strategy DD | Same-Universe DD | Strategy Sharpe | Same-Universe Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `20.89%` | `58.77%` | `3.87%` | `9.69%` | `10.35%` | `35.81%` | `0.351` | `0.550` |
| 2021-2023 | `15.17%` | `27.24%` | `4.83%` | `8.37%` | `10.31%` | `21.05%` | `0.457` | `0.574` |
| 2022-2024 | `16.53%` | `13.70%` | `5.23%` | `4.38%` | `10.35%` | `21.38%` | `0.473` | `0.350` |
| 2023-2026 | `10.66%` | `67.54%` | `3.09%` | `16.77%` | `19.29%` | `17.58%` | `0.312` | `1.189` |

The strategy beats same-universe buy-and-hold only in the `2022-2024` window, and that was the weakest passive window in the test.

That is important. The strategy did what a defensive trend system might do in a harder market: it avoided some damage, kept drawdown low, and slightly beat the basket. But in stronger windows, it badly lagged.

The `2023-2026` row is especially unfavorable. The strategy returned only `10.66%` while the same-universe ETF basket returned `67.54%`, and the strategy also had higher drawdown in that window.

## Broad Benchmark Comparison

Against the ETF benchmarks, the strategy's return profile is weak:

| Benchmark | Return Wins | CAGR Wins | Lower DD Wins | Sharpe Wins | Return/DD Wins |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `1/4` | `1/4` | `3/4` | `1/4` | `3/4` |
| `SPY` | `0/4` | `0/4` | `3/4` | `0/4` | `2/4` |
| `QQQ` | `0/4` | `0/4` | `4/4` | `1/4` | `2/4` |
| `IWM` | `2/4` | `2/4` | `4/4` | `3/4` | `3/4` |
| `DIA` | `1/4` | `1/4` | `3/4` | `1/4` | `3/4` |

This strategy does still beat `IWM` in two windows on return and three windows on Sharpe, but that is not enough to rescue the result. Against `SPY`, `QQQ`, and the same ETF universe, the strategy mostly loses on the metrics that matter most for long-term growth.

## What Changed Versus The Stock Universe

This universe has different behavior from the earlier mega-cap stock universe.

The earlier stock universe contained individual securities with large, persistent upside trends. The strategy could enter those winners and still produce strong results, even though it did not fully match buy-and-hold.

The sector ETF universe is more diversified and smoother. It has fewer explosive individual trends, and the broad market itself is already a strong passive competitor. In that environment, a `20/10` breakout/exit system can become a drag:

- it waits for confirmation before entering,
- it exits on weakness,
- it sits in cash roughly `41%` of the time,
- and it does not have enough explosive single-name winners to compensate for missed market exposure.

That explains the low average exposure: `58.54%` for the strategy versus `100%` for buy-and-hold.

Lower exposure helped reduce drawdown, but it also meant the strategy did not participate enough during broad ETF advances.

## Interpretation

This is a useful reality check.

For a broad ETF universe, the current strategy is not compelling as a return-seeking replacement for passive exposure.

It may still be useful if the goal is specifically defensive timing, lower exposure, or lower drawdown. But for the original question of whether the system can beat simple passive alternatives, this test is negative.

The result also clarifies the strategy's likely dependency:

> The current rules appear to need strong, persistent, security-specific trends to overcome their cash drag and whipsaw cost.

That is not automatically bad. Trend following often works best when the universe contains instruments with diverse and independent trend behavior. But sector ETFs may be too broad, too correlated, and too already-diversified for this simple long-only breakout system to shine.

## Current Conclusion

This sector ETF test does not invalidate all prior work, but it does narrow the use case.

The current strategy should not be viewed as a general-purpose replacement for buying `SPY`, `QQQ`, or a diversified ETF basket.

It remains potentially interesting as:

- a risk-managed stock-selection strategy,
- a way to trade a broader single-stock universe,
- or a defensive overlay where lower drawdown is worth lower expected return.

But it is not yet evidence of a broadly superior portfolio system.

## Recommended Next Steps

1. Keep this sector ETF result as a cautionary benchmark.
2. Do not tune parameters on this universe yet; that would risk overfitting immediately after the first negative result.
3. Run a broader stock universe next, preferably with more non-winners mixed in.
4. Compare that broader stock result against equal-weight buy-and-hold and broad ETFs.
5. Add yearly/monthly return diagnostics soon, because this result raises a timing question: the strategy may only help in specific market regimes.

The next best universe is probably not more ETFs. It is a broader liquid stock list where the strategy has a real selection problem to solve.
