import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  FolderIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UsersIcon,
  DocumentIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, EmptyState } from '../../components/ui.jsx'
import { startupAPI, taskAPI, documentAPI, workspaceAPI, mentorAPI } from '../../services/api.js'

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'border-slate-400' },
  { key: 'progress', label: 'In Progress', color: 'border-blue-400' },
  { key: 'review', label: 'Code Review', color: 'border-purple-400' },
  { key: 'qa', label: 'QA Testing', color: 'border-amber-400' },
  { key: 'done', label: 'Done', color: 'border-emerald-400' },
]

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export default function Workspace() {
  // â”€â”€â”€ STATE â”€â”€â”€
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeTab, setActiveTab] = useState('board') // board | team | documents | activity

  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)

  const [documents, setDocuments] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)

  
  
  

  const [mentors, setMentors] = useState([])
  const [mentorsLoading, setMentorsLoading] = useState(false)

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [milestones, setMilestones] = useState([])
  const [milestoneForm, setMilestoneForm] = useState({ title: '', date: '' })
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', column: 'todo', story_points: 0 })

  const [uploading, setUploading] = useState(false)

  // â”€â”€â”€ LOAD PROJECTS â”€â”€â”€
  useEffect(() => {
    startupAPI.getMyStartups()
      .then((res) => {
        console.log('PROJECTS RAW:', res.data)
        const items = res.data?.data || res.data || []
        console.log('PROJECTS EXTRACTED:', items)
        setProjects(items)
        if (items.length > 0) setSelectedProject(items[0])
      })
      .catch(() => toast.error('Could not load projects'))
  }, [])

  // â”€â”€â”€ LOAD TASKS â”€â”€â”€
  useEffect(() => {
    if (!selectedProject) return
    setTasksLoading(true)
    taskAPI.getAll(selectedProject?.startup_id || selectedProject?.id || selectedProject?._id)
      .then((res) => {
        console.log('TASKS RAW:', res.data)
        const all = res.data?.data || res.data || []
        const pid = selectedProject.startup_id || selectedProject.id
        console.log('ALL TASKS:', all, 'FILTERING BY PID:', pid)
        const filtered = all.filter((t) => {
          const match = (t.startup_id === pid) || (t.startup_id == pid)
          console.log('TASK:', t.title, 'startup_id:', t.startup_id, 'MATCH:', match)
          return match
        })
        setTasks(filtered)
      })
      .catch(() => toast.error('Could not load tasks'))
      .finally(() => setTasksLoading(false))
  }, [selectedProject])

  // â”€â”€â”€ LOAD DOCUMENTS â”€â”€â”€
  useEffect(() => {
    setDocsLoading(true)
    documentAPI.getAll()
      .then((res) => {
        console.log('DOCS RAW:', res.data)
        const all = res.data?.data || res.data || []
        setDocuments(all || [])
      })
      .catch(() => {/* silent - docs optional */})
      .finally(() => setDocsLoading(false))
  }, [selectedProject])

  // â”€â”€â”€ LOAD COMMENTS â”€â”€â”€
  useEffect(() => {
    // Placeholder for comments loading if needed in the future
  }, [])

  // â”€â”€â”€ LOAD MENTORS â”€â”€â”€
  useEffect(() => {
    setMentorsLoading(true)
    mentorAPI.getAll()
      .then((res) => {
        console.log('MENTORS RAW:', res.data)
        setMentors(res.data?.data || res.data || [])
      })
      .catch(() => setMentors([]))
      .finally(() => setMentorsLoading(false))
  }, [])

  // â”€â”€â”€ COMPUTED â”€â”€â”€
  
  const filteredMentors = useMemo(() => {
    if (!selectedProject || !selectedProject.sector || !mentors.length) return mentors
    const sector = selectedProject.sector.toLowerCase()
    return mentors.filter(m => {
      const prefs = Array.isArray(m.preferred_sectors) ? m.preferred_sectors : []
      const expertise = Array.isArray(m.expertise_areas) ? m.expertise_areas : []
      return prefs.some(s => s.toLowerCase().includes(sector)) ||
             expertise.some(e => e.toLowerCase().includes(sector)) ||
             sector.includes((m.preferred_sectors || []).join(' ').toLowerCase())
    })
  }, [mentors, selectedProject])

