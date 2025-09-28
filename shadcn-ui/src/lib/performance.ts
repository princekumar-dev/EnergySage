// Performance utilities for handling large datasets efficiently
import { EnergyReading } from '@/lib/api';

/**
 * Throttle data to prevent UI lag with large datasets
 * @param data - Array of energy readings
 * @param maxPoints - Maximum number of points to display (default: 200)
 * @returns Throttled data array
 */
export function throttleData<T extends EnergyReading>(data: T[], maxPoints: number = 200): T[] {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}

/**
 * Batch process data in chunks to prevent blocking the UI
 * @param data - Array of data to process
 * @param chunkSize - Size of each chunk (default: 50)
 * @param processor - Function to process each chunk
 */
export async function batchProcess<T, R>(
  data: T[], 
  processor: (chunk: T[]) => R[], 
  chunkSize: number = 50
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const chunkResults = processor(chunk);
    results.push(...chunkResults);
    
    // Allow UI to breathe between chunks
    if (i + chunkSize < data.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  return results;
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Optimize data for chart rendering
 */
export function optimizeChartData(data: EnergyReading[], maxPoints: number = 200) {
  // Sort by timestamp for consistent display
  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Throttle if needed
  return throttleData(sortedData, maxPoints);
}

/**
 * Create efficient lookup maps for performance
 */
export function createTimestampLookup(anomalies: any[] = []): Set<number> {
  return new Set(anomalies.map(a => new Date(a.timestamp).getTime()));
}

/**
 * Aggregate data efficiently for breakdown charts
 */
export function aggregateByDevice(
  data: EnergyReading[], 
  mode: 'household' | 'industry',
  limit: number = 10
) {
  const deviceMap = new Map<string, number>();
  
  // Use Map for better performance than object
  for (const reading of data) {
    const key = mode === 'household' ? reading.device : (reading.machine_id || reading.device);
    deviceMap.set(key, (deviceMap.get(key) || 0) + reading.kwh);
  }
  
  // Convert to array and sort
  return Array.from(deviceMap.entries())
    .map(([device, kwh]) => ({ device, kwh: Number(kwh.toFixed(2)) }))
    .sort((a, b) => b.kwh - a.kwh)
    .slice(0, limit);
}