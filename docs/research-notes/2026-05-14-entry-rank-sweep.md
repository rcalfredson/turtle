# Entry Rank Sweep - 2026-05-14

Source reports:

- Strategy summary: `reports/portfolio-entry-rank-sweep-2026-05-13.csv`
- Strategy trade audit: `reports/portfolio-entry-rank-sweep-2026-05-13-trades.csv`
- Strategy equity audit: `reports/portfolio-entry-rank-sweep-2026-05-13-equity.csv`
- Benchmark summary: `reports/benchmark-sp500-top100-established-2026-05-13.csv`

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
- `maxOpenPositions=10`

Entry rank modes:

- `alphabetical`: previous baseline, same-day breakouts processed alphabetically
- `momentum63`: same-day breakouts ranked by prior 63-trading-day return
- `momentum126`: same-day breakouts ranked by prior 126-trading-day return

The momentum ranks use prior closes only, so they should not introduce same-day lookahead.

## Executive Summary

Ranked entry selection helps, but it does not rescue the strategy yet.

The good news:

- replacing alphabetical selection with momentum ranking materially improves results,
- `momentum126` is the best average performer,
- `momentum126` turns the average return slightly positive,
- and ranked selection confirms that alphabetical ordering was a real weakness.

The bad news:

- even the best rank mode still badly trails buy-and-hold,
- drawdowns remain around `40%`,
- `momentum63` is unstable across windows,
- `momentum126` still loses to `SPY`, `QQQ`, and same-universe buy-and-hold on average,
- and the portfolio remains too concentrated, usually holding only about `4-6` names.

This is a promising diagnostic result, not a viable strategy result.

## Average Results By Entry Rank

| Entry Rank | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure | Avg Profit Factor | Avg Win Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `alphabetical` | `-12.80%` | `-4.03%` | `37.36%` | `-0.353` | `-0.071` | `-0.106` | `85.15%` | `0.903` | `38.19%` |
| `momentum63` | `-5.32%` | `-3.19%` | `38.85%` | `-0.076` | `-0.050` | `-0.078` | `83.85%` | `0.919` | `36.99%` |
| `momentum126` | `1.18%` | `0.33%` | `39.95%` | `-0.004` | `0.130` | `0.177` | `83.74%` | `1.012` | `37.21%` |

The improvement is real. `momentum126` moves the strategy from negative average return to roughly flat/slightly positive, and profit factor improves from `0.903` to `1.012`.

But that is still a very low bar. A strategy with `0.33%` average CAGR and `39.95%` average drawdown is not investable.

## Range-Level Results

| Range | Best Rank | Best Rank Return | Alphabetical Return | `momentum63` Return | `momentum126` Return |
| --- | --- | ---: | ---: | ---: | ---: |
| 2020-2024 | `momentum63` | `25.57%` | `-14.47%` | `25.57%` | `-9.38%` |
| 2021-2023 | `momentum126` | `14.41%` | `-11.10%` | `-28.70%` | `14.41%` |
| 2022-2024 | `momentum126` | `-17.37%` | `-23.25%` | `-20.99%` | `-17.37%` |
| 2023-2026 | `momentum126` | `17.07%` | `-2.39%` | `2.84%` | `17.07%` |

`momentum126` wins three of the four windows, while `momentum63` has one very strong window and one very bad window.

The `2021-2023` row shows the instability clearly:

- `alphabetical`: `-11.10%`
- `momentum63`: `-28.70%`
- `momentum126`: `14.41%`

So ranked selection matters a lot. The exact ranking horizon also matters.

## Benchmark Comparison

Even after ranking, the strategy still does not compete with passive benchmarks.

Average benchmark CAGRs from the same large-cap universe test:

- Same-universe equal-weight: `19.83%`
- `SPY`: `12.39%`
- `QQQ`: `17.36%`
- `IWM`: `5.47%`
- `DIA`: `8.43%`

Best ranked strategy:

- `momentum126`: `0.33%` average CAGR

Across the four tested windows, `momentum126` only beats `IWM` once on return/CAGR/Sharpe/return-drawdown. It does not beat same-universe buy-and-hold, `SPY`, `QQQ`, or `DIA` in any window on return.

That means ranking is directionally useful, but not nearly enough.

## Drawdown Problem

