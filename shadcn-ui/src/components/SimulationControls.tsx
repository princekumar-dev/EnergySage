import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, Activity, Wifi, WifiOff } from 'lucide-react';
import { EnergyReading } from '@/lib/api';

interface SimulationControlsProps {
  mode: 'household' | 'industry';
  onDataReceived: (data: EnergyReading) => void;
  // Persistent simulation props from Dashboard
  isRunning: boolean;
  isConnected: boolean;
  dataCount: number;
  lastDataPoint: EnergyReading | null;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
}

export default function SimulationControls({ 
  mode, 
  onDataReceived, 
  isRunning, 
  isConnected, 
  dataCount, 
  lastDataPoint, 
  onStart, 
  onStop 
}: SimulationControlsProps) {
  
  const startSimulation = async () => {
    await onStart();
  };

  const stopSimulation = async () => {
    await onStop();
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
          Simulate real-time {mode} energy data based on your imported patterns
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
          <Button 
            onClick={startSimulation} 
            className="flex-1"
            disabled={isRunning}
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Simulation Running' : 'Start Simulation'}
          </Button>
          
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
        {isConnected && isRunning ? (
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
        ) : !isConnected && dataCount > 0 ? (
          <Alert className="border-gray-200 bg-gray-50">
            <Square className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-600">
              <div className="text-sm">
                ⏹️ Simulation stopped. Total data points generated: <span className="font-medium">{dataCount}</span>
                {lastDataPoint && (
                  <div className="mt-1 text-xs">
                    Last reading: {lastDataPoint.kwh.toFixed(2)} kWh from {lastDataPoint.device}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Simulation Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2 text-sm">Simulation Details</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Uses your imported data patterns for realistic simulation</p>
            <p>• Updates every 2 seconds with variations of your data</p>
            <p>• Applies time-based usage factors to imported appliances</p>
            <p>• Perfect for testing with your actual energy profile</p>
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