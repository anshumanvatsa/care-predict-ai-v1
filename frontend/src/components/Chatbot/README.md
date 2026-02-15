# CareBot - Medical AI Chat Assistant

A production-ready chatbot component for healthcare risk prediction applications. Provides first-aid guidance, patient context awareness, and emergency detection.

## Features

- 🏥 **Medical Focus**: Health and body-related query handling
- 📊 **Risk Awareness**: Dynamic avatar colors based on patient risk levels
- 🚨 **Emergency Detection**: Automatic alerts for high-risk scenarios
- 🌐 **Bilingual**: English/Hinglish language toggle
- 💾 **Persistence**: localStorage chat history with privacy controls
- 🎯 **Context Aware**: Integrates with CSV upload predictions
- ♿ **Accessible**: Keyboard navigation, ARIA labels, color contrast compliant

## Quick Start

### 1. Install Dependencies

The component uses existing shadcn/ui components. No additional dependencies needed.

### 2. Add to Your App

```tsx
import Chatbot from '@/components/Chatbot/Chatbot';

function App() {
  return (
    <div>
      {/* Your existing app */}
      <Chatbot />
    </div>
  );
}
```

### 3. Set Up Server Proxy

Create a serverless function or API endpoint using the template in `src/lib/gemini-proxy-example.js`.

**Environment Variables Required:**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### 4. Deploy Server Proxy

**Vercel Function:**
```bash
# Create api/chat.js in your project root
cp src/lib/gemini-proxy-example.js api/chat.js
vercel env add GEMINI_API_KEY
vercel deploy
```

**Express Server:**
```javascript
import express from 'express';
import chatHandler from './src/lib/gemini-proxy-example.js';

const app = express();
app.use('/api/chat', chatHandler);
app.listen(3001);
```

## Integration with Prediction Results

After your CSV upload and risk prediction completes:

```tsx
import { integrateChatbotWithPrediction } from '@/components/Chatbot/integration-example';

// In your prediction completion handler:
const handlePredictionComplete = (results, patients) => {
  // Send first patient's context to chatbot
  integrateChatbotWithPrediction(results, patients, 0);
  
  // Or let user select patient:
  // integrateChatbotWithPrediction(results, patients, selectedIndex);
};
```

## API Reference

### Chatbot Component Props

```tsx
interface ChatbotProps {
  className?: string; // Additional CSS classes
}
```

### Global API Methods

```tsx
// Access via window.ChatbotAPI after component mounts
window.ChatbotAPI.addContext({
  patientSnapshot: {
    patient_id: \"P001\",
    age: 65,
    sex: \"M\", 
    bmi: 28.5,
    // ... other patient data
  },
  riskScores: {
    diabetes_90d_deterioration: 0.85,
    heart_failure_90d_deterioration: 0.45,
    // ... other risk scores
  },
  summary: \"Male, 65, High diabetes risk\"
});
```

### Risk Score Thresholds

- **High Risk** (Red): ≥ 0.7 (70%)
- **Medium Risk** (Orange): 0.3 - 0.69 (30-69%)
- **Low Risk** (Green): < 0.3 (30%)

### Emergency Detection

Automatically triggers for:
- Any risk score ≥ 0.9 (90%)
- Keywords: \"chest pain\", \"severe shortness of breath\", \"fainting\", \"passing out\", \"unconscious\", \"severe bleeding\", \"sudden weakness\", \"slurred speech\"

## Privacy & Security

### Data Handling
- Patient data sent to server for AI processing only
- Chat history stored in localStorage (client-side)
- No permanent server-side storage of PHI
- Privacy consent required before context sharing

### Security Best Practices
- Server-side Gemini API calls only (never expose keys to frontend)
- Input sanitization on server
- Rate limiting recommended
- CORS configuration for production domains

## Customization

### Theming
Uses existing design system from `src/index.css`:
- `--success`: Low risk (green)
- `--warning`: Medium risk (orange) 
- `--destructive`: High risk (red)
- `--primary`: Default state (teal)

### Language Support
Toggle between English and Hinglish (Hindi + English mix). Server receives language preference and adjusts Gemini responses accordingly.

### Quick Replies
Default quick replies when patient context available:
- \"Show my risk factors\"
- \"What should I do now?\"
- \"How can I improve?\"

Customize in `QUICK_REPLIES` constant in `Chatbot.tsx`.

## Testing

### Unit Tests
```bash
npm test src/components/Chatbot/
```

### Manual Testing Checklist
- [ ] Chat opens/closes correctly
- [ ] Pre-CSV checklist appears once
- [ ] Post-CSV context integration works
- [ ] Emergency alerts trigger appropriately
- [ ] Language toggle functions
- [ ] localStorage persistence works
- [ ] Responsive design on mobile/desktop
- [ ] Keyboard accessibility
- [ ] Dark mode compatibility

### Test Scenarios

**Emergency Detection:**
```
User input: \"I have severe chest pain\"
Expected: Emergency banner shows, emergency services prompt
```

**Risk Integration:**
```
Send high-risk patient context (score > 0.7)
Expected: Red avatar, context summary shows, emergency alert if score > 0.9
```

## Troubleshooting

### Common Issues

**Chatbot not appearing:**
- Check z-index conflicts (component uses z-50)
- Verify Tailwind classes are loaded
- Check console for React errors

**Context integration not working:**
- Ensure Chatbot component is mounted before calling `addContext`
- Check `window.ChatbotAPI` is available
- Verify patient data structure matches expected format

**Server proxy errors:**
- Check GEMINI_API_KEY environment variable
- Verify CORS settings for your domain
- Check network tab for API call failures
- Ensure endpoint is deployed and accessible

**Emergency detection not triggering:**
- Check risk score values (should be 0-1 range, not percentages)
- Verify emergency keywords are exact matches
- Check browser console for JavaScript errors

### Debug Mode

Add to localStorage for debug logging:
```javascript
localStorage.setItem('carebot_debug', 'true');
```

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Server proxy deployed and tested
- [ ] CORS settings updated for production domain
- [ ] Privacy consent flow implemented
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Accessibility testing completed

### Performance Optimization
- Component loads lazily when first opened
- Chat history limited to 200 messages
- localStorage cleanup for old data
- Message truncation for API calls (last 10 messages)

## Support

For issues related to:
- **Gemini API**: Check Google AI Studio documentation
- **Component Integration**: See `integration-example.ts`
- **Styling**: Refer to existing design system in `index.css`
- **Privacy Compliance**: Review data handling in `store.ts`
