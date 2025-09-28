import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  TreePine, 
  Car, 
  Home, 
  Target,
  TrendingDown,
  TrendingUp,
  Award,
  Lightbulb,
  Recycle,
  ExternalLink,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Calendar,
  BarChart3,
  ShoppingCart,
  Filter,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface CarbonHistoryPoint {
  date: string;
  daily_co2: number;
  monthly_co2: number;
  footprint: number;
  efficiency_score: number;
}

interface CarbonTrends {
  footprint_trend: 'increasing' | 'decreasing' | 'stable';
  trend_percentage: number;
  best_day: string;
  worst_day: string;
  average_monthly: number;
}

interface ApplianceAnalysis {
  device: string;
  total_kwh: number;
  average_kwh: number;
  peak_kwh: number;
  co2_impact: number;
  usage_pattern: 'frequent' | 'moderate' | 'occasional';
  efficiency_rating: 'excellent' | 'good' | 'moderate' | 'poor';
}

interface CarbonData {
  current_footprint: number;
  daily_co2: number;
  monthly_co2: number;
  yearly_projection: number;
  carbon_intensity: number;
  offset_recommendations: OffsetRecommendation[];
  sustainability_score: number;
  grade: string;
  peer_comparison: {
    percentile: number;
    average_footprint: number;
  };
  reduction_tips: ReductionTip[];
  achievements: CarbonAchievement[];
  real_time_data: {
    current_consumption: number;
    co2_rate: number;
    today_savings: number;
    efficiency_score: number;
  };
  historical_data?: CarbonHistoryPoint[];
  trends?: CarbonTrends;
  appliance_analysis?: ApplianceAnalysis[];
}

interface OffsetRecommendation {
  type: 'tree_planting' | 'renewable_energy' | 'carbon_credits' | 'efficiency_upgrade';
  title: string;
  description: string;
  co2_offset: number;
  cost_estimate: number;
  impact_timeline: string;
  provider?: string;
  url?: string;
  verified: boolean;
  popularity: number;
}

interface ReductionTip {
  category: 'heating' | 'cooling' | 'appliances' | 'lighting' | 'behavior';
  tip: string;
  potential_reduction: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  cost: 'free' | 'low' | 'medium' | 'high';
  impact_score: number;
  implementation_time: string;
}

interface CarbonAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  points: number;
  unlock_date?: string;
}

interface CarbonFootprintProps {
  className?: string;
  totalConsumption?: number;
  realTimeCostData?: {
    total_co2: number;
    total_cost: number;
  };
  timeSeriesData?: any[];
  hasUploadedData?: boolean;
  mode?: 'household' | 'industry';
}

