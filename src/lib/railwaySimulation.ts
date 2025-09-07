import { Train, Signal, Track, Station, AIDecision, SimulationState, SimulationMetrics } from '@/types/railway';

export class RailwaySimulation {
  private state: SimulationState;
  private intervalId: number | null = null;
  private aiController: AITrafficController;

  constructor() {
    this.state = this.initializeSimulation();
    this.aiController = new AITrafficController();
  }

  private initializeSimulation(): SimulationState {
    const stations: Station[] = [
      { id: 'st1', name: 'Central Station', position: { x: 100, y: 200 }, platforms: 3 },
      { id: 'st2', name: 'North Junction', position: { x: 400, y: 150 }, platforms: 2 },
      { id: 'st3', name: 'East Terminal', position: { x: 700, y: 200 }, platforms: 2 },
      { id: 'st4', name: 'South Depot', position: { x: 400, y: 300 }, platforms: 1 }
    ];

    const tracks: Track[] = [
      { id: 'tr1', from: 'st1', to: 'st2', length: 15, maxSpeed: 80, occupied: false, direction: 'bidirectional' },
      { id: 'tr2', from: 'st2', to: 'st3', length: 12, maxSpeed: 100, occupied: false, direction: 'bidirectional' },
      { id: 'tr3', from: 'st2', to: 'st4', length: 8, maxSpeed: 60, occupied: false, direction: 'bidirectional' },
      { id: 'tr4', from: 'st1', to: 'st4', length: 18, maxSpeed: 70, occupied: false, direction: 'bidirectional' }
    ];

    const signals: Signal[] = [
      { id: 'sg1', trackId: 'tr1', position: 0.2, status: 'green', type: 'automatic' },
      { id: 'sg2', trackId: 'tr1', position: 0.8, status: 'green', type: 'automatic' },
      { id: 'sg3', trackId: 'tr2', position: 0.3, status: 'green', type: 'automatic' },
      { id: 'sg4', trackId: 'tr3', position: 0.5, status: 'green', type: 'automatic' },
      { id: 'sg5', trackId: 'tr4', position: 0.4, status: 'green', type: 'automatic' }
    ];

    const trains: Train[] = [
      {
        id: 'tr001', name: 'Express 101', type: 'passenger', priority: 3,
        position: { trackId: 'tr1', distance: 0.1 }, speed: 0, maxSpeed: 120,
        destination: 'st3', delay: 0, status: 'running',
        schedule: [
          { stationId: 'st1', arrivalTime: 0, departureTime: 0 },
          { stationId: 'st2', arrivalTime: 12, departureTime: 15 },
          { stationId: 'st3', arrivalTime: 27, departureTime: 30 }
        ]
      },
      {
        id: 'tr002', name: 'Freight 205', type: 'freight', priority: 1,
        position: { trackId: 'tr4', distance: 0.9 }, speed: 0, maxSpeed: 60,
        destination: 'st1', delay: 5, status: 'running',
        schedule: [
          { stationId: 'st4', arrivalTime: 0, departureTime: 0 },
          { stationId: 'st1', arrivalTime: 25, departureTime: 28 }
        ]
      },
      {
        id: 'tr003', name: 'Local 303', type: 'passenger', priority: 2,
        position: { trackId: 'tr3', distance: 0.3 }, speed: 0, maxSpeed: 90,
        destination: 'st4', delay: 0, status: 'running',
        schedule: [
          { stationId: 'st2', arrivalTime: 0, departureTime: 0 },
          { stationId: 'st4', arrivalTime: 8, departureTime: 10 }
        ]
      },
      {
        id: 'tr004', name: 'Express 404', type: 'passenger', priority: 3,
        position: { trackId: 'tr2', distance: 0.7 }, speed: 0, maxSpeed: 110,
        destination: 'st2', delay: 2, status: 'running',
        schedule: [
          { stationId: 'st3', arrivalTime: 0, departureTime: 0 },
          { stationId: 'st2', arrivalTime: 10, departureTime: 12 }
        ]
      }
    ];

    return {
      isRunning: false,
      speed: 1,
      currentTime: 0,
      trains,
      signals,
      tracks,
      stations,
      aiDecisions: [],
      metrics: {
        totalTrains: trains.length,
        averageDelay: 0,
        throughput: 0,
        conflicts: 0,
        efficiency: 85,
        aiDecisions: 0
      }
    };
  }

