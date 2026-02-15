export interface Message {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  isSystemMessage?: boolean;
}

export interface RiskScores {
  diabetes_90d_deterioration?: number;
  obesity_90d_deterioration?: number;
  heart_failure_90d_deterioration?: number;
  kidney_failure_90d_deterioration?: number;
}

export interface PatientContext {
  patientSnapshot: any;
  riskScores: RiskScores;
  summary: string;
  addedAt: string;
}

export interface ChatState {
  messages: Message[];
  patientContext: PatientContext | null;
  language: 'english' | 'hinglish';
  hasShownChecklist: boolean;
  lastUpdated: string;
}

const STORAGE_KEY = 'carebot_chat_state';
const MAX_MESSAGES = 200;

export const chatStore = {
  saveChat(state: ChatState): void {
    try {
      // Keep only last MAX_MESSAGES to avoid localStorage bloat
      const trimmedState = {
        ...state,
        messages: state.messages.slice(-MAX_MESSAGES)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedState));
    } catch (error) {
      console.warn('Failed to save chat state:', error);
    }
  },

  loadChat(): ChatState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const state = JSON.parse(stored) as ChatState;
      
      // Validate structure
      if (!Array.isArray(state.messages)) return null;
      
      return state;
    } catch (error) {
      console.warn('Failed to load chat state:', error);
      return null;
    }
  },

  clearChat(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear chat state:', error);
    }
  },

  // Privacy helper - clears sensitive data but keeps preferences
  clearSensitiveData(): void {
    try {
      const state = this.loadChat();
      if (state) {
        const sanitized: ChatState = {
          messages: [],
          patientContext: null,
          language: state.language,
          hasShownChecklist: false,
          lastUpdated: new Date().toISOString()
        };
        this.saveChat(sanitized);
      }
    } catch (error) {
      console.warn('Failed to clear sensitive data:', error);
    }
  }
};
