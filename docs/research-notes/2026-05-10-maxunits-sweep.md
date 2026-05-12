# Max Units Sweep Review - 2026-05-10

Source report:

- `reports/matrix-long-only-maxunits-sweep-2026-05-10.csv`

This note reviews the first long-only pyramiding sweep. The matrix tested `maxUnits=1,2,3,4` across the same 18 symbols and 4 date ranges used in the previous reports.

## Executive Summary

The simple read is mostly right: increasing `maxUnits` had a strong positive effect on total return and total PnL. The best current default remains `maxUnits=4`.

The nuance is that the benefit is not free. More units increased drawdown almost every time, and profit factor declined slightly as position size expanded. This is classic pyramiding behavior: it turns strong trends into large winners, but it also adds risk and makes results more dependent on large outlier trades.

## Aggregate Results

| Max Units | Mean Return | Median Return | Mean Max DD | Median Max DD | Worst Max DD |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `20.86%` | `17.64%` | `9.00%` | `7.96%` | `17.67%` |
| `2` | `42.68%` | `35.20%` | `15.46%` | `13.78%` | `31.54%` |
| `3` | `65.13%` | `45.94%` | `20.96%` | `18.73%` | `40.04%` |
| `4` | `87.07%` | `49.44%` | `24.64%` | `22.31%` | `44.69%` |

Returns improved materially with each additional allowed unit. Median return rose from `17.64%` at one unit to `49.44%` at four units.

Drawdown also rose with each additional unit. Median drawdown increased from `7.96%` at one unit to `22.31%` at four units. This is still much better than the earlier long/short baseline, but it matters for sizing and portfolio design.

## Risk-Adjusted Metrics

| Max Units | Mean Return/DD | Median Return/DD | Mean Profit Factor | Median Profit Factor |
| ---: | ---: | ---: | ---: | ---: |
| `1` | `2.792` | `2.468` | `2.395` | `2.204` |
| `2` | `3.240` | `2.550` | `2.288` | `2.107` |
| `3` | `3.526` | `2.295` | `2.239` | `2.100` |
| `4` | `3.968` | `2.029` | `2.184` | `1.976` |

Mean return/drawdown improved as more units were allowed, but median return/drawdown peaked at `maxUnits=2` and then declined.

Profit factor was highest at `maxUnits=1` and gradually declined as more units were added. This suggests that pyramiding improves absolute return more than trade-level efficiency. In other words, the system gets paid for pressing winners, but added exposure also brings more losing dollars.

## Run Quality Counts

| Max Units | Positive Runs | Return/DD > 1 | Return/DD > 2 | Profit Factor > 1.5 | Drawdown > 30% | Drawdown > 40% |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `67 / 72` | `53 / 72` | `38 / 72` | `56 / 72` | `0 / 72` | `0 / 72` |
| `2` | `67 / 72` | `53 / 72` | `40 / 72` | `54 / 72` | `2 / 72` | `0 / 72` |
| `3` | `67 / 72` | `51 / 72` | `37 / 72` | `50 / 72` | `7 / 72` | `1 / 72` |
| `4` | `67 / 72` | `48 / 72` | `36 / 72` | `47 / 72` | `16 / 72` | `3 / 72` |

The number of profitable runs stayed flat at `67 / 72` for every setting. Additional units mostly changed the payoff size, not the broad win/loss classification.

The conservative case for `maxUnits=1` is strong: it had low drawdown, high profit factor, and still produced positive results in most runs. The aggressive case for `maxUnits=4` is also strong: it produced much higher returns and total PnL, while keeping worst drawdown below `45%` in this test.

## Pyramiding PnL

| Max Units | Total PnL | Base-Unit PnL | Added-Unit PnL | Positive Added-Unit Runs | Negative Added-Unit Runs |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `1` | `+$1,502,043` | `+$1,502,043` | `$0` | `0 / 72` | `0 / 72` |
| `2` | `+$3,073,226` | `+$1,604,746` | `+$1,468,480` | `67 / 72` | `5 / 72` |
| `3` | `+$4,689,591` | `+$1,737,053` | `+$2,952,538` | `66 / 72` | `6 / 72` |
| `4` | `+$6,268,706` | `+$1,874,986` | `+$4,393,721` | `63 / 72` | `9 / 72` |

This is the clearest evidence that pyramiding is earning its keep in the long-only configuration. Added-unit PnL grows sharply as more units are allowed, and added units are positive in most runs.

Base-unit PnL also rises as `maxUnits` increases. This is probably because bigger winning trades increase realized equity, which then affects future position sizing.

## Pairwise Changes

| Change | Return Improved | Return Worsened | Drawdown Lower | Drawdown Higher | Return/DD Improved | Profit Factor Improved |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `1 -> 2` | `61 / 72` | `11 / 72` | `0 / 72` | `72 / 72` | `41 / 72` | `28 / 72` |
| `2 -> 3` | `59 / 72` | `13 / 72` | `1 / 72` | `71 / 72` | `41 / 72` | `35 / 72` |
| `3 -> 4` | `53 / 72` | `19 / 72` | `0 / 72` | `72 / 72` | `46 / 72` | `36 / 72` |
| `1 -> 4` | `60 / 72` | `12 / 72` | `0 / 72` | `72 / 72` | `41 / 72` | `26 / 72` |

