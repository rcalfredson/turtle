# Universe Realism - 2026-05-13

This note captures the main interpretation issue raised after the benchmark comparison.

The benchmark result was mixed:

- the strategy beat broad passive ETFs in the tested windows,
- the strategy reduced drawdown versus owning the same selected universe,
- but equal-weight buy-and-hold of the same 18-symbol universe beat the strategy on average raw return and CAGR.

That result is useful, but it should not be read too simply.

## The Benchmark Trap

Same-universe buy-and-hold is the hardest benchmark we have tested so far, but it is not a neutral benchmark.

It asks:

> If we already knew this was the universe to own, would the strategy beat simply holding it?

The current answer is mostly no on raw return, though yes on drawdown control.

That is not surprising. The current universe is heavily tilted toward securities that performed extremely well over the test windows. If an investor could have confidently selected that exact basket beforehand and held through the drawdowns, buy-and-hold would be very hard to beat.

But that is not the real live-trading problem.

The live problem is:

> Given a broad set of plausible candidates, can the strategy systematically find and participate in the securities that actually begin trending?

Those are different questions.

## Why The Strategy May Still Matter

The strategy does not need to beat hindsight ownership of the eventual winners to be useful.

It needs to improve the decision process available before the winners are obvious.

In practice, an investor does not know in advance which mega-cap stocks, sector ETFs, or market segments will dominate the next few years. A trend system may help by:

- allocating only after price strength appears,
- avoiding some securities that never develop strong trends,
- exiting when trends fail,
- rotating capital toward current leaders,
- reducing drawdown versus permanent ownership,
- and reducing the psychological burden of holding every candidate through every decline.

That is the real research hypothesis now.

The strategy is no longer best described as:

> A way to outperform owning a known winning basket.

It is better described as:

> A rules-based selection and risk-management layer for an uncertain universe.

## What The Current Tests Do And Do Not Prove

The current tests show that the strategy is plausible enough to keep studying.

They do not prove that it is live-ready.

What we know:

- the realistic version of the strategy can beat broad ETF benchmarks in the tested windows,
- `gapAwareFills=true`, `maxUnits=1`, and `20/10` remain the current best baseline,
- slippage and liquidity checks do not destroy the current baseline,
- gap-aware fills were the largest realism correction,
- and same-universe buy-and-hold is a tough raw-return hurdle.

What we do not know:

- whether the strategy works on a broader universe not selected for recent winners,
- whether it works across weaker, flatter, or more mixed markets,
- whether it can select future leaders from a larger candidate list,
- whether its edge survives sector balancing,
- and whether its lower drawdown is enough to justify underperforming the strongest buy-and-hold baskets.

## The Right Next Test

The next phase should test universe realism.

The important question is no longer only:

> What are the best Turtle parameters?

The better question is:

> How does the strategy behave when the universe contains both future winners and future non-winners?

Good next universes would include:

- a broader liquid stock universe,
- a sector-balanced ETF universe,
- a list of securities chosen by an objective rule before the test window,
- or eventually historical index membership, if we can obtain clean data.

The comparison should include:

- the strategy on that universe,
- equal-weight buy-and-hold of that same universe,
- broad passive ETFs such as `SPY` and `QQQ`,
- and possibly sector or style ETF benchmarks when relevant.

## Current Interpretation

The strategy is still worth developing, but the reason has changed.

The early question was:

> Can this system produce exceptional returns?

After the realism pass and benchmark comparison, the sharper question is:

> Can this system provide a better forward-looking selection and risk-management process than buying and holding an uncertain basket?

That is a much more serious and useful question.

If the strategy only works on a universe of hindsight winners, it is not enough. If it can find strength inside a broader, messier, more realistic universe while keeping drawdowns controlled, then it becomes much more interesting for real use.

## Working Baseline

For the next research phase, keep the current baseline unchanged:

- `gapAwareFills=true`
- `maxUnits=1`
- `entryPeriod=20`
- `exitPeriod=10`
- `allowShort=false`
- `maxVolumeParticipationPct=1`
- `slippageBps=5` as the practical default, with `0` and `10` as sensitivity checks

The next experiments should change the universe, not the strategy rules.
