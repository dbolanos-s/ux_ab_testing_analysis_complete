from pathlib import Path
import json
import numpy as np
import pandas as pd
from scipy.stats import norm, chi2_contingency
from statsmodels.stats.proportion import proportions_ztest, proportion_effectsize
from statsmodels.stats.power import NormalIndPower
import statsmodels.formula.api as smf

RANDOM_STATE = 42
ALPHA = 0.05
N_BOOTSTRAP = 10_000

def load_and_clean(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.drop(columns=["Unnamed: 0"], errors="ignore")
    df = df.rename(columns={
        "user id": "user_id",
        "test group": "test_group",
        "total ads": "total_ads",
        "most ads day": "most_ads_day",
        "most ads hour": "most_ads_hour",
    })
    required = {
        "user_id", "test_group", "converted",
        "total_ads", "most_ads_day", "most_ads_hour"
    }
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    df["converted"] = df["converted"].astype(int)
    return df

def validate_data(df: pd.DataFrame) -> dict:
    checks = {
        "rows": int(len(df)),
        "unique_users": int(df["user_id"].nunique()),
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_user_ids": int(df["user_id"].duplicated().sum()),
        "missing_values": int(df.isna().sum().sum()),
        "groups": sorted(df["test_group"].dropna().unique().tolist()),
        "converted_values": sorted(df["converted"].dropna().unique().tolist()),
    }
    if checks["duplicate_user_ids"] != 0:
        raise ValueError("Duplicate user IDs detected.")
    if checks["missing_values"] != 0:
        raise ValueError("Missing values detected.")
    if set(checks["groups"]) != {"ad", "psa"}:
        raise ValueError(f"Unexpected experiment groups: {checks['groups']}")
    if set(checks["converted_values"]) != {0, 1}:
        raise ValueError("converted must be binary {0,1}.")
    return checks

def build_outputs(df: pd.DataFrame):
    summary = (
        df.groupby("test_group")
        .agg(
            users=("user_id", "count"),
            conversions=("converted", "sum"),
            conversion_rate=("converted", "mean"),
        )
        .reset_index()
    )
    summary["conversion_rate_pct"] = summary["conversion_rate"] * 100

    ad = summary.loc[summary["test_group"] == "ad"].iloc[0]
    psa = summary.loc[summary["test_group"] == "psa"].iloc[0]

    n_ad, n_psa = int(ad["users"]), int(psa["users"])
    c_ad, c_psa = int(ad["conversions"]), int(psa["conversions"])
    p_ad, p_psa = float(ad["conversion_rate"]), float(psa["conversion_rate"])

    absolute_uplift = p_ad - p_psa
    relative_uplift = absolute_uplift / p_psa
    risk_ratio = p_ad / p_psa

    successes = np.array([c_ad, c_psa])
    observations = np.array([n_ad, n_psa])
    z_stat, z_p_value = proportions_ztest(successes, observations, alternative="two-sided")

    table = pd.crosstab(df["test_group"], df["converted"])
    chi2_stat, chi2_p_value, chi2_dof, _ = chi2_contingency(table)

    z_critical = norm.ppf(0.975)
    se_diff = np.sqrt(
        p_ad * (1 - p_ad) / n_ad +
        p_psa * (1 - p_psa) / n_psa
    )
    ci_low = absolute_uplift - z_critical * se_diff
    ci_high = absolute_uplift + z_critical * se_diff

    log_rr = np.log(risk_ratio)
    se_log_rr = np.sqrt(
        (1 / c_ad) - (1 / n_ad) +
        (1 / c_psa) - (1 / n_psa)
    )
    rr_ci_low = np.exp(log_rr - z_critical * se_log_rr)
    rr_ci_high = np.exp(log_rr + z_critical * se_log_rr)

    cohen_h = proportion_effectsize(p_ad, p_psa)

    rng = np.random.default_rng(RANDOM_STATE)
    boot_ad = rng.binomial(n_ad, p_ad, size=N_BOOTSTRAP) / n_ad
    boot_psa = rng.binomial(n_psa, p_psa, size=N_BOOTSTRAP) / n_psa
    boot_diff = boot_ad - boot_psa
    bootstrap_ci_low, bootstrap_ci_high = np.percentile(boot_diff, [2.5, 97.5])

    power_engine = NormalIndPower()
    ratio = n_psa / n_ad
    observed_power = power_engine.power(
        effect_size=abs(cohen_h),
        nobs1=n_ad,
        ratio=ratio,
        alpha=ALPHA,
        alternative="two-sided",
    )
    required_equal_sample = power_engine.solve_power(
        effect_size=abs(cohen_h),
        power=0.80,
        alpha=ALPHA,
        ratio=1.0,
        alternative="two-sided",
    )

    regression_df = df.copy()
    regression_df["treatment"] = (regression_df["test_group"] == "ad").astype(int)
    logit = smf.logit("converted ~ treatment", data=regression_df).fit(disp=False)
    odds_ratio = float(np.exp(logit.params["treatment"]))
    or_ci = np.exp(logit.conf_int().loc["treatment"])
    odds_ratio_ci_low = float(or_ci.iloc[0])
    odds_ratio_ci_high = float(or_ci.iloc[1])

    exposure_bins = [0, 10, 25, 50, 100, np.inf]
    exposure_labels = ["1-10", "11-25", "26-50", "51-100", "100+"]
    exp_df = df.copy()
    exp_df["exposure_band"] = pd.cut(
        exp_df["total_ads"],
        bins=exposure_bins,
        labels=exposure_labels,
        include_lowest=True,
    )
    exposure = (
        exp_df.groupby("exposure_band", observed=False)
        .agg(
            users=("user_id", "count"),
            conversions=("converted", "sum"),
            conversion_rate=("converted", "mean"),
            avg_ads=("total_ads", "mean"),
        )
        .reset_index()
    )
    exposure["conversion_rate_pct"] = exposure["conversion_rate"] * 100

    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    by_day = (
        df.groupby("most_ads_day")
        .agg(
            users=("user_id", "count"),
            conversions=("converted", "sum"),
            conversion_rate=("converted", "mean"),
            avg_ads=("total_ads", "mean"),
        )
        .reindex(day_order)
        .reset_index()
    )
    by_day["conversion_rate_pct"] = by_day["conversion_rate"] * 100

    by_hour = (
        df.groupby("most_ads_hour")
        .agg(
            users=("user_id", "count"),
            conversions=("converted", "sum"),
            conversion_rate=("converted", "mean"),
            avg_ads=("total_ads", "mean"),
        )
        .reset_index()
        .sort_values("most_ads_hour")
    )
    by_hour["conversion_rate_pct"] = by_hour["conversion_rate"] * 100

    stats = pd.DataFrame({
        "metric": [
            "treatment_conversion_rate", "control_conversion_rate",
            "absolute_uplift", "relative_uplift", "risk_ratio",
            "risk_ratio_ci_low", "risk_ratio_ci_high",
            "z_statistic", "z_p_value",
            "chi_square", "chi_square_p_value", "chi_square_dof",
            "ci_difference_low", "ci_difference_high",
            "bootstrap_ci_low", "bootstrap_ci_high",
            "cohen_h", "observed_power",
            "required_equal_sample_80_power",
            "logistic_odds_ratio", "logistic_or_ci_low", "logistic_or_ci_high",
        ],
        "value": [
            p_ad, p_psa, absolute_uplift, relative_uplift, risk_ratio,
            rr_ci_low, rr_ci_high, z_stat, z_p_value,
            chi2_stat, chi2_p_value, chi2_dof,
            ci_low, ci_high, bootstrap_ci_low, bootstrap_ci_high,
            cohen_h, observed_power, np.ceil(required_equal_sample),
            odds_ratio, odds_ratio_ci_low, odds_ratio_ci_high,
        ],
    })

    decision = {
        "alpha": ALPHA,
        "primary_test": "two-proportion z-test",
        "decision": "Reject H0" if z_p_value < ALPHA else "Fail to reject H0",
        "statistically_significant": bool(z_p_value < ALPHA),
        "methodological_note": (
            "The CSV does not document the original randomization mechanism or "
            "the intended treatment/control allocation ratio. Statistical evidence "
            "is strong, but causal interpretation depends on the original experiment design."
        ),
    }

    return summary, stats, exposure, by_day, by_hour, decision

def main():
    project_root = Path(__file__).resolve().parents[1]
    raw_path = project_root / "data" / "raw" / "marketing_AB.csv"
    out_dir = project_root / "data" / "processed"
    out_dir.mkdir(parents=True, exist_ok=True)

    df = load_and_clean(raw_path)
    quality = validate_data(df)
    summary, stats, exposure, by_day, by_hour, decision = build_outputs(df)

    summary.to_csv(out_dir / "experiment_summary.csv", index=False)
    stats.to_csv(out_dir / "statistical_results.csv", index=False)
    exposure.to_csv(out_dir / "exposure_analysis.csv", index=False)
    by_day.to_csv(out_dir / "conversion_by_day.csv", index=False)
    by_hour.to_csv(out_dir / "conversion_by_hour.csv", index=False)

    with open(out_dir / "data_quality.json", "w", encoding="utf-8") as f:
        json.dump(quality, f, indent=2)
    with open(out_dir / "experiment_decision.json", "w", encoding="utf-8") as f:
        json.dump(decision, f, indent=2)

    print("Analysis completed successfully.")
    print(summary.to_string(index=False))
    print(f"\nDecision: {decision['decision']}")

if __name__ == "__main__":
    main()
