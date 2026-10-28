import React, { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { mlAPI } from '../../services/api.js'
import HybridPanel from '../../components/HybridPanel.jsx'

// Read-only AI advice for the admin reviewer. It does not touch the rubric,
// the total or the decision. The admin scores the idea independently.
export default function AiAdvicePanel({ idea }) {
  const [state, setState] = useState({ status: 'idle', ml: null, metrics: null, llmScore: 0 })

  const run = async () => {
    setState({ status: 'loading', ml: null, metrics: null, llmScore: 0 })
    try {
      const response = await mlAPI.evaluate({
        title: idea.title || 'Untitled',
        description: `Problem: ${idea.problem || ''}\nSolution: ${idea.solution || ''}`,
        category: idea.category || 'General',
        industry: idea.industry || 'Technology',
        innovation_score: (parseInt(idea.innovation_level, 10) || 5) * 10,
      })
      const d = response.data?.data
      const llmScore = Number(d?.overall_score)
      if (!response.data?.success || Number.isNaN(llmScore)) throw new Error('LLM evaluation failed')

      // Same mapping the Evaluate page uses (no startup profile for an idea)
      const payload = {
        innovation_score: d.innovation_score,
        market_potential: d.market_potential,
        technical_feasibility: d.feasibility,
        business_model: d.financial_viability,
        financial_plan: d.financial_plan,
        social_impact: d.social_impact,
        team_capability: d.team_capability,
        overall_risk: d.risk_score,
      }
      const [p, m] = await Promise.allSettled([mlAPI.predict(payload), mlAPI.metrics()])
      const ml = p.status === 'fulfilled' && p.value.data?.success ? p.value.data.data : null
      const metrics = m.status === 'fulfilled' && m.value.data?.success ? m.value.data.data : null
      setState({ status: ml ? 'ready' : 'error', ml, metrics, llmScore })
    } catch (e) {
      setState({ status: 'llm_error', ml: null, metrics: null, llmScore: 0 })
    }
  }

  if (state.status === 'idle' || state.status === 'llm_error') {
    return (
      <div className="mb-4 rounded-xl border border-slate-100 p-4 dark:border-primary-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
              <SparklesIcon className="h-4 w-4 text-primary" /> AI advice (optional)
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {state.status === 'llm_error'
                ? 'The AI evaluation could not be completed. You can still review using the rubric below.'
                : 'A second opinion from the language model and the prediction model. Advisory only: you decide.'}
            </p>
          </div>
          <button type="button" onClick={run} className="btn-secondary shrink-0">
            {state.status === 'llm_error' ? 'Try again' : 'Get AI advice'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <HybridPanel status={state.status} ml={state.ml} metrics={state.metrics} llmScore={state.llmScore} />
      <button type="button" onClick={run} className="mb-4 text-xs text-slate-400 underline">
        Run again (the AI can give slightly different scores each time)
      </button>
    </div>
  )
}
