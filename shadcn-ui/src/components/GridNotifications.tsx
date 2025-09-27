import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Users, 
  Clock,
  CheckCircle
} from 'lucide-react';
import { api, NeighborhoodAlert } from '@/lib/api';

interface GridNotificationsProps {
  className?: string;
}

export default function GridNotifications({ className }: GridNotificationsProps) {
  const [alerts, setAlerts] = useState<NeighborhoodAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    // Check for new alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const gridData = await api.getGridAwareness();
      // Only show alerts if there's real data (indicated by non-zero user impact score or load percentage)
      if (gridData.user_impact_score > 0 || gridData.current_grid_status.load_percentage > 0) {
        setAlerts(gridData.active_alerts);
      } else {
        setAlerts([]); // No alerts when no real data
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'capacity_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'peak_warning': return <TrendingUp className="h-4 w-4" />;
      case 'load_spike': return <Activity className="h-4 w-4" />;
      case 'load_shift_needed': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-800';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getAlertPriority = (severity: string) => {
    switch (severity) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      default: return 4;
    }
  };

  // Filter and sort alerts
  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .sort((a, b) => getAlertPriority(a.severity) - getAlertPriority(b.severity))
    .slice(0, 3); // Show max 3 alerts

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => {
        const isRecent = new Date().getTime() - new Date(alert.timestamp).getTime() < 10 * 60 * 1000; // 10 minutes

        return (
          <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} animate-in slide-in-from-top-1 duration-500`}>
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.alert_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertDescription className="font-medium text-sm">
                      {alert.title}
                    </AlertDescription>
                    {isRecent && (
                      <Badge variant="secondary" className="text-xs">
                        NEW
                      </Badge>
                    )}
                    <Badge 
                      variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                  <div className="flex items-center space-x-4 mt-2 text-xs opacity-75">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {alert.affected_households} households
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.round((new Date().getTime() - new Date(alert.timestamp).getTime()) / 60000)} min ago
                    </span>
                  </div>
                  {alert.recommendations.length > 0 && (
                    <div className="mt-2 text-xs">
                      <strong>Quick actions:</strong> {alert.recommendations.slice(0, 2).map(r => r.appliance_type).join(', ')}
                      {alert.recommendations.length > 2 && ` +${alert.recommendations.length - 2} more`}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(alert.id)}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-white/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        );
      })}
      
      {alerts.length > visibleAlerts.length + dismissedAlerts.size && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => setDismissedAlerts(new Set())}>
            <Bell className="h-4 w-4 mr-2" />
            Show {alerts.length - visibleAlerts.length} more alerts
          </Button>
        </div>
      )}
    </div>
  );
}