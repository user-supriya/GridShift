import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Train, BarChart3, Brain, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Train Control', href: '/trains', icon: Train },
    { name: 'AI Management', href: '/ai-control', icon: Brain },
    { name: 'Scenarios', href: '/scenarios', icon: Zap },
    { name: 'Analytics', href: '/analytics', icon: Settings },
  ];

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                <Train className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">NexRail</h1>
                <p className="text-xs text-muted-foreground">AI Traffic Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">System Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};