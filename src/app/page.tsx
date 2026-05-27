"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const algorithms = [
  {
    slug: "fibonacci",
    title: "Fibonacci",
    description: "Calcul récursif vs tabulaire de F(n)",
    difficulty: "Easy" as const,
    index: "01",
  },
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    description: "Nombre de façons de monter n marches, 1 ou 2 à la fois",
    difficulty: "Easy" as const,
    index: "02",
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    description: "Nombre minimum de pièces pour atteindre un montant donné",
    difficulty: "Medium" as const,
    index: "03",
  },
  {
    slug: "knapsack",
    title: "0/1 Knapsack",
    description: "Maximiser la valeur totale sous contrainte de capacité",
    difficulty: "Medium" as const,
    index: "04",
  },
  {
    slug: "lcs",
    title: "Longest Common Subsequence",
    description: "Plus longue sous-séquence commune à deux chaînes",
    difficulty: "Medium" as const,
    index: "05",
  },
  {
    slug: "edit-distance",
    title: "Edit Distance",
    description: "Minimum d'opérations pour transformer une chaîne en une autre",
    difficulty: "Hard" as const,
    index: "06",
  },
];

const difficultyDot: Record<string, string> = {
  Easy: "bg-emerald-400",
  Medium: "bg-amber-400",
  Hard: "bg-red-400",
};

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <h1 className="font-display text-5xl sm:text-7xl tracking-tight text-[#fafafa] mb-6">
          Dynamic
          <br />
          Programming
        </h1>
        <p className="text-base text-[#71717a] max-w-md leading-relaxed">
          Visualisations interactives, étape par étape,
          des algorithmes classiques de programmation dynamique.
        </p>
      </motion.header>

      <div className="border-t border-[#27272a]">
        {algorithms.map((algo, i) => (
          <motion.div
            key={algo.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Link href={`/${algo.slug}`} className="group block">
              <div className="border-b border-[#27272a] py-5 px-2 flex items-center gap-6 transition-colors hover:bg-[#161618]">
                <span className="font-mono text-xs text-[#3f3f46] w-6 shrink-0">
                  {algo.index}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h2 className="font-display text-xl text-[#fafafa] group-hover:text-[#d4a574] transition-colors">
                      {algo.title}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${difficultyDot[algo.difficulty]}`}
                      />
                      <span className="text-[10px] uppercase tracking-widest text-[#52525b]">
                        {algo.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#52525b]">{algo.description}</p>
                </div>

                <svg
                  className="w-4 h-4 text-[#3f3f46] group-hover:text-[#d4a574] transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                  />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
