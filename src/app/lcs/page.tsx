"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import AlgoLayout from "@/components/AlgoLayout";

type CellState =
  | "default"
  | "active"
  | "match"
  | "no-match"
  | "computed"
  | "path";

interface CellInfo {
  value: number;
  state: CellState;
}

export default function LCSPage() {
  const [stringA, setStringA] = useState("ABCBDAB");
  const [stringB, setStringB] = useState("BDCAB");
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  const [dp, setDp] = useState<CellInfo[][]>([]);
  const [activeRow, setActiveRow] = useState(-1);
  const [activeCol, setActiveCol] = useState(-1);
  const [comparison, setComparison] = useState("");
  const [formula, setFormula] = useState("");
  const [lcsResult, setLcsResult] = useState<string[]>([]);
  const [highlightedHeaderRow, setHighlightedHeaderRow] = useState(-1);
  const [highlightedHeaderCol, setHighlightedHeaderCol] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);

  const cancelRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const check = () => {
        if (cancelRef.current) {
          resolve();
          return;
        }
        if (Date.now() - start >= ms) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });

  const initTable = useCallback(
    (a: string, b: string): CellInfo[][] => {
      const rows = a.length + 1;
      const cols = b.length + 1;
      const table: CellInfo[][] = [];
      for (let i = 0; i < rows; i++) {
        table[i] = [];
        for (let j = 0; j < cols; j++) {
          table[i][j] = { value: 0, state: "default" };
        }
      }
      return table;
    },
    []
  );

  const runLCS = async () => {
    cancelRef.current = false;
    setIsRunning(true);
    setIsComplete(false);
    setLcsResult([]);
    setComparison("");
    setFormula("");

    const a = stringA;
    const b = stringB;
    const m = a.length;
    const n = b.length;

    const table = initTable(a, b);
    setDp(table.map((row) => row.map((cell) => ({ ...cell }))));

    await sleep(speedRef.current);

    // Fill the DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (cancelRef.current) {
          setIsRunning(false);
          return;
        }

        // Highlight current cell and headers
        setActiveRow(i);
        setActiveCol(j);
        setHighlightedHeaderRow(i);
        setHighlightedHeaderCol(j);

        const charA = a[i - 1];
        const charB = b[j - 1];
        setComparison(`A[${i}]='${charA}' vs B[${j}]='${charB}'`);

        // Mark active
        table[i][j] = { ...table[i][j], state: "active" };
        setDp(table.map((row) => row.map((cell) => ({ ...cell }))));
        await sleep(speedRef.current);

        if (cancelRef.current) {
          setIsRunning(false);
          return;
        }

        if (charA === charB) {
          // Match
          table[i][j] = {
            value: table[i - 1][j - 1].value + 1,
            state: "match",
          };
          setFormula(`dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${table[i][j].value}`);
          setDp(table.map((row) => row.map((cell) => ({ ...cell }))));
          await sleep(speedRef.current * 1.5);

          if (cancelRef.current) {
            setIsRunning(false);
            return;
          }

          // Transition to computed with match tint
          table[i][j] = { ...table[i][j], state: "computed" };
        } else {
          // No match
          const top = table[i - 1][j].value;
          const left = table[i][j - 1].value;
          table[i][j] = {
            value: Math.max(top, left),
            state: "no-match",
          };
          setFormula(
            `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${top}, ${left}) = ${table[i][j].value}`
          );
          setDp(table.map((row) => row.map((cell) => ({ ...cell }))));
          await sleep(speedRef.current * 0.8);

          if (cancelRef.current) {
            setIsRunning(false);
            return;
          }

          table[i][j] = { ...table[i][j], state: "computed" };
        }

        setDp(table.map((row) => row.map((cell) => ({ ...cell }))));
      }
    }

    if (cancelRef.current) {
      setIsRunning(false);
      return;
    }

    // Clear active highlights
    setActiveRow(-1);
    setActiveCol(-1);
    setHighlightedHeaderRow(-1);
    setHighlightedHeaderCol(-1);
    setComparison("");
    setFormula(`LCS Length = ${table[m][n].value}`);

    await sleep(speedRef.current * 2);

    if (cancelRef.current) {
      setIsRunning(false);
      return;
    }

    // Backtrack to find LCS path
    const pathCells: [number, number][] = [];
    const lcsChars: string[] = [];
    let i = m;
    let j = n;

    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        pathCells.push([i, j]);
        lcsChars.push(a[i - 1]);
        i--;
        j--;
      } else if (table[i - 1][j].value > table[i][j - 1].value) {
        i--;
      } else {
        j--;
      }
    }

    pathCells.reverse();
    lcsChars.reverse();

    // Animate path highlight
    for (const [pi, pj] of pathCells) {
      if (cancelRef.current) {
        setIsRunning(false);
        return;
      }
      table[pi][pj] = { ...table[pi][pj], state: "path" };
      setDp(table.map((row) => row.map((cell) => ({ ...cell }))));
      await sleep(speedRef.current);
    }

    if (cancelRef.current) {
      setIsRunning(false);
      return;
    }

    setFormula(`LCS = "${lcsChars.join("")}" (length ${lcsChars.length})`);

    // Animate LCS result characters one by one
    for (let k = 0; k < lcsChars.length; k++) {
      if (cancelRef.current) {
        setIsRunning(false);
        return;
      }
      setLcsResult((prev) => [...prev, lcsChars[k]]);
      await sleep(speedRef.current * 0.6);
    }

    setIsComplete(true);
    setIsRunning(false);
  };

  const handleReset = () => {
    cancelRef.current = true;
    setIsRunning(false);
    setDp([]);
    setActiveRow(-1);
    setActiveCol(-1);
    setHighlightedHeaderRow(-1);
    setHighlightedHeaderCol(-1);
    setComparison("");
    setFormula("");
    setLcsResult([]);
    setIsComplete(false);
  };

  const getCellBg = (state: CellState) => {
    switch (state) {
      case "active":
        return "bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.6)]";
      case "match":
        return "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]";
      case "no-match":
        return "bg-slate-700/50";
      case "computed":
        return "bg-pink-500/10";
      case "path":
        return "bg-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.4)] ring-1 ring-pink-400/50";
      default:
        return "bg-[#1e1e2e]";
    }
  };

  const controls = (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          String A
        </label>
        <input
          type="text"
          value={stringA}
          onChange={(e) => setStringA(e.target.value.toUpperCase())}
          disabled={isRunning}
          className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
          placeholder="e.g. ABCBDAB"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          String B
        </label>
        <input
          type="text"
          value={stringB}
          onChange={(e) => setStringB(e.target.value.toUpperCase())}
          disabled={isRunning}
          className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50"
          placeholder="e.g. BDCAB"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Vitesse: {speed}ms
        </label>
        <input
          type="range"
          min={50}
          max={800}
          step={50}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-pink-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Rapide</span>
          <span>Lent</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={runLCS}
          disabled={isRunning || !stringA || !stringB}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/20"
        >
          {isRunning ? "En cours..." : "Demarrer"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-[#1e1e2e] hover:bg-[#2a2a3a] border border-[#2e2e3e] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <AlgoLayout
      title="Longest Common Subsequence"
      icon="🔗"
      description="Trouver la plus longue sous-sequence commune a deux chaines de caracteres."
      complexity="Time: O(m*n) | Space: O(m*n)"
      controls={controls}
    >
      <div className="space-y-6">
        {/* Status bar */}
        <AnimatePresence mode="wait">
          {(comparison || formula) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              {comparison && (
                <motion.span
                  key={comparison}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-mono px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-300 border border-pink-500/20"
                >
                  {comparison}
                </motion.span>
              )}
              {formula && (
                <motion.span
                  key={formula}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="font-mono px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-600/30"
                >
                  {formula}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* DP Table */}
        {dp.length > 0 && (
          <div className="overflow-auto">
            <div className="inline-block">
              {/* Column headers (String B) */}
              <div className="flex">
                {/* Top-left empty corner */}
                <div className="w-14 h-14 flex-shrink-0" />
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-slate-500 font-mono">""</span>
                </div>
                {stringB.split("").map((char, j) => (
                  <motion.div
                    key={`col-header-${j}`}
                    className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                      highlightedHeaderCol === j + 1
                        ? "bg-pink-400/20 text-pink-300"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">{char}</span>
                  </motion.div>
                ))}
              </div>

              {/* Rows */}
              {dp.map((row, i) => (
                <div key={`row-${i}`} className="flex">
                  {/* Row header */}
                  <motion.div
                    className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                      highlightedHeaderRow === i
                        ? "bg-pink-400/20 text-pink-300"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">
                      {i === 0 ? '""' : stringA[i - 1]}
                    </span>
                  </motion.div>

                  {/* Cells */}
                  {row.map((cell, j) => {
                    const isActive = i === activeRow && j === activeCol;
                    return (
                      <motion.div
                        key={`cell-${i}-${j}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: 1,
                          scale: isActive ? 1.1 : 1,
                        }}
                        transition={{
                          duration: 0.2,
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg m-[1px] text-sm font-mono font-semibold transition-all duration-300 ${getCellBg(
                          cell.state
                        )} ${
                          cell.state === "active" || cell.state === "match"
                            ? "text-white"
                            : cell.state === "path"
                            ? "text-pink-200"
                            : cell.state === "no-match"
                            ? "text-slate-400"
                            : cell.state === "computed"
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {cell.state !== "default" ? cell.value : ""}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LCS Result */}
        <AnimatePresence>
          {lcsResult.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20"
            >
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                Longest Common Subsequence
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {lcsResult.map((char, idx) => (
                  <motion.span
                    key={`lcs-char-${idx}`}
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold text-lg font-mono shadow-lg shadow-pink-500/30"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              {isComplete && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 text-sm text-slate-400"
                >
                  Longueur: <span className="text-pink-400 font-semibold">{lcsResult.length}</span>
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {dp.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-slate-500"
          >
            <span className="text-5xl mb-4">🔗</span>
            <p className="text-sm">
              Configurez les chaines et cliquez sur <span className="text-pink-400 font-medium">Demarrer</span> pour visualiser l&apos;algorithme LCS.
            </p>
          </motion.div>
        )}
      </div>
    </AlgoLayout>
  );
}
