import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react"; // optional icon

export default function Ibutton() {
  const requiredFields = `Required: patient_id, day_index, date, age, sex, ethnicity, bmi_baseline, height_cm, blood_type, family_history, weight_kg, systolic_bp, diastolic_bp, heart_rate, respiratory_rate, temperature_c, oxygen_saturation, hba1c, fasting_glucose, glucose_random, cholesterol_total, ldl, hdl, triglycerides, creatinine, egfr, bun, c_reactive_protein, nt-proBNP, bnP_approx, hemoglobin, wbc_count, platelet_count, alt, ast, medication_count, adherence_rate, insulin_use, metformin_use, antihypertensive_use, statin_use, ace_inhibitor_use, diuretic_use, beta_blocker_use, antiplatelet_use, diet_type, exercise_level, daily_steps, exercise_minutes, sleep_hours, stress_level, smoking_status, alcohol_use, water_intake_liters, screen_time_hours, mental_health_score, hypertension, coronary_artery_disease, chronic_kidney_disease, prior_stroke, copd_flag, bp_variability_7d, glucose_variability_7d, weight_change_30d, bmi_trend, adherence_trend, diabetes_90d_deterioration, obesity_90d_deterioration, heart_failure_90d_deterioration, kidney_failure_90d_deterioration`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
            <Info className="w-4 h-4 text-gray-600" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[400px] whitespace-pre-wrap text-sm">
          {requiredFields}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
