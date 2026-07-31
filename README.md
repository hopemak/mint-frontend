# MInT — Innovation Incubator Platform (Frontend)

A complete React frontend for the MInT Innovation Incubator Platform: 15 pages, dark mode,
Tailwind CSS styling in the MInT brand palette, Recharts visualizations, and an Axios
service layer wired to an Express backend at `http://localhost:5000`.

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Connecting your backend

Every page fetches from real REST endpoints via `src/services/api.js`
(`baseURL: http://localhost:5000`). See `src/services/useApiData.js` — each page calls
`useApiData('/api/...', fallbackSample)`.

- **If your backend responds:** the real data renders, and no fallback banner is shown.
- **If the backend is unreachable** (e.g. you haven't built it yet): the page falls back to
  realistic sample data from `src/data/sampleData.js` and shows a small notice banner so it's
  never silently wrong. Once your backend is live, you can delete `sampleData.js` and pass
  `null` as the fallback to `useApiData` to enforce "real data only."

Expected endpoints (adjust to match your actual API):

| Method | Endpoint | Used by |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/dashboard/kpis` | Dashboard |
| GET/POST | `/api/startups` | Startups list / Create Startup |
| POST | `/api/ideas` | Idea Submission |
| GET | `/api/ideas/latest/evaluation` | AI Evaluation |
| GET | `/api/recommendations/mentors` `/investors` `/grants` | Recommendations |
| GET | `/api/analytics` | Analytics |
| GET | `/api/admin/users` | Admin |
| POST | `/api/chatbot/message` | AI Chatbot |
| GET | `/api/funding/requests` | Funding |
| GET | `/api/grants` | Grants |

## Structure

```
src/
  components/     Sidebar, Header, Layout, ProtectedRoute, shared UI (StatCard, PageHeader...)
  context/        AuthContext (login/session), ThemeContext (dark mode)
  services/       api.js (axios instance), useApiData.js (fetch + fallback hook)
  data/           sampleData.js (offline demo fallback data)
  pages/
    Landing/Landing.jsx
    Auth/Login.jsx, Register.jsx
    Dashboard/Dashboard.jsx, IdeaSubmission.jsx, Profile.jsx
    Startups/Startups.jsx, CreateStartup.jsx
    Evaluation/Evaluation.jsx
    Workspace/Workspace.jsx
    Prototype/PrototypeCenter.jsx
    Analytics/Analytics.jsx
    Recommendations/Recommendations.jsx
    Admin/Admin.jsx
    Chatbot/Chatbot.jsx
    Funding/Funding.jsx, Grants.jsx
```

## Brand

- Primary: `#1D4241` · Accent: `#EF9C82` · Background: `#F8FAFC` · Text: `#1A202C`
- Fonts: Inter (body), Poppins (headings) — loaded via Google Fonts in `index.html`
- Dark mode: class-based (`darkMode: 'class'` in `tailwind.config.js`), toggle in the header
  and on the Login page, persisted to `localStorage`

## Auth (demo mode)

`AuthContext` calls `/api/auth/login` and `/api/auth/register`. If the backend isn't running,
it falls back to a local demo session (stored in `localStorage`) so you can explore every
protected page without a backend. Replace this fallback once your auth API is live.

## Notes

- Built with Vite + React 18 + React Router v6 + Tailwind CSS + Recharts + React Hook Form +
  React Hot Toast + Heroicons, per the spec.
- No network access was available while generating this project, so dependencies are declared
  in `package.json` but not pre-installed — run `npm install` after downloading.
