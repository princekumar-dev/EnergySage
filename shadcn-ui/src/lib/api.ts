// API client for EnergySage backend
export interface EnergyReading {
  timestamp: string;
  device: string;
  kwh: number;
  machine_id?: string;
  process_id?: string;
  // Real-time simulation fields
  cumulativeKwh?: number; // Cumulative consumption total
  sessionStartTime?: string; // When simulation started
}

export interface User {
  id: string;
  email: string;
  mode: 'household' | 'industry';
}

export interface Prediction {
  timestamp: string;
  predicted_kwh: number;
  confidence_interval: [number, number];
}

export interface Anomaly {
  timestamp: string;
  device: string;
  actual_kwh: number;
  expected_kwh: number;
  severity: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  device: string;
  estimated_savings_kwh: number;
  estimated_savings_cost: number;
  estimated_co2_reduction: number;
  priority: 'low' | 'medium' | 'high';
  category: 'scheduling' | 'efficiency' | 'maintenance' | 'replacement';
}

export interface EnergyScore {
  overall_score: number; // 0-100
  efficiency_score: number;
  sustainability_score: number;
  cost_optimization_score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  recommendations_count: number;
}

// Grid Load Monitoring Interfaces
export interface GridLoadData {
  timestamp: string;
  area_code: string;
  current_load_mw: number;
  capacity_mw: number;
  load_percentage: number;
  status: 'normal' | 'high' | 'critical' | 'peak';
  predicted_peak_time?: string;
}

export interface NeighborhoodAlert {
  id: string;
  timestamp: string;
  area_code: string;
  alert_type: 'load_spike' | 'peak_warning' | 'capacity_risk' | 'load_shift_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affected_households: number;
  duration_minutes: number;
  recommendations: LoadShiftRecommendation[];
}

export interface LoadShiftRecommendation {
  appliance_type: string;
  current_usage_kwh: number;
  suggested_shift_hours: number;
  alternative_time_slots: string[];
  potential_savings: number;
  grid_impact_reduction: number;
  priority: 'low' | 'medium' | 'high';
}

export interface GridAwareness {
  user_area: string;
  current_grid_status: GridLoadData;
  active_alerts: NeighborhoodAlert[];
  load_forecast: GridLoadData[];
  user_impact_score: number;
  recommended_actions: LoadShiftRecommendation[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  weather_type: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  timestamp: string;
}

export interface SmartAlert {
  id: string;
  type: 'energy_spike' | 'cost_warning' | 'maintenance_due' | 'weather_advisory';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  device?: string;
  timestamp: string;
  action_required: boolean;
}

export interface PredictiveMaintenance {
  device: string;
  health_score: number; // 0-100
  estimated_failure_date?: string;
  maintenance_type: 'cleaning' | 'repair' | 'replacement';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimated_cost: number;
}

export interface BenchmarkData {
  user_consumption: number;
  peer_average: number;
  top_10_percent: number;
  efficiency_ranking: number; // percentile
  similar_properties_count: number;
}

export interface PeakDemandForecast {
  predicted_peak_time: string;
  predicted_peak_demand: number;
  confidence: number;
  load_shifting_potential: number;
  cost_impact: number;
}

export interface ApplianceDetail {
  name: string;
  type: string;
  brand?: string;
  model?: string;
  rated_power: number; // watts
  energy_efficiency_rating?: string; // A+, A, B, etc.
  age_years?: number;
  usage_hours_per_day?: number;
  location?: string; // room/area
  purchase_date?: string;
  warranty_expiry?: string;
  maintenance_schedule?: string;
}

export interface ImportedApplianceData {
  appliances: ApplianceDetail[];
  consumption_data: EnergyReading[];
  import_timestamp: string;
  total_appliances: number;
}

export interface CostData {
  total_cost: number;
  total_co2: number;
  cost_per_kwh: number;
  co2_factor: number;
  location: string;
}

// Utility functions
const getEfficiencySavings = (currentRating: string): number => {
  const rating = currentRating.toLowerCase();
  if (rating.includes('f') || rating.includes('d')) return 0.4; // 40% savings from F/D to A+
  if (rating.includes('c')) return 0.3; // 30% savings from C to A+
  if (rating.includes('b') && !rating.includes('+')) return 0.2; // 20% savings from B to A+
  if (rating.includes('b+')) return 0.15; // 15% savings from B+ to A+
  return 0.1; // 10% default savings
};

// Time-based analysis utility functions
const getTimeShift = (timestamp: string): TimeShift => {
  const hour = new Date(timestamp).getHours();
  return TIME_SHIFTS.find(shift => {
    if (shift.name === 'night') {
      return hour >= shift.startHour || hour < shift.endHour;
    }
    return hour >= shift.startHour && hour < shift.endHour;
  }) || TIME_SHIFTS[0];
};

const calculateShiftPattern = (readings: EnergyReading[], device: string, shift: TimeShift): ShiftUsagePattern => {
  const shiftReadings = readings.filter(r => {
    const readingShift = getTimeShift(r.timestamp);
    return r.device === device && readingShift.name === shift.name;
  });

  if (shiftReadings.length === 0) {
    return {
      shift,
      device,
      averageKwh: 0,
      peakKwh: 0,
      lowKwh: 0,
      usageFrequency: 0,
      typicalPattern: 'off'
    };
  }

  // Detect industrial equipment
  const isIndustrialDevice = device.includes('Production Line') || device.includes('Compressor') || 
                            device.includes('Boiler') || device.includes('HVAC System') ||
                            shiftReadings.some(r => r.kwh > 30);

  const kwhValues = shiftReadings.map(r => r.kwh);
  
  // Enhanced analysis for industrial equipment
  let averageKwh: number;
  let peakKwh: number;
  let lowKwh: number;
  
  if (isIndustrialDevice) {
    // Use more stable calculations for industrial equipment
    const sortedValues = [...kwhValues].sort((a, b) => a - b);
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    
    // Remove outliers for more stable average (use IQR method)
    const iqr = q3 - q1;
    const lowerBound = q1 - (1.5 * iqr);
    const upperBound = q3 + (1.5 * iqr);
    const filteredValues = kwhValues.filter(v => v >= lowerBound && v <= upperBound);
    
    // Weighted average: 70% filtered mean, 30% median
    const filteredMean = filteredValues.length > 0 
      ? filteredValues.reduce((sum, kwh) => sum + kwh, 0) / filteredValues.length
      : median;
    averageKwh = (filteredMean * 0.7) + (median * 0.3);
    
    // Use percentiles for more stable peak/low values
    peakKwh = sortedValues[Math.floor(sortedValues.length * 0.95)]; // 95th percentile
    lowKwh = sortedValues[Math.floor(sortedValues.length * 0.05)];   // 5th percentile
  } else {
    // Standard calculation for household equipment
    averageKwh = kwhValues.reduce((sum, kwh) => sum + kwh, 0) / kwhValues.length;
    peakKwh = Math.max(...kwhValues);
    lowKwh = Math.min(...kwhValues);
  }

  // Enhanced usage frequency calculation
  const significantUsageThreshold = isIndustrialDevice ? 1.0 : 0.1; // Higher threshold for industrial
  const usageFrequency = shiftReadings.filter(r => r.kwh > significantUsageThreshold).length / shiftReadings.length;

  // Industrial-aware pattern classification
  let typicalPattern: 'high' | 'medium' | 'low' | 'off';
  if (isIndustrialDevice) {
    // Industrial equipment pattern classification
    const loadFactor = averageKwh / peakKwh;
    if (loadFactor > 0.8 && averageKwh > 20) typicalPattern = 'high';      // Consistent high load
    else if (loadFactor > 0.6 && averageKwh > 10) typicalPattern = 'medium'; // Moderate consistent load
    else if (averageKwh > 2) typicalPattern = 'low';                      // Low but active
    else typicalPattern = 'off';
  } else {
    // Standard household pattern classification
    if (averageKwh > peakKwh * 0.7) typicalPattern = 'high';
    else if (averageKwh > peakKwh * 0.3) typicalPattern = 'medium';
    else if (averageKwh > 0.1) typicalPattern = 'low';
    else typicalPattern = 'off';
  }

  return {
    shift,
    device,
    averageKwh,
    peakKwh,
    lowKwh,
    usageFrequency,
    typicalPattern
  };
};

const generateThresholds = (patterns: ShiftUsagePattern[]): ThresholdConfig[] => {
  return patterns.map(pattern => {
    const baseThreshold = pattern.averageKwh;
    const wastageMultiplier = 1.5; // 50% above average is wastage
    const anomalyMultiplier = 2.0; // 100% above average is anomaly
    const efficiencyTarget = pattern.averageKwh * 0.85; // 15% reduction target

    return {
      device: pattern.device,
      shift: pattern.shift.name,
      normalRange: [pattern.lowKwh, pattern.peakKwh],
      wastageThreshold: baseThreshold * wastageMultiplier,
      anomalyThreshold: baseThreshold * anomalyMultiplier,
      efficiencyTarget
    };
  });
};

const predictNextUsage = (readings: EnergyReading[], device: string): PredictiveModel => {
  const deviceReadings = readings.filter(r => r.device === device).slice(-168); // Last 7 days
  
  if (deviceReadings.length < 24) {
    return {
      device,
      nextHourPrediction: 0,
      next24HoursPrediction: Array(24).fill(0),
      confidenceScore: 0,
      trendDirection: 'stable',
      seasonalFactor: 1
    };
  }

  // Detect if this is industrial equipment
  const isIndustrialDevice = device.includes('Production Line') || device.includes('Compressor') || 
                            device.includes('Boiler') || device.includes('HVAC System') ||
                            deviceReadings.some(r => r.kwh > 30);

  // Enhanced trend analysis with industrial stability
  const recent24h = deviceReadings.slice(-24);
  const previous24h = deviceReadings.slice(-48, -24);
  const week1 = deviceReadings.slice(-168, -120); // Days 2-3 ago
  const week2 = deviceReadings.slice(-120, -72);   // Days 4-5 ago
  
  const recentAvg = recent24h.reduce((sum, r) => sum + r.kwh, 0) / recent24h.length;
  const previousAvg = previous24h.length > 0 
    ? previous24h.reduce((sum, r) => sum + r.kwh, 0) / previous24h.length 
    : recentAvg;
  const weeklyAvg = [...week1, ...week2].length > 0
    ? [...week1, ...week2].reduce((sum, r) => sum + r.kwh, 0) / [...week1, ...week2].length
    : recentAvg;

  // More conservative trend detection for industrial equipment
  const trendThreshold = isIndustrialDevice ? 1.05 : 1.1; // Industry: 5% vs Household: 10%
  const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
    recentAvg > previousAvg * trendThreshold ? 'increasing' :
    recentAvg < previousAvg * (2 - trendThreshold) ? 'decreasing' : 'stable';

  // Generate 24-hour prediction with industrial load patterns
  const hourlyAverages = Array(24).fill(0).map((_, hour) => {
    const hourReadings = deviceReadings.filter(r => new Date(r.timestamp).getHours() === hour);
    if (hourReadings.length === 0) return 0;
    
    let average = hourReadings.reduce((sum, r) => sum + r.kwh, 0) / hourReadings.length;
    
    // Apply industrial equipment load factor smoothing
    if (isIndustrialDevice) {
      // Industrial equipment has more predictable patterns
      const medianUsage = [...hourReadings].sort((a, b) => a.kwh - b.kwh)[Math.floor(hourReadings.length / 2)]?.kwh || average;
      const smoothedAverage = (average * 0.6) + (medianUsage * 0.4); // 60% average, 40% median
      average = smoothedAverage;
      
      // Apply industrial work schedule factors
      if (hour >= 6 && hour <= 18) {
        // Work hours: more stable, higher load
        average *= 1.0; // No change during work hours
      } else if (hour >= 19 && hour <= 22) {
        // Evening: reduced but consistent load
        average *= 0.75;
      } else {
        // Night: minimal but baseline load
        average *= 0.45;
      }
    }
    
    return average;
  });

  const currentHour = new Date().getHours();
  const nextHourPrediction = hourlyAverages[(currentHour + 1) % 24];

  // Apply more conservative trend factor for industrial equipment
  const baseTrendFactor = trendDirection === 'increasing' ? 1.05 : 
                         trendDirection === 'decreasing' ? 0.95 : 1.0;
  const trendFactor = isIndustrialDevice ? 
    (1 + (baseTrendFactor - 1) * 0.5) : // Industry: 50% of trend effect
    baseTrendFactor;

  // Apply weekly pattern stabilization for industrial equipment
  let next24HoursPrediction = hourlyAverages.map((avg, hour) => {
    let prediction = avg * trendFactor;
    
    if (isIndustrialDevice) {
      // Stabilize predictions using weekly patterns
      const weeklyFactor = (prediction + weeklyAvg) / 2;
      const stabilizationWeight = 0.15; // 15% weekly stabilization
      prediction = (prediction * (1 - stabilizationWeight)) + (weeklyFactor * stabilizationWeight);
    }
    
    return prediction;
  });

  // Calculate enhanced confidence score
  const dataQuality = Math.min(1, deviceReadings.length / 168); // 7 days = 100% quality
  const patternConsistency = isIndustrialDevice ? 0.9 : 0.8; // Industrial equipment is more consistent
  const trendStability = trendDirection === 'stable' ? 1.0 : 0.85;
  
  const confidenceScore = Math.round(dataQuality * patternConsistency * trendStability * 100);

  return {
    device,
    nextHourPrediction: nextHourPrediction * trendFactor,
    next24HoursPrediction,
    confidenceScore: Math.min(98, confidenceScore), // Cap at 98% for realism
    trendDirection,
    seasonalFactor: trendFactor
  };
};

// Time-based analysis interfaces
export interface TimeShift {
  name: 'morning' | 'afternoon' | 'evening' | 'night';
  startHour: number;
  endHour: number;
  description: string;
}

export interface ShiftUsagePattern {
  shift: TimeShift;
  device: string;
  averageKwh: number;
  peakKwh: number;
  lowKwh: number;
  usageFrequency: number; // 0-1, how often device is used in this shift
  typicalPattern: 'high' | 'medium' | 'low' | 'off';
}

export interface PredictiveModel {
  device: string;
  nextHourPrediction: number;
  next24HoursPrediction: number[];
  confidenceScore: number; // 0-100
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
}

export interface ThresholdConfig {
  device: string;
  shift: TimeShift['name'];
  normalRange: [number, number]; // [min, max] expected kWh
  wastageThreshold: number; // kWh above which is considered wastage
  anomalyThreshold: number; // kWh above which is anomaly
  efficiencyTarget: number; // kWh target for optimal usage
}

// Define time shifts
const TIME_SHIFTS: TimeShift[] = [
  { name: 'morning', startHour: 6, endHour: 12, description: 'Morning Shift (6 AM - 12 PM)' },
  { name: 'afternoon', startHour: 12, endHour: 18, description: 'Afternoon Shift (12 PM - 6 PM)' },
  { name: 'evening', startHour: 18, endHour: 24, description: 'Evening Shift (6 PM - 12 AM)' },
  { name: 'night', startHour: 0, endHour: 6, description: 'Night Shift (12 AM - 6 AM)' }
];

// Real-time data generation utilities
const generateRealisticAppliances = (): ApplianceDetail[] => [
  { name: 'Living Room AC', type: 'air_conditioner', brand: 'LG', model: 'Dual Inverter', rated_power: 1500, energy_efficiency_rating: 'A++', age_years: 3, usage_hours_per_day: 8, location: 'Living Room' },
  { name: 'Bedroom AC', type: 'air_conditioner', brand: 'Samsung', model: 'WindFree', rated_power: 1200, energy_efficiency_rating: 'A+', age_years: 2, usage_hours_per_day: 10, location: 'Bedroom' },
  { name: 'Refrigerator', type: 'refrigerator', brand: 'Whirlpool', model: '300L Frost Free', rated_power: 150, energy_efficiency_rating: 'A++', age_years: 4, usage_hours_per_day: 24, location: 'Kitchen' },
  { name: 'Water Heater', type: 'water_heater', brand: 'Bajaj', model: 'Instant 15L', rated_power: 2000, energy_efficiency_rating: 'B+', age_years: 5, usage_hours_per_day: 3, location: 'Bathroom' },
  { name: 'Washing Machine', type: 'washing_machine', brand: 'IFB', model: 'Top Load 7kg', rated_power: 500, energy_efficiency_rating: 'A+', age_years: 3, usage_hours_per_day: 1.5, location: 'Utility' },
  { name: 'Dishwasher', type: 'dishwasher', brand: 'Bosch', model: '12 Place Setting', rated_power: 1800, energy_efficiency_rating: 'A++', age_years: 2, usage_hours_per_day: 1, location: 'Kitchen' },
  { name: 'LED TV 55"', type: 'television', brand: 'Sony', model: 'Bravia 4K', rated_power: 120, energy_efficiency_rating: 'A+', age_years: 2, usage_hours_per_day: 6, location: 'Living Room' },
  { name: 'Microwave Oven', type: 'microwave', brand: 'Panasonic', model: '23L Convection', rated_power: 800, energy_efficiency_rating: 'B', age_years: 4, usage_hours_per_day: 0.5, location: 'Kitchen' },
  { name: 'Ceiling Fans (4)', type: 'fan', brand: 'Crompton', model: 'Super Briz Deco', rated_power: 280, energy_efficiency_rating: 'A', age_years: 5, usage_hours_per_day: 14, location: 'All Rooms' },
  { name: 'LED Lights (20)', type: 'lighting', brand: 'Philips', model: '9W LED Bulbs', rated_power: 180, energy_efficiency_rating: 'A++', age_years: 1, usage_hours_per_day: 8, location: 'All Rooms' },
  { name: 'Laptop Chargers (2)', type: 'electronics', brand: 'Dell/HP', model: '65W Adapters', rated_power: 130, energy_efficiency_rating: 'A', age_years: 2, usage_hours_per_day: 10, location: 'Study/Bedroom' },
  { name: 'WiFi Router', type: 'electronics', brand: 'TP-Link', model: 'Archer C6', rated_power: 12, energy_efficiency_rating: 'A+', age_years: 2, usage_hours_per_day: 24, location: 'Living Room' }
];

const generateRealisticConsumptionData = (appliances: ApplianceDetail[], days: number = 30): EnergyReading[] => {
  const readings: EnergyReading[] = [];
  const now = new Date();
  
  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now.getTime() - (days - day) * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000);
      
