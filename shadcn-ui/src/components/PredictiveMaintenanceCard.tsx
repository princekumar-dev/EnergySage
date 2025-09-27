import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api, PredictiveMaintenance } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface PredictiveMaintenanceProps {
  className?: string;
  location?: string;
}

export default function PredictiveMaintenanceCard({ className, location = 'US' }: PredictiveMaintenanceProps) {
  const [maintenanceData, setMaintenanceData] = useState<PredictiveMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const data = await api.getPredictiveMaintenance();
        setMaintenanceData(data);
      } catch (error) {
        console.error('Failed to fetch maintenance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUrgencyColor = (urgency: PredictiveMaintenance['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMaintenanceIcon = (type: PredictiveMaintenance['maintenance_type']) => {
    switch (type) {
      case 'cleaning': return <Activity className="h-4 w-4" />;
      case 'repair': return <Wrench className="h-4 w-4" />;
      case 'replacement': return <AlertTriangle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={`shadow-lg border-0 ${className}`}>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span>Predictive Maintenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalItems = maintenanceData.filter(item => item.urgency === 'critical');
  const totalEstimatedCost = maintenanceData.reduce((sum, item) => sum + item.estimated_cost, 0);

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span>Predictive Maintenance</span>
          </div>
          {criticalItems.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalItems.length} Critical
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          AI-powered equipment health monitoring and maintenance scheduling
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Cost</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalEstimatedCost, location)}
            </div>
            <div className="text-xs text-blue-700">Estimated maintenance</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Devices</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {maintenanceData.length}
            </div>
            <div className="text-xs text-green-700">Being monitored</div>
          </div>
        </div>

        {/* Maintenance Items */}
        <div className="space-y-4">
          {maintenanceData.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getMaintenanceIcon(item.maintenance_type)}
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">{item.device.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {item.maintenance_type} required
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                  {item.urgency}
                </Badge>
              </div>

              {/* Health Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Equipment Health</span>
                  <span className={`font-bold ${getHealthColor(item.health_score)}`}>
                    {item.health_score}%
                  </span>
                </div>
                <Progress value={item.health_score} className="h-2" />
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {item.estimated_failure_date && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Due: {new Date(item.estimated_failure_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-gray-600">
                    <DollarSign className="h-3 w-3" />
                    <span>{formatCurrency(item.estimated_cost, location)}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Schedule
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button className="w-full" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            View Maintenance Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}