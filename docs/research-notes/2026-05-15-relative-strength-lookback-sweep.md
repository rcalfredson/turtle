# Relative Strength Lookback Sweep - 2026-05-15

Source reports:

- Strategy summary: `reports/portfolio-relative-strength-lookback-sweep-2026-05-15.csv`
- Strategy trade audit: `reports/portfolio-relative-strength-lookback-sweep-2026-05-15-trades.csv`
- Strategy equity audit: `reports/portfolio-relative-strength-lookback-sweep-2026-05-15-equity.csv`
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
- `maxUnits=1`
- no market regime filter

Relative strength settings tested:

- `relativeStrengthLookback=0`: no relative strength filter
- `relativeStrengthSymbol=SPY`, `relativeStrengthLookback=63`
- `relativeStrengthSymbol=SPY`, `relativeStrengthLookback=126`

## Executive Summary

This is the strongest relative-strength result so far.

The `63`-day relative strength filter is clearly better than both no filter and the `126`-day filter on the average metrics:

- average CAGR: `12.02%`
- average max drawdown: `24.67%`
- average Sharpe: `0.653`
- average profit factor: `1.847`

Compared with no relative-strength filter:

- CAGR improves from `10.14%` to `12.02%`
- max drawdown improves from `29.33%` to `24.67%`
- Sharpe improves from `0.545` to `0.653`
- profit factor improves from `1.662` to `1.847`

That is a meaningful improvement. It also confirms that the relative-strength idea is not just a one-off result from the first `126`-day test.

But your read is still basically right: the strategy remains behind the main passive hurdles.

Average benchmark CAGRs:

- `SPY`: `12.39%`
- `QQQ`: `17.36%`
- same-universe equal-weight: `19.83%`

The `63`-day filter gets very close to `SPY`, and slightly beats `SPY` on average drawdown, but it still does not quite beat `SPY` on CAGR, return/drawdown, or Sharpe.

So the conclusion is:

> The 63-day relative-strength filter materially improves the strategy, but still does not make it benchmark-beating.

## Average Results

| RS Lookback | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Sortino | Avg Profit Factor | Avg Exposure | Avg Entries |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0` | `47.85%` | `10.14%` | `29.33%` | `1.482` | `0.545` | `0.712` | `1.662` | `83.69%` | `160.3` |
| `63` | `55.65%` | `12.02%` | `24.67%` | `2.172` | `0.653` | `0.847` | `1.847` | `83.29%` | `150.8` |
| `126` | `45.77%` | `10.54%` | `25.84%` | `1.723` | `0.633` | `0.804` | `1.774` | `76.94%` | `142.0` |

The `63`-day filter is the best row across the main strategy metrics.

Interesting details:

- `63` has higher exposure than `126`, but almost identical exposure to no filter.
- `63` blocks fewer entries than `126`.
- `63` improves return and drawdown at the same time.
- `126` is more restrictive, but its stricter filtering does not translate into better average returns.

That suggests `126` may be too slow or too selective. It can remove weak breakouts, but it also seems to remove or delay useful leaders.

## Average Deltas Versus No Filter

| RS Lookback | Return Delta | CAGR Delta | DD Delta | Sharpe Delta | PF Delta | Exposure Delta |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `63` | `+7.80%` | `+1.88%` | `-4.66%` | `+0.108` | `+0.185` | `-0.40%` |
| `126` | `-2.08%` | `+0.39%` | `-3.49%` | `+0.088` | `+0.112` | `-6.74%` |

This is the best case for the `63`-day filter.

It does not merely reduce exposure. It improves returns while also reducing drawdown. That is exactly what we want a filter to do.

The `126`-day filter is more defensive. It lowers drawdown and improves Sharpe, but it gives up raw return. That may be useful for a conservative variant, but it is not as attractive as `63`.

## Entry Blocking

| RS Lookback | Avg Blocked Entries | Avg Missing Symbol Momentum |
| ---: | ---: | ---: |
| `0` | `0.0` | `0.0` |
| `63` | `1496.8` | `60.0` |
| `126` | `2747.5` | `579.8` |

The `126`-day filter blocks almost twice as many raw candidates as the `63`-day filter.

That seems to be too much. It improves risk metrics, but it does not improve returns enough.

The `63`-day filter hits a better balance:

- selective enough to improve trade quality,
- not so selective that it removes too much opportunity.

## Range-Level Results

| Range | RS Lookback | Return | CAGR | Max DD | Sharpe | Profit Factor | Entries | Blocked Entries |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2020-2024` | `0` | `43.85%` | `7.54%` | `30.99%` | `0.510` | `1.440` | `213` | `0` |
| `2020-2024` | `63` | `44.45%` | `7.63%` | `26.27%` | `0.522` | `1.471` | `209` | `2151` |
| `2020-2024` | `126` | `62.64%` | `10.22%` | `28.60%` | `0.614` | `1.656` | `196` | `3702` |
| `2021-2023` | `0` | `9.58%` | `3.10%` | `30.18%` | `0.269` | `1.204` | `136` | `0` |
| `2021-2023` | `63` | `19.54%` | `6.14%` | `24.36%` | `0.449` | `1.447` | `122` | `1149` |
| `2021-2023` | `126` | `12.14%` | `3.90%` | `26.71%` | `0.327` | `1.281` | `121` | `2287` |
| `2022-2024` | `0` | `1.05%` | `0.35%` | `23.17%` | `0.100` | `1.020` | `142` | `0` |
| `2022-2024` | `63` | `7.57%` | `2.46%` | `22.25%` | `0.232` | `1.149` | `136` | `1198` |
| `2022-2024` | `126` | `28.79%` | `8.81%` | `17.45%` | `0.599` | `1.692` | `109` | `2099` |
| `2023-2026` | `0` | `136.93%` | `29.58%` | `32.98%` | `1.301` | `2.984` | `150` | `0` |
| `2023-2026` | `63` | `151.04%` | `31.85%` | `25.79%` | `1.408` | `3.320` | `136` | `1489` |
| `2023-2026` | `126` | `79.52%` | `19.21%` | `30.61%` | `0.992` | `2.466` | `142` | `2902` |

