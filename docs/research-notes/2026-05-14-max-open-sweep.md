# Max Open Positions Sweep - 2026-05-14

Source reports:

- Strategy summary: `reports/portfolio-max-open-sweep-2026-05-14.csv`
- Strategy trade audit: `reports/portfolio-max-open-sweep-2026-05-14-trades.csv`
- Strategy equity audit: `reports/portfolio-max-open-sweep-2026-05-14-equity.csv`
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
- `entryRank=momentum126`
- `riskPercent=0.25`

Max open position levels:

- `10`
- `20`
- `30`

## Executive Summary

Increasing `maxOpenPositions` helps in some windows, but it is not a clean win.

Your read is partly right: broader position capacity can improve the strategy, especially in the `2020-2024` and `2023-2026` windows. The `maxOpenPositions=30` setting has the highest average raw return at `19.74%`.

But the result is mixed:

- `maxOpenPositions=10` has the best average CAGR,
- `10` has the lowest average drawdown,
- `10` has the best return/drawdown,
- `10` has the best average Sharpe,
- `30` has the best average raw return,
- and `20` is mostly dominated.

So the strategy is improving, but not in a simple "more positions is always better" way.

## Average Results By Max Open Positions

| Max Open | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Exposure | Avg Profit Factor | Avg Trades | Avg Observed Open |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `10` | `17.59%` | `4.60%` | `24.77%` | `0.789` | `0.355` | `0.498` | `86.48%` | `1.126` | `493.5` | `10.00` |
| `20` | `14.02%` | `3.54%` | `27.54%` | `0.550` | `0.279` | `0.380` | `88.04%` | `1.088` | `522.8` | `15.50` |
| `30` | `19.74%` | `4.49%` | `27.31%` | `0.743` | `0.331` | `0.453` | `88.06%` | `1.112` | `517.3` | `16.25` |

The key nuance is that `30` does not actually produce a 30-position portfolio. Average max observed open positions is only `16.25`. That suggests the strategy is no longer primarily blocked by the position cap after increasing it beyond `20`.

## Range-Level Results

| Range | Best Return Setting | `10` Return | `20` Return | `30` Return | `10` DD | `20` DD | `30` DD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `30` | `18.78%` | `14.60%` | `37.47%` | `28.88%` | `31.23%` | `30.29%` |
| 2021-2023 | `10` | `12.73%` | `6.96%` | `6.96%` | `27.97%` | `27.86%` | `27.86%` |
| 2022-2024 | `10` | `5.62%` | `-1.90%` | `-1.90%` | `23.94%` | `27.62%` | `27.62%` |
| 2023-2026 | `20/30` | `33.21%` | `36.41%` | `36.41%` | `18.30%` | `23.46%` | `23.46%` |

`30` gives the strongest single result: `37.47%` return in `2020-2024`.

But `10` is better in the two middle windows, including the difficult `2022-2024` window. That matters because the rescue strategy should improve robustness, not merely make the best bull-market slice stronger.

## Benchmark Context

The strategy remains far below the key passive benchmarks.

Average benchmark CAGRs:

- Same-universe equal-weight: `19.83%`
- `SPY`: `12.39%`
- `QQQ`: `17.36%`
- `IWM`: `5.47%`
- `DIA`: `8.43%`

Best strategy settings from this sweep:

- highest average return: `maxOpenPositions=30`, `19.74%` average return, `4.49%` CAGR
- highest average CAGR: `maxOpenPositions=10`, `4.60%` CAGR

So this sweep does not close the benchmark gap. Even the best variant remains far behind `SPY`, `QQQ`, and same-universe buy-and-hold.

It does, however, confirm that portfolio construction is part of the path forward.

## What This Teaches

The diversification thesis is partly confirmed.

Going from the old concentrated baseline to `riskPercent=0.25` was a major improvement. Increasing `maxOpenPositions` adds useful information:

- `10` was an active cap in every risk-sweep window,
- `20` and `30` allow more breadth,
- the strategy naturally tops out around `13-23` observed positions in these tests,
- more positions can increase raw return in stronger windows,
- but more positions can also add weaker breakouts in choppier windows.

That means the problem is no longer just "allow more names." The next layer is:

> Which additional names are good enough to add?

The ranking rule is doing some useful work, but it may not be selective enough. A simple top-momentum ranking might still admit too many stale or overextended breakouts.

## Current Best Interpretation

The best conservative setting remains:

- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`

The best return-seeking setting from this sweep is:

- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=30`

But the difference is not decisive:

- `30` improves average raw return by about `2.15` percentage points over `10`,
- `10` has lower drawdown by about `2.54` percentage points,
- `10` has better Sharpe,
- and `10` is stronger in the more difficult middle windows.

So for research defaults, `10` should probably remain the baseline until another signal/ranking improvement justifies more breadth.

## Recommended Next Step

The next step should probably be channel tuning, but done narrowly.

We now have a more credible large-universe baseline:

- `entryRank=momentum126`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `maxUnits=1`
- `gapAwareFills=true`
- `slippageBps=5`

The next clean question is:

> Does the `20/10` channel remain appropriate after ranking and diversification improvements?

A focused channel sweep makes sense now:

- keep `entryRank=momentum126`,
- keep `riskPercent=0.25`,
- keep `maxOpenPositions=10`,
- keep `maxUnits=1`,
- test `20/10`, `40/20`, `55/20`, and maybe `100/50`,
- avoid adding pyramiding back yet.

Why not `maxUnits` next? Because gap-aware fills previously made pyramiding look dangerous, and the current issue is still whipsaw/selection quality. A slower channel is more likely to address that than add-ons.

## Current Conclusion

Increasing max open positions adds some return potential, but it does not clearly improve the strategy's risk-adjusted profile.

The rescue path so far is:

1. Replace alphabetical entries with `momentum126`.
2. Lower risk to `0.25%`.
3. Test more position breadth.

Step 3 is informative, but not transformative. The strategy remains much weaker than passive benchmarks.

The next real test is whether slower entry/exit channels can reduce whipsaw enough to make the diversified, momentum-ranked version more competitive.