      appliances.forEach(appliance => {
        let baseConsumption = (appliance.rated_power / 1000); // Convert to kW
        let usageFactor = 0;
        
        // Apply realistic usage patterns based on appliance type and time
        switch (appliance.type) {
          case 'air_conditioner':
            // ACs run more during day (12-18) and night (22-6), less at night sleeping hours
            if ((hour >= 22 || hour <= 6)) usageFactor = 0.6; // Night cooling
            else if (hour >= 12 && hour <= 18) usageFactor = 0.9; // Peak day usage  
            else if (hour >= 19 && hour <= 21) usageFactor = 0.8; // Evening
            else usageFactor = 0.2; // Morning/off hours
            break;
            
          case 'refrigerator':
            // Always on, slight variation based on ambient temperature
            usageFactor = 0.4 + 0.2 * Math.sin((hour - 14) * Math.PI / 12); // Peak at 2 PM
            break;
            
          case 'water_heater':
            // Peak usage: morning (6-9) and evening (18-21)
            if ((hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21)) usageFactor = 0.8;
            else usageFactor = 0.1; // Standby
            break;
            
          case 'washing_machine':
            // Mostly used during morning (8-11) and evening (17-19)
            if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 19)) {
              usageFactor = Math.random() < 0.3 ? 1.0 : 0; // 30% chance of usage
            } else usageFactor = 0;
            break;
            
          case 'dishwasher':
            // Typically after meals: morning (9-10), evening (20-22)
            if ((hour >= 9 && hour <= 10) || (hour >= 20 && hour <= 22)) {
              usageFactor = Math.random() < 0.4 ? 1.0 : 0; // 40% chance
            } else usageFactor = 0;
            break;
            
          case 'television':
            // Peak: evening (18-23), moderate: morning (7-9) and afternoon (14-17)
            if (hour >= 18 && hour <= 23) usageFactor = 0.8;
            else if ((hour >= 7 && hour <= 9) || (hour >= 14 && hour <= 17)) usageFactor = 0.4;
            else usageFactor = 0.1;
            break;
            
          case 'microwave':
            // Meal times: breakfast (7-9), lunch (12-14), dinner (19-21)
            if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
              usageFactor = Math.random() < 0.6 ? 1.0 : 0;
            } else usageFactor = 0;
            break;
            
          case 'fan':
            // High usage during hot hours (11-18) and sleeping (22-6)
            if (hour >= 11 && hour <= 18) usageFactor = 0.9;
            else if (hour >= 22 || hour <= 6) usageFactor = 0.7;
            else usageFactor = 0.3;
            break;
            
          case 'lighting':
            // Peak: evening/night (18-23), moderate: early morning (6-8)
            if (hour >= 18 && hour <= 23) usageFactor = 0.9;
            else if (hour >= 6 && hour <= 8) usageFactor = 0.5;
            else if (hour >= 0 && hour <= 5) usageFactor = 0.2; // Night lights
            else usageFactor = 0.1;
            break;
            
          case 'electronics':
            // Work hours for laptops (9-18), always on for router
            if (appliance.name.includes('Router')) usageFactor = 1.0;
            else if (hour >= 9 && hour <= 18) usageFactor = 0.8;
            else if (hour >= 19 && hour <= 22) usageFactor = 0.6; // Personal use
            else usageFactor = 0.2;
            break;
            
          default:
            usageFactor = 0.3 + 0.4 * Math.random();
        }
        
        // Add daily and seasonal variations
        const dayOfWeek = (day % 7);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const weekendFactor = isWeekend ? 1.2 : 1.0; // 20% more usage on weekends
        
        // Add some randomness and efficiency factor
        const efficiencyFactor = appliance.energy_efficiency_rating?.includes('A') ? 0.85 : 1.0;
        const randomVariation = 0.8 + 0.4 * Math.random(); // ±20% variation
        
        const finalConsumption = baseConsumption * usageFactor * weekendFactor * efficiencyFactor * randomVariation;
        
        readings.push({
          timestamp: timestamp.toISOString(),
          device: appliance.name,
          kwh: Math.round(finalConsumption * 1000) / 1000 // Round to 3 decimals
        });
      });
    }
  }
  
  return readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Store uploaded/generated data in memory for this session
