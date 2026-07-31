import React from 'react'

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-600 mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink dark:text-white">
          {title}
        </h1>
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, change, tone = 'primary' }) {
  const toneMap = {
    primary: 'bg-primary/10 text-primary dark:bg-primary-700 dark:text-accent-200',
    accent: 'bg-accent/15 text-accent-600',
  }
  return (
    <div className="card p-5 flex items-center gap-4">
      {Icon && (
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-heading font-semibold text-ink dark:text-white">{value}</p>
          {change && <span className="text-xs font-medium text-emerald-600">{change}</span>}
        </div>
      </div>
    </div>
  )
}

export function LoadingBlock({ label = 'Loading...' }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorNotice({ message = "Couldn't reach the server. Showing sample data instead." }) {
  return (
    <div className="mb-4 rounded-xl bg-accent-50 border border-accent-200 text-accent-600 text-sm px-4 py-2.5">
      {message}
    </div>
  )
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="card p-10 text-center">
      <p className="font-heading font-semibold text-ink dark:text-white">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}
