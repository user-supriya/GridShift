import React, { useEffect, useState } from 'react';
import { RailwaySimulation } from '@/lib/railwaySimulation';
import { SimulationState } from '@/types/railway';
import { TrackDiagram } from '@/components/TrackDiagram';
import { ControlPanel } from '@/components/ControlPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Train, Activity, Clock, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [simulation] = useState(() => new RailwaySimulation());
  const [state, setState] = useState<SimulationState>(simulation.getState());

  useEffect(() => {
    const interval = setInterval(() => {
      setState(simulation.getState());
    }, 100);

    return () => clearInterval(interval);
  }, [simulation]);

  const handleStart = () => simulation.start();
  const handleStop = () => simulation.stop();
  const handleReset = () => {
    simulation.stop();
    setState(simulation.getState());
  };
  const handleSpeedChange = (speed: number) => simulation.setSpeed(speed);
  const handleAddDelay = (trainId: string, minutes: number) => simulation.addDelay(trainId, minutes);
  const handleOverrideSignal = (signalId: string, status: 'red' | 'yellow' | 'green') => simulation.overrideSignal(signalId, status);

  const handleSignalClick = (signalId: string) => {
    const signal = state.signals.find(s => s.id === signalId);
    if (signal) {
      const nextStatus = signal.status === 'red' ? 'green' : signal.status === 'green' ? 'yellow' : 'red';
      handleOverrideSignal(signalId, nextStatus);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Trains</p>
                <p className="text-2xl font-bold">{state.trains.filter(t => t.status === 'running').length}</p>
              </div>
              <Train className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Delay</p>
                <p className="text-2xl font-bold">{state.metrics.averageDelay.toFixed(1)}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{state.metrics.throughput}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{state.metrics.efficiency}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Track Diagram */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="h-5 w-5" />
                Railway Network Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrackDiagram
                trains={state.trains}
                signals={state.signals}
                tracks={state.tracks}
                stations={state.stations}
                onSignalClick={handleSignalClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-1">
          <ControlPanel
            isRunning={state.isRunning}
            speed={state.speed}
            trains={state.trains}
            signals={state.signals}
            onStart={handleStart}
            onStop={handleStop}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            onAddDelay={handleAddDelay}
            onOverrideSignal={handleOverrideSignal}
          />
        </div>
      </div>
    </div>
  );
};