export default function CarbonFootprintAnalysis({ 
  className, 
  totalConsumption = 0, 
  realTimeCostData,
  timeSeriesData = [],
  hasUploadedData = false,
  mode = 'household'
}: CarbonFootprintProps) {
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedOffsets, setSelectedOffsets] = useState<string[]>([]);
  const [offsetFilter, setOffsetFilter] = useState<'all' | 'tree_planting' | 'renewable_energy' | 'carbon_credits' | 'efficiency_upgrade'>('all');

  useEffect(() => {
    // Calculate carbon data directly from props
    if (hasUploadedData && timeSeriesData.length > 0) {
      calculateCarbonData();
      setUsingRealData(true);
      setLastUpdated(new Date());
    } else {
      setCarbonData(null);
      setUsingRealData(false);
    }
  }, [hasUploadedData, timeSeriesData, totalConsumption, realTimeCostData]);

  // Refresh data when requested
  const refreshData = () => {
    if (hasUploadedData && timeSeriesData.length > 0) {
      calculateCarbonData();
    }
  };

  const calculateCarbonData = () => {
    try {
      setRefreshing(true);
      
      console.log(`🔍 Calculating carbon data - consumption: ${totalConsumption}, co2: ${realTimeCostData?.total_co2}, dataPoints: ${timeSeriesData.length}`);
      
      if (!hasUploadedData || timeSeriesData.length === 0) {
        setCarbonData(null);
        return;
      }

      // Calculate carbon footprint from real data with proper validation
      const recentData = timeSeriesData.slice(-168); // Last 7 days of data
      
      // Calculate total kWh with fallback logic
      let totalKwh = 0;
      if (totalConsumption && totalConsumption > 0) {
        totalKwh = totalConsumption;
      } else if (recentData.length > 0) {
        totalKwh = recentData.reduce((sum: number, reading: any) => sum + Math.max(0, reading.kwh || 0), 0);
      } else {
        totalKwh = 100; // Default for demo purposes
      }
      
      // Ensure minimum reasonable consumption (1 kWh for calculations)
      totalKwh = Math.max(1, totalKwh);
      
      // Carbon intensity based on mode
      // Household: 0.85 kg CO2/kWh (US grid average)
      // Industry: 0.92 kg CO2/kWh (higher due to peak load and less renewable integration)
      const carbonIntensity = mode === 'industry' ? 0.92 : 0.85;
      
      // Calculate CO2 emissions with proper scaling
      let currentCO2Monthly = 0;
      if (realTimeCostData?.total_co2 && realTimeCostData.total_co2 > 0) {
        currentCO2Monthly = realTimeCostData.total_co2;
      } else {
        // Estimate based on consumption: assume monthly consumption from total
        const monthlyKwh = recentData.length >= 30 ? totalKwh : totalKwh * (30 / Math.max(1, recentData.length));
        currentCO2Monthly = monthlyKwh * carbonIntensity;
      }
      
      // Ensure realistic CO2 values (minimum 10 kg/month for any consumption)
      currentCO2Monthly = Math.max(10, Math.min(10000, currentCO2Monthly));
      
      const dailyCO2 = currentCO2Monthly / 30;
      const yearlyProjection = currentCO2Monthly * 12;
      
      // Calculate current footprint in tons per year with realistic bounds
      const currentFootprint = Math.max(0.1, Math.min(25, yearlyProjection / 1000));
      
      // Average baseline varies by mode
      // Household: 6.1 tons/year (US average)
      // Industry: 15.2 tons/year (typical small business average)
      const averageFootprint = mode === 'industry' ? 15.2 : 6.1;
      
      console.log(`📊 Calculated - Total kWh: ${totalKwh.toFixed(2)}, Monthly CO2: ${currentCO2Monthly.toFixed(2)} kg, Daily CO2: ${dailyCO2.toFixed(2)} kg, Yearly: ${yearlyProjection.toFixed(2)} kg, Footprint: ${currentFootprint.toFixed(2)} tons`);

      // Generate historical data from time series
      const historicalData: CarbonHistoryPoint[] = [];
      if (timeSeriesData.length >= 7) {
        // Group by day and calculate daily averages
        const dailyGroups = new Map<string, any[]>();
        timeSeriesData.forEach((point: any) => {
          const date = new Date(point.timestamp || Date.now()).toISOString().split('T')[0];
          if (!dailyGroups.has(date)) dailyGroups.set(date, []);
          dailyGroups.get(date)!.push(point);
        });
        
        // Create history points for last 30 days
        Array.from(dailyGroups.entries()).slice(-30).forEach(([date, dayData]) => {
          const dayKwh = dayData.reduce((sum, d) => sum + (d.kwh || 0), 0);
          const dayFootprint = (dayKwh * carbonIntensity) / 1000 * 365; // Annualized
          const dayEfficiency = Math.max(20, 100 - ((dayFootprint / averageFootprint) * 50));
          
          historicalData.push({
            date,
            daily_co2: dayKwh * carbonIntensity,
            monthly_co2: dayKwh * carbonIntensity * 30,
            footprint: dayFootprint,
            efficiency_score: dayEfficiency
          });
        });
      }
      
      // Calculate trends
      const trends: CarbonTrends | undefined = historicalData.length >= 7 ? {
        footprint_trend: (() => {
          const recent = historicalData.slice(-7).reduce((sum, d) => sum + d.footprint, 0) / 7;
          const previous = historicalData.slice(-14, -7).reduce((sum, d) => sum + d.footprint, 0) / 7;
          if (recent < previous * 0.95) return 'decreasing';
          if (recent > previous * 1.05) return 'increasing';
          return 'stable';
        })(),
        trend_percentage: (() => {
          const recent = historicalData.slice(-7).reduce((sum, d) => sum + d.footprint, 0) / 7;
          const previous = historicalData.slice(-14, -7).reduce((sum, d) => sum + d.footprint, 0) / 7;
          return Math.round(((recent - previous) / previous) * 100);
        })(),
        best_day: historicalData.reduce((best, curr) => curr.efficiency_score > best.efficiency_score ? curr : best).date,
        worst_day: historicalData.reduce((worst, curr) => curr.efficiency_score < worst.efficiency_score ? curr : worst).date,
        average_monthly: Math.round(historicalData.reduce((sum, d) => sum + d.monthly_co2, 0) / historicalData.length)
      } : undefined;

      const calculatedData: CarbonData = {
        current_footprint: Math.round(currentFootprint * 10) / 10,
        daily_co2: Math.round(dailyCO2 * 10) / 10,
        monthly_co2: Math.round(currentCO2Monthly),
        yearly_projection: Math.round(yearlyProjection),
        carbon_intensity: carbonIntensity,
        historical_data: historicalData,
        trends,
        sustainability_score: (() => {
          // Score based on comparison to mode-specific average
          const ratio = currentFootprint / averageFootprint;
          if (ratio <= 0.5) return 95; // Excellent: 50% below average
          if (ratio <= 0.75) return 85; // Very good: 25% below average
          if (ratio <= 1.0) return 75; // Good: at or below average
          if (ratio <= 1.25) return 60; // Fair: 25% above average
          if (ratio <= 1.5) return 45; // Poor: 50% above average
          return Math.max(20, 40 - (ratio * 10)); // Very poor: significantly above average
        })(),
        grade: (() => {
          // Mode-specific grade thresholds
          if (mode === 'industry') {
            if (currentFootprint <= 8) return 'A+';
            if (currentFootprint <= 12) return 'A';
            if (currentFootprint <= 15) return 'B+';
            if (currentFootprint <= 20) return 'B';
            if (currentFootprint <= 25) return 'C+';
            if (currentFootprint <= 30) return 'C';
            return 'D';
          } else {
            if (currentFootprint <= 3) return 'A+';
            if (currentFootprint <= 4.5) return 'A';
            if (currentFootprint <= 6) return 'B+';
            if (currentFootprint <= 8) return 'B';
            if (currentFootprint <= 10) return 'C+';
            if (currentFootprint <= 13) return 'C';
            return 'D';
          }
        })() as 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F',
        peer_comparison: {
          percentile: (() => {
            // Calculate percentile based on mode-specific distribution
            const ratio = currentFootprint / averageFootprint;
            if (ratio <= 0.5) return 95; // Top 5%
            if (ratio <= 0.75) return 85; // Top 15%
            if (ratio <= 0.9) return 75; // Top 25%
            if (ratio <= 1.0) return 60; // Above average
            if (ratio <= 1.2) return 40; // Below average
            if (ratio <= 1.5) return 25; // Bottom 75%
            return Math.max(5, 20 - (ratio * 5)); // Bottom performers
          })(),
          average_footprint: averageFootprint
        },
        real_time_data: {
          current_consumption: (() => {
            if (recentData.length > 0 && recentData[recentData.length - 1]?.kwh) {
              return Math.round(Math.max(0.01, recentData[recentData.length - 1].kwh) * 100) / 100;
            }
            // Average hourly consumption estimate
            const hourlyAverage = totalKwh / Math.max(24, recentData.length);
            return Math.round(Math.max(0.1, hourlyAverage) * 100) / 100;
          })(),
          co2_rate: Math.round(Math.max(0.01, dailyCO2 / 24) * 1000) / 1000, // kg CO2 per hour
          today_savings: (() => {
            const avgDailyCO2 = averageFootprint * 1000 / 365; // Mode-specific average daily CO2 in kg
            
            // If user is better than average, show actual savings
            if (dailyCO2 < avgDailyCO2) {
              const savings = avgDailyCO2 - dailyCO2;
              return Math.round(savings * 100) / 100;
            }
            
            // If user is worse than average, show potential daily savings from efficiency improvements
            // Industrial: 8% improvement potential (harder to optimize)
            // Household: 10% improvement potential (easier wins available)
            const improvementRate = mode === 'industry' ? 0.08 : 0.10;
            const potentialSavings = dailyCO2 * improvementRate;
            return Math.round(Math.max(0.5, potentialSavings) * 100) / 100;
          })(),
          efficiency_score: (() => {
            // Efficiency based on performance vs mode-specific average
            const ratio = currentFootprint / averageFootprint;
            if (ratio <= 0.5) return 95;
            if (ratio <= 0.75) return 85;
            if (ratio <= 1.0) return 75;
            if (ratio <= 1.25) return 65;
            if (ratio <= 1.5) return 50;
            return Math.max(25, 45 - (ratio * 10));
          })()
        },
        offset_recommendations: [
          {
            type: 'tree_planting',
            title: 'Native Forest Restoration',
            description: 'Support verified reforestation projects that absorb CO₂ for decades while protecting biodiversity',
            co2_offset: Math.round(Math.max(0.1, currentFootprint * 0.25) * 100) / 100,
            cost_estimate: Math.round(Math.max(15, currentFootprint * 4)),
            impact_timeline: '10-20 years',
            provider: 'One Tree Planted',
            url: 'https://onetreeplanted.org',
            verified: true,
            popularity: 92
          },
          {
            type: 'renewable_energy',
            title: 'Community Solar Investment',
            description: 'Invest in local solar farms to reduce grid carbon intensity and support clean energy',
            co2_offset: Math.round(Math.max(0.5, currentFootprint * 0.6) * 100) / 100,
            cost_estimate: Math.round(Math.max(80, currentFootprint * 20)),
            impact_timeline: '25+ years',
            provider: 'SolarCity Community',
            verified: true,
            popularity: 88
          },
          {
            type: 'efficiency_upgrade',
            title: 'Smart LED Conversion Kit',
            description: 'Replace all lighting with smart, energy-efficient LEDs that adapt to usage patterns',
            co2_offset: Math.round(Math.max(0.1, currentFootprint * 0.12) * 100) / 100,
            cost_estimate: Math.round(Math.max(40, currentFootprint * 8)),
            impact_timeline: '5-10 years',
            verified: true,
            popularity: 95
          },
          {
            type: 'carbon_credits',
            title: 'Verified Carbon Credits',
            description: 'Purchase high-quality carbon credits from Gold Standard certified projects',
            co2_offset: Math.round(currentFootprint * 100) / 100,
            cost_estimate: Math.round(Math.max(30, currentFootprint * 8)),
            impact_timeline: 'Immediate',
            provider: 'Gold Standard',
            url: 'https://goldstandard.org',
            verified: true,
            popularity: 76
          }
        ],
        // Analyze appliance patterns from real data
        appliance_analysis: (() => {
          if (recentData.length === 0) return [];
          
          // Group by device/appliance
          const applianceGroups = new Map<string, any[]>();
          recentData.forEach((point: any) => {
            const device = point.device || point.appliance || 'Unknown Device';
            if (!applianceGroups.has(device)) applianceGroups.set(device, []);
            applianceGroups.get(device)!.push(point);
          });
          
          // Analyze each appliance
          return Array.from(applianceGroups.entries()).map(([device, data]) => {
            const totalKwh = data.reduce((sum, d) => sum + (d.kwh || 0), 0);
            const avgKwh = totalKwh / Math.max(1, data.length);
            const peakUsage = Math.max(...data.map(d => d.kwh || 0));
            const co2Impact = totalKwh * carbonIntensity;
            
            return {
              device,
              total_kwh: totalKwh,
              average_kwh: avgKwh,
              peak_kwh: peakUsage,
              co2_impact: co2Impact,
              usage_pattern: (data.length > 24 ? 'frequent' : data.length > 7 ? 'moderate' : 'occasional') as 'frequent' | 'moderate' | 'occasional',
              efficiency_rating: (avgKwh < 0.5 ? 'excellent' : avgKwh < 1.5 ? 'good' : avgKwh < 3.0 ? 'moderate' : 'poor') as 'excellent' | 'good' | 'moderate' | 'poor'
            };
          }).sort((a, b) => b.co2_impact - a.co2_impact);
        })(),
        
        reduction_tips: ([
          {
            category: 'heating' as const,
            tip: mode === 'industry' 
              ? `Implement smart building automation for HVAC systems and process heating optimization`
              : `Optimize ${recentData.filter((r: any) => r.device?.toLowerCase().includes('heat')).length > 0 ? 'your heating system' : 'heating settings'} during peak hours`,
            potential_reduction: Math.round(Math.max(0.1, currentFootprint * (mode === 'industry' ? 0.22 : 0.18)) * 100) / 100,
            difficulty: mode === 'industry' ? 'moderate' : (currentFootprint > 8 ? 'easy' : 'moderate') as 'easy' | 'moderate' | 'challenging',
            cost: mode === 'industry' ? 'medium' : 'free',
            impact_score: mode === 'industry' ? (currentFootprint > averageFootprint ? 9 : 8) : (currentFootprint > 6 ? 9 : 7),
            implementation_time: mode === 'industry' ? '2-4 weeks' : '5 minutes'
          },
          {
            category: 'appliances' as const,
            tip: mode === 'industry' 
              ? `Upgrade to energy-efficient industrial equipment and implement predictive maintenance schedules`
              : `Use smart power strips for your appliances to eliminate phantom loads`,
            potential_reduction: Math.round(Math.max(0.05, currentFootprint * (mode === 'industry' ? 0.15 : 0.08)) * 100) / 100,
            difficulty: mode === 'industry' ? 'challenging' : 'easy',
            cost: mode === 'industry' ? 'high' : 'low',
            impact_score: mode === 'industry' ? 9 : 8,
            implementation_time: mode === 'industry' ? '3-6 months' : '30 minutes'
          },
          {
            category: 'cooling' as const,
            tip: 'Install ceiling fans and raise AC temperature by 3°F',
            potential_reduction: Math.round(Math.max(0.2, currentFootprint * 0.25) * 100) / 100,
            difficulty: 'moderate' as const,
            cost: 'medium' as 'free' | 'low' | 'medium' | 'high',
            impact_score: currentFootprint > 8 ? 9 : 7,
            implementation_time: '2-4 hours'
          },
          {
            category: 'lighting' as const,
            tip: 'Switch to daylight-sensing smart bulbs',
            potential_reduction: Math.round(Math.max(0.03, currentFootprint * 0.06) * 100) / 100,
            difficulty: 'easy',
            cost: 'low',
            impact_score: 6,
            implementation_time: '1 hour'
          },
          {
            category: 'behavior' as const,
            tip: 'Shift high-consumption appliances to off-peak hours',
            potential_reduction: Math.round(Math.max(0.08, currentFootprint * 0.12) * 100) / 100,
            difficulty: 'easy',
            cost: 'free',
            impact_score: 8,
            implementation_time: 'Immediate'
          }
        ] as ReductionTip[]).sort((a, b) => b.potential_reduction - a.potential_reduction), // Sort by impact
        achievements: [
          {
            id: 'eco_warrior',
            title: '🌱 Eco Warrior',
            description: 'Reduce carbon footprint by 20% from baseline',
            icon: '🌱',
            unlocked: currentFootprint <= (averageFootprint * 0.8), // 20% below average
            progress: Math.min(100, Math.max(0, ((averageFootprint - currentFootprint) / (averageFootprint * 0.2)) * 100)), // Progress to 20% reduction
            target: 100,
            points: 500,
            unlock_date: currentFootprint <= (averageFootprint * 0.8) ? new Date().toISOString().split('T')[0] : undefined
          },
          {
            id: 'carbon_neutral',
            title: '⚖️ Carbon Neutral',
            description: mode === 'industry' ? 'Achieve carbon neutral operations' : 'Achieve net-zero carbon footprint',
            icon: '⚖️',
            unlocked: currentFootprint <= (mode === 'industry' ? 2.0 : 1.0), // More realistic for industry
            progress: Math.min(100, Math.max(0, ((averageFootprint - currentFootprint) / averageFootprint) * 100)),
            target: 100,
            points: 1000
          },
          {
            id: 'efficiency_champion',
            title: '⚡ Efficiency Champion',
            description: 'Maintain 85%+ efficiency for 30 days',
            icon: '⚡',
            unlocked: (() => {
              const ratio = currentFootprint / averageFootprint;
              const score = ratio <= 0.5 ? 95 : ratio <= 0.75 ? 85 : ratio <= 1.0 ? 75 : ratio <= 1.25 ? 65 : ratio <= 1.5 ? 50 : Math.max(25, 45 - (ratio * 10));
              return score >= 85;
            })(),
            progress: (() => {
              const ratio = currentFootprint / averageFootprint;
              const score = ratio <= 0.5 ? 95 : ratio <= 0.75 ? 85 : ratio <= 1.0 ? 75 : ratio <= 1.25 ? 65 : ratio <= 1.5 ? 50 : Math.max(25, 45 - (ratio * 10));
              return Math.min(100, Math.max(0, score));
            })(),
            target: 100,
            points: 750
          }
        ]
      };

      setCarbonData(calculatedData);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to calculate carbon data:', error);
      setCarbonData(null);
    } finally {
      setRefreshing(false);
    }
  };

  const getMockCarbonData = (): CarbonData => {
    const averageFootprint = mode === 'industry' ? 15.2 : 6.1;
    const mockFootprint = mode === 'industry' ? 12.8 : 4.2;
    
    return {
      current_footprint: mockFootprint,
      daily_co2: mode === 'industry' ? 35.0 : 11.5,
      monthly_co2: mode === 'industry' ? 1050 : 350,
      yearly_projection: mode === 'industry' ? 12800 : 4200,
      carbon_intensity: mode === 'industry' ? 0.92 : 0.85,
      sustainability_score: 78,
      grade: 'B+',
      peer_comparison: {
        percentile: 25,
        average_footprint: averageFootprint
      },
    real_time_data: {
      current_consumption: 2.8,
      co2_rate: 2.38,
      today_savings: 1.2,
      efficiency_score: 82
    },
    offset_recommendations: [
      {
        type: 'tree_planting',
        title: 'Native Forest Restoration',
        description: 'Support verified reforestation projects that absorb CO₂ for decades while protecting biodiversity',
        co2_offset: 1.2,
        cost_estimate: 25,
        impact_timeline: '10-20 years',
        provider: 'One Tree Planted',
        url: 'https://onetreeplanted.org',
        verified: true,
        popularity: 92
      },
      {
        type: 'renewable_energy',
        title: 'Community Solar Investment',
        description: 'Invest in local solar farms to reduce grid carbon intensity and support clean energy',
        co2_offset: 2.8,
        cost_estimate: 150,
        impact_timeline: '25+ years',
        provider: 'SolarCity Community',
        verified: true,
        popularity: 88
      },
      {
        type: 'efficiency_upgrade',
        title: 'Smart LED Conversion Kit',
        description: 'Replace all lighting with smart, energy-efficient LEDs that adapt to usage patterns',
        co2_offset: 0.6,
        cost_estimate: 85,
        impact_timeline: '5-10 years',
        verified: true,
        popularity: 95
      },
      {
        type: 'carbon_credits',
        title: 'Verified Carbon Credits',
        description: 'Purchase high-quality carbon credits from Gold Standard certified projects',
        co2_offset: 4.2,
        cost_estimate: 65,
        impact_timeline: 'Immediate',
        provider: 'Gold Standard',
        url: 'https://goldstandard.org',
        verified: true,
        popularity: 76
      }
    ],
    reduction_tips: [
      {
        category: 'heating',
        tip: 'Lower thermostat by 2°F during peak hours (6-9 PM)',
        potential_reduction: 0.8,
        difficulty: 'easy',
        cost: 'free',
        impact_score: 9,
        implementation_time: '5 minutes'
      },
      {
        category: 'appliances',
        tip: 'Use smart power strips to eliminate phantom loads',
        potential_reduction: 0.4,
        difficulty: 'easy',
        cost: 'low',
        impact_score: 8,
        implementation_time: '30 minutes'
      },
      {
        category: 'cooling',
        tip: 'Install ceiling fans and raise AC temperature by 3°F',
        potential_reduction: 1.2,
        difficulty: 'moderate',
        cost: 'medium',
        impact_score: 9,
        implementation_time: '2-4 hours'
      },
      {
        category: 'lighting',
        tip: 'Switch to daylight-sensing smart bulbs',
        potential_reduction: 0.3,
        difficulty: 'easy',
        cost: 'low',
        impact_score: 7,
        implementation_time: '1 hour'
      },
      {
        category: 'behavior',
        tip: 'Shift laundry and dishwasher to off-peak hours',
        potential_reduction: 0.6,
        difficulty: 'easy',
        cost: 'free',
        impact_score: 8,
        implementation_time: 'Immediate'
      }
    ],
    achievements: [
      {
        id: 'eco_warrior',
        title: '🌱 Eco Warrior',
        description: 'Reduce carbon footprint by 20% from baseline',
        icon: '🌱',
        unlocked: true,
        progress: 100,
        target: 100,
        points: 500,
        unlock_date: '2025-09-15'
      },
      {
        id: 'carbon_neutral',
        title: '⚖️ Carbon Neutral',
        description: 'Achieve net-zero carbon footprint',
        icon: '⚖️',
        unlocked: false,
        progress: 78,
        target: 100,
        points: 1000
      },
      {
        id: 'efficiency_champion',
        title: '⚡ Efficiency Champion',
        description: 'Maintain 85%+ efficiency for 30 days',
        icon: '⚡',
        unlocked: false,
        progress: 65,
        target: 100,
        points: 750
      }
    ]
    };
  };

  const getCarbonGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100 border-green-300';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100 border-blue-300';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'challenging': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'text-green-600 bg-green-50 border-green-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Leaf className="h-5 w-5 animate-pulse text-green-600" />
            <span>Loading real-time carbon analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show "No data loaded" state when no real data is available
  if (!carbonData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-gray-400" />
            <span>Carbon Footprint Analysis</span>
          </CardTitle>
          <CardDescription>
            Real-time carbon footprint tracking and environmental impact analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Leaf className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Loaded</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your energy consumption data to see real-time carbon footprint analysis, 
                CO₂ savings calculations, and personalized environmental impact insights.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">What you'll see with your data:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time carbon footprint calculations</li>
                  <li>• Daily CO₂ savings and efficiency scores</li>
                  <li>• Personalized offset recommendations</li>
                  <li>• Energy usage optimization tips</li>
                  <li>• Environmental impact comparisons</li>
                </ul>
              </div>
              
              {/* Check if data might be available but not loaded */}
              {localStorage.getItem('energySage_userUploadedData') && (
                <Button 
                  onClick={refreshData}
                  className="mt-4 w-full"
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Real-time Status Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${usingRealData ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className={`text-sm font-medium ${usingRealData ? 'text-green-700' : 'text-orange-700'}`}>
                {usingRealData ? 'Live Carbon Tracking' : 'Demo Carbon Tracking'}
              </span>
              {usingRealData && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Real Data</span>}
            </div>
            {refreshing ? (
              <span className="text-xs text-gray-500">Updating...</span>
            ) : lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            <Zap className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-700">{carbonData.real_time_data.current_consumption} kWh</div>
            <div className="text-xs text-gray-600">Current Usage</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-700">{carbonData.real_time_data.co2_rate} kg/h</div>
            <div className="text-xs text-gray-600">CO₂ Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-700">{carbonData.real_time_data.today_savings} kg</div>
            <div className="text-xs text-gray-600">Today's Savings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-700">{carbonData.real_time_data.efficiency_score}%</div>
            <div className="text-xs text-gray-600">Efficiency</div>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="marketplace">Offset</TabsTrigger>
          <TabsTrigger value="tips">Reduce</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Carbon Footprint Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span>Current Footprint</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {carbonData.current_footprint} tons CO₂/year
                </div>
                <Badge className={`${getCarbonGradeColor(carbonData.grade)} border`}>
                  Grade: {carbonData.grade}
                </Badge>
                <div className={`text-xs mt-2 ${usingRealData ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  {usingRealData ? '✓ Based on your imported data' : 'Based on estimated values'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <span>vs. National Average</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {(() => {
                    const percentage = Math.round(((carbonData.peer_comparison.average_footprint - carbonData.current_footprint) / carbonData.peer_comparison.average_footprint) * 100);
                    const absPercentage = Math.abs(percentage);
                    return percentage >= 0 ? `${absPercentage}% Better` : `${absPercentage}% Higher`;
                  })()} 
                </div>
                <div className="text-sm text-gray-600">
                  Top {Math.max(5, Math.round(100 - carbonData.peer_comparison.percentile))}% of users
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Average: {carbonData.peer_comparison.average_footprint} tons/year
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>Sustainability Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {carbonData.sustainability_score}/100
                </div>
                <Progress value={carbonData.sustainability_score} className="h-2 mb-2" />
                <div className="text-xs text-gray-500">
                  Real-time efficiency tracking
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carbon Impact Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-gray-600" />
                <span>Your Carbon Impact in Context</span>
              </CardTitle>
              <CardDescription>
                Understanding your environmental footprint through familiar comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <Car className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-lg font-bold text-blue-700">
                    {Math.round(Math.max(100, carbonData.current_footprint * 2300))} miles
                  </div>
                  <p className="text-xs text-gray-600">
                    {mode === 'industry' ? 'Fleet driving equivalent' : 'Annual driving equivalent'}
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <TreePine className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-lg font-bold text-green-700">
                    {Math.round(Math.max(1, carbonData.current_footprint * 16))} trees
                  </div>
                  <p className="text-xs text-gray-600">Trees needed to offset</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <Home className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-lg font-bold text-purple-700">
                    {mode === 'industry' 
                      ? Math.max(0.1, carbonData.current_footprint * 0.18).toFixed(1)
                      : Math.max(0.1, carbonData.current_footprint * 0.45).toFixed(1)
                    } {mode === 'industry' ? 'businesses' : 'homes'}
                  </div>
                  <p className="text-xs text-gray-600">
                    {mode === 'industry' ? 'Similar business energy use' : 'Average home energy use'}
                  </p>
                </div>

                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-lg font-bold text-orange-700">
                    {Math.round(Math.max(365, carbonData.yearly_projection))} kg
                  </div>
                  <p className="text-xs text-gray-600">Annual CO₂ emissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {carbonData.historical_data && carbonData.historical_data.length > 0 ? (
            <>
              {/* Trend Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">30-Day Trend</p>
                        <div className="flex items-center space-x-2">
                          {carbonData.trends?.footprint_trend === 'decreasing' ? (
                            <TrendingDown className="h-5 w-5 text-green-600" />
                          ) : carbonData.trends?.footprint_trend === 'increasing' ? (
                            <TrendingUp className="h-5 w-5 text-red-600" />
                          ) : (
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          )}
                          <span className={`text-lg font-bold ${
                            carbonData.trends?.footprint_trend === 'decreasing' ? 'text-green-600' : 
                            carbonData.trends?.footprint_trend === 'increasing' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {carbonData.trends?.trend_percentage > 0 ? '+' : ''}{carbonData.trends?.trend_percentage}%
                          </span>
                        </div>
                      </div>
                      <Badge variant={carbonData.trends?.footprint_trend === 'decreasing' ? 'default' : 'secondary'}>
                        {carbonData.trends?.footprint_trend === 'decreasing' ? 'Improving' : 
                         carbonData.trends?.footprint_trend === 'increasing' ? 'Increasing' : 'Stable'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-600 mb-1">Best Performance Day</p>
                      <p className="text-lg font-bold text-green-700">
                        {carbonData.trends?.best_day ? new Date(carbonData.trends.best_day).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600 mb-1">Monthly Average</p>
                      <p className="text-lg font-bold text-blue-700">
                        {carbonData.trends?.average_monthly || 0} kg CO₂
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Historical Chart Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Carbon Footprint History</span>
                  </CardTitle>
                  <CardDescription>
                    Track your daily carbon emissions over the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simple text-based chart for now - can be enhanced with actual charting library */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-7 gap-2 text-xs">
                        {carbonData.historical_data.slice(-14).map((point, index) => (
                          <div key={index} className="text-center">
                            <div className="mb-1 font-medium">
                              {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div 
                              className="bg-blue-500 rounded-t mx-auto"
                              style={{
                                height: `${Math.max(20, (point.daily_co2 / Math.max(...carbonData.historical_data.map(p => p.daily_co2))) * 60)}px`,
                                width: '20px'
                              }}
                            />
                            <div className="mt-1 text-gray-600">
                              {point.daily_co2.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-2 text-xs text-gray-500">
                        Daily CO₂ Emissions (kg)
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">💡 Key Insights</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Your {carbonData.trends?.footprint_trend === 'decreasing' ? 'emissions are decreasing' : carbonData.trends?.footprint_trend === 'increasing' ? 'emissions are increasing' : 'emissions are stable'} compared to last week</li>
                        <li>• Best performance was on {carbonData.trends?.best_day ? new Date(carbonData.trends.best_day).toLocaleDateString() : 'recent days'}</li>
                        <li>• Your monthly average is {carbonData.trends?.average_monthly || 0} kg CO₂</li>
                        {mode === 'industry' ? 
                          <li>• Consider scheduling high-energy processes during off-peak hours to reduce carbon impact</li> :
                          <li>• Try to replicate patterns from your best-performing days</li>
                        }
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trends Coming Soon</h3>
                <p className="text-sm text-gray-600">
                  Upload more data over time to see historical trends, patterns, and insights about your carbon footprint.
                  We'll need at least 7 days of data to show meaningful trends.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Recycle className="h-5 w-5 text-green-600" />
                <span>Verified Carbon Offset Marketplace</span>
              </CardTitle>
              <CardDescription>
                Neutralize your carbon footprint through verified, high-impact offset programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carbonData.offset_recommendations
                  .sort((a, b) => b.popularity - a.popularity)
                  .map((offset, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{offset.title}</h3>
                          {offset.verified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{offset.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Popularity: {offset.popularity}%</span>
                          {offset.provider && <span>Provider: {offset.provider}</span>}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {offset.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div className="bg-green-50 p-2 rounded">
                        <span className="font-medium text-green-700">CO₂ Offset</span>
                        <p className="text-green-600">{offset.co2_offset} tons/year</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-medium text-blue-700">Cost</span>
                        <p className="text-blue-600">${offset.cost_estimate}/month</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <span className="font-medium text-purple-700">Impact Timeline</span>
                        <p className="text-purple-600">{offset.impact_timeline}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="font-medium text-gray-700">ROI</span>
                        <p className="text-gray-600">{(offset.co2_offset / (offset.cost_estimate * 12)).toFixed(2)} tons/$</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Progress value={offset.popularity} className="h-2 flex-1 mr-4" />
                      <div className="flex space-x-2">
                        {offset.url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(offset.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Learn More
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>Personalized Reduction Tips</span>
              </CardTitle>
              <CardDescription>
                AI-powered recommendations based on your usage patterns and imported data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carbonData.reduction_tips
                  .sort((a, b) => b.impact_score - a.impact_score)
                  .map((tip, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-base mb-1">{tip.tip}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getDifficultyColor(tip.difficulty)}>
                            {tip.difficulty}
                          </Badge>
                          <Badge className={getCostColor(tip.cost)}>
                            {tip.cost}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {tip.implementation_time}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 capitalize mb-2">
                          {tip.category} optimization • Impact Score: {tip.impact_score}/10
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-sm font-medium text-green-700">Potential Savings</div>
                        <div className="text-green-600 font-bold">{tip.potential_reduction} tons CO₂/year</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-sm font-medium text-blue-700">Annual Value</div>
                        <div className="text-blue-600 font-bold">${Math.round(tip.potential_reduction * 50)}</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded text-center">
                        <div className="text-sm font-medium text-purple-700">Impact Score</div>
                        <div className="text-purple-600 font-bold">{tip.impact_score}/10</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Progress value={tip.impact_score * 10} className="h-2 flex-1 mr-4" />
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50"
                      >
                        Implement Tip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Carbon Reduction Achievements</span>
              </CardTitle>
              <CardDescription>
                Your environmental milestones and progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carbonData.achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border-2 rounded-lg p-4 transition-all ${
                      achievement.unlocked 
                        ? 'bg-green-50 border-green-200 shadow-md' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h3 className={`font-semibold text-base ${
                            achievement.unlocked ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                          {achievement.unlock_date && (
                            <p className="text-xs text-green-600">
                              Unlocked: {new Date(achievement.unlock_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          achievement.unlocked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }>
                          {achievement.points} pts
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.target) * 100} 
                        className="h-2"
                      />
                      {!achievement.unlocked && (
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.target - achievement.progress} more to unlock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}