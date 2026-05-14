# Benchmark Comparison - 2026-05-13

Source reports:

- Benchmark summary: `reports/benchmark-comparison-2026-05-13.csv`
- Benchmark equity curves: `reports/benchmark-comparison-2026-05-13-equity.csv`
- Strategy source comparison: `reports/portfolio-gap-channel-sweep-2026-05-12.csv`

This note compares the current realistic strategy candidate against passive alternatives.

Current strategy candidate:

- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=0,5,10`

Passive benchmarks:

- equal-weight buy-and-hold of the same 18-symbol universe,
- `SPY`,
- `QQQ`,
- `IWM`,
- `DIA`.

## Executive Summary

The strategy clears the broad-market ETF hurdle, but it does not clearly beat equal-weight buy-and-hold of the same universe on raw return.

That is an important distinction.

Compared with `SPY`, `IWM`, and `DIA`, the strategy is materially better across return, CAGR, drawdown, Sharpe, and return/drawdown. It also usually beats `QQQ`, though `QQQ` wins raw return in the strongest recent window.

Compared with equal-weight buy-and-hold of the same 18 symbols, the strategy is different:

- passive same-universe buy-and-hold has higher average raw return and CAGR,
- the strategy has much lower drawdown,
- the strategy has slightly better Sharpe at `0-5 bps`,
- the strategy has better return/drawdown in most but not all windows,
- and the strategy uses about `75%` average exposure instead of `100%`.

So the current strategy is not a pure return-maximizer versus owning the same universe. Its case is risk-managed participation.

## Average Results

| Model | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Strategy, `0 bps` | `126.94%` | `24.88%` | `15.98%` | `7.999` | `1.325` | `2.014` | `74.69%` |
| Strategy, `5 bps` | `120.09%` | `23.88%` | `16.21%` | `7.455` | `1.278` | `1.938` | `74.68%` |
| Strategy, `10 bps` | `112.85%` | `22.81%` | `16.55%` | `6.869` | `1.228` | `1.855` | `74.63%` |
| Same-universe equal-weight | `148.80%` | `26.67%` | `24.09%` | `5.864` | `1.228` | `1.716` | `100.00%` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` | `1.037` | `100.00%` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` | `1.163` | `100.00%` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` | `0.541` | `100.00%` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` | `0.851` | `100.00%` |

The benchmark that matters most is same-universe equal-weight, because it controls for the strong mega-cap and ETF universe. The strategy does not beat that benchmark on average return. But it cuts average drawdown from `24.09%` to roughly `16%`, and it does so while being invested only about three-quarters of the time.

## Same-Universe Comparison

Using `5 bps` slippage as the practical strategy reference:

| Range | Strategy Return | Same-Universe Return | Strategy CAGR | Same-Universe CAGR | Strategy DD | Same-Universe DD | Strategy Sharpe | Same-Universe Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `193.44%` | `252.42%` | `24.03%` | `28.66%` | `15.38%` | `31.59%` | `1.249` | `1.130` |
| 2021-2023 | `84.22%` | `75.77%` | `22.63%` | `20.72%` | `15.37%` | `20.87%` | `1.214` | `1.085` |
| 2022-2024 | `79.93%` | `62.64%` | `21.64%` | `17.61%` | `15.30%` | `20.68%` | `1.203` | `0.950` |
| 2023-2026 | `122.77%` | `204.37%` | `27.20%` | `39.70%` | `18.78%` | `23.20%` | `1.445` | `1.748` |

The strategy beats same-universe buy-and-hold in the middle two windows, but loses badly in the strongest trend windows: `2020-2024` and `2023-2026`.

That makes sense. A trend-following exit system can protect capital during choppier windows, but it can also exit or under-participate during strong persistent bull moves. Equal-weight buy-and-hold gets the full compounding of the best long-term winners.

## Broad ETF Comparison

Against broad ETFs, the strategy looks much stronger.

At `5 bps`, the strategy beats `SPY` in all four windows on:

- return,
- CAGR,
- max drawdown,
- Sharpe,
- and return/drawdown.

It also beats `IWM` in all four windows across those same metrics.

Against `DIA`, it wins return, CAGR, Sharpe, and return/drawdown in all four windows, though `DIA` has slightly lower drawdown in the 2023-2026 window.

Against `QQQ`, the strategy mostly wins on risk control:

- strategy beats `QQQ` on drawdown in all four windows,
- strategy beats `QQQ` on return and CAGR in three of four windows,
- strategy beats `QQQ` on Sharpe in three of four windows,
- `QQQ` wins the 2023-2026 window on raw return, CAGR, and Sharpe.

So the strategy clears the broad-market hurdle. The harder hurdle is same-universe buy-and-hold.

## Win Counts

Across the four tested windows, strategy win counts versus each benchmark are:

| Strategy Slippage | Benchmark | Return Wins | CAGR Wins | Lower DD Wins | Sharpe Wins | Return/DD Wins |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| `0 bps` | Same-universe | `2/4` | `2/4` | `4/4` | `3/4` | `3/4` |
| `5 bps` | Same-universe | `2/4` | `2/4` | `4/4` | `3/4` | `3/4` |
| `10 bps` | Same-universe | `2/4` | `2/4` | `4/4` | `3/4` | `3/4` |
| `5 bps` | `SPY` | `4/4` | `4/4` | `4/4` | `4/4` | `4/4` |
| `5 bps` | `QQQ` | `3/4` | `3/4` | `4/4` | `3/4` | `3/4` |
| `5 bps` | `IWM` | `4/4` | `4/4` | `4/4` | `4/4` | `4/4` |
| `5 bps` | `DIA` | `4/4` | `4/4` | `3/4` | `4/4` | `4/4` |

This is probably the cleanest summary:

> The strategy is better than broad passive ETFs in this test, but it is not obviously better than simply owning the selected universe.

## Interpretation

The strategy still has a case, but the case is narrower and more realistic than the early backtests suggested.

It is not:

> A system that obviously dominates passive ownership of the same stocks.

It may be:

> A risk-managed way to participate in a strong universe, with lower drawdowns and less exposure than buy-and-hold.

That distinction matters. If the goal is maximum return and the investor can tolerate full buy-and-hold drawdowns, equal-weight ownership of the same universe is hard to beat. If the goal is smoother participation, lower drawdown, and systematic risk management, the strategy remains interesting.

## Caveats

The same-universe benchmark is not a neutral market portfolio. It is the same current handpicked mega-cap and ETF universe. That benchmark benefits from the same survivorship and selection issues as the strategy test.

This is good for fairness, but not enough for live-confidence. It answers:

> Does the strategy add value versus owning this same selected universe?

It does not answer:

> Would the strategy work on a historically unbiased universe?

The broad ETF benchmarks answer a different question:

> Would this strategy have beaten common investable index alternatives over these windows?

On that question, the answer is mostly yes.

## Current Conclusion

The benchmark comparison is encouraging, but it is not a slam dunk.

The strategy deserves continued research because:

- it beats broad ETF benchmarks,
- it materially reduces drawdown versus same-universe buy-and-hold,
- it has better or comparable risk-adjusted metrics,
- and it uses lower average exposure.

But the strategy also needs more scrutiny because:

- same-universe buy-and-hold wins average raw return,
- the strategy underperforms in the strongest bull windows,
- and universe selection remains a major unresolved issue.

## Recommended Next Steps

1. Add yearly and monthly return breakdowns for the strategy and benchmarks.
2. Compare worst calendar year and worst rolling drawdown period.
3. Add a broader, less cherry-picked universe test.
4. Eventually test sector-balanced or randomized universes.
5. Keep `20/10`, `maxUnits=1`, `gapAwareFills=true` as the current realistic strategy baseline.

The next best diagnostic is probably yearly returns. The benchmark result tells us the strategy is plausible, but we need to see when it wins and when it lags.
