import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Download,
  Eye,
  TrendingUp,
  Target,
  Users,
  BarChart3,
} from "lucide-react";
import { SummaryTab } from "./tabs/SummaryTab";
import { PatientListTab } from "./tabs/PatientListTab";
import { MetricsTab } from "./tabs/MetricsTab";
import { DownloadTab } from "./tabs/DownloadTab";

interface Patient {
  patient_id: string;
  probability: number;
  risk_level: "High" | "Medium" | "Low";
  last_seen: string;
  drivers: Array<{
    feature: string;
    contrib: number;
  }>;
}

interface ResultsData {
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

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResultsData | null;
  condition: string;
}

export function ResultsModal({
  isOpen,
  onClose,
  data,
  condition,
}: ResultsModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  if (!data) return null;

  const { summary, results, metrics } = data;
  const highRiskPercentage = Math.round(
    (summary.high_risk_count / summary.num_patients) * 100
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl w-[95vw] md:w-[85vw] lg:w-[70vw] h-[90vh] md:h-[85vh] max-h-[950px] p-0 overflow-hidden"
        aria-describedby="results-modal-description"
      >
        <DialogHeader className="flex-shrink-0 p-4 md:p-6 pb-0 flex flex-row items-center justify-between space-y-0 border-b border-border">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg md:text-2xl font-semibold text-foreground">
              Risk Prediction Results
            </DialogTitle>
            <p
              id="results-modal-description"
              className="text-muted-foreground mt-1 text-xs md:text-sm"
            >
              {condition} deterioration prediction • {summary.num_patients}{" "}
              patients analyzed
            </p>
          </div>
          {/* <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="flex-shrink-0 ml-4 hover:bg-secondary h-8 w-8 md:h-10 md:w-10"
            aria-label="Close results modal"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button> */}
        </DialogHeader>

        {/* Quick Stats Bar */}
        <div className="flex-shrink-0 px-4 md:px-6 py-4 md:py-5 border-b border-border bg-secondary/30">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-2 md:p-3 rounded-lg bg-background/60">
              <div className="text-lg md:text-2xl font-bold text-primary mb-1">
                {summary.num_patients}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">
                Total Patients
              </div>
            </div>
            <div className="text-center p-2 md:p-3 rounded-lg bg-background/60">
              <div className="text-lg md:text-2xl font-bold text-destructive mb-1">
                {summary.high_risk_count}
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">
                High Risk
              </div>
            </div>
            <div className="text-center p-2 md:p-3 rounded-lg bg-background/60">
              <div className="text-lg md:text-2xl font-bold text-warning mb-1">
                {highRiskPercentage}%
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">
                Risk Rate
              </div>
            </div>
            <div className="text-center p-2 md:p-3 rounded-lg bg-background/60">
              <div className="text-lg md:text-2xl font-bold text-accent mb-1">
                {(metrics.auroc * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-medium">
                Model AUROC
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 px-3 md:px-6 pt-3 md:pt-4 pb-2">
            <TabsList className="grid w-full max-w-full mx-auto grid-cols-4 bg-muted/30 h-8 md:h-10">
              <TabsTrigger
                value="summary"
                className="flex items-center gap-1 text-[10px] md:text-xs data-[state=active]:bg-background px-1 md:px-3"
              >
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">Summary</span>
                <span className="sm:hidden">Sum</span>
              </TabsTrigger>
              <TabsTrigger
                value="patients"
                className="flex items-center gap-1 text-[10px] md:text-xs data-[state=active]:bg-background px-1 md:px-3"
              >
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">Patients</span>
                <span className="sm:hidden">Pat</span>
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="flex items-center gap-1 text-[10px] md:text-xs data-[state=active]:bg-background px-1 md:px-3"
              >
                <BarChart3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">Metrics</span>
                <span className="sm:hidden">Met</span>
              </TabsTrigger>
              <TabsTrigger
                value="download"
                className="flex items-center gap-1 text-[10px] md:text-xs data-[state=active]:bg-background px-1 md:px-3"
              >
                <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="summary"
              className="h-full data-[state=active]:flex data-[state=active]:flex-col m-0 p-0"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 md:p-6">
                  <SummaryTab
                    summary={summary}
                    results={results}
                    condition={condition}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="patients"
              className="h-full data-[state=active]:flex data-[state=active]:flex-col m-0 p-0"
            >
              <div className="flex-1 overflow-hidden">
                <PatientListTab
                  results={results}
                  onPatientSelect={setSelectedPatient}
                  selectedPatient={selectedPatient}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="metrics"
              className="h-full data-[state=active]:flex data-[state=active]:flex-col m-0 p-0"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 md:p-6">
                  <MetricsTab metrics={metrics} />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="download"
              className="h-full data-[state=active]:flex data-[state=active]:flex-col m-0 p-0"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 md:p-6">
                  <DownloadTab data={data} condition={condition} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
