# Portfolio Gap-Aware Fill Sweep - 2026-05-12

Source reports:

- Summary: `reports/portfolio-gap-sweep-2026-05-12.csv`
- Trade audit: `reports/portfolio-gap-sweep-2026-05-12-trades.csv`
- Equity audit: `reports/portfolio-gap-sweep-2026-05-12-equity.csv`

This note summarizes the first gap-aware fill test for the portfolio backtester. The sweep used:

- `gapAwareFills=false,true`
- `slippageBps=0,5,10`
- `maxVolumeParticipationPct=1`
- current research defaults: `allowShort=false`, `entryPeriod=20`, `exitPeriod=10`, `atrPeriod=20`, `maxUnits=4`, `riskPercent=1`, `maxOpenPositions=10`

## Executive Summary

Gap-aware fills are the largest reality check so far.

The previous portfolio results survived prior-equity sizing, plausible slippage, and volume participation checks. They do not survive gap-aware fills in their earlier form.

The system remains profitable in every tested range, but performance moves from exceptional to merely interesting:

- Average return at `0 bps` drops from `328.14%` to `74.09%`.
- Average CAGR at `0 bps` drops from `46.59%` to `15.86%`.
- Average max drawdown at `0 bps` rises from `20.22%` to `28.88%`.
- Average Sharpe at `0 bps` drops from `1.599` to `0.816`.
- Average profit factor at `0 bps` drops from `3.540` to `1.681`.

This does not mean the strategy is dead. It means the earlier version was receiving a large benefit from fills at trigger prices that were not always realistically tradable.

## What Changed

With gap-aware fills disabled, a daily-bar breakout could fill at the trigger price whenever the daily high crossed the trigger.

With gap-aware fills enabled:

- long entries/adds fill at the open if the day opens above the buy trigger,
- long stops/channel exits fill at the open if the day opens below the sell trigger,
- fixed slippage is applied after choosing the trigger-or-open fill base.

This does not solve every daily-bar sequencing issue, but it removes the most obvious overnight gap optimism.

## Paired Results

| Range | Slippage | Trigger-Fill Return | Gap-Aware Return | Return Kept | Trigger CAGR | Gap CAGR | Trigger DD | Gap DD | Trigger PF | Gap PF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `0 bps` | `642.06%` | `132.53%` | `20.6%` | `49.32%` | `18.39%` | `18.56%` | `25.51%` | `3.280` | `1.782` |
| 2020-2024 | `5 bps` | `590.34%` | `137.03%` | `23.2%` | `47.18%` | `18.84%` | `19.12%` | `25.98%` | `3.160` | `1.803` |
| 2020-2024 | `10 bps` | `554.82%` | `106.84%` | `19.3%` | `45.63%` | `15.65%` | `19.68%` | `26.43%` | `3.070` | `1.646` |
| 2021-2023 | `0 bps` | `333.70%` | `74.29%` | `22.3%` | `63.21%` | `20.38%` | `14.14%` | `23.10%` | `5.641` | `1.996` |
| 2021-2023 | `5 bps` | `321.83%` | `85.36%` | `26.5%` | `61.70%` | `22.88%` | `14.30%` | `22.22%` | `5.457` | `2.088` |
| 2021-2023 | `10 bps` | `309.74%` | `80.17%` | `25.9%` | `60.14%` | `21.72%` | `14.46%` | `23.08%` | `5.277` | `2.017` |
| 2022-2024 | `0 bps` | `190.25%` | `38.62%` | `20.3%` | `42.68%` | `11.51%` | `18.55%` | `25.48%` | `2.958` | `1.498` |
| 2022-2024 | `5 bps` | `182.45%` | `37.97%` | `20.8%` | `41.39%` | `11.33%` | `19.12%` | `25.96%` | `2.875` | `1.493` |
| 2022-2024 | `10 bps` | `174.25%` | `33.81%` | `19.4%` | `40.01%` | `10.20%` | `19.68%` | `26.41%` | `2.792` | `1.438` |
| 2023-2026 | `0 bps` | `146.54%` | `50.92%` | `34.7%` | `31.13%` | `13.16%` | `29.62%` | `41.43%` | `2.281` | `1.450` |
| 2023-2026 | `5 bps` | `138.33%` | `46.12%` | `33.3%` | `29.81%` | `12.07%` | `30.42%` | `42.10%` | `2.210` | `1.408` |
| 2023-2026 | `10 bps` | `130.69%` | `40.76%` | `31.2%` | `28.54%` | `10.81%` | `31.22%` | `42.85%` | `2.145` | `1.360` |

The gap-aware version keeps roughly `19-35%` of the trigger-fill return, depending on the window and slippage setting.

## Average Results

| Gap-Aware | Slippage | Avg Return | Avg CAGR | Avg Max DD | Avg Return/DD | Avg Sharpe | Avg Profit Factor | Avg Win Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `false` | `0 bps` | `328.14%` | `46.59%` | `20.22%` | `18.348` | `1.599` | `3.540` | `52.95%` |
| `false` | `5 bps` | `308.24%` | `45.02%` | `20.74%` | `16.866` | `1.556` | `3.426` | `52.78%` |
| `false` | `10 bps` | `292.38%` | `43.58%` | `21.26%` | `15.660` | `1.516` | `3.321` | `52.78%` |
| `true` | `0 bps` | `74.09%` | `15.86%` | `28.88%` | `2.789` | `0.816` | `1.681` | `46.49%` |
| `true` | `5 bps` | `76.62%` | `16.28%` | `29.06%` | `2.919` | `0.829` | `1.698` | `46.73%` |
| `true` | `10 bps` | `65.39%` | `14.59%` | `29.69%` | `2.437` | `0.755` | `1.615` | `45.27%` |

