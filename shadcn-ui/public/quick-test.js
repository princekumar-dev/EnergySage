// Quick API Function Validation Script
// Run this in the browser console to check core functions

console.log('🧪 Starting Quick API Function Validation...\n');

// Import the API
import('./src/lib/api.js').then(({ api }) => {
  
  const runQuickTests = async () => {
    const results = [];
    
    console.log('📋 Testing Core Functions...');
    
    // Test 1: Real-time data initialization
    try {
      console.log('1. Testing real-time data...');
      const realtimeData = await api.getRealtimeTestData();
      console.log('✅ Real-time data:', realtimeData.message);
      results.push({ test: 'Real-time Data', status: 'PASS' });
    } catch (error) {
      console.log('❌ Real-time data failed:', error.message);
      results.push({ test: 'Real-time Data', status: 'FAIL', error: error.message });
    }
    
    // Test 2: Authentication
    try {
      console.log('2. Testing authentication...');
      const authResult = await api.login('demo@household.com', 'demo123');
      console.log('✅ Authentication:', authResult.user.mode);
      results.push({ test: 'Authentication', status: 'PASS' });
    } catch (error) {
      console.log('❌ Authentication failed:', error.message);
      results.push({ test: 'Authentication', status: 'FAIL', error: error.message });
    }
    
    // Test 3: Time series data
    try {
      console.log('3. Testing time series...');
      const timeSeriesData = await api.getTimeSeries(
        '2024-01-01T00:00:00Z', 
        '2024-01-07T23:59:59Z', 
        'household'
      );
      console.log('✅ Time series:', timeSeriesData.length, 'readings');
      results.push({ test: 'Time Series', status: 'PASS' });
    } catch (error) {
      console.log('❌ Time series failed:', error.message);
      results.push({ test: 'Time Series', status: 'FAIL', error: error.message });
    }
    
    // Test 4: Predictions
    try {
      console.log('4. Testing predictions...');
      const predictions = await api.getPredictions(7);
      console.log('✅ Predictions:', predictions.length, 'data points');
      results.push({ test: 'Predictions', status: 'PASS' });
    } catch (error) {
      console.log('❌ Predictions failed:', error.message);
      results.push({ test: 'Predictions', status: 'FAIL', error: error.message });
    }
    
    // Test 5: Anomalies
    try {
      console.log('5. Testing anomalies...');
      const anomalies = await api.getAnomalies(
        '2024-01-01T00:00:00Z', 
        '2024-01-07T23:59:59Z'
      );
      console.log('✅ Anomalies:', anomalies.length, 'detected');
      results.push({ test: 'Anomalies', status: 'PASS' });
    } catch (error) {
      console.log('❌ Anomalies failed:', error.message);
      results.push({ test: 'Anomalies', status: 'FAIL', error: error.message });
    }
    
    // Test 6: Recommendations
    try {
      console.log('6. Testing recommendations...');
      const recommendations = await api.getRecommendations('US');
      console.log('✅ Recommendations:', recommendations.length, 'suggestions');
      results.push({ test: 'Recommendations', status: 'PASS' });
    } catch (error) {
      console.log('❌ Recommendations failed:', error.message);
      results.push({ test: 'Recommendations', status: 'FAIL', error: error.message });
    }
    
    // Test 7: Grid Awareness
    try {
      console.log('7. Testing grid awareness...');
      const gridData = await api.getGridAwareness('AREA_CENTRAL');
      console.log('✅ Grid awareness:', gridData.current_grid_status.status, 'status');
      results.push({ test: 'Grid Awareness', status: 'PASS' });
    } catch (error) {
      console.log('❌ Grid awareness failed:', error.message);
      results.push({ test: 'Grid Awareness', status: 'FAIL', error: error.message });
    }
    
    // Test 8: Energy Score
    try {
      console.log('8. Testing energy score...');
      const energyScore = await api.getEnergyScore();
      console.log('✅ Energy score:', energyScore.overall_score, 'Grade:', energyScore.grade);
      results.push({ test: 'Energy Score', status: 'PASS' });
    } catch (error) {
      console.log('❌ Energy score failed:', error.message);
      results.push({ test: 'Energy Score', status: 'FAIL', error: error.message });
    }
    
    // Test 9: Smart Alerts
    try {
      console.log('9. Testing smart alerts...');
      const alerts = await api.getSmartAlerts();
      console.log('✅ Smart alerts:', alerts.length, 'alerts');
      results.push({ test: 'Smart Alerts', status: 'PASS' });
    } catch (error) {
      console.log('❌ Smart alerts failed:', error.message);
      results.push({ test: 'Smart Alerts', status: 'FAIL', error: error.message });
    }
    
    // Test 10: Simulation Controls
    try {
      console.log('10. Testing simulation controls...');
      const startResult = await api.startSimulation();
      const stopResult = await api.stopSimulation();
      console.log('✅ Simulation controls: Start/Stop working');
      results.push({ test: 'Simulation Controls', status: 'PASS' });
    } catch (error) {
      console.log('❌ Simulation controls failed:', error.message);
      results.push({ test: 'Simulation Controls', status: 'FAIL', error: error.message });
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🧪 QUICK API VALIDATION RESULTS');
    console.log('='.repeat(50));
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total = results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed} (${((passed/total)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  • ${r.test}: ${r.error}`);
      });
    }
    
    console.log('\n' + (passed === total ? '🎉 ALL CORE FUNCTIONS WORKING!' : '⚠️ SOME FUNCTIONS NEED ATTENTION'));
    console.log('='.repeat(50));
    
    return results;
  };
  
  runQuickTests().catch(console.error);
  
}).catch(error => {
  console.error('Failed to load API module:', error);
});