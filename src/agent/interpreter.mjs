function formatPct(value) {
  return value == null ? "unknown" : `${value.toFixed(2)}%`;
}

export function renderDeterministicFallback(analysis) {
  const { observations, unavailable, comparisons } = analysis;
  if (!observations.length) {
    return {
      mode: "fallback",
      title: "The Graph data is unavailable",
      sections: {
        observe: "No qualified live market observations were returned.",
        compare: "A current comparison is withheld until at least one qualified source is available.",
        returnSource: "Unknown until live Graph evidence is available.",
        risks: unavailable.map((item) => `${item.protocol}: ${item.reason}`)
      },
      evidenceIds: []
    };
  }
  const observe = observations.map((o) => `${o.protocol}: ${formatPct(o.supplyRatePct)} supply rate, ${o.utilizationPct.toFixed(2)}% utilization, ${o.freshnessAgeSeconds}s old.`);
  const compare = comparisons.rankingAllowed
    ? `${comparisons.highestSupplyRate} has the highest observed supply rate; ${comparisons.mostObservableLiquidity} has the largest observable supply-minus-borrow proxy; ${comparisons.lowestUtilization} has the lowest utilization.`
    : "Ranking is withheld because not every returned observation is fresh.";
  const risks = [
    ...observations.filter((o) => o.utilizationPct >= 90).map((o) => `${o.protocol} is above 90% utilization, so available liquidity is a narrow proxy and can change quickly.`),
    "The displayed supply and borrow rates are neutral percentage-point fields; they are not labeled APY.",
    "Incentives are unknown in the qualified standardized source and are not treated as zero.",
    ...unavailable.map((item) => `${item.protocol} is unavailable and is excluded from current comparison.`)
  ];
  return {
    mode: "fallback",
    title: "What the live evidence says",
    sections: {
      observe: observe.join(" "),
      compare,
      returnSource: "The observed lender rate is the protocol market’s variable supply rate. The source does not expose a qualified incentives value here, so the return is not decomposed beyond that observable rate.",
      risks
    },
    evidenceIds: observations.map((o) => o.evidence.deploymentId)
  };
}

export function createInterpreter({ generate } = {}) {
  return {
    async interpret(analysis) {
      if (!generate) return renderDeterministicFallback(analysis);
      return generate({ question: analysis.question, observations: analysis.observations, comparisons: analysis.comparisons, evidence: analysis.evidence, unknowns: ["incentives"] });
    }
  };
}