let uploadedData: EnergyReading[] = [];
let importedAppliances: ApplianceDetail[] = [];
let userHasUploadedData: boolean = false; // Track if user has uploaded their own CSV data

// 📊 Cumulative consumption tracking for realistic total consumption
let cumulativeConsumption: number = 0;
let simulationStartTime: Date | null = null;

// 🔒 Bulletproof data protection - prevent data loss
const saveUserDataToStorage = () => {
  if (userHasUploadedData && uploadedData.length > 0) {
    localStorage.setItem('energySage_userUploadedData', JSON.stringify(uploadedData));
    localStorage.setItem('energySage_userHasUploadedData', 'true');
    console.log(`💾 SAVED user data to localStorage: ${uploadedData.length} records`);
  }
};

const loadUserDataFromStorage = () => {
  const hasUploaded = localStorage.getItem('energySage_userHasUploadedData');
  const storedData = localStorage.getItem('energySage_userUploadedData');
  
  if (hasUploaded === 'true' && storedData) {
    try {
      uploadedData = JSON.parse(storedData);
      userHasUploadedData = true;
      console.log(`🔄 RESTORED user data from localStorage: ${uploadedData.length} records`);
    } catch (e) {
      console.warn('Failed to restore user data from storage');
    }
  }
};

// Load user data on initialization
loadUserDataFromStorage();

// Force use of uploaded data only - prevent any synthetic fallback
const forceUseUploadedDataOnly = () => {
  if (userHasUploadedData && uploadedData.length > 0) {
    console.log(`FORCING USE OF UPLOADED DATA: ${uploadedData.length} records available`);
    return true;
  }
  console.log(`NO USER DATA TO FORCE: userHasUploadedData=${userHasUploadedData}, length=${uploadedData.length}`);
  return false;
};

// Clear all test/sample data when user uploads their own data
const clearTestDataForUserUpload = () => {
  // Clear any test appliances that might interfere
  importedAppliances = [];
  console.log('🧹 Cleared all test/sample appliances - user data takes priority');
};
let lastImportTimestamp: string | null = null;
let shiftUsagePatterns: ShiftUsagePattern[] = [];
let thresholdConfigs: ThresholdConfig[] = [];

// Load sample data from CSV files for simulation baseline
const loadSampleDataForSimulation = async (mode: 'household' | 'industry'): Promise<EnergyReading[]> => {
  try {
    const csvFile = mode === 'household' 
      ? '/data/realtime_household_sample.csv' 
      : '/data/realtime_industry_sample.csv';
    
    const response = await fetch(csvFile);
    if (!response.ok) return [];
    
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());
    const sampleData: EnergyReading[] = [];
    
    // Skip header line
    for (let i = 1; i < Math.min(lines.length, 101); i++) { // Use first 100 rows
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 3) {
        const reading: EnergyReading = {
          timestamp: values[0],
          device: values[1],
          kwh: parseFloat(values[2]) || 0
        };
        
        // Add industrial fields if available
        if (mode === 'industry' && values.length >= 5) {
          reading.machine_id = values[3];
          reading.process_id = values[4];
        }
        
        sampleData.push(reading);
      }
    }
    
    console.log(`📊 Loaded ${sampleData.length} sample ${mode} readings for simulation`);
    return sampleData;
  } catch (error) {
    console.error('Failed to load sample data:', error);
    return [];
  }
};

// Initialize with empty data (user must upload or simulation will load samples)
const initializeRealtimeData = () => {
  // Intentionally left blank: ensures 'no data' until user uploads
  // Simulation will load sample data as needed
  return;
};

// Initialize data immediately
initializeRealtimeData();

