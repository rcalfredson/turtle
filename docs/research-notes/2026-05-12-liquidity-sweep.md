# Portfolio Liquidity Sweep - 2026-05-12

Source reports:

- Initial summary: `reports/portfolio-liquidity-sweep-2026-05-12.csv`
- Initial trade audit: `reports/portfolio-liquidity-sweep-2026-05-12-trades.csv`
- Initial equity audit: `reports/portfolio-liquidity-sweep-2026-05-12-equity.csv`

This note summarizes the first volume participation test for the portfolio backtester. The sweep used:

- `slippageBps=0,5,10`
- `maxVolumeParticipationPct=0.1,0.5,1`
- current research defaults: `allowShort=false`, `entryPeriod=20`, `exitPeriod=10`, `atrPeriod=20`, `maxUnits=4`, `riskPercent=1`, `maxOpenPositions=10`

## Executive Summary

The current portfolio trades are not meaningfully liquidity constrained in this mega-cap and ETF universe at the tested account size.

After tightening the diagnostic counter during review, a corrected rerun showed:

- `0` volume-constrained entries,
- `0` volume-constrained add-ons,
- `0` volume-constrained exits,
- `0` skipped trades for liquidity,
- no return difference between `0.1%`, `0.5%`, and `1%` max daily volume participation.

That means the liquidity participation constraint is now in place, but this particular universe is liquid enough that the tested thresholds do not bind.

## Audit Note

The initial summary report showed a few `volumeConstrainedEntries` at `0.1%`. The trade log, however, showed no executed trades with `volumeConstrained=true`.

That exposed a diagnostic issue: the counter was being incremented for some candidate entry signals before a later cash-availability check. Those candidates were not actual executed trades. The simulator was adjusted so entry/add volume-constrained counts are only incremented after an order passes the cash check and actually executes.

The return, drawdown, CAGR, Sharpe, and profit-factor results were unaffected. The corrected interpretation is that no actual trades were constrained.

## Results By Volume Cap

| Max Volume Participation | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe | Avg Profit Factor | Entry Flags | Add Flags | Exit Flags | Skipped |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `0.1%` | `309.58%` | `45.06%` | `20.74%` | `1.557` | `3.429` | `0` | `0` | `0` | `0` |
| `0.5%` | `309.58%` | `45.06%` | `20.74%` | `1.557` | `3.429` | `0` | `0` | `0` | `0` |
| `1.0%` | `309.58%` | `45.06%` | `20.74%` | `1.557` | `3.429` | `0` | `0` | `0` | `0` |

All three volume caps produced the same average results because none of the executed trades exceeded even the strictest `0.1%` participation cap.

## Results By Slippage

| Slippage | Avg Return | Avg CAGR | Avg Max DD | Avg Sharpe | Avg Profit Factor |
| ---: | ---: | ---: | ---: | ---: | ---: |
| `0 bps` | `328.14%` | `46.59%` | `20.22%` | `1.599` | `3.540` |
| `5 bps` | `308.24%` | `45.02%` | `20.74%` | `1.556` | `3.425` |
| `10 bps` | `292.38%` | `43.58%` | `21.26%` | `1.516` | `3.321` |

These match the earlier slippage findings. In this test, slippage is the active constraint; volume participation is not.

## Highest Observed Participation

The largest observed trade participation rates were:

| Type | Max Participation | Example |
| --- | ---: | --- |
| Entry | `0.04%` | XLE entry on `2024-03-11`: `10,284` shares vs `24,983,800` volume |
| Add | `0.04%` | CAT add on `2023-08-11`: `771` shares vs `1,874,100` volume |
| Exit | `0.06%` | CAT exit on `2023-08-16`: `1,572` shares vs `2,831,300` volume |

The strictest tested cap was `0.1%`, so even the largest observed trade was still below the limit.

## Interpretation

This is a good result, but it has a narrow meaning.

It says:

> At `$100,000` starting capital, with the current 18-symbol mega-cap and ETF universe, the strategy's tested trades are small relative to daily volume.

It does not say:

> Liquidity will never matter.

Liquidity could matter if:

- starting capital is much larger,
- compounding grows the account substantially,
- the universe expands into smaller or less liquid securities,
- orders are traded near the open or close when available liquidity differs from full-day volume,
- or real execution uses marketable orders during fast breakouts and stops.

Daily volume is also a coarse measure. A trade that is only `0.05%` of full-day volume can still be meaningful if it must be executed immediately through a thin order book.

## Practical Meaning

For the current research setup, liquidity is not the explanation for the strong returns. The strategy is not getting unrealistic share sizes relative to volume in this universe.

That is encouraging because it means the portfolio results have now survived:

- prior-equity sizing,
- fixed slippage at plausible levels,
- and daily-volume participation checks.

The big unresolved risks are now less about simple account mechanics and more about:

- survivorship and universe-selection bias,
- gap-through-trigger execution,
- benchmark comparison,
- broader universe behavior,
- and whether performance persists outside this recent mega-cap trend environment.

## Recommended Next Steps

1. Rerun the liquidity sweep after the diagnostic fix so the checked-in/local report files reflect the corrected zero-flag interpretation.
2. Add gap-aware fill logic for entries, stops, and channel exits.
3. Add benchmark comparisons against SPY, QQQ, and equal-weight buy-and-hold.
4. Test a broader universe where the liquidity constraint is more likely to bind.
5. Add an account-size sweep, such as `$100k`, `$500k`, `$1M`, and `$5M`, to find where volume participation starts to matter.

The most useful next implementation step is probably gap-aware fills. The liquidity model is now present, and for the current universe it is telling us: no issue yet.
