
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Activity, BarChart3, DollarSign, Clock, Zap } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Stock Tracking',
      description: 'Monitor stock prices with interactive charts and customizable time intervals',
      color: 'blue',
    },
    {
      icon: Activity,
      title: 'Correlation Analysis',
      description: 'Visualize relationships between stocks with our advanced heatmap',
      color: 'purple',
    },
    {
      icon: BarChart3,
      title: 'Statistical Insights',
      description: 'Get detailed statistics including averages and standard deviations',
      color: 'green',
    },
    {
      icon: Zap,
      title: 'Performance Optimized',
      description: 'Efficient API usage and responsive design for the best user experience',
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Stock Price
                <span className="text-blue-600"> Aggregation</span>
                <br />
                Platform
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive real-time stock analysis with interactive charts, correlation heatmaps, 
                and advanced analytics to help you make informed investment decisions.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/stocks">
                <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Start Stock Analysis
                </Button>
              </Link>
              <Link to="/correlation">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Activity className="mr-2 h-5 w-5" />
                  View Correlation Heatmap
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover powerful tools designed to enhance your stock market analysis experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardHeader className="text-center">
                <div className={`mx-auto p-3 rounded-full bg-${feature.color}-100 w-fit`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">20+ Stocks</h3>
              <p className="text-gray-600">Major stocks available for analysis</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Real-time</h3>
              <p className="text-gray-600">Live price updates and analysis</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-4 bg-purple-100 rounded-full">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Advanced</h3>
              <p className="text-gray-600">Correlation and statistical analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Analyzing?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust our platform for their stock analysis needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/stocks">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <TrendingUp className="mr-2 h-5 w-5" />
                Analyze Stocks Now
              </Button>
            </Link>
            <Link to="/correlation">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600">
                <Activity className="mr-2 h-5 w-5" />
                View Correlations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
