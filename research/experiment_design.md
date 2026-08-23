# Experiment Design

## 1. Statistical case study

### Objective
Evaluate whether the observed conversion rate differs between users in the public `ad` treatment group and users in the `psa` control group.

### Unit of analysis
One row per user.

### Treatment
`test_group = ad`

### Control
`test_group = psa`

### Primary outcome
`converted ∈ {0,1}`

### Primary metric
Conversion rate:

\[
CR = \frac{\text{Converted users}}{\text{Total users}}
\]

### Null hypothesis

\[
H_0: p_{ad}=p_{psa}
\]

### Alternative hypothesis

\[
H_1: p_{ad}\neq p_{psa}
\]

### Significance level

\[
\alpha=0.05
\]

### Primary inferential test
Two-proportion Z-test.

The outcome is binary and the comparison is between two independent proportions.

### Supporting analyses
- 95% confidence interval for the absolute difference in conversion.
- Relative uplift.
- Risk ratio and confidence interval.
- Chi-square test of independence as a consistency check.
- Cohen's \(h\) as standardized effect size.
- Bootstrap confidence interval.
- Statistical power.
- Treatment-only logistic regression and odds ratio.

## 2. Decision framework

An experiment decision should consider more than a p-value:

1. statistical significance;
2. confidence interval;
3. absolute effect;
4. relative effect;
5. practical relevance;
6. experiment validity;
7. guardrail metrics.

## 3. Sample allocation limitation

The dataset is strongly imbalanced between `ad` and `psa`.

A Sample Ratio Mismatch test requires the intended allocation ratio. The CSV does not document that intended ratio, so the project **does not assume a 50/50 split** and does not claim SRM failure.

## 4. UX application framework

The UX component is a **conceptual transfer** of the statistical framework.

### UX research objective
Evaluate whether improving the visual hierarchy and clarity of the primary checkout CTA can improve checkout completion without increasing user effort or errors.

### Conceptual Variant A
Baseline checkout experience.

### Conceptual Variant B
Checkout experience with a clearer primary CTA, explicit next-step wording, and reduced competing visual hierarchy.

### UX hypothesis
> Increasing the visual prominence and action clarity of the primary checkout CTA will improve checkout completion without increasing user effort or errors.

### Primary UX metric
Checkout completion rate.

### Secondary metrics
- Task completion rate.
- Time on task.

### Guardrail metrics
- Error rate.
- Customer Effort Score (CES).
- Accessibility issues.
- Abandonment.

## 5. Integrity statement

The public marketing A/B dataset compares an advertising treatment with a PSA control.

The Figma/UX variants are **not** presented as the source of the Kaggle observations. They demonstrate how the same experiment-evaluation framework could be applied to a UX feature.
