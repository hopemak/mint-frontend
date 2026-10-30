import { api } from './api.js'

// Asks the backend which saved ideas look similar to this one (cosine + Jaccard).
export const duplicateAPI = {
  check: (idea) =>
    api.post('/api/ml/idea-duplicates', {
      title: idea.title || '',
      problem: idea.problem || '',
      solution: idea.solution || '',
      exclude_id: String(idea.id || idea._id || ''),
    }),
}
