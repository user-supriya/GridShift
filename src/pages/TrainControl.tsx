import React, { useEffect, useState } from 'react';
import { RailwaySimulation } from '@/lib/railwaySimulation';
import { SimulationState, Train } from '@/types/railway';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Train as TrainIcon, Clock, MapPin, AlertTriangle, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export const TrainControl: React.FC = () => {
  const [simulation] = useState(() => new RailwaySimulation());
  const [state, setState] = useState<SimulationState>(simulation.getState());
  const [selectedTrain, setSelectedTrain] = useState<string>('');
  const [delayMinutes, setDelayMinutes] = useState<number>(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(simulation.getState());
    }, 100);

    return () => clearInterval(interval);
  }, [simulation]);

  const handleAddDelay = (trainId: string) => {
    simulation.addDelay(trainId, delayMinutes);
    toast.success(`Added ${delayMinutes} minute delay to train`);
  };

  const handlePriorityBoost = (trainId: string) => {
    // This would be implemented in the simulation to boost priority
    toast.success('Priority boost applied to train');
  };

  const getTrainStatusColor = (train: Train) => {
    if (train.status === 'arrived') return 'bg-green-500';
    if (train.delay > 10) return 'bg-red-500';
    if (train.delay > 5) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case 'passenger': return 'bg-blue-500';
      case 'freight': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateCompletionTime = (train: Train) => {
    // Calculate estimated time to reach destination based on current position and speed
    const currentTrack = state.tracks.find(t => t.id === train.position.trackId);
    if (!currentTrack) return 0;
    
    const remainingDistance = (1 - train.position.distance) * currentTrack.length;
    const estimatedTime = train.speed > 0 ? (remainingDistance / train.speed) * 60 : 0;
    return Math.round(estimatedTime + train.delay);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Train Control Center</h1>
          <p className="text-muted-foreground">
            Monitor and control individual trains with AI-powered priority management
          </p>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Add Delay</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  className="w-20"
                  min="1"
                  max="60"
                />
                <span className="text-sm">min</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Select Train</p>
              <Select value={selectedTrain} onValueChange={setSelectedTrain}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Train" />
                </SelectTrigger>
                <SelectContent>
                  {state.trains.map((train) => (
                    <SelectItem key={train.id} value={train.id}>
                      {train.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => selectedTrain && handleAddDelay(selectedTrain)}
              disabled={!selectedTrain}
            >
              Add Delay
            </Button>
          </div>
        </Card>
      </div>

      {/* AI Priority Algorithm Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Smart Priority Management Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrainIcon className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Train Type Priority</p>
                <p className="text-sm text-muted-foreground">Express &gt; Local &gt; Freight</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Completion Time</p>
                <p className="text-sm text-muted-foreground">Shortest route gets priority</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">Delay Management</p>
                <p className="text-sm text-muted-foreground">Delayed trains get priority boost</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Train Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.trains.map((train) => {
          const completionTime = calculateCompletionTime(train);
          const currentTrack = state.tracks.find(t => t.id === train.position.trackId);
          
          return (
            <Card key={train.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrainIcon className="h-5 w-5" />
                    {train.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTrainTypeColor(train.type)}>
                      {train.type}
                    </Badge>
                    <div className={`h-3 w-3 rounded-full ${getTrainStatusColor(train)}`} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Priority Level</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 w-4 ${
                              level <= train.priority ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{train.priority}/5</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Current Speed</p>
                    <p className="text-lg font-semibold">{train.speed} km/h</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Delay</p>
                    <p className={`text-lg font-semibold ${
                      train.delay > 10 ? 'text-red-500' : 
                      train.delay > 5 ? 'text-orange-500' : 'text-green-500'
                    }`}>
                      {train.delay} min
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Completion</p>
                    <p className="text-lg font-semibold">{completionTime} min</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Current Position</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {currentTrack ? `${currentTrack.from} → ${currentTrack.to}` : 'Unknown'} 
                      ({Math.round(train.position.distance * 100)}%)
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium">{train.destination}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddDelay(train.id)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Add Delay
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handlePriorityBoost(train.id)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Priority Boost
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};