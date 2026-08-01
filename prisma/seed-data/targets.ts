export const targets = [
  { id: "tgt-hours-saved", label: "Monthly validated hours saved", metricKey: "monthlyValidatedHoursSaved", targetValue: 130, unit: "hours", scope: "Organization", period: "Monthly", direction: null },
  { id: "tgt-net-benefit", label: "Monthly net financial benefit", metricKey: "monthlyNetFinancialBenefit", targetValue: 4500, unit: "usd", scope: "Organization", period: "Monthly", direction: null },
  { id: "tgt-adoption", label: "AI adoption percentage", metricKey: "adoptionPercentage", targetValue: 85, unit: "percent", scope: "Organization", period: "Ongoing", direction: null },
  { id: "tgt-validated-pct", label: "Validated-submission percentage", metricKey: "validatedPercentage", targetValue: 80, unit: "percent", scope: "Organization", period: "Ongoing", direction: null },
  { id: "tgt-reusable-contribution", label: "Reusable-asset contribution", metricKey: "reusableContributionPercentage", targetValue: 30, unit: "percent", scope: "Organization", period: "Ongoing", direction: null },
  { id: "tgt-completeness", label: "Data-completeness score", metricKey: "avgCompletenessScore", targetValue: 90, unit: "percent", scope: "Organization", period: "Ongoing", direction: null },
  { id: "tgt-high-confidence", label: "High-confidence submission share", metricKey: "highConfidenceSharePercentage", targetValue: 70, unit: "percent", scope: "Organization", period: "Ongoing", direction: null },
  { id: "tgt-quality-improvement", label: "Quality-improvement target", metricKey: "avgQualityImprovementPercentage", targetValue: 15, unit: "percent", scope: "Organization", period: "Ongoing", direction: null },
  { id: "tgt-max-rework", label: "Maximum acceptable rework rate", metricKey: "reworkRatePercentage", targetValue: 8, unit: "percent", scope: "Organization", period: "Ongoing", direction: "max" },
  { id: "tgt-max-error-rate", label: "Maximum AI-generated error rate", metricKey: "aiErrorRatePercentage", targetValue: 5, unit: "percent", scope: "Organization", period: "Ongoing", direction: "max" },
];
