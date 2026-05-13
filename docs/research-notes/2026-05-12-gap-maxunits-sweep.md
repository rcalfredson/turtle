# Gap-Aware Max Units Sweep - 2026-05-12

Source reports:

- Summary: `reports/portfolio-gap-maxunits-sweep-2026-05-12.csv`
- Trade audit: `reports/portfolio-gap-maxunits-sweep-2026-05-12-trades.csv`
- Equity audit: `reports/portfolio-gap-maxunits-sweep-2026-05-12-equity.csv`

This note reruns the max-units question after enabling the more realistic fill assumptions:

- `gapAwareFills=true`
- `slippageBps=0,5,10`
- `maxVolumeParticipationPct=1`
- `maxUnits=1,2,3,4`
- current channel defaults: `entryPeriod=20`, `exitPeriod=10`, `atrPeriod=20`

## Executive Summary

Your read is right: under gap-aware fills, the best results now come from not pyramiding.

The earlier single-symbol and trigger-fill portfolio work favored `maxUnits=4`. After gap-aware fills, `maxUnits=1` dominates this sweep:

- highest average return,
- highest average CAGR,
- lowest average drawdown,
- best return/drawdown,
- best Sharpe,
- best profit factor.

The practical interpretation is:

> Pyramiding looked powerful when add-ons filled at clean trigger prices. Once add-ons can gap above their trigger levels, the extra units often reduce the quality of the trade instead of improving it.

This is a major shift in the research defaults. For future gap-aware portfolio testing, `maxUnits=1` should be treated as the new baseline unless later channel-period sweeps overturn it.

## Average Results By Max Units

| Max Units | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Profit Factor | Avg Win Rate | Avg Trades | Avg Added Units |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `119.96%` | `23.86%` | `16.24%` | `7.441` | `1.277` | `2.228` | `49.73%` | `85.5` | `0.0` |
| `2` | `71.37%` | `15.10%` | `29.09%` | `2.725` | `0.792` | `1.623` | `43.57%` | `70.1` | `27.4` |
| `3` | `72.03%` | `15.58%` | `29.21%` | `2.715` | `0.800` | `1.665` | `46.16%` | `68.8` | `29.9` |
| `4` | `72.03%` | `15.58%` | `29.21%` | `2.715` | `0.800` | `1.665` | `46.16%` | `68.8` | `29.9` |

The `maxUnits=3` and `maxUnits=4` rows are identical. That means this portfolio setup did not actually reach a fourth unit in the tested runs. In practice, the comparison is really `1` versus `2` versus `3+`.

## By Slippage Level

| Max Units | Slippage | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe | Avg Profit Factor |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `0 bps` | `126.94%` | `24.88%` | `15.98%` | `1.325` | `2.302` |
| `1` | `5 bps` | `120.09%` | `23.88%` | `16.21%` | `1.278` | `2.229` |
| `1` | `10 bps` | `112.85%` | `22.81%` | `16.55%` | `1.228` | `2.153` |
| `2` | `0 bps` | `76.08%` | `16.04%` | `28.51%` | `0.835` | `1.673` |
| `2` | `5 bps` | `71.83%` | `15.26%` | `29.07%` | `0.800` | `1.627` |
| `2` | `10 bps` | `66.21%` | `13.98%` | `29.69%` | `0.741` | `1.570` |
| `3` | `0 bps` | `74.09%` | `15.86%` | `28.88%` | `0.816` | `1.681` |
| `3` | `5 bps` | `76.62%` | `16.28%` | `29.06%` | `0.829` | `1.698` |
| `3` | `10 bps` | `65.39%` | `14.59%` | `29.69%` | `0.755` | `1.615` |
| `4` | `0 bps` | `74.09%` | `15.86%` | `28.88%` | `0.816` | `1.681` |
| `4` | `5 bps` | `76.62%` | `16.28%` | `29.06%` | `0.829` | `1.698` |
| `4` | `10 bps` | `65.39%` | `14.59%` | `29.69%` | `0.755` | `1.615` |

The ranking is stable. `maxUnits=1` wins at every slippage level.

## Range-Level Winners

Looking at each range and slippage pair:

- `maxUnits=1` has the best return in `10` of `12` range/slippage combinations.
- `maxUnits=1` has the lowest drawdown in all `12` combinations.
- The only return exceptions are:
  - `2021-2023`, `5 bps`, where `maxUnits=3/4` wins: `85.36%` vs `84.22%`.
  - `2021-2023`, `10 bps`, where `maxUnits=3/4` wins: `80.17%` vs `80.10%`.

