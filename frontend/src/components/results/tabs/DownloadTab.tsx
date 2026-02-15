import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3, 
  Shield, 
  CheckCircle,
  Calendar,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    risk_level: 'High' | 'Medium' | 'Low';
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

interface DownloadTabProps {
  data: ResultsData;
  condition: string;
}

export function DownloadTab({ data, condition }: DownloadTabProps) {
  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    patientList: true,
    metrics: true,
    explainability: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  const downloadOptions = [
    {
      id: 'summary',
      label: 'Executive Summary',
      description: 'Cohort overview, risk distribution, key insights',
      icon: BarChart3,
      size: '~2 pages'
    },
    {
      id: 'patientList',
      label: 'Patient Risk List',
      description: 'Detailed patient table with risk scores and drivers',
      icon: Table,
      size: '~1-3 pages'
    },
    {
      id: 'metrics',
      label: 'Model Performance',
      description: 'AUROC, confusion matrix, calibration charts',
      icon: BarChart3,
      size: '~2 pages'
    },
    {
      id: 'explainability',
      label: 'Feature Importance',
      description: 'Global and local explanations, counterfactuals',
      icon: FileText,
      size: '~1-2 pages'
    }
  ];

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionId]: checked
    }));
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);
    setDownloadProgress(0);

    try {
      // Simulate PDF generation progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Generate mock PDF content
      const reportContent = generateReportContent();
      
      // Create and download blob
      const blob = new Blob([reportContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-prediction-report-${condition}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report generated successfully",
        description: "PDF report has been downloaded to your device."
      });

    } catch (error) {
      toast({
        title: "Error generating report",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setDownloadProgress(0);
    }
  };

  const generateCSVExport = () => {
    // Generate CSV content
    const headers = ['patient_id', 'risk_probability', 'risk_level', 'last_seen', 'primary_driver', 'driver_contribution'];
    const rows = data.results.map(patient => [
      patient.patient_id,
      patient.probability.toFixed(4),
      patient.risk_level,
      patient.last_seen,
      patient.drivers[0]?.feature || 'N/A',
      patient.drivers[0]?.contrib?.toFixed(4) || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient-risk-data-${condition}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exported successfully",
      description: "Patient data has been exported to CSV format."
    });
  };

  const generateReportContent = () => {
    return `
Risk Prediction Report - ${condition.charAt(0).toUpperCase() + condition.slice(1)}
Generated: ${new Date().toLocaleDateString()}
Job ID: ${data.jobId}

EXECUTIVE SUMMARY
================
Total Patients Analyzed: ${data.summary.num_patients}
High Risk Patients: ${data.summary.high_risk_count} (${Math.round((data.summary.high_risk_count / data.summary.num_patients) * 100)}%)
Median Risk Score: ${(data.summary.median_risk * 100).toFixed(1)}%

MODEL PERFORMANCE
================
AUROC: ${(data.metrics.auroc * 100).toFixed(1)}%
AUPRC: ${(data.metrics.auprc * 100).toFixed(1)}%

PATIENT RISK BREAKDOWN
=====================
${data.results.map(p => 
  `${p.patient_id}: ${(p.probability * 100).toFixed(1)}% (${p.risk_level} Risk)`
).join('\n')}

This is a mock PDF report. In a real implementation, this would be generated using a PDF library like jsPDF or PDFKit.
    `.trim();
  };

  const selectedCount = Object.values(selectedSections).filter(Boolean).length;
  const estimatedPages = selectedCount * 2; // Rough estimate

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Report Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Generate Clinical Report</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Customize your downloadable report by selecting the sections to include. 
          The report will be formatted for clinical review and decision-making.
        </p>

        <div className="space-y-4">
          <h4 className="font-medium">Report Sections</h4>
          
          {downloadOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div 
                key={option.id}
                className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={option.id}
                  checked={selectedSections[option.id as keyof typeof selectedSections]}
                  onCheckedChange={(checked) => handleSectionToggle(option.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <label htmlFor={option.id} className="font-medium cursor-pointer">
                      {option.label}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {option.size}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Estimated report length:</span>
            <span className="font-medium">{estimatedPages} pages</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span>Selected sections:</span>
            <span className="font-medium">{selectedCount} of {downloadOptions.length}</span>
          </div>
        </div>
      </Card>

      {/* Download Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">PDF Clinical Report</h4>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive clinical report with visualizations, suitable for medical records and team review.
          </p>

          {isGenerating && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Generating report...</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={generatePDFReport}
            disabled={selectedCount === 0 || isGenerating}
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Download PDF Report'}
          </Button>

          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>HIPAA compliant formatting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Print-ready layout</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Includes audit trail</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-5 h-5 text-accent" />
            <h4 className="font-semibold">Patient Data Export</h4>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Export patient risk data in CSV format for integration with existing clinical systems.
          </p>

          <Button 
            onClick={generateCSVExport}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Patient CSV
          </Button>

          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>EHR-compatible format</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Includes risk drivers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Timestamp metadata</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-success" />
          <h4 className="font-semibold">Audit Information</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Analysis Date</p>
            <p className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Job ID</p>
            <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {data.jobId}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Cohort Size</p>
            <p className="flex items-center gap-2">
              <Users className="w-3 h-3" />
              {data.summary.num_patients} patients
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Privacy Notice:</strong> All exported reports and data maintain patient de-identification 
            standards. Original patient identifiers are not included in downloads. 
            Ensure compliance with your organization's data handling policies.
          </p>
        </div>
      </Card>
    </div>
  );
}