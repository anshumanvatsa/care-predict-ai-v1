import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, X } from "lucide-react";

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration?: number;
}

interface ProcessingOverlayProps {
  isProcessing: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const processingSteps: Omit<ProcessingStep, 'status'>[] = [
  { id: 'validate', label: 'Validating file structure and format', duration: 1000 },
  { id: 'parse', label: 'Parsing time-series data and patient records', duration: 1500 },
  { id: 'features', label: 'Feature extraction and data preprocessing', duration: 2000 },
  { id: 'model', label: 'Running AI risk prediction model', duration: 2500 },
  { id: 'results', label: 'Preparing results and generating insights', duration: 1000 }
];

export function ProcessingOverlay({ isProcessing, onComplete, onCancel }: ProcessingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>(
    processingSteps.map(step => ({ ...step, status: 'pending' }))
  );

  useEffect(() => {
    if (!isProcessing) {
      // Reset state when not processing
      setCurrentStepIndex(0);
      setProgress(0);
      setSteps(processingSteps.map(step => ({ ...step, status: 'pending' })));
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let stepTimeouts: NodeJS.Timeout[] = [];

    const processSteps = async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        // Update current step to processing
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx === i ? 'processing' : idx < i ? 'completed' : 'pending'
        })));
        
        setCurrentStepIndex(i);

        // Simulate step duration
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, processingSteps[i].duration);
          stepTimeouts.push(timeoutId);
        });

        // Update progress
        const newProgress = ((i + 1) / processingSteps.length) * 100;
        setProgress(newProgress);

        // Mark step as completed
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx <= i ? 'completed' : 'pending'
        })));
      }

      // Complete processing after a short delay
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    processSteps();

    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      stepTimeouts.forEach(clearTimeout);
    };
  }, [isProcessing, onComplete]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Processing Dataset</h2>
          <p className="text-muted-foreground">
            Feature extraction & model run in progress...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.status === 'processing' ? 'bg-primary/5 border border-primary/20' :
                step.status === 'completed' ? 'bg-success/5' : 'bg-muted/30'
              }`}
            >
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : step.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  step.status === 'processing' ? 'text-primary' :
                  step.status === 'completed' ? 'text-success' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                {step.status === 'processing' && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-xs text-primary">Processing...</span>
                  </div>
                )}
              </div>

              {step.status === 'completed' && (
                <div className="text-xs text-success font-medium">
                  ✓ Complete
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            This may take 30-60 seconds depending on dataset size
          </p>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            size="sm"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}