Those exceptions are tiny. They do not offset the broader advantage of `maxUnits=1`.

## Why Pyramiding Got Worse

The gap-aware fill report already pointed at add-ons as the main source of pain. This sweep confirms it.

Across the full max-units sweep:

| Max Units | Slippage | Exit Count | Avg Units At Exit | Max Units Observed | Base PnL | Added Unit PnL | Total PnL | Win Rate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `0 bps` | `342` | `1.00` | `1` | `$507,737` | `$0` | `$507,737` | `49.7%` |
| `1` | `5 bps` | `342` | `1.00` | `1` | `$480,362` | `$0` | `$480,362` | `49.7%` |
| `1` | `10 bps` | `342` | `1.00` | `1` | `$451,396` | `$0` | `$451,396` | `49.7%` |
| `2` | `0 bps` | `279` | `1.39` | `2` | `$278,649` | `$25,669` | `$304,318` | `44.1%` |
| `2` | `5 bps` | `281` | `1.39` | `2` | `$266,156` | `$21,139` | `$287,294` | `44.1%` |
| `2` | `10 bps` | `281` | `1.39` | `2` | `$253,545` | `$11,289` | `$264,834` | `43.4%` |
| `3/4` | `0 bps` | `274` | `1.44` | `3` | `$280,796` | `$15,565` | `$296,361` | `46.7%` |
| `3/4` | `5 bps` | `274` | `1.43` | `3` | `$280,515` | `$25,964` | `$306,479` | `47.1%` |
| `3/4` | `10 bps` | `278` | `1.43` | `3` | `$244,497` | `$17,084` | `$261,581` | `45.3%` |

Added units are still sometimes profitable in aggregate. The problem is that they do not compensate for what is lost elsewhere:

- fewer completed trades,
- lower win rate,
- worse drawdown,
- lower base-unit PnL,
- and worse risk-adjusted returns.

With `maxUnits=1`, capital is not tied up adding to existing positions. The system can rotate through more base entries and avoids paying up for gap-filled add-ons.

## Gap-Filled Add-Ons

Add-ons are directly exposed to the gap-aware fill rule:

| Max Units | Slippage | Add Count | Gap-Filled Adds | Avg Gap On Gap-Filled Adds | Worst Gap |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `2` | `0 bps` | `110` | `58` | `6.10%` | `27.47%` |
| `2` | `5 bps` | `109` | `58` | `5.78%` | `27.40%` |
| `2` | `10 bps` | `110` | `59` | `6.16%` | `27.35%` |
| `3/4` | `0 bps` | `121` | `56` | `6.33%` | `24.70%` |
| `3/4` | `5 bps` | `118` | `56` | `5.99%` | `24.64%` |
| `3/4` | `10 bps` | `120` | `57` | `5.88%` | `24.57%` |

These are large enough to change the behavior of the system. A half-N add-on rule assumes orderly fills near the add trigger. In this dataset, many add-ons are effectively chasing gaps.

## Current Interpretation

The old conclusion was:

> More max units looked broadly beneficial.

The new gap-aware conclusion is:

> More max units are not beneficial under the current portfolio setup. The no-pyramid version is cleaner, more stable, and materially stronger.

This is one of the most important research pivots so far. It means `maxUnits=4` should no longer be treated as a research default once gap-aware fills are enabled.

The new tentative defaults should be:

- `gapAwareFills=true`
- `maxUnits=1`
- `allowShort=false`
- `entryPeriod=20`
- `exitPeriod=10`
- `slippageBps` still swept at `0,5,10`
- `maxVolumeParticipationPct=1`

That said, the channel periods were tuned before gap-aware fills. So `20/10` should now be viewed as provisional.

## Recommended Next Steps

1. Use `maxUnits=1` as the next portfolio research baseline.
2. Rerun the entry/exit period sweep under `gapAwareFills=true` and `maxUnits=1`.
3. Include at least `slippageBps=0,5,10` in that channel sweep.
4. Keep `maxUnits=2` as a possible future variant, but only if later channel settings make add-ons more attractive.
5. Eventually consider adding an add-on spacing parameter, because `0.5N` appears fragile under gap-aware fills.

The immediate next experiment should be a gap-aware channel sweep with pyramiding disabled.
