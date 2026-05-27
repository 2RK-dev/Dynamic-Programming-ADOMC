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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SPEED_MAP: Record<string, number> = {
  slow: 1200,
  medium: 600,
  fast: 250,
};

export default function FibonacciPage() {
  const [n, setN] = useState(8);
  const [speed, setSpeed] = useState<string>("medium");
  const [cells, setCells] = useState<DPCell[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [formula, setFormula] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [sourceIndices, setSourceIndices] = useState<number[]>([]);
  const cancelRef = useRef(false);

  const initCells = useCallback(
    (count: number): DPCell[] =>
      Array.from({ length: count + 1 }, (_, i) => ({
        index: i,
        value: null,
        state: "default" as CellState,
      })),
    []
  );

  const handleReset = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setCells([]);
    setFormula("");
    setActiveIndex(null);
    setSourceIndices([]);
  }, []);

  const handleStart = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);

    const dpCells = initCells(n);
    setCells([...dpCells]);
    setFormula("");
    setActiveIndex(null);
    setSourceIndices([]);

    const stepDelay = SPEED_MAP[speed];

    await delay(stepDelay / 2);
    if (cancelRef.current) return;

    // Base case: dp[0] = 0
    dpCells[0] = { ...dpCells[0], state: "active", value: null };
    setCells([...dpCells]);
    setActiveIndex(0);
    setFormula("dp[0] = 0");
    await delay(stepDelay / 2);
    if (cancelRef.current) return;

    dpCells[0] = { ...dpCells[0], value: 0, state: "computed" };
    setCells([...dpCells]);
    setActiveIndex(null);
    await delay(stepDelay / 2);
    if (cancelRef.current) return;

    // Base case: dp[1] = 1
    if (n >= 1) {
      dpCells[1] = { ...dpCells[1], state: "active", value: null };
      setCells([...dpCells]);
      setActiveIndex(1);
      setFormula("dp[1] = 1");
      await delay(stepDelay / 2);
      if (cancelRef.current) return;

      dpCells[1] = { ...dpCells[1], value: 1, state: "computed" };
      setCells([...dpCells]);
      setActiveIndex(null);
      await delay(stepDelay / 2);
      if (cancelRef.current) return;
    }

    // Fill dp[2..n]
    for (let i = 2; i <= n; i++) {
      if (cancelRef.current) return;

      // Highlight source cells
      dpCells[i - 1] = { ...dpCells[i - 1], state: "source" };
      dpCells[i - 2] = { ...dpCells[i - 2], state: "source" };
      dpCells[i] = { ...dpCells[i], state: "active", value: null };
      setCells([...dpCells]);
      setActiveIndex(i);
      setSourceIndices([i - 2, i - 1]);
      setFormula(
        `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dpCells[i - 1].value} + ${dpCells[i - 2].value}`
      );

      await delay(stepDelay);
      if (cancelRef.current) return;

      // Compute value
      const val = (dpCells[i - 1].value ?? 0) + (dpCells[i - 2].value ?? 0);
      dpCells[i] = { ...dpCells[i], value: val, state: "computed" };
      dpCells[i - 1] = { ...dpCells[i - 1], state: "computed" };
      dpCells[i - 2] = { ...dpCells[i - 2], state: "computed" };
      setCells([...dpCells]);
      setActiveIndex(null);
      setSourceIndices([]);
      setFormula(
        `dp[${i}] = ${dpCells[i - 1].value} + ${dpCells[i - 2].value} = ${val}`
      );

      await delay(stepDelay / 2);
      if (cancelRef.current) return;
    }

    setFormula(`F(${n}) = ${dpCells[n].value}`);
    setIsRunning(false);
  }, [n, speed, initCells]);

  const cellColorClass = (state: CellState) => {
    switch (state) {
      case "active":
        return "bg-indigo-500 border-indigo-400 text-white";
      case "source":
        return "bg-amber-500/50 border-amber-400/50 text-amber-100";
      case "computed":
        return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
      default:
        return "bg-[#1e1e2e] border-[#2a2a3e] text-slate-500";
    }
  };

  // -- Controls --
  const controls = (
    <div className="space-y-6">
      {/* N input */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Value of <span className="font-mono text-white">n</span>
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={n}
          disabled={isRunning}
          onChange={(e) => {
            const v = Math.min(20, Math.max(1, Number(e.target.value)));
            setN(v);
          }}
          className="w-full rounded-lg bg-[#1e1e2e] border border-[#2a2a3e] px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
        />
        <p className="text-xs text-slate-500 mt-1">Range: 1 - 20</p>
      </div>

      {/* Speed slider */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">Speed</label>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={speed === "slow" ? 0 : speed === "medium" ? 1 : 2}
          disabled={isRunning}
          onChange={(e) => {
            const v = Number(e.target.value);
            setSpeed(v === 0 ? "slow" : v === 1 ? "medium" : "fast");
          }}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Slow</span>
          <span>Medium</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Running...
            </span>
          ) : (
            "Start"
          )}
        </button>
        <button
          onClick={handleReset}
          className="py-2.5 px-4 rounded-lg bg-[#1e1e2e] border border-[#2a2a3e] text-slate-300 text-sm font-medium hover:bg-[#2a2a3e] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Formula display (small sidebar version) */}
      <AnimatePresence mode="wait">
        {formula && (
          <motion.div
            key={formula}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-lg bg-[#1e1e2e] border border-[#2a2a3e] p-3"
          >
            <p className="text-xs text-slate-500 mb-1">Current step</p>
            <p className="text-sm font-mono text-indigo-300">{formula}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // -- Arrow SVG between source cells and active cell --
  const renderArrows = () => {
    if (activeIndex === null || sourceIndices.length === 0) return null;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {sourceIndices.map((srcIdx) => {
          const srcEl = document.getElementById(`fib-cell-${srcIdx}`);
          const actEl = document.getElementById(`fib-cell-${activeIndex}`);
          if (!srcEl || !actEl) return null;

          const container = document.getElementById("fib-cell-container");
          if (!container) return null;

          const cRect = container.getBoundingClientRect();
          const sRect = srcEl.getBoundingClientRect();
          const aRect = actEl.getBoundingClientRect();

          const x1 = sRect.left + sRect.width / 2 - cRect.left;
          const y1 = sRect.top - cRect.top;
          const x2 = aRect.left + aRect.width / 2 - cRect.left;
          const y2 = aRect.top - cRect.top;

          return (
            <motion.path
              key={`arrow-${srcIdx}-${activeIndex}`}
              d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - 40} ${x2} ${y2}`}
              stroke="#f59e0b"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.4 }}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>
    );
  };

  // -- Visualization --
  const visualization = (
    <div className="flex flex-col items-center gap-8">
      {/* Live formula bar */}
      <AnimatePresence mode="wait">
        {formula && (
          <motion.div
            key={formula}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e1e2e] border border-[#2a2a3e] px-5 py-3"
          >
            <span className="text-indigo-400 text-lg">f(x)</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-sm sm:text-base text-white">
              {formula}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurrence relation */}
      <div className="text-center">
        <p className="text-xs text-slate-500 font-mono tracking-wide">
          dp[i] = dp[i-1] + dp[i-2] &nbsp; | &nbsp; dp[0] = 0, dp[1] = 1
        </p>
      </div>

      {/* Cell grid */}
      {cells.length > 0 && (
        <div className="relative w-full" id="fib-cell-container">
          {renderArrows()}
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatePresence>
              {cells.map((cell) => (
                <motion.div
                  key={cell.index}
                  layoutId={`fib-cell-${cell.index}`}
                  id={`fib-cell-${cell.index}`}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: cell.state === "active" ? 1.1 : 1,
                    y: 0,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    delay: cell.index * 0.03,
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  {/* Index label */}
                  <span className="text-[10px] font-mono text-slate-500">
                    {cell.index}
                  </span>

                  {/* Cell box */}
                  <motion.div
                    animate={{
                      scale: cell.state === "active" ? [1, 1.08, 1] : 1,
                      boxShadow:
                        cell.state === "active"
                          ? [
                              "0 0 0px rgba(99,102,241,0)",
                              "0 0 20px rgba(99,102,241,0.6)",
                              "0 0 10px rgba(99,102,241,0.3)",
                            ]
                          : "0 0 0px rgba(99,102,241,0)",
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: cell.state === "active" ? Infinity : 0,
                      repeatType: "reverse",
                    }}
                    className={`
                      w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2
                      flex items-center justify-center
                      font-mono text-base sm:text-lg font-bold
                      transition-colors duration-300
                      ${cellColorClass(cell.state)}
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {cell.value !== null && (
                        <motion.span
                          key={cell.value}
                          initial={{ opacity: 0, scale: 0.3, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{
                            type: "spring",
                            damping: 12,
                            stiffness: 200,
                          }}
                        >
                          {cell.value}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* State indicator dot */}
                  <motion.div
                    animate={{
                      opacity: cell.state !== "default" ? 1 : 0,
                      scale: cell.state !== "default" ? 1 : 0,
                    }}
                    className={`w-1.5 h-1.5 rounded-full ${
                      cell.state === "active"
                        ? "bg-indigo-400"
                        : cell.state === "source"
                          ? "bg-amber-400"
                          : cell.state === "computed"
                            ? "bg-emerald-400"
                            : "bg-transparent"
                    }`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {cells.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="text-6xl mb-4 opacity-30">🌀</div>
          <p className="text-slate-500 text-sm">
            Set a value for <span className="font-mono text-slate-400">n</span>{" "}
            and press <span className="text-indigo-400 font-medium">Start</span>{" "}
            to visualize the Fibonacci sequence.
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {[
          { label: "Default", cls: "bg-[#1e1e2e] border-[#2a2a3e]" },
          { label: "Active", cls: "bg-indigo-500 border-indigo-400" },
          { label: "Source (i-1, i-2)", cls: "bg-amber-500/50 border-amber-400/50" },
          { label: "Computed", cls: "bg-emerald-500/20 border-emerald-500/50" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded border-2 ${item.cls}`}
            />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AlgoLayout
      title="Fibonacci"
      icon="🌀"
      description="Visualize the tabulation approach to computing Fibonacci numbers using dynamic programming. Watch how each value is built from the two preceding values."
      complexity="Time: O(n) | Space: O(n)"
      controls={controls}
    >
      {visualization}
    </AlgoLayout>
  );
}
