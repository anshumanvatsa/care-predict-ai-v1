// Mock data for the risk prediction demo

export interface Patient {
  patient_id: string;
  probability: number;
  risk_level: "High" | "Medium" | "Low";
  last_seen: string;
  drivers: Array<{
    feature: string;
    contrib: number;
  }>;
}

export interface ResultsData {
  status: string;
  jobId: string;
  summary: {
    num_patients: number;
    high_risk_count: number;
    median_risk: number;
  };
  results: Patient[];
  metrics: {
    auroc: number;
    auprc: number;
    confusion_matrix: number[][];
  };
}

// Generate mock patient data
const generatePatients = (count: number, condition: string): Patient[] => {
  const patients: Patient[] = [];

  for (let i = 1; i <= count; i++) {
    const patientId = `P${i.toString().padStart(3, "0")}`;

    // Generate risk probability with some realistic distribution
    const baseRisk = Math.random();
    let probability: number;

    if (baseRisk < 0.7) {
      // 70% low risk (0.05-0.35)
      probability = 0.05 + Math.random() * 0.3;
    } else if (baseRisk < 0.9) {
      // 20% medium risk (0.35-0.65)
      probability = 0.35 + Math.random() * 0.3;
    } else {
      // 10% high risk (0.65-0.95)
      probability = 0.65 + Math.random() * 0.3;
    }

    const risk_level: "High" | "Medium" | "Low" =
      probability > 0.6 ? "High" : probability > 0.35 ? "Medium" : "Low";

    // Generate realistic drivers based on condition
    const drivers = generateDrivers(condition, risk_level, probability);

    // Generate last seen date (within last 90 days)
    const lastSeenDays = Math.floor(Math.random() * 90);
    const lastSeenDate = new Date();
    lastSeenDate.setDate(lastSeenDate.getDate() - lastSeenDays);

    patients.push({
      patient_id: patientId,
      probability: Math.min(0.95, Math.max(0.05, probability)),
      risk_level,
      last_seen: lastSeenDate.toISOString().split("T")[0],
      drivers: drivers.slice(0, 6), // Top 6 drivers
    });
  }

  return patients.sort((a, b) => b.probability - a.probability);
};

const generateDrivers = (
  condition: string,
  riskLevel: string,
  probability: number
) => {
  const allDrivers = [
    { feature: "med_adherence_pct", baseContrib: -0.2 },
    { feature: "hba1c", baseContrib: 0.15 },
    { feature: "glucose", baseContrib: 0.12 },
    { feature: "weight", baseContrib: 0.08 },
    { feature: "activity_minutes", baseContrib: -0.1 },
    { feature: "sleep_hours", baseContrib: -0.05 },
    { feature: "systolic_bp", baseContrib: 0.1 },
    { feature: "diastolic_bp", baseContrib: 0.07 },
    { feature: "bmi", baseContrib: 0.09 },
    { feature: "smoking_status", baseContrib: 0.06 },
    { feature: "lab_creatinine", baseContrib: 0.04 },
  ];

  // Adjust contributions based on risk level and add some noise
  const drivers = allDrivers.map((driver) => ({
    feature: driver.feature,
    contrib:
      driver.baseContrib * (probability * 2 - 0.5) +
      (Math.random() - 0.5) * 0.05,
  }));

  // Sort by absolute contribution and ensure they sum to approximately the probability
  return drivers.sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
};

// Mock API response generator
export const generateMockResults = (
  condition: string,
  patientCount: number = 50
): ResultsData => {
  const results = generatePatients(patientCount, condition);
  const highRiskCount = results.filter((p) => p.risk_level === "High").length;
  const medianRisk = results[Math.floor(results.length / 2)].probability;

  // Generate realistic model metrics
  const auroc = 0.85 + Math.random() * 0.1; // 0.85-0.95
  const auprc = 0.8 + Math.random() * 0.15; // 0.80-0.95

  // Generate confusion matrix (at threshold ~0.5)
  const tp = Math.floor(highRiskCount * 0.85); // 85% sensitivity
  const fn = highRiskCount - tp;
  const lowRiskCount = results.length - highRiskCount;
  const tn = Math.floor(lowRiskCount * 0.9); // 90% specificity
  const fp = lowRiskCount - tn;

  return {
    status: "success",
    jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    summary: {
      num_patients: results.length,
      high_risk_count: highRiskCount,
      median_risk: medianRisk,
    },
    results,
    metrics: {
      auroc,
      auprc,
      confusion_matrix: [
        [tn, fp],
        [fn, tp],
      ],
    },
  };
};

