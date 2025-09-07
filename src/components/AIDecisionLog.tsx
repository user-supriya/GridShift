import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Clock, Lightbulb, Target, Zap } from 'lucide-react';
import { AIDecision } from '@/types/railway';

interface AIDecisionLogProps {
  decisions: AIDecision[];
  currentTime: number;
}

export const AIDecisionLog: React.FC<AIDecisionLogProps> = ({
  decisions,
  currentTime
}) => {
  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp);
    const seconds = Math.floor((timestamp % 1) * 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'signal_change':
        return <Zap className="h-4 w-4" />;
      case 'route_priority':
        return <Target className="h-4 w-4" />;
      case 'delay_management':
        return <Clock className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getDecisionColor = (type: string) => {
    switch (type) {
      case 'signal_change':
        return 'bg-blue-500';
      case 'route_priority':
        return 'bg-green-500';
      case 'delay_management':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const recentDecisions = decisions
    .filter(d => currentTime - d.timestamp <= 30) // Last 30 minutes
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Decision Log
          <Badge variant="secondary">{recentDecisions.length} recent</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4">
          <div className="space-y-3 pb-4">
            {recentDecisions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent AI decisions</p>
                <p className="text-xs">Decisions will appear here as the AI makes them</p>
              </div>
            ) : (
              recentDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="flex gap-3 p-3 border border-border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${getDecisionColor(decision.type)}`}>
                    {getDecisionIcon(decision.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {decision.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(decision.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      {decision.description}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Reasoning:</span>
                        <span className="text-xs text-muted-foreground flex-1">
                          {decision.reasoning}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Impact:</span>
                        <span className="text-xs text-foreground flex-1">
                          {decision.impact}
                        </span>
                      </div>
                    </div>
                    
                    {(decision.trainId || decision.signalId) && (
                      <div className="flex gap-2 mt-2">
                        {decision.trainId && (
                          <Badge variant="secondary" className="text-xs">
                            Train: {decision.trainId}
                          </Badge>
                        )}
                        {decision.signalId && (
                          <Badge variant="secondary" className="text-xs">
                            Signal: {decision.signalId}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};