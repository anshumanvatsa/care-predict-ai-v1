import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, Users, Activity } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
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

interface SummaryTabProps {
  summary: {
    num_patients: number;
    high_risk_count: number;
    median_risk: number;
  };
  results: Patient[];
  condition: string;
}

const RISK_COLORS = {
  High: '#EF4444',
  Medium: '#F97316', 
  Low: '#22C55E'
};

export function SummaryTab({ summary, results, condition }: SummaryTabProps) {
  // Calculate risk distribution
  const riskDistribution = [
    { name: 'Low Risk', value: results.filter(p => p.risk_level === 'Low').length, color: RISK_COLORS.Low },
    { name: 'Medium Risk', value: results.filter(p => p.risk_level === 'Medium').length, color: RISK_COLORS.Medium },
    { name: 'High Risk', value: results.filter(p => p.risk_level === 'High').length, color: RISK_COLORS.High }
  ];

  // Calculate probability ranges
  const probabilityRanges = [
    { range: '0-20%', count: results.filter(p => p.probability <= 0.2).length },
    { range: '21-40%', count: results.filter(p => p.probability > 0.2 && p.probability <= 0.4).length },
    { range: '41-60%', count: results.filter(p => p.probability > 0.4 && p.probability <= 0.6).length },
    { range: '61-80%', count: results.filter(p => p.probability > 0.6 && p.probability <= 0.8).length },
    { range: '81-100%', count: results.filter(p => p.probability > 0.8).length }
  ];

  const highRiskPercentage = Math.round((summary.high_risk_count / summary.num_patients) * 100);
  const averageProbability = results.reduce((sum, p) => sum + p.probability, 0) / results.length;

  return (
    <div className="space-y-6">
      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cohort Risk</p>
              <p className="text-2xl font-bold text-primary">{highRiskPercentage}%</p>
              <p className="text-xs text-muted-foreground">
                {summary.high_risk_count} of {summary.num_patients} patients
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Probability</p>
              <p className="text-2xl font-bold text-accent">{(averageProbability * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                Median: {(summary.median_risk * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Condition</p>
              <p className="text-2xl font-bold capitalize">{condition}</p>
              <p className="text-xs text-muted-foreground">90-day deterioration</p>
            </div>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-secondary-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Gauge Visualization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Assessment Gauge</h3>
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              {/* Risk level arc */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={highRiskPercentage > 30 ? RISK_COLORS.High : highRiskPercentage > 15 ? RISK_COLORS.Medium : RISK_COLORS.Low}
                strokeWidth="10"
                strokeDasharray={`${highRiskPercentage * 3.14} 314`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{highRiskPercentage}%</div>
                <div className="text-xs text-muted-foreground">Risk</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Low (0-15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Medium (16-30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span>High (30%+)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} patients`, 'Count']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Probability Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={probabilityRanges}>
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} patients`, 'Count']}
                labelFormatter={(label) => `Risk: ${label}`}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Key Clinical Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant={highRiskPercentage > 25 ? 'destructive' : highRiskPercentage > 15 ? 'secondary' : 'default'} className="mt-0.5">
              {highRiskPercentage > 25 ? 'Alert' : highRiskPercentage > 15 ? 'Monitor' : 'Stable'}
            </Badge>
            <p className="text-sm">
              <strong>{highRiskPercentage}% of patients</strong> show elevated risk for {condition} deterioration within 90 days. 
              {highRiskPercentage > 25 ? ' Immediate clinical review recommended.' : 
               highRiskPercentage > 15 ? ' Enhanced monitoring suggested.' : ' Current care protocols appear effective.'}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">Priority</Badge>
            <p className="text-sm">
              Focus on the <strong>{summary.high_risk_count} high-risk patients</strong> for immediate intervention. 
              Consider medication adherence support, lifestyle counseling, and increased monitoring frequency.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">Follow-up</Badge>
            <p className="text-sm">
              Schedule follow-up assessments within <strong>2-4 weeks</strong> for high-risk patients and 
              <strong>6-8 weeks</strong> for medium-risk patients to track intervention effectiveness.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}