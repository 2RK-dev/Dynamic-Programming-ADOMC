"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import AlgoLayout from "@/components/AlgoLayout";

interface Item {
  name: string;
  weight: number;
  value: number;
  color: string;
}

const ITEMS: Item[] = [
  { name: "Phone", weight: 1, value: 6, color: "from-blue-500 to-cyan-500" },
  { name: "Book", weight: 2, value: 10, color: "from-emerald-500 to-green-500" },
  { name: "Laptop", weight: 3, value: 12, color: "from-purple-500 to-violet-500" },
  { name: "Camera", weight: 2, value: 8, color: "from-amber-500 to-orange-500" },
];

type CellState = "default" | "active" | "comparing" | "computed" | "optimal";

export default function KnapsackPage() {
  const [capacity, setCapacity] = useState(7);
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [dp, setDp] = useState<number[][]>([]);
  const [cellStates, setCellStates] = useState<CellState[][]>([]);
  const [currentRow, setCurrentRow] = useState(-1);
  const [stepInfo, setStepInfo] = useState("");
  const [formula, setFormula] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [optimalItems, setOptimalItems] = useState<number[]>([]);

  const cancelRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, ms);
      const check = setInterval(() => {
        if (cancelRef.current) {
          clearTimeout(timer);
          clearInterval(check);
          resolve();
        }
      }, 50);
    });

  const initTable = useCallback(() => {
    const n = ITEMS.length;
    const W = capacity;
    const newDp: number[][] = Array.from({ length: n + 1 }, () =>
      Array(W + 1).fill(0)
    );
    const newStates: CellState[][] = Array.from({ length: n + 1 }, () =>
      Array(W + 1).fill("default" as CellState)
    );
    setDp(newDp);
    setCellStates(newStates);
    setCurrentRow(-1);
    setStepInfo("");
    setFormula("");
    setIsComplete(false);
    setOptimalItems([]);
    return { newDp, newStates };
  }, [capacity]);

  const handleReset = () => {
    cancelRef.current = true;
    setTimeout(() => {
      cancelRef.current = false;
      setIsRunning(false);
      setDp([]);
      setCellStates([]);
      setCurrentRow(-1);
      setStepInfo("");
      setFormula("");
      setIsComplete(false);
      setOptimalItems([]);
    }, 100);
  };

  const handleStart = async () => {
    if (isRunning) return;
    cancelRef.current = false;
    setIsRunning(true);
    setIsComplete(false);
    setOptimalItems([]);

    const n = ITEMS.length;
    const W = capacity;
    const { newDp, newStates } = initTable();

    // Mark row 0 as computed (base case)
    for (let w = 0; w <= W; w++) {
      newStates[0][w] = "computed";
    }
    setCellStates([...newStates.map((r) => [...r])]);
    setStepInfo("Base case: row 0 initialized to 0");
    await sleep(speedRef.current);

    if (cancelRef.current) {
      setIsRunning(false);
      return;
    }

    // Fill table row by row
    for (let i = 1; i <= n; i++) {
      if (cancelRef.current) break;
      const item = ITEMS[i - 1];
      setCurrentRow(i);

      for (let w = 0; w <= W; w++) {
        if (cancelRef.current) break;

        // Highlight active cell
        newStates[i][w] = "active";
        setCellStates([...newStates.map((r) => [...r])]);

        const excludeVal = newDp[i - 1][w];

        if (item.weight <= w) {
          const includeVal = newDp[i - 1][w - item.weight] + item.value;

          // Highlight the two cells being compared
          const prevStateIW = newStates[i - 1][w];
          const prevStateIWi = newStates[i - 1][w - item.weight];
          newStates[i - 1][w] = "comparing";
          newStates[i - 1][w - item.weight] = "comparing";
          setCellStates([...newStates.map((r) => [...r])]);

          setFormula(
            `max(dp[${i - 1}][${w}], dp[${i - 1}][${w - item.weight}] + ${item.value}) = max(${excludeVal}, ${includeVal}) = ${Math.max(excludeVal, includeVal)}`
          );
          setStepInfo(
            `Item "${item.name}" (w=${item.weight}, v=${item.value}), capacity=${w}: ${includeVal > excludeVal ? "INCLUDE" : excludeVal > includeVal ? "EXCLUDE" : "EITHER"}`
          );

          await sleep(speedRef.current);
          if (cancelRef.current) break;

          newDp[i][w] = Math.max(excludeVal, includeVal);

          // Restore compared cells
          newStates[i - 1][w] = prevStateIW;
          newStates[i - 1][w - item.weight] = prevStateIWi;
        } else {
          newDp[i][w] = excludeVal;
          setFormula(`dp[${i}][${w}] = dp[${i - 1}][${w}] = ${excludeVal}`);
          setStepInfo(
            `Item "${item.name}" (w=${item.weight}) too heavy for capacity ${w}, skip`
          );

          await sleep(speedRef.current);
          if (cancelRef.current) break;
        }

        newStates[i][w] = "computed";
        setDp([...newDp.map((r) => [...r])]);
        setCellStates([...newStates.map((r) => [...r])]);
      }
    }

    if (cancelRef.current) {
      setIsRunning(false);
      return;
    }

    // Backtracking to find optimal items
    setStepInfo("Backtracking to find optimal items...");
    setFormula("");
    await sleep(speedRef.current * 2);

    const selected: number[] = [];
    let w = W;
    for (let i = n; i >= 1; i--) {
      if (cancelRef.current) break;
      if (newDp[i][w] !== newDp[i - 1][w]) {
        selected.push(i);
        newStates[i][w] = "optimal";
        setCellStates([...newStates.map((r) => [...r])]);
        setStepInfo(
          `Item "${ITEMS[i - 1].name}" is selected (row ${i}, col ${w})`
        );
        await sleep(speedRef.current);
        w -= ITEMS[i - 1].weight;
      }
    }

    if (!cancelRef.current) {
      setOptimalItems(selected);
      setCurrentRow(-1);
      setStepInfo(
        `Optimal value: ${newDp[n][capacity]}. Selected: ${selected.map((i) => ITEMS[i - 1].name).join(", ")}`
      );
      setFormula("");
      setIsComplete(true);
    }

    setIsRunning(false);
  };

  const getCellBg = (state: CellState) => {
    switch (state) {
      case "active":
        return "bg-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.6)]";
      case "comparing":
        return "bg-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]";
      case "computed":
        return "bg-purple-500/20";
      case "optimal":
        return "bg-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.5)]";
      default:
        return "bg-[#1e1e2e]";
    }
  };

  const controls = (
    <div className="space-y-5">
      {/* Capacity */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Capacity (W)
        </label>
        <input
          type="number"
          min={1}
          max={15}
          value={capacity}
          disabled={isRunning}
          onChange={(e) =>
            setCapacity(Math.max(1, Math.min(15, Number(e.target.value))))
          }
          className="w-full rounded-lg bg-[#1e1e2e] border border-[#2a2a3e] px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
        />
      </div>

      {/* Items */}
      <div>
        <label className="block text-xs text-slate-400 mb-2">Items</label>
        <div className="space-y-2">
          {ITEMS.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-lg border border-[#2a2a3e] p-2.5 bg-gradient-to-r ${item.color} bg-opacity-10 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-[#12121a]/85" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {item.name}
                </span>
                <div className="flex gap-2 text-xs">
                  <span className="text-slate-400">
                    w=<span className="text-blue-400">{item.weight}</span>
                  </span>
                  <span className="text-slate-400">
                    v=<span className="text-emerald-400">{item.value}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Speed */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Speed: {speed}ms
        </label>
        <input
          type="range"
          min={50}
          max={800}
          step={50}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? "Running..." : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-lg bg-[#1e1e2e] text-slate-400 text-sm font-medium hover:text-white hover:bg-[#2a2a3e] transition"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <AlgoLayout
      title="0/1 Knapsack"
      icon="🎒"
      description="Given items with weight and value, maximize total value within a limited capacity."
      complexity="Time: O(n * W) | Space: O(n * W)"
      controls={controls}
    >
      <div className="space-y-4">
        {/* Formula display */}
        <AnimatePresence mode="wait">
          {formula && (
            <motion.div
              key={formula}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-2.5 rounded-lg bg-[#1e1e2e] border border-purple-500/20 font-mono text-xs text-purple-300 text-center"
            >
              {formula}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step info */}
        <AnimatePresence mode="wait">
          {stepInfo && (
            <motion.div
              key={stepInfo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-slate-300 text-center"
            >
              {stepInfo}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decision formula label */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-slate-500 font-mono"
          >
            dp[i][w] = max(dp[i-1][w], dp[i-1][w-w<sub>i</sub>] + v<sub>i</sub>)
          </motion.div>
        )}

        {/* DP Table */}
        {dp.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="overflow-x-auto"
          >
            <div className="inline-flex flex-col gap-1 min-w-fit">
              {/* Column headers (capacity) */}
              <div className="flex gap-1 ml-[104px]">
                {Array.from({ length: capacity + 1 }, (_, w) => (
                  <div
                    key={`cap-${w}`}
                    className="w-14 h-7 flex items-center justify-center text-xs font-mono text-slate-500"
                  >
                    w={w}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {dp.map((row, i) => (
                <div key={`row-${i}`} className="flex gap-1 items-center">
                  {/* Row header */}
                  <div className="w-[100px] flex-shrink-0 flex items-center gap-1.5 pr-1">
                    {i === 0 ? (
                      <span className="text-xs text-slate-500 font-mono truncate">
                        {} (base)
                      </span>
                    ) : (
                      <motion.div
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium truncate transition-colors duration-300 ${
                          currentRow === i
                            ? "bg-purple-500/20 text-purple-300"
                            : optimalItems.includes(i)
                              ? "bg-rose-500/20 text-rose-300"
                              : "text-slate-400"
                        }`}
                        animate={
                          currentRow === i
                            ? { scale: [1, 1.05, 1] }
                            : { scale: 1 }
                        }
                        transition={{ repeat: currentRow === i ? Infinity : 0, duration: 1.5 }}
                      >
                        <span className="text-[10px] text-slate-600">
                          {i}.
                        </span>
                        {ITEMS[i - 1].name}
                      </motion.div>
                    )}
                  </div>

                  {/* Cells */}
                  {row.map((val, w) => (
                    <motion.div
                      key={`cell-${i}-${w}`}
                      className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center border border-[#2a2a3e]/50 transition-colors duration-200 ${getCellBg(cellStates[i]?.[w] ?? "default")}`}
                      initial={false}
                      animate={{
                        scale:
                          cellStates[i]?.[w] === "active"
                            ? 1.1
                            : cellStates[i]?.[w] === "optimal"
                              ? 1.05
                              : 1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <span
                        className={`text-sm font-bold font-mono ${
                          cellStates[i]?.[w] === "active"
                            ? "text-white"
                            : cellStates[i]?.[w] === "comparing"
                              ? "text-amber-200"
                              : cellStates[i]?.[w] === "optimal"
                                ? "text-rose-200"
                                : cellStates[i]?.[w] === "computed"
                                  ? "text-purple-200"
                                  : "text-slate-600"
                        }`}
                      >
                        {cellStates[i]?.[w] !== "default" ? val : ""}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {dp.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-slate-500"
          >
            <span className="text-5xl mb-4">🎒</span>
            <p className="text-sm">
              Press <span className="text-purple-400 font-semibold">Start</span>{" "}
              to visualize the 0/1 Knapsack algorithm
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Items will be packed optimally into a knapsack of capacity{" "}
              <span className="text-white font-mono">{capacity}</span>
            </p>
          </motion.div>
        )}

        {/* Result summary */}
        <AnimatePresence>
          {isComplete && dp.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-rose-500/10 border border-purple-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Optimal Value:{" "}
                    <span className="text-purple-400 text-lg">
                      {dp[ITEMS.length]?.[capacity] ?? 0}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Selected items:{" "}
                    {optimalItems
                      .sort((a, b) => a - b)
                      .map((i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 mr-1 rounded bg-rose-500/20 text-rose-300 font-medium"
                        >
                          {ITEMS[i - 1].name} (w={ITEMS[i - 1].weight}, v=
                          {ITEMS[i - 1].value})
                        </span>
                      ))}
                  </p>
                </div>
                <div className="text-3xl">
                  {dp[ITEMS.length]?.[capacity] >=
                  ITEMS.reduce((s, it) => s + it.value, 0)
                    ? "🏆"
                    : "✅"}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AlgoLayout>
  );
}
