# UX Experiment Design

This folder contains the visual UX application of the statistical experimentation framework.

## Files

- `variant-a.html` / `variant-a.png` — baseline checkout condition.
- `variant-b.html` / `variant-b.png` — proposed checkout condition.
- `experiment-flow.html` / `experiment-flow.png` — Power BI-style experiment framework summary.

## UX Hypothesis

> Increasing the visual prominence and action clarity of the primary checkout CTA will improve checkout completion without increasing user effort or errors.

## Controlled Change

The two checkout screens intentionally keep the following constant:

- product and price;
- checkout structure;
- form fields;
- shipping option;
- order summary;
- CTA location.

The primary intervention is limited to:

1. **CTA visual prominence**;
2. **CTA action wording**.

This reduces the risk of changing many variables simultaneously.

## Variant A — Baseline

- neutral CTA styling;
- generic `Continue` wording.

## Variant B — Proposed

- stronger primary CTA emphasis;
- explicit `Continue to Payment` wording;
- small next-step clarification.

## Experiment Metrics

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

## Integrity Note

The public marketing A/B dataset used in the statistical case study compares an advertisement treatment with a PSA control.

These checkout designs are a **conceptual UX application** and were not the interfaces that generated the public Kaggle observations.
