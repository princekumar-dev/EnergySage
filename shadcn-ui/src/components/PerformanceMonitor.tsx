import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Cpu, 
  Database, 
  Wifi, 
  Clock, 
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  data_processing_speed: number;
  api_response_time: number;
  connection_status: 'excellent' | 'good' | 'poor' | 'offline';
  last_updated: string;
  active_connections: number;
  data_points_processed: number;
  error_rate: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceMonitorProps {
  isSimulationRunning?: boolean;
  dataPointsCount?: number;
}

export default function PerformanceMonitor({ 
  isSimulationRunning = false, 
  dataPointsCount = 0 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    data_processing_speed: 0,
    api_response_time: 0,
    connection_status: 'good',
    last_updated: new Date().toISOString(),
    active_connections: 1,
    data_points_processed: 0,
    error_rate: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time metrics
  useEffect(() => {
    const updateMetrics = () => {
      const baseUsage = isSimulationRunning ? 60 : 20;
      const variation = (Math.random() - 0.5) * 20;
      
      setMetrics(prev => ({
        ...prev,
        cpu_usage: Math.max(5, Math.min(95, baseUsage + variation)),
        memory_usage: Math.max(10, Math.min(90, prev.memory_usage + (Math.random() - 0.5) * 10)),
        data_processing_speed: Math.max(50, 1000 + (Math.random() - 0.5) * 200),
        api_response_time: Math.max(50, 150 + (Math.random() - 0.5) * 100),
        connection_status: Math.random() > 0.95 ? 'poor' : Math.random() > 0.8 ? 'good' : 'excellent',
        last_updated: new Date().toISOString(),
        active_connections: Math.floor(Math.random() * 3) + 1,
        data_points_processed: prev.data_points_processed + (isSimulationRunning ? Math.floor(Math.random() * 5) + 1 : 0),
        error_rate: Math.max(0, Math.min(5, prev.error_rate + (Math.random() - 0.5) * 1))
      }));
    };

    // Generate alerts based on metrics
    const checkAlerts = () => {
      const newAlerts: PerformanceAlert[] = [];
      
      if (metrics.cpu_usage > 80) {
        newAlerts.push({
          id: `cpu-${Date.now()}`,
          type: 'warning',
          message: `High CPU usage detected: ${metrics.cpu_usage.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
      
      if (metrics.memory_usage > 85) {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          type: 'error',
          message: `Memory usage critical: ${metrics.memory_usage.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
      
      if (metrics.api_response_time > 300) {
        newAlerts.push({
          id: `api-${Date.now()}`,
          type: 'warning',
          message: `Slow API response: ${metrics.api_response_time.toFixed(0)}ms`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)]);
      }
    };

    const interval = setInterval(() => {
      updateMetrics();
      if (Math.random() > 0.7) checkAlerts();
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulationRunning, metrics.cpu_usage, metrics.memory_usage, metrics.api_response_time]);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAlerts([]);
    }, 1000);
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'poor': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Performance</h2>
          <p className="text-sm text-gray-600">Real-time monitoring and health metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getConnectionStatusColor(metrics.connection_status)}>
            {getConnectionIcon(metrics.connection_status)}
            <span className="ml-1 capitalize">{metrics.connection_status}</span>
          </Badge>
          <button 
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Usage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-lg font-bold">{metrics.cpu_usage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={metrics.cpu_usage} 
              className={`h-2 ${metrics.cpu_usage > 80 ? 'bg-red-100' : 'bg-blue-100'}`}
            />
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className="text-lg font-bold">{metrics.memory_usage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={metrics.memory_usage} 
              className={`h-2 ${metrics.memory_usage > 85 ? 'bg-red-100' : 'bg-green-100'}`}
            />
          </CardContent>
        </Card>

        {/* API Response Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">API Speed</span>
              </div>
              <span className="text-lg font-bold">{metrics.api_response_time.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center space-x-1 text-xs">
              {metrics.api_response_time < 200 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={metrics.api_response_time < 200 ? 'text-green-600' : 'text-red-600'}>
                {metrics.api_response_time < 200 ? 'Fast' : 'Slow'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <span className="text-lg font-bold">{metrics.data_processing_speed.toFixed(0)}</span>
            </div>
            <div className="text-xs text-gray-500">points/sec</div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Live Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-700">Active Connections</div>
                <div className="text-xl font-bold text-blue-900">{metrics.active_connections}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">Data Points</div>
                <div className="text-xl font-bold text-green-900">{metrics.data_points_processed.toLocaleString()}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-purple-700">Error Rate</div>
                <div className="text-xl font-bold text-purple-900">{metrics.error_rate.toFixed(2)}%</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-orange-700">Uptime</div>
                <div className="text-xl font-bold text-orange-900">99.9%</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date(metrics.last_updated).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>System Alerts</span>
              </div>
              <Badge variant="outline">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.slice(0, 4).map((alert) => (
                  <Alert 
                    key={alert.id} 
                    className={
                      alert.type === 'error' ? 'border-red-200 bg-red-50' :
                      alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }
                  >
                    <AlertDescription className="text-sm">
                      <div className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All systems operational</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}