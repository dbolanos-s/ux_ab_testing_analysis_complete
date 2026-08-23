# UX A/B Testing & Experiment Evaluation

End-to-end statistical experimentation project focused on evaluating treatment/control conversion differences and demonstrating how the same framework can support UX feature decisions.

The project combines **Python, Pandas, SciPy, Statsmodels, statistical inference, experiment design, reproducible analysis, and UX experimentation methodology**.

> **Integrity note:** The public dataset compares an advertising treatment (`ad`) with a PSA control (`psa`). The UX Variant A / Variant B component is a conceptual application of the experimentation framework. The public observations are not presented as having been generated from the UX prototypes.

## Project links

- [Analysis notebook](notebooks/01_ab_testing_analysis.ipynb)
- [Experiment design](research/experiment_design.md)
- [UX variant design brief](design/README.md)
- [GitHub testing guide](GITHUB_TESTING.md)
- [Dashboard build prompt](DASHBOARD_PROMPT.md)

## Project objective

Evaluate whether the observed conversion probability differs between treatment and control while distinguishing **statistical significance**, **effect magnitude**, **uncertainty**, and **experiment validity**.

The same decision framework is then translated into a conceptual UX experiment for a checkout CTA redesign.

## Dataset

Source file: `marketing_AB.csv`

Public source: Kaggle — Marketing A/B Testing.

The dataset contains:

- 588,101 user-level observations;
- treatment group: `ad`;
- control group: `psa`;
- binary conversion outcome;
- total ad exposure;
- day of highest exposure;
- hour of highest exposure.

### Data-quality validation

The project verifies:

- one row per user;
- no duplicate user IDs;
- no missing values;
- valid experiment groups;
- binary conversion encoding.

## Research questions

1. Does the observed conversion rate differ between treatment and control?
2. What is the absolute and relative magnitude of the observed difference?
3. What range of effect sizes is compatible with the data at 95% confidence?
4. Is the inferential conclusion consistent across Z-test, Chi-square, bootstrap, and logistic-regression representations?
5. How should statistical significance be separated from practical significance?
6. How can the same framework be transferred to a UX feature experiment without misrepresenting the source data?

## Experiment definition

### Treatment

`test_group = ad`

### Control

`test_group = psa`

### Primary metric

Conversion Rate:

\[
CR=\frac{\text{Converted users}}{\text{Total users}}
\]

### Hypotheses

\[
H_0:p_{ad}=p_{psa}
\]

\[
H_1:p_{ad}\neq p_{psa}
\]

Significance level:

\[
\alpha=0.05
\]

## Statistical methods

The notebook implements and explains:

- two-proportion Z-test;
- Chi-square test of independence;
- 95% confidence interval for the absolute conversion difference;
- absolute uplift;
- relative uplift;
- risk ratio and 95% confidence interval;
- Cohen's \(h\) standardized effect size;
- bootstrap validation with 10,000 resamples;
- statistical power analysis;
- treatment-only logistic regression and odds ratio;
- descriptive exposure/day/hour analysis.

## Main statistical result

The treatment group has a higher observed conversion rate than the control group, and the primary two-proportion Z-test rejects the null hypothesis at \(\alpha=0.05\).

However, the notebook explicitly distinguishes statistical from practical significance. The standardized effect is small despite the very strong p-value, which is important given the large sample size.

The final experiment decision is therefore based on:

1. p-value;
2. confidence interval;
3. absolute uplift;
4. relative uplift;
5. effect size;
6. experiment validity;
7. practical relevance.

## UX experimentation transfer

A conceptual UX case is included to demonstrate how the statistical framework could be applied to a feature experiment.

### UX hypothesis

> Increasing the visual prominence and action clarity of the primary checkout CTA will improve checkout completion without increasing user effort or errors.

### Variant A

Baseline checkout experience.

### Variant B

Proposed checkout experience with clearer CTA hierarchy and explicit next-step wording.

### Proposed UX experiment metrics

**Primary**

- Checkout completion rate.

**Secondary**

- Task completion rate.
- Time on task.

**Guardrails**

- Error rate.
- Customer Effort Score (CES).
- Accessibility issues.
- Abandonment.

The UX prototypes are deliberately separated from the Kaggle experiment data.

## Repository structure

```text
ux_ab_testing_analysis/
│
├── README.md
├── requirements.txt
├── .gitignore
├── DASHBOARD_PROMPT.md
├── GITHUB_TESTING.md
│
├── data/
│   ├── raw/
│   │   └── marketing_AB.csv
│   └── processed/
│       ├── experiment_summary.csv
│       ├── statistical_results.csv
│       ├── exposure_analysis.csv
│       ├── conversion_by_day.csv
│       ├── conversion_by_hour.csv
│       ├── data_quality.json
│       └── experiment_decision.json
│
├── notebooks/
│   └── 01_ab_testing_analysis.ipynb
│
├── research/
│   └── experiment_design.md
│
├── design/
│   └── README.md
│
├── src/
│   └── analysis.py
│
├── tests/
│   └── test_analysis.py
│
├── .github/
│   └── workflows/
│       └── validate.yml
│
└── images/
```

## Reproduce the analysis locally

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows Git Bash:

```bash
source .venv/Scripts/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Regenerate analytical outputs:

```bash
python src/analysis.py
```

Run automated tests:

```bash
pytest -q
```

Expected result:

```text
6 passed
```

Open the notebook:

```bash
jupyter notebook notebooks/01_ab_testing_analysis.ipynb
```

Then run all cells from the beginning.

## Automated GitHub validation

The repository includes a GitHub Actions workflow under:

```text
.github/workflows/validate.yml
```

On every push or pull request to `main`, GitHub automatically:

1. installs Python;
2. installs project dependencies;
3. regenerates processed outputs;
4. executes the automated tests.

A green workflow run confirms that the reproducible pipeline is working.

## Methodological limitations

- The CSV does not document the original randomization mechanism.
- The intended treatment/control allocation ratio is not available in the source file.
- A formal Sample Ratio Mismatch conclusion is therefore not made.
- Exposure, day, and hour analyses are observational and are not treated as causal effects.
- The dataset does not contain UX-specific guardrail metrics such as CES, SUS, error rate, or time-on-task.
- Post-hoc power is descriptive and does not replace prospective experiment planning.
- The conceptual UX variants are not the source of the public experiment observations.

## Skills demonstrated

- Experimental design
- A/B testing
- Statistical inference
- Hypothesis testing
- Confidence intervals
- Effect-size interpretation
- Bootstrap
- Statistical power
- Logistic regression
- Python
- Pandas
- SciPy
- Statsmodels
- Reproducible analysis
- UX experimentation framework
- Research limitations and evidence-based decision making
- Git / GitHub Actions

## Future extension

The next deliverable is an interactive experiment dashboard designed for Product Managers and UX/Product Research stakeholders. The dashboard must consume the processed outputs in `data/processed/` rather than hard-code analytical results.
