
const state = {
  summary: null,
  stats: {},
  exposure: [],
  days: [],
  hours: [],
  quality: null,
  decision: null,
  charts: {},
  metric: "conversion"
};

const formatInt = value => Number(value).toLocaleString("en-US");
const formatPct = value => `${(Number(value) * 100).toFixed(2)}%`;
const formatPP = value => `${(Number(value) * 100).toFixed(3)} pp`;
const formatNum = (value, digits = 3) => Number(value).toFixed(digits);
const formatSci = value => Number(value).toExponential(2);

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map(x => x.trim());

  return lines.slice(1).map(line => {
    // Project CSVs contain no quoted commas, so a compact parser is sufficient here.
    const values = line.split(",");
    const row = {};
    headers.forEach((header, index) => {
      const raw = (values[index] ?? "").trim();
      const numeric = raw !== "" && !Number.isNaN(Number(raw));
      row[header] = numeric ? Number(raw) : raw;
    });
    return row;
  });
}

async function fetchWithFallback(filename, isJson = false) {
  // index.html vive en la raíz del repositorio, por lo que la ruta correcta
  // es data/processed/. Las otras rutas cubren el caso de servir el dashboard
  // desde una subcarpeta.
  const paths = [
    `data/processed/${filename}`,
    `../data/processed/${filename}`,
    `./data/processed/${filename}`
  ];

  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) continue;
      return isJson ? await response.json() : parseCsv(await response.text());
    } catch (err) {
      // Con file:// fetch lanza por CORS; seguimos al respaldo embebido.
    }
  }

  // Respaldo: datos embebidos en js/data-embedded.js
  const key = filename.replace(/\.(csv|json)$/, "");
  if (window.EMBEDDED_DATA && window.EMBEDDED_DATA[key]) {
    console.warn(`No se pudo leer ${filename} por HTTP. Usando datos embebidos.`);
    return window.EMBEDDED_DATA[key];
  }

  throw new Error(`No se pudo cargar ${filename}`);
}

