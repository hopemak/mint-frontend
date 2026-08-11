import re

with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix event form state
content = content.replace(
    "const [eventForm, setEventForm] = useState({ title: '', type: 'Workshop', when: '', attendees: '', location: '' })",
    "const [eventForm, setEventForm] = useState({ title: '', day: '', month: '', year: '', location: '', time: '' })"
)

# 2. Fix handleCreateEvent payload
old_payload = """      const payload = {
        ...eventForm,
        attendees: Number(eventForm.attendees),
      }"""
new_payload = """      const payload = {
        title: eventForm.title,
        day: eventForm.day,
        month: eventForm.month,
        year: eventForm.year,
        location: eventForm.location,
        time: eventForm.time,
      }"""
content = content.replace(old_payload, new_payload)

# 3. Fix form reset
content = content.replace(
    "setEventForm({ title: '', type: 'Workshop', when: '', attendees: '', location: '' })",
    "setEventForm({ title: '', day: '', month: '', year: '', location: '', time: '' })"
)

# 4. Replace the entire event creation form
old_form_pat = r'<form onSubmit=\{handleCreateEvent\} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">.*?</form>'
new_form = '''<form onSubmit={handleCreateEvent} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input required placeholder="Event title" className="input text-sm" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <input required type="number" placeholder="Day (1-31)" className="input text-sm" value={eventForm.day} onChange={(e) => setEventForm({ ...eventForm, day: e.target.value })} />
            <input required type="number" placeholder="Month (1-12)" className="input text-sm" value={eventForm.month} onChange={(e) => setEventForm({ ...eventForm, month: e.target.value })} />
            <input required type="number" placeholder="Year" className="input text-sm" value={eventForm.year} onChange={(e) => setEventForm({ ...eventForm, year: e.target.value })} />
            <input required placeholder="Location" className="input text-sm" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <input required type="time" placeholder="Time" className="input text-sm" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button type="button" onClick={() => setShowCreateEvent(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
            </div>
          </form>'''
content = re.sub(old_form_pat, new_form, content, flags=re.DOTALL)

# 5. Fix event display cards
old_card = r'{events\.map\(\(ev, evi\) => \('
new_card = '''{events.map((ev, evi) => ('''
content = content.replace(old_card, new_card)

# Fix event card display fields
content = content.replace(
    '{ev.title}',
    "{ev.title || 'Untitled Event'}"
)
content = content.replace(
    '{ev.when || ev.date}',
    "{ev.day && ev.month && ev.year ? `${ev.day}/${ev.month}/${ev.year}` : (ev.when || ev.date || 'TBD')}"
)
content = content.replace(
    '{ev.location}',
    "{ev.location || 'TBD'}"
)
content = content.replace(
    '{ev.type}',
    "{ev.time || ev.type || 'TBD'}"
)
content = content.replace(
    '{ev.attendees || 0}',
    "{ev.registered_users ? ev.registered_users.length : (ev.attendees || 0)}"
)

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Events fixed:')
print('  - Form state: title, day, month, year, location, time')
print('  - Payload matches backend required fields')
print('  - Display cards show title, date, location, time, registered users')
