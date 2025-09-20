import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Save, Database } from 'lucide-react';
import { Train, Signal } from '@/types/railway';
import { sendToPocketBase } from '@/lib/api';

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
  const [saveStatus, setSaveStatus] = React.useState<string>('');

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
  
  // Function to save data to PocketBase
  const saveToPocketBase = async () => {
    try {
      setSaveStatus('Saving...');
      console.log('Starting to save data to PocketBase');
      console.log('Trains to save:', trains);
      
      // Save trains data
      for (const train of trains) {
        console.log(`Processing train ${train.id}`);
        
        // Format train data according to PocketBase schema
        const trainData = {
          number: train.id,
          name: train.name,
          type: train.type,
          priority: train.priority,
          status: train.status,
          schedule: train.schedule.map(s => ({
            station: s.stationId,
            time: new Date(s.arrivalTime).toISOString().substr(11, 5) // Format as HH:MM
          }))
        };
        
        console.log('Formatted train data:', trainData);
        await sendToPocketBase('trains', trainData);
        console.log(`Train ${train.id} saved successfully`);
      }
      
      // Save delay data
      console.log('Processing delays');
      let delayCount = 0;
      
      for (const train of trains) {
        if (train.delay > 0) {
          console.log(`Processing delay for train ${train.id}: ${train.delay} minutes`);
          
          const delayData = {
            train_number: train.id,
            delay_minutes: train.delay,
            timestamp: new Date().toISOString()
          };
          
          console.log('Delay data:', delayData);
          await sendToPocketBase('delays', delayData);
          console.log(`Delay for train ${train.id} saved successfully`);
          delayCount++;
        }
      }
      
      console.log(`Saved ${trains.length} trains and ${delayCount} delays`);
      setSaveStatus(`Data saved to PocketBase! (${trains.length} trains, ${delayCount} delays)`);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving to PocketBase:', error);
      setSaveStatus(`Error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
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
      
      {/* Save to PocketBase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={saveToPocketBase}
              variant="default" 
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Data to PocketBase
            </Button>
            {saveStatus && (
              <Badge variant={saveStatus.includes('Error') ? "destructive" : "default"}>
                {saveStatus}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Train Status */}
     
    </div>
  );
};