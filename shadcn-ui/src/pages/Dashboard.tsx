import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Calendar
} from 'lucide-react';

import FileUpload from '@/components/FileUpload';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import BreakdownChart from '@/components/charts/BreakdownChart';
import RecommendationsCard from '@/components/RecommendationsCard';
import SimulationControls from '@/components/SimulationControls';

import { api, EnergyReading, Prediction, Anomaly, Recommendation, CostData, User } from '@/lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<EnergyReading[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('US');
  const [forecastHorizon, setForecastHorizon] = useState(7);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('energySageUser');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/auth');
      return;
    }

    // Load initial data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Load time series data
      const timeSeries = await api.getTimeSeries(
        yesterday.toISOString(),
        now.toISOString(),
        user?.mode || 'household'
      );
      setTimeSeriesData(timeSeries);

      // Load predictions
      const predictions = await api.getPredictions(forecastHorizon);
      setPredictions(predictions);

      // Load anomalies
      const anomalies = await api.getAnomalies(
        yesterday.toISOString(),
        now.toISOString()
      );
      setAnomalies(anomalies);

      // Load recommendations
      const recommendations = await api.getRecommendations();
      setRecommendations(recommendations);

      // Load cost data
      const costData = await api.getCostData(selectedLocation);
      setCostData(costData);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (result: { message: string; records_processed: number }) => {
    // Reload dashboard data after successful upload
    await loadDashboardData();
  };

  const handleSimulationData = (data: EnergyReading) => {
    setTimeSeriesData(prev => [...prev.slice(-100), data]); // Keep last 100 points
  };

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    const newCostData = await api.getCostData(location);
    setCostData(newCostData);
  };

  const handleForecastChange = async (horizon: string) => {
    const days = parseInt(horizon);
    setForecastHorizon(days);
    const newPredictions = await api.getPredictions(days);
    setPredictions(newPredictions);
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
  const totalConsumption = timeSeriesData.reduce((sum, reading) => sum + reading.kwh, 0);
  const avgConsumption = timeSeriesData.length > 0 ? totalConsumption / timeSeriesData.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
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
              <p className="text-xs text-gray-600">Per hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${costData ? costData.total_cost.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-gray-600">Monthly estimate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
              <Leaf className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {costData ? costData.total_co2.toFixed(1) : '0.0'} kg
              </div>
              <p className="text-xs text-gray-600">CO₂ monthly</p>
            </CardContent>
          </Card>
        </div>

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
            <RecommendationsCard recommendations={recommendations} />
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

          <TabsContent value="upload" className="space-y-6">
            <FileUpload mode={mode} onUploadSuccess={handleFileUpload} />
          </TabsContent>

          <TabsContent value="simulate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimulationControls mode={mode} onDataReceived={handleSimulationData} />
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