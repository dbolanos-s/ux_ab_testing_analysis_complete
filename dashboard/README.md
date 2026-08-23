# UX A/B Testing — Power BI-Style Dashboard

This dashboard is a custom-built static web report designed to resemble the visual grammar of a Power BI report rather than a generic web template.

## Report Pages

1. **Experiment Overview**
   - participants;
   - treatment/control conversion rates;
   - absolute and relative uplift;
   - sample allocation;
   - 95% confidence interval;
   - experiment decision.

2. **Statistical Evaluation**
   - Z statistic and p-value;
   - risk ratio;
   - Cohen's h;
   - power;
   - risk-ratio and odds-ratio confidence intervals;
   - decision logic.

3. **Behavioral Exploration**
   - exposure band;
   - day;
   - hour;
   - conversion-rate vs user-volume slicer;
   - explicit observational-data warning.

4. **UX Experiment Framework**
   - Variant A and Variant B;
   - UX hypothesis;
   - primary/secondary/guardrail metrics;
   - experiment operating model.

## Data Loading

The dashboard first tries to load the project's canonical processed files from:

```text
../data/processed/
```

If those are unavailable, it falls back to the standalone copies included under:

```text
dashboard/data/
```

This means the dashboard can work both:
- inside the complete GitHub repository; and
- as a standalone package.

## Run Locally

From the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/dashboard/
```

If testing the standalone dashboard folder by itself:

```bash
cd dashboard
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do **not** open `index.html` directly with `file://`, because browsers can block local `fetch()` calls.

## GitHub Pages

If this folder is added to your current repository and GitHub Pages deploys from `main / (root)`, the dashboard will be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/dashboard/
```

## Research Integrity

The public marketing A/B dataset evaluates `ad` vs `psa`.

The checkout Variant A/B designs are a conceptual UX application of the experimentation framework. They are not presented as the source of the public Kaggle observations.
