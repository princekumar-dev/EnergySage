import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Leaf, 
  Settings,
  LogOut,
  Home,
  Factory,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Loader2,
  Activity,
  TestTube2
} from 'lucide-react';

import FileUpload from '@/components/FileUpload';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import BreakdownChart from '@/components/charts/BreakdownChart';
import RecommendationsCard from '@/components/RecommendationsCard';
import SimulationControls from '@/components/SimulationControls';
import EnergyScoreCard from '@/components/EnergyScoreCard';
import SmartAlerts from '@/components/SmartAlerts';
import PredictiveMaintenanceCard from '@/components/PredictiveMaintenanceCard';
import BenchmarkCard from '@/components/BenchmarkCard';
import ApplianceImport from '@/components/ApplianceImport';
import TimeBasedAnalysis from '@/components/TimeBasedAnalysis';
import GridAwareness from '@/components/GridAwareness';
import GridNotifications from '@/components/GridNotifications';

import { api, EnergyReading, Prediction, Anomaly, Recommendation, CostData, User, ImportedApplianceData, testAllApiFunctions, SimulationWebSocket } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<EnergyReading[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [appliancesImported, setAppliancesImported] = useState(false);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('US');
  const [forecastHorizon, setForecastHorizon] = useState(7);
  
  // Persistent simulation state
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationConnected, setSimulationConnected] = useState(false);
  const [simulationDataCount, setSimulationDataCount] = useState(0);
  const [lastSimulationData, setLastSimulationData] = useState<EnergyReading | null>(null);
  const [simulationWs, setSimulationWs] = useState<any>(null);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('energySageUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    // Load initial data when user is available
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedLocation, forecastHorizon]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      console.log('🔄 Loading dashboard data...', { user: user.mode, location: selectedLocation });
      
      // Load time series data with extended range for better insights
      const timeSeries = await api.getTimeSeries(
        sevenDaysAgo.toISOString(),
        now.toISOString(),
        user.mode || 'household'
      );
      setTimeSeriesData(timeSeries);
      console.log('📊 Time series loaded:', timeSeries.length, 'readings');

      // Load predictions
      const predictions = await api.getPredictions(forecastHorizon);
      setPredictions(predictions);
      console.log('🔮 Predictions loaded:', predictions.length, 'forecasts');

      // Load anomalies
      const anomalies = await api.getAnomalies(
        sevenDaysAgo.toISOString(),
        now.toISOString()
      );
      setAnomalies(anomalies);
      console.log('⚠️ Anomalies loaded:', anomalies.length, 'detected');

      // Load recommendations with location for accurate pricing
      const recommendations = await api.getRecommendations(selectedLocation);
      setRecommendations(recommendations);
      console.log('💡 Recommendations loaded:', recommendations.length, 'suggestions');

      // Load cost data
      const costData = await api.getCostData(selectedLocation);
      setCostData(costData);
      console.log('💰 Cost data loaded for', selectedLocation);

      // Check if we have appliances imported
      const importedAppliances = await api.getImportedAppliances();
      setAppliancesImported(importedAppliances.length > 0);
      console.log('🏠 Appliances imported:', importedAppliances.length, 'devices');

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      // Don't throw the error to prevent UI crashes
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (result: { message: string; records_processed: number }) => {
    // Reload dashboard data after successful upload
    await loadDashboardData();
  };

  const handleSimulationData = (data: EnergyReading) => {
    setTimeSeriesData(prev => {
      const newData = [...prev, data];
      // Keep last 200 points for optimal performance
      return newData.length > 200 ? newData.slice(-200) : newData;
    });
    setLastSimulationData(data);
    setSimulationDataCount(prev => prev + 1);
  };

  // Persistent simulation controls
  const startPersistentSimulation = async () => {
    try {
      console.log('🚀 Starting persistent simulation...');
      await api.startSimulation();
      
      // Create WebSocket connection that persists across tab changes
      const websocket = new SimulationWebSocket();
      websocket.onData((data: EnergyReading) => {
        handleSimulationData(data);
      });
      
      websocket.connect();
      setSimulationWs(websocket);
      setSimulationRunning(true);
      setSimulationConnected(true);
      
      console.log('✅ Persistent simulation started successfully');
    } catch (error) {
      console.error('❌ Failed to start persistent simulation:', error);
    }
  };

  const stopPersistentSimulation = async () => {
    try {
      console.log('⏹️ Stopping persistent simulation...');
      await api.stopSimulation();
      
      // Ensure WebSocket is properly disconnected
      if (simulationWs) {
        simulationWs.disconnect();
        setSimulationWs(null);
      }
      
      // Reset simulation state
      setSimulationRunning(false);
      setSimulationConnected(false);
      
      console.log('✅ Persistent simulation stopped successfully');
    } catch (error) {
      console.error('❌ Failed to stop persistent simulation:', error);
    }
  };

  // Cleanup simulation on component unmount
  useEffect(() => {
    return () => {
      if (simulationWs) {
        console.log('🧹 Cleaning up persistent simulation on Dashboard unmount...');
        simulationWs.disconnect();
      }
    };
  }, [simulationWs]);

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    const newCostData = await api.getCostData(location);
    setCostData(newCostData);
    
    // Reload recommendations with new location pricing
    const newRecommendations = await api.getRecommendations(location);
    setRecommendations(newRecommendations);
  };

  const handleForecastChange = async (horizon: string) => {
    const days = parseInt(horizon);
    setForecastHorizon(days);
    const newPredictions = await api.getPredictions(days);
    setPredictions(newPredictions);
  };

  const handleApplianceImport = async (data: ImportedApplianceData) => {
    try {
      setAppliancesImported(true);
      // Reload dashboard data to reflect appliance-based analytics
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to handle appliance import:', error);
    }
  };

  const handleLoadTestData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading comprehensive test data...');
      
      // Load the real-time test data
      const testData = await api.getRealtimeTestData();
      console.log('✅ Test data loaded:', testData.message);
      
      // Test all API functions
      const testResult = await testAllApiFunctions();
      if (testResult.success) {
        console.log('🎉 All functions working properly:', testResult.summary);
      }
      
      // Reload dashboard data to show the new test data
      await loadDashboardData();
      
      setAppliancesImported(true);
    } catch (error) {
      console.error('❌ Failed to load test data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('energySageToken');
    localStorage.removeItem('energySageUser');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium">Loading your energy dashboard...</p>
        </div>
      </div>
    );
  }

  const mode = user?.mode || 'household';
  
  // 📊 Get real cumulative consumption from latest data point
  const totalConsumption = (() => {
    if (timeSeriesData.length === 0) return 0;
    
    // If we have cumulative data from simulation, use it
    const latestReading = timeSeriesData[timeSeriesData.length - 1];
    if (latestReading && typeof latestReading.cumulativeKwh === 'number') {
      return latestReading.cumulativeKwh;
    }
    
    // Fallback: sum all readings (for non-real-time data)
    return timeSeriesData.reduce((sum, reading) => sum + reading.kwh, 0);
  })();
  
  // Enhanced average calculation for industry mode
  const getAverageConsumption = () => {
    if (timeSeriesData.length === 0) return 0;
    
    if (mode === 'industry') {
      // Industry mode: Use more sophisticated averaging for high data volumes
      const recentData = timeSeriesData.slice(-168); // Last 7 days for stability
      const recentTotal = recentData.reduce((sum, reading) => sum + reading.kwh, 0);
      const baseAverage = recentTotal / Math.max(1, recentData.length);
      
      // Apply industrial smoothing factor to reduce volatility
      const smoothingFactor = 0.92;
      return baseAverage * smoothingFactor;
    } else {
      // Household mode: Keep existing simple average
      return totalConsumption / timeSeriesData.length;
    }
  };
  
  const avgConsumption = getAverageConsumption();

  // Calculate real-time cost and carbon data from current timeSeriesData with industry-specific enhancements
  const getRealTimeCostData = () => {
    const rates: Record<string, { cost_per_kwh: number; co2_factor: number; industry_multiplier: number }> = {
      'US': { cost_per_kwh: 0.13, co2_factor: 0.92, industry_multiplier: 0.08 }, // Industrial rate $0.08/kWh
      'UK': { cost_per_kwh: 0.28, co2_factor: 0.23, industry_multiplier: 0.15 }, // Industrial rate £0.15/kWh
      'India': { cost_per_kwh: 6.5, co2_factor: 0.82, industry_multiplier: 4.2 }, // Industrial rate ₹4.2/kWh
      'Germany': { cost_per_kwh: 0.35, co2_factor: 0.34, industry_multiplier: 0.22 } // Industrial rate €0.22/kWh
    };
    
    const rateData = rates[selectedLocation] || rates['US'];
    const effectiveRate = mode === 'industry' ? rateData.industry_multiplier : rateData.cost_per_kwh;
    
    if (timeSeriesData.length === 0) {
      return { total_cost: 0, total_co2: 0 };
    }
    
    // Enhanced calculation for industry mode - more predictable patterns
    let monthlyKwh = totalConsumption;
    
    if (mode === 'industry') {
      // Industry mode: More stable, predictable calculations
      if (timeSeriesData.length > 168) { // More than a week of data
        const uniqueDates = new Set(timeSeriesData.map(r => r.timestamp.split('T')[0]));
        const numberOfDays = uniqueDates.size;
        // Use rolling average for better stability in industrial settings
        const dailyAverage = totalConsumption / numberOfDays;
        monthlyKwh = dailyAverage * 30;
        
        // Add industrial load factor for more predictable consumption
        const industrialLoadFactor = 0.85; // 85% average load factor for industry
        monthlyKwh = monthlyKwh * industrialLoadFactor;
      } else if (timeSeriesData.length > 24) {
        // Daily average with industrial stability factor
        const uniqueDates = new Set(timeSeriesData.map(r => r.timestamp.split('T')[0]));
        const numberOfDays = uniqueDates.size;
        monthlyKwh = (totalConsumption / numberOfDays) * 30 * 0.88; // Industrial consistency factor
      } else {
        // Hourly extrapolation with industrial patterns
        const hoursOfData = timeSeriesData.length;
        const hourlyAverage = totalConsumption / hoursOfData;
        // Industrial facilities typically run 20-22 hours/day
        const dailyEstimate = hourlyAverage * 22;
        monthlyKwh = dailyEstimate * 30;
      }
    } else {
      // Household mode: Keep existing logic
      if (timeSeriesData.length > 24) {
        const uniqueDates = new Set(timeSeriesData.map(r => r.timestamp.split('T')[0]));
        const numberOfDays = uniqueDates.size;
        monthlyKwh = (totalConsumption / numberOfDays) * 30;
      } else if (timeSeriesData.length > 0) {
        const hoursOfData = timeSeriesData.length;
        const dailyEstimate = (totalConsumption / hoursOfData) * 24;
        monthlyKwh = dailyEstimate * 30;
      }
    }
    
    return {
      total_cost: monthlyKwh * effectiveRate,
      total_co2: monthlyKwh * rateData.co2_factor
    };
  };

  const realTimeCostData = getRealTimeCostData();

  // Helper: check if any real data is present
  const noData = timeSeriesData.length === 0 || !costData || recommendations.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {noData && (
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-yellow-200 bg-yellow-50 mb-8">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-medium mb-1">No data available</div>
              <div className="text-sm">Please import your appliance or energy data using the <b>Upload Data</b> tab to view analytics and recommendations.</div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EnergySage
                </h1>
              </div>
              <Badge className={mode === 'household' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}>
                {mode === 'household' ? (
                  <>
                    <Home className="h-3 w-3 mr-1" />
                    Household
                  </>
                ) : (
                  <>
                    <Factory className="h-3 w-3 mr-1" />
                    Industry
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Simulation Status Indicator */}
              {simulationRunning && (
                <Badge className="bg-green-100 text-green-700 animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  Sim Active ({simulationDataCount})
                </Badge>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Location:</span>
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/test-api', '_blank')}
                className="flex items-center space-x-1"
              >
                <TestTube2 className="h-3 w-3" />
                <span>Test API</span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Key Metrics */}
        {!noData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalConsumption.toFixed(1)} kWh</div>
                <p className="text-xs text-gray-600">Last 24 hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgConsumption.toFixed(2)} kWh</div>
                <p className="text-xs text-gray-600">Per hour {simulationRunning ? '(Live)' : ''}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(realTimeCostData.total_cost, selectedLocation)}
                </div>
                <p className="text-xs text-gray-600">Monthly estimate {simulationRunning ? '(Live)' : ''}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
                <Leaf className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {realTimeCostData.total_co2.toFixed(1)} kg
                </div>
                <p className="text-xs text-gray-600">CO₂ monthly {simulationRunning ? '(Live)' : ''}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grid Notifications */}
        <GridNotifications className="mb-6" />

        {/* Anomaly Alert */}
        {anomalies.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>Energy Anomalies Detected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{anomaly.device} - {new Date(anomaly.timestamp).toLocaleString()}</span>
                    <Badge variant="destructive">
                      {anomaly.actual_kwh.toFixed(2)} kWh (expected: {anomaly.expected_kwh.toFixed(2)})
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="timebased">Time Analysis</TabsTrigger>
            <TabsTrigger value="gridaware">Grid Alerts</TabsTrigger>
            <TabsTrigger value="advanced">Advanced AI</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="simulate">Simulate</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Series Chart */}
              <TimeSeriesChart
                data={timeSeriesData}
                predictions={predictions}
                anomalies={anomalies}
                mode={mode}
              />
              
              {/* Breakdown Chart */}
              <BreakdownChart data={timeSeriesData} mode={mode} />
            </div>
            
            {/* Recommendations */}
            <RecommendationsCard recommendations={recommendations} location={selectedLocation} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Advanced Analytics</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Forecast horizon:</span>
                <Select value={forecastHorizon.toString()} onValueChange={handleForecastChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeSeriesChart
                data={timeSeriesData}
                predictions={predictions}
                anomalies={anomalies}
                mode={mode}
              />
              <BreakdownChart data={timeSeriesData} mode={mode} />
            </div>
          </TabsContent>

          {/* Time-Based Analysis */}
          <TabsContent value="timebased" className="space-y-6">
            <TimeBasedAnalysis />
          </TabsContent>

          {/* Grid Awareness */}
          <TabsContent value="gridaware" className="space-y-6">
            <GridAwareness />
          </TabsContent>

          {/* Advanced AI Features */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergyScoreCard />
              <SmartAlerts />
              <BenchmarkCard className="lg:col-span-2" />
            </div>
          </TabsContent>

          {/* Predictive Maintenance */}
          <TabsContent value="maintenance" className="space-y-6">
            <PredictiveMaintenanceCard location={selectedLocation} />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            {/* Test Data Button */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Quick Start with Test Data</span>
                </CardTitle>
                <CardDescription>
                  Load comprehensive real-time energy data with 12 appliances and 30 days of realistic consumption patterns to explore all features instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleLoadTestData} 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Load Comprehensive Test Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <ApplianceImport onImportSuccess={handleApplianceImport} />
              <FileUpload mode={mode} onUploadSuccess={handleFileUpload} />
            </div>
            
            {appliancesImported && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <div className="font-medium mb-1">Appliances imported successfully!</div>
                  <div className="text-sm">
                    AI analysis has been updated with your appliance data. Check the Advanced AI and Maintenance tabs for personalized insights.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="simulate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimulationControls 
                mode={mode} 
                onDataReceived={handleSimulationData}
                isRunning={simulationRunning}
                isConnected={simulationConnected}
                dataCount={simulationDataCount}
                lastDataPoint={lastSimulationData}
                onStart={startPersistentSimulation}
                onStop={stopPersistentSimulation}
              />
              <TimeSeriesChart
                data={timeSeriesData.slice(-50)} // Show last 50 points for real-time
                predictions={[]}
                anomalies={[]}
                mode={mode}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}