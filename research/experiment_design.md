# Experiment Design

## 1. Statistical Case Study

### Research Objective

Evaluate whether the observed conversion probability differs between users in the public `ad` treatment group and users in the `psa` control group.

### Unit of Analysis

One row represents one user.

### Treatment and Control

- **Treatment:** `ad`
- **Control:** `psa`

### Primary Outcome

The outcome is binary:

```
Y_i = { 1,  if user i converted
      { 0,  otherwise
```

### Primary Metric

For group `g`, the conversion rate is:

```
p̂_g = x_g / n_g
```

where:
- `x_g` = number of converted users in group g
- `n_g` = total number of users in group g

### Hypotheses

**Null hypothesis (H₀):**
```
p_T = p_C
```
The conversion probability is equal between treatment and control.

**Alternative hypothesis (H₁):**
```
p_T ≠ p_C
```
The conversion probabilities differ between groups.

**Significance level:** α = 0.05 (two-tailed test)

### Primary Statistical Test

A **two-proportion Z-test** is used because:
- The response variable is binary (converted or not)
- We're comparing two independent groups
- Sample sizes are large (n > 100 per group)

### Supporting Evidence

The experiment evaluation also includes:

- **95% Confidence Interval** for the absolute difference in conversion rates
- **Absolute Uplift** (percentage point difference)
- **Relative Uplift** (percentage increase relative to control)
- **Risk Ratio** with confidence interval
- **Chi-square test** for consistency check
- **Cohen's h** standardized effect size
- **Bootstrap confidence interval** for robustness
- **Statistical Power** (post-hoc)
- **Logistic Odds Ratio** from treatment-only regression

## 2. Decision Framework

A product decision should combine multiple pieces of evidence:

```
Decision Quality = 
  Statistical Evidence 
  + Effect Magnitude 
  + Uncertainty bounds 
  + Experiment Validity 
  + Business Guardrails
```

**Statistical rule:**
```
Reject H₀ if p-value < 0.05
```

**Important:** Statistical significance is necessary but not sufficient. 
The rollout decision must also account for effect size, confidence intervals, validity threats, and business impact.

## 3. Allocation Limitation

The dataset shows a **highly imbalanced** allocation:
- Treatment (`ad`): ~564k users
- Control (`psa`): ~24k users
- Ratio: ~24:1 (not balanced)

**Note on Sample Ratio Mismatch (SRM):**
A formal SRM evaluation requires the **intended randomization ratio**. The dataset does not document this, so we treat the observed imbalance as a data artifact rather than labeling it as an SRM failure.

## 4. UX Experiment Transfer

This project demonstrates how the statistical framework above can be applied to a UX feature experiment.

### UX Research Objective

Evaluate whether increasing the visual prominence and action clarity of the primary checkout CTA will improve checkout completion without increasing user effort or errors.

### Variant A — Baseline

Baseline checkout experience with:
- Neutral CTA emphasis
- Generic action wording

### Variant B — Proposed

Same checkout flow with:
- More prominent CTA button (larger, higher contrast)
- Explicit next-step wording ("Complete Purchase" vs "Next")

### UX Hypothesis

> Increasing the visual prominence and action clarity of the primary checkout CTA will improve checkout completion without increasing user effort or errors.

### UX Metrics

**Primary Metric**
- Checkout Completion Rate (conversion)

**Secondary Metrics**
- Task Completion Rate
- Time on Task (should not increase)

**Guardrail Metrics** (protect against negative side effects)
- Error Rate
- Customer Effort Score (CES)
- Accessibility compliance (WCAG violations)
- Abandonment Rate

## 5. Integrity Statement

**Data source:** Public marketing A/B test (Kaggle) comparing an advertising treatment (`ad`) with a PSA control (`psa`).

**UX variants:** The checkout prototypes in `design/` are a **conceptual demonstration** of how the statistical framework can transfer to UX experimentation. These prototypes were not the source of the observed data—they illustrate the methodology.

**No conflation:** This research project clearly separates:
1. The empirical analysis of public marketing data
2. The methodological transfer to a hypothetical UX experiment

Both are presented as case studies in applied experimentation, not as evidence that the prototypes generated the public results.
