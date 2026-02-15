import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, TrendingUp, TrendingDown, Target, Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts";

interface Patient {
  patient_id: string;
  probability: number;
  risk_level: 'High' | 'Medium' | 'Low';
  last_seen: string;
  drivers: Array<{
    feature: string;
    contrib: number;
  }>;
}

interface ExplainabilityTabProps {
  results: Patient[];
  selectedPatient: Patient | null;
  condition: string;
}

// Global feature importance (aggregated across all patients)
const globalFeatureImportance = [
  { feature: "med_adherence_pct", importance: 0.28, avg_contrib: 0.15 },
  { feature: "hba1c", importance: 0.22, avg_contrib: 0.12 },
  { feature: "glucose", importance: 0.18, avg_contrib: 0.09 },
  { feature: "weight", importance: 0.15, avg_contrib: 0.08 },
  { feature: "activity_minutes", importance: 0.12, avg_contrib: -0.06 },
  { feature: "sleep_hours", importance: 0.05, avg_contrib: -0.03 }
];

export function ExplainabilityTab({ results, selectedPatient, condition }: ExplainabilityTabProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    selectedPatient?.patient_id || results[0]?.patient_id || ""
  );

  const currentPatient = selectedPatient || results.find(p => p.patient_id === selectedPatientId);

  const generateExplanation = (patient: Patient) => {
    const topDrivers = patient.drivers.slice(0, 3);
    const primaryDriver = topDrivers[0];
    
    if (!primaryDriver) return "Analysis in progress...";

    const impact = primaryDriver.contrib > 0 ? "increased" : "reduced";
    const featureName = primaryDriver.feature.replace(/_/g, ' ');
    
    return `Patient ${patient.patient_id} shows ${impact} risk primarily due to ${featureName}. ` +
           `Combined with ${topDrivers.slice(1).map(d => d.feature.replace(/_/g, ' ')).join(' and ')}, ` +
           `the model predicts a ${(patient.probability * 100).toFixed(1)}% probability of ${condition} deterioration within 90 days.`;
  };

  const generateCounterfactuals = (patient: Patient) => {
    const recommendations = [];
    
    patient.drivers.forEach(driver => {
      if (driver.contrib > 0.1) { // Significant positive contribution
        switch (driver.feature) {
          case 'med_adherence_pct':
            recommendations.push("Improve medication adherence by 20% → Risk reduces by ~15%");
            break;
          case 'hba1c':
            recommendations.push("Reduce HbA1c by 0.5% → Risk reduces by ~12%");
            break;
          case 'glucose':
            recommendations.push("Better glucose control (±20mg/dL) → Risk reduces by ~8%");
            break;
          case 'weight':
            recommendations.push("Weight reduction of 5-10% → Risk reduces by ~10%");
            break;
          default:
            const feature = driver.feature.replace(/_/g, ' ');
            recommendations.push(`Optimize ${feature} → Risk reduces by ~${Math.abs(driver.contrib * 100).toFixed(0)}%`);
        }
      }
    });

    return recommendations.slice(0, 4); // Top 4 recommendations
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global">Global Feature Importance</TabsTrigger>
          <TabsTrigger value="local">Local Patient Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Model Feature Importance</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Features ranked by their overall impact on {condition} risk prediction across all patients in the cohort.
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={globalFeatureImportance} layout="horizontal">
                <XAxis type="number" domain={[0, 0.3]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <YAxis 
                  type="category" 
                  dataKey="feature" 
                  width={120}
                  tickFormatter={(value) => value.replace(/_/g, ' ')}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
                  labelFormatter={(label) => `Feature: ${label.replace(/_/g, ' ')}`}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {globalFeatureImportance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.avg_contrib > 0 ? '#EF4444' : '#22C55E'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-destructive" />
                  Risk Increasing Factors
                </h4>
                <ul className="space-y-1 text-sm">
                  {globalFeatureImportance
                    .filter(f => f.avg_contrib > 0)
                    .map(feature => (
                      <li key={feature.feature} className="flex justify-between">
                        <span className="capitalize">{feature.feature.replace(/_/g, ' ')}</span>
                        <span className="text-destructive font-medium">+{(feature.avg_contrib * 100).toFixed(1)}%</span>
                      </li>
                    ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-success" />
                  Risk Reducing Factors
                </h4>
                <ul className="space-y-1 text-sm">
                  {globalFeatureImportance
                    .filter(f => f.avg_contrib < 0)
                    .map(feature => (
                      <li key={feature.feature} className="flex justify-between">
                        <span className="capitalize">{feature.feature.replace(/_/g, ' ')}</span>
                        <span className="text-success font-medium">{(feature.avg_contrib * 100).toFixed(1)}%</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="local" className="space-y-4">
          {/* Patient Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Patient:</label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {results.map(patient => (
                  <SelectItem key={patient.patient_id} value={patient.patient_id}>
                    {patient.patient_id} ({patient.risk_level} Risk)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentPatient && (
            <div className="space-y-6">
              {/* Patient Overview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Patient {currentPatient.patient_id} Analysis</h3>
                  <Badge variant={
                    currentPatient.risk_level === 'High' ? 'destructive' :
                    currentPatient.risk_level === 'Medium' ? 'secondary' : 'default'
                  }>
                    {currentPatient.risk_level} Risk ({(currentPatient.probability * 100).toFixed(1)}%)
                  </Badge>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-primary mt-0.5" />
                    <p className="text-sm leading-relaxed">
                      {generateExplanation(currentPatient)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Local Feature Contributions */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Individual Feature Contributions (SHAP-style)</h4>
                
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={currentPatient.drivers} layout="horizontal">
                    <XAxis 
                      type="number" 
                      domain={[-0.3, 0.3]} 
                      tickFormatter={(value) => `${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="feature" 
                      width={120}
                      tickFormatter={(value) => value.replace(/_/g, ' ')}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}%`, 
                        'Contribution'
                      ]}
                      labelFormatter={(label) => `Feature: ${label.replace(/_/g, ' ')}`}
                    />
                    <Bar dataKey="contrib" radius={[0, 4, 4, 0]}>
                      {currentPatient.drivers.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.contrib > 0 ? '#EF4444' : '#22C55E'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm">
                    <strong>Reading this chart:</strong> Features extending right (red) increase risk, 
                    while features extending left (green) decrease risk. The length shows the magnitude of impact.
                  </p>
                </div>
              </Card>

              {/* Counterfactual Recommendations */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold">Actionable Recommendations</h4>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Clinical interventions that could reduce this patient's risk:
                </p>

                <div className="space-y-3">
                  {generateCounterfactuals(currentPatient).map((recommendation, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-success text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Clinical Note:</strong> These are model-generated suggestions based on feature contributions. 
                    Always validate with clinical judgment and patient-specific contraindications before implementation.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}