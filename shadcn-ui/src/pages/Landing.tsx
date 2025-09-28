import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Factory, 
  Zap, 
  TrendingUp, 
  Leaf, 
  DollarSign, 
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'household' | 'industry' | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleModeSelect = (mode: 'household' | 'industry') => {
    setSelectedMode(mode);
    localStorage.setItem('energySageMode', mode);
    navigate('/auth');
  };

  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor energy consumption patterns with live data visualization and instant insights."
    },
    {
      icon: TrendingUp,
      title: "AI Forecasting",
      description: "Predict future energy needs with machine learning algorithms and historical data."
    },
    {
      icon: Shield,
      title: "Anomaly Detection",
      description: "Automatically identify unusual consumption patterns and potential equipment issues."
    }
  ];

  const stats = [
    { value: "30%", label: "Average Cost Reduction" },
    { value: "15k+", label: "Active Users" },
    { value: "50M+", label: "kWh Analyzed" },
    { value: "99.9%", label: "Uptime Reliability" }
  ];

  const benefits = [
    "Real-time consumption monitoring",
    "AI-powered predictive analytics", 
    "Cost optimization recommendations",
    "Carbon footprint tracking",
    "Anomaly detection & alerts",
    "Multi-location support"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-lg border-b shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Zap className="h-8 w-8 text-emerald-500" />
                <div className="absolute -inset-1 bg-emerald-500/20 blur-sm rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900">EnergySage</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Beta
              </Badge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-gray-900 transition-colors">Solutions</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Smart Energy
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform your energy consumption with AI-powered analytics, predictive insights, 
              and automated optimization for both residential and industrial applications.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to monitor, analyze, and optimize your energy consumption
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group">
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Solution
            </h2>
            <p className="text-xl text-gray-600">
              Tailored energy management for every need
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Household Mode */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 ${
                selectedMode === 'household' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
              }`}
              onClick={() => handleModeSelect('household')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Home className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Household Mode</CardTitle>
                <CardDescription className="text-base">
                  Perfect for residential energy management and family cost savings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-600">Home appliance monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-600">Monthly bill optimization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-600">Family usage insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
                    <span className="text-gray-600">Smart recommendations</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                  onClick={() => handleModeSelect('household')}
                >
                  Start with Household
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Industry Mode */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 ${
                selectedMode === 'industry' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleModeSelect('industry')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Factory className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">Industrial Mode</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-grade analytics for manufacturing and large facilities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-600">Multi-facility management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-600">Production line optimization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-600">Equipment health monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-600">Advanced process analytics</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  onClick={() => handleModeSelect('industry')}
                >
                  Start with Industrial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose EnergySage?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of customers who have transformed their energy management 
                with our cutting-edge platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-lg px-8"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-3xl p-8 relative">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <BarChart3 className="h-8 w-8 text-emerald-500 mb-4" />
                    <div className="text-2xl font-bold text-gray-900">Analytics</div>
                    <div className="text-gray-600">Real-time insights</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <TrendingUp className="h-8 w-8 text-blue-500 mb-4" />
                    <div className="text-2xl font-bold text-gray-900">Forecasts</div>
                    <div className="text-gray-600">AI predictions</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <DollarSign className="h-8 w-8 text-green-500 mb-4" />
                    <div className="text-2xl font-bold text-gray-900">Savings</div>
                    <div className="text-gray-600">Cost optimization</div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <Leaf className="h-8 w-8 text-emerald-600 mb-4" />
                    <div className="text-2xl font-bold text-gray-900">Green</div>
                    <div className="text-gray-600">Carbon tracking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold">EnergySage</span>
            </div>
            <div className="text-gray-400">
              © 2025 EnergySage. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}