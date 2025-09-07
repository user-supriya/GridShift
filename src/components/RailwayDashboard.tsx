import React, { useEffect, useState } from 'react';
import { RailwaySimulation } from '@/lib/railwaySimulation';
import { SimulationState } from '@/types/railway';
import { TrackDiagram } from './TrackDiagram';
import { ControlPanel } from './ControlPanel';
import { MetricsDashboard } from './MetricsDashboard';
import { AIDecisionLog } from './AIDecisionLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Train, Zap, BarChart3, Brain } from 'lucide-react';

export const RailwayDashboard: React.FC = () => {
  const [simulation] = useState(() => new RailwaySimulation());
  const [state, setState] = useState<SimulationState>(simulation.getState());

  useEffect(() => {
    const interval = setInterval(() => {
      setState(simulation.getState());
    }, 100); // Update UI every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [simulation]);

  const handleStart = () => {
    simulation.start();
  };

  const handleStop = () => {
    simulation.stop();
  };

  const handleReset = () => {
    simulation.stop();
    // Reset would require reinitializing the simulation
    setState(simulation.getState());
  };

  const handleSpeedChange = (speed: number) => {
    simulation.setSpeed(speed);
  };

  const handleAddDelay = (trainId: string, minutes: number) => {
    simulation.addDelay(trainId, minutes);
  };

  const handleOverrideSignal = (signalId: string, status: 'red' | 'yellow' | 'green') => {
    simulation.overrideSignal(signalId, status);
  };

  const handleSignalClick = (signalId: string) => {
    const signal = state.signals.find(s => s.id === signalId);
    if (signal) {
      const nextStatus = signal.status === 'red' ? 'green' : signal.status === 'green' ? 'yellow' : 'red';
      handleOverrideSignal(signalId, nextStatus);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Railway Traffic Control System
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Railway Traffic Management & Simulation Dashboard
          </p>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Track Diagram - Main visualization */}
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

        {/* Metrics and AI Dashboard */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="ai-decisions" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Decision Log
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-6">
            <MetricsDashboard 
              metrics={state.metrics}
              currentTime={state.currentTime}
            />
          </TabsContent>

          <TabsContent value="ai-decisions" className="mt-6">
            <AIDecisionLog 
              decisions={state.aiDecisions}
              currentTime={state.currentTime}
            />
          </TabsContent>

          <TabsContent value="scenarios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Rush Hour Simulation</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Simulate peak traffic with increased train frequency and potential delays
                    </p>
                    <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      Start Rush Hour
                    </button>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Emergency Response</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Test AI response to emergency situations and priority routing
                    </p>
                    <button className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
                      Trigger Emergency
                    </button>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Weather Impact</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Simulate adverse weather conditions affecting train operations
                    </p>
                    <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                      Add Weather Delay
                    </button>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Equipment Failure</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Test system resilience with signal or track equipment failures
                    </p>
                    <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                      Simulate Failure
                    </button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Railway Traffic Control System featuring AI-powered decision making, real-time simulation, and interactive control
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span>🚂 4 Active Trains</span>
                <span>🛤️ 4 Track Segments</span>
                <span>🚥 5 Smart Signals</span>
                <span>🧠 AI Traffic Controller</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};