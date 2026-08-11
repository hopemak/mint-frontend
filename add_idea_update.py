import os, glob

# Find ideas.py
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/ideas.py'), recursive=True)

if not matches:
    print("ideas.py not found")
    exit()

path = matches[0]
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if update route already exists
if 'def update_idea' in content:
    print('Update route already exists')
else:
    # Find the last route and add update after it
    update_route = '''

@ideas_bp.route('/<idea_id>', methods=['PUT'])
@jwt_required()
def update_idea(idea_id):
    data = request.get_json()
    ideas = load_ideas()
    
    for idea in ideas['ideas']:
        if idea.get('id') == idea_id:
            # Update allowed fields
            allowed = ['title', 'problem', 'solution', 'category', 'industry', 'innovation_level', 'status']
            for field in allowed:
                if field in data:
                    idea[field] = data[field]
            idea['updated_at'] = datetime.utcnow().isoformat()
            save_ideas(ideas)
            return jsonify({'success': True, 'data': idea}), 200
    
    return jsonify({'error': 'Idea not found'}), 404
'''
    
    # Append before the last line or at the end
    content = content.rstrip() + update_route + '\n'
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Added PUT /api/ideas/<idea_id> route to backend')

# Check api.js for ideaAPI.update
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

if 'update:' in api and 'ideaAPI' in api:
    print('ideaAPI.update already exists in api.js')
else:
    # Add update to ideaAPI
    old = """ideaAPI = {
  submit: (data) => api.post('/api/ideas/', data),
  getAll: () => api.get('/api/ideas'),
  getById: (id) => api.get(`/api/ideas/${id}`),"""
    new = """ideaAPI = {
  submit: (data) => api.post('/api/ideas/', data),
  getAll: () => api.get('/api/ideas'),
  getById: (id) => api.get(`/api/ideas/${id}`),
  update: (id, data) => api.put(`/api/ideas/${id}`, data),"""
    api = api.replace(old, new)
    with open('src/services/api.js', 'w', encoding='utf-8') as f:
        f.write(api)
    print('Added ideaAPI.update to api.js')
