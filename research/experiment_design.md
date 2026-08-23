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

$$
Y_i =
\begin{cases}
1, & \text{if user } i \text{ converted} \\
0, & \text{otherwise}
\end{cases}
$$

### Primary Metric

For group $g$:

$$
\hat{p}_g = \frac{x_g}{n_g}
$$

where $x_g$ is the number of converted users and $n_g$ is the number of users in the group.

### Hypotheses

$$
H_0: p_T = p_C
$$

$$
H_1: p_T \neq p_C
$$

with:

$$
\alpha = 0.05
$$

### Primary Statistical Test

A **two-proportion Z-test** is used because the response variable is binary and the primary comparison is between two independent conversion proportions.

### Supporting Evidence

The experiment evaluation also includes:

- 95% confidence interval for the absolute difference;
- absolute and relative uplift;
- risk ratio and confidence interval;
- Chi-square consistency check;
- Cohen's $h$ effect size;
- bootstrap confidence interval;
- statistical power;
- treatment-only logistic regression and odds ratio.

## 2. Decision Framework

A product decision should combine more than statistical significance:

$$
\text{Decision Quality}
=
\text{Statistical Evidence}
+
\text{Effect Magnitude}
+
\text{Uncertainty}
+
\text{Validity}
+
\text{Guardrails}
$$

The statistical rule is:

$$
\text{Reject } H_0 \text{ if } p < 0.05
$$

but this is not, by itself, a rollout rule.

## 3. Allocation Limitation

The dataset is highly imbalanced between `ad` and `psa`.

A formal Sample Ratio Mismatch conclusion requires the **intended allocation ratio**. The CSV does not document that ratio, so the project does not assume a 50/50 design and does not label the imbalance as an SRM failure.

## 4. UX Experiment Transfer

### UX Research Objective

Evaluate whether increasing the visual prominence and action clarity of the primary checkout CTA can improve checkout completion without increasing user effort or errors.

### Variant A — Baseline

Baseline checkout experience with neutral CTA emphasis and generic action wording.

### Variant B — Proposed

The same checkout flow with a more prominent CTA and explicit next-step wording.

### UX Hypothesis

> Increasing the visual prominence and action clarity of the primary checkout CTA will improve checkout completion without increasing user effort or errors.

### UX Metrics

**Primary**
- Checkout Completion Rate.

**Secondary**
- Task Completion Rate.
- Time on Task.

**Guardrails**
- Error Rate.
- Customer Effort Score (CES).
- Accessibility issues.
- Abandonment.

## 5. Integrity Statement

The public marketing A/B dataset compares an advertising treatment with a PSA control.

The UX variants in `design/` are a **conceptual demonstration** of how the statistical framework could be transferred to a UX feature experiment. The Kaggle observations are not presented as having been generated from these prototypes.
