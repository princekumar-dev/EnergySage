import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  AlertTriangle, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Bell,
  CheckCircle,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { api, GridAwareness as GridAwarenessType, NeighborhoodAlert, LoadShiftRecommendation } from '@/lib/api';

interface GridAwarenessProps {
  className?: string;
}

export default function GridAwareness({ className }: GridAwarenessProps) {
  const [gridData, setGridData] = useState<GridAwarenessType | null>(null);
  const [loading, setLoading] = useState(true);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGridData();
    // Refresh every 2 minutes to simulate real-time updates
    const interval = setInterval(loadGridData, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadGridData = async () => {
    try {
      const data = await api.getGridAwareness();
      setGridData(data);
    } catch (error) {
      console.error('Failed to load grid awareness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = (appliance: string) => {
    setAppliedRecommendations(prev => new Set([...prev, appliance]));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'peak': return 'bg-orange-500';
      case 'high': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical': return 'Critical Load';
      case 'peak': return 'Peak Hours';
      case 'high': return 'High Demand';
      default: return 'Normal';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'capacity_risk': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'peak_warning': return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'load_spike': return <Activity className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 animate-pulse" />
            <span>Loading Grid Status...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gridData) {
    return (
      <Card className={`${className}`}>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Unable to load grid awareness data</p>
        </CardContent>
      </Card>
    );
  }

  // Check if there's no real data (user impact score and load percentage are 0)
  const hasRealData = gridData.user_impact_score > 0 || gridData.current_grid_status.load_percentage > 0;

  if (!hasRealData) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Grid Awareness</span>
          </CardTitle>
          <CardDescription>
            Smart neighborhood load management system
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium text-gray-700 mb-2">No Data Available</p>
          <p className="text-sm text-gray-500 mb-4">
            Import your appliance data or upload energy consumption data to enable smart grid awareness features.
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Real-time grid load monitoring for your area</p>
            <p>• Neighborhood alerts when consumption spikes</p>
            <p>• Smart recommendations for load shifting</p>
            <p>• Cost savings through optimal timing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Grid Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Live Grid Status</span>
            <Badge className="ml-auto">
              <MapPin className="h-3 w-3 mr-1" />
              {gridData.user_area}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time grid load monitoring for your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(gridData.current_grid_status.status)}`}></div>
                <span className="text-sm font-medium">{getStatusText(gridData.current_grid_status.status)}</span>
              </div>
              <div className="text-2xl font-bold">
                {gridData.current_grid_status.load_percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Grid Capacity</div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Current Load</span>
              <div className="text-2xl font-bold">
                {gridData.current_grid_status.current_load_mw} MW
              </div>
              <div className="text-xs text-gray-500">
                of {gridData.current_grid_status.capacity_mw} MW
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Your Impact</span>
              <div className="text-2xl font-bold">
                {gridData.user_impact_score}/100
              </div>
              <div className="text-xs text-gray-500">Impact Score</div>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Next Peak</span>
              <div className="text-sm font-bold">
                {gridData.current_grid_status.predicted_peak_time 
                  ? new Date(gridData.current_grid_status.predicted_peak_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : 'N/A'
                }
              </div>
              <div className="text-xs text-gray-500">Predicted Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {gridData.active_alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span>Active Neighborhood Alerts</span>
              <Badge variant="destructive">{gridData.active_alerts.length}</Badge>
            </CardTitle>
            <CardDescription>
              Real-time alerts affecting your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gridData.active_alerts.map((alert) => (
                <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {alert.affected_households} households
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.duration_minutes} min duration
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {alert.area_code}
                          </span>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load Shift Recommendations */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="forecast">24h Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                <span>Load Shift Recommendations</span>
              </CardTitle>
              <CardDescription>
                Optimize your energy usage and help reduce neighborhood grid load
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gridData.recommended_actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">All good! No load shifting needed right now.</p>
                  <p className="text-sm">Your area has optimal grid conditions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gridData.recommended_actions.map((rec, index) => {
                    const isApplied = appliedRecommendations.has(rec.appliance_type);
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{rec.appliance_type}</h4>
                              <Badge 
                                variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                              >
                                {rec.priority} priority
                              </Badge>
                              {isApplied && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Applied
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              <p>Current usage: <strong>{rec.current_usage_kwh} kWh</strong></p>
                              <p>Suggested delay: <strong>{rec.suggested_shift_hours} hours</strong></p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="bg-green-50 p-2 rounded text-center">
                                <div className="font-medium text-green-700">₹{rec.potential_savings}</div>
                                <div className="text-green-600 text-xs">Potential Savings</div>
                              </div>
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <div className="font-medium text-blue-700">{rec.grid_impact_reduction} kWh</div>
                                <div className="text-blue-600 text-xs">Grid Impact Reduction</div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              <strong>Alternative times:</strong> {rec.alternative_time_slots.join(' or ')}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {isApplied ? (
                              <Button disabled size="sm" variant="outline">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Applied
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => handleApplyRecommendation(rec.appliance_type)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Apply
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>24-Hour Load Forecast</span>
              </CardTitle>
              <CardDescription>
                Predicted grid load for optimal planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {gridData.load_forecast.slice(0, 12).map((forecast, index) => {
                  const hour = new Date(forecast.timestamp).getHours();
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(forecast.status)}`}></div>
                        <span className="font-medium">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                        <span className="text-sm text-gray-600">
                          {getStatusText(forecast.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{forecast.load_percentage.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">{forecast.current_load_mw} MW</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}