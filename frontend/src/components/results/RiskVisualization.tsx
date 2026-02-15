import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, User, Download } from "lucide-react";

interface PatientRisk {
  diabetes_90d_deterioration: number;
  obesity_90d_deterioration: number;
  heart_failure_90d_deterioration: number;
  kidney_failure_90d_deterioration: number;
}

interface RiskVisualizationProps {
  risks: PatientRisk[];
  onDownload: () => void;
  onBackToUpload: () => void;
}

const getRiskLevel = (probability: number) => {
  if (probability > 0.7) return { level: 'High', color: 'destructive', bgColor: 'bg-destructive/10' };
  if (probability > 0.3) return { level: 'Medium', color: 'warning', bgColor: 'bg-warning/10' };
  return { level: 'Low', color: 'success', bgColor: 'bg-success/10' };
};

const getRiskColor = (probability: number) => {
  if (probability > 0.7) return 'hsl(var(--destructive))';
  if (probability > 0.3) return 'hsl(var(--warning))';
  return 'hsl(var(--success))';
};

const conditionLabels = {
  diabetes_90d_deterioration: 'Diabetes',
  obesity_90d_deterioration: 'Obesity',
  heart_failure_90d_deterioration: 'Heart Failure',
  kidney_failure_90d_deterioration: 'Kidney Failure'
};

export function RiskVisualization({ risks, onDownload, onBackToUpload }: RiskVisualizationProps) {
  if (!risks || risks.length === 0) {
    return (
      <div className="container py-16 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No results available</h2>
        <p className="text-muted-foreground mb-6">Please try uploading again.</p>
        <Button onClick={onBackToUpload}>
          Back to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Risk Prediction Results</h1>
          <p className="text-muted-foreground">
            {risks.length} patient{risks.length !== 1 ? 's' : ''} analyzed for 90-day deterioration risk
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={onBackToUpload}>
            Back to Upload
          </Button>
          <Button onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {risks.map((patient, index) => {
          // Find highest risk condition
          const riskEntries = Object.entries(patient) as [keyof PatientRisk, number][];
          const highestRisk = riskEntries.reduce((max, [condition, risk]) => 
            risk > max.risk ? { condition, risk } : max
          , { condition: riskEntries[0][0], risk: riskEntries[0][1] });

          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
              {/* Patient Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Patient {(index + 1).toString().padStart(3, '0')}</span>
                </div>
                <Badge 
                  variant={getRiskLevel(highestRisk.risk).color as any}
                  className="text-xs"
                >
                  {getRiskLevel(highestRisk.risk).level} Risk
                </Badge>
              </div>

              {/* Highest Risk Highlight */}
              <div className={`p-3 rounded-lg mb-4 ${getRiskLevel(highestRisk.risk).bgColor}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {conditionLabels[highestRisk.condition]}
                  </span>
                  <span className="text-lg font-bold">
                    {(highestRisk.risk * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Highest risk condition
                </p>
              </div>

              {/* All Conditions */}
              <div className="space-y-3">
                {riskEntries.map(([condition, risk]) => (
                  <div key={condition} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {conditionLabels[condition]}
                      </span>
                      <span className="text-muted-foreground">
                        {(risk * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={risk * 100} 
                      className="h-2"
                      style={{
                        '--progress-background': getRiskColor(risk)
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Average Risk:</span>
                  <span className="font-medium">
                    {(riskEntries.reduce((sum, [, risk]) => sum + risk, 0) / riskEntries.length * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{risks.length}</div>
          <div className="text-sm text-muted-foreground">Total Patients</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-destructive">
            {risks.filter(patient => 
              Math.max(...Object.values(patient)) > 0.7
            ).length}
          </div>
          <div className="text-sm text-muted-foreground">High Risk Patients</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-warning">
            {risks.filter(patient => {
              const maxRisk = Math.max(...Object.values(patient));
              return maxRisk > 0.3 && maxRisk <= 0.7;
            }).length}
          </div>
          <div className="text-sm text-muted-foreground">Medium Risk Patients</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-success">
            {risks.filter(patient => 
              Math.max(...Object.values(patient)) <= 0.3
            ).length}
          </div>
          <div className="text-sm text-muted-foreground">Low Risk Patients</div>
        </Card>
      </div>
    </div>
  );
}