// Test all API functions
export const testAllApiFunctions = async () => {
  console.log('🧪 Testing all API functions...');
  
  // 🛡️ PROTECTION: Don't overwrite user's uploaded data  
  if (localStorage.getItem('energySage_userHasUploadedData') === 'true') {
    console.log('⚠️ SKIPPING test data upload - User has uploaded their own CSV data');
    console.log('🎯 User data will be preserved for real-time simulation');
    return { success: true, message: 'Tests skipped to preserve user data', functions_tested: 0 };
  }
  
  try {
    // 1. Test real-time data initialization
    console.log('📊 Testing real-time data initialization...');
    const testData = await api.getRealtimeTestData();
    console.log('✅ Real-time data:', testData.message);
    
    // 2. Test time series
    console.log('📈 Testing time series data...');
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const timeSeries = await api.getTimeSeries(weekAgo.toISOString(), now.toISOString(), 'household');
    console.log('✅ Time series:', timeSeries.length, 'readings');
    
    // 3. Test predictions
    console.log('🔮 Testing predictions...');
    const predictions = await api.getPredictions(7);
    console.log('✅ Predictions:', predictions.length, 'forecasts');
    
    // 4. Test recommendations
    console.log('💡 Testing recommendations...');
    const recommendations = await api.getRecommendations('US');
    console.log('✅ Recommendations:', recommendations.length, 'suggestions');
    
    // 5. Test cost data
    console.log('💰 Testing cost data...');
    const costData = await api.getCostData('US');
    console.log('✅ Cost data:', costData.total_cost.toFixed(2), 'USD');
    
    // 6. Test grid awareness
    console.log('🏘️ Testing grid awareness...');
    const gridAwareness = await api.getGridAwareness();
    console.log('✅ Grid awareness:', gridAwareness.active_alerts.length, 'alerts');
    
    // 7. Test anomalies
    console.log('⚠️ Testing anomaly detection...');
    const anomalies = await api.getAnomalies(weekAgo.toISOString(), now.toISOString());
    console.log('✅ Anomalies:', anomalies.length, 'detected');
    
    // 8. Test imported appliances
    console.log('🏠 Testing imported appliances...');
    const appliances = await api.getImportedAppliances();
    console.log('✅ Appliances:', appliances.length, 'imported');
    
    console.log('🎉 All API functions tested successfully!');
    return {
      success: true,
      summary: {
        timeSeries: timeSeries.length,
        predictions: predictions.length,
        recommendations: recommendations.length,
        anomalies: anomalies.length,
        appliances: appliances.length,
        alerts: gridAwareness.active_alerts.length
      }
    };
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Mock API functions for development
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    // Mock login - in production this would call the FastAPI backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email,
        mode: email.includes('industry') ? 'industry' : 'household'
      }
    };
  },

  async register(email: string, password: string, mode: 'household' | 'industry'): Promise<{ token: string; user: User }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email,
        mode
      }
    };
  },

  // Data upload
  async uploadCSV(file: File, mode: 'household' | 'industry'): Promise<{ message: string; records_processed: number }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedData: EnergyReading[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) {
          const reading: EnergyReading = {
            timestamp: values[0],
            device: values[1],
            kwh: parseFloat(values[2]) || 0
          };
          
          // Add industrial-specific fields if present
          if (mode === 'industry' && values.length >= 5) {
            reading.machine_id = values[3];
            reading.process_id = values[4];
          }
          
          parsedData.push(reading);
        }
      }
      
      // 🔥 CRITICAL: Clear any existing data and store ONLY the user's uploaded data
      uploadedData = []; // Clear first
      uploadedData = parsedData; // Set user data
      userHasUploadedData = true; // Mark that user has uploaded their own data
      
      // 🧹 Clear all test/sample data that might interfere
      clearTestDataForUserUpload();
      
      // 💾 SAVE TO PERSISTENT STORAGE
      saveUserDataToStorage();
      
      console.log(`🔥🔥🔥 USER DATA UPLOADED: ${parsedData.length} records from YOUR CSV file`);
      console.log(`📋 Sample devices from YOUR upload: [${[...new Set(parsedData.map(r => r.device))].slice(0, 5).join(', ')}]`);
      console.log(`📊 Sample kWh values: [${parsedData.slice(0, 3).map(r => r.kwh.toFixed(3)).join(', ')}]`);
      console.log(`💾 Data saved to localStorage for persistence`);
      
      return {
        message: `🎯 YOUR CSV uploaded successfully! ${parsedData.length} records will be used for real-time simulation.`,
        records_processed: parsedData.length
      };
    } catch (error) {
      throw new Error('Failed to parse CSV file. Please check the format.');
    }
  },

  // Time series data
  async getTimeSeries(from: string, to: string, mode: 'household' | 'industry'): Promise<EnergyReading[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ensure we have real-time data for testing
    initializeRealtimeData();
    
    const start = new Date(from);
    const end = new Date(to);
    const filteredData = uploadedData.filter(reading => {
      const readingTime = new Date(reading.timestamp);
      return readingTime >= start && readingTime <= end;
    });
    
    console.log(`📊 Returning ${filteredData.length} time series readings from ${start.toISOString()} to ${end.toISOString()}`);
    return filteredData;
  },

  // Predictions with advanced time-based modeling (Enhanced for Industry)
  async getPredictions(horizonDays: number, model: 'prophet' | 'lstm' = 'prophet'): Promise<Prediction[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Only provide predictions if real data is available
    if (uploadedData.length === 0) return [];
    
    const predictions: Prediction[] = [];
    const uniqueDevices = [...new Set(uploadedData.map(r => r.device))];
    
    // Detect current mode based on device patterns
    const isIndustryMode = uniqueDevices.some(device => 
      device.includes('Production Line') || device.includes('Compressor') || 
      uploadedData.some(r => r.device === device && r.kwh > 30)
    );
    
    // Generate shift patterns if not cached
    if (shiftUsagePatterns.length === 0) {
      shiftUsagePatterns = [];
      uniqueDevices.forEach(device => {
        TIME_SHIFTS.forEach(shift => {
          const pattern = calculateShiftPattern(uploadedData, device, shift);
          shiftUsagePatterns.push(pattern);
        });
      });
    }
    
    uniqueDevices.forEach(device => {
      const deviceData = uploadedData.filter(r => r.device === device);
      if (deviceData.length < 24) return; // Need minimum 24 hours of data
      
      // Get predictive model for this device
      const predictiveModel = predictNextUsage(uploadedData, device);
      
      // Get shift patterns for this device
      const deviceShiftPatterns = shiftUsagePatterns.filter(p => p.device === device);
      
      // Generate predictions for the next horizon days
      for (let day = 0; day < horizonDays; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + day);
          futureDate.setHours(hour, 0, 0, 0);
          
          // Determine which shift this hour belongs to
          const shift = getTimeShift(futureDate.toISOString());
          const shiftPattern = deviceShiftPatterns.find(p => p.shift.name === shift.name);
          
          if (!shiftPattern) continue;
          
          // Use predictive model with shift-specific adjustments
          let predictedKwh: number;
          
          if (day === 0 && hour < 24) {
            // Use advanced prediction for next 24 hours
            predictedKwh = predictiveModel.next24HoursPrediction[hour] || 0;
          } else {
            // Use shift pattern for longer predictions
            predictedKwh = shiftPattern.averageKwh;
            
            // Apply trend direction for multi-day predictions (more stable for industry)
            const trendVariation = isIndustryMode ? 0.01 : 0.02; // Industry: 1% vs Household: 2%
            const dayFactor = 1 + (day * trendVariation * (predictiveModel.trendDirection === 'increasing' ? 1 : 
                                                predictiveModel.trendDirection === 'decreasing' ? -1 : 0));
            predictedKwh *= dayFactor;
          }
          
          // Apply seasonal and usage frequency factors
          predictedKwh *= predictiveModel.seasonalFactor;
          predictedKwh *= shiftPattern.usageFrequency;
          
          // Add realistic variation (reduced for industry mode)
          const baseVariation = (shiftPattern.peakKwh - shiftPattern.lowKwh) * 0.1;
          const variationFactor = isIndustryMode ? 0.4 : 1.0; // Industry: 40% of normal variation
          const variation = baseVariation * variationFactor;
          predictedKwh += (Math.random() - 0.5) * variation;
          
          // Industry-specific stabilization
          if (isIndustryMode) {
            // Apply industrial equipment load factor (more consistent)
            const industrialLoadFactor = 0.88; // 88% consistent load for industrial equipment
            const baseLoad = shiftPattern.averageKwh * industrialLoadFactor;
            const variableLoad = predictedKwh - baseLoad;
            predictedKwh = baseLoad + (variableLoad * 0.6); // Reduce variable component by 40%
            
            // Round to more predictable values for industrial equipment
            predictedKwh = Math.round(predictedKwh * 4) / 4; // Round to nearest 0.25 kWh
          }
          
          // Ensure non-negative predictions
          predictedKwh = Math.max(0, predictedKwh);
          
          // Calculate confidence interval (tighter for industry mode)
          const baseConfidence = shiftPattern.peakKwh - shiftPattern.lowKwh;
          const modelConfidenceFactor = predictiveModel.confidenceScore / 100;
          const confidenceReduction = isIndustryMode ? 0.7 : 0.5; // Industry: 70% reduction
          const confidenceInterval = baseConfidence * (1 - modelConfidenceFactor * confidenceReduction);
          
          predictions.push({
            timestamp: futureDate.toISOString(),
            predicted_kwh: Math.round(predictedKwh * 1000) / 1000, // Round to 3 decimal places
            confidence_interval: [
              Math.max(0, predictedKwh - confidenceInterval), 
              predictedKwh + confidenceInterval
            ]
          });
        }
      }
    });
    
    // Sort by timestamp and limit results
    predictions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return predictions.slice(0, Math.min(200, horizonDays * 24 * uniqueDevices.length));
  },

  // Anomalies with time-based analysis
  async getAnomalies(from: string, to: string): Promise<Anomaly[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Only detect anomalies if real data is available
    if (uploadedData.length === 0) return [];
    
    const start = new Date(from);
    const end = new Date(to);
    const filteredData = uploadedData.filter(reading => {
      const readingTime = new Date(reading.timestamp);
      return readingTime >= start && readingTime <= end;
    });
    
    if (filteredData.length === 0) return [];
    
    // Generate shift patterns and thresholds if not cached
    if (shiftUsagePatterns.length === 0) {
      const uniqueDevices = [...new Set(uploadedData.map(r => r.device))];
      shiftUsagePatterns = [];
      
      uniqueDevices.forEach(device => {
        TIME_SHIFTS.forEach(shift => {
          const pattern = calculateShiftPattern(uploadedData, device, shift);
          shiftUsagePatterns.push(pattern);
        });
      });
      
      thresholdConfigs = generateThresholds(shiftUsagePatterns);
    }
    
    // Detect anomalies using time-based thresholds
    const anomalies: Anomaly[] = [];
    
    filteredData.forEach(reading => {
      const shift = getTimeShift(reading.timestamp);
      const threshold = thresholdConfigs.find(t => 
        t.device === reading.device && t.shift === shift.name
      );
      
      if (!threshold) return;
      
      const pattern = shiftUsagePatterns.find(p => 
        p.device === reading.device && p.shift.name === shift.name
      );
      
      if (!pattern) return;
      
      let severity: 'low' | 'medium' | 'high' = 'low';
      let isAnomaly = false;
      
      // Check different types of anomalies
      if (reading.kwh > threshold.anomalyThreshold) {
        severity = 'high';
        isAnomaly = true;
      } else if (reading.kwh > threshold.wastageThreshold) {
        severity = 'medium';
        isAnomaly = true;
      } else if (reading.kwh > threshold.normalRange[1]) {
        severity = 'low';
        isAnomaly = true;
      }
      
      // Also check for unusual patterns (device running when it shouldn't)
      if (pattern.typicalPattern === 'off' && reading.kwh > 0.5) {
        severity = 'medium';
        isAnomaly = true;
      }
      
      if (isAnomaly) {
        anomalies.push({
          timestamp: reading.timestamp,
          device: reading.device,
          actual_kwh: reading.kwh,
          expected_kwh: pattern.averageKwh,
          severity
        });
      }
    });
    
    // Sort by severity and timestamp
    anomalies.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    return anomalies.slice(0, 15); // Return max 15 anomalies with time-based analysis
  },

  // Recommendations
  async getRecommendations(location: string = 'US'): Promise<Recommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get location-specific rates for accurate calculations
    const rates: Record<string, { cost_per_kwh: number; co2_factor: number; peak_rate_multiplier: number; currency_symbol: string }> = {
      'US': { cost_per_kwh: 0.13, co2_factor: 0.92, peak_rate_multiplier: 1.5, currency_symbol: '$' },
      'UK': { cost_per_kwh: 0.28, co2_factor: 0.23, peak_rate_multiplier: 1.8, currency_symbol: '£' },
      'India': { cost_per_kwh: 6.5, co2_factor: 0.82, peak_rate_multiplier: 1.3, currency_symbol: '₹' },
      'Germany': { cost_per_kwh: 0.35, co2_factor: 0.34, peak_rate_multiplier: 2.0, currency_symbol: '€' },
      'Australia': { cost_per_kwh: 0.35, co2_factor: 0.85, peak_rate_multiplier: 1.6, currency_symbol: 'A$' },
      'Japan': { cost_per_kwh: 28, co2_factor: 0.52, peak_rate_multiplier: 1.4, currency_symbol: '¥' },
      'Canada': { cost_per_kwh: 0.15, co2_factor: 0.15, peak_rate_multiplier: 1.3, currency_symbol: 'C$' }
    };
    
    const locationRate = rates[location] || rates['US'];
    const recommendations: Recommendation[] = [];
    
    // Ensure we have real-time data for testing
    initializeRealtimeData();
    importedAppliances.forEach((appliance, index) => {
      const monthlyKwh = (appliance.rated_power / 1000) * (appliance.usage_hours_per_day || 4) * 30;
      // Age-based recommendations with location pricing
      if (appliance.age_years && appliance.age_years > 8) {
        const savingsPercentage = appliance.age_years > 12 ? 0.5 : 0.4; // 50% for very old, 40% for old
        const monthlySavingsKwh = monthlyKwh * savingsPercentage;
        const monthlySavingsCost = monthlySavingsKwh * locationRate.cost_per_kwh;
        const monthlyCo2Reduction = monthlySavingsKwh * locationRate.co2_factor;
        recommendations.push({
          id: `age_${index}`,
          title: `Replace Aging ${appliance.name}`,
          description: `Your ${appliance.name} is ${appliance.age_years} years old. Modern alternatives use ${Math.round(savingsPercentage * 100)}% less energy. Annual savings: ${locationRate.currency_symbol}${(monthlySavingsCost * 12).toFixed(0)}.`,
          device: appliance.name,
          estimated_savings_kwh: monthlySavingsKwh,
          estimated_savings_cost: monthlySavingsCost,
          estimated_co2_reduction: monthlyCo2Reduction,
          priority: appliance.age_years > 12 ? 'high' : 'medium',
          category: 'replacement'
        });
      }
      // Efficiency rating recommendations with location pricing
      if (appliance.energy_efficiency_rating && !appliance.energy_efficiency_rating.toLowerCase().includes('a')) {
        const efficiencySavingsPercentage = getEfficiencySavings(appliance.energy_efficiency_rating);
        const monthlySavingsKwh = monthlyKwh * efficiencySavingsPercentage;
        const monthlySavingsCost = monthlySavingsKwh * locationRate.cost_per_kwh;
        const monthlyCo2Reduction = monthlySavingsKwh * locationRate.co2_factor;
        recommendations.push({
          id: `efficiency_${index}`,
          title: `Upgrade ${appliance.name} Efficiency`,
          description: `Your ${appliance.name} has ${appliance.energy_efficiency_rating} rating. Upgrade to A+ rated model for ${Math.round(efficiencySavingsPercentage * 100)}% savings (${locationRate.currency_symbol}${(monthlySavingsCost * 12).toFixed(0)}/year).`,
          device: appliance.name,
          estimated_savings_kwh: monthlySavingsKwh,
          estimated_savings_cost: monthlySavingsCost,
          estimated_co2_reduction: monthlyCo2Reduction,
          priority: efficiencySavingsPercentage > 0.3 ? 'high' : 'medium',
          category: 'replacement'
        });
      }
      // Usage optimization recommendations with location-specific peak rates
      if (appliance.type.toLowerCase().includes('hvac') || appliance.type.toLowerCase().includes('air') || 
          appliance.type.toLowerCase().includes('heater') || appliance.type.toLowerCase().includes('water') ||
          appliance.type.toLowerCase().includes('washing') || appliance.type.toLowerCase().includes('dishwasher')) {
        const peakHoursDaily = 4; // Assume 4 peak hours per day
        const peakKwhDaily = (appliance.rated_power / 1000) * Math.min(appliance.usage_hours_per_day || 4, peakHoursDaily);
        const peakSavingsKwh = peakKwhDaily * 30;
        
        // Scheduling during off-peak can reduce energy consumption by 8-12% due to better efficiency
        const energySavingsFromScheduling = peakSavingsKwh * 0.1; // 10% energy savings from optimal scheduling
        const peakRateDifference = locationRate.cost_per_kwh * (locationRate.peak_rate_multiplier - 1);
        const costSavingsFromRateShift = peakSavingsKwh * peakRateDifference;
        const energySavingsCost = energySavingsFromScheduling * locationRate.cost_per_kwh;
        const totalMonthlyCostSavings = costSavingsFromRateShift + energySavingsCost;
        const monthlyCo2Reduction = (peakSavingsKwh + energySavingsFromScheduling) * locationRate.co2_factor * 0.3;
        
        recommendations.push({
          id: `schedule_${index}`,
          title: `Optimize ${appliance.name} Schedule`,
          description: `Schedule ${appliance.name} to run during off-peak hours (11 PM - 6 AM) for ${locationRate.currency_symbol}${(totalMonthlyCostSavings * 12).toFixed(0)}/year savings.`,
          device: appliance.name,
          estimated_savings_kwh: energySavingsFromScheduling, // Energy savings from optimal scheduling
          estimated_savings_cost: totalMonthlyCostSavings,
          estimated_co2_reduction: monthlyCo2Reduction,
          priority: totalMonthlyCostSavings > 10 ? 'high' : 'medium',
          category: 'scheduling'
        });
      }
      // Smart thermostat recommendations for HVAC systems
      if (appliance.type.toLowerCase().includes('hvac') || appliance.type.toLowerCase().includes('air conditioner')) {
        const smartThermostatSavings = monthlyKwh * 0.15; // 15% typical savings
        const monthlySavingsCost = smartThermostatSavings * locationRate.cost_per_kwh;
        const monthlyCo2Reduction = smartThermostatSavings * locationRate.co2_factor;
        recommendations.push({
          id: `smart_${index}`,
          title: `Install Smart Thermostat for ${appliance.name}`,
          description: `Smart thermostats can reduce HVAC energy use by 15%. Payback period: ~2 years. Annual savings: ${locationRate.currency_symbol}${(monthlySavingsCost * 12).toFixed(0)}.`,
          device: appliance.name,
          estimated_savings_kwh: smartThermostatSavings,
          estimated_savings_cost: monthlySavingsCost,
          estimated_co2_reduction: monthlyCo2Reduction,
          priority: 'medium',
          category: 'efficiency'
        });
      }
      
      // General maintenance recommendation for all appliances
      const maintenanceSavings = monthlyKwh * 0.08; // 8% savings from regular maintenance
      const maintenanceCost = maintenanceSavings * locationRate.cost_per_kwh;
      const maintenanceCo2Reduction = maintenanceSavings * locationRate.co2_factor;
      
      recommendations.push({
        id: `maintenance_${index}`,
        title: `Regular Maintenance for ${appliance.name}`,
        description: `Regular cleaning and maintenance can improve ${appliance.name} efficiency by 8-12%. Schedule professional service every 6 months for ${locationRate.currency_symbol}${(maintenanceCost * 12).toFixed(0)}/year savings.`,
        device: appliance.name,
        estimated_savings_kwh: maintenanceSavings,
        estimated_savings_cost: maintenanceCost,
        estimated_co2_reduction: maintenanceCo2Reduction,
        priority: 'low',
        category: 'maintenance'
      });
    });
    // Sort by priority and limit to top recommendations
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    return recommendations.slice(0, 6); // Return top 6 recommendations
  },

  // Cost and carbon data
  async getCostData(location: string = 'US'): Promise<CostData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rates: Record<string, { cost_per_kwh: number; co2_factor: number }> = {
      'US': { cost_per_kwh: 0.13, co2_factor: 0.92 },
      'UK': { cost_per_kwh: 0.28, co2_factor: 0.23 },
      'India': { cost_per_kwh: 6.5, co2_factor: 0.82 },
      'Germany': { cost_per_kwh: 0.35, co2_factor: 0.34 }
    };
    
    const rate = rates[location] || rates['US'];
    
    // Ensure we have real-time data for testing
    initializeRealtimeData();
    
    // Calculate total consumption from real-time data
    let totalKwh = 0;
    if (uploadedData.length > 0) {
      totalKwh = uploadedData.reduce((sum, reading) => sum + reading.kwh, 0);
      if (uploadedData.length > 24) {
        const uniqueDates = new Set(uploadedData.map(r => r.timestamp.split('T')[0]));
        const numberOfDays = uniqueDates.size;
        totalKwh = (totalKwh / numberOfDays) * 30; // Convert to monthly estimate
      }
    }
    return {
      total_cost: totalKwh * rate.cost_per_kwh,
      total_co2: totalKwh * rate.co2_factor,
      cost_per_kwh: rate.cost_per_kwh,
      co2_factor: rate.co2_factor,
      location
    };
  },

  // Get comprehensive real-time data for testing with enhanced scenarios
  async getRealtimeTestData(): Promise<{ appliances: ApplianceDetail[]; readings: EnergyReading[]; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 🛡️ Don't initialize if user has uploaded their own data
    if (localStorage.getItem('energySage_userHasUploadedData') !== 'true') {
      initializeRealtimeData();
    }
    
    const isUserData = localStorage.getItem('energySage_userHasUploadedData') === 'true';
    const dataSource = isUserData ? 'YOUR UPLOADED CSV DATA' : 'test data';
    
    return {
      appliances: importedAppliances,
      readings: uploadedData.slice(-168), // Last 7 days
      message: `🔄 Real-time data loaded from ${dataSource}: ${importedAppliances.length} smart appliances, ${uploadedData.length} consumption readings`
    };
  },

  // Generate additional test scenarios for comprehensive testing
  async generateTestScenarios(scenarioType: 'peak_load' | 'energy_saver' | 'weekend_usage' | 'seasonal_variation' = 'peak_load'): Promise<{ scenario: string; data: EnergyReading[]; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    initializeRealtimeData();

    const scenarioData: EnergyReading[] = [];
    const now = new Date();
    
    switch (scenarioType) {
      case 'peak_load':
        // Simulate peak summer day with high AC usage
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(now.getTime() + hour * 60 * 60 * 1000);
          
          importedAppliances.forEach(appliance => {
            let multiplier = 1;
            
            if (appliance.type === 'air_conditioner') {
              if (hour >= 11 && hour <= 17) multiplier = 2.5; // Peak afternoon
              else if (hour >= 18 && hour <= 22) multiplier = 1.8; // Evening
              else if (hour >= 22 || hour <= 6) multiplier = 1.2; // Night
            }
            
            const baseConsumption = (appliance.rated_power / 1000) * multiplier;
            const consumption = baseConsumption * (0.7 + Math.random() * 0.6);
            
            if (consumption > 0.01) {
              scenarioData.push({
                timestamp: timestamp.toISOString(),
                device: appliance.name,
                kwh: Math.round(consumption * 1000) / 1000
              });
            }
          });
        }
        return { scenario: 'Peak Summer Load', data: scenarioData, message: '🌡️ Peak summer day scenario: High AC usage from 11 AM - 5 PM' };
        
      case 'energy_saver':
        // Simulate optimized energy usage with smart scheduling
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(now.getTime() + hour * 60 * 60 * 1000);
          
          importedAppliances.forEach(appliance => {
            let multiplier = 0.6; // 40% reduction through smart scheduling
            
            // Shift high-power appliances to off-peak hours (2-5 AM, 10-11 AM)
            if (['washing_machine', 'dishwasher'].includes(appliance.type)) {
              if ((hour >= 2 && hour <= 5) || (hour >= 10 && hour <= 11)) {
                multiplier = 1.2; // Run during off-peak
              } else {
                multiplier = 0.1; // Minimal usage during peak
              }
            }
            
            const baseConsumption = (appliance.rated_power / 1000) * multiplier;
            const consumption = baseConsumption * (0.8 + Math.random() * 0.4);
            
            if (consumption > 0.01) {
              scenarioData.push({
                timestamp: timestamp.toISOString(),
                device: appliance.name,
                kwh: Math.round(consumption * 1000) / 1000
              });
            }
          });
        }
        return { scenario: 'Smart Energy Optimization', data: scenarioData, message: '💡 Optimized usage: 40% reduction through smart scheduling and load shifting' };
        
      case 'weekend_usage':
        // Simulate weekend usage patterns (higher daytime usage, later morning start)
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(now.getTime() + hour * 60 * 60 * 1000);
          
          importedAppliances.forEach(appliance => {
            let multiplier = 1.3; // 30% higher weekend usage
            
            // Later start (people sleep in), extended evening usage
            if (hour >= 9 && hour <= 23) multiplier = 1.5;
            else if (hour >= 0 && hour <= 8) multiplier = 0.3;
            
            const baseConsumption = (appliance.rated_power / 1000) * multiplier;
            const consumption = baseConsumption * (0.8 + Math.random() * 0.4);
            
            if (consumption > 0.01) {
              scenarioData.push({
                timestamp: timestamp.toISOString(),
                device: appliance.name,
                kwh: Math.round(consumption * 1000) / 1000
              });
            }
          });
        }
        return { scenario: 'Weekend Usage Pattern', data: scenarioData, message: '📅 Weekend scenario: 30% higher usage, later morning start, extended evening activity' };
        
      default:
        return { scenario: 'Default', data: uploadedData.slice(-24), message: 'Default 24-hour data' };
    }
  },

  // Simulation controls
  async startSimulation(): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Simulation started' };
  },

  async stopSimulation(): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Simulation stopped' };
  },

  // Grid Load Monitoring and Neighborhood Alerts
  async getGridAwareness(areaCode?: string): Promise<GridAwareness> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Ensure we have real-time data for testing
    initializeRealtimeData();
    
    // Grid awareness now works with comprehensive real-time data
    if (uploadedData.length === 0 && importedAppliances.length === 0) {
      const userArea = areaCode || 'AREA_UNKNOWN';
      return {
        user_area: userArea,
        current_grid_status: {
          timestamp: new Date().toISOString(),
          area_code: userArea,
          current_load_mw: 0,
          capacity_mw: 100,
          load_percentage: 0,
          status: 'normal'
        },
        active_alerts: [],
        load_forecast: [],
        user_impact_score: 0,
        recommended_actions: []
      };
    }
    
    const userArea = areaCode || this.getUserArea();
    const currentTime = new Date();
    const hour = currentTime.getHours();
    
    // Simulate grid load based on time of day and random variations
    const baseLoad = this.calculateBaseLoad(hour);
    const loadVariation = (Math.random() - 0.5) * 20; // ±10% variation
    const currentLoad = Math.max(0, baseLoad + loadVariation);
    const capacity = 100; // 100 MW capacity
    const loadPercentage = (currentLoad / capacity) * 100;
    
    // Determine grid status
    let status: GridLoadData['status'] = 'normal';
    if (loadPercentage > 90) status = 'critical';
    else if (loadPercentage > 75) status = 'peak';
    else if (loadPercentage > 60) status = 'high';
    
    // Generate alerts based on grid conditions
    const alerts = this.generateGridAlerts(userArea, currentLoad, loadPercentage, status);
    
    // Generate load forecast for next 24 hours
    const forecast = this.generateLoadForecast(userArea, currentTime);
    
    // Calculate user impact score based on current usage
    const userImpactScore = this.calculateUserImpactScore();
    
    // Generate personalized recommendations
    const recommendations = this.generateLoadShiftRecommendations(status, hour);
    
    return {
      user_area: userArea,
      current_grid_status: {
        timestamp: currentTime.toISOString(),
        area_code: userArea,
        current_load_mw: Math.round(currentLoad * 10) / 10,
        capacity_mw: capacity,
        load_percentage: Math.round(loadPercentage * 10) / 10,
        status,
        predicted_peak_time: this.getPredictedPeakTime(currentTime)
      },
      active_alerts: alerts,
      load_forecast: forecast,
      user_impact_score: userImpactScore,
      recommended_actions: recommendations
    };
  },

  getUserArea(): string {
    // Simulate different area codes based on location
    const areas = ['AREA_CENTRAL', 'AREA_NORTH', 'AREA_SOUTH', 'AREA_EAST', 'AREA_WEST'];
    return areas[Math.floor(Math.random() * areas.length)];
  },

  calculateBaseLoad(hour: number): number {
    // Simulate realistic daily load patterns (MW)
    const loadPattern = [
      30, 25, 22, 20, 18, 20, 25, 35, // 0-7 AM (night/early morning)
      45, 50, 55, 60, 65, 70, 75, 80, // 8-15 (morning/afternoon)
      85, 90, 85, 75, 65, 55, 45, 35  // 16-23 (evening/night)
    ];
    return loadPattern[hour] || 40;
  },

  generateGridAlerts(areaCode: string, currentLoad: number, loadPercentage: number, status: GridLoadData['status']): NeighborhoodAlert[] {
    const alerts: NeighborhoodAlert[] = [];
    const currentTime = new Date();
    
    // Generate alerts based on grid conditions
    if (status === 'critical' || status === 'peak') {
      alerts.push({
        id: `alert_${Date.now()}_1`,
        timestamp: currentTime.toISOString(),
        area_code: areaCode,
        alert_type: status === 'critical' ? 'capacity_risk' : 'peak_warning',
        severity: status === 'critical' ? 'critical' : 'high',
        title: status === 'critical' ? '🚨 Critical Grid Load - Immediate Action Required' : '⚡ Peak Load Alert - Reduce Consumption',
        message: status === 'critical' 
          ? `Grid capacity at ${loadPercentage.toFixed(1)}%. Please immediately reduce non-essential appliance usage to prevent outages. ${Math.floor(Math.random() * 500) + 100} households affected.`
          : `Grid load is at ${loadPercentage.toFixed(1)}%. Consider shifting high-power appliances to off-peak hours to save costs and help the community.`,
        affected_households: Math.floor(Math.random() * 500) + 100,
        duration_minutes: status === 'critical' ? 60 : 120,
        recommendations: this.generateLoadShiftRecommendations(status, currentTime.getHours())
      });
    }
    
    // Random load spike detection (simulate sudden increases)
    if (Math.random() < 0.4 && currentLoad > 60) {
      const spikePercentage = (Math.random() * 15 + 10).toFixed(1);
      alerts.push({
        id: `alert_${Date.now()}_2`,
        timestamp: new Date(currentTime.getTime() - 5 * 60 * 1000).toISOString(),
        area_code: areaCode,
        alert_type: 'load_spike',
        severity: 'medium',
        title: '📈 Sudden Load Increase Detected',
        message: `A ${spikePercentage}% load increase detected in your area (${areaCode}). Nearby households are increasing consumption. Consider delaying high-consumption activities like AC, water heating, or laundry.`,
        affected_households: Math.floor(Math.random() * 200) + 50,
        duration_minutes: 45,
        recommendations: this.generateLoadShiftRecommendations('high', currentTime.getHours())
      });
    }
    
    // Proactive shift recommendation during normal times
    if (status === 'normal' && Math.random() < 0.2) {
      alerts.push({
        id: `alert_${Date.now()}_3`,
        timestamp: currentTime.toISOString(),
        area_code: areaCode,
        alert_type: 'load_shift_needed',
        severity: 'low',
        title: '💡 Smart Timing Opportunity',
        message: `Grid load is currently low (${loadPercentage.toFixed(1)}%). Great time to run high-consumption appliances and save on electricity costs!`,
        affected_households: Math.floor(Math.random() * 100) + 25,
        duration_minutes: 90,
        recommendations: []
      });
    }
    
    return alerts;
  },

  generateLoadForecast(areaCode: string, currentTime: Date): GridLoadData[] {
    const forecast: GridLoadData[] = [];
    
    for (let i = 1; i <= 24; i++) {
      const futureTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
      const hour = futureTime.getHours();
      const baseLoad = this.calculateBaseLoad(hour);
      const variation = (Math.random() - 0.5) * 10;
      const load = Math.max(0, baseLoad + variation);
      const capacity = 100;
      const loadPercentage = (load / capacity) * 100;
      
      let status: GridLoadData['status'] = 'normal';
      if (loadPercentage > 90) status = 'critical';
      else if (loadPercentage > 75) status = 'peak';
      else if (loadPercentage > 60) status = 'high';
      
      forecast.push({
        timestamp: futureTime.toISOString(),
        area_code: areaCode,
        current_load_mw: Math.round(load * 10) / 10,
        capacity_mw: capacity,
        load_percentage: Math.round(loadPercentage * 10) / 10,
        status
      });
    }
    
    return forecast;
  },

  getPredictedPeakTime(currentTime: Date): string {
    // Predict next peak time (usually evening 18:00-20:00)
    const nextPeak = new Date(currentTime);
    if (currentTime.getHours() >= 20) {
      nextPeak.setDate(nextPeak.getDate() + 1);
    }
    nextPeak.setHours(18 + Math.floor(Math.random() * 3), 0, 0, 0);
    return nextPeak.toISOString();
  },

  calculateUserImpactScore(): number {
    // Calculate user's impact on grid based on current usage
    const recentUsage = uploadedData.slice(-24); // Last 24 readings
    if (recentUsage.length === 0) return 50;
    
    const avgUsage = recentUsage.reduce((sum, reading) => sum + reading.kwh, 0) / recentUsage.length;
    const maxUsage = Math.max(...recentUsage.map(r => r.kwh));
    
    // Score from 0-100 (lower is better for grid)
    const baseScore = Math.min(100, (avgUsage / 5) * 100);
    const peakPenalty = Math.min(20, (maxUsage / 10) * 20);
    
    return Math.round(Math.max(0, Math.min(100, baseScore + peakPenalty)));
  },

  generateLoadShiftRecommendations(gridStatus: GridLoadData['status'], currentHour: number): LoadShiftRecommendation[] {
    const recommendations: LoadShiftRecommendation[] = [];
    
    // Get user's appliances and current usage patterns
    const highConsumptionAppliances = [
      { type: 'Air Conditioner', avgKwh: 2.5, priority: 'high' },
      { type: 'Water Heater', avgKwh: 1.8, priority: 'medium' },
      { type: 'Washing Machine', avgKwh: 1.2, priority: 'medium' },
      { type: 'Dishwasher', avgKwh: 1.0, priority: 'low' },
      { type: 'Electric Oven', avgKwh: 2.0, priority: 'high' },
      { type: 'Clothes Dryer', avgKwh: 1.5, priority: 'medium' }
    ];
    
    // Determine alternative time slots based on grid conditions
    const getAlternativeSlots = (currentHour: number) => {
      const slots = [];
      // Suggest off-peak hours (11 PM - 6 AM, 10 AM - 3 PM)
      if (currentHour >= 6 && currentHour <= 22) {
        slots.push('11:00 PM - 6:00 AM (Night)', '10:00 AM - 3:00 PM (Midday)');
      } else {
        slots.push('10:00 AM - 3:00 PM (Midday)', '11:00 PM - 6:00 AM (Night)');
      }
      return slots;
    };
    
    highConsumptionAppliances.forEach(appliance => {
      if (gridStatus === 'critical' || gridStatus === 'peak' || (gridStatus === 'high' && appliance.priority === 'high')) {
        const shiftHours = gridStatus === 'critical' ? 4 : (gridStatus === 'peak' ? 2 : 1);
        const potentialSavings = appliance.avgKwh * 0.3; // 30% cost savings in off-peak
        const gridImpact = appliance.avgKwh * 0.8; // 80% grid impact reduction
        
        recommendations.push({
          appliance_type: appliance.type,
          current_usage_kwh: appliance.avgKwh,
          suggested_shift_hours: shiftHours,
          alternative_time_slots: getAlternativeSlots(currentHour),
          potential_savings: Math.round(potentialSavings * 100) / 100,
          grid_impact_reduction: Math.round(gridImpact * 100) / 100,
          priority: appliance.priority as 'low' | 'medium' | 'high'
        });
      }
    });
    
    return recommendations;
  },

  // Energy Efficiency Scoring
  async getEnergyScore(): Promise<EnergyScore> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Only provide energy score if real data is available
    if (uploadedData.length === 0 && importedAppliances.length === 0) {
      return {
        overall_score: 0,
        efficiency_score: 0,
        sustainability_score: 0,
        cost_optimization_score: 0,
        grade: 'F',
        recommendations_count: 0
      };
    }
    
    const totalConsumption = uploadedData.length > 0 
      ? uploadedData.reduce((sum, r) => sum + r.kwh, 0)
      : 0;
    
    // Enhanced scoring using imported appliance data
    let efficiencyScore = Math.max(20, Math.min(95, 100 - (totalConsumption / 10)));
    let sustainabilityScore = Math.max(30, Math.min(90, 85 - (totalConsumption / 20)));
    let costScore = Math.max(25, Math.min(88, 90 - (totalConsumption / 15)));
    
    // Bonus points for efficient appliances
    if (importedAppliances.length > 0) {
      const efficientAppliances = importedAppliances.filter(app => 
        app.energy_efficiency_rating?.toLowerCase().includes('a')
      ).length;
      const efficiencyBonus = (efficientAppliances / importedAppliances.length) * 15;
      
      const newAppliances = importedAppliances.filter(app => 
        !app.age_years || app.age_years < 3
      ).length;
      const ageBonus = (newAppliances / importedAppliances.length) * 10;
      
      efficiencyScore = Math.min(95, efficiencyScore + efficiencyBonus);
      sustainabilityScore = Math.min(90, sustainabilityScore + ageBonus);
      costScore = Math.min(88, costScore + (efficiencyBonus + ageBonus) / 2);
    }
    
    const overallScore = (efficiencyScore + sustainabilityScore + costScore) / 3;
    
    const getGrade = (score: number): EnergyScore['grade'] => {
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'B+';
      if (score >= 75) return 'B';
      if (score >= 70) return 'C+';
      if (score >= 60) return 'C';
      if (score >= 50) return 'D';
      return 'F';
    };
    
    return {
      overall_score: Math.round(overallScore),
      efficiency_score: Math.round(efficiencyScore),
      sustainability_score: Math.round(sustainabilityScore),
      cost_optimization_score: Math.round(costScore),
      grade: getGrade(overallScore),
      recommendations_count: 3
    };
  },

  // Weather Integration
  async getWeatherData(): Promise<WeatherData> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const weatherTypes: WeatherData['weather_type'][] = ['sunny', 'cloudy', 'rainy', 'snowy'];
    return {
      temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
      humidity: Math.round(Math.random() * 40 + 40), // 40-80%
      weather_type: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
      timestamp: new Date().toISOString()
    };
  },

  // Smart Alerts System
  async getSmartAlerts(): Promise<SmartAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Only generate alerts if real data is available
    if (uploadedData.length === 0 && importedAppliances.length === 0) return [];
    
    const alerts: SmartAlert[] = [];
    
    // Generate real alerts based on imported appliances
    if (importedAppliances.length > 0) {
      importedAppliances.forEach((appliance, index) => {
        // Alert for old appliances
        if (appliance.age_years && appliance.age_years > 10) {
          alerts.push({
            id: `age_${index}`,
            type: 'maintenance_due',
            severity: 'warning',
            title: `${appliance.name} Efficiency Alert`,
            message: `Your ${appliance.name} is ${appliance.age_years} years old and may be consuming 30-50% more energy than newer models.`,
            device: appliance.name,
            timestamp: new Date().toISOString(),
            action_required: true
          });
        }
        
        // Alert for low efficiency ratings
        if (appliance.energy_efficiency_rating && !appliance.energy_efficiency_rating.toLowerCase().includes('a')) {
          alerts.push({
            id: `efficiency_${index}`,
            type: 'energy_spike',
            severity: 'info',
            title: `${appliance.name} Efficiency Opportunity`,
            message: `Upgrading your ${appliance.energy_efficiency_rating} rated ${appliance.name} to an A+ model could save 25-40% on energy costs.`,
            device: appliance.name,
            timestamp: new Date().toISOString(),
            action_required: false
          });
        }
      });
    }
    
    return alerts.slice(0, 5); // Return max 5 alerts
  },

  // Predictive Maintenance
  async getPredictiveMaintenance(): Promise<PredictiveMaintenance[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Only provide maintenance data if appliances are imported
    if (importedAppliances.length === 0) return [];
    
    const maintenanceItems: PredictiveMaintenance[] = [];
    
    importedAppliances.forEach(appliance => {
        // Calculate health score based on age and efficiency
        let healthScore = 100;
        
        if (appliance.age_years) {
          healthScore -= appliance.age_years * 3; // 3% per year
        }
        
        if (appliance.energy_efficiency_rating) {
          const rating = appliance.energy_efficiency_rating.toLowerCase();
          if (rating.includes('c') || rating.includes('d')) {
            healthScore -= 15; // Poor efficiency indicates wear
          }
        }
        
        healthScore = Math.max(20, Math.min(100, healthScore + (Math.random() * 20 - 10))); // ±10 variation
        
        // Determine maintenance type based on appliance and health
        let maintenanceType: PredictiveMaintenance['maintenance_type'] = 'cleaning';
        let urgency: PredictiveMaintenance['urgency'] = 'low';
        let estimatedCost = 50;
        let estimatedFailureDate: string | undefined;
        
        if (healthScore < 40) {
          maintenanceType = 'replacement';
          urgency = 'critical';
          estimatedCost = appliance.rated_power / 10; // Rough cost estimation
          const failureDate = new Date();
          failureDate.setDate(failureDate.getDate() + 30); // 30 days
          estimatedFailureDate = failureDate.toISOString().split('T')[0];
        } else if (healthScore < 60) {
          maintenanceType = 'repair';
          urgency = 'high';
          estimatedCost = appliance.rated_power / 20;
          const failureDate = new Date();
          failureDate.setDate(failureDate.getDate() + 90); // 90 days
          estimatedFailureDate = failureDate.toISOString().split('T')[0];
        } else if (healthScore < 80) {
          maintenanceType = 'cleaning';
          urgency = 'medium';
          estimatedCost = 25;
        }
        
        maintenanceItems.push({
          device: appliance.name,
          health_score: Math.round(healthScore),
          estimated_failure_date: estimatedFailureDate,
          maintenance_type: maintenanceType,
          urgency,
          estimated_cost: Math.round(estimatedCost)
        });
    });
    
    return maintenanceItems;
  },

  // Benchmarking
  async getBenchmarkData(): Promise<BenchmarkData> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Only provide benchmarking if real data is available
    if (uploadedData.length === 0 && importedAppliances.length === 0) {
      return {
        user_consumption: 0,
        peer_average: 0,
        top_10_percent: 0,
        efficiency_ranking: 0,
        similar_properties_count: 0
      };
    }
    
    let userConsumption = uploadedData.length > 0 
      ? uploadedData.reduce((sum, r) => sum + r.kwh, 0) / Math.max(1, uploadedData.length) * 24
      : 0;
    
    // Calculate more accurate benchmarking based on appliance efficiency
    let efficiencyMultiplier = 1;
    if (importedAppliances.length > 0) {
      const efficientAppliances = importedAppliances.filter(app => 
        app.energy_efficiency_rating?.toLowerCase().includes('a')
      ).length;
      const avgAge = importedAppliances.reduce((sum, app) => sum + (app.age_years || 5), 0) / importedAppliances.length;
      
      // Better efficiency rating = lower consumption vs peers
      efficiencyMultiplier = 1 - (efficientAppliances / importedAppliances.length) * 0.2;
      efficiencyMultiplier += avgAge > 8 ? 0.15 : 0; // Older appliances use more
    }
    
    const benchmarkConsumption = userConsumption * efficiencyMultiplier;
    const ranking = Math.max(10, Math.min(90, 70 - (efficiencyMultiplier - 1) * 100));
    
    return {
      user_consumption: benchmarkConsumption,
      peer_average: benchmarkConsumption * 1.15,
      top_10_percent: benchmarkConsumption * 0.65,
      efficiency_ranking: Math.round(ranking),
      similar_properties_count: 1247
    };
  },

  // Peak Demand Forecasting
  async getPeakDemandForecast(): Promise<PeakDemandForecast> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Only provide forecasting if appliances are imported
    if (importedAppliances.length === 0) {
      return {
        predicted_peak_time: new Date().toISOString(),
        predicted_peak_demand: 0,
        confidence: 0,
        load_shifting_potential: 0,
        cost_impact: 0
      };
    }
    
    const peakHour = Math.floor(Math.random() * 4) + 16; // 4-8 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(peakHour, 0, 0, 0);
    
    // Use imported appliance data to calculate predictions
    const baseDemand = importedAppliances.reduce((sum, app) => {
      const dailyUsage = (app.rated_power / 1000) * (app.usage_hours_per_day || 4);
      return sum + dailyUsage;
    }, 0);
    
    return {
      predicted_peak_time: tomorrow.toISOString(),
      predicted_peak_demand: Math.round(baseDemand * 1.3), // 30% peak increase
      confidence: importedAppliances.length > 0 ? 85 : 75,
      load_shifting_potential: Math.round(baseDemand * 0.2), // 20% shifting potential
      cost_impact: Math.round(baseDemand * 0.5) // Cost per kWh impact
    };
  },

  // Appliance Import Functionality
  async importApplianceData(file: File): Promise<ImportedApplianceData> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const appliances: ApplianceDetail[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4) {
          const appliance: ApplianceDetail = {
            name: values[0] || `Appliance ${i}`,
            type: values[1] || 'unknown',
            brand: values[2] || undefined,
            model: values[3] || undefined,
            rated_power: parseFloat(values[4]) || 100,
            energy_efficiency_rating: values[5] || undefined,
            age_years: values[6] ? parseFloat(values[6]) : undefined,
            usage_hours_per_day: values[7] ? parseFloat(values[7]) : 4,
            location: values[8] || undefined,
            purchase_date: values[9] || undefined,
            warranty_expiry: values[10] || undefined,
            maintenance_schedule: values[11] || undefined
          };
          appliances.push(appliance);
        }
      }
      
      // Generate consumption data based on appliances
      const consumptionData: EnergyReading[] = [];
      const now = new Date();
      
      // Generate 7 days of data
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(now);
          timestamp.setDate(timestamp.getDate() - day);
          timestamp.setHours(hour, 0, 0, 0);
          
          appliances.forEach(appliance => {
            // Calculate realistic consumption based on appliance details
            let baseConsumption = (appliance.rated_power / 1000); // Convert to kW
            
            // Apply usage patterns
            const isNightTime = hour >= 22 || hour <= 6;
            const isPeakTime = hour >= 17 && hour <= 21;
            
            // Adjust based on appliance type
            let usageFactor = 1;
            switch (appliance.type.toLowerCase()) {
              case 'refrigerator':
              case 'fridge':
                usageFactor = 1; // Always on
                break;
              case 'ac':
              case 'air_conditioner':
                usageFactor = isPeakTime ? 1.5 : (isNightTime ? 0.3 : 0.8);
                break;
              case 'washing_machine':
              case 'dishwasher':
                usageFactor = Math.random() > 0.8 ? 1 : 0; // 20% chance of use per hour
                break;
              case 'tv':
              case 'television':
                usageFactor = isPeakTime ? 1 : (isNightTime ? 0.2 : 0.6);
                break;
              case 'light':
              case 'lighting':
                usageFactor = isNightTime ? 0 : (isPeakTime ? 1 : 0.4);
                break;
              default:
                usageFactor = Math.random() * 0.8 + 0.2; // Random between 20-100%
            }
            
            // Apply efficiency rating impact
            let efficiencyMultiplier = 1;
            if (appliance.energy_efficiency_rating) {
              const rating = appliance.energy_efficiency_rating.toLowerCase();
              if (rating.includes('a+')) efficiencyMultiplier = 0.8;
              else if (rating.includes('a')) efficiencyMultiplier = 0.9;
              else if (rating.includes('b')) efficiencyMultiplier = 1.1;
              else if (rating.includes('c')) efficiencyMultiplier = 1.2;
            }
            
            // Apply age impact (older appliances are less efficient)
            if (appliance.age_years && appliance.age_years > 5) {
              efficiencyMultiplier *= 1 + (appliance.age_years - 5) * 0.02; // 2% per year after 5 years
            }
            
            const consumption = baseConsumption * usageFactor * efficiencyMultiplier * (0.8 + Math.random() * 0.4); // ±20% variation
            
            if (consumption > 0.01) { // Only record if significant consumption
              consumptionData.push({
                timestamp: timestamp.toISOString(),
                device: appliance.name,
                kwh: Math.round(consumption * 100) / 100, // Round to 2 decimals
                machine_id: appliance.model || appliance.name,
                process_id: appliance.location || 'main'
              });
            }
          });
        }
      }
      
      // Store the imported data
      importedAppliances = appliances;
      uploadedData = consumptionData;
      lastImportTimestamp = new Date().toISOString();
      
      return {
        appliances,
        consumption_data: consumptionData,
        import_timestamp: lastImportTimestamp,
        total_appliances: appliances.length
      };
    } catch (error) {
      throw new Error('Failed to parse appliance CSV file. Please check the format.');
    }
  },

  // Get imported appliances with performance optimization
  async getImportedAppliances(): Promise<ApplianceDetail[]> {
    // Limit to 200 appliances for optimal performance
    return importedAppliances.slice(0, 200);
  },

  // Time-based analysis endpoints
  async getShiftAnalysis(): Promise<{ patterns: ShiftUsagePattern[]; thresholds: ThresholdConfig[] }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (uploadedData.length === 0) {
      return { patterns: [], thresholds: [] };
    }

    const uniqueDevices = [...new Set(uploadedData.map(r => r.device))];
    const patterns: ShiftUsagePattern[] = [];
    
    uniqueDevices.forEach(device => {
      TIME_SHIFTS.forEach(shift => {
        const pattern = calculateShiftPattern(uploadedData, device, shift);
        patterns.push(pattern);
      });
    });
    
    const thresholds = generateThresholds(patterns);
    
    // Cache for other functions
    shiftUsagePatterns = patterns;
    thresholdConfigs = thresholds;
    
    return { patterns, thresholds };
  },

  async getPredictiveModels(): Promise<PredictiveModel[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (uploadedData.length === 0) return [];
    
    const uniqueDevices = [...new Set(uploadedData.map(r => r.device))];
    return uniqueDevices.map(device => predictNextUsage(uploadedData, device));
  },

  async getWastageAnalysis(): Promise<{
    device: string;
    shift: TimeShift['name'];
    wastedKwh: number;
    potentialSavings: number;
    severity: 'low' | 'medium' | 'high';
  }[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    if (uploadedData.length === 0) return [];
    
    // Generate thresholds if not cached
    if (thresholdConfigs.length === 0) {
      await this.getShiftAnalysis();
    }
    
    const wastageAnalysis: {
      device: string;
      shift: TimeShift['name'];
      wastedKwh: number;
      potentialSavings: number;
      severity: 'low' | 'medium' | 'high';
    }[] = [];
    
    const recentData = uploadedData.slice(-168); // Last 7 days
    
    thresholdConfigs.forEach(threshold => {
      const deviceShiftReadings = recentData.filter(r => {
        const shift = getTimeShift(r.timestamp);
        return r.device === threshold.device && shift.name === threshold.shift;
      });
      
      let totalWastage = 0;
      let highWastageCount = 0;
      
      deviceShiftReadings.forEach(reading => {
        if (reading.kwh > threshold.wastageThreshold) {
          totalWastage += (reading.kwh - threshold.efficiencyTarget);
          if (reading.kwh > threshold.anomalyThreshold) {
            highWastageCount++;
          }
        }
      });
      
      if (totalWastage > 0) {
        const severity: 'low' | 'medium' | 'high' = 
          highWastageCount > 0 ? 'high' :
          totalWastage > threshold.efficiencyTarget ? 'medium' : 'low';
        
        // Calculate potential savings (assume ₹6.5 per kWh for India, adjust based on location)
        const potentialSavings = totalWastage * 6.5; // Default to India rates
        
        wastageAnalysis.push({
          device: threshold.device,
          shift: threshold.shift,
          wastedKwh: Math.round(totalWastage * 100) / 100,
          potentialSavings: Math.round(potentialSavings * 100) / 100,
          severity
        });
      }
    });
    
    return wastageAnalysis.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
};

