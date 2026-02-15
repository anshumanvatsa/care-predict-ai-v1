// Type definitions for Chatbot global API

export interface RiskScores {
  diabetes_90d_deterioration?: number;
  obesity_90d_deterioration?: number;
  heart_failure_90d_deterioration?: number;
  kidney_failure_90d_deterioration?: number;
}

export interface PatientSnapshot {
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

export interface ChatbotContextData {
  patientSnapshot: PatientSnapshot;
  riskScores: RiskScores;
  summary?: string;
}

export interface ChatbotGlobalAPI {
  addContext: (data: ChatbotContextData) => void;
}

// Extend Window interface for global ChatbotAPI
declare global {
  interface Window {
    ChatbotAPI?: ChatbotGlobalAPI;
  }
}