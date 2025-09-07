import React from 'react';
import { Train, Signal, Track, Station } from '@/types/railway';

interface TrackDiagramProps {
  trains: Train[];
  signals: Signal[];
  tracks: Track[];
  stations: Station[];
  onSignalClick: (signalId: string) => void;
}

export const TrackDiagram: React.FC<TrackDiagramProps> = ({
  trains,
  signals,
  tracks,
  stations,
  onSignalClick
}) => {
  const getTrainPosition = (train: Train, track: Track) => {
    const fromStation = stations.find(s => s.id === track.from);
    const toStation = stations.find(s => s.id === track.to);
    
    if (!fromStation || !toStation) return { x: 0, y: 0 };
    
    const x = fromStation.position.x + (toStation.position.x - fromStation.position.x) * train.position.distance;
    const y = fromStation.position.y + (toStation.position.y - fromStation.position.y) * train.position.distance;
    
    return { x, y };
  };

  const getSignalPosition = (signal: Signal, track: Track) => {
    const fromStation = stations.find(s => s.id === track.from);
    const toStation = stations.find(s => s.id === track.to);
    
    if (!fromStation || !toStation) return { x: 0, y: 0 };
    
    const x = fromStation.position.x + (toStation.position.x - fromStation.position.x) * signal.position;
    const y = fromStation.position.y + (toStation.position.y - fromStation.position.y) * signal.position;
    
    return { x, y };
  };

  const getSignalColor = (status: string) => {
    switch (status) {
      case 'red': return '#ef4444';
      case 'yellow': return '#eab308';
      case 'green': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getTrainColor = (type: string) => {
    return type === 'passenger' ? '#3b82f6' : '#f97316';
  };

  return (
    <div className="relative w-full h-96 bg-card border border-border rounded-lg overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute inset-0">
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Tracks */}
        {tracks.map(track => {
          const fromStation = stations.find(s => s.id === track.from);
          const toStation = stations.find(s => s.id === track.to);
          
          if (!fromStation || !toStation) return null;
          
          return (
            <g key={track.id}>
              <line
                x1={fromStation.position.x}
                y1={fromStation.position.y}
                x2={toStation.position.x}
                y2={toStation.position.y}
                stroke={track.occupied ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
                strokeWidth={track.occupied ? "4" : "2"}
                strokeDasharray={track.direction === 'bidirectional' ? '0' : '5,5'}
              />
              <text
                x={(fromStation.position.x + toStation.position.x) / 2}
                y={(fromStation.position.y + toStation.position.y) / 2 - 10}
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
                textAnchor="middle"
              >
                {track.id}
              </text>
            </g>
          );
        })}
        
        {/* Stations */}
        {stations.map(station => (
          <g key={station.id}>
            <rect
              x={station.position.x - 20}
              y={station.position.y - 15}
              width="40"
              height="30"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="2"
              rx="4"
            />
            <text
              x={station.position.x}
              y={station.position.y + 3}
              fill="hsl(var(--primary-foreground))"
              fontSize="10"
              textAnchor="middle"
              fontWeight="bold"
            >
              {station.name.split(' ')[0]}
            </text>
            <text
              x={station.position.x}
              y={station.position.y + 35}
              fill="hsl(var(--foreground))"
              fontSize="8"
              textAnchor="middle"
            >
              {station.platforms}P
            </text>
          </g>
        ))}
        
        {/* Signals */}
        {signals.map(signal => {
          const track = tracks.find(t => t.id === signal.trackId);
          if (!track) return null;
          
          const position = getSignalPosition(signal, track);
          
          return (
            <g key={signal.id}>
              <circle
                cx={position.x}
                cy={position.y}
                r="6"
                fill={getSignalColor(signal.status)}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                className="cursor-pointer hover:stroke-primary"
                onClick={() => onSignalClick(signal.id)}
              />
              <circle
                cx={position.x}
                cy={position.y}
                r="3"
                fill={getSignalColor(signal.status)}
                className="animate-pulse"
              />
              <text
                x={position.x + 10}
                y={position.y - 10}
                fill="hsl(var(--muted-foreground))"
                fontSize="8"
              >
                {signal.id}
              </text>
            </g>
          );
        })}
        
        {/* Trains */}
        {trains.map(train => {
          const track = tracks.find(t => t.id === train.position.trackId);
          if (!track || train.status === 'arrived') return null;
          
          const position = getTrainPosition(train, track);
          
          return (
            <g key={train.id}>
              <rect
                x={position.x - 8}
                y={position.y - 6}
                width="16"
                height="12"
                fill={getTrainColor(train.type)}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={position.x}
                y={position.y + 2}
                fill="white"
                fontSize="8"
                textAnchor="middle"
                fontWeight="bold"
              >
                {train.name.split(' ')[1]}
              </text>
              <text
                x={position.x}
                y={position.y - 12}
                fill="hsl(var(--foreground))"
                fontSize="7"
                textAnchor="middle"
              >
                {Math.round(train.speed)}km/h
              </text>
              {train.delay > 0 && (
                <text
                  x={position.x}
                  y={position.y + 20}
                  fill="hsl(var(--destructive))"
                  fontSize="7"
                  textAnchor="middle"
                >
                  +{train.delay}min
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};