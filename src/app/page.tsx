"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const algorithms = [
  {
    slug: "fibonacci",
    title: "Fibonacci",
    description: "Visualise le calcul récursif vs tabulaire de F(n)",
    difficulty: "Easy",
    color: "from-green-500 to-emerald-600",
    icon: "🌀",
  },
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    description: "Combien de façons de monter n marches (1 ou 2 à la fois) ?",
    difficulty: "Easy",
    color: "from-blue-500 to-cyan-600",
    icon: "🪜",
  },
  {
    slug: "coin-change",
    title: "Coin Change",
    description: "Nombre minimum de pièces pour atteindre un montant",
    difficulty: "Medium",
    color: "from-yellow-500 to-orange-600",
    icon: "🪙",
  },
  {
    slug: "knapsack",
    title: "0/1 Knapsack",
    description: "Maximiser la valeur avec une capacité limitée",
    difficulty: "Medium",
    color: "from-purple-500 to-violet-600",
    icon: "🎒",
  },
  {
    slug: "lcs",
    title: "Longest Common Subsequence",
    description: "Trouver la plus longue sous-séquence commune à deux chaînes",
    difficulty: "Medium",
    color: "from-pink-500 to-rose-600",
    icon: "🔗",
  },
  {
    slug: "edit-distance",
    title: "Edit Distance",
    description: "Nombre minimum d'opérations pour transformer une chaîne",
    difficulty: "Hard",
    color: "from-red-500 to-orange-600",
    icon: "✏️",
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10 border-green-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 15 } },
};

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          <span className="gradient-text">Dynamic Programming</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Visualisez et comprenez les algorithmes de programmation dynamique
          avec des animations interactives étape par étape.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {algorithms.map((algo) => (
          <motion.div key={algo.slug} variants={item}>
            <Link href={`/${algo.slug}`}>
              <div className="card-hover relative overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-6 h-full cursor-pointer">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${algo.color} opacity-0 hover:opacity-5 transition-opacity`}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{algo.icon}</span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyColor[algo.difficulty]}`}
                    >
                      {algo.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {algo.title}
                  </h3>
                  <p className="text-sm text-slate-400">{algo.description}</p>
                  <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium">
                    Explorer
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
