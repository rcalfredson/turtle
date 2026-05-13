# Gap-Aware Channel Sweep - 2026-05-12

Source reports:

- Summary: `reports/portfolio-gap-channel-sweep-2026-05-12.csv`
- Trade audit: `reports/portfolio-gap-channel-sweep-2026-05-12-trades.csv`
- Equity audit: `reports/portfolio-gap-channel-sweep-2026-05-12-equity.csv`

This note reruns the entry/exit channel question after the latest realism changes:

- `gapAwareFills=true`
- `maxUnits=1`
- `slippageBps=0,5,10`
- `maxVolumeParticipationPct=1`
- channel pairs tested: `20/10`, `40/10`, `40/20`, `55/10`, `55/20`

## Executive Summary

The earlier `20/10` channel setting largely survives the realism pass.

Your read is right in the important sense: `20/10` is still the best all-around default after enabling gap-aware fills and disabling pyramiding.

The nuance is that `40/20` occasionally wins raw return in a few slices. But `20/10` is stronger across the full sweep:

- highest average return,
- highest average CAGR,
- lowest average drawdown,
- best return/drawdown,
- best Sharpe,
- best win rate,
- and best return winner count across range/slippage combinations.

So `20/10` should remain the research default for now. `40/20` remains worth keeping in the back pocket as a slower, lower-trade-count variant, but it is not the better default on this evidence.

## Average Results By Channel Pair

| Entry/Exit | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Profit Factor | Avg Win Rate | Avg Trades | Avg Exposure |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `20/10` | `119.96%` | `23.86%` | `16.24%` | `7.441` | `1.277` | `2.228` | `49.73%` | `85.5` | `74.67%` |
| `40/10` | `38.55%` | `8.98%` | `20.27%` | `1.945` | `0.575` | `1.393` | `44.72%` | `85.6` | `66.92%` |
| `40/20` | `100.36%` | `20.40%` | `26.88%` | `3.728` | `1.004` | `2.152` | `41.08%` | `52.2` | `74.32%` |
| `55/10` | `14.72%` | `3.48%` | `20.61%` | `0.744` | `0.284` | `1.157` | `42.31%` | `81.3` | `63.24%` |
| `55/20` | `63.77%` | `12.37%` | `24.82%` | `2.711` | `0.690` | `1.714` | `38.88%` | `50.5` | `69.99%` |

The pattern is clear:

- `20/10` is the strongest all-around pair.
- `40/20` has respectable raw return and profit factor, but worse drawdown and weaker risk-adjusted results.
- `40/10` and `55/10` are weak because they combine slower entry with relatively fast exit.
- `55/20` is better than `55/10`, but still not competitive with `20/10` or `40/20`.

## By Slippage Level

| Entry/Exit | Slippage | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe | Avg Profit Factor |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `20/10` | `0 bps` | `126.94%` | `24.88%` | `15.98%` | `1.325` | `2.302` |
| `20/10` | `5 bps` | `120.09%` | `23.88%` | `16.21%` | `1.278` | `2.229` |
| `20/10` | `10 bps` | `112.85%` | `22.81%` | `16.55%` | `1.228` | `2.153` |
| `40/20` | `0 bps` | `99.64%` | `20.58%` | `26.44%` | `1.014` | `2.172` |
| `40/20` | `5 bps` | `96.28%` | `20.03%` | `26.88%` | `0.990` | `2.126` |
| `40/20` | `10 bps` | `105.16%` | `20.59%` | `27.33%` | `1.008` | `2.158` |
| `55/20` | `0 bps` | `63.98%` | `12.54%` | `24.52%` | `0.698` | `1.728` |
| `55/20` | `5 bps` | `63.94%` | `12.37%` | `24.82%` | `0.690` | `1.716` |
| `55/20` | `10 bps` | `63.39%` | `12.21%` | `25.12%` | `0.681` | `1.698` |
| `40/10` | `0 bps` | `44.15%` | `10.16%` | `19.80%` | `0.637` | `1.453` |
| `40/10` | `5 bps` | `39.35%` | `9.18%` | `20.28%` | `0.586` | `1.405` |
| `40/10` | `10 bps` | `32.17%` | `7.61%` | `20.74%` | `0.501` | `1.321` |
| `55/10` | `0 bps` | `17.38%` | `4.15%` | `20.24%` | `0.323` | `1.187` |
| `55/10` | `5 bps` | `14.47%` | `3.43%` | `20.57%` | `0.281` | `1.153` |
| `55/10` | `10 bps` | `12.31%` | `2.87%` | `21.04%` | `0.248` | `1.131` |

`20/10` remains stable as slippage increases. The `40/20` row has a slightly odd result where `10 bps` beats `0 bps` on average; as in earlier reports, that should be read as path dependence from different fills and position sizing, not as slippage being beneficial.

## Range-Level Winners

Across the `12` range/slippage combinations:

- `20/10` wins raw return in `9` of `12`.
- `40/20` wins raw return in `3` of `12`.
- `20/10` wins best Sharpe in all `12`.
- `20/10` has the lowest drawdown in all `12`.

The three raw-return wins for `40/20` are:

- `2020-2024`, `10 bps`: `191.29%` for `40/20` vs `179.71%` for `20/10`.
- `2022-2024`, `5 bps`: `81.65%` for `40/20` vs `79.93%` for `20/10`.
- `2022-2024`, `10 bps`: `79.17%` for `40/20` vs `75.69%` for `20/10`.

Those are real, but they are narrow raw-return wins. They come with materially worse drawdown. For example, in `2020-2024` at `10 bps`, `40/20` returns `191.29%` with `28.61%` max drawdown, while `20/10` returns `179.71%` with `15.62%` max drawdown.

## Why 20/10 Still Looks Better

Under `maxUnits=1`, the system no longer depends on add-ons. The question becomes:

> Which channel pair gets the base entry/exit cycle right?

`20/10` appears to strike the best balance:

- it enters soon enough to catch trends,
- exits quickly enough to control drawdown,
- trades often enough to rotate capital,
- and does not pay the heavy gap-aware add-on penalty because pyramiding is off.

`40/20` is slower and more selective. It can produce good profit factor and occasional raw-return wins, but it has fewer trades and larger drawdowns. It may be useful as a future variant, but it is not yet the default candidate.

## Current Research Defaults

After this sweep, the current tentative portfolio research defaults should be:

- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `allowShort=false`
- `slippageBps=0,5,10` for sensitivity testing
- `maxVolumeParticipationPct=1`

This is a simpler and more believable system than the earlier pyramiding version:

- no shorts,
- no pyramiding,
- realistic overnight gap handling,
- volume participation checks,
- and modest slippage sensitivity.

## Recommended Next Steps

1. Commit the channel sweep support and this report.
2. Add benchmark comparisons against SPY, QQQ, and equal-weight buy-and-hold for the same universe.
3. Add yearly and monthly return breakdowns for the current tentative default.
4. Consider an account-size sweep later, but volume participation is not currently binding at `$100k`.
5. Revisit broader universe tests only after benchmark comparison, so we know what hurdle the strategy actually needs to clear.

The most useful next step is benchmark comparison. At this point, the strategy looks plausible enough that we need to know whether it is actually adding value versus simple alternatives.
