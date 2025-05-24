
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, BarChart3 } from 'lucide-react';

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

interface CorrelationData {
  stock1: string;
  stock2: string;
  correlation: number;
}

interface StockStats {
  ticker: string;
  average: number;
  standardDeviation: number;
}

const CorrelationHeatmap = () => {
  const [timeInterval, setTimeInterval] = useState<number>(60);
  const [customInterval, setCustomInterval] = useState<string>('');
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([]);
  const [stockStats, setStockStats] = useState<StockStats[]>([]);
  const [stockTickers, setStockTickers] = useState<string[]>([]);

  // Fetch available stocks
  const { data: stocksData } = useQuery<StockResponse>({
    queryKey: ['stocks'],
    queryFn: async () => {
      const response = await fetch('http://20.244.56.144/evaluation-service/stocks');
      return response.json();
    },
  });

  // Calculate correlation between two price arrays
  const calculateCorrelation = (prices1: number[], prices2: number[]): number => {
    const n = Math.min(prices1.length, prices2.length);
    if (n < 2) return 0;

    const mean1 = prices1.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const mean2 = prices2.slice(0, n).reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = prices1[i] - mean1;
      const diff2 = prices2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const calculateStandardDeviation = (prices: number[]): number => {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + (b - mean) ** 2, 0) / (prices.length - 1);
    return Math.sqrt(variance);
  };

  // Fetch all stock data when stocks or interval changes
  useEffect(() => {
    if (!stocksData) return;

    const fetchAllStockData = async () => {
      const tickers = Object.values(stocksData.stocks).slice(0, 10); // Limit to first 10 for performance
      setStockTickers(tickers);

      const stockDataPromises = tickers.map(ticker =>
        fetch(`http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${timeInterval}`)
          .then(res => res.json())
          .catch(() => [])
      );

      const allStockData = await Promise.all(stockDataPromises);
      
      // Calculate statistics for each stock
      const stats: StockStats[] = tickers.map((ticker, index) => {
        const data = allStockData[index] as StockData[];
        const prices = data?.map(d => d.price) || [];
        const average = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const standardDeviation = prices.length > 1 ? calculateStandardDeviation(prices) : 0;
        
        return {
          ticker,
          average,
          standardDeviation
        };
      });

      setStockStats(stats);

      // Calculate correlation matrix
      const matrix: number[][] = [];
      for (let i = 0; i < tickers.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < tickers.length; j++) {
          if (i === j) {
            matrix[i][j] = 1;
          } else {
            const prices1 = (allStockData[i] as StockData[])?.map(d => d.price) || [];
            const prices2 = (allStockData[j] as StockData[])?.map(d => d.price) || [];
            matrix[i][j] = calculateCorrelation(prices1, prices2);
          }
        }
      }
      setCorrelationMatrix(matrix);
    };

    fetchAllStockData();
  }, [stocksData, timeInterval]);

  const getCorrelationColor = (correlation: number): string => {
    const abs = Math.abs(correlation);
    if (correlation > 0) {
      // Positive correlation - blue to dark blue
      const intensity = Math.min(abs * 255, 255);
      return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
    } else {
      // Negative correlation - red to dark red
      const intensity = Math.min(abs * 255, 255);
      return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
    }
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

  const getStockName = (ticker: string) => {
    if (!stocksData) return ticker;
    const stockEntry = Object.entries(stocksData.stocks).find(([, t]) => t === ticker);
    return stockEntry ? stockEntry[0].split(',')[0] : ticker;
  };

  const hoveredStats = hoveredStock ? stockStats.find(s => s.ticker === hoveredStock) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Stock Correlation Heatmap</h1>
          <p className="text-gray-600">Visualize correlations between different stocks</p>
        </div>

        {/* Controls */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Time Interval Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                <div className="flex gap-2 max-w-xs">
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

        {/* Statistics Display */}
        {hoveredStats && (
          <Card className="shadow-lg border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {getStockName(hoveredStats.ticker)} ({hoveredStats.ticker}) Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Average Price</p>
                  <p className="text-2xl font-bold text-blue-900">${hoveredStats.average.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Standard Deviation</p>
                  <p className="text-2xl font-bold text-green-900">${hoveredStats.standardDeviation.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Heatmap */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Correlation Heatmap - Last {timeInterval} Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Color Legend */}
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Strong Negative (-1)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border rounded"></div>
                  <span className="text-sm">No Correlation (0)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Strong Positive (+1)</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${stockTickers.length}, 60px)` }}>
                    {/* Header row */}
                    <div></div>
                    {stockTickers.map((ticker) => (
                      <div
                        key={ticker}
                        className="text-xs font-medium text-center p-2 bg-gray-100 rounded transform -rotate-45 origin-center"
                        style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {ticker}
                      </div>
                    ))}

                    {/* Data rows */}
                    {stockTickers.map((rowTicker, i) => (
                      <React.Fragment key={rowTicker}>
                        <div
                          className="text-xs font-medium p-2 bg-gray-100 rounded flex items-center cursor-pointer hover:bg-gray-200"
                          onMouseEnter={() => setHoveredStock(rowTicker)}
                          onMouseLeave={() => setHoveredStock(null)}
                        >
                          {rowTicker}
                        </div>
                        {stockTickers.map((colTicker, j) => (
                          <div
                            key={`${rowTicker}-${colTicker}`}
                            className="w-15 h-15 flex items-center justify-center text-xs font-medium rounded cursor-pointer hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: getCorrelationColor(correlationMatrix[i]?.[j] || 0),
                              color: Math.abs(correlationMatrix[i]?.[j] || 0) > 0.5 ? 'white' : 'black'
                            }}
                            title={`${rowTicker} vs ${colTicker}: ${(correlationMatrix[i]?.[j] || 0).toFixed(3)}`}
                            onMouseEnter={() => setHoveredStock(rowTicker)}
                          >
                            {(correlationMatrix[i]?.[j] || 0).toFixed(2)}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CorrelationHeatmap;
