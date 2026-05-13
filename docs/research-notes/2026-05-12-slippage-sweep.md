# Portfolio Slippage Sweep - 2026-05-12

Source reports:

- Summary: `reports/portfolio-slippage-sweep-2026-05-12.csv`
- Trade audit: `reports/portfolio-slippage-sweep-2026-05-12-trades.csv`
- Equity audit: `reports/portfolio-slippage-sweep-2026-05-12-equity.csv`

This note summarizes the first execution-friction test for the portfolio backtester. The test keeps the current research defaults:

- `allowShort=false`
- `entryPeriod=20`
- `exitPeriod=10`
- `atrPeriod=20`
- `maxUnits=4`
- `riskPercent=1`
- `maxOpenPositions=10`

The sweep tested `slippageBps=0,5,10,25,50`.

## Executive Summary

Slippage reduces returns exactly as expected, but it does not erase the strategy's performance at mild assumptions.

The main read:

- `5 bps` and `10 bps` are survivable across all four tested windows.
- `25 bps` is a serious stress test and materially weakens the newer 2023-2026 window.
- `50 bps` is severe enough that the 2023-2026 result is barely profitable after drawdown.
- The strategy remains impressive under modest execution costs, but this test also shows that execution assumptions matter a lot.

This is a positive result, but it should still be treated as a backtest-hardening checkpoint, not proof that the system is ready for real capital.

## Is Slippage A Knock On This Strategy?

Not specifically. Slippage is a general trading cost. Any strategy that buys and sells in the real market faces some difference between the theoretical trigger price and the actual fill price.

But slippage does not affect all strategies equally.

It hurts more when a strategy:

- trades frequently,
- has short average holding periods,
- enters and exits large notional size,
- trades less liquid names,
- relies on small edges,
- or uses stop and breakout orders where real fills may occur after price has already moved through the trigger.

It hurts less when a strategy:

- trades infrequently,
- holds large trends for longer periods,
- has large average wins relative to average losses,
- trades liquid securities,
- and has enough edge that a few basis points per side do not dominate the result.

So this test is not asking, "Is slippage bad for this strategy?" Slippage is bad for every trading strategy. The better question is, "Does this strategy still have enough edge after realistic execution drag?"

## Average Results Across Windows

