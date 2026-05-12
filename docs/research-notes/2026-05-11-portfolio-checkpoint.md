# Portfolio Backtest Checkpoint - 2026-05-11

Source reports:

- Initial portfolio run: `reports/portfolio-default-2026-05-11.csv`
- Prior-equity sizing run: `reports/portfolio-default-prior-equity-2026-05-11.csv`
- Audit files:
  - `reports/portfolio-default-prior-equity-2026-05-11-trades.csv`
  - `reports/portfolio-default-prior-equity-2026-05-11-equity.csv`

This note summarizes the first portfolio-level backtest phase. The portfolio runner uses one shared cash account across the current 18-symbol universe, with the current research defaults:

- `allowShort=false`
- `entryPeriod=20`
- `exitPeriod=10`
- `maxUnits=4`
- `riskPercent=1`
- `maxOpenPositions=10`

## Executive Summary

The portfolio results remain exceptional even after removing a subtle same-day sizing optimism. That is encouraging, but it is not enough to conclude that the strategy is ready for real money.

The correct interpretation is:

> The strategy has survived the first portfolio-accounting sanity check and deserves more serious hardening.

It is not yet:

> A proven system that can be expected to generate similar future returns.

## Prior-Equity Sizing Adjustment

The first portfolio engine sized new entries and add-ons using portfolio equity that could include same-day closing prices for already-open positions. That was slightly optimistic because a daily-bar backtest does not know the closing value at the time an intraday breakout trigger occurs.

The engine now sizes entries/add-ons from the prior known marked equity. Then it marks the account at the current close after fills.

This is closer to a real daily-bar process:

1. Start the day with known cash and prior-close marked equity.
2. Use that known equity for position sizing.
3. Process stops, exits, add-ons, and new entries.
4. Mark the portfolio at the day's close.
5. Use that closing equity for the next trading day.

## Impact Of The Fix

| Range | Initial Return | Prior-Equity Return | Delta | Initial DD | Prior-Equity DD | Initial CAGR | Prior-Equity CAGR |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `715.90%` | `642.06%` | `-73.84 pts` | `18.48%` | `18.56%` | `52.18%` | `49.32%` |
| 2021-2023 | `348.50%` | `333.70%` | `-14.80 pts` | `10.80%` | `14.14%` | `65.05%` | `63.21%` |
| 2022-2024 | `226.66%` | `190.25%` | `-36.41 pts` | `18.48%` | `18.55%` | `48.42%` | `42.68%` |
| 2023-2026 | `171.51%` | `146.54%` | `-24.97 pts` | `29.67%` | `29.62%` | `34.99%` | `31.13%` |

Aggregate averages:

| Metric | Initial | Prior-Equity | Delta |
| --- | ---: | ---: | ---: |
| Average return | `365.64%` | `328.14%` | `-37.51 pts` |
| Average max drawdown | `19.36%` | `20.22%` | `+0.86 pts` |
| Average CAGR | `50.16%` | `46.59%` | `-3.57 pts` |
| Average Sharpe | `1.71` | `1.60` | `-0.12` |
| Average profit factor | `3.70` | `3.54` | `-0.16` |
| Average exposure | `75.43%` | `75.13%` | `-0.30 pts` |

The change reduced returns, as expected, but it did not explain away the strong performance.

## Current Portfolio Results

The prior-equity sizing run produced:

| Range | Final Equity | Return | Max DD | Return/DD | CAGR | Sharpe | Profit Factor | Avg Exposure |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `$742,055` | `642.06%` | `18.56%` | `34.597` | `49.32%` | `1.689` | `3.280` | `75.53%` |
| 2021-2023 | `$433,702` | `333.70%` | `14.14%` | `23.593` | `63.21%` | `1.891` | `5.641` | `75.64%` |
| 2022-2024 | `$290,246` | `190.25%` | `18.55%` | `10.254` | `42.68%` | `1.440` | `2.958` | `71.99%` |
| 2023-2026 | `$246,542` | `146.54%` | `29.62%` | `4.948` | `31.13%` | `1.377` | `2.281` | `77.35%` |

These numbers are strong enough to justify deeper work. They are also strong enough to demand skepticism.

## Why The Results May Be Plausible

The portfolio is not trading random assets. The test universe contains several very strong long-trend names during this period, including AAPL, NVDA, META, LLY, COST, and CAT.

The system also compounds winners through pyramiding. Earlier research showed that:

- long-only strongly outperformed long/short,
- `maxUnits=4` drove much of the upside,
- added-unit PnL was central to the best results.

So the portfolio result is directionally consistent with the single-symbol research.

## Why We Should Not Trust It Yet

The major unresolved concerns are:

1. Survivorship bias: the current universe contains present-day liquid winners and does not account for historical index membership, delistings, mergers, or failed companies.
2. Universe selection bias: even if not intentionally cherry-picked, mega-cap winners dominate the recent sample.
3. No transaction costs or slippage.
4. Daily OHLC sequencing remains approximate.
5. Fills assume execution at trigger prices.
6. No liquidity checks or volume participation limits.
7. No tax modeling, though a Roth account could reduce tax drag if distributions are qualified.
8. The test windows overlap heavily and cover a strong recent period for mega-cap growth stocks.
9. Risk is still concentrated in catching large trends.

In other words, the result is promising, but it remains a backtest.

## Roth Account Note

A Roth IRA can be attractive for a high-turnover or high-growth strategy because qualified Roth IRA distributions are tax-free under IRS rules. The tax wrapper does not make the strategy safer or more predictive; it only changes tax treatment if the account and withdrawals meet the Roth requirements.

This matters because the strategy's apparent compounding is a large part of the appeal. Avoiding taxable drag could be valuable, but it does not remove market risk, model risk, execution risk, or the possibility that the backtest is overstated.

## Recommended Hardening Steps

Before considering real money, the next work should try to damage the result:

1. Add transaction cost and slippage assumptions.
2. Add a volume/liquidity constraint.
3. Test a broader and less favorable universe.
4. Test random or sector-balanced universes.
5. Add benchmark comparisons against SPY, QQQ, and equal-weight buy-and-hold.
6. Add walk-forward or non-overlapping train/test windows.
7. Stress test `riskPercent`, especially `0.25`, `0.5`, and `1.0`.
8. Inspect the largest winning trades and their contribution to total PnL.
9. Add monthly/yearly returns and worst rolling drawdown windows.
10. Eventually run a paper-trading phase before any live capital.

## Current Interpretation

The system has moved from "interesting single-symbol strategy" to "portfolio strategy candidate worth hardening."

It has not moved to "reasonable confidence for live trading." That threshold should require:

- realistic costs,
- broader universe tests,
- out-of-sample or walk-forward validation,
- benchmark comparison,
- and manual audit of the largest drivers.

## Bottom Line

The prior-equity sizing fix reduced performance but left the portfolio results exceptional. That is good news for the research path.

The next phase should be adversarial testing. If the strategy still looks strong after costs, broader universe tests, benchmark comparisons, and out-of-sample validation, then confidence can rise meaningfully.
