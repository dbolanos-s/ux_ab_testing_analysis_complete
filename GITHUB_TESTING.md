# GitHub Testing Guide

## 1. Local validation before pushing

From the repository root:

```bash
python -m venv .venv
```

Windows Git Bash:

```bash
source .venv/Scripts/activate
```

Install dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Regenerate outputs:

```bash
python src/analysis.py
```

Run automated tests:

```bash
pytest -q
```

Expected result: all tests pass.

## 2. Open the notebook

```bash
jupyter notebook notebooks/01_ab_testing_analysis.ipynb
```

Use **Kernel → Restart & Run All**. All cells should execute without manual edits if the repository structure is unchanged.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Complete UX A/B testing experiment analysis"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

If the repository already exists:

```bash
git add .
git commit -m "Complete UX A/B testing experiment analysis"
git push origin main
```

## 4. Validate in GitHub Actions

Open:

`Repository → Actions → Validate A/B Analysis`

The workflow should show a green check.

It automatically:
1. installs Python;
2. installs dependencies;
3. regenerates processed datasets;
4. runs the tests.

## 5. Verify notebook rendering on GitHub

Open:

`notebooks/01_ab_testing_analysis.ipynb`

GitHub should render Markdown, formulas, code, tables, charts, findings, limitations and conclusions.

## 6. Files that must be visible in the final repository

- `README.md`
- `requirements.txt`
- `data/raw/marketing_AB.csv`
- `data/processed/*`
- `notebooks/01_ab_testing_analysis.ipynb`
- `research/experiment_design.md`
- `design/README.md`
- `src/analysis.py`
- `tests/test_analysis.py`
- `.github/workflows/validate.yml`
- `DASHBOARD_PROMPT.md`

## 7. Dashboard later

Do not claim that the dashboard exists until it has actually been generated and deployed. Once available, add its public URL and screenshot to the README.