| Slippage | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Profit Factor | Avg Win Rate |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0 bps` | `328.14%` | `46.59%` | `20.22%` | `18.348` | `1.599` | `3.540` | `52.95%` |
| `5 bps` | `308.24%` | `45.02%` | `20.74%` | `16.866` | `1.556` | `3.426` | `52.78%` |
| `10 bps` | `292.38%` | `43.58%` | `21.26%` | `15.660` | `1.516` | `3.321` | `52.78%` |
| `25 bps` | `203.07%` | `33.16%` | `24.14%` | `10.211` | `1.183` | `2.731` | `50.40%` |
| `50 bps` | `145.65%` | `25.74%` | `26.86%` | `6.953` | `0.957` | `2.179` | `46.34%` |

The average result remains strong at `5 bps` and `10 bps`. The larger deterioration begins at `25 bps`, where CAGR drops from `46.59%` to `33.16%` and average max drawdown rises from `20.22%` to `24.14%`.

## Range-Level Results

| Range | Slippage | Return | CAGR | Max DD | Return/DD | Profit Factor | Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `0 bps` | `642.06%` | `49.32%` | `18.56%` | `34.597` | `3.280` | `1.689` |
| 2020-2024 | `10 bps` | `554.82%` | `45.63%` | `19.68%` | `28.186` | `3.070` | `1.594` |
| 2020-2024 | `25 bps` | `377.55%` | `36.72%` | `23.10%` | `16.346` | `2.583` | `1.349` |
| 2020-2024 | `50 bps` | `270.75%` | `29.97%` | `25.91%` | `10.448` | `2.170` | `1.150` |
| 2021-2023 | `0 bps` | `333.70%` | `63.21%` | `14.14%` | `23.593` | `5.641` | `1.891` |
| 2021-2023 | `10 bps` | `309.74%` | `60.14%` | `14.46%` | `21.416` | `5.277` | `1.822` |
| 2021-2023 | `25 bps` | `273.72%` | `55.29%` | `15.19%` | `18.015` | `4.721` | `1.721` |
| 2021-2023 | `50 bps` | `212.30%` | `46.26%` | `15.53%` | `13.671` | `3.550` | `1.509` |
| 2022-2024 | `0 bps` | `190.25%` | `42.68%` | `18.55%` | `10.254` | `2.958` | `1.440` |
| 2022-2024 | `10 bps` | `174.25%` | `40.01%` | `19.68%` | `8.854` | `2.792` | `1.369` |
| 2022-2024 | `25 bps` | `127.56%` | `31.56%` | `23.07%` | `5.530` | `2.357` | `1.147` |
| 2022-2024 | `50 bps` | `88.65%` | `23.58%` | `25.91%` | `3.422` | `1.905` | `0.916` |
| 2023-2026 | `0 bps` | `146.54%` | `31.13%` | `29.62%` | `4.948` | `2.281` | `1.377` |
| 2023-2026 | `10 bps` | `130.69%` | `28.54%` | `31.22%` | `4.185` | `2.145` | `1.280` |
| 2023-2026 | `25 bps` | `33.45%` | `9.06%` | `35.19%` | `0.951` | `1.261` | `0.513` |
| 2023-2026 | `50 bps` | `10.89%` | `3.15%` | `40.10%` | `0.272` | `1.090` | `0.253` |

The 2023-2026 window is the warning sign. It remains attractive at `10 bps`, but collapses at `25 bps` and `50 bps`. That suggests the newer sample may have less excess edge than the earlier windows, or that the higher slippage levels alter the compounding path enough to prevent the system from scaling into its best opportunities.

## Return Retention Versus Zero Slippage

| Range | 5 bps | 10 bps | 25 bps | 50 bps |
| --- | ---: | ---: | ---: | ---: |
| 2020-2024 | `91.9%` | `86.4%` | `58.8%` | `42.2%` |
| 2021-2023 | `96.4%` | `92.8%` | `82.0%` | `63.6%` |
| 2022-2024 | `95.9%` | `91.6%` | `67.0%` | `46.6%` |
| 2023-2026 | `94.4%` | `89.2%` | `22.8%` | `7.4%` |

The mild slippage runs preserve most of the original return. The `25 bps` and `50 bps` runs expose a much sharper break, especially in 2023-2026.

## Trade-Level View

The trade audit confirms that the sweep is not merely subtracting a flat fee at the end. Slippage changes fills, cash, position sizes, add-on feasibility, and sometimes the exact trade path.

| Range | Slippage | Trade Rows | Entries | Adds | Exits | Closed PnL | Avg Closed PnL |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `0 bps` | `222` | `86` | `50` | `86` | `$642,055` | `$7,466` |
| 2020-2024 | `25 bps` | `227` | `88` | `51` | `88` | `$377,546` | `$4,290` |
| 2020-2024 | `50 bps` | `225` | `87` | `51` | `87` | `$270,745` | `$3,112` |
| 2021-2023 | `0 bps` | `124` | `49` | `26` | `49` | `$333,702` | `$6,810` |
| 2021-2023 | `25 bps` | `124` | `49` | `26` | `49` | `$273,724` | `$5,586` |
| 2021-2023 | `50 bps` | `127` | `50` | `27` | `50` | `$212,298` | `$4,246` |
| 2022-2024 | `0 bps` | `130` | `51` | `28` | `51` | `$190,246` | `$3,730` |
| 2022-2024 | `25 bps` | `133` | `52` | `29` | `52` | `$127,564` | `$2,453` |
| 2022-2024 | `50 bps` | `136` | `53` | `30` | `53` | `$88,653` | `$1,673` |
| 2023-2026 | `0 bps` | `153` | `61` | `31` | `61` | `$146,542` | `$2,402` |
| 2023-2026 | `25 bps` | `168` | `67` | `34` | `67` | `$33,454` | `$499` |
| 2023-2026 | `50 bps` | `171` | `68` | `35` | `68` | `$10,892` | `$160` |

The 2023-2026 window shows why slippage matters so much. At zero slippage, average closed PnL is only `$2,402` per exit. At `25 bps`, it falls to `$499`; at `50 bps`, it falls to `$160`. That is not much margin for error.

## Interpretation

The strategy still looks promising under plausible low slippage. A liquid mega-cap and ETF universe should often be much closer to `5-10 bps` than `25-50 bps`, especially for small personal-account orders during normal market conditions.

That said, the current slippage model is still simplified. It assumes:

- buys fill at `triggerPrice * (1 + slippageBps / 10000)`,
- sells fill at `triggerPrice * (1 - slippageBps / 10000)`,
- the trigger price is available as the base reference,
- market impact is constant across symbols and dates,
- and gap-through-trigger behavior is not modeled separately.

The last point matters. If a stock gaps above an entry trigger or below a stop, real execution could be worse than a fixed bps adjustment from the trigger. The current model is a useful first friction test, but not the final execution model.

## Current Conclusion

This slippage test strengthens the research case at low friction and weakens it at high friction.

The constructive read is:

> The portfolio result is not solely an artifact of zero-cost fills.

The cautious read is:

> The strategy's edge is not uniformly deep. Some windows remain robust, while the recent 2023-2026 window becomes fragile under harsher execution assumptions.

For now, `5 bps` and `10 bps` should be treated as the realistic baseline sensitivity checks for this liquid universe. `25 bps` and `50 bps` should remain stress tests.

## Recommended Next Steps

1. Add liquidity and volume participation constraints.
2. Add gap-aware fill logic for entries, stops, and channel exits.
3. Compare results against buy-and-hold benchmarks for SPY, QQQ, and the same equal-weight universe.
4. Broaden the universe beyond current mega-cap winners.
5. Add yearly and monthly return breakdowns to see whether the edge is steady or concentrated.

The best immediate next hardening step is probably liquidity/volume constraints, followed closely by gap-aware fills. Together, those would make the execution model much more realistic than a flat bps assumption alone.
