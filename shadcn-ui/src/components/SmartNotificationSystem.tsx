import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellOff, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Zap
} from 'lucide-react';

interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sound_enabled: boolean;
  high_usage_threshold: number;
  anomaly_detection: boolean;
  maintenance_reminders: boolean;
  cost_alerts: boolean;
  efficiency_tips: boolean;
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'usage' | 'cost' | 'maintenance' | 'efficiency' | 'system';
  priority: 'low' | 'medium' | 'high';
}

interface SmartNotificationSystemProps {
  currentUsage?: number;
  monthlyBudget?: number;
  isSimulationRunning?: boolean;
}

export default function SmartNotificationSystem({ 
  currentUsage = 0,
  monthlyBudget = 200,
  isSimulationRunning = false
}: SmartNotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    sound_enabled: false,
    high_usage_threshold: 80,
    anomaly_detection: true,
    maintenance_reminders: true,
    cost_alerts: true,
    efficiency_tips: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate smart notifications based on usage patterns
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];

      // High usage alert
      if (settings.cost_alerts && currentUsage > monthlyBudget * (settings.high_usage_threshold / 100)) {
        newNotifications.push({
          id: `usage-${Date.now()}`,
          type: 'warning',
          title: 'High Energy Usage Alert',
          message: `Current usage (${currentUsage.toFixed(1)} kWh) is ${((currentUsage / monthlyBudget) * 100).toFixed(0)}% of your monthly budget.`,
          timestamp: new Date().toISOString(),
          read: false,
          category: 'usage',
          priority: 'high'
        });
      }

      // Efficiency tip
      if (settings.efficiency_tips && Math.random() > 0.8) {
        const tips = [
          'Consider using appliances during off-peak hours (10 PM - 6 AM) to save 15-20% on electricity costs.',
          'Your heating system accounts for 45% of energy use. Lower thermostat by 2°F to save 6-8% monthly.',
          'Unplug electronics when not in use to eliminate phantom loads that can add 5-10% to your bill.',
          'LED bulbs use 75% less energy than incandescent. Replace your top 5 most-used fixtures first.'
        ];
        
        newNotifications.push({
          id: `tip-${Date.now()}`,
          type: 'info',
          title: 'Energy Efficiency Tip',
          message: tips[Math.floor(Math.random() * tips.length)],
          timestamp: new Date().toISOString(),
          read: false,
          category: 'efficiency',
          priority: 'low'
        });
      }

      // Maintenance reminder
      if (settings.maintenance_reminders && Math.random() > 0.9) {
        newNotifications.push({
          id: `maintenance-${Date.now()}`,
          type: 'info',
          title: 'Maintenance Reminder',
          message: 'Schedule HVAC filter replacement. Dirty filters can increase energy consumption by 15%.',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'maintenance',
          priority: 'medium'
        });
      }

      // Anomaly detection
      if (settings.anomaly_detection && isSimulationRunning && Math.random() > 0.85) {
        newNotifications.push({
          id: `anomaly-${Date.now()}`,
          type: 'warning',
          title: 'Usage Anomaly Detected',
          message: 'Unusual energy consumption pattern detected. Check for malfunctioning appliances.',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'usage',
          priority: 'high'
        });
      }

      // Success notifications
      if (currentUsage < monthlyBudget * 0.7 && Math.random() > 0.9) {
        newNotifications.push({
          id: `success-${Date.now()}`,
          type: 'success',
          title: 'Great Energy Efficiency!',
          message: `You're using 30% less energy than budgeted. Keep up the excellent work!`,
          timestamp: new Date().toISOString(),
          read: false,
          category: 'efficiency',
          priority: 'low'
        });
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev.slice(0, 9)]); // Keep last 10
        setUnreadCount(prev => prev + newNotifications.length);
      }
    };

    const interval = setInterval(generateNotifications, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [currentUsage, monthlyBudget, isSimulationRunning, settings]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info': 
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info':
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low':
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Notifications</h2>
          <p className="text-sm text-gray-600">Intelligent alerts and energy insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {unreadCount} unread
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Email Notifications</span>
                    </div>
                    <Switch
                      checked={settings.email_enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, email_enabled: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Push Notifications</span>
                    </div>
                    <Switch
                      checked={settings.push_enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, push_enabled: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {settings.sound_enabled ? <Volume2 className="h-4 w-4 text-purple-600" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Sound Alerts</span>
                    </div>
                    <Switch
                      checked={settings.sound_enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, sound_enabled: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Alert Categories</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Usage Alerts</span>
                    <Switch
                      checked={settings.cost_alerts}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, cost_alerts: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anomaly Detection</span>
                    <Switch
                      checked={settings.anomaly_detection}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, anomaly_detection: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maintenance Reminders</span>
                    <Switch
                      checked={settings.maintenance_reminders}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, maintenance_reminders: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Efficiency Tips</span>
                    <Switch
                      checked={settings.efficiency_tips}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, efficiency_tips: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Threshold Setting */}
            <div className="pt-4 border-t">
              <label className="text-sm font-medium">High Usage Threshold</label>
              <div className="mt-2 flex items-center space-x-2">
                <Select
                  value={settings.high_usage_threshold.toString()}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, high_usage_threshold: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">of monthly budget</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {unreadCount > 0 ? <Bell className="h-5 w-5 text-blue-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
            <span>Recent Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                        </span>
                        <span className="capitalize">{notification.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs">Smart alerts will appear here based on your energy usage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}