The risk tradeoff is very explicit. Going from `1` to `4` units improved return in `60 / 72` runs, but increased drawdown in every run.

Best setting by metric across each symbol/range group:

| Metric | `maxUnits=1` | `maxUnits=2` | `maxUnits=3` | `maxUnits=4` |
| --- | ---: | ---: | ---: | ---: |
| Best total return | `7` | `4` | `14` | `47` |
| Best return/drawdown | `20` | `12` | `7` | `33` |
| Best profit factor | `34` | `10` | `11` | `17` |
| Lowest max drawdown | `72` | `0` | `0` | `0` |

`maxUnits=4` wins most often on return and return/drawdown. `maxUnits=1` wins most often on profit factor and always wins on drawdown.

## Biggest Improvements From 1 Unit to 4 Units

| Symbol / Range | Return at 1 Unit | Return at 4 Units | Delta | DD at 1 Unit | DD at 4 Units |
| --- | ---: | ---: | ---: | ---: | ---: |
| NVDA 2020-2024 | `98.38%` | `703.89%` | `+605.51` | `10.42%` | `30.65%` |
| AAPL 2020-2024 | `67.33%` | `475.08%` | `+407.75` | `6.52%` | `20.07%` |
| LLY 2020-2024 | `46.39%` | `321.10%` | `+274.71` | `8.52%` | `22.35%` |
| CAT 2023-2026 | `59.74%` | `315.03%` | `+255.29` | `5.39%` | `20.71%` |
| COST 2020-2024 | `35.57%` | `234.91%` | `+199.34` | `10.22%` | `20.28%` |
| NVDA 2022-2024 | `51.97%` | `241.50%` | `+189.53` | `6.91%` | `19.44%` |

These are exactly the kinds of cases pyramiding is meant to exploit: strong trends where each additional unit participates in a large move.

## Biggest Worsening From 1 Unit to 4 Units

| Symbol / Range | Return at 1 Unit | Return at 4 Units | Delta | DD at 1 Unit | DD at 4 Units |
| --- | ---: | ---: | ---: | ---: | ---: |
| XOM 2022-2024 | `-10.14%` | `-27.91%` | `-17.77` | `16.53%` | `40.59%` |
| IWM 2020-2024 | `14.74%` | `3.89%` | `-10.85` | `9.24%` | `29.45%` |
| UNH 2020-2024 | `4.37%` | `-5.80%` | `-10.17` | `10.25%` | `27.36%` |
| GOOGL 2022-2024 | `-6.82%` | `-15.48%` | `-8.66` | `13.01%` | `28.00%` |
| DIA 2023-2026 | `6.40%` | `-0.67%` | `-7.07` | `6.15%` | `23.70%` |
| UNH 2022-2024 | `-1.59%` | `-8.00%` | `-6.41` | `10.25%` | `27.30%` |

The failure mode is also clear: when a symbol/regime is choppy or hostile, added units scale up the damage.

## Outlier Dependence

| Max Units | Largest Winner > 100% of Net Profit | Largest Winner > 50% of Net Profit |
| ---: | ---: | ---: |
| `1` | `13 / 72` | `30 / 72` |
| `2` | `16 / 72` | `37 / 72` |
| `3` | `18 / 72` | `42 / 72` |
| `4` | `21 / 72` | `46 / 72` |

Outlier dependence increases with more units. This is expected: pyramiding deliberately concentrates more exposure into large winners. It is not automatically bad, but it strengthens the case for portfolio-level testing. A single-symbol system can become too dependent on one large event.

## Interpretation

The sweep supports keeping `maxUnits=4` as the working default for the long-only strategy. It produced the highest mean return, highest median return, highest total PnL, and won most often by return/drawdown.

However, `maxUnits=4` is not unqualified in the risk sense. It increases drawdown, lowers profit factor, and increases dependence on large winning trades. The right conclusion is:

`maxUnits=4` is the best growth-seeking setting so far, while `maxUnits=1` is the low-drawdown baseline.

This also means that portfolio design matters. A diversified portfolio may be able to absorb the higher drawdowns of `maxUnits=4` while preserving the upside from strong trends. A single-symbol implementation cannot be judged the same way.

## Recommended Next Steps

1. Commit the `maxUnits` sweep support in `scripts/runMatrix.js`.
2. Keep `allowShort=false` and `maxUnits=4` as the current research default.
3. Add sweep support for `entryPeriod` and `exitPeriod`.
4. Run a modest channel sweep, not a huge grid at first:
   - `entryPeriod=20,40,55`
   - `exitPeriod=10,20,30`
   - `allowShort=false`
   - `maxUnits=4`
5. Before expanding parameter tuning too far, begin designing the portfolio backtester. The current single-symbol matrix still does not test shared capital, simultaneous positions, or portfolio drawdown.

## Bottom Line

Pyramiding is not just helping; it is central to the long-only strategy's strongest results. More max units generally improved returns and total PnL, with `maxUnits=4` looking like the best current default.

The tradeoff is higher drawdown and more reliance on large trends. That is acceptable for trend-following research, but it makes portfolio-level validation the next major hurdle.
