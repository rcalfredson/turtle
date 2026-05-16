'use strict';

const safeNumber = (value) => Number.isFinite(value) ? value : 0;

const calculateDrawdowns = (equityCurve, initialCapital) => {
  let runningPeak = initialCapital;

  return equityCurve.map((point) => {
    runningPeak = Math.max(runningPeak, point.equity);
    return {
      date: point.date,
      drawdown: runningPeak > 0 ? ((runningPeak - point.equity) / runningPeak) * 100 : 0,
    };
  });
};

const mapCurveByDate = (curve) => new Map((curve || []).map((point) => [point.date, point]));

const getDateRange = (curve) => {
  if (!curve || !curve.length) {
    return { first: null, last: null };
  }

  return {
    first: curve[0].date,
    last: curve[curve.length - 1].date,
  };
};

const combineEquityCurves = ({
  coreResult,
  activeResult,
  initialCapital,
}) => {
  const coreRange = getDateRange(coreResult.equityCurve);
  const activeRange = getDateRange(activeResult.equityCurve);
  if (!coreRange.first || !activeRange.first) {
    throw new Error('Both core and active sleeves require equity curves');
  }

  const startDate = [coreRange.first, activeRange.first].sort().at(-1);
  const endDate = [coreRange.last, activeRange.last].sort()[0];
  const dates = [...new Set([
    ...coreResult.equityCurve.map((point) => point.date),
    ...activeResult.equityCurve.map((point) => point.date),
  ])].filter((date) => date >= startDate && date <= endDate).sort();

  const coreByDate = mapCurveByDate(coreResult.equityCurve);
  const activeByDate = mapCurveByDate(activeResult.equityCurve);
  const activeExposureByDate = mapCurveByDate(activeResult.exposureCurve);
  let lastCore = null;
  let lastActive = null;
  let lastActiveExposure = null;

  const equityCurve = [];
  const sleeveCurve = [];
  dates.forEach((date) => {
    lastCore = coreByDate.get(date) || lastCore;
    lastActive = activeByDate.get(date) || lastActive;
    lastActiveExposure = activeExposureByDate.get(date) || lastActiveExposure;

    if (!lastCore || !lastActive) {
      return;
    }

    const coreEquity = safeNumber(lastCore.equity);
    const activeEquity = safeNumber(lastActive.equity);
    const equity = coreEquity + activeEquity;
    const coreCash = safeNumber(lastCore.cash);
    const activeCash = safeNumber(lastActive.cash);
    const cash = coreCash + activeCash;
    const coreExposure = coreEquity - coreCash;
    const activeExposurePct = lastActiveExposure
      ? safeNumber(lastActiveExposure.exposurePct)
      : (activeEquity > 0 ? ((activeEquity - activeCash) / activeEquity) * 100 : 0);
    const activeExposure = activeEquity * (activeExposurePct / 100);

    equityCurve.push({
      date,
      equity: safeNumber(equity),
      cash: safeNumber(cash),
      exposurePct: equity > 0 ? safeNumber(((coreExposure + activeExposure) / equity) * 100) : 0,
      coreEquity,
      activeEquity,
      coreCash,
      activeCash,
      coreExposurePct: safeNumber(lastCore.exposurePct),
      activeExposurePct,
      positions: safeNumber(lastCore.positions) + safeNumber(lastActive.openPositions),
      activeOpenPositions: safeNumber(lastActive.openPositions),
    });

    sleeveCurve.push({
      date,
      coreEquity,
      activeEquity,
    });
  });

  if (!equityCurve.length) {
    throw new Error('Core and active sleeves do not have overlapping equity dates');
  }

  const drawdowns = calculateDrawdowns(equityCurve, initialCapital);
  const maxDrawdown = drawdowns.reduce((max, point) => Math.max(max, point.drawdown), 0);
  const averageExposurePct = equityCurve.reduce((sum, point) => sum + point.exposurePct, 0) / equityCurve.length;

  return {
    initialCapital,
    finalEquity: safeNumber(equityCurve[equityCurve.length - 1].equity),
    startDate: equityCurve[0].date,
    endDate: equityCurve[equityCurve.length - 1].date,
    equityCurve,
    sleeveCurve,
    drawdowns,
    maxDrawdown: safeNumber(maxDrawdown),
    averageExposurePct: safeNumber(averageExposurePct),
    coreFinalEquity: safeNumber(equityCurve[equityCurve.length - 1].coreEquity),
    activeFinalEquity: safeNumber(equityCurve[equityCurve.length - 1].activeEquity),
  };
};

module.exports = {
  combineEquityCurves,
};
