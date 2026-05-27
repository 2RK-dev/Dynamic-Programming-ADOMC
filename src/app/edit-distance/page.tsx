"use client";

import { motion, AnimatePresence } from "framer-motion";
import AlgoLayout from "@/components/AlgoLayout";
import { useState, useRef, useCallback } from "react";

type CellState =
  | "default"
  | "active"
  | "delete-source"
  | "insert-source"
  | "replace-source"
  | "computed"
  | "path";

type Operation = "insert" | "delete" | "replace" | "match" | "none";

interface CellData {
  value: number;
  state: CellState;
  operation: Operation;
}

interface EditOp {
  type: Operation;
  fromChar: string;
  toChar: string;
  i: number;
  j: number;
}

const OP_ICONS: Record<Operation, string> = {
  insert: "➕",
  delete: "🗑️",
  replace: "🔄",
  match: "✅",
  none: "",
};

const OP_LABELS: Record<Operation, string> = {
  insert: "Insert",
  delete: "Delete",
  replace: "Replace",
  match: "Match",
  none: "",
};

const OP_COLORS: Record<Operation, string> = {
  insert: "from-blue-500 to-cyan-500",
  delete: "from-red-500 to-rose-500",
  replace: "from-amber-500 to-orange-500",
  match: "from-green-500 to-emerald-500",
  none: "from-slate-500 to-slate-600",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function EditDistancePage() {
  const [source, setSource] = useState("kitten");
  const [target, setTarget] = useState("sitting");
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [dp, setDp] = useState<CellData[][] | null>(null);
  const [currentFormula, setCurrentFormula] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [currentOp, setCurrentOp] = useState<{
    type: Operation;
    icon: string;
  } | null>(null);
  const [editOps, setEditOps] = useState<EditOp[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const cancelRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const getDelay = useCallback(() => speedRef.current, []);

  const initGrid = useCallback(
    (s: string, t: string): CellData[][] => {
      const rows = s.length + 1;
      const cols = t.length + 1;
      const grid: CellData[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
          value: -1,
          state: "default" as CellState,
          operation: "none" as Operation,
        }))
      );
      return grid;
    },
    []
  );

  const updateCell = useCallback(
    (
      prev: CellData[][],
      i: number,
      j: number,
      updates: Partial<CellData>
    ): CellData[][] => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      next[i][j] = { ...next[i][j], ...updates };
      return next;
    },
    []
  );

  const setCellState = useCallback(
    (
      prev: CellData[][],
      i: number,
      j: number,
      state: CellState
    ): CellData[][] => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      next[i][j] = { ...next[i][j], state };
      return next;
    },
    []
  );

  const clearHighlights = useCallback((grid: CellData[][]): CellData[][] => {
    return grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        state:
          cell.state === "path"
            ? "path"
            : cell.value >= 0
            ? "computed"
            : "default",
      }))
    );
  }, []);

  const runAlgorithm = useCallback(async () => {
    const s = source;
    const t = target;
    cancelRef.current = false;
    setIsRunning(true);
    setIsComplete(false);
    setEditOps([]);
    setCurrentFormula("");
    setCurrentStep("");
    setCurrentOp(null);

    let grid = initGrid(s, t);
    setDp([...grid]);

    // Initialize first row
    for (let j = 0; j <= t.length; j++) {
      if (cancelRef.current) return;
      grid = updateCell(grid, 0, j, {
        value: j,
        state: "active",
        operation: j === 0 ? "none" : "insert",
      });
      setDp([...grid]);
      setCurrentStep(
        j === 0
          ? 'Base case: dp[0][0] = 0 (empty to empty)'
          : `Base case: dp[0][${j}] = ${j} (insert ${j} chars)`
      );
      await sleep(getDelay() * 0.5);
      grid = setCellState(grid, 0, j, "computed");
      setDp([...grid]);
    }

    // Initialize first column
    for (let i = 1; i <= s.length; i++) {
      if (cancelRef.current) return;
      grid = updateCell(grid, i, 0, {
        value: i,
        state: "active",
        operation: "delete",
      });
      setDp([...grid]);
      setCurrentStep(`Base case: dp[${i}][0] = ${i} (delete ${i} chars)`);
      await sleep(getDelay() * 0.5);
      grid = setCellState(grid, i, 0, "computed");
      setDp([...grid]);
    }

    // Fill the rest of the grid
    for (let i = 1; i <= s.length; i++) {
      for (let j = 1; j <= t.length; j++) {
        if (cancelRef.current) return;

        // Clear previous highlights
        grid = clearHighlights(grid);

        const charS = s[i - 1];
        const charT = t[j - 1];
        const cost = charS === charT ? 0 : 1;

        // Highlight the three source cells
        grid = setCellState(grid, i - 1, j, "delete-source"); // top: delete
        grid = setCellState(grid, i, j - 1, "insert-source"); // left: insert
        grid = setCellState(grid, i - 1, j - 1, "replace-source"); // diagonal: replace/match

        // Mark current cell as active
        grid = updateCell(grid, i, j, { value: -1, state: "active" });
        setDp([...grid]);

        setCurrentStep(
          `Comparing s[${i}]='${charS}' with t[${j}]='${charT}' ${
            charS === charT ? "(match!)" : "(different)"
          }`
        );

        const deleteCost = grid[i - 1][j].value + 1;
        const insertCost = grid[i][j - 1].value + 1;
        const replaceCost = grid[i - 1][j - 1].value + cost;

        setCurrentFormula(
          `dp[${i}][${j}] = min(${deleteCost}, ${insertCost}, ${replaceCost}) = min(dp[${i - 1}][${j}]+1, dp[${i}][${j - 1}]+1, dp[${i - 1}][${j - 1}]+${cost})`
        );

        await sleep(getDelay());

        const minVal = Math.min(deleteCost, insertCost, replaceCost);

        let op: Operation = "none";
        if (minVal === replaceCost && cost === 0) {
          op = "match";
        } else if (minVal === replaceCost) {
          op = "replace";
        } else if (minVal === deleteCost) {
          op = "delete";
        } else {
          op = "insert";
        }

        setCurrentOp({ type: op, icon: OP_ICONS[op] });

        grid = clearHighlights(grid);
        grid = updateCell(grid, i, j, {
          value: minVal,
          state: "active",
          operation: op,
        });
        setDp([...grid]);

        await sleep(getDelay() * 0.4);

        grid = setCellState(grid, i, j, "computed");
        setDp([...grid]);
      }
    }

    // Backtrack to find the optimal edit path
    setCurrentStep("Backtracking to find optimal edit sequence...");
    setCurrentFormula("");
    setCurrentOp(null);
    await sleep(getDelay());

    const ops: EditOp[] = [];
    let bi = s.length;
    let bj = t.length;

    grid = grid.map((row) =>
      row.map((cell) => ({ ...cell, state: "computed" as CellState }))
    );

    while (bi > 0 || bj > 0) {
      if (cancelRef.current) return;

      grid = setCellState(grid, bi, bj, "path");
      setDp([...grid]);

      if (bi > 0 && bj > 0 && s[bi - 1] === t[bj - 1]) {
        ops.unshift({
          type: "match",
          fromChar: s[bi - 1],
          toChar: t[bj - 1],
          i: bi,
          j: bj,
        });
        bi--;
        bj--;
      } else if (
        bi > 0 &&
        bj > 0 &&
        grid[bi][bj].value === grid[bi - 1][bj - 1].value + 1
      ) {
        ops.unshift({
          type: "replace",
          fromChar: s[bi - 1],
          toChar: t[bj - 1],
          i: bi,
          j: bj,
        });
        bi--;
        bj--;
      } else if (bi > 0 && grid[bi][bj].value === grid[bi - 1][bj].value + 1) {
        ops.unshift({
          type: "delete",
          fromChar: s[bi - 1],
          toChar: "",
          i: bi,
          j: bj,
        });
        bi--;
      } else {
        ops.unshift({
          type: "insert",
          fromChar: "",
          toChar: t[bj - 1],
          i: bi,
          j: bj,
        });
        bj--;
      }

      await sleep(getDelay() * 0.6);
    }

    grid = setCellState(grid, 0, 0, "path");
    setDp([...grid]);

    setEditOps(ops);
    setCurrentStep(
      `Complete! Edit distance: ${grid[s.length][t.length].value} operation${
        grid[s.length][t.length].value !== 1 ? "s" : ""
      }`
    );
    setCurrentFormula("");
    setIsComplete(true);
    setIsRunning(false);
  }, [source, target, initGrid, updateCell, setCellState, clearHighlights, getDelay]);

  const handleReset = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setDp(null);
    setCurrentFormula("");
    setCurrentStep("");
    setCurrentOp(null);
    setEditOps([]);
    setIsComplete(false);
  }, []);

  const getCellBg = (state: CellState): string => {
    switch (state) {
      case "active":
        return "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]";
      case "delete-source":
        return "bg-red-400/50";
      case "insert-source":
        return "bg-blue-400/50";
      case "replace-source":
        return "bg-amber-400/50";
      case "computed":
        return "bg-orange-500/10";
      case "path":
        return "bg-gradient-to-br from-red-500 to-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]";
      default:
        return "bg-[#1e1e2e]";
    }
  };

  const sourceChars = ["", ...source.split("")];
  const targetChars = ["", ...target.split("")];

  const controls = (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Source String
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => !isRunning && setSource(e.target.value)}
          disabled={isRunning}
          className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 disabled:opacity-50 font-mono"
          placeholder="kitten"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Target String
        </label>
        <input
          type="text"
          value={target}
          onChange={(e) => !isRunning && setTarget(e.target.value)}
          disabled={isRunning}
          className="w-full bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 disabled:opacity-50 font-mono"
          placeholder="sitting"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Speed:{" "}
          <span className="text-white">
            {speed < 150 ? "Fast" : speed < 400 ? "Medium" : "Slow"}
          </span>
        </label>
        <input
          type="range"
          min={50}
          max={800}
          step={50}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-red-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={runAlgorithm}
          disabled={isRunning || !source || !target}
          className="flex-1 py-2.5 px-4 rounded bg-[#d4a574] text-[#0c0c0e] text-sm font-medium hover:bg-[#c49564] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? "Running..." : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="py-2.5 px-4 rounded border border-[#27272a] text-[#a1a1aa] text-sm font-medium hover:border-[#3f3f46] hover:text-[#fafafa] transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-[#1e1e2e]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Legend
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="text-slate-400">Active cell</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400/50" />
            <span className="text-slate-400">Delete (top)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-400/50" />
            <span className="text-slate-400">Insert (left)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-400/50" />
            <span className="text-slate-400">Replace/Match (diag)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/10 border border-orange-500/20" />
            <span className="text-slate-400">Computed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-red-500 to-orange-500" />
            <span className="text-slate-400">Optimal path</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AlgoLayout
      title="Edit Distance"
      icon="✏️"
      description="Minimum number of operations (insert, delete, replace) to transform one string into another. Also known as the Levenshtein distance."
      complexity="Time: O(m * n) | Space: O(m * n)"
      controls={controls}
    >
      <div className="space-y-6">
        {/* Status bar */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-xl bg-[#1e1e2e] border border-[#2e2e3e] p-4 space-y-2"
            >
              <div className="flex items-center gap-3">
                {currentOp && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg"
                  >
                    {currentOp.icon}
                  </motion.span>
                )}
                <p className="text-sm text-slate-300">{currentStep}</p>
                {currentOp && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${
                      OP_COLORS[currentOp.type]
                    } text-white`}
                  >
                    {OP_LABELS[currentOp.type]}
                  </motion.span>
                )}
              </div>
              {currentFormula && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono text-slate-500 break-all"
                >
                  {currentFormula}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {dp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            <div className="inline-block">
              {/* Column headers (target chars) */}
              <div className="flex">
                <div className="w-14 h-14 flex-shrink-0" />
                {targetChars.map((ch, j) => (
                  <div
                    key={`col-${j}`}
                    className="w-14 h-10 flex items-center justify-center text-xs font-mono"
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        j === 0
                          ? "text-slate-500"
                          : "text-orange-400 bg-orange-400/10"
                      }`}
                    >
                      {j === 0 ? '""' : ch}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              {dp.map((row, i) => (
                <div key={`row-${i}`} className="flex">
                  {/* Row header (source chars) */}
                  <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-xs font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        i === 0
                          ? "text-slate-500"
                          : "text-red-400 bg-red-400/10"
                      }`}
                    >
                      {i === 0 ? '""' : sourceChars[i]}
                    </span>
                  </div>

                  {/* Cells */}
                  {row.map((cell, j) => (
                    <motion.div
                      key={`cell-${i}-${j}`}
                      layout
                      className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#2a2a3a] m-[1px] text-sm font-mono font-bold transition-colors duration-200 ${getCellBg(
                        cell.state
                      )} ${
                        cell.state === "active"
                          ? "text-white z-10 scale-105"
                          : cell.state === "path"
                          ? "text-white"
                          : cell.state === "computed"
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                      initial={false}
                      animate={{
                        scale: cell.state === "active" ? 1.08 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      {cell.value >= 0 ? cell.value : ""}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Placeholder before start */}
        {!dp && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="text-6xl mb-4"
            >
              ✏️
            </motion.div>
            <p className="text-sm">
              Configure the strings and press{" "}
              <span className="text-red-400 font-semibold">Start</span> to
              visualize
            </p>
          </div>
        )}

        {/* Edit operations sequence */}
        <AnimatePresence>
          {editOps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Optimal Edit Sequence
              </h3>
              <div className="flex flex-wrap gap-2">
                {editOps.map((op, idx) => (
                  <motion.div
                    key={`op-${idx}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: idx * 0.08,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={`relative overflow-hidden rounded-xl border border-[#2e2e3e] bg-[#1e1e2e] p-3 min-w-[100px]`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        OP_COLORS[op.type]
                      } opacity-10`}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{OP_ICONS[op.type]}</span>
                        <span
                          className={`text-xs font-bold bg-gradient-to-r ${
                            OP_COLORS[op.type]
                          } bg-clip-text text-transparent`}
                        >
                          {OP_LABELS[op.type]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {op.type === "match" && (
                          <>
                            &apos;{op.fromChar}&apos; = &apos;{op.toChar}&apos;
                          </>
                        )}
                        {op.type === "replace" && (
                          <>
                            &apos;{op.fromChar}&apos; &rarr; &apos;{op.toChar}
                            &apos;
                          </>
                        )}
                        {op.type === "delete" && (
                          <>del &apos;{op.fromChar}&apos;</>
                        )}
                        {op.type === "insert" && (
                          <>ins &apos;{op.toChar}&apos;</>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              {isComplete && dp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: editOps.length * 0.08 + 0.2 }}
                  className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-4"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    {dp[source.length][target.length].value}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Edit Distance
                    </p>
                    <p className="text-xs text-slate-400">
                      {editOps.filter((o) => o.type !== "match").length}{" "}
                      edit{editOps.filter((o) => o.type !== "match").length !== 1 ? "s" : ""}
                      {" "}needed &mdash;{" "}
                      {editOps.filter((o) => o.type === "match").length} match
                      {editOps.filter((o) => o.type === "match").length !== 1
                        ? "es"
                        : ""}
                      ,{" "}
                      {editOps.filter((o) => o.type === "replace").length}{" "}
                      replace
                      {editOps.filter((o) => o.type === "replace").length !== 1
                        ? "s"
                        : ""}
                      ,{" "}
                      {editOps.filter((o) => o.type === "insert").length} insert
                      {editOps.filter((o) => o.type === "insert").length !== 1
                        ? "s"
                        : ""}
                      ,{" "}
                      {editOps.filter((o) => o.type === "delete").length} delete
                      {editOps.filter((o) => o.type === "delete").length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AlgoLayout>
  );
}
