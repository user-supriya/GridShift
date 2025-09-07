import React, { useEffect, useState } from 'react';
import { RailwaySimulation } from '@/lib/railwaySimulation';
import { SimulationState } from '@/types/railway';
import { AIDecisionLog } from '@/components/AIDecisionLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Brain, Cpu, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const AIControl: React.FC = () => {
  const [simulation] = useState(() => new RailwaySimulation());
  const [state, setState] = useState<SimulationState>(simulation.getState());
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aggressiveMode, setAggressiveMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(simulation.getState());
    }, 100);

    return () => clearInterval(interval);
  }, [simulation]);

  const recentDecisions = state.aiDecisions.slice(-10);
  const successfulDecisions = state.aiDecisions.filter(d => d.type === 'route_priority' || d.type === 'delay_management').length;
  const conflictsPrevented = Math.floor(state.aiDecisions.length * 0.7);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Traffic Controller</h1>
          <p className="text-muted-foreground">
            Advanced AI system for optimal train scheduling and conflict resolution
          </p>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
              <span className="text-sm font-medium">AI Control</span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={aggressiveMode} onCheckedChange={setAggressiveMode} />
              <span className="text-sm font-medium">Aggressive Mode</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Decisions</p>
                <p className="text-2xl font-bold">{state.aiDecisions.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {state.aiDecisions.length > 0 ? Math.round((successfulDecisions / state.aiDecisions.length) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conflicts Prevented</p>
                <p className="text-2xl font-bold">{conflictsPrevented}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency Gain</p>
                <p className="text-2xl font-bold">+{Math.max(0, state.metrics.efficiency - 75)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Priority Algorithm Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Smart Priority Management Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Priority Detection
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Monitors delayed trains approaching platforms</li>
                  <li>• Detects scheduling conflicts in real-time</li>
                  <li>• Identifies platform occupation conflicts</li>
                  <li>• Tracks train type hierarchy (Express &gt; Local &gt; Freight)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  Decision Logic
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Calculates completion time to destination</li>
                  <li>• Weighs train priority vs. delay impact</li>
                  <li>• Optimizes for maximum throughput</li>
                  <li>• Prevents cascading delays</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Optimization Goals
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Minimize total system delay</li>
                  <li>• Maximize train throughput</li>
                  <li>• Prioritize passenger services</li>
                  <li>• Maintain schedule reliability</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Algorithm Flow</h4>
              <div className="flex items-center gap-2 text-sm overflow-x-auto">
                <Badge variant="outline">Detect Conflict</Badge>
                <span>→</span>
                <Badge variant="outline">Analyze Train Types</Badge>
                <span>→</span>
                <Badge variant="outline">Calculate Completion Time</Badge>
                <span>→</span>
                <Badge variant="outline">Apply Priority Rules</Badge>
                <span>→</span>
                <Badge variant="outline">Execute Decision</Badge>
                <span>→</span>
                <Badge variant="outline">Monitor Impact</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Decision Log */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time AI Decision Log</CardTitle>
        </CardHeader>
        <CardContent>
          <AIDecisionLog 
            decisions={state.aiDecisions}
            currentTime={state.currentTime}
          />
        </CardContent>
      </Card>

      {/* AI Control Actions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Control Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center">
              <Brain className="h-6 w-6 mb-2" />
              <span>Force Priority Recalculation</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Cpu className="h-6 w-6 mb-2" />
              <span>Optimize All Routes</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Zap className="h-6 w-6 mb-2" />
              <span>Emergency Protocol</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};