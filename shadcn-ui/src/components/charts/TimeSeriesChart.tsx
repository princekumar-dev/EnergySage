import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { EnergyReading, Anomaly } from '@/lib/api';

interface TimeSeriesChartProps {
  data: EnergyReading[];
  predictions?: Array<{ timestamp: string; predicted_kwh: number; confidence_interval: [number, number] }>;
  anomalies?: Anomaly[];
  mode: 'household' | 'industry';
}

interface ChartDataPoint {
  timestamp: string;
  time: number;
  actual: number | null;
  predicted: number | null;
  upper: number | null;
  lower: number | null;
  isAnomaly: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    value: number;
  }>;
  label?: string;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload: ChartDataPoint;
}

export default function TimeSeriesChart({ data, predictions, anomalies, mode }: TimeSeriesChartProps) {
  // Combine actual data with predictions
  const chartData: ChartDataPoint[] = [
    ...data.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleDateString(),
      time: new Date(d.timestamp).getHours(),
      actual: d.kwh,
      predicted: null,
      upper: null,
      lower: null,
      isAnomaly: anomalies?.some(a => 
        new Date(a.timestamp).getTime() === new Date(d.timestamp).getTime()
      ) || false
    })),
    ...(predictions || []).map(p => ({
      timestamp: new Date(p.timestamp).toLocaleDateString(),
      time: new Date(p.timestamp).getHours(),
      actual: null,
      predicted: p.predicted_kwh,
      upper: p.confidence_interval[1],
      lower: p.confidence_interval[0],
      isAnomaly: false
    }))
  ].sort((a, b) => a.time - b.time);

  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.actual || 0, d.predicted || 0, d.upper || 0))
  );

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}:00`}</p>
          {data.actual !== null && (
            <p className="text-blue-600">
              {`Actual: ${data.actual.toFixed(2)} kWh`}
              {data.isAnomaly && (
                <span className="ml-2 text-red-500 text-xs">⚠ Anomaly</span>
              )}
            </p>
          )}
          {data.predicted !== null && (
            <>
              <p className="text-green-600">{`Predicted: ${data.predicted.toFixed(2)} kWh`}</p>
              <p className="text-gray-500 text-xs">
                {`Range: ${data.lower?.toFixed(2)} - ${data.upper?.toFixed(2)} kWh`}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const anomalyCount = anomalies?.length || 0;
  const avgConsumption = data.length > 0 
    ? data.reduce((sum, d) => sum + d.kwh, 0) / data.length 
    : 0;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Energy Consumption Timeline</span>
            </CardTitle>
            <CardDescription>
              {mode === 'household' ? 'Household' : 'Industrial'} energy usage over time with AI predictions
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm text-gray-600">
              Avg: {avgConsumption.toFixed(2)} kWh
            </div>
            {anomalyCount > 0 && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{anomalyCount} anomalies</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => `${value}:00`}
                className="text-xs"
              />
              <YAxis 
                domain={[0, maxValue * 1.1]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Confidence interval area */}
              {predictions && predictions.length > 0 && (
                <>
                  <Line
                    type="monotone"
                    dataKey="upper"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                    connectNulls={false}
                  />
                </>
              )}
              
              {/* Actual consumption line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={(props: DotProps) => {
                  if (props.payload.isAnomaly) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth={2}
                      />
                    );
                  }
                  return <circle cx={props.cx} cy={props.cy} r={2} fill="#3b82f6" />;
                }}
                connectNulls={false}
              />
              
              {/* Prediction line */}
              {predictions && predictions.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', r: 3 }}
                  connectNulls={false}
                />
              )}
              
              {/* Reference line for current time */}
              <ReferenceLine 
                x={new Date().getHours()} 
                stroke="#6b7280" 
                strokeDasharray="2 2"
                label={{ value: "Now", position: "top" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span>Actual Consumption</span>
          </div>
          {predictions && predictions.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-500 border-dashed border-t-2"></div>
              <span>AI Prediction</span>
            </div>
          )}
          {anomalyCount > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Anomaly</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}