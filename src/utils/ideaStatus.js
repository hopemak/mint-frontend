// What people see for an idea. "evaluated" and "pending" both mean: waiting for the admin.
export function ideaStatusLabel(status) {
  const s = String(status || 'pending').toLowerCase()
  if (s === 'approved') return 'Approved'
  if (s === 'rejected') return 'Rejected'
  if (s === 'revision_requested') return 'Revision requested'
  return 'Pending review'
}