// WebSocket for real-time simulation data
export class SimulationWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: ((data: EnergyReading) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isActive: boolean = false;

  connect() {
    console.log('🔌 Starting simulation WebSocket connection...');
    this.isActive = true;
    // In production, this would connect to ws://localhost:8000/ws/sim
    // For now, we'll simulate with setInterval
    this.simulateRealTimeData();
  }

  onData(callback: (data: EnergyReading) => void) {
    this.callbacks.push(callback);
  }

  disconnect() {
    console.log('🔌 Disconnecting simulation WebSocket...');
    this.isActive = false;
    
    // Clear the interval to stop data generation
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Simulation data generation stopped');
    }
    
    // Close WebSocket if exists
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear callbacks
    this.callbacks = [];
  }

  private simulateRealTimeData() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      // Only generate data if connection is active
      if (!this.isActive) {
        return;
      }

      // Get current user mode from localStorage
      const userData = localStorage.getItem('energySageUser');
      const userMode = userData ? JSON.parse(userData).mode : 'household';
      
      // � BULLETPROOF: Restore user data if it was lost
      loadUserDataFromStorage();
      
      // �🚨 CRITICAL DEBUG: Check data status every time simulation runs
      console.log(`🔍 SIMULATION DEBUG: uploadedData=${uploadedData.length} records, userHasUploadedData=${userHasUploadedData}`);
      console.log(`🔍 localStorage check: hasFlag=${localStorage.getItem('energySage_userHasUploadedData')}, hasData=${localStorage.getItem('energySage_userUploadedData') ? 'YES' : 'NO'}`);
      
      if (uploadedData.length > 0) {
        console.log(`📋 First record: ${JSON.stringify(uploadedData[0])}`);
        console.log(`📋 Devices in data: [${[...new Set(uploadedData.map(r => r.device))].slice(0, 3).join(', ')}...]`);
      }

      let mockData: EnergyReading;

      // 🔥 ULTIMATE CHECK: Force use of uploaded data only
      if (forceUseUploadedDataOnly() || (localStorage.getItem('energySage_userHasUploadedData') === 'true' && uploadedData.length > 0)) {
        // 🎯 Use YOUR imported CSV data for realistic simulation
        const randomReading = uploadedData[Math.floor(Math.random() * uploadedData.length)];
        
        // Add realistic variations to maintain live feel (±15%)
        const variation = 0.85 + Math.random() * 0.3;
        const simulatedKwh = randomReading.kwh * variation;
        
        mockData = {
          timestamp: new Date().toISOString(),
          device: randomReading.device,
          kwh: Math.round(simulatedKwh * 1000) / 1000,
          machine_id: randomReading.machine_id,
          process_id: randomReading.process_id
        };
        
        console.log(`� REAL-TIME from YOUR data: ${mockData.device}, ${mockData.kwh.toFixed(3)} kWh`);
      } else if (userMode === 'industry') {
        // Fallback: Industry mode synthetic data when no imports available
        const industrialDevices = [
          { name: 'Production Line A', base: 85, machine_id: 'PL_A_001', process: 'manufacturing', variance: 0.15 },
          { name: 'Production Line B', base: 82, machine_id: 'PL_B_002', process: 'manufacturing', variance: 0.12 },
          { name: 'Compressor Bank 1', base: 45, machine_id: 'COMP_001', process: 'utilities', variance: 0.08 },
          { name: 'Compressor Bank 2', base: 43, machine_id: 'COMP_002', process: 'utilities', variance: 0.08 },
          { name: 'HVAC System North', base: 28, machine_id: 'HVAC_N_001', process: 'climate', variance: 0.18 },
          { name: 'HVAC System South', base: 31, machine_id: 'HVAC_S_002', process: 'climate', variance: 0.18 },
          { name: 'Robotic Assembly Unit 1', base: 52, machine_id: 'ROBOT_001', process: 'assembly', variance: 0.10 },
          { name: 'Robotic Assembly Unit 2', base: 48, machine_id: 'ROBOT_002', process: 'assembly', variance: 0.10 },
          { name: 'Curing Oven', base: 75, machine_id: 'OVEN_001', process: 'finishing', variance: 0.14 },
          { name: 'Lighting - Factory Floor', base: 22, machine_id: 'LIGHT_FF_001', process: 'lighting', variance: 0.05 }
        ];

        const selectedDevice = industrialDevices[Math.floor(Math.random() * industrialDevices.length)];
        
        // Apply time-based load factor for industrial predictability
        const hour = new Date().getHours();
        let loadFactor = 1.0;
        
        // Industrial operation patterns: higher during work hours
        if (hour >= 6 && hour <= 18) {
          loadFactor = 1.0; // Full operation during work hours
        } else if (hour >= 19 && hour <= 22) {
          loadFactor = 0.7; // Reduced evening operations
        } else {
          loadFactor = 0.4; // Night shift/maintenance operations
        }

        // More predictable variance for industrial equipment
        const consumption = selectedDevice.base * loadFactor * (1 + (Math.random() - 0.5) * selectedDevice.variance);
        
        mockData = {
          timestamp: new Date().toISOString(),
          device: selectedDevice.name,
          kwh: Math.round(consumption * 100) / 100,
          machine_id: selectedDevice.machine_id,
          process_id: selectedDevice.process
        };
      } else if (importedAppliances.length > 0) {
        // Use imported appliances for realistic household simulation
        const randomAppliance = importedAppliances[Math.floor(Math.random() * importedAppliances.length)];
        
        // Calculate realistic consumption based on appliance specs
        const hour = new Date().getHours();
        let usageFactor = this.calculateApplianceUsageFactor(randomAppliance, hour);
        
        // Base consumption from rated power (convert W to kWh for hourly rate)
        const baseConsumption = (randomAppliance.rated_power || 100) / 1000;
        const simulatedKwh = baseConsumption * usageFactor;
        
        mockData = {
          timestamp: new Date().toISOString(),
          device: randomAppliance.name,
          kwh: Math.round(simulatedKwh * 1000) / 1000
        };
        
        console.log(`📊 Imported appliance: ${mockData.device}, ${mockData.kwh.toFixed(3)} kWh`);
      } else {
        // Fallback: Household synthetic data
        const householdDevices = [
          'Refrigerator', 'Water Heater', 'Air Conditioner', 'Washing Machine', 
          'Dryer', 'Dishwasher', 'Microwave', 'TV', 'Computer', 'Lights'
        ];
        
        const randomDevice = householdDevices[Math.floor(Math.random() * householdDevices.length)];
        const baseConsumption = 0.5 + Math.random() * 2.0; // 0.5-2.5 kWh
        
        mockData = {
          timestamp: new Date().toISOString(),
          device: randomDevice,
          kwh: baseConsumption * (0.7 + Math.random() * 0.6) // ±30% variation
        };
        
        console.log(`🏠 Household synthetic: ${mockData.device}, ${mockData.kwh.toFixed(3)} kWh`);
      }
      
      // 📊 CUMULATIVE CONSUMPTION: Add current reading to running total
      if (!simulationStartTime) {
        simulationStartTime = new Date();
        cumulativeConsumption = 0; // Reset on first simulation
        console.log('🔄 Starting new cumulative consumption tracking');
      }
      
      // Add current consumption to cumulative total
      cumulativeConsumption += mockData.kwh;
      
      // Create enhanced data with real-time values AND cumulative total
      const enhancedData = {
        ...mockData,
        // Keep original kwh for real-time graph (ups and downs)
        kwh: mockData.kwh,
        // Add cumulative total as separate field
        cumulativeKwh: Math.round(cumulativeConsumption * 1000) / 1000,
        // Track session info
        sessionStartTime: simulationStartTime?.toISOString()
      };
      
      console.log(`📈 Real-time: ${mockData.kwh.toFixed(3)} kWh | Cumulative Total: ${cumulativeConsumption.toFixed(3)} kWh`);
      
      this.callbacks.forEach(callback => callback(enhancedData));
    }, 2000); // Generate data every 2 seconds
    
    console.log('▶️ Real-time simulation started using your data patterns');
  }

  // Calculate realistic usage factor based on appliance type and time
  private calculateApplianceUsageFactor(appliance: ApplianceDetail, hour: number): number {
    let usageFactor = 0.1; // Default minimal usage
    
    switch (appliance.type) {
      case 'air_conditioner':
        if ((hour >= 22 || hour <= 6)) usageFactor = 0.6; // Night cooling
        else if (hour >= 12 && hour <= 18) usageFactor = 0.9; // Peak day usage  
        else if (hour >= 19 && hour <= 21) usageFactor = 0.8; // Evening
        else usageFactor = 0.2; // Morning/off hours
        break;
        
      case 'refrigerator':
        usageFactor = 0.4 + 0.2 * Math.sin((hour - 14) * Math.PI / 12); // Peak at 2 PM
        break;
        
      case 'water_heater':
        if ((hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21)) usageFactor = 0.8;
        else usageFactor = 0.1; // Standby
        break;
        
      case 'washing_machine':
        if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 19)) {
          usageFactor = Math.random() < 0.3 ? 1.0 : 0; // 30% chance of usage
        } else usageFactor = 0;
        break;
        
      case 'television':
        if (hour >= 18 && hour <= 23) usageFactor = 0.8;
        else if ((hour >= 7 && hour <= 9) || (hour >= 14 && hour <= 17)) usageFactor = 0.4;
        else usageFactor = 0.1;
        break;
        
      case 'microwave':
        if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
          usageFactor = Math.random() < 0.6 ? 1.0 : 0;
        } else usageFactor = 0;
        break;
        
      case 'fan':
        if (hour >= 11 && hour <= 18) usageFactor = 0.9;
        else if (hour >= 22 || hour <= 6) usageFactor = 0.7;
        else usageFactor = 0.3;
        break;
        
      default:
        usageFactor = 0.3 + Math.random() * 0.4; // Random 30-70% usage
        break;
    }
    
    // Add some randomness (±20%)
    return usageFactor * (0.8 + Math.random() * 0.4);
  }
}