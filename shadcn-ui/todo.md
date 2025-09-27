EnergySage - AI-Powered Energy Consumption Analyzer & Optimizer
MVP Implementation Plan
Core Files to Create:
Frontend (React/TypeScript)
src/pages/Landing.tsx - Landing page with Household/Industry mode selection
src/pages/Dashboard.tsx - Main dashboard with charts and analytics
src/pages/Auth.tsx - Login/Register page
src/components/FileUpload.tsx - CSV upload component
src/components/Charts/TimeSeriesChart.tsx - Energy consumption line chart
src/components/Charts/BreakdownChart.tsx - Device/machine breakdown pie chart
src/components/ForecastChart.tsx - Prediction visualization
src/components/RecommendationsCard.tsx - AI recommendations display
src/components/SimulationControls.tsx - Real-time simulation controls
src/lib/api.ts - API client functions
Backend Structure (Reference for frontend integration)
FastAPI backend with ML models
MongoDB for user data, PostgreSQL for time-series
Prophet forecasting, Isolation Forest anomaly detection
WebSocket for real-time simulation
Sample Data
public/data/household_sample.csv - Sample household energy data
public/data/industry_sample.csv - Sample industrial energy data
Implementation Priority:
Landing page and navigation
Authentication flow
File upload and data visualization
Dashboard with charts (mock ML data initially)
Recommendations system
Simulation controls
Key Features:
Responsive design with Tailwind CSS
Interactive charts with Recharts
Real-time data simulation
Cost & CO₂ calculations
Anomaly detection visualization
Actionable recommendations with quantified savings
