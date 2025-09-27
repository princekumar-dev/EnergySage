import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { EnergyReading } from '@/lib/api';

interface BreakdownChartProps {
  data: EnergyReading[];
  mode: 'household' | 'industry';
}

interface ChartDataItem {
  device: string;
  kwh: number;
  percentage: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
    value: number;
  }>;
}

export default function BreakdownChart({ data, mode }: BreakdownChartProps) {
  // Aggregate data by device/machine
  const deviceData = data.reduce((acc, reading) => {
    const key = mode === 'household' ? reading.device : (reading.machine_id || reading.device);
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += reading.kwh;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart format and sort by consumption
  const chartData: ChartDataItem[] = Object.entries(deviceData)
    .map(([device, kwh]) => ({
      device,
      kwh: Number(kwh.toFixed(2)),
      percentage: Number(((kwh / Object.values(deviceData).reduce((a, b) => a + b, 0)) * 100).toFixed(1))
    }))
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, 10); // Top 10 consumers

  // Color palette
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.device}</p>
          <p className="text-blue-600">{`${data.kwh} kWh (${data.percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const totalConsumption = chartData.reduce((sum, item) => sum + item.kwh, 0);
  const topConsumer = chartData[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5" />
          <span>{mode === 'household' ? 'Appliance' : 'Machine'} Breakdown</span>
        </CardTitle>
        <CardDescription>
          Energy consumption by {mode === 'household' ? 'appliance' : 'machine/process'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="kwh"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {chartData.slice(0, 6).map((item, index) => (
                <div key={item.device} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index] }}
                  ></div>
                  <span className="truncate">{item.device}</span>
                  <span className="text-gray-500 ml-auto">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bar" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="device" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Consumption:</span>
            <span className="font-medium">{totalConsumption.toFixed(2)} kWh</span>
          </div>
          {topConsumer && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Top Consumer:</span>
              <span className="font-medium">{topConsumer.device} ({topConsumer.percentage}%)</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Devices Tracked:</span>
            <span className="font-medium">{chartData.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}