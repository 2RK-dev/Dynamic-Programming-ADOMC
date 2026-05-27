"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AlgoLayoutProps {
  title: string;
  icon: string;
  description: string;
  complexity: string;
  children: ReactNode;
  controls: ReactNode;
}

export default function AlgoLayout({
  title,
  icon,
  description,
  complexity,
  children,
  controls,
}: AlgoLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{icon}</span>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-slate-400 mb-1">{description}</p>
        <p className="text-xs text-slate-500 font-mono">{complexity}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-6 h-fit"
        >
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Contrôles
          </h2>
          {controls}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-6 overflow-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
