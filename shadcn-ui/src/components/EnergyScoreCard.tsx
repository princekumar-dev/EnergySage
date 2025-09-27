import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Zap, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Star,
  Target
} from 'lucide-react';
import { api, EnergyScore } from '@/lib/api';

interface EnergyScoreCardProps {
  className?: string;
}

export default function EnergyScoreCard({ className }: EnergyScoreCardProps) {
  const [score, setScore] = useState<EnergyScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const scoreData = await api.getEnergyScore();
        setScore(scoreData);
      } catch (error) {
        console.error('Failed to fetch energy score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-200';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <Card className={`shadow-lg border-0 ${className}`}>
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <span>Energy Efficiency Score</span>
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            AI-powered analysis of your energy performance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className={`shadow-lg border-0 ${className}`}>
        <CardContent className="p-6 text-center text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Unable to calculate energy score</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
            <Award className="h-5 w-5 text-white" />
          </div>
          <span>Energy Efficiency Score</span>
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          AI-powered analysis of your energy performance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`text-6xl font-bold ${getScoreColor(score.overall_score)}`}>
              {score.overall_score}
            </div>
            <div className="text-center">
              <Badge variant="outline" className={`text-lg px-3 py-1 ${getGradeColor(score.grade)}`}>
                {score.grade}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Grade</div>
            </div>
          </div>
          <div className="text-gray-600">
            You're performing better than {Math.round((score.overall_score / 100) * 85)}% of similar properties
          </div>
        </div>

        {/* Individual Scores */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Efficiency</span>
              </div>
              <span className="text-sm font-bold">{score.efficiency_score}/100</span>
            </div>
            <Progress value={score.efficiency_score} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Sustainability</span>
              </div>
              <span className="text-sm font-bold">{score.sustainability_score}/100</span>
            </div>
            <Progress value={score.sustainability_score} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Cost Optimization</span>
              </div>
              <span className="text-sm font-bold">{score.cost_optimization_score}/100</span>
            </div>
            <Progress value={score.cost_optimization_score} className="h-2" />
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Quick Wins</span>
          </div>
          <p className="text-sm text-blue-800">
            {score.recommendations_count} AI recommendations available to boost your score by up to 15 points
          </p>
        </div>
      </CardContent>
    </Card>
  );
}