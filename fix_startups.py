import re

with open('src/pages/Startups/Startups.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original size: {len(content)} chars")

# 1. Replace useApiData with startupAPI.getAll and remove sample fallback
old_hook = "const { data, loading, isFallback } = useApiData('/api/startups', sampleStartups)"
new_hook = '''const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    startupAPI.getAll()
      .then((res) => {
        const items = res.data?.data || res.data || []
        setData(items)
        setError(null)
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message)
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [])'''

content = content.replace(old_hook, new_hook)

# 2. Add startupAPI import
old_import = "import { useApiData } from '../../services/useApiData.js'"
new_import = "import { startupAPI } from '../../services/api.js'"
content = content.replace(old_import, new_import)

# 3. Remove sampleData import
old_sample = "import { startups as sampleStartups } from '../../data/sampleData.js'\n"
content = content.replace(old_sample, '')

# 4. Add useEffect import
old_react = "import React, { useMemo, useState } from 'react'"
new_react = "import React, { useMemo, useState, useEffect } from 'react'"
content = content.replace(old_react, new_react)

# 5. Remove isFallback banner
old_banner = "{isFallback && <ErrorNotice />}\n\n"
content = content.replace(old_banner, '')

# 6. Fix field mappings: id → startup_id, name → business_name
content = content.replace("key={s.id}", "key={s.startup_id || s.id}")
content = content.replace("{s.name}", "{s.business_name || s.name || 'Unnamed'}")
content = content.replace("{s.sector}", "{s.sector || 'Unspecified'}")
content = content.replace("{s.trl}/9", "{s.trl_level || s.trl || 'N/A'}/9")
content = content.replace("{s.status}", "{s.status || 'submitted'}")

# 7. Fix funding display
content = content.replace(
    "{s.funding ? `$${s.funding.toLocaleString()}` : '—'}",
    "{s.funding || s.funding_needed ? `$${(s.funding || s.funding_needed).toLocaleString()}` : '—'}"
)

# 8. Add loading/error guards before the table
old_table_start = "{loading ? ("
new_table_start = '''  if (loading) return <LoadingBlock />
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!data || data.length === 0) return <EmptyState title="No startups yet" subtitle="Create your first startup to get started." />

  const filtered = useMemo(() => {
    return (data || [])
      .filter((s) => (s.business_name || s.name || '').toLowerCase().includes(query.toLowerCase()))
      .filter((s) => status === 'All' || (s.status || 'submitted') === status)
  }, [data, query, status])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Startups"
        action={
          <Link to="/startups/create" className="btn btn-primary">
            <PlusIcon className="h-5 w-5" /> Create Startup
          </Link>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">'''

# Replace the whole top section
old_top = '''export default function Startups() {
  const { data, loading, isFallback } = useApiData('/api/startups', sampleStartups)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return (data || [])
      .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      .filter((s) => status === 'All' || s.status === status)
  }, [data, query, status])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(filtered.length/ PAGE_SIZE))

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Startups"
        action={
          <Link to="/startups/create" className="btn-primary">
            <PlusIcon className="h-5 w-5" /> Create Startup
          </Link>
        }
      />

      {isFallback && <ErrorNotice />}

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">'''

new_top = '''export default function Startups() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    startupAPI.getAll()
      .then((res) => {
        const items = res.data?.data || res.data || []
        setData(items)
        setError(null)
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message)
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingBlock />
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!data || data.length === 0) return <EmptyState title="No startups yet" subtitle="Create your first startup to get started." />

  const filtered = useMemo(() => {
    return data
      .filter((s) => (s.business_name || s.name || '').toLowerCase().includes(query.toLowerCase()))
      .filter((s) => status === 'All' || (s.status || 'submitted') === status)
  }, [data, query, status])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Startups"
        action={
          <Link to="/startups/create" className="btn btn-primary">
            <PlusIcon className="h-5 w-5" /> Create Startup
          </Link>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">'''

content = content.replace(old_top, new_top)

# 9. Remove the old loading block from JSX (since we handle it above)
old_loading_block = '''      {loading ? (
        <LoadingBlock />
      ) : filtered.length === 0 ? (
        <EmptyState title="No startups match your filters" subtitle="Try clearing your search or filter." />
      ) : ('''
new_loading_block = '''      {filtered.length === 0 ? (
        <EmptyState title="No startups match your filters" subtitle="Try clearing your search or filter." />
      ) : ('''

content = content.replace(old_loading_block, new_loading_block)

# 10. Fix closing parenthesis
old_close = '''      )}
    </div>
  )
}'''
new_close = '''      )}
    </div>
  )
}'''
# This should already match

with open('src/pages/Startups/Startups.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"New size: {len(content)} chars")
print("✅ Startups.jsx fixed:")
print("  - Uses startupAPI.getAll() instead of useApiData")
print("  - Maps business_name → display name")
print("  - Maps startup_id → key")
print("  - Handles missing fields gracefully")
print("  - Removed sample data fallback")
