# Changelog

## [2.0.0] - 2024-01-08

### 🚀 Major Features Added
- **Dark/Light Theme Toggle**: Added persistent theme switching with system preference detection
- **Supabase Authentication**: Integrated user authentication with fallback mock mode
- **Enhanced Risk Visualization**: New component for displaying multi-condition risk predictions
- **Contact Sales Integration**: Added mailto functionality with pre-filled inquiry templates

### 🎨 UI/UX Improvements
- **Removed Lovable Branding**: Completely removed all Lovable references and branding
- **Fixed Results Modal**: Removed duplicate close buttons, fixed scrolling issues
- **Removed Explainability Tab**: Streamlined modal to 4 tabs (Summary, Patients, Metrics, Download)
- **Updated Metrics Tab**: Removed confusion matrix, added threshold analysis
- **Smooth Scroll Animation**: Added animated scroll to upload section with highlight pulse
- **Footer Component**: Added comprehensive site footer with links and social media

### 📊 Data & Backend
- **Updated CSV Schema**: Enhanced with 60+ medical columns for comprehensive patient data
- **New Sample Data**: Created demo.csv with realistic multi-patient dataset
- **Backend Response Format**: Updated to handle multi-condition risk predictions
- **Performance Optimizations**: Improved data processing and visualization rendering

### 🔧 Technical Improvements
- **Vercel Deployment**: Added vercel.json with SPA routing and security headers
- **Environment Variables**: Added Supabase configuration with fallback modes
- **Component Refactoring**: Split large components into focused, reusable modules
- **TypeScript Enhancements**: Improved type safety and interface definitions

### 🏥 Healthcare Features
- **Multi-Condition Prediction**: Support for diabetes, obesity, heart failure, kidney failure
- **Risk Color Coding**: Consistent green/yellow/red severity indicators
- **Clinical Terminology**: Healthcare-professional friendly language and explanations
- **Responsive Design**: Optimized for clinical workflows on various devices

### 📝 Documentation
- **Updated README**: Comprehensive setup, deployment, and API documentation
- **Environment Setup**: Clear instructions for Supabase integration
- **Sample Data Guide**: Detailed CSV column specifications and requirements

### 🛠️ Developer Experience
- **Build Optimizations**: Improved Vite configuration for production deployments
- **Code Organization**: Better component structure and separation of concerns
- **Accessibility**: Enhanced keyboard navigation and screen reader support

### Breaking Changes
- Removed ExplainabilityTab component (functionality streamlined)
- Updated ResultsData interface to support new backend format
- Changed CSV validation to require new column schema

### Migration Guide
- Update any custom CSV files to include new required columns
- Remove references to explainability features if customized
- Update environment variables for Supabase integration