Interestingly, the `5 bps` gap-aware rows are slightly better than the `0 bps` rows on average. That does not mean slippage helps. It means small fill differences can alter position sizing, cash availability, and the later trade path. The correct interpretation is that `0-10 bps` with gap-aware fills all land in the same broad performance zone.

## Gap Fill Counts

| Range | Slippage | Gap Entries | Gap Adds | Gap Stops | Gap Channel Exits | Total Gap Fills |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2020-2024 | `0 bps` | `22` | `23` | `5` | `9` | `59` |
| 2020-2024 | `5 bps` | `22` | `23` | `8` | `10` | `63` |
| 2020-2024 | `10 bps` | `25` | `24` | `8` | `8` | `65` |
| 2021-2023 | `0 bps` | `14` | `11` | `4` | `6` | `35` |
| 2021-2023 | `5 bps` | `13` | `11` | `6` | `5` | `35` |
| 2021-2023 | `10 bps` | `13` | `11` | `6` | `5` | `35` |
| 2022-2024 | `0 bps` | `15` | `10` | `2` | `6` | `33` |
| 2022-2024 | `5 bps` | `15` | `10` | `5` | `6` | `36` |
| 2022-2024 | `10 bps` | `15` | `10` | `5` | `6` | `36` |
| 2023-2026 | `0 bps` | `15` | `12` | `5` | `2` | `34` |
| 2023-2026 | `5 bps` | `15` | `12` | `6` | `2` | `35` |
| 2023-2026 | `10 bps` | `15` | `12` | `6` | `2` | `35` |

The largest number of gap fills appears in the 2020-2024 window, which is also where the trigger-fill result had looked most spectacular.

## Where The Pain Comes From

Across gap-aware rows:

| Trade Type | Gap Fill Count | Average Fill Base Difference | Average Absolute Difference |
| --- | ---: | ---: | ---: |
| Entries | `199` | `+$4.89` | `2.43%` |
| Add-ons | `169` | `+$11.64` | `6.06%` |
| Channel exits | `67` | `-$0.42` | `0.60%` |
| Stops | `66` | `-$4.02` | `0.98%` |

The add-on number is the key. This system depends heavily on pyramiding into winners. Under trigger fills, add-ons often enter at neat half-N increments. Under gap-aware fills, some add-ons enter meaningfully above their intended trigger levels.

That makes pyramiding less magical:

- the system still buys strength,
- but it often pays up for that strength,
- and the later trend has less room to pay for the added risk.

Large examples from the trade log include:

- XOM add on `2026-04-01`: trigger around `$133`, fill base `$165.77`, about `24.6-24.7%` above trigger.
- AAPL add on `2024-07-17`: trigger around `$188.6-188.8`, fill base `$229.45`, about `21.5-21.7%` above trigger.
- META entry on `2023-02-02`: trigger `$153.58`, fill base `$183.38`, about `19.4%` above trigger.

Those are not small execution details. They change the economics of the trade.

## Interpretation

This is the first hardening step that substantially changes the strategic picture.

Before gap-aware fills, the research story was:

> A simple long-only turtle portfolio on a liquid mega-cap universe appears exceptionally strong, even after prior-equity sizing, slippage, and liquidity checks.

After gap-aware fills, the research story is:

> The same system remains positive, but much of the exceptional performance came from optimistic trigger-price fills. The strategy now needs retuning and benchmark comparison before it can be treated as a serious live-capital candidate.

The strategy is still worth studying. A gap-aware average CAGR around `15%` is not nothing, especially if it survives broader universe and benchmark tests. But drawdowns around `29%`, Sharpe below `1`, and profit factor around `1.6-1.7` are much less obviously compelling.

## Retuning Implication

The earlier parameter choices were selected under less realistic fills. That matters.

Parameters that looked best under trigger fills may not be best under gap-aware fills:

- `maxUnits=4` may now be too aggressive if add-ons often fill far above their intended trigger.
- Longer entry channels such as `40/20` or `55/20` may reduce false or jumpy entries.
- Different exit periods may improve defense under gap risk.
- Lower `riskPercent` may be necessary if drawdown remains near or above `30-40%`.
- Add-on spacing may deserve its own parameter eventually, because `0.5N` add spacing is especially exposed to gap-up pyramiding.

So yes: the next parameter sweeps should be rerun under `gapAwareFills=true`. The earlier tuning work was useful, but it should not be treated as final under the more realistic execution model.

## Recommended Next Steps

1. Treat `gapAwareFills=true` as the research-hardening default for future portfolio tests.
2. Rerun max-units sweeps under gap-aware fills, especially `maxUnits=1,2,3,4`.
3. Rerun entry/exit channel sweeps under gap-aware fills.
4. Add benchmark comparisons before drawing conclusions from the lower-return gap-aware results.
5. Inspect the largest gap-filled add-ons and entries to decide whether add-on rules need modification.

The immediate next experiment should probably be a gap-aware `maxUnits` sweep. The current evidence points directly at pyramiding/add-ons as the area most affected by realistic gap fills.
