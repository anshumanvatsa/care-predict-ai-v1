// Example integration of Chatbot with your prediction results
// Use this code in your main app after CSV upload and risk prediction completes

interface PredictionResult {
  diabetes_90d_deterioration: number;
  obesity_90d_deterioration: number;
  heart_failure_90d_deterioration: number;
  kidney_failure_90d_deterioration: number;
}

interface PatientRow {
  patient_id: string;
  age?: number;
  sex?: string;
  bmi?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  glucose?: number;
  weight_kg?: number;
  [key: string]: any;
}

/**
 * Call this function after your risk prediction completes
 * to send patient context to the chatbot
 */
export const integrateChatbotWithPrediction = (
  predictionResults: PredictionResult[],
  patientData: PatientRow[],
  selectedPatientIndex: number = 0
) => {
  // Get the selected patient's data and risk scores
  const selectedPatient = patientData[selectedPatientIndex];
  const selectedRiskScores = predictionResults[selectedPatientIndex];
  
  if (!selectedPatient || !selectedRiskScores) {
    console.warn('No patient data or risk scores available for chatbot integration');
    return;
  }

  // Create patient snapshot with only essential fields (no PHI logging)
  const patientSnapshot = {
    patient_id: selectedPatient.patient_id,
    age: selectedPatient.age,
    sex: selectedPatient.sex,
    bmi: selectedPatient.bmi,
    systolic_bp: selectedPatient.systolic_bp,
    diastolic_bp: selectedPatient.diastolic_bp,
    heart_rate: selectedPatient.heart_rate,
    glucose: selectedPatient.glucose,
    weight_kg: selectedPatient.weight_kg
  };

  // Find highest risk condition for summary
  const riskEntries = Object.entries(selectedRiskScores);
  const highestRisk = riskEntries.reduce((max, [condition, score]) => {
    return score > max.score ? { condition, score } : max;
  }, { condition: '', score: 0 });

  const riskPercentage = (highestRisk.score * 100).toFixed(1);
  const conditionName = highestRisk.condition.replace(/_90d_deterioration/g, '').replace(/_/g, ' ');
  
  const summary = `${selectedPatient.sex || 'Patient'}, ${selectedPatient.age || 'Unknown age'}, Top risk: ${conditionName} ${riskPercentage}%`;

  // Send to chatbot via global API
  if (typeof window !== 'undefined' && (window as any).ChatbotAPI) {
    (window as any).ChatbotAPI.addContext({
      patientSnapshot,
      riskScores: selectedRiskScores,
      summary
    });
    
    console.log('Patient context sent to chatbot:', {
      patientId: selectedPatient.patient_id,
      riskSummary: summary
    });
  } else {
    console.warn('Chatbot API not available. Make sure Chatbot component is mounted.');
  }
};

/**
 * Example usage in your ResultsModal or prediction completion handler:
 */
export const exampleUsage = () => {
  /*
  // After your API call completes and you have results:
  const handlePredictionComplete = (results: PredictionResult[], patients: PatientRow[]) => {
    // Your existing results processing...
    
    // Integrate with chatbot for the first (or selected) patient
    integrateChatbotWithPrediction(results, patients, 0);
    
    // Or let user select which patient to chat about:
    // integrateChatbotWithPrediction(results, patients, selectedIndex);
  };
  */
};

/**
 * Privacy consent check before sending data to chatbot
 */
export const checkPrivacyConsent = (): boolean => {
  // Check if user has consented to data sharing
  const consent = localStorage.getItem('carebot_privacy_consent');
  
  if (consent !== 'true') {
    // Show privacy consent dialog
    const userConsent = confirm(
      'To provide personalized health guidance, the chatbot needs access to your uploaded patient data. ' +
      'This data will be processed securely and not stored permanently. ' +
      'Do you consent to share this de-identified data with the AI assistant?'
    );
    
    if (userConsent) {
      localStorage.setItem('carebot_privacy_consent', 'true');
      return true;
    } else {
      return false;
    }
  }
  
  return true;
};

/**
 * Wrapper function with privacy consent
 */
export const safeIntegrateChatbot = (
  predictionResults: PredictionResult[],
  patientData: PatientRow[],
  selectedPatientIndex: number = 0
) => {
  if (checkPrivacyConsent()) {
    integrateChatbotWithPrediction(predictionResults, patientData, selectedPatientIndex);
  } else {
    console.log('User declined chatbot data sharing consent');
  }
};