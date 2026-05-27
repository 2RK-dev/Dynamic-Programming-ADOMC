"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AlgoLayout from "@/components/AlgoLayout";

type CellState = "default" | "active" | "source" | "computed";

interface DPCell {
  index: number;
  value: number | null;
  state: CellState;
}

const SPEED_MAP: Record<string, number> = {
  slow: 1200,
  medium: 600,
  fast: 250,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ClimbingStairsPage() {
  const [n, setN] = useState(6);
  const [speed, setSpeed] = useState<"slow" | "medium" | "fast">("medium");
  const [isRunning, setIsRunning] = useState(false);
  const [dpCells, setDpCells] = useState<DPCell[]>([]);
  const [activeStair, setActiveStair] = useState<number | null>(null);
  const [climberPosition, setClimberPosition] = useState<number>(0);
  const [stepInfo, setStepInfo] = useState<string>("");
  const [finalAnswer, setFinalAnswer] = useState<number | null>(null);
  const cancelRef = useRef(false);

  const initializeCells = useCallback(
    (size: number): DPCell[] => {
      return Array.from({ length: size + 1 }, (_, i) => ({
        index: i,
        value: null,
        state: "default" as CellState,
      }));
    },
    []
  );

  const handleReset = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setDpCells([]);
    setActiveStair(null);
    setClimberPosition(0);
    setStepInfo("");
    setFinalAnswer(null);
  }, []);

  const handleStart = useCallback(async () => {
    if (isRunning) return;

    cancelRef.current = false;
    setIsRunning(true);
    setFinalAnswer(null);
    setStepInfo("");

    const cells = initializeCells(n);
    setDpCells([...cells]);

    const ms = SPEED_MAP[speed];

    // Base cases
    // dp[0] = 1
    cells[0] = { ...cells[0], value: 1, state: "active" };
    setDpCells([...cells]);
    setActiveStair(0);
    setClimberPosition(0);
    setStepInfo("Base case: dp[0] = 1 (1 way to stay at ground)");
    await delay(ms);
    if (cancelRef.current) return;

    cells[0] = { ...cells[0], state: "computed" };
    setDpCells([...cells]);

    // dp[1] = 1
    cells[1] = { ...cells[1], value: 1, state: "active" };
    setDpCells([...cells]);
    setActiveStair(1);
    setClimberPosition(1);
    setStepInfo("Base case: dp[1] = 1 (1 way to climb 1 stair)");
    await delay(ms);
    if (cancelRef.current) return;

    cells[1] = { ...cells[1], state: "computed" };
    setDpCells([...cells]);

    // Fill dp[2..n]
    for (let i = 2; i <= n; i++) {
      if (cancelRef.current) return;

      // Highlight source cells
      cells[i - 1] = { ...cells[i - 1], state: "source" };
      cells[i - 2] = { ...cells[i - 2], state: "source" };
      cells[i] = { ...cells[i], state: "active", value: null };
      setDpCells([...cells]);
      setActiveStair(i);
      setClimberPosition(i);
      setStepInfo(
        `Computing dp[${i}] = dp[${i - 1}] + dp[${i - 2}]`
      );
      await delay(ms * 0.6);
      if (cancelRef.current) return;

      const val = (cells[i - 1].value ?? 0) + (cells[i - 2].value ?? 0);
      cells[i] = { ...cells[i], value: val, state: "active" };
      setDpCells([...cells]);
      setStepInfo(
        `Step ${i}: dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${cells[i - 1].value} + ${cells[i - 2].value} = ${val}`
      );
      await delay(ms * 0.6);
      if (cancelRef.current) return;

      // Restore sources to computed, mark current as computed
      cells[i - 1] = { ...cells[i - 1], state: "computed" };
      cells[i - 2] = { ...cells[i - 2], state: "computed" };
      cells[i] = { ...cells[i], state: "computed" };
      setDpCells([...cells]);
    }

    setFinalAnswer(cells[n].value);
    setStepInfo(
      `Done! There are ${cells[n].value} distinct ways to climb ${n} stairs.`
    );
    setActiveStair(null);
    setIsRunning(false);
  }, [isRunning, n, speed, initializeCells]);

  const cellBg = (state: CellState) => {
    switch (state) {
      case "active":
        return "bg-blue-500 border-blue-400 cell-glow";
      case "source":
        return "bg-amber-500/50 border-amber-400/60";
      case "computed":
        return "bg-cyan-500/20 border-cyan-500/50";
      default:
        return "bg-[#1e1e2e] border-[#2a2a3e]";
    }
  };

  const cellText = (state: CellState) => {
    switch (state) {
      case "active":
        return "text-white font-bold";
      case "source":
        return "text-amber-200 font-semibold";
      case "computed":
        return "text-cyan-300";
      default:
        return "text-slate-500";
    }
  };

  // Staircase dimensions
  const stairWidth = 52;
  const stairHeight = 32;
  const stairDepth = 8;
  const totalStairs = n;
  const svgWidth = (totalStairs + 2) * stairWidth + 40;
  const svgHeight = (totalStairs + 2) * stairHeight + 60;

  const controls = (
    <div className="space-y-6">
      {/* N input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Number of stairs (n)
        </label>
        <input
          type="number"
          min={1}
          max={15}
          value={n}
          onChange={(e) => {
            const v = Math.max(1, Math.min(15, Number(e.target.value)));
            setN(v);
          }}
          disabled={isRunning}
          className="w-full rounded-lg border border-[#2a2a3e] bg-[#1e1e2e] px-4 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 font-mono"
        />
        <p className="text-xs text-slate-500 mt-1">Range: 1 - 15</p>
      </div>

      {/* Speed slider */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Speed
        </label>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={speed === "slow" ? 0 : speed === "medium" ? 1 : 2}
          onChange={(e) => {
            const v = Number(e.target.value);
            setSpeed(v === 0 ? "slow" : v === 1 ? "medium" : "fast");
          }}
          disabled={isRunning}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Slow</span>
          <span>Medium</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? "Running..." : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 rounded-lg border border-[#2a2a3e] bg-[#1e1e2e] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-[#2a2a3e] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Formula */}
      <div className="rounded-lg border border-[#2a2a3e] bg-[#1a1a28] p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">
          Recurrence
        </p>
        <p className="text-sm font-mono text-cyan-300">
          dp[i] = dp[i-1] + dp[i-2]
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Base: dp[0] = 1, dp[1] = 1
        </p>
      </div>

      {/* Result */}
      <AnimatePresence>
        {finalAnswer !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"
          >
            <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">
              Result
            </p>
            <p className="text-2xl font-bold text-emerald-300 font-mono">
              {finalAnswer}
            </p>
            <p className="text-xs text-slate-400 mt-1">distinct ways</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AlgoLayout
      title="Climbing Stairs"
      icon="🪜"
      description="How many distinct ways can you climb n stairs if you can take 1 or 2 steps at a time?"
      complexity="Time: O(n) | Space: O(n)"
      controls={controls}
    >
      <div className="space-y-8">
        {/* Step info banner */}
        <AnimatePresence mode="wait">
          {stepInfo && (
            <motion.div
              key={stepInfo}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-lg border border-[#2a2a3e] bg-[#1a1a28] px-4 py-3 text-sm font-mono text-slate-300"
            >
              {stepInfo}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-part visualization */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left: Staircase visualization */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Staircase
            </h3>
            <div className="rounded-xl border border-[#2a2a3e] bg-[#0e0e18] p-4 overflow-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="100%"
                height={Math.min(svgHeight, 420)}
                className="mx-auto"
              >
                {/* Draw stairs from bottom-left going up and right */}
                {Array.from({ length: totalStairs + 1 }, (_, i) => {
                  const x = i * stairWidth + 10;
                  const y = svgHeight - (i + 1) * stairHeight - 20;

                  const isActive = activeStair === i;
                  const isComputed =
                    dpCells[i]?.state === "computed";
                  const isSource = dpCells[i]?.state === "source";

                  let fillColor = "#1e1e2e";
                  let strokeColor = "#2a2a3e";
                  if (isActive) {
                    fillColor = "#3b82f6";
                    strokeColor = "#60a5fa";
                  } else if (isSource) {
                    fillColor = "#b45309";
                    strokeColor = "#f59e0b";
                  } else if (isComputed) {
                    fillColor = "#0e4f5c";
                    strokeColor = "#06b6d4";
                  }

                  return (
                    <g key={i}>
                      {/* 3D top face */}
                      <polygon
                        points={`${x},${y} ${x + stairDepth},${y - stairDepth} ${x + stairWidth + stairDepth},${y - stairDepth} ${x + stairWidth},${y}`}
                        fill={isActive ? "#60a5fa" : isSource ? "#d97706" : isComputed ? "#0ea5e9" : "#2a2a3e"}
                        stroke={strokeColor}
                        strokeWidth="1"
                        opacity={0.7}
                      />
                      {/* 3D right face */}
                      <polygon
                        points={`${x + stairWidth},${y} ${x + stairWidth + stairDepth},${y - stairDepth} ${x + stairWidth + stairDepth},${y + stairHeight - stairDepth} ${x + stairWidth},${y + stairHeight}`}
                        fill={isActive ? "#2563eb" : isSource ? "#92400e" : isComputed ? "#0369a1" : "#161625"}
                        stroke={strokeColor}
                        strokeWidth="1"
                        opacity={0.7}
                      />
                      {/* Front face */}
                      <rect
                        x={x}
                        y={y}
                        width={stairWidth}
                        height={stairHeight}
                        rx={3}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                      />
                      {/* Active glow filter */}
                      {isActive && (
                        <rect
                          x={x - 2}
                          y={y - 2}
                          width={stairWidth + 4}
                          height={stairHeight + 4}
                          rx={4}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          opacity={0.5}
                        >
                          <animate
                            attributeName="opacity"
                            values="0.3;0.8;0.3"
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </rect>
                      )}
                      {/* Step number */}
                      <text
                        x={x + stairWidth / 2}
                        y={y + stairHeight / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isActive ? "#ffffff" : isComputed ? "#06b6d4" : "#64748b"}
                        fontSize="11"
                        fontWeight={isActive ? "bold" : "normal"}
                        fontFamily="monospace"
                      >
                        {i}
                      </text>
                    </g>
                  );
                })}

                {/* Climber figure */}
                {dpCells.length > 0 && (
                  <g>
                    <AnimatedClimber
                      x={climberPosition * stairWidth + 10 + stairWidth / 2}
                      y={
                        svgHeight -
                        (climberPosition + 1) * stairHeight -
                        20 -
                        28
                      }
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Right: DP array */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              DP Array
            </h3>
            <div className="rounded-xl border border-[#2a2a3e] bg-[#0e0e18] p-4">
              {dpCells.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
                  Press Start to begin the visualization
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Index row */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dpCells.map((cell) => (
                      <div key={`idx-${cell.index}`} className="text-center">
                        <div className="text-[10px] text-slate-500 font-mono mb-1">
                          dp[{cell.index}]
                        </div>
                        <motion.div
                          layout
                          className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-sm transition-colors duration-300 ${cellBg(cell.state)} ${cellText(cell.state)}`}
                          animate={
                            cell.state === "active"
                              ? { scale: [1, 1.1, 1] }
                              : { scale: 1 }
                          }
                          transition={
                            cell.state === "active"
                              ? { repeat: Infinity, duration: 0.8 }
                              : { duration: 0.3 }
                          }
                        >
                          {cell.value !== null ? cell.value : "-"}
                        </motion.div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 justify-center mt-6 pt-4 border-t border-[#2a2a3e]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-500" />
                      <span className="text-xs text-slate-400">
                        Computing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-amber-500/50" />
                      <span className="text-xs text-slate-400">
                        Source cells
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-cyan-500/20 border border-cyan-500/50" />
                      <span className="text-xs text-slate-400">
                        Computed
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {dpCells.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-slate-500 text-sm"
          >
            Configure the number of stairs and press{" "}
            <span className="text-blue-400 font-medium">Start</span> to
            visualize the dynamic programming solution.
          </motion.div>
        )}
      </div>
    </AlgoLayout>
  );
}

/* Animated climber figure drawn as SVG */
function AnimatedClimber({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
    >
      {/* Body */}
      <circle cx={0} cy={-10} r={6} fill="#facc15" />
      {/* Eyes */}
      <circle cx={-2} cy={-11} r={1} fill="#1e1e2e" />
      <circle cx={2} cy={-11} r={1} fill="#1e1e2e" />
      {/* Smile */}
      <path
        d="M-2,-8 Q0,-6 2,-8"
        stroke="#1e1e2e"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Torso */}
      <line x1={0} y1={-4} x2={0} y2={8} stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      {/* Arms */}
      <motion.line
        x1={0}
        y1={0}
        x2={-7}
        y2={6}
        stroke="#facc15"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ x2: [-7, -5, -7], y2: [6, 3, 6] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      />
      <motion.line
        x1={0}
        y1={0}
        x2={7}
        y2={6}
        stroke="#facc15"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ x2: [7, 5, 7], y2: [6, 3, 6] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
      />
      {/* Legs */}
      <motion.line
        x1={0}
        y1={8}
        x2={-5}
        y2={16}
        stroke="#facc15"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ x2: [-5, -3, -5], y2: [16, 13, 16] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      />
      <motion.line
        x1={0}
        y1={8}
        x2={5}
        y2={16}
        stroke="#facc15"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{ x2: [5, 3, 5], y2: [16, 13, 16] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
      />
    </motion.g>
  );
}