The range-level story is:

- `63` improves three of four windows on return.
- `63` improves all four windows on drawdown.
- `63` improves all four windows on Sharpe.
- `126` is best in the difficult `2022-2024` window, but it underperforms `63` in `2021-2023` and `2023-2026`.

That makes `63` the more balanced setting.

## Benchmark Context

Average benchmark results from the large-cap benchmark report:

| Benchmark | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| Same-universe equal-weight | `100.68%` | `19.83%` | `25.61%` | `3.971` | `1.042` |
| `QQQ` | `87.77%` | `17.36%` | `32.34%` | `3.072` | `0.826` |
| `SPY` | `55.30%` | `12.39%` | `25.95%` | `2.272` | `0.764` |
| `DIA` | `34.48%` | `8.43%` | `24.34%` | `1.537` | `0.608` |
| `IWM` | `24.04%` | `5.47%` | `32.52%` | `0.761` | `0.348` |

Best strategy result from this sweep:

| Strategy | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: |
| `55/50`, `maxUnits=1`, `SPY 63 RS` | `55.65%` | `12.02%` | `24.67%` | `2.172` | `0.653` |

This is close to `SPY`, but not better:

- strategy CAGR: `12.02%`
- `SPY` CAGR: `12.39%`
- strategy Sharpe: `0.653`
- `SPY` Sharpe: `0.764`
- strategy return/drawdown: `2.172`
- `SPY` return/drawdown: `2.272`

The one place the strategy beats SPY is average max drawdown:

- strategy max drawdown: `24.67%`
- `SPY` max drawdown: `25.95%`

That is encouraging, but the strategy is still not winning on the main scorecard.

It does beat `DIA` and `IWM` on CAGR and Sharpe, but the realistic hurdle remains `SPY`, `QQQ`, and same-universe buy-and-hold.

## Contributor Notes

Top contributors by variant:

| Variant | Top Contributors |
| --- | --- |
| No filter | `WDC`, `STX`, `META`, `CRWD`, `NVDA`, `AMD`, `MSFT`, `GLW` |
| `SPY 63` | `WDC`, `STX`, `CRWD`, `META`, `GLW`, `UBER`, `DELL`, `GE` |
| `SPY 126` | `DELL`, `STX`, `WDC`, `META`, `CRWD`, `NVDA`, `BKNG`, `GE` |

The `63`-day filter does not simply replace the strategy with a completely different set of names. It preserves several major winners and seems to improve timing or selection around them.

The `126`-day filter shifts more aggressively. It elevates `DELL`, but reduces the contribution from some of the earlier leaders. That helps in `2022-2024`, but appears too restrictive in the broader average.

## Interpretation

The relative-strength filter is now the most promising rescue lever we have tested.

The key reason is that `63`-day relative strength improved both return and risk. Most earlier filters improved one while hurting the other.

Current pattern:

- market regime filter: modestly useful for `maxUnits=1`, harmful to pyramiding,
- 126-day relative strength: useful but somewhat too restrictive,
- 63-day relative strength: best balance so far.

That does not make the strategy market-beating yet, but it does suggest the right direction:

> Better stock selection is helping more than broader market filtering or more pyramiding.

The strategy is becoming less like classic Turtle trading and more like a constrained relative-strength breakout system.

## Current Best Candidate

The current best candidate is:

```text
entryPeriod=55
exitPeriod=50
maxUnits=1
riskPercent=0.25
maxOpenPositions=10
entryRank=momentum126
relativeStrengthSymbol=SPY
relativeStrengthLookback=63
gapAwareFills=true
slippageBps=5
```

Average metrics:

- return: `55.65%`
- CAGR: `12.02%`
- max drawdown: `24.67%`
- return/drawdown: `2.172`
- Sharpe: `0.653`
- profit factor: `1.847`

This is the closest the strategy has come to `SPY` under the more realistic large-universe tests.

## Recommended Next Step

The next step should be deliberately careful, because we are now close enough to SPY that overfitting risk gets louder.

Reasonable next tests:

1. Test `relativeStrengthLookback=21,42,63,84,126` with everything else fixed.
2. Test a combined rank/filter idea:
   - filter by `SPY 63` relative strength,
   - rank by relative strength rather than raw `momentum126`.
3. Test a broader universe, because the current universe still has current-membership and large-cap bias.

The cleanest next test is probably option 1:

```text
relativeStrengthLookback=0,21,42,63,84,126
```

Keep:

- `entryPeriod=55`
- `exitPeriod=50`
- `maxUnits=1`
- `riskPercent=0.25`
- `maxOpenPositions=10`
- `entryRank=momentum126`

If the neighboring lookbacks around `63` also perform well, the result is more credible. If only `63` works, we should be much more suspicious.

## Current Conclusion

The `63`-day relative-strength filter is the best improvement we have found so far.

It gets the strategy close to `SPY`, and it improves drawdown compared with SPY. But it still does not beat `SPY` on average CAGR, Sharpe, or return/drawdown, and it remains far below `QQQ` and same-universe buy-and-hold.

This is not yet a strategy to prefer over a simple broad-market ETF. But it is a real step forward, and it gives us a more focused research path:

> Keep improving stock selection and test whether the relative-strength effect is robust rather than a single lucky lookback.
