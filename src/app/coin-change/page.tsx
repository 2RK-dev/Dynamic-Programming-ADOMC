"use client";

import { motion, AnimatePresence } from "framer-motion";
import AlgoLayout from "@/components/AlgoLayout";
import { useState, useRef, useCallback } from "react";

const ALL_COINS = [1, 2, 5, 7, 10];
const DEFAULT_COINS = new Set([1, 5, 7]);
const INF = Infinity;

type CellStatus =
  | "default"
  | "active"
  | "source"
  | "computed"
  | "result";

interface CellState {
  value: number;
  status: CellStatus;
  bounce: boolean;
}

interface DroppingCoin {
  coinValue: number;
  targetIndex: number;
  id: number;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function CoinChangePage() {
  const [amount, setAmount] = useState(11);
  const [selectedCoins, setSelectedCoins] = useState<Set<number>>(
    () => new Set(DEFAULT_COINS)
  );
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [cells, setCells] = useState<CellState[]>([]);
  const [statusText, setStatusText] = useState("");
  const [droppingCoin, setDroppingCoin] = useState<DroppingCoin | null>(null);
  const [resultCoins, setResultCoins] = useState<number[]>([]);
  const [currentComparison, setCurrentComparison] = useState("");

  const cancelRef = useRef(false);
  const coinIdRef = useRef(0);

  const toggleCoin = (coin: number) => {
    setSelectedCoins((prev) => {
      const next = new Set(prev);
      if (next.has(coin)) {
        if (next.size > 1) next.delete(coin);
      } else {
        next.add(coin);
      }
      return next;
    });
  };

  const getDelay = useCallback(() => {
    return Math.max(50, 1050 - speed);
  }, [speed]);

  const reset = () => {
    cancelRef.current = true;
    setIsRunning(false);
    setCells([]);
    setStatusText("");
    setDroppingCoin(null);
    setResultCoins([]);
    setCurrentComparison("");
  };

  const startVisualization = async () => {
    cancelRef.current = false;
    setIsRunning(true);
    setResultCoins([]);
    setCurrentComparison("");
    setDroppingCoin(null);

    const coins = Array.from(selectedCoins).sort((a, b) => a - b);
    const n = amount;

    // Initialize DP array
    const dpValues: number[] = new Array(n + 1).fill(INF);
    dpValues[0] = 0;
    const parent: number[] = new Array(n + 1).fill(-1);
    const coinUsed: number[] = new Array(n + 1).fill(-1);

    const initialCells: CellState[] = dpValues.map((v, i) => ({
      value: v,
      status: i === 0 ? "computed" : "default",
      bounce: false,
    }));
    setCells([...initialCells]);
    setStatusText("Initialized: dp[0] = 0, all others = \u221e");
    await delay(getDelay());

    if (cancelRef.current) return;

    // Main DP loop
    for (let i = 1; i <= n; i++) {
      if (cancelRef.current) return;

      // Highlight current cell as active
      setCells((prev) =>
        prev.map((c, idx) => ({
          ...c,
          status: idx === i ? "active" : c.status === "active" ? "default" : c.status,
          bounce: false,
        }))
      );
      setStatusText(`Computing dp[${i}]...`);
      await delay(getDelay() * 0.6);

      for (const coin of coins) {
        if (cancelRef.current) return;

        if (i >= coin) {
          const sourceIdx = i - coin;

          // Show coin dropping animation
          coinIdRef.current += 1;
          setDroppingCoin({
            coinValue: coin,
            targetIndex: i,
            id: coinIdRef.current,
          });

          // Highlight source cell and clean up stale source highlights
          setCells((prev) =>
            prev.map((c, idx) => {
              if (idx === i) return { ...c, status: "active", bounce: false };
              if (idx === sourceIdx)
                return { ...c, status: "source", bounce: false };
              if (c.status === "source")
                return { ...c, status: "computed", bounce: false };
              return { ...c, bounce: false };
            })
          );

          const candidateVal =
            dpValues[sourceIdx] === INF ? INF : dpValues[sourceIdx] + 1;
          const currentVal = dpValues[i];

          const candidateStr =
            dpValues[sourceIdx] === INF ? "\u221e" : `${dpValues[sourceIdx]}+1`;
          const currentStr = currentVal === INF ? "\u221e" : `${currentVal}`;
          const resultStr = candidateVal === INF ? "\u221e" : `${candidateVal}`;

          setCurrentComparison(
            `dp[${i}] = min(dp[${i}], dp[${i}-${coin}]+1) = min(${currentStr}, ${candidateStr})`
          );
          setStatusText(
            `Using coin ${coin}: dp[${i}] = min(${currentStr}, ${candidateStr}) = ${
              candidateVal < currentVal ? resultStr : currentStr
            }`
          );

          await delay(getDelay());

          if (candidateVal < currentVal) {
            dpValues[i] = candidateVal;
            parent[i] = sourceIdx;
            coinUsed[i] = coin;

            // Animate value update with bounce
            setCells((prev) =>
              prev.map((c, idx) => {
                if (idx === i)
                  return { value: dpValues[i], status: "active", bounce: true };
                if (idx === sourceIdx)
                  return { ...c, status: "source", bounce: false };
                return c;
              })
            );

            await delay(getDelay() * 0.5);
          }

          // Reset source highlight
          setCells((prev) =>
            prev.map((c, idx) => {
              if (idx === sourceIdx && c.status === "source")
                return { ...c, status: "computed", bounce: false };
              return c;
            })
          );

          setDroppingCoin(null);

          if (cancelRef.current) return;
        }
      }

      // Mark cell as computed
      dpValues[i] = dpValues[i]; // ensure fresh
      setCells((prev) =>
        prev.map((c, idx) => {
          if (idx === i)
            return {
              value: dpValues[i],
              status: "computed",
              bounce: false,
            };
          return c;
        })
      );

      await delay(getDelay() * 0.3);
    }

    if (cancelRef.current) return;

    // Backtrack to find coins used
    setStatusText(
      dpValues[n] === INF
        ? `No solution! Cannot make amount ${n} with selected coins.`
        : `Minimum coins needed: ${dpValues[n]}. Backtracking...`
    );
    setCurrentComparison("");

    await delay(getDelay());

    if (dpValues[n] !== INF) {
      const usedCoinsPath: number[] = [];
      const highlightIndices: number[] = [];
      let cur = n;
      while (cur > 0) {
        usedCoinsPath.push(coinUsed[cur]);
        highlightIndices.push(cur);
        cur = parent[cur];
      }
      highlightIndices.push(0);

      // Highlight result path
      setCells((prev) =>
        prev.map((c, idx) => ({
          ...c,
          status: highlightIndices.includes(idx) ? "result" : c.status,
          bounce: highlightIndices.includes(idx),
        }))
      );
      setResultCoins(usedCoinsPath);
      setStatusText(
        `Done! Minimum ${dpValues[n]} coin${
          dpValues[n] > 1 ? "s" : ""
        }: [${usedCoinsPath.join(", ")}]`
      );
    }

    setIsRunning(false);
  };

  const cellBg = (status: CellStatus) => {
    switch (status) {
      case "active":
        return "bg-amber-500 text-white shadow-lg shadow-amber-500/30";
      case "source":
        return "bg-violet-500/50 text-white shadow-lg shadow-violet-500/20";
      case "computed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "result":
        return "bg-pink-500/30 text-pink-200 border-pink-500/50 shadow-lg shadow-pink-500/20";
      default:
        return "bg-[#1e1e2e] text-slate-400 border-[#2a2a3e]";
    }
  };

  const controls = (
    <div className="space-y-5">
      {/* Amount input */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Amount (1-20)
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={amount}
          onChange={(e) =>
            setAmount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
          }
          disabled={isRunning}
          className="w-full rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
        />
      </div>

      {/* Coin denominations */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Coin Denominations
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_COINS.map((coin) => (
            <button
              key={coin}
              onClick={() => toggleCoin(coin)}
              disabled={isRunning}
              className={`
                relative w-11 h-11 rounded-full text-sm font-bold transition-all duration-200
                ${
                  selectedCoins.has(coin)
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                    : "bg-[#1a1a2e] text-slate-500 border border-[#2a2a3e] hover:border-yellow-500/30"
                }
                disabled:cursor-not-allowed
              `}
            >
              {coin}
            </button>
          ))}
        </div>
      </div>

      {/* Speed slider */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Speed
        </label>
        <input
          type="range"
          min={100}
          max={1000}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={startVisualization}
          disabled={isRunning}
          className="flex-1 py-2.5 px-4 rounded bg-[#d4a574] text-[#0c0c0e] text-sm font-medium hover:bg-[#c49564] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? "Running..." : "Start"}
        </button>
        <button
          onClick={reset}
          className="py-2.5 px-4 rounded border border-[#27272a] text-[#a1a1aa] text-sm font-medium hover:border-[#3f3f46] hover:text-[#fafafa] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <AlgoLayout
      title="Coin Change"
      icon="🪙"
      description="Given coin denominations and an amount, find the minimum number of coins needed to make that amount."
      complexity="Time: O(amount * coins)  |  Space: O(amount)"
      controls={controls}
    >
      <div className="space-y-8">
        {/* Status / comparison text */}
        <AnimatePresence mode="wait">
          {statusText && (
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm text-slate-300 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3"
            >
              <p>{statusText}</p>
              {currentComparison && (
                <p className="font-mono text-xs text-amber-400/80 mt-1">
                  {currentComparison}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result coins display */}
        <AnimatePresence>
          {resultCoins.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs text-slate-400 mr-1">Coins used:</span>
              {resultCoins.map((coin, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: i * 0.15,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/30"
                >
                  {coin}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* DP Array visualization */}
        {cells.length > 0 && (
          <div className="overflow-x-auto pb-4">
            <div className="relative inline-flex gap-1.5 min-w-fit">
              {/* Dropping coin animation */}
              <AnimatePresence>
                {droppingCoin && (
                  <motion.div
                    key={droppingCoin.id}
                    initial={{ opacity: 0, y: -50, scale: 0.5 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute z-10 flex items-center justify-center"
                    style={{
                      left: `${droppingCoin.targetIndex * (56 + 6)}px`,
                      top: "-40px",
                      width: "56px",
                    }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-500/40 border-2 border-yellow-200/50">
                      {droppingCoin.coinValue}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {cells.map((cell, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className="flex flex-col items-center gap-1 pt-6"
                >
                  {/* Index label */}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {idx}
                  </span>

                  {/* Cell */}
                  <motion.div
                    animate={
                      cell.bounce
                        ? {
                            scale: [1, 1.25, 1],
                            transition: { duration: 0.35, ease: "easeOut" },
                          }
                        : { scale: 1 }
                    }
                    className={`
                      w-14 h-14 rounded-xl border flex items-center justify-center
                      font-mono font-bold text-sm transition-colors duration-300
                      ${cellBg(cell.status)}
                    `}
                  >
                    {cell.value === INF ? "\u221e" : cell.value}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {cells.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-slate-500"
          >
            <span className="text-5xl mb-4">🪙</span>
            <p className="text-sm">
              Configure parameters and press <strong>Start</strong> to visualize
              the Coin Change algorithm.
            </p>
          </motion.div>
        )}

        {/* Legend */}
        {cells.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 text-xs text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-violet-500/50" />
              <span>Source (dp[i-c])</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
              <span>Computed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-pink-500/30 border border-pink-500/50" />
              <span>Result Path</span>
            </div>
          </motion.div>
        )}
      </div>
    </AlgoLayout>
  );
}
