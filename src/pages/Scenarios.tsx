import React, { useEffect, useState } from 'react';
import { RailwaySimulation } from '@/lib/railwaySimulation';
import { SimulationState } from '@/types/railway';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, AlertTriangle, CloudSnow, Wrench, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const Scenarios: React.FC = () => {
  const [simulation] = useState(() => new RailwaySimulation());
  const [state, setState] = useState<SimulationState>(simulation.getState());
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(simulation.getState());
    }, 100);

    return () => clearInterval(interval);
  }, [simulation]);

  const scenarios = [
    {
      id: 'rush-hour',
      title: 'Rush Hour Simulation',
      description: 'Simulate peak traffic with increased train frequency and potential delays',
      icon: Users,
      color: 'bg-blue-500',
      difficulty: 'Medium',
      duration: '15 min',
      impact: 'Tests AI priority management under high load'
    },
    {
      id: 'emergency',
      title: 'Emergency Response',
      description: 'Test AI response to emergency situations and priority routing',
      icon: AlertTriangle,
      color: 'bg-red-500',
      difficulty: 'High',
      duration: '10 min',
      impact: 'Validates emergency protocol effectiveness'
    },
    {
      id: 'weather',
      title: 'Weather Impact',
      description: 'Simulate adverse weather conditions affecting train operations',
      icon: CloudSnow,
      color: 'bg-orange-500',
      difficulty: 'Medium',
      duration: '20 min',
      impact: 'Tests resilience to external factors'
    },
    {
      id: 'equipment-failure',
      title: 'Equipment Failure',
      description: 'Test system resilience with signal or track equipment failures',
      icon: Wrench,
      color: 'bg-yellow-500',
      difficulty: 'High',
      duration: '12 min',
      impact: 'Evaluates failure recovery mechanisms'
    },
    {
      id: 'priority-conflict',
      title: 'Priority Conflict Resolution',
      description: 'Multiple high-priority trains competing for same platform',
      icon: Zap,
      color: 'bg-purple-500',
      difficulty: 'Expert',
      duration: '8 min',
      impact: 'Tests smart priority algorithm effectiveness'
    },
    {
      id: 'cascade-delay',
      title: 'Cascading Delay Management',
      description: 'Initial delay causing ripple effects across network',
      icon: Clock,
      color: 'bg-indigo-500',
      difficulty: 'High',
      duration: '18 min',
      impact: 'Validates delay propagation prevention'
    }
  ];

  const handleRunScenario = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    
    switch (scenarioId) {
      case 'rush-hour':
        // Add multiple delays to simulate rush hour
        state.trains.forEach((train, index) => {
          simulation.addDelay(train.id, Math.floor(Math.random() * 8) + 2);
        });
        toast.success('Rush hour scenario activated - increased train delays');
        break;
        
      case 'emergency':
        // Add emergency delay to highest priority train
        const emergencyTrain = state.trains.find(t => t.priority >= 3);
        if (emergencyTrain) {
          simulation.addDelay(emergencyTrain.id, 15);
          toast.error('Emergency scenario activated - priority train delayed');
        }
        break;
        
      case 'weather':
        // Add moderate delays to all trains
        state.trains.forEach(train => {
          simulation.addDelay(train.id, Math.floor(Math.random() * 5) + 3);
        });
        toast.warning('Weather impact scenario - all trains affected');
        break;
        
      case 'equipment-failure':
        // Override random signal to red
        const randomSignal = state.signals[Math.floor(Math.random() * state.signals.length)];
        simulation.overrideSignal(randomSignal.id, 'red');
        toast.error('Equipment failure scenario - signal malfunction detected');
        break;
        
      case 'priority-conflict':
        // Create conflicts between high-priority trains
        const highPriorityTrains = state.trains.filter(t => t.priority >= 3);
        highPriorityTrains.forEach(train => {
          simulation.addDelay(train.id, Math.floor(Math.random() * 10) + 5);
        });
        toast.warning('Priority conflict scenario - multiple express trains delayed');
        break;
        
      case 'cascade-delay':
        // Add major delay to one train to trigger cascading effects
        const firstTrain = state.trains[0];
        simulation.addDelay(firstTrain.id, 20);
        toast.error('Cascading delay scenario - major initial delay introduced');
        break;
    }
    
    // Clear active scenario after duration
    setTimeout(() => {
      setActiveScenario(null);
      toast.info('Scenario completed');
    }, 30000); // 30 seconds for demo purposes
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-orange-500';
      case 'Expert': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scenario Testing</h1>
          <p className="text-muted-foreground">
            Test AI performance under various challenging conditions
          </p>
        </div>
        
        {activeScenario && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Scenario Active</span>
              <Badge variant="outline">
                {scenarios.find(s => s.id === activeScenario)?.title}
              </Badge>
            </div>
          </Card>
        )}
      </div>

      {/* Current System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Delays</p>
              <p className="text-2xl font-bold text-orange-500">
                {state.trains.reduce((sum, t) => sum + t.delay, 0)} min
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Trains</p>
              <p className="text-2xl font-bold text-blue-500">
                {state.trains.filter(t => t.status === 'running').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conflicts</p>
              <p className="text-2xl font-bold text-red-500">{state.metrics.conflicts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Decisions</p>
              <p className="text-2xl font-bold text-purple-500">{state.aiDecisions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = activeScenario === scenario.id;
          
          return (
            <Card key={scenario.id} className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 ${scenario.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge className={getDifficultyColor(scenario.difficulty)}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{scenario.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{scenario.duration}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <p className="font-medium text-xs">{scenario.impact}</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleRunScenario(scenario.id)}
                  disabled={isActive}
                  variant={isActive ? "secondary" : "default"}
                >
                  {isActive ? 'Running...' : 'Run Scenario'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scenario Results */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">AI Decision Effectiveness</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${state.metrics.efficiency}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{state.metrics.efficiency}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Throughput Optimization</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (state.metrics.throughput / 40) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{state.metrics.throughput}/40</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              The AI system has made {state.aiDecisions.length} decisions, 
              maintaining {state.metrics.efficiency}% efficiency with {state.metrics.conflicts} conflicts detected.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};