  start() {
    if (this.intervalId) return;
    
    this.state.isRunning = true;
    this.intervalId = window.setInterval(() => {
      this.update();
    }, 1000 / this.state.speed);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.isRunning = false;
  }

  setSpeed(speed: number) {
    const wasRunning = this.state.isRunning;
    if (wasRunning) this.stop();
    this.state.speed = speed;
    if (wasRunning) this.start();
  }

  private update() {
    this.state.currentTime += 1;
    
    // Update train positions
    this.state.trains.forEach(train => {
      if (train.status === 'running') {
        this.updateTrainPosition(train);
      }
    });

    // AI makes decisions
    const aiDecisions = this.aiController.makeDecisions(this.state);
    this.state.aiDecisions.push(...aiDecisions);
    
    // Apply AI decisions
    this.applyAIDecisions(aiDecisions);
    
    // Update metrics
    this.updateMetrics();
  }

  private updateTrainPosition(train: Train) {
    const track = this.state.tracks.find(t => t.id === train.position.trackId);
    if (!track) return;

    const signal = this.getSignalAhead(train);
    
    // Adjust speed based on signal
    if (signal && signal.status === 'red') {
      train.speed = Math.max(0, train.speed - 10);
    } else if (signal && signal.status === 'yellow') {
      train.speed = Math.min(train.maxSpeed * 0.5, train.speed + 5);
    } else {
      train.speed = Math.min(train.maxSpeed, train.speed + 8);
    }

    // Update position
    const speedKmh = train.speed;
    const distanceIncrement = (speedKmh / 3600) * (track.length / 1000); // Simple approximation
    train.position.distance += distanceIncrement * 0.1;

    // Handle track completion
    if (train.position.distance >= 1.0) {
      this.handleTrainArrival(train, track);
    }
  }

  private getSignalAhead(train: Train): Signal | null {
    return this.state.signals.find(s => 
      s.trackId === train.position.trackId && 
      s.position > train.position.distance
    ) || null;
  }

  private handleTrainArrival(train: Train, track: Track) {
    // Move train to next track or mark as arrived
    const nextTrack = this.findNextTrack(train, track);
    if (nextTrack) {
      train.position = { trackId: nextTrack.id, distance: 0 };
      track.occupied = false;
      nextTrack.occupied = true;
    } else {
      train.status = 'arrived';
      track.occupied = false;
    }
  }

  private findNextTrack(train: Train, currentTrack: Track): Track | null {
    // Simple routing logic - find track that connects to destination
    return this.state.tracks.find(t => 
      t.from === currentTrack.to && 
      !t.occupied &&
      this.isTrackTowardsDestination(t, train.destination)
    ) || null;
  }

  private isTrackTowardsDestination(track: Track, destination: string): boolean {
    return track.to === destination || 
           this.state.tracks.some(t => t.from === track.to && t.to === destination);
  }

  private applyAIDecisions(decisions: AIDecision[]) {
    decisions.forEach(decision => {
      switch (decision.type) {
        case 'signal_change':
          if (decision.signalId) {
            const signal = this.state.signals.find(s => s.id === decision.signalId);
            if (signal) {
              // AI decision logic for signal changes
              signal.status = signal.status === 'red' ? 'green' : 'red';
            }
          }
          break;
        case 'route_priority':
          // Handle route prioritization
          break;
        case 'delay_management':
          // Handle delay management
          break;
      }
    });
  }