// Sample CSV generation for demo
export const generateSampleCSV = () => {
  const headers = [
    "patient_id",
    "day_index",
    "date",
    "age",
    "sex",
    "ethnicity",
    "bmi_baseline",
    "height_cm",
    "blood_type",
    "family_history",
    "weight_kg",
    "systolic_bp",
    "diastolic_bp",
    "heart_rate",
    "respiratory_rate",
    "temperature_c",
    "oxygen_saturation",
    "hba1c",
    "fasting_glucose",
    "glucose_random",
    "cholesterol_total",
    "ldl",
    "hdl",
    "triglycerides",
    "creatinine",
    "egfr",
    "bun",
    "c_reactive_protein",
    "nt_proBNP",
    "bnP_approx",
    "hemoglobin",
    "wbc_count",
    "platelet_count",
    "alt",
    "ast",
    "medication_count",
    "adherence_rate",
    "insulin_use",
    "metformin_use",
    "antihypertensive_use",
    "statin_use",
    "ace_inhibitor_use",
    "diuretic_use",
    "beta_blocker_use",
    "antiplatelet_use",
    "diet_type",
    "exercise_level",
    "daily_steps",
    "exercise_minutes",
    "sleep_hours",
    "stress_level",
    "smoking_status",
    "alcohol_use",
    "water_intake_liters",
    "screen_time_hours",
    "mental_health_score",
    "hypertension",
    "coronary_artery_disease",
    "chronic_kidney_disease",
    "prior_stroke",
    "copd_flag",
    "bp_variability_7d",
    "glucose_variability_7d",
    "weight_change_30d",
    "bmi_trend",
    "adherence_trend",
    "diabetes_90d_deterioration",
    "obesity_90d_deterioration",
    "heart_failure_90d_deterioration",
    "kidney_failure_90d_deterioration",
  ];

  const rows: string[] = [];
  rows.push(headers.join(","));

  const sexes = ["M", "F"];
  const ethnicities = ["White", "Black", "Asian", "Hispanic", "Other"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const diets = ["balanced", "low_carb", "vegetarian", "high_protein"];
  const exerciseLevels = ["none", "low", "moderate", "high"];

  // Generate 10 patients × 60 days
  for (let patientNum = 1; patientNum <= 10; patientNum++) {
    const patientId = `P${patientNum.toString().padStart(5, "0")}`;

    // static patient-level values
    const age = Math.floor(40 + Math.random() * 40);
    const sex = sexes[Math.floor(Math.random() * sexes.length)];
    const ethnicity =
      ethnicities[Math.floor(Math.random() * ethnicities.length)];
    const height = (150 + Math.random() * 30).toFixed(1);
    const bmiBaseline = (20 + Math.random() * 15).toFixed(1);
    const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
    const familyHistory = Math.random() > 0.5 ? 1 : 0;

    for (let day = 1; day <= 60; day++) {
      const date = new Date();
      date.setDate(date.getDate() - (60 - day));

      // vitals & labs
      const weight = (60 + Math.random() * 40).toFixed(1);
      const systolic = (110 + Math.random() * 30).toFixed(1);
      const diastolic = (70 + Math.random() * 15).toFixed(1);
      const hr = (60 + Math.random() * 40).toFixed(1);
      const rr = (14 + Math.random() * 6).toFixed(1);
      const temp = (36 + Math.random() * 1.5).toFixed(1);
      const spo2 = (94 + Math.random() * 4).toFixed(1);

      const hba1c = (5 + Math.random() * 3).toFixed(2);
      const fpg = (80 + Math.random() * 50).toFixed(1);
      const glucoseRand = (90 + Math.random() * 80).toFixed(1);

      const chol = (150 + Math.random() * 100).toFixed(1);
      const ldl = (80 + Math.random() * 40).toFixed(1);
      const hdl = (40 + Math.random() * 20).toFixed(1);
      const tg = (100 + Math.random() * 100).toFixed(1);

      const creat = (0.6 + Math.random() * 1.5).toFixed(3);
      const egfr = (60 + Math.random() * 45).toFixed(1);
      const bun = (7 + Math.random() * 10).toFixed(1);

      const crp = (1 + Math.random() * 10).toFixed(2);
      const ntprobnp = (100 + Math.random() * 2000).toFixed(1);
      const bnp = (50 + Math.random() * 500).toFixed(1);

      const hb = (11 + Math.random() * 3).toFixed(2);
      const wbc = Math.floor(4000 + Math.random() * 5000);
      const plt = Math.floor(150000 + Math.random() * 100000);

      const alt = (20 + Math.random() * 20).toFixed(1);
      const ast = (20 + Math.random() * 20).toFixed(1);

      // meds/adherence
      const medCount = Math.floor(1 + Math.random() * 5);
      const adherence = (0.6 + Math.random() * 0.4).toFixed(3);
      const insulin = Math.random() > 0.8 ? 1 : 0;
      const metformin = Math.random() > 0.5 ? 1 : 0;
      const antihyp = Math.random() > 0.4 ? 1 : 0;
      const statin = Math.random() > 0.3 ? 1 : 0;
      const ace = Math.random() > 0.3 ? 1 : 0;
      const diur = Math.random() > 0.2 ? 1 : 0;
      const betaBlocker = Math.random() > 0.2 ? 1 : 0;
      const antiplatelet = Math.random() > 0.2 ? 1 : 0;

      // lifestyle
      const diet = diets[Math.floor(Math.random() * diets.length)];
      const exLevel =
        exerciseLevels[Math.floor(Math.random() * exerciseLevels.length)];
      const steps = Math.floor(2000 + Math.random() * 8000);
      const exMins = Math.floor(Math.random() * 60);
      const sleep = (6 + Math.random() * 2).toFixed(2);
      const stress = Math.floor(Math.random() * 5);
      const smoking = Math.random() > 0.8 ? 1 : 0;
      const alcohol = Math.random() > 0.6 ? 1 : 0;
      const water = (1 + Math.random() * 2).toFixed(2);
      const screen = (1 + Math.random() * 6).toFixed(1);
      const mentalScore = Math.floor(20 + Math.random() * 80);

      // comorbidities
      const hypertension = Math.random() > 0.5 ? 1 : 0;
      const cad = Math.random() > 0.3 ? 1 : 0;
      const ckd = Math.random() > 0.2 ? 1 : 0;
      const stroke = Math.random() > 0.1 ? 1 : 0;
      const copd = Math.random() > 0.1 ? 1 : 0;

      // derived trend-like features
      const bpVar = (Math.random() * 5).toFixed(1);
      const gluVar = (Math.random() * 10).toFixed(1);
      const wtChg = (Math.random() * 2 - 1).toFixed(1);
      const bmiTrend = (Math.random() * 0.1 - 0.05).toFixed(5);
      const adherTrend = (Math.random() * 0.1 - 0.05).toFixed(5);

      const diabDet = Math.random() > 0.8 ? 1 : 0;
      const obesDet = Math.random() > 0.7 ? 1 : 0;
      const hfDet = Math.random() > 0.6 ? 1 : 0;
      const kfDet = Math.random() > 0.5 ? 1 : 0;

      const row = [
        patientId,
        day,
        date.toISOString().split("T")[0],
        age,
        sex,
        ethnicity,
        bmiBaseline,
        height,
        bloodType,
        familyHistory,
        weight,
        systolic,
        diastolic,
        hr,
        rr,
        temp,
        spo2,
        hba1c,
        fpg,
        glucoseRand,
        chol,
        ldl,
        hdl,
        tg,
        creat,
        egfr,
        bun,
        crp,
        ntprobnp,
        bnp,
        hb,
        wbc,
        plt,
        alt,
        ast,
        medCount,
        adherence,
        insulin,
        metformin,
        antihyp,
        statin,
        ace,
        diur,
        betaBlocker,
        antiplatelet,
        diet,
        exLevel,
        steps,
        exMins,
        sleep,
        stress,
        smoking,
        alcohol,
        water,
        screen,
        mentalScore,
        hypertension,
        cad,
        ckd,
        stroke,
        copd,
        bpVar,
        gluVar,
        wtChg,
        bmiTrend,
        adherTrend,
        diabDet,
        obesDet,
        hfDet,
        kfDet,
      ];

      rows.push(row.join(","));
    }
  }

  return rows.join("\n");
};
