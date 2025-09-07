import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, AlertCircle, Zap, Activity, CheckCircle } from 'lucide-react';
import { SimulationMetrics } from '@/types/railway';

interface MetricsDashboardProps {
  metrics: SimulationMetrics;
  currentTime: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  currentTime
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-500';
    if (efficiency >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Current Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Simulation Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
          <p className="text-xs text-muted-foreground">
            Running for {Math.floor(currentTime / 60)} hours
          </p>
        </CardContent>
      </Card>

      {/* Total Trains */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Trains</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTrains}</div>
          <p className="text-xs text-muted-foreground">
            trains in operation
          </p>
        </CardContent>
      </Card>

      {/* Average Delay */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Delay</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.averageDelay.toFixed(1)}
            <span className="text-sm font-normal ml-1">min</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Badge variant={metrics.averageDelay < 5 ? "default" : "destructive"}>
              {metrics.averageDelay < 5 ? 'On Time' : 'Delayed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Throughput */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Throughput</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.throughput}</div>
          <p className="text-xs text-muted-foreground">
            trains/hour
          </p>
        </CardContent>
      </Card>

      {/* Conflicts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.conflicts}</div>
          <div className="flex items-center space-x-2 text-xs">
            <Badge variant={metrics.conflicts === 0 ? "default" : "destructive"}>
              {metrics.conflicts === 0 ? 'Clear' : 'Active'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* System Efficiency */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getEfficiencyColor(metrics.efficiency)}`}>
            {metrics.efficiency.toFixed(0)}%
          </div>
          <Progress value={metrics.efficiency} className="mt-2" />
        </CardContent>
      </Card>

      {/* AI Decisions */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Performance</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{metrics.aiDecisions}</div>
              <p className="text-xs text-muted-foreground">Total AI Decisions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {currentTime > 0 ? (metrics.aiDecisions / (currentTime / 60)).toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">Decisions/Hour</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {metrics.aiDecisions > 0 ? ((metrics.throughput / metrics.aiDecisions) * 100).toFixed(0) : '0'}%
              </div>
              <p className="text-xs text-muted-foreground">AI Impact Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};