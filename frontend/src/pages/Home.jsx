/**
 * pages/Home.jsx
 * Landing page — explains the system and guides the user to start.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Dna, Upload, Activity, BarChart2, ArrowRight, Zap, Target, Layers } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    num: '01',
    title: 'Upload CSV Dataset',
    desc: 'Upload any CSV file. The system handles missing values, encoding, and scaling automatically.',
  },
  {
    icon: Dna,
    num: '02',
    title: 'Configure the GA',
    desc: 'Set population size, mutation rate, number of generations, ML model, and the feature-penalty weight α.',
  },
  {
    icon: Activity,
    num: '03',
    title: 'Evolve',
    desc: 'Run the full GA or step generation-by-generation. Watch accuracy improve and features get pruned.',
  },
  {
    icon: BarChart2,
    num: '04',
    title: 'Analyse Results',
    desc: 'Compare the GA-selected subset against the all-features baseline. Visualise the best chromosome.',
  },
]

const CONCEPTS = [
  {
    icon: Dna,
    title: 'Binary Chromosome',
    body: 'Each individual is a binary vector — 1 means the feature is selected, 0 means excluded. The GA evolves the population toward better subsets.',
  },
  {
    icon: Target,
    title: 'Fitness Function',
    body: 'Fitness = Accuracy − α × (selected / total). This rewards accuracy while penalising unnecessary features, producing parsimonious models.',
  },
  {
    icon: Zap,
    title: 'GA Operators',
    body: 'Tournament selection picks strong parents. Two-point crossover mixes their genes. Bit-flip mutation maintains diversity. Elitism preserves the best solutions.',
  },
  {
    icon: Layers,
    title: 'ML Models',
    body: 'Choose Logistic Regression, Decision Tree, or Random Forest as the fitness oracle. Each chromosome is evaluated on a held-out test split.',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero */}
      <section className="text-center pt-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1  rounded-full bg-brand-600/20 border border-brand-600/40 text-brand-300 text-xs font-medium">
          <Dna size={13} />
          Genetic Algorithm · Feature Selection · Machine Learning
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-100 leading-tight">
          Find the <span className="text-brand-400">optimal features</span>
          <br className="hidden sm:block" /> through evolution
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
          Upload a CSV dataset, configure the Genetic Algorithm, and let natural selection
          discover the minimal feature subset that maximises your model's accuracy.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            className="btn-primary flex items-center gap-2 text-base px-6 py-2.5"
            onClick={() => navigate('/upload')}
          >
            Get Started <ArrowRight size={16} />
          </button>
          <button
            className="btn-secondary flex items-center gap-2 text-base px-6 py-2.5"
            onClick={() => navigate('/simulate')}
          >
            Jump to Simulation
          </button>
        </div>
      </section>

      {/* 4-step workflow */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-5 text-center">
          Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ icon: Icon, num, title, desc }) => (
            <div key={num} className="card space-y-3 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-brand-400 font-semibold">{num}</span>
                <Icon size={15} className="text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Concept cards */}
      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-5 text-center">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONCEPTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card flex gap-4 hover:border-gray-700 transition-colors">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
                <Icon size={15} className="text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fitness formula */}
      <section className="card border-brand-600/30 bg-brand-900/10">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">
          Fitness Function
        </h2>
        <div className="font-mono text-lg text-gray-200 text-center py-4 bg-gray-900 rounded-lg">
          Fitness = Accuracy − α × (n_selected / n_total)
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          α controls the trade-off between accuracy and feature parsimony (default 0.1)
        </p>
      </section>

      <div className="text-center pb-4">
        <button
          className="btn-primary flex items-center gap-2 mx-auto px-6 py-2.5 text-sm"
          onClick={() => navigate('/upload')}
        >
          Upload your dataset <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
