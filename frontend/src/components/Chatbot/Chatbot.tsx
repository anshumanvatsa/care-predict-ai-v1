import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  Globe2,
  AlertTriangle,
  Phone,
  MapPin,
  Download,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { chatStore, type Message, type PatientContext } from './store';
import { cn } from '@/lib/utils';

interface RiskScores {
  diabetes_90d_deterioration?: number;
  obesity_90d_deterioration?: number;
  heart_failure_90d_deterioration?: number;
  kidney_failure_90d_deterioration?: number;
}

interface ChatbotProps {
  className?: string;
}

type Language = 'english' | 'hinglish';
type RiskLevel = 'low' | 'medium' | 'high';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'severe shortness of breath', 'fainting', 'passing out',
  'unconscious', 'severe bleeding', 'sudden weakness', 'slurred speech'
];

const QUICK_REPLIES = [
  "Show my risk factors",
  "What should I do now?", 
  "How can I improve?"
];

export const Chatbot: React.FC<ChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('english');
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [hasShownChecklist, setHasShownChecklist] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat state from localStorage on mount
  useEffect(() => {
    const stored = chatStore.loadChat();
    if (stored) {
      setMessages(stored.messages);
      setPatientContext(stored.patientContext);
      setLanguage(stored.language);
      setHasShownChecklist(stored.hasShownChecklist);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show initial checklist when chat opens for first time
  useEffect(() => {
    if (isOpen && !hasShownChecklist && messages.length === 0) {
      showInitialChecklist();
    }
  }, [isOpen, hasShownChecklist, messages.length]);

  // Save to localStorage when state changes
  useEffect(() => {
    chatStore.saveChat({
      messages,
      patientContext,
      language,
      hasShownChecklist,
      lastUpdated: new Date().toISOString()
    });
  }, [messages, patientContext, language, hasShownChecklist]);

  const showInitialChecklist = () => {
    const checklistMessage: Message = {
      id: Date.now().toString(),
      role: 'bot',
      content: `Hi! To get personalised health predictions, please upload a CSV file containing these kinds of information:
      
• **Personal Information:** Name, Age, Gender, Location  
• **Biometrics:** Blood pressure, Glucose level, Heart rate, Weight, BMI  
• **Medical History:** Existing conditions, Past treatments, Allergies  
• **Medications:** Names, Dosages, Frequency, Side effects  
• **Lifestyle:** Exercise routines, Sleep patterns, Diet habits, Stress levels  
• **Activity Data (Optional):** Step count, Calories burned, Wearable device inputs  
• **Environmental Factors (Optional):** Seasonal allergies, Air quality, etc.

Once you upload a CSV with these details, I can generate risk predictions and give you first-aid tips.`,
      timestamp: new Date().toISOString(),
      isSystemMessage: true
    };
    
    setMessages([checklistMessage]);
    setHasShownChecklist(true);
  };

  const getRiskLevel = (riskScores?: RiskScores): RiskLevel => {
    if (!riskScores) return 'low';
    
    const scores = Object.values(riskScores);
    const maxRisk = Math.max(...scores);
    
    if (maxRisk >= 0.7) return 'high';
    if (maxRisk >= 0.3) return 'medium';
    return 'low';
  };

  const getAvatarColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning'; 
      case 'low': return 'bg-success';
      default: return 'bg-primary';
    }
  };

  const detectEmergency = (message: string, riskScores?: RiskScores): boolean => {
    // Check for high risk scores
    if (riskScores) {
      const hasHighRisk = Object.values(riskScores).some(score => score >= 0.9);
      if (hasHighRisk) return true;
    }
    
    // Check for emergency keywords
    const lowerMessage = message.toLowerCase();
    return EMERGENCY_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
  };

  const addContext = (context: {
    patientSnapshot: any;
    riskScores: RiskScores;
    summary?: string;
  }) => {
    const newContext: PatientContext = {
      patientSnapshot: context.patientSnapshot,
      riskScores: context.riskScores,
      summary: context.summary || `Patient ${context.patientSnapshot?.patient_id || 'Unknown'}`,
      addedAt: new Date().toISOString()
    };
    
    setPatientContext(newContext);
    
    // Add system message about context
    const contextMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `Patient snapshot imported — ${newContext.summary}`,
      timestamp: new Date().toISOString(),
      isSystemMessage: true
    };
    
    setMessages(prev => [...prev, contextMessage]);
    
    // Check for emergency in new context
    if (detectEmergency('', context.riskScores)) {
      setShowEmergency(true);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Check if user message contains emergency keywords
    const isEmergency = detectEmergency(content, patientContext?.riskScores);
    if (isEmergency) {
      setShowEmergency(true);
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to Gemini proxy (mock for now)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-10), // Last 10 messages for context
          patientSnapshot: patientContext?.patientSnapshot,
          riskScores: patientContext?.riskScores,
          language
        })
      });
      
      let botReply = "I'm here to help with health and medical questions. Please ask about health-related topics.";
      let emergency = false;
      
      if (response.ok) {
        const data = await response.json();
        botReply = data.reply || botReply;
        emergency = data.emergency || false;
      } else {
        // Fallback response
        if (!patientContext) {
          // Pre-CSV mode - only health topics
          const isHealthRelated = content.toLowerCase().match(/(health|medical|body|pain|symptoms|medicine|doctor|heart|blood|pressure|diabetes|exercise|diet|sleep)/);
          if (!isHealthRelated) {
            botReply = "Please stay on medical or body-health related topics so I can help you best.";
          } else {
            botReply = "I can help with general health information, but for personalized insights, please upload your CSV data first.";
          }
        } else {
          botReply = "Sorry, I couldn't generate a response right now. Try again in a moment.";
        }
      }
      
      // Add disclaimer to every bot message
      botReply += "\n\nI may be wrong — always consult a doctor for confirmation.";
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botReply,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      if (emergency) {
        setShowEmergency(true);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Sorry, I couldn't generate a response right now. Try again in a moment.\n\nI may be wrong — always consult a doctor for confirmation.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const copySession = () => {
    const summary = `Patient: ${patientContext?.summary || 'No context'}\nMessages: ${messages.length}\nLast updated: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(summary);
  };

  const exportChat = () => {
    const chatData = {
      messages: messages.slice(-20), // Last 20 messages
      patientContext,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.json';
    a.click();
  };

  const riskLevel = getRiskLevel(patientContext?.riskScores);
  const avatarColor = getAvatarColor(riskLevel);

  // Expose addContext method globally for integration
  React.useEffect(() => {
    (window as any).ChatbotAPI = { addContext };
  }, []);

  const formatRiskScore = (score: number) => `${(score * 100).toFixed(1)}%`;

  const renderRiskBars = (riskScores: RiskScores) => {
    return Object.entries(riskScores).map(([condition, score]) => {
      const percentage = score * 100;
      const riskLevel = score >= 0.7 ? 'high' : score >= 0.3 ? 'medium' : 'low';
      const colorClass = riskLevel === 'high' ? 'bg-destructive' : 
                        riskLevel === 'medium' ? 'bg-warning' : 'bg-success';
      
      return (
        <div key={condition} className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="capitalize">{condition.replace(/_/g, ' ').replace(' 90d deterioration', '')}</span>
            <span className={`font-medium ${riskLevel === 'high' ? 'text-destructive' : riskLevel === 'medium' ? 'text-warning' : 'text-success'}`}>
              {formatRiskScore(score)}
            </span>
          </div>
          <Progress value={percentage} className={`h-2 ${colorClass}`} />
        </div>
      );
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50",
          avatarColor,
          "hover:scale-110 transition-all duration-200",
          className
        )}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-[30%] max-w-md min-w-80 h-[80vh] max-h-[600px] shadow-2xl z-50 flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", avatarColor)}>
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold">CareBot</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'english' ? 'hinglish' : 'english')}
            aria-label="Toggle language"
          >
            <Globe2 className="w-4 h-4" />
            <span className="ml-1 text-xs">{language === 'english' ? 'EN' : 'HI'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Patient Context Summary */}
      {patientContext && (
        <div className="px-4 py-2 bg-secondary/50 border-b">
          <Badge variant="outline" className="text-xs">
            You're chatting about: {patientContext.summary}
          </Badge>
        </div>
      )}

      {/* Emergency Alert */}
      {showEmergency && (
        <Alert className="m-4 border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            🚨 Call emergency services immediately. If you are in India, dial 112 (or local emergency number).
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="destructive" asChild>
                <a href="tel:112">Call Emergency</a>
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Find Hospital
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={cn(
            "flex",
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}>
            <div className={cn(
              "max-w-[80%] p-3 rounded-lg text-sm",
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : message.isSystemMessage
                  ? 'bg-muted text-muted-foreground border'
                  : 'bg-card border'
            )}>
              {message.role === 'bot' && message.content.includes('risk') && patientContext?.riskScores && (
                <div className="mb-3">
                  {renderRiskBars(patientContext.riskScores)}
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {patientContext && (
        <div className="px-4 py-2 border-t border-b">
          <div className="flex gap-2 flex-wrap">
            {QUICK_REPLIES.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="text-xs"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copySession}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy Summary
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)}
            placeholder="Ask about health or medical topics..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="px-2"
            aria-label="Voice input (coming soon)"
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {patientContext && (
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(patientContext.addedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/50 p-2 text-center border-t">
        <p className="text-xs text-muted-foreground">
          I may be wrong — always consult a doctor for confirmation.
        </p>
      </div>
    </Card>
  );
};

// Export for global access
export default Chatbot;