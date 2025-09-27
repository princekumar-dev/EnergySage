import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Factory, Zap, TrendingUp, Leaf, DollarSign } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'household' | 'industry' | null>(null);

  const handleModeSelect = (mode: 'household' | 'industry') => {
    setSelectedMode(mode);
    localStorage.setItem('energySageMode', mode);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EnergySage
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              AI-Powered Energy Analytics
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Optimize Your Energy Consumption with
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Intelligence</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Advanced forecasting, anomaly detection, and personalized recommendations 
            to reduce costs and carbon footprint for both households and industries.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Forecasting</h3>
              <p className="text-gray-600">Prophet & LSTM models predict energy consumption patterns</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Carbon Tracking</h3>
              <p className="text-gray-600">Monitor and reduce your environmental impact</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cost Optimization</h3>
              <p className="text-gray-600">Actionable recommendations with quantified savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selection */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Choose Your Mode</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Household Mode */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                selectedMode === 'household' ? 'ring-4 ring-blue-500 shadow-2xl' : 'hover:shadow-xl'
              }`}
              onClick={() => handleModeSelect('household')}
            >
              <CardHeader className="text-center pb-4">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Household Mode</CardTitle>
                <CardDescription className="text-base">
                  Perfect for homeowners and renters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Track appliance consumption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Optimize heating & cooling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Schedule smart devices</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Reduce monthly bills</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Start Household Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Industry Mode */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                selectedMode === 'industry' ? 'ring-4 ring-indigo-500 shadow-2xl' : 'hover:shadow-xl'
              }`}
              onClick={() => handleModeSelect('industry')}
            >
              <CardHeader className="text-center pb-4">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Factory className="h-10 w-10 text-indigo-600" />
                </div>
                <CardTitle className="text-2xl">Industry Mode</CardTitle>
                <CardDescription className="text-base">
                  Designed for manufacturing and facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">Monitor machine efficiency</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">Predict maintenance needs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">Optimize production schedules</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">Reduce operational costs</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                  size="lg"
                >
                  Start Industrial Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-semibold">EnergySage</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering sustainable energy decisions through AI-driven insights
          </p>
          <div className="text-sm text-gray-500">
            © 2025 EnergySage. Built with React, FastAPI, and advanced ML models.
          </div>
        </div>
      </footer>
    </div>
  );
}