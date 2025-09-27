import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, Square, Activity, Wifi, WifiOff } from 'lucide-react';
import { api, SimulationWebSocket, EnergyReading } from '@/lib/api';

interface SimulationControlsProps {
  mode: 'household' | 'industry';
  onDataReceived: (data: EnergyReading) => void;
}

export default function SimulationControls({ mode, onDataReceived }: SimulationControlsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastDataPoint, setLastDataPoint] = useState<EnergyReading | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const [ws, setWs] = useState<SimulationWebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (ws) {
        ws.disconnect();
      }
    };
  }, [ws]);

  const startSimulation = async () => {
    try {
      await api.startSimulation();
      
      // Create WebSocket connection
      const websocket = new SimulationWebSocket();
      websocket.onData((data: EnergyReading) => {
        setLastDataPoint(data);
        setDataCount(prev => prev + 1);
        onDataReceived(data);
      });
      
      websocket.connect();
      setWs(websocket);
      setIsRunning(true);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start simulation:', error);
    }
  };

  const pauseSimulation = () => {
    setIsRunning(false);
    // In a real implementation, this would pause the WebSocket data flow
  };

  const stopSimulation = async () => {
    try {
      await api.stopSimulation();
      if (ws) {
        ws.disconnect();
        setWs(null);
      }
      setIsRunning(false);
      setIsConnected(false);
      setDataCount(0);
      setLastDataPoint(null);
    } catch (error) {
      console.error('Failed to stop simulation:', error);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-gray-100 text-gray-700';
    if (isRunning) return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (isRunning) return 'Streaming';
    return 'Connected';
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span>Real-time Simulation</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Stream live {mode} energy data for real-time analysis and monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm font-medium">Status:</span>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex space-x-2">
          {!isRunning ? (
            <Button 
              onClick={startSimulation} 
              className="flex-1"
              disabled={isConnected && !isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
          ) : (
            <Button 
              onClick={pauseSimulation} 
              variant="outline" 
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={stopSimulation} 
            variant="destructive" 
            disabled={!isConnected}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>

        {/* Live Data Display */}
        {isConnected && (
          <Alert className="border-blue-200 bg-blue-50">
            <Activity className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data Points Received:</span>
                  <span className="font-medium">{dataCount}</span>
                </div>
                {lastDataPoint && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Latest Reading:</span>
                      <span className="font-medium">{lastDataPoint.kwh.toFixed(2)} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Device:</span>
                      <span className="font-medium">{lastDataPoint.device}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Timestamp:</span>
                      <span className="font-medium">
                        {new Date(lastDataPoint.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Simulation Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">Simulation Details</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Generates realistic {mode} energy patterns</p>
            <p>• Updates every 2 seconds with new data points</p>
            <p>• Includes random variations and usage spikes</p>
            <p>• Perfect for testing anomaly detection</p>
          </div>
        </div>

        {/* Performance Metrics */}
        {isConnected && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white border rounded p-2 text-center">
              <div className="font-semibold text-blue-600">{dataCount}</div>
              <div className="text-gray-600">Points</div>
            </div>
            <div className="bg-white border rounded p-2 text-center">
              <div className="font-semibold text-green-600">
                {isRunning ? '2s' : '0s'}
              </div>
              <div className="text-gray-600">Interval</div>
            </div>
          </div>
        )}

        {/* Tips */}
        {!isConnected && (
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Tip:</strong> Start simulation to see real-time energy data</p>
            <p><strong>Use case:</strong> Test anomaly detection and live forecasting</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}