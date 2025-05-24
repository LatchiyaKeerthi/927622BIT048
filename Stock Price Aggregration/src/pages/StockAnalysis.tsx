
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface StockData {
  price: number;
  lastUpdatedAt: string;
}

interface Stock {
  [companyName: string]: string;
}

interface StockResponse {
  stocks: Stock;
}

const StockAnalysis = () => {
  const [selectedStock, setSelectedStock] = useState<string>('NVDA');
  const [timeInterval, setTimeInterval] = useState<number>(60);
  const [customInterval, setCustomInterval] = useState<string>('');

  // Fetch available stocks
  const { data: stocksData } = useQuery<StockResponse>({
    queryKey: ['stocks'],
    queryFn: async () => {
      const response = await fetch('http://20.244.56.144/evaluation-service/stocks');
      return response.json();
    },
  });

  // Fetch stock price history
  const { data: priceHistory, isLoading } = useQuery<StockData[]>({
    queryKey: ['stockHistory', selectedStock, timeInterval],
    queryFn: async () => {
      const response = await fetch(
        `http://20.244.56.144/evaluation-service/stocks/${selectedStock}?minutes=${timeInterval}`
      );
      return response.json();
    },
    enabled: !!selectedStock,
  });

  const processChartData = () => {
    if (!priceHistory) return [];
    
    return priceHistory.map((item, index) => ({
      time: new Date(item.lastUpdatedAt).toLocaleTimeString(),
      price: item.price,
      index: index,
    }));
  };

  const calculateAverage = () => {
    if (!priceHistory) return 0;
    const sum = priceHistory.reduce((acc, item) => acc + item.price, 0);
    return sum / priceHistory.length;
  };

  const getStockName = () => {
    if (!stocksData) return selectedStock;
    const stockEntry = Object.entries(stocksData.stocks).find(([, ticker]) => ticker === selectedStock);
    return stockEntry ? stockEntry[0] : selectedStock;
  };

  const handleIntervalChange = (minutes: number) => {
    setTimeInterval(minutes);
    setCustomInterval('');
  };

  const handleCustomInterval = () => {
    const value = parseInt(customInterval);
    if (value > 0) {
      setTimeInterval(value);
    }
  };

  const chartData = processChartData();
  const average = calculateAverage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Stock Price Analysis</h1>
          <p className="text-gray-600">Real-time stock price tracking and analysis</p>
        </div>

        {/* Controls */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Stock Selection & Time Interval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock-select">Select Stock</Label>
                <select
                  id="stock-select"
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {stocksData && Object.entries(stocksData.stocks).map(([name, ticker]) => (
                    <option key={ticker} value={ticker}>
                      {name} ({ticker})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Time Interval (Minutes)</Label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 120, 240].map((minutes) => (
                    <Button
                      key={minutes}
                      variant={timeInterval === minutes ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleIntervalChange(minutes)}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {minutes}m
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom minutes"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(e.target.value)}
                    type="number"
                    className="flex-1"
                  />
                  <Button onClick={handleCustomInterval} variant="outline">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{getStockName()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">${average.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Price Chart - Last {timeInterval} Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 10', 'dataMax + 10']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <ReferenceLine 
                      y={average} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                      label={{ value: `Avg: $${average.toFixed(2)}`, position: "topRight" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StockAnalysis;
