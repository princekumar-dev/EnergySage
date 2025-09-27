// API Function Test Runner for EnergySage
// This file can be imported and used to test all API functions

import { api } from './api';

// Simple test configuration
const TEST_MODES = ['household', 'industry'] as const;

// Core API Functions Test Suite
export const testAPIFunctions = async (): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{
    function: string;
    mode: string;
    status: 'PASS' | 'FAIL';
    error?: string;
    responseTime: number;
  }>
}> => {
  const results: Array<{
    function: string;
    mode: string;
    status: 'PASS' | 'FAIL';
    error?: string;
    responseTime: number;
  }> = [];
  
  console.log('🧪 Starting API Function Tests...\n');

  // Test helper function
  const testFunction = async (
    name: string,
    testFn: () => Promise<any>,
    mode: string = 'both'
  ) => {
    const start = Date.now();
    try {
      console.log(`Testing ${name} [${mode}]...`);
      const result = await testFn();
      const responseTime = Date.now() - start;
      
      results.push({
        function: name,
        mode,
        status: 'PASS',
        responseTime
      });
      
      console.log(`✅ ${name} - PASSED (${responseTime}ms)`, result ? '✓' : '');
      return result;
    } catch (error) {
      const responseTime = Date.now() - start;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      results.push({
        function: name,
        mode,
        status: 'FAIL',
        error: errorMsg,
        responseTime
      });
      
      console.log(`❌ ${name} - FAILED (${responseTime}ms):`, errorMsg);
      return null;
    }
  };

  // 1. Test Authentication Functions
  console.log('\n📋 Testing Authentication Functions...');
  
  await testFunction(
    'login(household)',
    () => api.login('demo@household.com', 'demo123'),
    'household'
  );
  
  await testFunction(
    'login(industry)',
    () => api.login('demo@industry.com', 'demo123'),
    'industry'
  );
  
  await testFunction(
    'register(household)',
    () => api.register('test@test.com', 'pass123', 'household'),
    'household'
  );
  
  await testFunction(
    'register(industry)',
    () => api.register('test@test.com', 'pass123', 'industry'),
    'industry'
  );

  // 2. Test Real-time Data Functions
  console.log('\n📊 Testing Real-time Data Functions...');
  
  await testFunction(
    'getRealtimeTestData',
    () => api.getRealtimeTestData(),
    'both'
  );

  // 3. Test Time Series Functions
  console.log('\n📈 Testing Time Series Functions...');
  
  const dateFrom = '2024-01-01T00:00:00Z';
  const dateTo = '2024-01-07T23:59:59Z';
  
  for (const mode of TEST_MODES) {
    await testFunction(
      `getTimeSeries(${mode})`,
      () => api.getTimeSeries(dateFrom, dateTo, mode),
      mode
    );
  }

  // 4. Test Prediction Functions
  console.log('\n🔮 Testing Prediction Functions...');
  
  await testFunction(
    'getPredictions',
    () => api.getPredictions(7, 'prophet'),
    'both'
  );
  
  await testFunction(
    'getAnomalies',
    () => api.getAnomalies(dateFrom, dateTo),
    'both'
  );

  // 5. Test Analysis Functions
  console.log('\n📊 Testing Analysis Functions...');
  
  await testFunction(
    'getRecommendations',
    () => api.getRecommendations('US'),
    'both'
  );
  
  await testFunction(
    'getCostData',
    () => api.getCostData('US'),
    'both'
  );
  
  await testFunction(
    'getEnergyScore',
    () => api.getEnergyScore(),
    'both'
  );

  // 6. Test Grid Functions
  console.log('\n🏘️ Testing Grid Functions...');
  
  await testFunction(
    'getGridAwareness',
    () => api.getGridAwareness('AREA_CENTRAL'),
    'both'
  );
  
  await testFunction(
    'getWeatherData',
    () => api.getWeatherData(),
    'both'
  );

  // 7. Test Smart Features
  console.log('\n🤖 Testing Smart Features...');
  
  await testFunction(
    'getSmartAlerts',
    () => api.getSmartAlerts(),
    'both'
  );
  
  await testFunction(
    'getPredictiveMaintenance',
    () => api.getPredictiveMaintenance(),
    'both'
  );
  
  await testFunction(
    'getBenchmarkData',
    () => api.getBenchmarkData(),
    'both'
  );
  
  await testFunction(
    'getPeakDemandForecast',
    () => api.getPeakDemandForecast(),
    'both'
  );

  // 8. Test Advanced Analysis
  console.log('\n🔬 Testing Advanced Analysis...');
  
  await testFunction(
    'getShiftAnalysis',
    () => api.getShiftAnalysis(),
    'both'
  );
  
  await testFunction(
    'getPredictiveModels',
    () => api.getPredictiveModels(),
    'both'
  );
  
  await testFunction(
    'getWastageAnalysis',
    () => api.getWastageAnalysis(),
    'both'
  );

  // 9. Test Scenario Generation
  console.log('\n📋 Testing Scenario Generation...');
  
  const scenarios = ['peak_load', 'energy_saver', 'weekend_usage'] as const;
  
  for (const scenario of scenarios) {
    await testFunction(
      `generateTestScenarios(${scenario})`,
      () => api.generateTestScenarios(scenario),
      'both'
    );
  }

  // 10. Test Simulation Functions
  console.log('\n⚡ Testing Simulation Functions...');
  
  await testFunction(
    'startSimulation',
    () => api.startSimulation(),
    'both'
  );
  
  await testFunction(
    'stopSimulation',
    () => api.stopSimulation(),
    'both'
  );

  // 11. Test Appliance Functions
  console.log('\n🏠 Testing Appliance Functions...');
  
  await testFunction(
    'getImportedAppliances',
    () => api.getImportedAppliances(),
    'both'
  );

  // Calculate results
  const totalTests = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('🧪 API FUNCTION TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passed} (${((passed/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed/totalTests)*100).toFixed(1)}%)`);
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
  console.log(`⏱️ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  
  // Show failed tests
  const failedTests = results.filter(r => r.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    failedTests.forEach(test => {
      console.log(`   • ${test.function} [${test.mode}]: ${test.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(passed === totalTests ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED');
  console.log('='.repeat(60));
  
  return {
    totalTests,
    passed,
    failed,
    results
  };
};

// Test household mode specific functions
export const testHouseholdMode = async () => {
  console.log('🏠 Testing Household Mode Functions...\n');
  
  const results = [];
  
  // Test household-specific features
  try {
    console.log('Testing household CSV upload format...');
    const householdCSV = new Blob([
      'timestamp,device,kwh\n' +
      '2024-01-01T10:00:00Z,Living Room AC,2.5\n' +
      '2024-01-01T10:00:00Z,Refrigerator,0.15'
    ], { type: 'text/csv' });
    
    const uploadResult = await api.uploadCSV(
      new File([householdCSV], 'household.csv'), 
      'household'
    );
    
      console.log('✅ Household CSV Upload:', uploadResult);
      results.push({ function: 'uploadCSV(household)', status: 'PASS' });
      
    } catch (error) {
      console.log('❌ Household CSV Upload failed:', error);
      results.push({ function: 'uploadCSV(household)', status: 'FAIL', error: error.message });
    }
  
  // Test household recommendations
  try {
    const recommendations = await api.getRecommendations('US');
    console.log('✅ Household Recommendations:', recommendations.length, 'recommendations');
    results.push({ function: 'getRecommendations(household)', status: 'PASS' });
  } catch (error) {
    console.log('❌ Household Recommendations failed:', error);
    results.push({ function: 'getRecommendations(household)', status: 'FAIL', error: error.message });
  }
  
  return results;
};

// Test industry mode specific functions  
export const testIndustryMode = async () => {
  console.log('🏭 Testing Industry Mode Functions...\n');
  
  const results = [];
  
  // Skip industry tests if user has uploaded their own data
  if (localStorage.getItem('energySage_userHasUploadedData') === 'true') {
    console.log('⏭️ SKIPPING industry tests - User has uploaded their own data');
    results.push({ function: 'industry tests', status: 'SKIP - User data exists' });
    return results;
  }
  
  // Test industry-specific features
  try {
    console.log('Testing industry CSV upload format...');
    const industryCSV = new Blob([
      'timestamp,machine_id,kwh,process_id\n' +
      '2024-01-01T10:00:00Z,MACHINE_001,15.5,production\n' +
      '2024-01-01T10:00:00Z,HVAC_001,8.2,climate'
    ], { type: 'text/csv' });
    
    const uploadResult = await api.uploadCSV(
      new File([industryCSV], 'industry.csv'), 
      'industry'
    );
    
    console.log('✅ Industry CSV Upload:', uploadResult);
    results.push({ function: 'uploadCSV(industry)', status: 'PASS' });
    
  } catch (error) {
    console.log('❌ Industry CSV Upload failed:', error);
    results.push({ function: 'uploadCSV(industry)', status: 'FAIL', error: error.message });
  }
  
  return results;
};

// Export test functions for use in React app
export default {
  testAPIFunctions,
  testHouseholdMode,
  testIndustryMode
};