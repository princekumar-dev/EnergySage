import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Zap, 
  DollarSign, 
  Wrench, 
  Cloud,
  X
} from 'lucide-react';
import { api, SmartAlert } from '@/lib/api';

interface SmartAlertsProps {
  className?: string;
}

export default function SmartAlerts({ className }: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alertData = await api.getSmartAlerts();
        setAlerts(alertData);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'energy_spike': return <Zap className="h-4 w-4" />;
      case 'cost_warning': return <DollarSign className="h-4 w-4" />;
      case 'maintenance_due': return <Wrench className="h-4 w-4" />;
      case 'weather_advisory': return <Cloud className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: SmartAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityTextColor = (severity: SmartAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700';
      case 'warning': return 'text-yellow-700';
      case 'info': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  const criticalCount = visibleAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = visibleAlerts.filter(a => a.severity === 'warning').length;

  if (loading) {
    return (
      <Card className={`shadow-lg border-0 ${className}`}>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span>Smart Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span>Smart Alerts</span>
          </div>
          <div className="flex items-center space-x-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                {warningCount} Warning
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          AI-powered intelligent monitoring and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">All Clear!</p>
            <p className="text-sm">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAlerts.map((alert) => (
              <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${getSeverityTextColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${getSeverityTextColor(alert.severity)}`}>
                          {alert.title}
                        </h4>
                        {alert.action_required && (
                          <Badge variant="outline" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className={getSeverityTextColor(alert.severity)}>
                        {alert.message}
                      </AlertDescription>
                      {alert.device && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {alert.device}
                          </Badge>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Alert Settings */}
        {visibleAlerts.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Alerts update every 30 seconds
              </span>
              <Button variant="outline" size="sm">
                Configure Alerts
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}