  private updateMetrics() {
    const runningTrains = this.state.trains.filter(t => t.status === 'running');
    const totalDelay = this.state.trains.reduce((sum, t) => sum + t.delay, 0);
    
    this.state.metrics = {
      totalTrains: this.state.trains.length,
      averageDelay: totalDelay / this.state.trains.length,
      throughput: (this.state.trains.length - runningTrains.length) * 10, // Simplified
      conflicts: this.detectConflicts(),
      efficiency: Math.max(50, 100 - (totalDelay * 2)),
      aiDecisions: this.state.aiDecisions.length
    };
  }

  private detectConflicts(): number {
    let conflicts = 0;
    const occupiedTracks = this.state.tracks.filter(t => t.occupied);
    
    // Simple conflict detection
    this.state.trains.forEach(train1 => {
      this.state.trains.forEach(train2 => {
        if (train1.id !== train2.id && 
            train1.position.trackId === train2.position.trackId &&
            Math.abs(train1.position.distance - train2.position.distance) < 0.1) {
          conflicts++;
        }
      });
    });
    
    return conflicts / 2; // Avoid double counting
  }

  addDelay(trainId: string, minutes: number) {
    const train = this.state.trains.find(t => t.id === trainId);
    if (train) {
      train.delay += minutes;
    }
  }

  overrideSignal(signalId: string, status: 'red' | 'yellow' | 'green') {
    const signal = this.state.signals.find(s => s.id === signalId);
    if (signal) {
      signal.status = status;
      signal.type = 'manual';
      
      this.state.aiDecisions.push({
        id: `manual_${Date.now()}`,
        timestamp: this.state.currentTime,
        type: 'signal_change',
        description: `Manual override: Signal ${signalId} set to ${status}`,
        reasoning: 'Manual intervention by operator',
        impact: 'Direct signal control',
        signalId
      });
    }
  }

  getState(): SimulationState {
    return { ...this.state };
  }
}

class AITrafficController {
  private decisionHistory: AIDecision[] = [];
  
  makeDecisions(state: SimulationState): AIDecision[] {
    const decisions: AIDecision[] = [];
    
    // Smart Priority Management Algorithm
    const conflictingTrains = this.detectPlatformConflicts(state);
    
    if (conflictingTrains.length > 0) {
      const prioritizedTrain = this.applySmartPriorityAlgorithm(conflictingTrains, state);
      
      if (prioritizedTrain) {
        decisions.push({
          id: `ai_priority_${Date.now()}`,
          timestamp: state.currentTime,
          type: 'route_priority',
          description: `Prioritized ${prioritizedTrain.name} using smart algorithm`,
          reasoning: `Train type: ${prioritizedTrain.type}, delay: ${prioritizedTrain.delay}min, completion time: ${this.calculateCompletionTime(prioritizedTrain, state)}min`,
          impact: `Maximized throughput by prioritizing faster completion`,
          trainId: prioritizedTrain.id
        });
      }
    }
    
    // Signal optimization based on priority
    state.trains.forEach(train => {
      const signal = this.getNextSignal(train, state);
      if (signal && this.shouldChangeSignal(train, signal, state)) {
        decisions.push({
          id: `ai_signal_${Date.now()}_${Math.random()}`,
          timestamp: state.currentTime,
          type: 'signal_change',
          description: `Optimized signal ${signal.id} for ${train.name}`,
          reasoning: `Priority: ${train.priority}, delay: ${train.delay}min, type: ${train.type}`,
          impact: `Improved flow for ${train.type} service`,
          trainId: train.id,
          signalId: signal.id
        });
      }
    });

    // Enhanced delay management with cascade prevention
    const criticallyDelayedTrains = state.trains.filter(t => t.delay > 10);
    if (criticallyDelayedTrains.length > 0 && Math.random() < 0.2) {
      const train = this.selectTrainForDelayRecovery(criticallyDelayedTrains, state);
      decisions.push({
        id: `ai_delay_recovery_${Date.now()}`,
        timestamp: state.currentTime,
        type: 'delay_management',
        description: `Emergency recovery for ${train.name}`,
        reasoning: `Delay: ${train.delay}min exceeds threshold, preventing cascade effects`,
        impact: `Estimated recovery: 3-5 min, prevents ${this.estimateCascadeImpact(train, state)} additional delays`,
        trainId: train.id
      });
    }

    return decisions;
  }

