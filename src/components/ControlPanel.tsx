import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import { Train, Signal } from '@/types/railway';

interface ControlPanelProps {
  isRunning: boolean;
  speed: number;
  trains: Train[];
  signals: Signal[];
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onAddDelay: (trainId: string, minutes: number) => void;
  onOverrideSignal: (signalId: string, status: 'red' | 'yellow' | 'green') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  speed,
  trains,
  signals,
  onStart,
  onStop,
  onReset,
  onSpeedChange,
  onAddDelay,
  onOverrideSignal
}) => {
  const [selectedTrain, setSelectedTrain] = React.useState<string>('');
  const [delayMinutes, setDelayMinutes] = React.useState<number>(5);
  const [selectedSignal, setSelectedSignal] = React.useState<string>('');

  const handleAddDelay = () => {
    if (selectedTrain) {
      onAddDelay(selectedTrain, delayMinutes);
    }
  };

  const handleSignalOverride = (status: 'red' | 'yellow' | 'green') => {
    if (selectedSignal) {
      onOverrideSignal(selectedSignal, status);
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={isRunning ? onStop : onStart}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="speed">Speed:</Label>
            <Select value={speed.toString()} onValueChange={(value) => onSpeedChange(Number(value))}>
              <SelectTrigger id="speed" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? 'Running' : 'Paused'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Delay Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delay Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="train-select">Train:</Label>
              <Select value={selectedTrain} onValueChange={setSelectedTrain}>
                <SelectTrigger id="train-select">
                  <SelectValue placeholder="Select train" />
                </SelectTrigger>
                <SelectContent>
                  {trains.map(train => (
                    <SelectItem key={train.id} value={train.id}>
                      {train.name} ({train.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="delay-input">Delay (min):</Label>
              <Input
                id="delay-input"
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Number(e.target.value))}
                min="1"
                max="60"
              />
            </div>
          </div>
          <Button onClick={handleAddDelay} disabled={!selectedTrain} className="w-full">
            Add Delay
          </Button>
        </CardContent>
      </Card>

      {/* Signal Override */}
      <Card>
        <CardHeader>
          <CardTitle>Signal Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="signal-select">Signal:</Label>
            <Select value={selectedSignal} onValueChange={setSelectedSignal}>
              <SelectTrigger id="signal-select">
                <SelectValue placeholder="Select signal" />
              </SelectTrigger>
              <SelectContent>
                {signals.map(signal => (
                  <SelectItem key={signal.id} value={signal.id}>
                    {signal.id} ({signal.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleSignalOverride('red')} 
              disabled={!selectedSignal}
              variant="destructive"
              size="sm"
            >
              Red
            </Button>
            <Button 
              onClick={() => handleSignalOverride('yellow')} 
              disabled={!selectedSignal}
              className="bg-yellow-500 hover:bg-yellow-600"
              size="sm"
            >
              Yellow
            </Button>
            <Button 
              onClick={() => handleSignalOverride('green')} 
              disabled={!selectedSignal}
              className="bg-green-500 hover:bg-green-600"
              size="sm"
            >
              Green
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Train Status */}
      <Card>
        <CardHeader>
          <CardTitle>Train Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trains.map(train => (
              <div key={train.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Badge variant={train.type === 'passenger' ? 'default' : 'secondary'}>
                    {train.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(train.speed)}km/h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={train.status === 'running' ? 'default' : 'outline'}>
                    {train.status}
                  </Badge>
                  {train.delay > 0 && (
                    <Badge variant="destructive">
                      +{train.delay}min
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};