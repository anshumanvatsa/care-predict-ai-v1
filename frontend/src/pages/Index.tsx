import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UploadCard } from "@/components/upload/UploadCard";
import { ProcessingOverlay } from "@/components/upload/ProcessingOverlay";
import { ResultsModal } from "@/components/results/ResultsModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Play, TrendingUp, Users, Shield } from "lucide-react";
import { generateMockResults, generateSampleCSV } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-medical.jpg";
import { useEffect } from "react";
import Chatbot from "@/components/Chatbot/Chatbot";

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

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentCondition, setCurrentCondition] = useState("");
  const { toast } = useToast();
  useEffect(() => {
    if (resultsData?.results[0]?.probability) {
      console.log("Results jef data:", resultsData);
      setIsProcessing(false);
      setShowResults(true);
    }
  }, [resultsData]);

  const handlePredictionStart = async (file: File, condition: string) => {
    setCurrentCondition(condition);
    setIsProcessing(true);

    // console.log(selectedCondition, uploadedFile, validation);

    // Create FormData and append under the key "file"
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      // "https://health-deterioration-backend-4.onrender.com/predict",
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",
        body: formData,
      }
    );

    const rawData = await res.json();
    console.log(
      "Raw prediction result:",
      rawData,
      "condition:",
      condition + "_90d_deterioration"
    );

    // Transform backend response -> ResultsData shape
    const transformedResults = await rawData.map((entry, idx) => {
      // Pick the probability for the chosen condition
      // console.log("Entry:", entry);
      if (condition == "hypertension") condition = "heart_failure";
      if (condition == "kidney") condition = "kidney_failure";
      const probability = entry[`${condition}_90d_deterioration`];

      // Decide risk level
      let risk_level = "Low";
      if (probability > 0.75) risk_level = "High";
      else if (probability > 0.4) risk_level = "Medium";

      return {
        patient_id: `Patient_${idx + 1}`,
        probability,
        risk_level,
        last_seen: new Date().toISOString(),
        drivers: Object.entries(entry).map(([feature, contrib]) => ({
          feature,
          contrib,
        })),
      };
    });

    console.log("Transformed prediction result:", transformedResults);

    // Update results state
    const data: ResultsData = {
      status: "completed",
      jobId: `job_${Date.now()}`,
      summary: {
        num_patients: transformedResults.length,
        high_risk_count: transformedResults.filter(
          (r) => r.risk_level === "High"
        ).length,
        median_risk:
          transformedResults.map((r) => r.probability).sort((a, b) => a - b)[
            Math.floor(transformedResults.length / 2)
          ] || 0,
      },
      results: transformedResults,
      metrics: {
        auroc: 0.9545,
        auprc: 0.9325,
        confusion_matrix: [
          [90, 4],
          [1, 5],
        ],
      }, // placeholder
    };
    console.log("data is ", data);

    setResultsData(data);
    console.log("resultsData is ", resultsData);

    console.log("API CALL RECEIVED");
    // setIsProcessing(false);
    // setShowResults(true);

    toast({
      title: "Analysis complete",
      description: `Risk prediction completed for ${data.summary.num_patients} patients.`,
    });
  };

  // useEffect(() => {}, [resultsData]);

  const handleProcessingComplete = () => {
    // console.log("API CALL RECEIVED");
    // setShowResults(true);
    // setIsProcessing(false);

    // toast({
    //   title: "Analysis complete",
    //   description: `Risk prediction completed for ${data.summary.num_patients} patients.`,
    // });
    // Generate mock results
    // const mockData = generateMockResults(currentCondition, 50);
    // setResultsData(mockData);
    // setShowResults(true);
    // setIsProcessing(false);

    toast({
      title: "Analysis complete",
      description: `Risk prediction completed for ${resultsData.summary.num_patients} patients.`,
    });
  };

  const handleProcessingCancel = () => {
    setIsProcessing(false);
    toast({
      title: "Analysis cancelled",
      description: "Processing has been stopped.",
    });
  };

  // const downloadSampleCSV = () => {
  //   const csvContent = generateSampleCSV();
  //   const blob = new Blob([csvContent], { type: "text/csv" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "sample-patient-data.csv";
  //   link.click();
  //   URL.revokeObjectURL(url);

  //   toast({
  //     title: "Sample downloaded",
  //     description: "Sample CSV file has been downloaded to your device.",
  //   });
  // };

  const downloadSampleCSV = () => {
    const link = document.createElement("a");
    link.href = "/sample-patient-data.csv"; // ✅ path to your CSV file
    link.download = "sample-patient-data.csv"; // suggested download name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sample downloaded",
      description: "Sample CSV file has been downloaded from assets.",
    });
  };
  const as: ResultsData = {
    status: "completed",
    jobId: "job_12345",
    summary: {
      num_patients: 3,
      high_risk_count: 1,
      median_risk: 0.42,
    },
    results: [
      {
        patient_id: "patient_001",
        probability: 0.87,
        risk_level: "High",
        last_seen: "2025-09-09T10:30:00Z",
        drivers: [
          { feature: "blood_pressure", contrib: 0.32 },
          { feature: "glucose_level", contrib: 0.28 },
          { feature: "age", contrib: 0.15 },
        ],
      },
      {
        patient_id: "patient_002",
        probability: 0.45,
        risk_level: "Medium",
        last_seen: "2025-09-08T18:10:00Z",
        drivers: [
          { feature: "bmi", contrib: 0.22 },
          { feature: "cholesterol", contrib: 0.18 },
          { feature: "exercise_level", contrib: -0.1 },
        ],
      },
      {
        patient_id: "patient_003",
        probability: 0.18,
        risk_level: "Low",
        last_seen: "2025-09-07T14:50:00Z",
        drivers: [
          { feature: "age", contrib: 0.05 },
          { feature: "smoking_status", contrib: 0.04 },
          { feature: "blood_pressure", contrib: 0.03 },
        ],
      },
    ],
    metrics: {
      auroc: 0.9545,
      auprc: 0.9325,
      confusion_matrix: [
        [90, 4],
        [1, 5],
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Medical AI dashboard visualization"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>

        <div className="relative container py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-4" />

            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground">
              Predict chronic-care deterioration within 90 days
            </h1>

            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Upload patient data to get clinician-friendly risk insights
              powered by advanced machine learning
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="text-lg px-8 py-6 glow-primary"
                onClick={() => {
                  const uploadSection =
                    document.getElementById("upload-section");
                  if (uploadSection) {
                    uploadSection.scrollIntoView({ behavior: "smooth" });
                    setTimeout(() => {
                      uploadSection.classList.add("highlight-pulse");
                      setTimeout(
                        () => uploadSection.classList.remove("highlight-pulse"),
                        2000
                      );
                    }, 500);
                  }
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Risk Assessment
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20"
                onClick={downloadSampleCSV}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Flow */}
          <div className="lg:col-span-2">
            <div id="upload-section" className="mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Risk Prediction Workflow
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload your patient data and get AI-powered risk assessments in
                minutes
              </p>
            </div>

            <UploadCard
              onPredictionStart={handlePredictionStart}
              setResultsData={setResultsData}
            />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="medical-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Model Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    AUROC Score
                  </span>
                  <span className="font-medium">95.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sensitivity
                  </span>
                  <span className="font-medium">83.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Specificity
                  </span>
                  <span className="font-medium">95.7%</span>
                </div>
              </div>
            </Card>

            {/* Required Data */}
            <Card className="medical-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Data Requirements
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Time window:</strong> 30-180 days per patient
                </p>
                <p>
                  <strong>Min patients:</strong> 10+ for reliable results
                </p>
                <p>
                  <strong>Required fields:</strong> Patient ID, dates, vitals,
                  labs
                </p>
                <p>
                  <strong>Format:</strong> CSV with headers
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={downloadSampleCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Get Sample Format
              </Button>
            </Card>

            {/* Security Notice */}
            <Card className="medical-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                Privacy & Security
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ All data encrypted in transit (HTTPS)</p>
                <p>✓ No PHI stored after analysis</p>
                <p>✓ HIPAA-compliant processing</p>
                <p>✓ De-identification maintained</p>
              </div>
            </Card>

            {/* Quick Demo */}
            <Card className="medical-card p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2">Try Demo Mode</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experience the full workflow with sample data
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setResultsData(as);
                  setCurrentCondition("diabetes");
                  handleProcessingComplete();
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Launch Demo
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Comprehensive Risk Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI engine provides detailed insights to support clinical
              decision-making
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="medical-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Risk Stratification</h3>
              <p className="text-sm text-muted-foreground">
                Automated patient categorization into Low, Medium, and High risk
                groups with confidence scores
              </p>
            </Card>

            <Card className="medical-card p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Patient Prioritization</h3>
              <p className="text-sm text-muted-foreground">
                Identify patients requiring immediate attention with actionable
                clinical recommendations
              </p>
            </Card>

            <Card className="medical-card p-6 text-center">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Evidence-Based</h3>
              <p className="text-sm text-muted-foreground">
                Transparent model explanations with feature importance and
                clinical reasoning
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Processing Overlay */}
      <ProcessingOverlay
        isProcessing={isProcessing}
        onComplete={handleProcessingComplete}
        onCancel={handleProcessingCancel}
      />

      {/* Results Modal */}
      {/* <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        data={resultsData}
        condition={currentCondition}
      /> */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => {
          setShowResults(false);
          setResultsData(null);
        }}
        data={resultsData}
        condition={currentCondition}
      />

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Index;
