import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Home, 
  Factory,
  TestTube2,
  RefreshCw
} from 'lucide-react';
import { testAPIFunctions, testHouseholdMode, testIndustryMode } from '../lib/test-functions';

interface TestResult {
  function: string;
  mode: string;
  status: 'PASS' | 'FAIL';
  error?: string;
  responseTime: number;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

export default function APITestPage() {
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing tests...');
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 90));
      }, 100);
      
      setCurrentTest('Running comprehensive API tests...');
      const results = await testAPIFunctions();
      
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentTest('Tests completed!');
      setTestResults(results);
      
    } catch (error) {
      console.error('Test execution failed:', error);
      setCurrentTest('Test execution failed');
      setTestResults({
        totalTests: 0,
        passed: 0,
        failed: 1,
        results: [{
          function: 'Test Execution',
          mode: 'system',
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0
        }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runHouseholdTests = async () => {
    setIsRunning(true);
    setCurrentTest('Testing household mode functions...');
    
    try {
      const results = await testHouseholdMode();
      console.log('Household test results:', results);
      setCurrentTest('Household tests completed!');
    } catch (error) {
      console.error('Household tests failed:', error);
      setCurrentTest('Household tests failed');
    } finally {
      setIsRunning(false);
    }
  };

  const runIndustryTests = async () => {
    setIsRunning(true);
    setCurrentTest('Testing industry mode functions...');
    
    try {
      const results = await testIndustryMode();
      console.log('Industry test results:', results);
      setCurrentTest('Industry tests completed!');
    } catch (error) {
      console.error('Industry tests failed:', error);
      setCurrentTest('Industry tests failed');
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults(null);
    setCurrentTest('');
    setProgress(0);
  };

  const getStatusIcon = (status: 'PASS' | 'FAIL') => {
    return status === 'PASS' ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: 'PASS' | 'FAIL') => {
    return (
      <Badge className={status === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <TestTube2 className="h-8 w-8 text-blue-600" />
              <span>API Function Tests</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive testing suite for all EnergySage API functions
            </p>
          </div>
          <Button 
            onClick={clearResults} 
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Clear Results</span>
          </Button>
        </div>

        {/* Test Controls */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Zap className="h-5 w-5 text-blue-600" />
                <span>All Functions</span>
              </CardTitle>
              <CardDescription>
                Test all API functions for both household and industry modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Home className="h-5 w-5 text-emerald-600" />
                <span>Household Mode</span>
              </CardTitle>
              <CardDescription>
                Test household-specific functions and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runHouseholdTests} 
                disabled={isRunning}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Household
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Factory className="h-5 w-5 text-indigo-600" />
                <span>Industry Mode</span>
              </CardTitle>
              <CardDescription>
                Test industry-specific functions and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runIndustryTests} 
                disabled={isRunning}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Industry
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{currentTest}</span>
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results Summary */}
        {testResults && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testResults.totalTests}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Passed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{testResults.passed}</div>
                <div className="text-sm text-gray-500">
                  {((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{testResults.failed}</div>
                <div className="text-sm text-gray-500">
                  {((testResults.failed / testResults.totalTests) * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(testResults.results.reduce((sum, r) => sum + r.responseTime, 0) / testResults.totalTests).toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Response Time
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Results */}
        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube2 className="h-5 w-5" />
                <span>Detailed Test Results</span>
              </CardTitle>
              <CardDescription>
                Complete breakdown of all API function tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.function}</div>
                        <div className="text-sm text-gray-500">{result.mode}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500">
                        {result.responseTime}ms
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    {result.error && (
                      <div className="text-xs text-red-600 max-w-xs truncate">
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Status Alert */}
        {testResults && (
          <Alert className={testResults.failed === 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className="flex items-center space-x-2">
              {testResults.failed === 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-medium">
                    🎉 All API functions are working properly! All {testResults.totalTests} tests passed.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 font-medium">
                    ⚠️ {testResults.failed} out of {testResults.totalTests} tests failed. Check the details above.
                  </span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}