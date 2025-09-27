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

export interface CostData {
  total_cost: number;
  total_co2: number;
  cost_per_kwh: number;
  co2_factor: number;
  location: string;
}

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
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      message: 'CSV uploaded successfully',
      records_processed: 100
    };
  },

  // Time series data
  async getTimeSeries(from: string, to: string, mode: 'household' | 'industry'): Promise<EnergyReading[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock time series data
    const data: EnergyReading[] = [];
    const start = new Date(from);
    const end = new Date(to);
    
    for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
      if (mode === 'household') {
        data.push({
          timestamp: d.toISOString(),
          device: 'total',
          kwh: Math.random() * 5 + 2
        });
      } else {
        data.push({
          timestamp: d.toISOString(),
          device: 'total',
          kwh: Math.random() * 50 + 20,
          machine_id: 'TOTAL',
          process_id: 'ALL'
        });
      }
    }
    
    return data;
  },

  // Predictions
  async getPredictions(horizonDays: number, model: 'prophet' | 'lstm' = 'prophet'): Promise<Prediction[]> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const predictions: Prediction[] = [];
    const now = new Date();
    
    for (let i = 0; i < horizonDays * 24; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
      const baseValue = Math.sin(i / 24 * Math.PI * 2) * 2 + 5;
      const predicted = baseValue + Math.random() * 2 - 1;
      
      predictions.push({
        timestamp: timestamp.toISOString(),
        predicted_kwh: predicted,
        confidence_interval: [predicted * 0.8, predicted * 1.2]
      });
    }
    
    return predictions;
  },

  // Anomalies
  async getAnomalies(from: string, to: string): Promise<Anomaly[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        timestamp: '2025-09-01T14:00:00',
        device: 'ac',
        actual_kwh: 4.2,
        expected_kwh: 2.5,
        severity: 'high'
      },
      {
        timestamp: '2025-09-01T08:00:00',
        device: 'washing_machine',
        actual_kwh: 3.1,
        expected_kwh: 2.0,
        severity: 'medium'
      }
    ];
  },

  // Recommendations
  async getRecommendations(): Promise<Recommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        title: 'Optimize AC Schedule',
        description: 'Your AC usage peaks during expensive hours. Shift cooling to off-peak times (11 PM - 6 AM) for 30% cost savings.',
        device: 'ac',
        estimated_savings_kwh: 45.2,
        estimated_savings_cost: 12.85,
        estimated_co2_reduction: 22.1,
        priority: 'high',
        category: 'scheduling'
      },
      {
        id: '2',
        title: 'Washing Machine Efficiency',
        description: 'Your washing machine consumes 40% more than average. Consider maintenance check or eco-mode usage.',
        device: 'washing_machine',
        estimated_savings_kwh: 18.7,
        estimated_savings_cost: 5.32,
        estimated_co2_reduction: 9.1,
        priority: 'medium',
        category: 'efficiency'
      },
      {
        id: '3',
        title: 'LED Light Upgrade',
        description: 'Replace remaining incandescent bulbs with LED for 75% energy reduction in lighting.',
        device: 'light_living',
        estimated_savings_kwh: 12.3,
        estimated_savings_cost: 3.50,
        estimated_co2_reduction: 6.0,
        priority: 'low',
        category: 'replacement'
      }
    ];
  },

  // Cost and carbon data
  async getCostData(location: string = 'US'): Promise<CostData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rates: Record<string, { cost_per_kwh: number; co2_factor: number }> = {
      'US': { cost_per_kwh: 0.13, co2_factor: 0.92 },
      'UK': { cost_per_kwh: 0.28, co2_factor: 0.23 },
      'India': { cost_per_kwh: 0.08, co2_factor: 0.82 },
      'Germany': { cost_per_kwh: 0.35, co2_factor: 0.34 }
    };
    
    const rate = rates[location] || rates['US'];
    const totalKwh = 150; // Mock total consumption
    
    return {
      total_cost: totalKwh * rate.cost_per_kwh,
      total_co2: totalKwh * rate.co2_factor,
      cost_per_kwh: rate.cost_per_kwh,
      co2_factor: rate.co2_factor,
      location
    };
  },

  // Simulation controls
  async startSimulation(): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Simulation started' };
  },

  async stopSimulation(): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Simulation stopped' };
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