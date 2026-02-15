import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Ibutton from "./ibutton";

interface ResultsData {
  status: string;
  jobId: string;
  summary: {
    num_patients: number;
    high_risk_count: number;
    median_risk: number;
  };
  results: Array<{
    patient_id: string;
    probability: number;
    risk_level: "High" | "Medium" | "Low";
    last_seen: string;
    drivers: Array<{
      feature: string;
      contrib: number;
    }>;
  }>;
  metrics: {
    auroc: number;
    auprc: number;
    confusion_matrix: number[][];
  };
}

interface UploadCardProps {
  onPredictionStart: (file: File, condition: string) => void;
  setResultsData: (data: ResultsData | null) => void;
}

interface FileValidation {
  isValid: boolean;
  errors: string[];
  preview?: any[];
}

const REQUIRED_COLUMNS = [
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

const CONDITIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hypertension (Heart)" },
  { value: "obesity", label: "Obesity" },
  { value: "kidney", label: "Kidney Failure" },
];

export function UploadCard({
  onPredictionStart,
  setResultsData,
}: UploadCardProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [validation, setValidation] = useState<FileValidation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateCSV = useCallback(
    async (file: File): Promise<FileValidation> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const csv = e.target?.result as string;
            const lines = csv.split("\n");
            const headers = lines[0]
              .split(",")
              .map((h) => h.trim().toLowerCase());

            const missingColumns = REQUIRED_COLUMNS.filter(
              (col) => !headers.includes(col.toLowerCase())
            );

            const preview = lines.slice(0, 6).map((line) =>
              line.split(",").reduce((obj, val, idx) => {
                obj[headers[idx] || `col_${idx}`] = val.trim();
                return obj;
              }, {} as any)
            );

            if (missingColumns.length > 0) {
              resolve({
                isValid: false,
                errors: [
                  `Missing required columns: ${missingColumns.join(", ")}`,
                ],
              });
            } else {
              resolve({
                isValid: true,
                errors: [],
                preview: preview.slice(1), // Remove header row
              });
            }
          } catch (error) {
            resolve({
              isValid: false,
              errors: ["Invalid CSV format"],
            });
          }
        };
        reader.readAsText(file);
      });
    },
    []
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadedFile(file);
      setIsProcessing(true);

      const validation = await validateCSV(file);
      setValidation(validation);
      setIsProcessing(false);

      if (validation.isValid) {
        toast({
          title: "Upload successful",
          description:
            "CSV file validated successfully. Select a condition and click Start Prediction.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: validation.errors[0],
          variant: "destructive",
        });
      }
    },
    [validateCSV, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
  });

  const handleStartPrediction = async () => {
    if (!uploadedFile || !selectedCondition || !validation?.isValid) return;

    onPredictionStart(uploadedFile, selectedCondition);
  };

  const canStart = uploadedFile && selectedCondition && validation?.isValid;

  return (
    <div className="space-y-6">
      {/* Step A: Upload CSV */}
      <Card className="medical-card p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
              A
            </div>
            <div className="flex justify-between w-full items-center">
              <h3 className="text-lg font-semibold">Upload CSV File</h3>
              <Ibutton />
            </div>
          </div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : uploadedFile
                ? "border-success bg-success/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              {uploadedFile ? (
                <CheckCircle className="w-12 h-12 text-success mx-auto" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
              )}

              <div>
                <p className="font-medium">
                  {uploadedFile
                    ? `Uploaded: ${uploadedFile.name}`
                    : isDragActive
                    ? "Drop the CSV file here"
                    : "Drag & drop CSV here, or browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1"></p>
              </div>

              {!uploadedFile && (
                <Button variant="outline" type="button">
                  Browse Files
                </Button>
              )}
            </div>
          </div>
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={50} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Validating file...
              </p>
            </div>
          )}
          {validation && !validation.isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validation.errors[0]}{" "}
                <a href="#" className="underline">
                  See sample CSV
                </a>
              </AlertDescription>
            </Alert>
          )}
          {validation?.isValid && validation.preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-success">
                ✓ File validation passed
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Preview (first 5 rows):
                </p>
                <div className="overflow-x-auto">
                  <table className="text-xs border-collapse w-full">
                    <thead>
                      <tr>
                        {Object.keys(validation.preview[0] || {})
                          .slice(0, 6)
                          .map((header) => (
                            <th
                              key={header}
                              className="border border-border p-1 text-left bg-secondary"
                            >
                              {header}
                            </th>
                          ))}
                        <th className="border border-border p-1 text-left bg-secondary">
                          ...
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {validation.preview.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row)
                            .slice(0, 6)
                            .map((cell: any, cellIdx) => (
                              <td
                                key={cellIdx}
                                className="border border-border p-1"
                              >
                                {String(cell).substring(0, 10)}
                                {String(cell).length > 10 ? "..." : ""}
                              </td>
                            ))}
                          <td className="border border-border p-1">...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Step B: Select Condition */}
      <Card className="medical-card p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                uploadedFile && validation?.isValid
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              B
            </div>
            <h3 className="text-lg font-semibold">Select Condition</h3>
          </div>

          <Select
            value={selectedCondition}
            onValueChange={setSelectedCondition}
            disabled={!uploadedFile || !validation?.isValid}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose condition for risk prediction" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((condition) => (
                <SelectItem key={condition.value} value={condition.value}>
                  {condition.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Step C: Start Prediction */}
      <Card className="medical-card p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                canStart
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              C
            </div>
            <h3 className="text-lg font-semibold">Start Prediction</h3>
          </div>

          <Button
            onClick={handleStartPrediction}
            disabled={!canStart}
            size="lg"
            className="w-full glow-primary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Start Risk Prediction
          </Button>

          {!canStart && (
            <p className="text-sm text-muted-foreground">
              Complete steps A and B to enable prediction
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
