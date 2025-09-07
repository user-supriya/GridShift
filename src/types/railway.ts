export interface Station {
  id: string;
  name: string;
  position: { x: number; y: number };
  platforms: number;
}

export interface Track {
  id: string;
  from: string;
  to: string;
  length: number;
  maxSpeed: number;
  occupied: boolean;
  direction: 'bidirectional' | 'eastbound' | 'westbound';
}

export interface Signal {
  id: string;
  trackId: string;
  position: number;
  status: 'red' | 'yellow' | 'green';
  type: 'automatic' | 'manual';
}

export interface Train {
  id: string;
  name: string;
  type: 'passenger' | 'freight';
  priority: number;
  position: { trackId: string; distance: number };
  speed: number;
  maxSpeed: number;
  destination: string;
  schedule: TrainSchedule[];
  delay: number;
  status: 'running' | 'stopped' | 'waiting' | 'arrived';
}

export interface TrainSchedule {
  stationId: string;
  arrivalTime: number;
  departureTime: number;
  platform?: number;
}

export interface AIDecision {
  id: string;
  timestamp: number;
  type: 'signal_change' | 'route_priority' | 'delay_management';
  description: string;
  reasoning: string;
  impact: string;
  trainId?: string;
  signalId?: string;
}

export interface SimulationMetrics {
  totalTrains: number;
  averageDelay: number;
  throughput: number;
  conflicts: number;
  efficiency: number;
  aiDecisions: number;
}

export interface SimulationState {
  isRunning: boolean;
  speed: number;
  currentTime: number;
  trains: Train[];
  signals: Signal[];
  tracks: Track[];
  stations: Station[];
  aiDecisions: AIDecision[];
  metrics: SimulationMetrics;
}