import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Utility function for class names
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

// HyperText component implementation
interface HyperTextProps {
  text: string;
  duration?: number;
  framerProps?: any;
  className?: string;
  animateOnLoad?: boolean;
  trigger?: boolean;
}

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const getRandomInt = (max: number) => Math.floor(Math.random() * max);

function HyperText({
  text,
  duration = 800,
  framerProps = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 3 },
  },
  className,
  animateOnLoad = true,
  trigger = false,
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState(text.split(""));
  const [triggerState, setTriggerState] = useState(false);
  const interations = React.useRef(0);
  const isFirstRender = React.useRef(true);

  const triggerAnimation = () => {
    interations.current = 0;
    setTriggerState(true);
  };

  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!animateOnLoad && isFirstRender.current) {
          clearInterval(interval);
          isFirstRender.current = false;
          return;
        }
        if (interations.current < text.length) {
          setDisplayText((t) =>
            t.map((l, i) =>
              l === " "
                ? l
                : i <= interations.current
                  ? text[i]
                  : alphabets[getRandomInt(26)],
            ),
          );
          interations.current = interations.current + 0.1;
        } else {
          setTriggerState(false);
          clearInterval(interval);
        }
      },
      duration / (text.length * 10),
    );
    return () => clearInterval(interval);
  }, [text, duration, triggerState, animateOnLoad, trigger]);

  return (
    <div
      className="flex scale-100 cursor-default overflow-hidden py-2"
      onMouseEnter={triggerAnimation}
    >
      <AnimatePresence mode="wait">
        {displayText.map((letter, i) => (
          <motion.span
            key={i}
            className={cn("font-mono", letter === " " ? "w-3" : "", className)}
            {...framerProps}
          >
            {letter.toUpperCase()}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Train component
interface TrainProps {
  type: "express" | "freight";
  position: { x: number; y: number };
  isMoving: boolean;
  priority: "high" | "low";
  className?: string;
  animateKey?: any;
  isResolved?: boolean;
}

function Train({ type, position, isMoving, priority, className, animateKey, isResolved }: TrainProps) {
  const trainColor = type === "express" ? "from-blue-400 to-cyan-300" : "from-orange-500 to-red-400";
  const glowColor = type === "express" ? "shadow-blue-400/50" : "shadow-orange-500/50";

  return (
    <motion.div
      key={animateKey}
      className={cn(
        "absolute w-16 h-8 rounded-lg bg-gradient-to-r",
        trainColor,
        glowColor,
        "shadow-lg border border-white/20",
        isMoving && "animate-pulse",
        className
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      animate={
          isResolved 
            ? { 
                x: type === "express" ? "600%" : "-200%", 
                y: 0,
                transition: { 
                  duration: type === "express" ? 2.5 : 3.5, 
                  ease: "easeInOut",
                  delay: type === "express" ? 0 : 0.7
                } 
              }
          : {
              x: isMoving ? [0, 5, 0] : 0,
              scale: priority === "high" ? 1.1 : 1,
            }
      }
      transition={
        isResolved 
          ? { duration: 3, ease: "easeInOut" } 
          : {
              x: { repeat: Infinity, duration: 2 },
              scale: { duration: 0.5 },
            }
      }
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg" />
      <div className="absolute top-1 left-2 w-2 h-2 bg-white/80 rounded-full" />
      <div className="absolute top-1 right-2 w-2 h-2 bg-white/80 rounded-full" />
    </motion.div>
  );
}

// Signal component
interface SignalProps {
  type: "green" | "red";
  position: { x: number; y: number };
  isActive: boolean;
}

function Signal({ type, position, isActive }: SignalProps) {
  const signalColor = type === "green" ? "bg-green-400" : "bg-red-500";
  const glowColor = type === "green" ? "shadow-green-400/70" : "shadow-red-500/70";

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="w-4 h-8 bg-gray-800 rounded-sm border border-gray-600">
        <motion.div
          className={cn(
            "w-3 h-3 rounded-full m-0.5",
            isActive ? signalColor : "bg-gray-600",
            isActive && glowColor,
            isActive && "shadow-lg"
          )}
          animate={{
            opacity: isActive ? [1, 0.5, 1] : 0.3,
          }}
          transition={{
            repeat: isActive ? Infinity : 0,
            duration: 1.5,
          }}
        />
      </div>
    </motion.div>
  );
}

// Track component
interface TrackProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isConflict: boolean;
  priority: "high" | "low" | "neutral";
}

function Track({ start, end, isConflict, priority }: TrackProps) {
  const trackColor = isConflict 
    ? "from-red-500/60 to-orange-500/60" 
    : priority === "high" 
      ? "from-green-400/60 to-blue-400/60"
      : "from-gray-500/40 to-gray-400/40";

  const glowColor = isConflict 
    ? "shadow-red-500/30" 
    : priority === "high" 
      ? "shadow-green-400/30"
      : "shadow-gray-400/20";

  return (
    <motion.div
      className={cn(
        "absolute h-2 bg-gradient-to-r rounded-full border border-white/20",
        trackColor,
        glowColor,
        "shadow-lg"
      )}
      style={{
        left: `${start.x}%`,
        top: `${start.y}%`,
        width: `${end.x - start.x}%`,
        transformOrigin: "left center",
      }}
      animate={{
        opacity: isConflict ? [0.8, 1, 0.8] : 1,
        scale: isConflict ? [1, 1.05, 1] : 1,
      }}
      transition={{
        repeat: isConflict ? Infinity : 0,
        duration: 2,
      }}
    >
      {/* Track rails */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/30 rounded-full" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 rounded-full" />
    </motion.div>
  );
}

// Priority indicator component
interface PriorityIndicatorProps {
  type: "high" | "low";
  position: { x: number; y: number };
  trainType: string;
}

function PriorityIndicator({ type, position, trainType }: PriorityIndicatorProps) {
  const bgColor = type === "high" ? "from-green-400/20 to-blue-400/20" : "from-orange-500/20 to-red-500/20";
  const borderColor = type === "high" ? "border-green-400/50" : "border-orange-500/50";
  const textColor = type === "high" ? "text-green-300" : "text-orange-300";

  return (
    <motion.div
      className={cn(
        "absolute bg-gradient-to-r backdrop-blur-sm rounded-lg border px-3 py-2",
        bgColor,
        borderColor
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={cn("text-xs font-mono font-semibold", textColor)}>
        {trainType} - {type === "high" ? "HIGH" : "LOW"} PRIORITY
      </div>
    </motion.div>
  );
}

// Main Train Traffic Management component
interface TrainTrafficManagementProps {
  className?: string;
}

export function TrainTrafficManagement({ className }: TrainTrafficManagementProps = {}) {
  const [conflictResolved, setConflictResolved] = useState(false);
  const [systemActive, setSystemActive] = useState(true);
  const [animateKey, setAnimateKey] = useState(0);
  const [trainPositions, setTrainPositions] = useState({
    express: { x: 20, y: 40 },
    freight: { x: 75, y: 60 }
  });

  // Buttons to toggle conflict state
  const handleShowConflict = () => {
    setConflictResolved(false);
    setTrainPositions({
      express: { x: 20, y: 40 },
      freight: { x: 75, y: 60 }
    });
    setAnimateKey(prev => prev + 1);
  };

  const handleShowResolved = () => {
    setConflictResolved(true);
    setAnimateKey(prev => prev + 1);
  };

  return (
    <div className={cn(
      "relative w-full h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-black overflow-hidden rounded-xl border border-slate-300 shadow-lg",
      className
    )}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Holographic overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

      {/* Conflict/Resolved toggle buttons */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-mono text-xs shadow"
          onClick={handleShowConflict}
        >
          Show Conflict
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-mono text-xs shadow"
          onClick={handleShowResolved}
        >
          Show Resolved
        </button>
      </div>

      {/* System status */}
      <motion.div
         className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-lg rounded-lg border border-white/20 p-3 min-w-56"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
       <h3 className="text-white font-mono text-xs mb-2 border-b border-white/20 pb-1">
          SYSTEM STATUS
        </h3>
        
        <div className="space-y-1 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-300">Express Train:</span>
            <span className="text-blue-300">PRIORITY</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Freight Train:</span>
            <span className="text-orange-300">WAITING</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Conflict Status:</span>
            <span className={conflictResolved ? "text-green-300" : "text-red-300"}>
              {conflictResolved ? "RESOLVED" : "ACTIVE"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">AI Decision:</span>
            <span className="text-cyan-300">OPTIMIZED</span>
          </div>
        </div> 
      </motion.div>

      {/* Railway station layout */}
      <div className="absolute inset-0 flex items-center justify-center mt-4">
        <div className="relative w-4/5 h-3/5">
          
          {/* Main tracks */}
          <Track
            start={{ x: 10, y: 40 }}
            end={{ x: 90, y: 40 }}
            isConflict={!conflictResolved}
            priority={conflictResolved ? "high" : "neutral"}
          />
          
          <Track
            start={{ x: 10, y: 60 }}
            end={{ x: 90, y: 60 }}
            isConflict={false}
            priority="low"
          />

          {/* Junction tracks */}
          <Track
            start={{ x: 45, y: 40 }}
            end={{ x: 55, y: 60 }}
            isConflict={!conflictResolved}
            priority="neutral"
          />

          {/* Express train (blue, high priority) */}
          <Train
            type="express"
            position={trainPositions.express}
            isMoving={!conflictResolved}
            priority="high"
            animateKey={animateKey}
            isResolved={conflictResolved}
          />

          {/* Freight train (orange, low priority) */}
          <Train
            type="freight"
            position={trainPositions.freight}
            isMoving={!conflictResolved}
            priority="low"
            animateKey={animateKey}
            isResolved={conflictResolved}
          />

          {/* Traffic signals */}
          <Signal
            type={conflictResolved ? "green" : "red"}
            position={{ x: 35, y: 35 }}
            isActive={true}
          />

          <Signal
            type={!conflictResolved ? "green" : "red"}
            position={{ x: 70, y: 55 }}
            isActive={true}
          />

          {/* Priority indicators */}
          <PriorityIndicator
            type="high"
            position={{ x: 45, y: 15 }}
            trainType="EXPRESS"
          />

          <PriorityIndicator
            type="low"
            position={{ x: 65, y: 75 }}
            trainType="FREIGHT"
          />

          {/* Conflict zone indicator */}
          {!conflictResolved && (
            <motion.div
              className="absolute bg-red-500/20 border-2 border-red-500/50 rounded-lg backdrop-blur-sm"
              style={{
                left: "40%",
                top: "35%",
                width: "20%",
                height: "30%",
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-red-300 text-xs font-mono font-bold text-center">
                  CONFLICT DETECTED<br/>⚠
                </div>
              </div>
            </motion.div>
          )}

          {/* Resolution indicator */}
          {conflictResolved && (
            <motion.div
              className="absolute bg-green-500/20 border-2 border-green-500/50 rounded-lg backdrop-blur-sm"
              style={{
                left: "40%",
                top: "35%",
                width: "20%",
                height: "30%",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-green-300 text-xs font-mono font-bold text-center">
                  RESOLVED<br/>✅
                </div>
              </div>
            </motion.div>
          )}

          {/* AI decision arrows */}
          <AnimatePresence>
            {!conflictResolved && (
              <>
                <motion.div
                  className="absolute"
                  style={{ left: "35%", top: "30%" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg width="60" height="20" className="text-blue-400">
                    <defs>
                      <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                      </marker>
                    </defs>
                    <line x1="0" y1="10" x2="50" y2="10" stroke="currentColor" 
                      strokeWidth="2" markerEnd="url(#arrowhead-blue)" />
                  </svg>
                </motion.div>

                <motion.div
                  className="absolute"
                  style={{ left: "55%", top: "70%" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <svg width="60" height="20" className="text-orange-400">
                    <defs>
                      <marker id="arrowhead-orange" markerWidth="10" markerHeight="7" 
                        refX="0" refY="3.5" orient="auto">
                        <polygon points="10 0, 0 3.5, 10 7" fill="currentColor" />
                      </marker>
                    </defs>
                    <line x1="50" y1="10" x2="0" y2="10" stroke="currentColor" 
                      strokeWidth="2" markerEnd="url(#arrowhead-orange)" />
                  </svg>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Scanning lines effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{ y: ["0vh", "100vh"] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}

// Main component that replaces the TrackDiagram
export const TrackDiagram: React.FC<any> = ({ onSignalClick }) => {
  return (
    <div className="relative w-full h-96">
      <TrainTrafficManagement />
    </div>
  );
};

export default TrackDiagram;