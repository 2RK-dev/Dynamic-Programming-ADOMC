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
  description,
  complexity,
  children,
  controls,
}: AlgoLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl text-[#fafafa] mb-2">{title}</h1>
        <p className="text-sm text-[#71717a] mb-1">{description}</p>
        <p className="text-xs text-[#3f3f46] font-mono">{complexity}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card rounded-lg p-5 h-fit"
        >
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#52525b] font-medium mb-5">
            Controls
          </h2>
          {controls}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="card rounded-lg p-6 overflow-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