The drawdown result is not encouraging.

| Entry Rank | Avg Max DD |
| --- | ---: |
| `alphabetical` | `37.36%` |
| `momentum63` | `38.85%` |
| `momentum126` | `39.95%` |

Ranking improves return, but drawdown gets slightly worse. That is a reasonable trade if return improves dramatically, but here the return improvement is too small.

The strategy is still getting hit hard when chosen breakouts fail.

## Trade Diagnostics

Trade-level behavior remains weak:

- `alphabetical` average profit factor: `0.903`
- `momentum63` average profit factor: `0.919`
- `momentum126` average profit factor: `1.012`
- win rates remain around `37-38%`
- average exposure stays around `84%`
- max open positions observed stays around `4-6`, despite `maxOpenPositions=10`

The portfolio is not sitting mostly in cash. It is invested, but it is still concentrated in a small number of names.

That concentration is probably a major remaining problem. A 96-symbol universe is supposed to give the system many chances to diversify across trends, but the current risk sizing often allows only a handful of concurrent positions.

## Symbol Contributors

The ranking modes changed which names dominated the result.

For `momentum63`, top contributors included:

| Symbol | Net PnL | Trades | Wins | Losses |
| --- | ---: | ---: | ---: | ---: |
| `META` | `28512.31` | `13` | `9` | `4` |
| `NVDA` | `25782.38` | `13` | `7` | `6` |
| `AAPL` | `23449.52` | `3` | `3` | `0` |
| `GILD` | `22908.36` | `12` | `4` | `8` |
| `BX` | `20159.77` | `8` | `5` | `3` |

For `momentum126`, top contributors included:

| Symbol | Net PnL | Trades | Wins | Losses |
| --- | ---: | ---: | ---: | ---: |
| `NVDA` | `38610.67` | `24` | `15` | `9` |
| `STX` | `36927.18` | `11` | `8` | `3` |
| `COF` | `34324.41` | `10` | `6` | `4` |
| `GILD` | `23900.79` | `8` | `4` | `4` |
| `BA` | `20879.21` | `10` | `8` | `2` |

The ranking modes do find different winners. That is encouraging.

But they also find different large losers. For `momentum126`, the largest detractors included `PANW`, `PGR`, `DELL`, `BX`, `SCHW`, and `XOM`. The winners are still not broad or consistent enough to offset whipsaw losses.

## Interpretation

This test tells us two things at once.

First, alphabetical ordering was a real flaw. Removing it improves the strategy, and `momentum126` in particular is materially better than the old large-cap baseline.

Second, ranked entries are not enough by themselves. The strategy is still too concentrated, too whipsaw-prone, and far too weak relative to passive benchmarks.

The current state is:

> Ranking creates a signal of improvement, but not a viable edge.

That is worth continuing, but only with discipline.

## Next Rescue Strategy

The next best rescue step is probably not pyramiding.

Pyramiding already looked dangerous after gap-aware fills, and the current large-universe problem is not that winners are too small after entry. The bigger issue is that the portfolio is concentrated in too few names and drawdowns remain large.

The next best step is likely position-sizing/diversification control.

Specifically:

1. Add sweep support for `riskPercent`.
2. Test smaller risk levels such as `0.25`, `0.5`, and `1.0`.
3. Keep `entryRank=momentum126` as the best current rank mode.
4. Observe whether lower per-position risk allows more concurrent positions, lower drawdown, and better risk-adjusted return.
5. If needed, add an explicit `maxPositionPct` cap after that.

This keeps the next test clean:

> Same strategy, same universe, best current rank mode, but less concentrated position sizing.

Only after that should we revisit entry/exit periods. If the portfolio construction is still too concentrated, channel tuning may just optimize noise.

## Current Conclusion

Entry ranking partially redeems the strategy mechanically, but not economically.

`momentum126` is now the preferred entry ranking mode for future large-universe tests. It is better than alphabetical and better than `momentum63` on this evidence.

But the strategy remains far from viable:

- it does not beat passive benchmarks,
- drawdown remains too high,
- average return remains too low,
- and the same-universe buy-and-hold hurdle is still overwhelming.

The strategy family is not dead yet, but the burden of proof has shifted. Future improvements need to deliver large, measurable gains, not merely incremental cosmetic improvements.
