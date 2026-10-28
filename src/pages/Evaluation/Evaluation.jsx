import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  PlayIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ChartBarIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  BuildingOffice2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import Gauge from '../../components/Gauge.jsx'
import HybridPanel from '../../components/HybridPanel.jsx'
import { PageHeader, ErrorNotice } from '../../components/ui.jsx'
import { evaluation as sampleEvaluation } from '../../data/sampleData.js'
import { mlAPI, startupAPI, evaluationAPI } from '../../services/api.js'
import toast from 'react-hot-toast'

// ─── Constants ─────────────────────────────────────────────────────────────────

const riskColor = {
  Low:    { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Medium: { text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400'  },
  High:   { text: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500'    },
}

const scoreConfig = [
  { key: 'innovation',          label: 'Innovation',            description: 'How novel and unique is the idea?',                  Icon: LightBulbIcon          },
  { key: 'feasibility',         label: 'Feasibility',           description: 'Can this be built with current technology?',         Icon: BeakerIcon             },
  { key: 'marketPotential',     label: 'Market Potential',      description: 'Size and reachability of the target market',         Icon: ChartBarIcon           },
  { key: 'technicalComplexity', label: 'Technical Complexity',  description: 'Depth of technical challenge involved',              Icon: AdjustmentsHorizontalIcon },
  { key: 'socialImpact',        label: 'Social Impact',         description: 'Benefit to communities and the broader society',     Icon: GlobeAltIcon           },
  { key: 'financialViability',  label: 'Financial Viability',   description: 'Likelihood of building a sustainable business',      Icon: CurrencyDollarIcon     },
]

const CATEGORIES = ['Agriculture', 'Healthcare', 'FinTech', 'EdTech', 'CleanTech', 'AI/ML', 'Other']
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Agriculture', 'Education', 'Other']

// ─── Helpers ───────────────────────────────────────────────────────────────────

function scoreTone(score) {
  if (score >= 90) return { label: 'Excellent',  bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' }
  if (score >= 75) return { label: 'Good',        bar: 'bg-primary',     text: 'text-primary',     bg: 'bg-primary/5'  }
  if (score >= 60) return { label: 'Fair',        bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   }
  return               { label: 'Needs Work',  bar: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     }
}

function overallGaugeColor(score) {
  if (score >= 85) return '#10B981'
  if (score >= 70) return '#1D4241'
  if (score >= 55) return '#F59E0B'
  return '#EF4444'
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}

function generateImprovements(scores) {
  const improvements = []
  if (scores.innovation < 75)
    improvements.push({ title: 'Increase Innovation',        detail: 'Research existing solutions and add unique differentiating features.' })
  if (scores.feasibility < 75)
    improvements.push({ title: 'Strengthen Feasibility',     detail: 'Break implementation into smaller phases and address technical risks early.' })
  if (scores.marketPotential < 75)
    improvements.push({ title: 'Expand Market Research',     detail: 'Conduct customer interviews to validate demand and refine target segments.' })
  if (scores.technicalComplexity < 75)
    improvements.push({ title: 'Simplify Technical Approach',detail: 'Leverage existing platforms before building custom infrastructure.' })
  if (scores.socialImpact < 75)
    improvements.push({ title: 'Enhance Social Impact',      detail: 'Identify specific communities that benefit most from your solution.' })
  if (scores.financialViability < 75)
    improvements.push({ title: 'Refine Financial Model',     detail: 'Create detailed revenue projections and identify cost-saving opportunities.' })
  if (improvements.length === 0) {
    improvements.push({ title: 'Maintain Momentum',  detail: 'Continue developing and seek feedback from mentors and potential users.' })
    improvements.push({ title: 'Plan for Scale',     detail: 'Develop a growth strategy including marketing, partnerships, and funding.' })
  }
  return improvements.slice(0, 4)
}

const improvementIcons = [Squares2X2Icon, AdjustmentsHorizontalIcon, SparklesIcon, ArrowTrendingUpIcon]

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreCriterionCard({ config, score }) {
  const tone = scoreTone(score)
  const { Icon } = config
  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${tone.bg}`}>
          <Icon className={`h-5 w-5 ${tone.text}`} />
        </div>
        <span className={`badge text-xs font-semibold ${tone.bg} ${tone.text}`}>{tone.label}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-ink dark:text-white">{config.label}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{config.description}</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`font-heading text-2xl font-bold ${tone.text}`}>{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${tone.bar}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    </div>
  )
}

function SwotQuadrant({ icon: Icon, title, items, colorClass, bgClass, borderClass }) {
  return (
    <div className={`rounded-xl border p-4 ${bgClass} ${borderClass}`}>
      <p className={`flex items-center gap-1.5 text-sm font-semibold mb-3 ${colorClass}`}>
        <Icon className="h-4 w-4 shrink-0" />{title}
      </p>
      <ul className="space-y-1.5">
        {(items || []).map((item, i) => (
          <li key={i} className={`flex items-start gap-2 text-xs ${colorClass} opacity-90`}>
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-current" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RiskBadge({ name, level }) {
  const c = riskColor[level] || riskColor['Medium']
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3.5 ${c.bg} ${c.border}`}>
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${c.dot}`} />
        <p className="text-sm font-medium text-ink dark:text-white">{name}</p>
      </div>
      <span className={`badge text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>{level} Risk</span>
    </div>
  )
}

function ImprovementItem({ item, index }) {
  const Icon = improvementIcons[index % improvementIcons.length]
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-primary-700 transition-colors group cursor-default">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink dark:text-white">{item.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
    </div>
  )
}

function ApprovalBadge({ status }) {
  const isApproved = /approv|recommend/i.test(status || '')
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border ${
      isApproved
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50  text-amber-700  border-amber-200'
    }`}>
      {isApproved ? <CheckCircleSolid className="h-4 w-4" /> : <ShieldExclamationIcon className="h-4 w-4" />}
      {status}
    </div>
  )
}

// ─── Loading state ──────────────────────────────────────────────────────────────

function EvaluatingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="card p-10 flex flex-col items-center gap-5 max-w-sm w-full text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <SparklesIcon className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <div>
          <p className="font-heading text-lg font-semibold text-ink dark:text-white">Running AI Evaluation</p>
          <p className="text-sm text-slate-500 mt-1">Analysing your idea across 6 dimensions…</p>
        </div>
        <div className="w-full bg-slate-100 dark:bg-primary-700 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
        <p className="text-xs text-slate-400">This may take up to 30 seconds</p>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Evaluation() {
  // ── Core state ───────────────────────────────────────────────────────────────
  const [evaluationData, setEvaluationData]   = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [isFallback, setIsFallback]           = useState(false)

  // ── Success Outlook (Random Forest runs on the language-model scores) ───────
  const [hybrid, setHybrid]                   = useState({ status: 'idle', ml: null, metrics: null })
  const hybridRun                             = useRef(0)

  // ── Startup selector ─────────────────────────────────────────────────────────
  const [myStartups, setMyStartups]           = useState([])
  const [startupsLoading, setStartupsLoading] = useState(false)
  const [selectedStartup, setSelectedStartup] = useState(null)

  // ── Evaluation history ───────────────────────────────────────────────────────
  const [history, setHistory]                 = useState([])
  const [historyLoading, setHistoryLoading]   = useState(false)
  const [showHistory, setShowHistory]         = useState(false)

  // ── Form ─────────────────────────────────────────────────────────────────────
  const [showForm, setShowForm]               = useState(false)
  const [formExpanded, setFormExpanded]       = useState(true)

  // ── Chat ─────────────────────────────────────────────────────────────────────
  const [chatDraft, setChatDraft]             = useState('')
  const [chatMessages, setChatMessages]       = useState([])
  const [isChatSending, setIsChatSending]     = useState(false)

  const chatEndRef  = useRef(null)
  const resultsRef  = useRef(null)

  const [formData, setFormData] = useState({
    title:            '',
    description:      '',
    category:         '',
    industry:         '',
    target_market:    '',
    business_model:   '',
    innovation_level: 7,
    market_potential: 70,
    feasibility:      70,
    financial_plan:   70,
    social_impact:    70,
    team_capability:  70,
    overall_risk:     40,
  })

  // ── Auto-scroll chat ─────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isChatSending])

  // ── Load the user's startups and evaluation history on mount ─────────────────
  useEffect(() => {
    setStartupsLoading(true)
    startupAPI.getMyStartups()
      .then((res) => setMyStartups(res.data?.data || []))
      .catch(() => setMyStartups([]))
      .finally(() => setStartupsLoading(false))

    setHistoryLoading(true)
    evaluationAPI.getMy()
      .then((res) => setHistory(res.data?.data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [])

  // ── Populate form from a selected startup ────────────────────────────────────
  const handleSelectStartup = useCallback((startup) => {
    setSelectedStartup(startup)
    setFormData({
      title:            startup.business_name || startup.name || '',
      description:      startup.description || '',
      category:         startup.sector || '',
      industry:         startup.sector || '',
      target_market:    startup.target_market || startup.region || '',
      business_model:   startup.business_model || '',
      innovation_level: Math.min(10, Math.max(1, parseInt(startup.trl_level || startup.trl || 5))),
      market_potential: 70,
      feasibility:      70,
      financial_plan:   70,
      social_impact:    70,
      team_capability:  70,
      overall_risk:     40,
    })
    setShowForm(true)
    setFormExpanded(true)
    toast.success(`Loaded "${startup.business_name}" — adjust scores and run evaluation`)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNew = () => {
    hybridRun.current += 1
    setHybrid({ status: 'idle', ml: null, metrics: null })
    setFormData({
      title: '', description: '', category: '', industry: '',
      target_market: '', business_model: '',
      innovation_level: 7, market_potential: 70, feasibility: 70,
      financial_plan: 70, social_impact: 70, team_capability: 70, overall_risk: 40,
    })
    setSelectedStartup(null)
    setEvaluationData(null)
    setIsFallback(false)
    setChatMessages([])
    setShowForm(true)
    setFormExpanded(true)
    toast.success('Ready for a new evaluation!')
  }

  // ── Hybrid step: feed the language-model scores into the Random Forest ──────
  const runHybrid = async (d) => {
    const run = ++hybridRun.current
    setHybrid({ status: 'loading', ml: null, metrics: null })
    const s = selectedStartup || {}
    const pick = (key, value) => (value === undefined || value === null || value === '' || Number.isNaN(Number(value)) ? {} : { [key]: Number(value) })
    const payload = {
      innovation_score:      d.innovation_score,
      market_potential:      d.market_potential,
      technical_feasibility: d.feasibility,
      business_model:        d.financial_viability, // closest score the language model returns
      financial_plan:        d.financial_plan,
      social_impact:         d.social_impact,
      team_capability:       d.team_capability,
      overall_risk:          d.risk_score,
      // Profile facts, used only when the selected startup has them
      ...pick('trl_level', s.trl_level),
      ...pick('employee_count', s.employee_count),
      ...pick('is_rural', s.is_rural === true ? 1 : s.is_rural === false ? 0 : s.is_rural),
      ...pick('has_prototype', s.has_prototype === true ? 1 : s.has_prototype === false ? 0 : s.has_prototype),
      ...pick('has_patent', s.has_patent === true ? 1 : s.has_patent === false ? 0 : s.has_patent),
      ...pick('patent_count', s.patent_count),
      ...pick('requested_funding', s.requested_funding),
      ...pick('private_funding', s.previous_private_funding ?? s.private_funding),
    }
    const [p, m] = await Promise.allSettled([mlAPI.predict(payload), mlAPI.metrics()])
    if (run !== hybridRun.current) return // a newer evaluation started
    const ml = p.status === 'fulfilled' && p.value.data?.success ? p.value.data.data : null
    const metrics = m.status === 'fulfilled' && m.value.data?.success ? m.value.data.data : null
    setHybrid({ status: ml ? 'ready' : 'error', ml, metrics })
  }

  // ── Run evaluation ────────────────────────────────────────────────────────────
  const handleRunEvaluation = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please enter your idea title and description first')
      return
    }

    setLoading(true)
    setShowForm(false)

    try {
      const response = await mlAPI.evaluate({
        title:           formData.title,
        description:     formData.description,
        category:        formData.category    || 'General',
        industry:        formData.industry    || 'Technology',
        target_market:   formData.target_market,
        business_model:  formData.business_model,
        innovation_score: parseInt(formData.innovation_level) * 10,
        market_potential: parseInt(formData.market_potential),
        feasibility:      parseInt(formData.feasibility),
        financial_plan:   parseInt(formData.financial_plan),
        social_impact:    parseInt(formData.social_impact),
        team_capability:  parseInt(formData.team_capability),
        overall_risk:     parseInt(formData.overall_risk),
      })

      if (response.data?.success) {
        const d = response.data.data

        const scores = {
          innovation:          d.innovation_score   || 70,
          feasibility:         d.feasibility        || 70,
          marketPotential:     d.market_potential   || 70,
          technicalComplexity: d.technical_complexity || 50,
          socialImpact:        d.social_impact      || 70,
          financialViability:  d.financial_viability || 70,
        }

        const result = {
          overallScore:         d.overall_score   || 80,
          rating:               d.rating          || 'Good',
          title:                formData.title,
          startup_id:           selectedStartup?.startup_id || '',
          scores,
          radar: [
            { subject: 'Innovation', value: scores.innovation },
            { subject: 'Feasibility', value: scores.feasibility },
            { subject: 'Market',     value: scores.marketPotential },
            { subject: 'Technical',  value: scores.technicalComplexity },
            { subject: 'Social',     value: scores.socialImpact },
            { subject: 'Financial',  value: scores.financialViability },
          ],
          risks: [
            { name: 'Technological Risk', level: d.risk_score > 50 ? 'Medium' : 'Low' },
            { name: 'Market Acceptance',  level: d.market_potential > 70 ? 'Low' : 'Medium' },
            { name: 'Regulatory Risk',    level: 'High' },
          ],
          swot: d.swot_analysis || sampleEvaluation.swot,
          approvalStatus:       d.approval_status || 'Under Review',
          suggestedImprovements: generateImprovements(scores),
          feedback: Array.isArray(d.feedback)
            ? d.feedback
            : [d.feedback || "Hi! I'm your AI assistant. Ask me anything about your evaluation."],
          evaluatedAt: new Date().toISOString(),
        }

        setEvaluationData(result)
        setIsFallback(false)
        toast.success('Evaluation complete!')
        runHybrid(d) // non-blocking: the page never waits for it

        // ── Save result to backend (non-blocking) ───────────────────────────
        evaluationAPI.save({
          startup_id:     result.startup_id,
          title:          result.title,
          overall_score:  result.overallScore,
          rating:         result.rating,
          approval_status: result.approvalStatus,
          scores:         result.scores,
          swot:           result.swot,
          risks:          result.risks,
          feedback:       result.feedback,
        }).then((res) => {
          // Prepend to local history so it appears instantly
          if (res.data?.success) {
            setHistory((prev) => [res.data.data, ...prev])
          }
        }).catch(() => { /* save failure is non-critical */ })

        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      } else {
        toast.error('Evaluation failed. Please try again.')
        setShowForm(true)
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      const scores = sampleEvaluation.scores
      setEvaluationData({
        ...sampleEvaluation,
        title: formData.title || 'Your Idea',
        startup_id: selectedStartup?.startup_id || '',
        suggestedImprovements: generateImprovements(scores),
        feedback: ["Hi! I'm your AI assistant. The backend wasn't reachable, so I'm showing sample results. Please ensure the backend is running."],
        evaluatedAt: new Date().toISOString(),
      })
      setIsFallback(true)
      toast.error('Backend unavailable — showing sample results')
    } finally {
      setLoading(false)
    }
  }

  // ── Restore a history entry ───────────────────────────────────────────────────
  const handleRestoreHistory = (entry) => {
    hybridRun.current += 1
    setHybrid({ status: 'idle', ml: null, metrics: null })
    const scores = entry.scores || {}
    setEvaluationData({
      overallScore:    entry.overall_score,
      rating:          entry.rating,
      title:           entry.title,
      startup_id:      entry.startup_id || '',
      scores: {
        innovation:          scores.innovation          || 0,
        feasibility:         scores.feasibility         || 0,
        marketPotential:     scores.marketPotential     || 0,
        technicalComplexity: scores.technicalComplexity || 0,
        socialImpact:        scores.socialImpact        || 0,
        financialViability:  scores.financialViability  || 0,
      },
      radar: [
        { subject: 'Innovation', value: scores.innovation          || 0 },
        { subject: 'Feasibility',value: scores.feasibility         || 0 },
        { subject: 'Market',     value: scores.marketPotential     || 0 },
        { subject: 'Technical',  value: scores.technicalComplexity || 0 },
        { subject: 'Social',     value: scores.socialImpact        || 0 },
        { subject: 'Financial',  value: scores.financialViability  || 0 },
      ],
      risks: entry.risks || [
        { name: 'Technological Risk', level: 'Medium' },
        { name: 'Market Acceptance',  level: 'Medium' },
        { name: 'Regulatory Risk',    level: 'High'   },
      ],
      swot:             entry.swot || sampleEvaluation.swot,
      approvalStatus:   entry.approval_status || 'Under Review',
      suggestedImprovements: generateImprovements(scores),
      feedback:         entry.feedback || ["Viewing a past evaluation. Run a new evaluation for updated results."],
      evaluatedAt:      entry.created_at,
    })
    setIsFallback(false)
    setChatMessages([])
    setShowHistory(false)
    toast.success('Loaded past evaluation')
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  // ── Chat ──────────────────────────────────────────────────────────────────────
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    const message = chatDraft.trim()
    if (!message) return

    setChatMessages((prev) => [...prev, { role: 'user', text: message }])
    setChatDraft('')
    setIsChatSending(true)

    try {
      const context = {
        title:        evaluationData?.title || formData.title,
        overallScore: evaluationData?.overallScore,
        scores:       evaluationData?.scores,
        feedback:     evaluationData?.feedback,
        rating:       evaluationData?.rating,
      }
      const response = await mlAPI.chat(message, context)
      const reply = response.data?.data?.reply || response.data?.data?.response
        || "I couldn't generate a response right now."
      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setChatMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'The AI assistant is temporarily unavailable. Please ensure the backend is running.',
      }])
    } finally {
      setIsChatSending(false)
    }
  }

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loading) return <EvaluatingScreen />

  const hasResults  = evaluationData !== null
  const displayData = evaluationData || sampleEvaluation
  const aiFeedback  = Array.isArray(displayData.feedback)
    ? displayData.feedback[0]
    : (displayData.feedback || "Hi! I'm your AI assistant. Ask me anything about your evaluation.")

  // ── Intro / no-results state ──────────────────────────────────────────────────
  if (!hasResults && !showForm) {
    return (
      <div>
        <PageHeader
          eyebrow="AI Tools"
          title="AI Startup Evaluation"
          action={
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button type="button" className="btn-outline gap-2" onClick={() => setShowHistory(true)}>
                  <ClockIcon className="h-4 w-4" />
                  History ({history.length})
                </button>
              )}
              <button type="button" className="btn-primary gap-2" onClick={handleNew}>
                <PlusIcon className="h-4 w-4" />
                Start Evaluation
              </button>
            </div>
          }
        />

        {/* Hero card */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-primary via-primary-700 to-primary-800 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #EF9C82 0%, transparent 50%)' }} />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium mb-4">
              <SparklesIcon className="h-3.5 w-3.5 text-accent" />
              Powered by AI
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-3 leading-snug">
              Get a real AI assessment of your startup idea
            </h2>
            <p className="text-white/75 text-sm leading-relaxed mb-6 max-w-lg">
              Our AI evaluates your idea across six key dimensions — innovation, market potential, feasibility,
              technical complexity, social impact, and financial viability — and provides idea-specific
              SWOT analysis, risk assessment, and actionable recommendations.
            </p>
            <button type="button"
              className="btn bg-accent text-primary-800 hover:bg-accent-500 gap-2 font-semibold"
              onClick={handleNew}>
              <PlayIcon className="h-4 w-4" />
              Start Your Evaluation
            </button>
          </div>
        </div>

        {/* Your startups section — quick-select */}
        {myStartups.length > 0 && (
          <div className="mb-8">
            <h3 className="font-heading font-semibold text-ink dark:text-white mb-4 flex items-center gap-2">
              <BuildingOffice2Icon className="h-5 w-5 text-slate-400" />
              Evaluate an existing startup
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myStartups.slice(0, 6).map((s) => (
                <button
                  key={s.startup_id || s.id}
                  type="button"
                  onClick={() => handleSelectStartup(s)}
                  className="card p-4 text-left hover:shadow-soft hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                      <LightBulbIcon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink dark:text-white truncate">
                        {s.business_name || s.name || 'Unnamed'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.sector || 'General'} · TRL {s.trl_level || s.trl || 'N/A'}</p>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* What gets evaluated */}
        <h3 className="font-heading font-semibold text-ink dark:text-white mb-4">What gets evaluated</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {scoreConfig.map(({ key, label, description, Icon }) => (
            <div key={key} className="card p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h3 className="font-heading font-semibold text-ink dark:text-white mb-4">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Select or describe your idea',  detail: 'Pick an existing startup or enter your idea title, description, and business details.' },
            { step: '02', title: 'Set self-assessment scores',    detail: 'Rate your idea on key dimensions. The AI uses these as context alongside your description.' },
            { step: '03', title: 'Review AI results',             detail: 'Get a real AI score, idea-specific SWOT, risk profile, and personalised recommendations.' },
          ].map(({ step, title, detail }) => (
            <div key={step} className="card p-5 flex gap-4">
              <span className="font-heading text-2xl font-bold text-primary/20 dark:text-white/10 shrink-0 select-none">{step}</span>
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">{title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* History modal */}
        {showHistory && (
          <HistoryModal history={history} onClose={() => setShowHistory(false)} onRestore={handleRestoreHistory} />
        )}
      </div>
    )
  }

  // ── Form panel ────────────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="card mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setFormExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-primary-700 transition-colors"
        aria-expanded={formExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-ink dark:text-white">
              {selectedStartup ? `Evaluating: ${selectedStartup.business_name}` : 'Idea Details'}
            </p>
            <p className="text-xs text-slate-500">Fill in your startup information to run the evaluation</p>
          </div>
        </div>
        {formExpanded
          ? <ChevronUpIcon className="h-5 w-5 text-slate-400 shrink-0" />
          : <ChevronDownIcon className="h-5 w-5 text-slate-400 shrink-0" />}
      </button>

      {formExpanded && (
        <div className="px-6 pb-6 border-t border-slate-100 dark:border-primary-700 pt-5">

          {/* Quick-select startup strip (shown if startups exist) */}
          {myStartups.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Or select an existing startup</p>
              <div className="flex flex-wrap gap-2">
                {myStartups.slice(0, 5).map((s) => (
                  <button
                    key={s.startup_id || s.id}
                    type="button"
                    onClick={() => handleSelectStartup(s)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      selectedStartup?.startup_id === s.startup_id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary dark:bg-primary-700 dark:text-slate-300'
                    }`}
                  >
                    <BuildingOffice2Icon className="h-3.5 w-3.5" />
                    {s.business_name || s.name}
                  </button>
                ))}
                {selectedStartup && (
                  <button
                    type="button"
                    onClick={() => { setSelectedStartup(null) }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* About the idea */}
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">About the Idea</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="label">
                Idea Title <span className="text-red-500">*</span>
              </label>
              <input id="title" type="text" name="title" value={formData.title}
                onChange={handleChange} className="input"
                placeholder="e.g. AgriTech Smart Farming Platform" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="label">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea id="description" name="description" value={formData.description}
                onChange={handleChange} className="input resize-none" rows={3}
                placeholder="Describe your idea, the problem it solves, and your proposed solution..." />
            </div>
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="industry" className="label">Industry</label>
              <select id="industry" name="industry" value={formData.industry} onChange={handleChange} className="input">
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="target_market" className="label">Target Market</label>
              <input id="target_market" type="text" name="target_market" value={formData.target_market}
                onChange={handleChange} className="input"
                placeholder="e.g. Smallholder farmers in East Africa" />
            </div>
            <div>
              <label htmlFor="business_model" className="label">Business Model</label>
              <input id="business_model" type="text" name="business_model" value={formData.business_model}
                onChange={handleChange} className="input"
                placeholder="e.g. Freemium SaaS, $5/month premium" />
            </div>
          </div>

          {/* Self-assessment scores */}
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Self-Assessment Scores</p>
          <p className="text-xs text-slate-500 mb-4">
            Rate your idea (0–100). These help the AI calibrate its evaluation alongside your description.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Innovation slider */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label htmlFor="innovation_level" className="label">
                Innovation Level
                <span className="ml-2 font-bold text-primary">{formData.innovation_level} / 10</span>
              </label>
              <input id="innovation_level" type="range" name="innovation_level"
                min="1" max="10" value={formData.innovation_level}
                onChange={handleChange} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Incremental improvement</span>
                <span>Breakthrough innovation</span>
              </div>
            </div>

            {[
              { name: 'market_potential', label: 'Market Potential' },
              { name: 'feasibility',      label: 'Feasibility'      },
              { name: 'financial_plan',   label: 'Financial Plan'   },
              { name: 'social_impact',    label: 'Social Impact'    },
              { name: 'team_capability',  label: 'Team Capability'  },
              { name: 'overall_risk',     label: 'Risk Score'       },
            ].map(({ name, label }) => {
              const val  = parseInt(formData[name]) || 0
              const tone = scoreTone(val)
              return (
                <div key={name}>
                  <label htmlFor={name} className="label">{label}</label>
                  <div className="relative">
                    <input id={name} type="number" name={name} value={formData[name]}
                      onChange={handleChange} className="input pr-12" min="0" max="100" />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${tone.text}`}>
                      {val}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-2">
            <button type="button" onClick={handleRunEvaluation}
              disabled={!formData.title.trim() || !formData.description.trim()}
              className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <SparklesIcon className="h-4 w-4" />
              Run Evaluation
            </button>
            <button type="button"
              onClick={() => { setShowForm(false); setFormExpanded(false) }}
              className="btn-outline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // ── Results view ──────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        eyebrow="AI Tools"
        title="AI Startup Evaluation"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {history.length > 0 && (
              <button type="button" className="btn-outline gap-2" onClick={() => setShowHistory(true)}>
                <ClockIcon className="h-4 w-4" />
                History ({history.length})
              </button>
            )}
            {hasResults && (
              <button type="button" className="btn-outline gap-2"
                onClick={() => { setShowForm(true); setFormExpanded(true) }}>
                <ArrowPathIcon className="h-4 w-4" />
                Re-evaluate
              </button>
            )}
            <button type="button" className="btn-primary gap-2" onClick={handleNew}>
              <PlusIcon className="h-4 w-4" />
              New Evaluation
            </button>
          </div>
        }
      />

      {isFallback && (
        <ErrorNotice message="Could not reach the evaluation service. Showing sample results for demonstration." />
      )}

      {/* Form panel */}
      {showForm && renderForm()}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <div ref={resultsRef}>

        {/* Idea identity bar */}
        {hasResults && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl border border-slate-100 dark:border-primary-700 bg-white dark:bg-primary-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <LightBulbIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Evaluated {displayData.evaluatedAt ? `on ${formatDate(displayData.evaluatedAt)}` : ''}
                </p>
                <p className="font-heading font-semibold text-ink dark:text-white text-sm">{displayData.title}</p>
              </div>
            </div>
            <ApprovalBadge status={displayData.approvalStatus} />
          </div>
        )}

        {/* Overall Score Hero */}
        <div className="card mb-6 overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto] gap-0">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-primary uppercase tracking-wide">Overall AI Score</p>
                <div className="group relative">
                  <InformationCircleIcon className="h-4 w-4 text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-60 text-xs bg-ink text-white rounded-lg p-2.5 shadow-lg z-10 leading-relaxed">
                    Average of 6 AI-evaluated dimensions: Innovation, Feasibility, Market Potential,
                    Technical Complexity, Social Impact, and Financial Viability.
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-4 mb-4">
                <span className="font-heading text-6xl sm:text-7xl font-bold text-ink dark:text-white leading-none">
                  {displayData.overallScore}
                </span>
                <div className="pb-2">
                  <span className="block text-lg text-slate-400 leading-none mb-1">/ 100</span>
                  <span className={`badge text-sm font-semibold px-3 py-1 ${
                    displayData.overallScore >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    displayData.overallScore >= 70 ? 'bg-primary/10 text-primary border border-primary/20' :
                    displayData.overallScore >= 55 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>{displayData.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                {[
                  { range: '85–100', label: 'Excellent', color: 'bg-emerald-500' },
                  { range: '70–84',  label: 'Good',      color: 'bg-primary'     },
                  { range: '55–69',  label: 'Fair',       color: 'bg-amber-400'  },
                  { range: '0–54',   label: 'Needs Work', color: 'bg-red-500'    },
                ].map(({ range, label, color }) => (
                  <span key={range} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    {range} — {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center p-6 border-l border-slate-100 dark:border-primary-700 bg-slate-50/50 dark:bg-primary-700/30 min-w-[220px]">
              <Gauge
                value={displayData.overallScore}
                max={100}
                size={180}
                strokeWidth={16}
                variant="solid"
                color={overallGaugeColor(displayData.overallScore)}
                centerLabel={`${displayData.overallScore}%`}
                centerSub={displayData.rating}
              />
            </div>
          </div>
        </div>

        {/* Success Outlook: language model + Random Forest + rules */}
        {hybrid.status !== 'idle' && !isFallback && (
          <HybridPanel status={hybrid.status} ml={hybrid.ml} metrics={hybrid.metrics} llmScore={displayData.overallScore} />
        )}

        {/* Dimension Score Cards */}
        <h2 className="font-heading font-semibold text-ink dark:text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-slate-400" />
          Dimension Scores
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {scoreConfig.map((config) => (
            <ScoreCriterionCard key={config.key} config={config}
              score={displayData.scores?.[config.key] ?? 0} />
          ))}
        </div>

        {/* Radar + SWOT */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-2 card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">Multi-Dimensional Profile</h2>
            <p className="text-xs text-slate-400 mb-4">Visual balance of all six evaluation dimensions</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={displayData.radar}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar dataKey="value" stroke="#1D4241" fill="#1D4241" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-3 card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">SWOT Analysis</h2>
            <p className="text-xs text-slate-400 mb-4">AI-generated strengths, weaknesses, opportunities, and threats</p>
            <div className="grid grid-cols-2 gap-3">
              <SwotQuadrant icon={HandThumbUpIcon}        title="Strengths"     items={displayData.swot?.strengths}
                colorClass="text-emerald-700" bgClass="bg-emerald-50 dark:bg-emerald-900/20"  borderClass="border-emerald-200 dark:border-emerald-800" />
              <SwotQuadrant icon={HandThumbDownIcon}      title="Weaknesses"    items={displayData.swot?.weaknesses}
                colorClass="text-red-600"     bgClass="bg-red-50 dark:bg-red-900/20"          borderClass="border-red-200 dark:border-red-800" />
              <SwotQuadrant icon={MegaphoneIcon}          title="Opportunities" items={displayData.swot?.opportunities}
                colorClass="text-primary"     bgClass="bg-primary/5 dark:bg-primary-900/30"   borderClass="border-primary/20 dark:border-primary-700" />
              <SwotQuadrant icon={ExclamationTriangleIcon} title="Threats"      items={displayData.swot?.threats}
                colorClass="text-accent-600"  bgClass="bg-accent/5 dark:bg-accent-900/10"     borderClass="border-accent/30 dark:border-accent-700" />
            </div>
          </div>
        </div>

        {/* Risk + Improvements + Chat */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Risk */}
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1 flex items-center gap-2">
              <ShieldExclamationIcon className="h-5 w-5 text-slate-400" />
              Risk Assessment
            </h2>
            <p className="text-xs text-slate-400 mb-4">Identified risk areas for this idea</p>
            <div className="space-y-2.5">
              {(displayData.risks || []).map((r) => (
                <RiskBadge key={r.name} name={r.name} level={r.level} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              High-risk areas should be addressed in your development plan before approaching investors.
            </p>
          </div>

          {/* Improvements */}
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1 flex items-center gap-2">
              <LightBulbIcon className="h-5 w-5 text-slate-400" />
              Recommended Improvements
            </h2>
            <p className="text-xs text-slate-400 mb-4">Actions to strengthen your evaluation score</p>
            <div className="space-y-1">
              {displayData.suggestedImprovements?.length > 0
                ? displayData.suggestedImprovements.map((item, i) => (
                    <ImprovementItem key={item.title} item={item} index={i} />
                  ))
                : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                    <p className="text-sm font-medium text-ink dark:text-white">All dimensions are strong</p>
                    <p className="text-xs text-slate-500">No major improvements needed right now.</p>
                  </div>
                )}
            </div>
          </div>

          {/* Chat */}
          <div className="card p-5 flex flex-col">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400" />
              AI Assistant
            </h2>
            <p className="text-xs text-slate-400 mb-3">Ask about your evaluation or get tailored advice</p>

            <div className="flex-1 min-h-[180px] max-h-[280px] overflow-y-auto space-y-3 mb-3 pr-1">
              {chatMessages.length === 0 && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <SparklesIcon className="h-3.5 w-3.5" />
                  </div>
                  <p className="rounded-2xl rounded-tl-none bg-slate-50 dark:bg-primary-700 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 max-w-[85%] leading-relaxed">
                    {aiFeedback}
                  </p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-accent text-primary-800' : 'bg-primary text-white'
                  }`}>
                    {msg.role === 'user'
                      ? <UsersIcon   className="h-3.5 w-3.5" />
                      : <SparklesIcon className="h-3.5 w-3.5" />}
                  </div>
                  <p className={`rounded-2xl px-3.5 py-2.5 text-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-none bg-accent/15 text-ink dark:text-white'
                      : 'rounded-tl-none bg-slate-50 dark:bg-primary-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {msg.text}
                  </p>
                </div>
              ))}
              {isChatSending && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <SparklesIcon className="h-3.5 w-3.5" />
                  </div>
                  <p className="rounded-2xl rounded-tl-none bg-slate-50 dark:bg-primary-700 px-3.5 py-2.5 text-xs text-slate-400 animate-pulse">
                    Thinking…
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} className="flex items-center gap-2 mt-auto">
              <input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)}
                placeholder="Ask about your evaluation…"
                className="input flex-1 text-sm py-2" disabled={isChatSending}
                aria-label="Chat message" />
              <button type="submit" aria-label="Send message"
                className="btn-primary p-2.5 shrink-0"
                disabled={isChatSending || !chatDraft.trim()}>
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-heading font-semibold text-ink dark:text-white flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-slate-400" />
                Evaluation Status &amp; Next Steps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This is an AI-assisted assessment — final decisions are made by the MInT team.
              </p>
            </div>
            <ApprovalBadge status={displayData.approvalStatus} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Improve your idea',        detail: 'Review the recommended improvements and update your startup details.',          action: 'Re-evaluate',      onClick: () => { setShowForm(true); setFormExpanded(true) }, Icon: ArrowPathIcon,    primary: false },
              { title: 'Talk to a mentor',          detail: 'Connect with an expert mentor who can review your evaluation results.',         action: 'View Mentors',     href: '/mentors',                                            Icon: UsersIcon,        primary: false },
              { title: 'Start a new evaluation',    detail: "Ready with a new idea or updated information? Run a fresh evaluation.",          action: 'New Evaluation',   onClick: handleNew,                                          Icon: PlusIcon,         primary: true  },
            ].map(({ title, detail, action, onClick, href, Icon, primary }) => (
              <div key={title} className="rounded-xl border border-slate-100 dark:border-primary-700 p-4 flex flex-col gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{detail}</p>
                </div>
                {href
                  ? <a href={href} className={`${primary ? 'btn-primary' : 'btn-outline'} text-center text-sm mt-auto`}>{action}</a>
                  : <button type="button" onClick={onClick} className={`${primary ? 'btn-primary' : 'btn-outline'} text-sm mt-auto`}>{action}</button>}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-5 leading-relaxed border-t border-slate-100 dark:border-primary-700 pt-4">
            <strong>Important:</strong> AI evaluation scores are a decision-support tool and do not constitute
            an official funding approval or rejection. All final incubation and funding decisions are made
            by the MInT team following a full human review process.
          </p>
        </div>
      </div>

      {/* History modal */}
      {showHistory && (
        <HistoryModal history={history} onClose={() => setShowHistory(false)} onRestore={handleRestoreHistory} />
      )}
    </div>
  )
}

// ─── Evaluation History Modal ──────────────────────────────────────────────────

function HistoryModal({ history, onClose, onRestore }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Evaluation history">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-primary-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-primary-700">
          <div>
            <p className="font-heading font-semibold text-ink dark:text-white flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-slate-400" />
              Evaluation History
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{history.length} saved evaluation{history.length !== 1 ? 's' : ''}</p>
          </div>
          <button type="button" onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700 flex items-center justify-center transition-colors"
            aria-label="Close history">
            <XMarkIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <ClockIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No evaluations saved yet</p>
            </div>
          ) : (
            history.map((entry) => {
              const tone = scoreTone(entry.overall_score || 0)
              return (
                <button key={entry.evaluation_id} type="button"
                  onClick={() => onRestore(entry)}
                  className="w-full text-left card p-4 hover:shadow-soft hover:border-primary/30 transition-all group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink dark:text-white truncate">{entry.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(entry.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-heading text-xl font-bold ${tone.text}`}>{entry.overall_score}</span>
                      <span className={`badge text-xs ${tone.bg} ${tone.text}`}>{entry.rating}</span>
                    </div>
                  </div>
                  {/* Mini score bars */}
                  <div className="grid grid-cols-6 gap-1 mt-3">
                    {Object.values(entry.scores || {}).slice(0, 6).map((v, i) => (
                      <div key={i} className="h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${scoreTone(v).bar}`} style={{ width: `${v}%` }} />
                      </div>
                    ))}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