async function loadData() {
  const [
    summary,
    statsRows,
    exposure,
    days,
    hours,
    quality,
    decision
  ] = await Promise.all([
    fetchWithFallback("experiment_summary.csv"),
    fetchWithFallback("statistical_results.csv"),
    fetchWithFallback("exposure_analysis.csv"),
    fetchWithFallback("conversion_by_day.csv"),
    fetchWithFallback("conversion_by_hour.csv"),
    fetchWithFallback("data_quality.json", true),
    fetchWithFallback("experiment_decision.json", true)
  ]);

  state.summary = summary;
  state.stats = Object.fromEntries(statsRows.map(row => [row.metric, Number(row.value)]));
  state.exposure = exposure;
  state.days = days;
  state.hours = hours;
  state.quality = quality;
  state.decision = decision;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getGroups() {
  const treatment = state.summary.find(x => x.test_group === "ad");
  const control = state.summary.find(x => x.test_group === "psa");
  return { treatment, control };
}

function renderOverview() {
  const { treatment, control } = getGroups();
  const total = treatment.users + control.users;

  setText("kpiParticipants", formatInt(total));
  setText("kpiTreatmentCr", formatPct(state.stats.treatment_conversion_rate));
  setText("kpiControlCr", formatPct(state.stats.control_conversion_rate));
  setText("kpiAbsolute", formatPP(state.stats.absolute_uplift));
  setText("kpiRelative", `${(state.stats.relative_uplift * 100).toFixed(2)}%`);
  setText("kpiDecision", state.decision.decision);

  setText("treatmentUsers", `${formatInt(treatment.users)} (${(treatment.users / total * 100).toFixed(2)}%)`);
  setText("controlUsers", `${formatInt(control.users)} (${(control.users / total * 100).toFixed(2)}%)`);

  document.getElementById("allocationTreatment").style.width = `${treatment.users / total * 100}%`;
  document.getElementById("allocationControl").style.width = `${control.users / total * 100}%`;

  const estimatePP = state.stats.absolute_uplift * 100;
  const lowPP = state.stats.ci_difference_low * 100;
  const highPP = state.stats.ci_difference_high * 100;

  setText("effectEstimate", `${estimatePP.toFixed(3)} pp`);
  setText("ciText", `${lowPP.toFixed(3)} to ${highPP.toFixed(3)} pp`);

  const scaleMax = 1.0;
  const clamp = x => Math.min(100, Math.max(0, x / scaleMax * 100));
  document.getElementById("ciLine").style.left = `${clamp(lowPP)}%`;
  document.getElementById("ciLine").style.width = `${clamp(highPP) - clamp(lowPP)}%`;
  document.getElementById("effectPoint").style.left = `${clamp(estimatePP)}%`;

  const effectLanguage = Math.abs(state.stats.cohen_h) < 0.20
    ? "small standardized effect"
    : "material standardized effect";

  setText(
    "overviewInsight",
    `Treatment conversion is higher than control, and the 95% confidence interval for the absolute difference stays above zero. ` +
    `The primary test rejects H₀, but Cohen's h indicates a ${effectLanguage}. ` +
    `This is why the experiment should be interpreted using both statistical significance and practical magnitude.`
  );

  if (state.charts.conversion) state.charts.conversion.destroy();

  state.charts.conversion = new Chart(
    document.getElementById("conversionChart"),
    {
      type: "bar",
      data: {
        labels: ["Control · psa", "Treatment · ad"],
        datasets: [{
          label: "Conversion Rate (%)",
          data: [
            control.conversion_rate * 100,
            treatment.conversion_rate * 100
          ],
          backgroundColor: ["#E66C37", "#01B8AA"],
          borderWidth: 0,
          barPercentage: .55,
          categoryPercentage: .68
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Conversion Rate: ${ctx.raw.toFixed(3)}%`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#605E5C", font: { family: "Segoe UI", size: 11 } }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 3,
            grid: { color: "#EDEBE9" },
            ticks: {
              color: "#605E5C",
              font: { family: "Segoe UI", size: 10 },
              callback: value => `${value}%`
            },
            title: {
              display: true,
              text: "Conversion Rate",
              color: "#605E5C",
              font: { family: "Segoe UI", size: 10, weight: "normal" }
            }
          }
        }
      }
    }
  );
}

function renderStatistics() {
  setText("statZ", formatNum(state.stats.z_statistic, 2));
  setText("statP", formatSci(state.stats.z_p_value));
  setText("statRR", formatNum(state.stats.risk_ratio, 3));
  setText("statH", formatNum(state.stats.cohen_h, 3));
  setText("statPower", `${(state.stats.observed_power * 100).toFixed(1)}%`);

  setText("ratioRR", formatNum(state.stats.risk_ratio, 3));
  setText(
    "ratioRRCI",
    `95% CI ${formatNum(state.stats.risk_ratio_ci_low, 3)} – ${formatNum(state.stats.risk_ratio_ci_high, 3)}`
  );
  setText("ratioOR", formatNum(state.stats.logistic_odds_ratio, 3));
  setText(
    "ratioORCI",
    `95% CI ${formatNum(state.stats.logistic_or_ci_low, 3)} – ${formatNum(state.stats.logistic_or_ci_high, 3)}`
  );

  setText(
    "decisionEvidence",
    `p = ${formatSci(state.stats.z_p_value)} < 0.05`
  );
  setText(
    "decisionMagnitude",
    `${formatPP(state.stats.absolute_uplift)} absolute uplift · h = ${formatNum(state.stats.cohen_h, 3)}`
  );

  const rows = [
    [
      "Two-proportion Z-test",
      `z = ${formatNum(state.stats.z_statistic, 3)} · p = ${formatSci(state.stats.z_p_value)}`,
      "Reject H₀ at α = 0.05"
    ],
    [
      "Absolute difference",
      `${formatPP(state.stats.absolute_uplift)}`,
      `95% CI ${formatPP(state.stats.ci_difference_low)} to ${formatPP(state.stats.ci_difference_high)}`
    ],
    [
      "Risk ratio",
      `${formatNum(state.stats.risk_ratio, 3)}`,
      `Treatment probability is ${formatNum(state.stats.risk_ratio, 2)}× control`
    ],
    [
      "Cohen's h",
      `${formatNum(state.stats.cohen_h, 3)}`,
      Math.abs(state.stats.cohen_h) < .20 ? "Below conventional small-effect benchmark" : "Material standardized effect"
    ],
    [
      "Bootstrap interval",
      `${formatPP(state.stats.bootstrap_ci_low)} to ${formatPP(state.stats.bootstrap_ci_high)}`,
      "Consistent with analytical CI"
    ],
    [
      "Power",
      `${(state.stats.observed_power * 100).toFixed(1)}%`,
      `≈ ${formatInt(state.stats.required_equal_sample_80_power)} users/group for 80% power at observed h`
    ]
  ];

  document.getElementById("evidenceTable").innerHTML = rows.map(row => `
    <tr>
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
    </tr>
  `).join("");
}

function createOrReplaceChart(key, canvasId, config) {
  if (state.charts[key]) state.charts[key].destroy();
  state.charts[key] = new Chart(document.getElementById(canvasId), config);
}

function renderBehavior() {
  const metric = state.metric;
  const isConversion = metric === "conversion";

  const yLabel = isConversion ? "Conversion Rate (%)" : "Users";
  const valueFormat = value => isConversion
    ? `${Number(value).toFixed(2)}%`
    : formatInt(value);

  const exposureValues = state.exposure.map(x =>
    isConversion ? x.conversion_rate_pct : x.users
  );
  const dayValues = state.days.map(x =>
    isConversion ? x.conversion_rate_pct : x.users
  );
  const hourValues = state.hours.map(x =>
    isConversion ? x.conversion_rate_pct : x.users
  );

  setText("exposureSubtitle", isConversion ? "Observed conversion rate" : "Observed user volume");
  setText("daySubtitle", isConversion ? "Observed conversion rate" : "Observed user volume");
  setText("hourSubtitle", isConversion ? "Observed conversion rate" : "Observed user volume");

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${yLabel}: ${valueFormat(ctx.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#605E5C", font: { family: "Segoe UI", size: 10 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#EDEBE9" },
        ticks: {
          color: "#605E5C",
          font: { family: "Segoe UI", size: 10 },
          callback: value => isConversion ? `${value}%` : Number(value).toLocaleString("en-US")
        }
      }
    }
  };

  createOrReplaceChart("exposure", "exposureChart", {
    type: "bar",
    data: {
      labels: state.exposure.map(x => x.exposure_band),
      datasets: [{
        data: exposureValues,
        backgroundColor: "#01B8AA",
        borderWidth: 0,
        barPercentage: .62
      }]
    },
    options: commonOptions
  });

  createOrReplaceChart("day", "dayChart", {
    type: "bar",
    data: {
      labels: state.days.map(x => x.most_ads_day),
      datasets: [{
        data: dayValues,
        backgroundColor: "#118DFF",
        borderWidth: 0,
        barPercentage: .62
      }]
    },
    options: commonOptions
  });

  createOrReplaceChart("hour", "hourChart", {
    type: "line",
    data: {
      labels: state.hours.map(x => x.most_ads_hour),
      datasets: [{
        data: hourValues,
        borderColor: "#12239E",
        backgroundColor: "rgba(18,35,158,.08)",
        fill: true,
        tension: .28,
        pointRadius: 2.5,
        pointHoverRadius: 4,
        borderWidth: 2
      }]
    },
    options: commonOptions
  });

  const topExposure = [...state.exposure].sort((a,b) =>
    (b.conversion_rate_pct ?? 0) - (a.conversion_rate_pct ?? 0)
  )[0];

  const topDay = [...state.days].sort((a,b) =>
    (b.conversion_rate_pct ?? 0) - (a.conversion_rate_pct ?? 0)
  )[0];

  const topHour = [...state.hours].sort((a,b) =>
    (b.conversion_rate_pct ?? 0) - (a.conversion_rate_pct ?? 0)
  )[0];

  document.getElementById("patternList").innerHTML = [
    {
      title: `Highest observed exposure-band conversion: ${topExposure.exposure_band}`,
      body: `${topExposure.conversion_rate_pct.toFixed(2)}% observed conversion. Treat as descriptive association, not a dosage effect.`
    },
    {
      title: `Highest observed day: ${topDay.most_ads_day}`,
      body: `${topDay.conversion_rate_pct.toFixed(2)}% observed conversion among users whose highest exposure occurred that day.`
    },
    {
      title: `Highest observed hour: ${String(topHour.most_ads_hour).padStart(2,"0")}:00`,
      body: `${topHour.conversion_rate_pct.toFixed(2)}% observed conversion. Useful for hypothesis generation, not causal scheduling claims.`
    },
    {
      title: "Interpretation boundary",
      body: "The randomized treatment is ad vs psa. Exposure amount, day, and hour should not automatically be adjusted for or interpreted as causal mediators."
    }
  ].map((item, i) => `
    <div class="pattern-item">
      <div class="pattern-rank">0${i + 1}</div>
      <div><strong>${item.title}</strong><p>${item.body}</p></div>
    </div>
  `).join("");
}

function renderAll() {
  renderOverview();
  renderStatistics();
  renderBehavior();
}

function switchPage(target) {
  document.querySelectorAll(".report-page").forEach(page => {
    page.classList.toggle("active", page.dataset.page === target);
  });
  document.querySelectorAll(".page-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.target === target);
  });

  if (target === "overview" && state.charts.conversion) state.charts.conversion.resize();
  if (target === "behavior") {
    ["exposure","day","hour"].forEach(key => state.charts[key]?.resize());
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindNavigation() {
  document.querySelectorAll(".page-tab").forEach(tab => {
    tab.addEventListener("click", () => switchPage(tab.dataset.target));
  });

  document.querySelectorAll(".slicer-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      document.querySelectorAll(".slicer-tile").forEach(t => t.classList.remove("active"));
      tile.classList.add("active");
      state.metric = tile.dataset.metric;
      renderBehavior();
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    state.metric = "conversion";
    document.querySelectorAll(".slicer-tile").forEach(t => {
      t.classList.toggle("active", t.dataset.metric === "conversion");
    });
    renderBehavior();
    switchPage("overview");
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const { treatment, control } = getGroups();
    const rows = [
      ["metric", "value"],
      ["participants", treatment.users + control.users],
      ["treatment_users", treatment.users],
      ["control_users", control.users],
      ["treatment_conversion_rate", state.stats.treatment_conversion_rate],
      ["control_conversion_rate", state.stats.control_conversion_rate],
      ["absolute_uplift", state.stats.absolute_uplift],
      ["relative_uplift", state.stats.relative_uplift],
      ["risk_ratio", state.stats.risk_ratio],
      ["z_p_value", state.stats.z_p_value],
      ["cohen_h", state.stats.cohen_h],
      ["decision", state.decision.decision]
    ];
    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ab_experiment_dashboard_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

async function init() {
  try {
    await loadData();
    renderAll();
    bindNavigation();
  } catch (error) {
    console.error(error);
    document.querySelector(".loading-card").innerHTML =
      `<strong>Dashboard data could not be loaded.</strong>
       <span style="font-size:11px;color:#605e5c">
         Expected files in <code>data/processed/</code>.<br>
         Detail: ${error.message}
       </span>`;
    return;
  }

  document.getElementById("loadingOverlay").classList.add("hidden");
}

init();
