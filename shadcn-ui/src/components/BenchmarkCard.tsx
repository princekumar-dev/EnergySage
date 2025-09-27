import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  BarChart3,
  Target
} from 'lucide-react';
import { api, BenchmarkData } from '@/lib/api';

interface BenchmarkCardProps {
  className?: string;
}

export default function BenchmarkCard({ className }: BenchmarkCardProps) {
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        const data = await api.getBenchmarkData();
        setBenchmark(data);
      } catch (error) {
        console.error('Failed to fetch benchmark data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmark();
  }, []);

  if (loading) {
    return (
      <Card className={`shadow-lg border-0 ${className}`}>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span>Energy Benchmarking</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!benchmark) {
    return (
      <Card className={`shadow-lg border-0 ${className}`}>
        <CardContent className="p-6 text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Unable to load benchmark data</p>
        </CardContent>
      </Card>
    );
  }

  const isAboveAverage = benchmark.user_consumption < benchmark.peer_average;
  const efficiencyPercentage = Math.round((1 - benchmark.user_consumption / benchmark.peer_average) * 100);

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span>Energy Benchmarking</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Compare your energy usage with similar properties
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Performance Summary */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            {isAboveAverage ? (
              <TrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
            <span className={`text-2xl font-bold ${isAboveAverage ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(efficiencyPercentage)}%
            </span>
          </div>
          <p className="text-gray-600">
            {isAboveAverage ? 'More efficient' : 'Less efficient'} than peer average
          </p>
        </div>

        {/* Ranking */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Efficiency Ranking</span>
            </div>
            <Badge variant="outline" className="bg-white">
              {benchmark.efficiency_ranking}th percentile
            </Badge>
          </div>
          <Progress value={benchmark.efficiency_ranking} className="h-2" />
          <div className="text-xs text-blue-700 mt-2">
            You perform better than {benchmark.efficiency_ranking}% of similar properties
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Daily Consumption Comparison</h4>
          
          {/* Your Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-600">Your Usage</span>
              <span className="font-bold">{benchmark.user_consumption.toFixed(1)} kWh</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${(benchmark.user_consumption / Math.max(benchmark.peer_average, benchmark.user_consumption)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Peer Average */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">Peer Average</span>
              <span className="font-bold">{benchmark.peer_average.toFixed(1)} kWh</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-gray-500 h-3 rounded-full"
                style={{ width: `${(benchmark.peer_average / Math.max(benchmark.peer_average, benchmark.user_consumption)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Top 10% */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-600">Top 10% Efficient</span>
              <span className="font-bold">{benchmark.top_10_percent.toFixed(1)} kWh</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${(benchmark.top_10_percent / Math.max(benchmark.peer_average, benchmark.user_consumption)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Peer Group Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">Comparison Group</span>
          </div>
          <p className="text-sm text-gray-600">
            Compared with {benchmark.similar_properties_count.toLocaleString()} similar properties 
            in your area with comparable size and usage patterns.
          </p>
        </div>

        {/* Improvement Target */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Efficiency Goal</span>
          </div>
          <p className="text-sm text-green-800">
            Reduce daily usage by {(benchmark.user_consumption - benchmark.top_10_percent).toFixed(1)} kWh 
            to reach top 10% efficiency level.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}