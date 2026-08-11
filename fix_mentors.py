import re

with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix mentor form state
content = content.replace(
    "const [mentorForm, setMentorForm] = useState({ name: '', title: '', years: '', rating: '', email: '', expertise: '' })",
    "const [mentorForm, setMentorForm] = useState({ full_name: '', expertise_areas: '', years_experience: '', email: '', bio: '' })"
)

# 2. Fix handleCreateMentor payload
old_payload = """      const payload = {
        ...mentorForm,
        years: Number(mentorForm.years),
        rating: Number(mentorForm.rating),
      }"""
new_payload = """      const payload = {
        full_name: mentorForm.full_name,
        expertise_areas: mentorForm.expertise_areas.split(',').map((t) => t.trim()).filter(Boolean),
        years_experience: Number(mentorForm.years_experience),
        email: mentorForm.email || '',
        bio: mentorForm.bio || '',
      }"""
content = content.replace(old_payload, new_payload)

# 3. Fix form reset
content = content.replace(
    "setMentorForm({ name: '', title: '', years: '', rating: '', email: '', expertise: '' })",
    "setMentorForm({ full_name: '', expertise_areas: '', years_experience: '', email: '', bio: '' })"
)

# 4. Replace the entire mentor creation form
old_form_pat = r'<form onSubmit=\{handleCreateMentor\} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">.*?</form>'
new_form = '''<form onSubmit={handleCreateMentor} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input required placeholder="Full name" className="input text-sm" value={mentorForm.full_name} onChange={(e) => setMentorForm({ ...mentorForm, full_name: e.target.value })} />
            <input required type="number" placeholder="Years of experience" className="input text-sm" value={mentorForm.years_experience} onChange={(e) => setMentorForm({ ...mentorForm, years_experience: e.target.value })} />
            <input required placeholder="Expertise areas (comma separated)" className="input text-sm sm:col-span-2" value={mentorForm.expertise_areas} onChange={(e) => setMentorForm({ ...mentorForm, expertise_areas: e.target.value })} />
            <input placeholder="Email" className="input text-sm" value={mentorForm.email} onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })} />
            <input placeholder="Bio (optional)" className="input text-sm sm:col-span-2 lg:col-span-6" value={mentorForm.bio} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button type="button" onClick={() => setShowCreateMentor(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
            </div>
          </form>'''
content = re.sub(old_form_pat, new_form, content, flags=re.DOTALL)

# 5. Fix mentor display cards
content = content.replace('{m.name}', "{m.full_name || m.name || 'Unnamed'}")
content = content.replace('{m.title}', "{m.bio || m.title || 'Mentor'}")
content = content.replace('{m.years}', "{m.years_experience || m.years || 0}")
content = content.replace('{m.rating}', "{m.rating || 'N/A'}")
content = content.replace('{m.email}', "{m.email || 'N/A'}")

# Fix expertise display
content = content.replace(
    "{m.expertise.split(',').map((ex, ei) => (",
    "{(m.expertise_areas || (m.expertise ? m.expertise.split(',') : [])).map((ex, ei) => ("
)

# Fix delete handler
content = content.replace('handleDeleteMentor(m.id || m._id)', 'handleDeleteMentor(m.mentor_id || m.id || m._id)')

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Mentors fixed:')
print('  - Form state: full_name, expertise_areas, years_experience, email, bio')
print('  - Payload matches backend required fields')
print('  - Display cards show full_name, expertise_areas, years_experience')
