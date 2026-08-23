# Experiment Findings

## Dataset Summary

The public A/B dataset contains **588,101 users**.

| Group | Users | Conversions | Conversion Rate |
|---|---:|---:|---:|
| Treatment (`ad`) | 564,577 | 14,423 | 2.5547% |
| Control (`psa`) | 23,524 | 420 | 1.7854% |

## Effect Estimate

The observed absolute difference is:

$$
\hat{\Delta}
=
\hat{p}_T-
\hat{p}_C
$$

The analysis estimates:

- **Absolute uplift:** +0.7692 percentage points.
- **Relative uplift:** +43.09% relative to the control baseline.
- **Risk Ratio:** 1.4309.

The relative uplift should not be interpreted as a 43 percentage-point increase. The baseline conversion rate is low, while the absolute difference remains below one percentage point.

## Primary Hypothesis Test

The two-proportion Z-test produced:

- **Z statistic:** 7.3701.
- **p-value:** $1.7053 \times 10^{-13}$.

At $\alpha=0.05$, the statistical decision is:

> **Reject $H_0$.**

The observed conversion rates differ statistically between the treatment and control groups.

## Confidence Interval

The 95% confidence interval for the absolute treatment-control difference is approximately:

$$
[0.5951,\;0.9434]
\text{ percentage points}
$$

The interval does not include zero.

## Supporting Evidence

- **Chi-square:** 54.0058.
- **Chi-square p-value:** $1.9990 \times 10^{-13}$.
- **Risk Ratio 95% CI:** [1.2997, 1.5752].
- **Bootstrap 95% CI:** [0.5967, 0.9421] percentage points.
- **Cohen's $h$:** 0.0530.
- **Observed post-hoc power:** approximately 1.00.
- **Treatment logistic odds ratio:** 1.4421.
- **Odds Ratio 95% CI:** [1.3076, 1.5905].

## Interpretation

The statistical evidence is strong, but the standardized effect size is small.

This illustrates a core experimentation principle:

$$
\text{Statistical Significance}
\neq
\text{Practical Significance}
$$

A product decision should therefore consider the absolute effect magnitude, uncertainty, implementation cost, guardrails, and experiment validity rather than relying only on the p-value.

## Behavioral Exploration

Additional analyses examine conversion patterns by:

- total advertising exposure;
- day of highest exposure;
- hour of highest exposure.

These analyses are descriptive. They are not treated as randomized causal effects.

## Methodological Limitation

The CSV does not document the original randomization procedure or intended allocation ratio.

Therefore, the analysis demonstrates strong statistical evidence of a difference between the observed groups, while stronger causal claims depend on confirmation of the original experiment design.

## UX Application

The checkout Variant A and Variant B prototypes in `design/` illustrate how the experiment-evaluation framework could be transferred to a UX feature.

The public Kaggle observations were **not generated from these prototypes**.
