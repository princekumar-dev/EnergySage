import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { EnergyReading } from '@/lib/api';
import { aggregateByDevice } from '@/lib/performance';

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

export default React.memo(function BreakdownChart({ data, mode }: BreakdownChartProps) {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span>Energy Breakdown</span>
          </CardTitle>
          <CardDescription>Top energy consumers by {mode === 'household' ? 'appliance' : 'machine'}</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No breakdown data available</p>
            <p className="text-sm">Upload your energy data to see consumption breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoize data processing for performance using utility functions
  const chartData: ChartDataItem[] = useMemo(() => {
    const aggregatedData = aggregateByDevice(data, mode, 10);
    const totalConsumption = aggregatedData.reduce((sum, item) => sum + item.kwh, 0);
    
    return aggregatedData.map(item => ({
      ...item,
      percentage: Number(((item.kwh / totalConsumption) * 100).toFixed(1))
    }));
  }, [data, mode]);

  // Color palette - memoized for performance
  const colors = useMemo(() => [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ], []);

  const CustomTooltip = React.useCallback(({ active, payload }: TooltipProps) => {
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
  }, []);

  const { totalConsumption, topConsumer } = useMemo(() => ({
    totalConsumption: chartData.reduce((sum, item) => sum + item.kwh, 0),
    topConsumer: chartData[0]
  }), [chartData]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <PieChartIcon className="h-5 w-5 text-white" />
          </div>
          <span>{mode === 'household' ? 'Appliance' : 'Machine'} Breakdown</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Energy consumption by {mode === 'household' ? 'appliance' : 'machine/process'} with detailed analytics
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
});