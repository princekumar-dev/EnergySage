import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  DollarSign, 
  Leaf, 
  Clock, 
  Wrench, 
  Zap, 
  CheckCircle,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { Recommendation } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  location?: string;
  onApplyRecommendation?: (id: string) => void;
}

export default function RecommendationsCard({ recommendations, location = 'US', onApplyRecommendation }: RecommendationsCardProps) {
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  const handleApply = (id: string) => {
    setAppliedRecommendations(prev => new Set([...prev, id]));
    onApplyRecommendation?.(id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scheduling': return <Clock className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'replacement': return <TrendingDown className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalSavings = recommendations.reduce((acc, rec) => ({
    kwh: acc.kwh + rec.estimated_savings_kwh,
    cost: acc.cost + rec.estimated_savings_cost,
    co2: acc.co2 + rec.estimated_co2_reduction
  }), { kwh: 0, cost: 0, co2: 0 });

  if (recommendations.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span>AI Recommendations</span>
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Personalized suggestions to optimize your energy usage powered by advanced analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available yet.</p>
            <p className="text-sm mt-2">Upload more data to get AI-powered insights.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <span>AI Recommendations</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Personalized suggestions to optimize your energy usage powered by advanced analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Potential Savings */}
        <Alert className="border-green-200 bg-green-50">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <div className="font-medium mb-2">Potential Monthly Savings:</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{totalSavings.kwh.toFixed(1)} kWh</div>
                <div className="text-green-600">Energy</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatCurrency(totalSavings.cost, location)}</div>
                <div className="text-green-600">Cost</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{totalSavings.co2.toFixed(1)} kg</div>
                <div className="text-green-600">CO₂</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Recommendations List */}
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isApplied = appliedRecommendations.has(rec.id);
            
            return (
              <div 
                key={rec.id} 
                className={`border rounded-lg p-4 transition-all ${
                  isApplied ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(rec.category)}
                    <h4 className="font-medium">{rec.title}</h4>
                    {isApplied && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                {/* Savings Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="font-semibold text-blue-700">
                      {rec.estimated_savings_kwh.toFixed(1)} kWh
                    </div>
                    <div className="text-blue-600">Energy Saved</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="font-semibold text-green-700">
                      {formatCurrency(rec.estimated_savings_cost, location)}
                    </div>
                    <div className="text-green-600">Cost Saved</div>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded text-center">
                    <div className="font-semibold text-emerald-700 flex items-center justify-center">
                      <Leaf className="h-3 w-3 mr-1" />
                      {rec.estimated_co2_reduction.toFixed(1)} kg
                    </div>
                    <div className="text-emerald-600">CO₂ Reduced</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Device: {rec.device}
                  </div>
                  {isApplied ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleApply(rec.id)}
                      className="text-xs"
                    >
                      Apply Recommendation
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Implementation Timeline */}
        {recommendations.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Implementation Timeline</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Immediate (0-1 week):</span>
                <span className="font-medium">
                  {recommendations.filter(r => r.category === 'scheduling').length} actions
                </span>
              </div>
              <div className="flex justify-between">
                <span>Short-term (1-4 weeks):</span>
                <span className="font-medium">
                  {recommendations.filter(r => r.category === 'efficiency' || r.category === 'maintenance').length} actions
                </span>
              </div>
              <div className="flex justify-between">
                <span>Long-term (1-6 months):</span>
                <span className="font-medium">
                  {recommendations.filter(r => r.category === 'replacement').length} actions
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}