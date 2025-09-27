// API client for EnergySage backend
export interface EnergyReading {
  timestamp: string;
  device: string;
  kwh: number;
  machine_id?: string;
  process_id?: string;
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

// Store uploaded data in memory for this session
let uploadedData: EnergyReading[] = [];
let importedAppliances: ApplianceDetail[] = [];
let lastImportTimestamp: string | null = null;

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
      
      // Store the uploaded data
      uploadedData = parsedData;
      
      return {
        message: `CSV uploaded successfully. ${parsedData.length} records processed.`,
        records_processed: parsedData.length
      };
    } catch (error) {
      throw new Error('Failed to parse CSV file. Please check the format.');
    }
  },

  // Time series data
  async getTimeSeries(from: string, to: string, mode: 'household' | 'industry'): Promise<EnergyReading[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Only use uploaded data; if none, return empty array
    if (uploadedData.length === 0) return [];
    const start = new Date(from);
    const end = new Date(to);
    const filteredData = uploadedData.filter(reading => {
      const readingTime = new Date(reading.timestamp);
      return readingTime >= start && readingTime <= end;
    });
    return filteredData;
  },

  // Predictions
  async getPredictions(horizonDays: number, model: 'prophet' | 'lstm' = 'prophet'): Promise<Prediction[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Only generate predictions if real data is available
    if (uploadedData.length === 0) return [];
    
    const predictions: Prediction[] = [];
    const now = new Date();
    
    // Calculate average consumption from real data
    const avgConsumption = uploadedData.reduce((sum, reading) => sum + reading.kwh, 0) / uploadedData.length;
    
    for (let i = 0; i < horizonDays * 24; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      // Base prediction on actual consumption patterns
      const baseValue = avgConsumption + Math.sin(i / 24 * Math.PI * 2) * (avgConsumption * 0.3);
      const predicted = baseValue + (Math.random() * 2 - 1) * (avgConsumption * 0.1);
      
      predictions.push({
        timestamp: timestamp.toISOString(),
        predicted_kwh: Math.max(0, predicted),
        confidence_interval: [Math.max(0, predicted * 0.8), predicted * 1.2]
      });
    }
    
    return predictions;
  },

  // Anomalies
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
    
    // Calculate device averages for anomaly detection
    const deviceAverages = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    
    filteredData.forEach(reading => {
      const current = deviceAverages.get(reading.device) || 0;
      const count = deviceCounts.get(reading.device) || 0;
      deviceAverages.set(reading.device, current + reading.kwh);
      deviceCounts.set(reading.device, count + 1);
    });
    
    // Convert to actual averages
    deviceAverages.forEach((total, device) => {
      const count = deviceCounts.get(device) || 1;
      deviceAverages.set(device, total / count);
    });
    
    // Detect anomalies (readings that are >50% higher than device average)
    const anomalies: Anomaly[] = [];
    filteredData.forEach(reading => {
      const expected = deviceAverages.get(reading.device) || reading.kwh;
      if (reading.kwh > expected * 1.5) {
        const severity = reading.kwh > expected * 2 ? 'high' : 'medium';
        anomalies.push({
          timestamp: reading.timestamp,
          device: reading.device,
          actual_kwh: reading.kwh,
          expected_kwh: expected,
          severity: severity as 'low' | 'medium' | 'high'
        });
      }
    });
    
    return anomalies.slice(0, 10); // Return max 10 anomalies
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
    
    // Only generate recommendations if real appliances are imported
    if (importedAppliances.length === 0) return [];
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
    
    // Only use uploaded data; if none, return zeroes
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

  // Load sample data from public CSV files
  async loadSampleData(mode: 'household' | 'industry'): Promise<{ message: string; records_processed: number }> {
    throw new Error('Sample data loading is disabled. Please upload your own data.');
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

  // Get imported appliances
  async getImportedAppliances(): Promise<ApplianceDetail[]> {
    return importedAppliances;
  }
};

// WebSocket for real-time simulation data
export class SimulationWebSocket {
  private ws: WebSocket | null = null;
  private callbacks: ((data: EnergyReading) => void)[] = [];

  connect() {
    // In production, this would connect to ws://localhost:8000/ws/sim
    // For now, we'll simulate with setInterval
    this.simulateRealTimeData();
  }

  onData(callback: (data: EnergyReading) => void) {
    this.callbacks.push(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private simulateRealTimeData() {
    setInterval(() => {
      const mockData: EnergyReading = {
        timestamp: new Date().toISOString(),
        device: 'real_time_total',
        kwh: Math.random() * 5 + 2
      };
      
      this.callbacks.forEach(callback => callback(mockData));
    }, 2000);
  }
}