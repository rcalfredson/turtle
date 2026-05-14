# Large-Cap Stock Universe - 2026-05-13

Source reports:

- Strategy summary: `reports/portfolio-sp500-top100-established-2026-05-13.csv`
- Strategy trade audit: `reports/portfolio-sp500-top100-established-2026-05-13-trades.csv`
- Strategy equity audit: `reports/portfolio-sp500-top100-established-2026-05-13-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`
- Benchmark equity audit: `reports/benchmark-sp500-top100-established-2026-05-13-equity.csv`

Universe:

- `universes/sp500-top100-established.txt`
- `96` current large-cap S&P 500 symbols
- Based on a current market-cap-ranked S&P 500 list, with a few obvious too-new listings/spinoffs excluded for this first pass.

Strategy settings:

- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=5`
- `maxOpenPositions=10`

## Executive Summary

This is the most negative test so far.

On the larger current-large-cap stock universe, the trend-following strategy lost money in all four tested windows. Same-universe equal-weight buy-and-hold beat every broad ETF benchmark, while the strategy failed to beat any benchmark on return, CAGR, Sharpe, or return/drawdown.

Average results:

- Strategy average return: `-12.80%`
- Strategy average CAGR: `-4.02%`
- Same-universe equal-weight average return: `100.68%`
- Same-universe equal-weight average CAGR: `19.83%`
- `SPY` average CAGR: `12.39%`
- `QQQ` average CAGR: `17.36%`

This is a major reality check. The current baseline strategy is not merely lagging buy-and-hold here; it is actively destroying capital while the universe itself performs very well.

## Average Results

| Model | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Strategy | `-12.80%` | `-4.02%` | `37.36%` | `-0.353` | `-0.071` | `-0.106` | `85.15%` |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `3.971` | `1.043` | `1.441` | `100.00%` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` | `1.037` | `100.00%` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` | `1.163` | `100.00%` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` | `0.541` | `100.00%` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` | `0.851` | `100.00%` |

The sector ETF test showed a strategy that reduced drawdown but gave up too much return.

This test is worse. The larger stock-universe strategy has higher average drawdown than same-universe buy-and-hold and produces negative return.

## Range-Level Results

| Range | Strategy Return | Same-Universe Return | `SPY` Return | `QQQ` Return | Strategy CAGR | Same-Universe CAGR | Strategy DD | Same-Universe DD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `-14.47%` | `146.68%` | `80.40%` | `136.51%` | `-3.08%` | `19.79%` | `36.17%` | `34.34%` |
| 2021-2023 | `-11.10%` | `43.93%` | `28.88%` | `32.40%` | `-3.85%` | `12.93%` | `36.18%` | `23.61%` |
| 2022-2024 | `-23.25%` | `36.91%` | `22.69%` | `27.27%` | `-8.45%` | `11.05%` | `35.86%` | `22.98%` |
| 2023-2026 | `-2.39%` | `175.20%` | `89.24%` | `154.90%` | `-0.72%` | `35.54%` | `41.24%` | `21.50%` |

The `2023-2026` window is especially striking. This was a very strong period for the universe, but the strategy returned `-2.39%` with a `41.24%` drawdown.

That means the current rules were not merely defensive. They were entering and exiting in a way that missed the strongest compounding while still taking large losses.

## Win Counts

Across the four tested windows, the strategy's win counts were:

| Benchmark | Return Wins | CAGR Wins | Lower DD Wins | Sharpe Wins | Return/DD Wins |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `0/4` | `0/4` | `0/4` | `0/4` | `0/4` |
| `SPY` | `0/4` | `0/4` | `0/4` | `0/4` | `0/4` |
| `QQQ` | `0/4` | `0/4` | `0/4` | `0/4` | `0/4` |
| `IWM` | `0/4` | `0/4` | `1/4` | `0/4` | `0/4` |
| `DIA` | `0/4` | `0/4` | `1/4` | `0/4` | `0/4` |

This is close to a clean sweep against the strategy.

## Trade Diagnostics

The strategy made `553` completed exits across the four windows.

Aggregate trade behavior:

- total exit win rate: `38.34%`
- average range win rate: roughly `38%`
- average profit factor: below `1.0`
- average exposure: `85.15%`
- max open positions observed: only `4-5`, despite `maxOpenPositions=10`

That last point matters. The problem was not that the strategy sat in cash for long periods. Unlike the sector ETF test, this run was usually invested. But it was concentrated in a small number of names, and the selected trades did not work.

Top net contributors across the trade log included:

| Symbol | Net PnL | Trades | Wins | Losses |
| --- | ---: | ---: | ---: | ---: |
| `NVDA` | `52464.02` | `21` | `12` | `9` |
| `AAPL` | `25120.05` | `21` | `13` | `8` |
| `IBM` | `24761.44` | `4` | `4` | `0` |
| `NFLX` | `16456.09` | `13` | `9` | `4` |
| `NEM` | `13834.67` | `8` | `4` | `4` |

Largest detractors included:

| Symbol | Net PnL | Trades | Wins | Losses |
| --- | ---: | ---: | ---: | ---: |
| `AMZN` | `-25536.79` | `21` | `1` | `20` |
| `DELL` | `-19385.96` | `10` | `1` | `9` |
| `WDC` | `-18673.10` | `13` | `2` | `11` |
| `DE` | `-16394.45` | `8` | `0` | `8` |
| `CAT` | `-14793.13` | `13` | `4` | `9` |

The positive outliers were not enough to overcome broad whipsaw losses.

## Interpretation

This result weakens the case for the current strategy baseline considerably.

The earlier promising results were heavily dependent on the smaller mega-cap/ETF universe. Once the universe expanded, the same `20/10`, `maxUnits=1`, gap-aware strategy did not become more robust. It became worse.

The likely reasons are:

- The universe has many simultaneous breakout candidates.
- The current simulator processes same-day signals alphabetically by symbol.
- The strategy has no ranking model for choosing the best breakouts.
- Position sizing allows the portfolio to become concentrated in only a few names.
- The `20/10` channel may be too fast for noisy individual stocks.
- Gap-aware fills make breakout entries materially less favorable.
- Long-only buy-and-hold of the selected current large-cap universe was extremely strong.

The key lesson is that a larger universe alone does not solve selection. It creates a bigger selection problem. The current strategy does not yet have a good answer to that problem.

## Does This Rule Out The Strategy?

It rules out the current baseline as a live-ready system.

It does not fully rule out the strategy family.

The current implementation still has several rough edges that matter more in a large universe than in a small one:

- entry candidates are not ranked by trend strength, volatility, liquidity, momentum, or distance from breakout,
- same-day signal ordering is alphabetical,
- position sizing is risk-based but not capped by portfolio allocation per symbol,
- the portfolio often holds only `4-5` positions despite a `96`-symbol universe,
- and the `20/10` channel was chosen from smaller-universe tests.

Those are not minor details. In a large universe, they may be the difference between "trend following" and "randomly taking a few breakouts."

So the next research question is not:

> Does vanilla `20/10` Turtle work on a big stock list?

The current answer is no.

The better question is:

> Can a ranked, better-diversified trend-following variant beat passive benchmarks on a larger universe?

That question remains open.

## Caution On The Benchmark

The same-universe benchmark is also not perfectly fair in the other direction.

This universe is based on current large-cap S&P 500 names. That gives buy-and-hold a serious hindsight advantage, because the list contains many companies that survived and became very large by 2026.

So same-universe buy-and-hold is a brutal hurdle.

But the strategy also lost badly to `SPY`, `QQQ`, `IWM`, and `DIA`. That part is harder to dismiss. Even if the same-universe benchmark is hindsight-biased, the broad ETF comparison still says the current strategy is not competitive.

## Recommended Next Steps

1. Do not use the current baseline as a candidate for real money.
2. Preserve this result as a negative checkpoint.
3. Before more parameter sweeps, add ranking/selection diagnostics for same-day entry candidates.
4. Consider adding position allocation caps so the portfolio can hold more names from a large universe.
5. Then rerun targeted sweeps on the large-cap universe:
   - entry/exit periods,
   - risk percent,
   - max open positions,
   - and possibly ranked entry selection.

The most important next improvement is probably not tuning `entryPeriod` or `exitPeriod` in isolation. It is making the large-universe selection process less arbitrary.

Alphabetical selection was acceptable as a temporary research simplification. This test suggests it is no longer acceptable for large-universe work.
