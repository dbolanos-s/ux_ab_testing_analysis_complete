from pathlib import Path
import json
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "marketing_AB.csv"
PROCESSED = ROOT / "data" / "processed"

def test_raw_dataset_exists():
    assert RAW.exists()

def test_raw_dataset_core_quality():
    df = pd.read_csv(RAW).drop(columns=["Unnamed: 0"], errors="ignore")
    df = df.rename(columns={
        "user id": "user_id",
        "test group": "test_group",
        "total ads": "total_ads",
        "most ads day": "most_ads_day",
        "most ads hour": "most_ads_hour",
    })
    assert len(df) == 588_101
    assert df["user_id"].nunique() == len(df)
    assert df.isna().sum().sum() == 0
    assert set(df["test_group"]) == {"ad", "psa"}
    assert set(df["converted"].astype(int)) == {0, 1}

def test_processed_outputs_exist():
    expected = [
        "experiment_summary.csv",
        "statistical_results.csv",
        "exposure_analysis.csv",
        "conversion_by_day.csv",
        "conversion_by_hour.csv",
        "data_quality.json",
        "experiment_decision.json",
    ]
    for name in expected:
        assert (PROCESSED / name).exists(), name

def test_experiment_summary():
    summary = pd.read_csv(PROCESSED / "experiment_summary.csv")
    assert set(summary["test_group"]) == {"ad", "psa"}
    ad = summary.loc[summary["test_group"] == "ad", "conversion_rate"].iloc[0]
    psa = summary.loc[summary["test_group"] == "psa", "conversion_rate"].iloc[0]
    assert ad > psa

def test_statistical_result_is_valid():
    stats = pd.read_csv(PROCESSED / "statistical_results.csv")
    values = dict(zip(stats["metric"], stats["value"]))
    assert 0 <= values["z_p_value"] <= 1
    assert values["ci_difference_low"] > 0
    assert values["ci_difference_high"] > values["ci_difference_low"]
    assert values["risk_ratio"] > 1

def test_decision_file():
    decision = json.loads((PROCESSED / "experiment_decision.json").read_text())
    assert decision["primary_test"] == "two-proportion z-test"
    assert isinstance(decision["statistically_significant"], bool)