const sprintStats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.column === 'done').length
    const inProgress = tasks.filter((t) => t.column === 'progress').length
    const storyPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0)
    return { total, done, inProgress, storyPoints }
  }, [tasks])

  // â”€â”€â”€ HANDLERS â”€â”€â”€
  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim() || !selectedProject) return
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description || '',
        priority: taskForm.priority || 'Medium',
        column: taskForm.column || 'todo',
        status: taskForm.column || 'todo',
        startup_id: selectedProject.startup_id || selectedProject.id || selectedProject._id,
        story_points: taskForm.story_points || 0
      }
      console.log('TASK CREATE PAYLOAD:', payload)
      await taskAPI.create(payload)
      toast.success('Task created')
      setTaskForm({ title: '', description: '', priority: 'Medium', column: 'todo' })
      setShowTaskForm(false)
      // Refresh
      const res = await taskAPI.getAll(selectedProject?.startup_id || selectedProject?.id || selectedProject?._id)
      const all = res.data?.data || res.data || []
      const pid = selectedProject.startup_id || selectedProject.id
      console.log('REFRESH TASKS AFTER CREATE:', all)
      setTasks(all.filter((t) => (t.startup_id === pid) || (t.startup_id == pid)))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task')
    }
  }

  const handleMoveTask = async (task, newColumn) => {
    try {
      await taskAPI.update(task.id, { column: targetCol, status: targetCol })
      setTasks((prev) => prev.map((t) => (t.id === task.id || t.task_id === task.task_id ? { ...t, column: newColumn } : t)))
    } catch (err) {
      toast.error('Failed to move task')
    }
  }

  const handleAddMilestone = (e) => {
    e.preventDefault()
    if (!milestoneForm.title.trim() || !milestoneForm.date) return
    const newMilestone = {
      title: milestoneForm.title,
      date: milestoneForm.date,
      completed: false
    }
    const updated = [...milestones, newMilestone]
    setMilestones(updated)
    setMilestoneForm({ title: '', date: '' })
    setShowMilestoneForm(false)
    toast.success('Milestone added')
    // Save to localStorage for persistence
    localStorage.setItem('milestones_' + (selectedProject?.startup_id || selectedProject?.id), JSON.stringify(updated))
  }

  const toggleMilestone = (index) => {
    const updated = milestones.map((m, i) => i === index ? { ...m, completed: !m.completed } : m)
    setMilestones(updated)
    localStorage.setItem('milestones_' + (selectedProject?.startup_id || selectedProject?.id), JSON.stringify(updated))
  }

  const deleteMilestone = (index) => {
    const updated = milestones.filter((_, i) => i !== index)
    setMilestones(updated)
    localStorage.setItem('milestones_' + (selectedProject?.startup_id || selectedProject?.id), JSON.stringify(updated))
    toast.success('Milestone deleted')
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskAPI.delete(id)
      setTasks((prev) => prev.filter((t) => (t.id || t.task_id || t._id) !== id))
      toast.success('Task deleted')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await documentAPI.upload(file, { project_id: selectedProject?.startup_id || selectedProject?.id })
      toast.success('File uploaded')
      const res = await documentAPI.getAll()
      console.log('DOCS AFTER UPLOAD:', res.data)
      setDocuments(res.data?.data || res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Delete this file?')) return
    try {
      await documentAPI.delete(id)
      setDocuments((prev) => prev.filter((d) => (d.id || d.document_id) !== id))
      toast.success('File deleted')
    } catch (err) {
      toast.error('Failed to delete file')
    }
  }

  const formatDate = (iso) => {
    if (!iso) return 'â€”'
    return new Date(iso).toLocaleDateString()
  }

  if (!selectedProject && projects.length === 0) {
    return (
      <div className="p-8">
        <PageHeader eyebrow="Workspace" title="Project Workspace" />
        <EmptyState title="No projects yet" subtitle="Create a startup to start using the workspace." />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* â”€â”€â”€ TOP BAR â”€â”€â”€ */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-primary-700 bg-white dark:bg-primary-800">
        <div className="flex items-center gap-4">
          <select
            className="input text-sm py-1.5 pr-8"
            value={selectedProject ? (selectedProject.startup_id || selectedProject.id) : ''}
            onChange={(e) => {
              const p = projects.find((proj) => (proj.startup_id || proj.id) === e.target.value)
              setSelectedProject(p || null)
            }}
          >
            {projects.map((p) => (
              <option key={p.startup_id || p.id} value={p.startup_id || p.id}>
                {p.business_name || p.name || 'Unnamed'}
              </option>
            ))}
          </select>
          <span className={`badge text-xs ${PRIORITY_BADGE[selectedProject?.status] || 'bg-slate-100 text-slate-600'}`}>
            {selectedProject?.status || 'submitted'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {['board', 'team', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-primary-700'
              }`}
            >
              {tab === 'board' && 'Board'}
              {tab === 'team' && 'Team'}
              {tab === 'documents' && 'Files'}
              {tab === 'activity' && 'Activity'}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€â”€ MAIN CONTENT â”€â”€â”€ */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT: Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'board' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Project Board</h2>
                <button onClick={() => setShowTaskForm(true)} className="btn btn-primary text-sm flex items-center gap-1">
                  <PlusIcon className="h-4 w-4" /> New Task
                </button>
              </div>

              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="card p-4 mb-4 grid sm:grid-cols-4 gap-3">
                  <input
                    required
                    placeholder="Task title"
                    className="input text-sm sm:col-span-2"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                  <select
                    className="input text-sm"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                  <select
                    className="input text-sm"
                    value={taskForm.column}
                    onChange={(e) => setTaskForm({ ...taskForm, column: e.target.value })}
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Description (optional)"
                    className="input text-sm sm:col-span-3"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowTaskForm(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
                    <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
                  </div>
                </form>
              )}

              {tasksLoading ? (
                <LoadingBlock />
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {COLUMNS.map((col) => (
                    <div key={col.key} className={`bg-slate-50 dark:bg-primary-800/50 rounded-xl p-3 border-t-4 ${col.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">{col.label}</h3>
                        <span className="text-xs text-slate-400">{tasks.filter((t) => t.column === col.key).length}</span>
                      </div>
                      <div className="space-y-2">
                        {tasks
                          .filter((t) => t.column === col.key)
                          .map((task) => (
                            <div
                              key={task.id || task.task_id}
                              className="bg-white dark:bg-primary-700 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-primary-600"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium line-clamp-2">{task.title}</p>
                                <button
                                  onClick={() => handleDeleteTask(task.id || task.task_id || task._id)}
                                  className="text-slate-300 hover:text-red-400 shrink-0"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {task.description && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY_BADGE[task.priority || 'Medium'] || PRIORITY_BADGE.medium}`}>
                                  {task.priority || 'medium'}
                                </span>
                                <div className="flex gap-1">
                                  {COLUMNS.map((c) => (
                                    <button
                                      key={c.key}
                                      onClick={() => handleMoveTask(task, c.key)}
                                      title={`Move to ${c.label}`}
                                      className={`w-2 h-2 rounded-full ${c.key === task.column ? 'bg-primary' : 'bg-slate-200 hover:bg-slate-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Team & Mentors</h2>
                <div className="text-xs text-slate-400">
                  {filteredMentors.length} matching · {mentors.length} total
                </div>
              </div>
              {mentorsLoading ? (
                <LoadingBlock />
              ) : mentors.length === 0 ? (
                <EmptyState title="No mentors yet" subtitle="Mentors will appear here when available." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mentors.map((m) => {
                    const isMatch = filteredMentors.includes(m)
                    return (
                      <div 
                        key={m.mentor_id || m.id || m._id} 
                        className={`card p-4 hover:shadow-md transition-shadow cursor-pointer ${isMatch ? 'ring-1 ring-primary/30' : 'opacity-75'}`}
                        onClick={() => { setSelectedMentor(m); setShowMentorModal(true); }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {(m.full_name || m.name || '?').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{m.full_name || m.name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-400">{m.years_experience ? m.years_experience + ' years experience' : 'Mentor'}</p>
                            {isMatch && (
                              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                Recommended for {selectedProject?.sector}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(Array.isArray(m.expertise_areas) ? m.expertise_areas : (m.expertise_areas ? String(m.expertise_areas).split(',').map(s=>s.trim()) : [])).map((area, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-primary-700 text-slate-600 dark:text-slate-300 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-primary-700">
                          <div className="flex items-center gap-2">
                            {m.rating && (
                              <span className="text-xs text-amber-600 font-medium">{'★'.repeat(Math.round(m.rating))} {m.rating}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${m.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {m.availability || 'Unknown'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{m.country || ''}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Files & Documents</h2>
                <label className="btn btn-primary text-sm flex items-center gap-1 cursor-pointer">
                  <PlusIcon className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
              {docsLoading ? (
                <LoadingBlock />
              ) : documents.length === 0 ? (
                <EmptyState title="No files yet" subtitle="Upload documents to share with your team." />
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={doc.id || doc.document_id} className="card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DocumentIcon className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.filename || doc.name || 'Untitled'}</p>
                          <p className="text-xs text-slate-400">
                            {doc.file_type || 'file'} Â· {formatDate(doc.uploaded_at || doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc(doc.id || doc.document_id)}
                        className="text-slate-300 hover:text-red-400 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-72 border-l border-slate-100 dark:border-primary-700 bg-slate-50/50 dark:bg-primary-800/30 p-4 space-y-6 overflow-y-auto">
          {/* Sprint Stats */}
          <div className="card p-4">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4 text-primary" /> Sprint Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-primary">{sprintStats.total}</p>
                <p className="text-xs text-slate-400">Total Tasks</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-emerald-500">{sprintStats.done}</p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">{sprintStats.inProgress}</p>
                <p className="text-xs text-slate-400">In Progress</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-amber-500">{sprintStats.storyPoints}</p>
                <p className="text-xs text-slate-400">Story Points</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" /> Milestones
              </h3>
              <button
                onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                className="text-xs text-primary hover:text-primary-600"
              >
                {showMilestoneForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showMilestoneForm && (
              <form onSubmit={handleAddMilestone} className="mb-3 space-y-2">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-primary-700 dark:border-primary-600"
                  required
                />
                <input
                  type="date"
                  value={milestoneForm.date}
                  onChange={(e) => setMilestoneForm({...milestoneForm, date: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-primary-700 dark:border-primary-600"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary-600"
                >
                  Add Milestone
                </button>
              </form>
            )}

            {milestones.length > 0 ? (
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <button
                      onClick={() => toggleMilestone(i)}
                      className="shrink-0 mt-0.5"
                    >
                      {m.completed ? (
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${m.completed ? 'line-through text-slate-400' : ''}`}>
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(m.date)}</p>
                    </div>
                    <button
                      onClick={() => deleteMilestone(i)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 shrink-0"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No milestones set.</p>
            )}
          </div>

          {/* Team Quick View */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-primary" /> Team
              </h3>
              <button
                onClick={() => setActiveTab('team')}
                className="text-xs text-primary hover:text-primary-600"
              >
                View All
              </button>
            </div>
            {filteredMentors.length > 0 ? (
              <div className="space-y-3">
                {filteredMentors.slice(0, 3).map((m) => (
                  <div 
                    key={m.mentor_id || m.id || m._id} 
                    className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary-700/50 p-1.5 rounded-lg transition-colors"
                    onClick={() => { setSelectedMentor(m); setShowMentorModal(true); }}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {(m.full_name || m.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{(m.full_name || m.name || 'Unnamed')}</p>
                      <p className="text-xs text-slate-400 truncate">{m.years_experience ? m.years_experience + ' yrs exp' : 'Mentor'}</p>
                      {m.expertise_areas && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(m.expertise_areas) ? m.expertise_areas : String(m.expertise_areas).split(',').map(s=>s.trim())).slice(0, 2).map((area, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                          {m.availability || 'Available'}
                        </span>
                        {m.rating && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            {m.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMentors.length > 3 && (
                  <button
                    onClick={() => setActiveTab('team')}
                    className="text-xs text-primary hover:underline w-full text-center py-1"
                  >
                    +{filteredMentors.length - 3} more mentors
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No matching mentors for this sector.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Mentor Detail Modal */}
      {showMentorModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMentorModal(false)}>
          <div className="bg-white dark:bg-primary-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                {(selectedMentor.full_name || selectedMentor.name || '?').charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{(selectedMentor.full_name || selectedMentor.name || 'Unnamed')}</h3>
                <p className="text-sm text-slate-400">{selectedMentor.years_experience ? selectedMentor.years_experience + ' years experience' : 'Mentor'}</p>
                <div className="flex gap-2 mt-2">
                  {selectedMentor.rating && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{'★'.repeat(Math.round(selectedMentor.rating))} {selectedMentor.rating}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedMentor.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedMentor.availability || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedMentor.expertise_areas) ? selectedMentor.expertise_areas : (selectedMentor.expertise_areas ? String(selectedMentor.expertise_areas).split(',').map(s=>s.trim()) : [])).map((area, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{area}</span>
                ))}
              </div>
            </div>
            {selectedMentor.preferred_sectors && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Preferred Sectors</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedMentor.preferred_sectors) ? selectedMentor.preferred_sectors : []).map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-slate-100 dark:bg-primary-700 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { toast.success('Message sent to ' + (selectedMentor.full_name || selectedMentor.name)); setShowMentorModal(false); }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm font-medium"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowMentorModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-primary-600 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