  private detectPlatformConflicts(state: SimulationState): Train[] {
    const conflictingTrains: Train[] = [];
    
    // Check for trains approaching same destination with delays
    state.stations.forEach(station => {
      const approachingTrains = state.trains.filter(train => 
        train.destination === station.id && 
        train.status === 'running' &&
        train.delay > 0
      );
      
      if (approachingTrains.length > 1) {
        conflictingTrains.push(...approachingTrains);
      }
    });
    
    return conflictingTrains;
  }

  private applySmartPriorityAlgorithm(conflictingTrains: Train[], state: SimulationState): Train | null {
    if (conflictingTrains.length === 0) return null;
    
    // Apply the user's algorithm: prioritize by train type and completion time
    const scoredTrains = conflictingTrains.map(train => {
      let score = 0;
      
      // 1. Train type priority (Express > Local > Freight)
      if (train.type === 'passenger' && train.priority >= 3) score += 100; // Express
      else if (train.type === 'passenger' && train.priority === 2) score += 70; // Local
      else if (train.type === 'freight') score += 30; // Freight
      
      // 2. Completion time factor (shorter completion time gets higher score)
      const completionTime = this.calculateCompletionTime(train, state);
      score += Math.max(0, 50 - completionTime); // Inverse relationship
      
      // 3. Delay factor (more delayed trains get slight boost)
      if (train.delay > 15) score += 20;
      else if (train.delay > 10) score += 10;
      else if (train.delay > 5) score += 5;
      
      return { train, score };
    });
    
    // Return the train with highest score
    scoredTrains.sort((a, b) => b.score - a.score);
    return scoredTrains[0]?.train || null;
  }

  private calculateCompletionTime(train: Train, state: SimulationState): number {
    const currentTrack = state.tracks.find(t => t.id === train.position.trackId);
    if (!currentTrack) return 99;
    
    // Simple completion time calculation
    const remainingDistance = (1 - train.position.distance) * currentTrack.length;
    const estimatedTime = train.speed > 0 ? (remainingDistance / train.speed) * 60 : 30;
    return Math.round(estimatedTime + (train.delay * 0.5));
  }

  private selectTrainForDelayRecovery(delayedTrains: Train[], state: SimulationState): Train {
    // Prioritize passenger trains with highest delay
    return delayedTrains.reduce((selected, current) => {
      if (current.type === 'passenger' && current.delay > selected.delay) {
        return current;
      }
      return selected;
    });
  }

  private estimateCascadeImpact(train: Train, state: SimulationState): number {
    // Estimate how many other trains could be affected by this delay
    const sameRouteTrains = state.trains.filter(t => 
      t.destination === train.destination && t.id !== train.id
    );
    return Math.min(sameRouteTrains.length, 3);
  }

  private getNextSignal(train: Train, state: SimulationState): Signal | null {
    return state.signals.find(s => 
      s.trackId === train.position.trackId && 
      s.position > train.position.distance
    ) || null;
  }

  private shouldChangeSignal(train: Train, signal: Signal, state: SimulationState): boolean {
    // Simple heuristic: prioritize high-priority trains
    if (train.priority >= 3 && signal.status === 'red') {
      return Math.random() < 0.3;
    }
    
    if (train.delay > 10 && signal.status !== 'green') {
      return Math.random() < 0.5;
    }
    
    return false;
  }
}