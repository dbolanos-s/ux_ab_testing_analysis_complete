# UX Experiment Metric Framework

## Purpose

This framework defines the behavioral and usability metrics that should be specified **before** launching a production UX experiment.

## Primary Metric

### Checkout Completion Rate

$$
\text{Checkout Completion Rate}
=
\frac{\text{Completed Checkouts}}{\text{Users Starting Checkout}}
$$

This is the primary behavioral outcome used to evaluate whether Variant B improves completion of the critical flow.

## Secondary Metrics

### Task Completion Rate

$$
\text{Task Completion Rate}
=
\frac{\text{Successfully Completed Tasks}}{\text{Total Attempted Tasks}}
$$

This metric provides a direct usability-success measure.

### Time on Task

$$
\text{Time on Task}
=
\text{Task End Time}
-
\text{Task Start Time}
$$

Time should be interpreted together with task success. A shorter time is not automatically better if it results from abandonment or errors.

## Guardrail Metrics

### Error Rate

$$
\text{Error Rate}
=
\frac{\text{Observed Interaction Errors}}{\text{Task Attempts}}
$$

The proposed design should not improve conversion by introducing more errors.

### Customer Effort Score (CES)

A post-task effort question can be collected on a defined Likert scale. The exact scale and wording should be fixed before the experiment.

CES is used as a user-perception guardrail rather than as a replacement for behavioral outcomes.

### Abandonment Rate

$$
\text{Abandonment Rate}
=
1-
\text{Checkout Completion Rate}
$$

### Accessibility Guardrail

Variant B should be reviewed for accessibility regressions including focus order, contrast, keyboard use, labeling, and screen-reader semantics.

## Statistical Evaluation

The binary primary metric can be evaluated using:

- two-proportion Z-test;
- 95% confidence interval;
- absolute uplift;
- relative uplift;
- risk ratio;
- standardized effect size.

## Decision Principle

A rollout should not be based only on a p-value.

A stronger decision considers:

1. primary metric improvement;
2. confidence interval;
3. absolute and relative effect magnitude;
4. guardrail performance;
5. accessibility;
6. experiment validity;
7. practical value.

## Recommended Decision Matrix

| Primary Metric | Guardrails | Interpretation |
|---|---|---|
| Improves | Stable/improve | Candidate for rollout |
| Improves | Worsen | Investigate / do not auto-rollout |
| No clear change | Stable | Iterate or stop |
| Worsens | Any | Do not roll out |
