import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from 'lucide-react';

interface TimeBasedAnalysisProps {
  className?: string;
}

export default function TimeBasedAnalysis({ className }: TimeBasedAnalysisProps) {
  const [shiftAnalysis, setShiftAnalysis] = useState<any>(null);
  const [predictiveModels, setPredictiveModels] = useState<any[]>([]);
  const [wastageAnalysis, setWastageAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const [shifts, models, wastage] = await Promise.all([
          api.getShiftAnalysis(),
          api.getPredictiveModels(),
          api.getWastageAnalysis()
        ]);
        
        setShiftAnalysis(shifts);
        setPredictiveModels(models);
        setWastageAnalysis(wastage);
      } catch (error) {
        console.error('Error loading time-based analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, []);

  const getShiftIcon = (shiftName: string) => {
    switch (shiftName) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌇';
      case 'night': return '🌙';
      default: return '⏰';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time-Based Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading time-based analysis...</div>
        </CardContent>
      </Card>
    );
  }

  if (!shiftAnalysis?.patterns?.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time-Based Analysis</span>
          </CardTitle>
          <CardDescription>
            Advanced 24-hour shift analysis with predictive modeling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available. Import appliance data and upload energy readings to see time-based analysis.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Shift Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>24-Hour Usage Patterns</span>
          </CardTitle>
          <CardDescription>
            Energy consumption patterns across different time shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shiftAnalysis.patterns.slice(0, 8).map((pattern: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getShiftIcon(pattern.shift.name)}</span>
                    <span className="font-medium">{pattern.device}</span>
                  </div>
                  <Badge variant="outline" className={`${
                    pattern.typicalPattern === 'high' ? 'border-red-200 text-red-700' :
                    pattern.typicalPattern === 'medium' ? 'border-yellow-200 text-yellow-700' :
                    pattern.typicalPattern === 'low' ? 'border-blue-200 text-blue-700' :
                    'border-gray-200 text-gray-700'
                  }`}>
                    {pattern.typicalPattern}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {pattern.shift.description}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="font-medium">Avg: {pattern.averageKwh.toFixed(2)} kWh</div>
                  </div>
                  <div>
                    <div className="font-medium">Peak: {pattern.peakKwh.toFixed(2)} kWh</div>
                  </div>
                  <div>
                    <div className="font-medium">Usage: {(pattern.usageFrequency * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Predictive Analytics</span>
          </CardTitle>
          <CardDescription>
            AI-powered predictions for upcoming energy usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictiveModels.slice(0, 6).map((model: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{model.device}</span>
                  {getTrendIcon(model.trendDirection)}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Next Hour: </span>
                    <span className="font-medium">{model.nextHourPrediction.toFixed(2)} kWh</span>
                  </div>
                  <div>
                    <span className="text-gray-600">24h Total: </span>
                    <span className="font-medium">
                      {model.next24HoursPrediction.reduce((sum: number, val: number) => sum + val, 0).toFixed(1)} kWh
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <Badge variant="outline" className="text-xs">
                      {model.confidenceScore}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wastage Analysis */}
      {wastageAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Energy Wastage Detection</span>
            </CardTitle>
            <CardDescription>
              Identified wastage patterns and potential savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wastageAnalysis.map((wastage: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="font-medium">{wastage.device}</div>
                      <div className="text-sm text-gray-600">
                        {getShiftIcon(wastage.shift)} {wastage.shift} shift
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      {wastage.wastedKwh} kWh wasted
                    </div>
                    <div className="text-sm text-green-600">
                      Save ₹{wastage.potentialSavings}
                    </div>
                    <Badge className={getSeverityColor(wastage.severity)}>
                      {wastage.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}