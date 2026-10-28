import React from 'react'
import { SparklesIcon, CpuChipIcon, ScaleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

// Shows how the three parts of the hybrid system agree:
//   1. the LLM score (language understanding),
//   2. the Random Forest success likelihood (learned from past startups),
//   3. a combined, advisory recommendation (simple rules).
// A person always makes the final decision.

const pretty = (name) =>
  String(name || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

// Rule layer: combine the two signals.
export function combine(llm, prob) {
  if (llm >= 70 && prob >= 50) {
    return { tone: 'good', label: 'Recommended', why: 'The language model and the prediction model both rate this idea well.' }
  }
  if (llm < 55 && prob < 40) {
    return { tone: 'bad', label: 'Needs work', why: 'Both models see weak points. Strengthen the lowest scores before applying.' }
  }
  const disagree = (llm >= 70) !== (prob >= 50)
  return {
    tone: 'mid',
    label: 'Under review',
    why: disagree
      ? 'The two models disagree, so a human reviewer should look at this idea.'
      : 'The result is borderline, so a human reviewer should decide.',
  }
}

const TONES = {
  good: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800',
  mid: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
  bad: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
}

function Step({ n, icon: Icon, title, sub, children }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 dark:border-primary-700">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:text-primary-200">{n}</span>
        <Icon className="h-4 w-4 text-slate-400" />
        <p className="text-sm font-semibold text-ink dark:text-white">{title}</p>
      </div>
      <p className="mb-2 text-[11px] text-slate-400">{sub}</p>
      {children}
    </div>
  )
}

export default function HybridPanel({ status, ml, metrics, llmScore }) {
  if (status === 'loading') {
    return (
      <div className="card mb-6 p-5" aria-busy="true">
        <p className="text-sm font-semibold text-ink dark:text-white">Success Outlook</p>
        <div className="mt-3 h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-primary-700" />
      </div>
    )
  }

  if (status === 'error' || !ml) {
    return (
      <div className="card mb-6 p-5">
        <p className="text-sm font-semibold text-ink dark:text-white">Success Outlook</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The success-prediction model is not reachable right now. The language-model evaluation above is still valid.
        </p>
      </div>
    )
  }

  const prob = Math.round(Number(ml.success_probability) || 0)
  const llm = Math.round(Number(llmScore) || 0)
  const verdict = combine(llm, prob)
  const factors = (ml.key_factors || []).slice(0, 5)
  const maxImp = Math.max(1, ...factors.map((f) => Number(f.importance) || 0))

  return (
    <div className="card mb-6 p-5 sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-ink dark:text-white">Success Outlook</h2>
      </div>
      <p className="mb-4 text-xs text-slate-400">
        A language model, a machine-learning model and a rule layer, working together.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Step n="1" icon={SparklesIcon} title="Language model" sub="LLM reads the idea and scores it">
          <p className="font-heading text-4xl font-bold text-ink dark:text-white">{llm}<span className="text-base text-slate-400"> / 100</span></p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Overall AI score from six dimensions</p>
        </Step>

        <Step n="2" icon={CpuChipIcon} title="Random Forest" sub="150 trees learned from past startups">
          <p className="font-heading text-4xl font-bold text-ink dark:text-white">{prob}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-primary-700">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, prob)}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimated chance of success · {ml.risk_level}</p>
        </Step>

        <Step n="3" icon={ScaleIcon} title="Combined result" sub="Simple rules compare both signals">
          <span className={`inline-block rounded-lg border px-3 py-1.5 text-sm font-bold ${TONES[verdict.tone]}`}>{verdict.label}</span>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{verdict.why}</p>
        </Step>
      </div>

      {factors.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">What the prediction model weighs most</p>
          <ul className="space-y-1.5">
            {factors.map((f) => (
              <li key={f.factor} className="flex items-center gap-3 text-xs">
                <span className="w-40 shrink-0 truncate text-slate-600 dark:text-slate-300">{pretty(f.factor)}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-primary-700">
                  <span className="block h-full rounded-full bg-primary/70" style={{ width: `${((Number(f.importance) || 0) / maxImp) * 100}%` }} />
                </span>
                <span className="w-10 text-right tabular-nums text-slate-400">{Number(f.importance).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 dark:bg-primary-800/60 dark:text-slate-400">
        <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {metrics
            ? `Prediction model test results: accuracy ${Math.round(metrics.accuracy)}%, recall ${Math.round(metrics.recall)}%, AUC ${(metrics.auc_roc / 100).toFixed(2)}. `
            : ''}
          Trained on a limited dataset, so treat this as a proof of concept. It is advisory only: a person makes the final decision.
        </span>
      </div>
    </div>
  )
}
