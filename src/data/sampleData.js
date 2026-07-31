export const kpis = {
  totalStartups: 231,
  totalFunding: 728800000,
  activeMentors: 200,
  successRate: 78,
}

export const startupProgress = [
  { month: 'Jan', progress: 62 },
  { month: 'Feb', progress: 58 },
  { month: 'Mar', progress: 74 },
  { month: 'Apr', progress: 68 },
  { month: 'May', progress: 81 },
  { month: 'Jun', progress: 88 },
]

export const kpiTrend = [
  { month: 'Jan', sessions: 780000, ideas: 210 },
  { month: 'Feb', sessions: 560000, ideas: 190 },
  { month: 'Mar', sessions: 420000, ideas: 260 },
  { month: 'Apr', sessions: 690000, ideas: 310 },
  { month: 'May', sessions: 890000, ideas: 340 },
  { month: 'Jun', sessions: 730000, ideas: 300 },
]

export const fundingDonut = [
  { name: 'Disbursed', value: 38, color: '#1D4241' },
  { name: 'Approved', value: 20, color: '#4C8884' },
  { name: 'Pending', value: 10, color: '#EF9C82' },
  { name: 'Under Review', value: 32, color: '#C7DAD8' },
]

export const upcomingEvents = [
  { id: 1, title: 'Founder-Mentor Roundtable', type: 'Workshop', when: 'Today · 2:00 PM', attendees: 3 },
  { id: 2, title: 'Grant Writing Clinic', type: 'Meeting', when: 'Today · 4:00 PM', attendees: 5 },
  { id: 3, title: 'Demo Day Rehearsal', type: 'Workshop', when: 'Tomorrow · 10:00 AM', attendees: 8 },
]

export const activityFeed = [
  { id: 1, title: 'Idea approved for evaluation', detail: 'AgriSense AI moved to AI Evaluation stage.', time: '1h ago' },
  { id: 2, title: 'New mentor match found', detail: 'Dr. Evelyn Reed matched with your startup at 96%.', time: '3h ago' },
  { id: 3, title: 'Funding request submitted', detail: 'Request for $250,000 sent to Tech Growth Fund.', time: '5h ago' },
]

export const startups = [
  { id: 'ST-1042', name: 'AgriSense AI', sector: 'AgriTech', trl: 6, status: 'Active', funding: 250000 },
  { id: 'ST-1041', name: 'MediTrack', sector: 'HealthTech', trl: 4, status: 'Incubating', funding: 120000 },
  { id: 'ST-1040', name: 'PayBridge', sector: 'FinTech', trl: 7, status: 'Funded', funding: 500000 },
  { id: 'ST-1039', name: 'EcoCharge', sector: 'CleanTech', trl: 3, status: 'Evaluation', funding: 0 },
  { id: 'ST-1038', name: 'LearnLoop', sector: 'EdTech', trl: 5, status: 'Active', funding: 80000 },
  { id: 'ST-1037', name: 'UrbanFlow', sector: 'Mobility', trl: 6, status: 'Incubating', funding: 175000 },
]

export const evaluation = {
  overallScore: 87,
  rating: 'Excellent',
  scores: {
    innovation: 85,
    feasibility: 78,
    marketPotential: 92,
    technicalComplexity: 65,
    socialImpact: 74,
    financialViability: 81,
  },
  radar: [
    { subject: 'Innovation', value: 85 },
    { subject: 'Feasibility', value: 78 },
    { subject: 'Market', value: 92 },
    { subject: 'Technical', value: 65 },
    { subject: 'Social', value: 74 },
    { subject: 'Financial', value: 81 },
  ],
  risks: [
    { name: 'Technological', level: 'Medium' },
    { name: 'Market Acceptance', level: 'Low' },
    { name: 'Regulatory', level: 'High' },
  ],
  swot: {
    strengths: ['Strong technical founding team', 'Clear early customer traction'],
    weaknesses: ['Limited go-to-market budget', 'Single-market dependency'],
    opportunities: ['Growing regional demand', 'Government grant alignment'],
    threats: ['New entrants with more capital', 'Regulatory delays possible'],
  },
  approvalStatus: 'Recommended for Funding',
  suggestedImprovements: [
    { title: 'Refine user interface', detail: 'Simplify onboarding to reduce drop-off.' },
    { title: 'Target a specific niche', detail: 'Narrow initial launch to one region.' },
    { title: 'Optimize unit economics', detail: 'Reduce customer acquisition cost.' },
  ],
}

export const mentors = [
  { id: 1, name: 'Dr. Evelyn Reed', title: 'Product Strategy', years: 12, rating: 4.9, match: 96 },
  { id: 2, name: 'Dr. Saton Bereket', title: 'SaaS Growth', years: 10, rating: 4.8, match: 95 },
  { id: 3, name: 'Amesal Katin', title: 'Fundraising', years: 14, rating: 4.9, match: 93 },
  { id: 4, name: 'Dr. Rana Girma', title: 'AI & ML', years: 11, rating: 4.7, match: 91 },
]

export const investors = [
  { id: 1, name: 'Apex Ventures', focus: 'Seed & Series A', stage: 'Seed', match: 98 },
  { id: 2, name: 'Synergy Capital', focus: 'Growth Equity', stage: 'Series B', match: 95 },
]

export const grants = [
  { id: 1, name: 'National Innovation Grant', tags: ['Seed Stage', 'Tech', 'R&D'], amount: 250000, deadline: '2026-09-10', status: 'Open', type: 'Government', match: 92, daysLeft: 14 },
  { id: 2, name: 'Eco Innovation Grant', tags: ['CleanTech', 'Sustainability'], amount: 300000, deadline: '2026-08-30', status: 'Open', type: 'Government', match: 88, daysLeft: 9 },
  { id: 3, name: 'Digital Health Fund', tags: ['HealthTech', 'R&D'], amount: 400000, deadline: '2026-10-15', status: 'Open', type: 'NGO', match: 76, daysLeft: 45 },
  { id: 4, name: 'Women in Tech Grant', tags: ['Any Sector'], amount: 150000, deadline: '2026-08-05', status: 'Closing Soon', type: 'NGO', match: 81, daysLeft: 5 },
  { id: 5, name: 'Apex Ventures Seed Round', tags: ['Seed Stage', 'Tech'], amount: 500000, deadline: '2026-09-20', status: 'Open', type: 'Private Investors', match: 94, daysLeft: 21 },
  { id: 6, name: 'Synergy Capital Growth Fund', tags: ['Series A', 'SaaS'], amount: 750000, deadline: '2026-10-01', status: 'Open', type: 'Private Investors', match: 85, daysLeft: 30 },
  { id: 7, name: 'World Bank Innovation Challenge', tags: ['Global', 'Any Sector'], amount: 600000, deadline: '2026-11-05', status: 'Open', type: 'International Programs', match: 79, daysLeft: 60 },
  { id: 8, name: 'AU Digital Economy Grant', tags: ['Africa', 'FinTech'], amount: 350000, deadline: '2026-09-28', status: 'Open', type: 'International Programs', match: 87, daysLeft: 28 },
]

export const fundingRequests = [
  { id: 'FR-2201', startup: 'AgriSense AI', amount: 250000, status: 'Pending', date: '2026-07-18' },
  { id: 'FR-2198', startup: 'PayBridge', amount: 500000, status: 'Approved', date: '2026-07-10' },
  { id: 'FR-2190', startup: 'UrbanFlow', amount: 175000, status: 'Disbursed', date: '2026-06-30' },
  { id: 'FR-2185', startup: 'EcoCharge', amount: 90000, status: 'Rejected', date: '2026-06-21' },
]

export const analytics = {
  activeStartups: 231,
  ideasSubmitted: 637,
  totalFunding: '$728.8M',
  mentors: 200,
  jobsCreated: 208,
  growthTrend: [
    { month: 'Jan', value: 30 }, { month: 'Feb', value: 55 }, { month: 'Mar', value: 58 },
    { month: 'Apr', value: 95 }, { month: 'Jun', value: 70 }, { month: 'Jul', value: 62 },
    { month: 'Aug', value: 100 }, { month: 'Sep', value: 140 }, { month: 'Oct', value: 160 },
    { month: 'Nov', value: 170 },
  ],
  submissionsByQuarter: [
    { q: 'Q1', submitted: 120, approved: 82 },
    { q: 'Q2', submitted: 172, approved: 145 },
    { q: 'Q3', submitted: 130, approved: 160 },
    { q: 'Q4', submitted: 155, approved: 165 },
  ],
  forecast: [
    { month: 'Jan', optimistic: 1850, base: 1850, conservative: 1850 },
    { month: 'Mar', optimistic: 2050, base: 1950, conservative: 1900 },
    { month: 'May', optimistic: 2250, base: 2000, conservative: 1920 },
    { month: 'Jul', optimistic: 2450, base: 2050, conservative: 1940 },
  ],
  fundingByStage: [
    { name: 'Seed', value: 35, color: '#1D4241' },
    { name: 'Series A', value: 25, color: '#4C8884' },
    { name: 'Growth', value: 30, color: '#EF9C82' },
    { name: 'Pre-Seed', value: 10, color: '#C7DAD8' },
  ],
  regions: [
    { region: 'Addis Ababa', index: 136, change: 0.82 },
    { region: 'Nairobi', index: 132, change: 0.81 },
    { region: 'Lagos', index: 133, change: 0.82 },
    { region: 'Kigali', index: 136, change: 0.87 },
    { region: 'Cairo', index: 137, change: 0.72 },
  ],
}

export const conversations = [
  { id: 1, title: 'Government Policies', icon: 'policy', updated: '4 hours ago' },
  { id: 2, title: 'Startup Grant Guidelines', icon: 'grant', updated: '3 hours ago' },
  { id: 3, title: 'Market Entry Strategy', icon: 'strategy', updated: '3 hours ago' },
  { id: 4, title: 'Pitch Deck Review', icon: 'deck', updated: '2 hours ago' },
  { id: 5, title: 'Funding Rounds Overview', icon: 'funding', updated: '3 hours ago' },
  { id: 6, title: 'R&D Tax Credits', icon: 'tax', updated: '2 hours ago' },
]

export const adminUsers = [
  { id: 1, name: 'Aster Merhawit', email: 'aster.m@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Robel Demissie', email: 'robel.d@example.com', role: 'Mentor', status: 'Pending' },
  { id: 3, name: 'Hana Kifle', email: 'hana.k@example.com', role: 'Founder', status: 'Active' },
  { id: 4, name: 'Yonas Wolde', email: 'yonas.w@example.com', role: 'Admin', status: 'Pending' },
  { id: 5, name: 'Selam Tesfaye', email: 'selam.t@example.com', role: 'Mentor', status: 'Inactive' },
  { id: 6, name: 'Bereket Alemu', email: 'bereket.a@example.com', role: 'Founder', status: 'Active' },
]

export const auditLog = [
  { id: 1, title: 'User role updated', detail: 'Robel Demissie set to Mentor', time: '5 min ago' },
  { id: 2, title: 'Grant approved', detail: 'National Innovation Grant · $250,000', time: '2 hours ago' },
  { id: 3, title: 'Security scan completed', detail: 'No vulnerabilities found', time: '2 hours ago' },
]

export const securityAlerts = [
  { id: 1, title: 'Unusual login location', detail: 'Login from a new device flagged for review.', level: 'high' },
  { id: 2, title: 'Password policy reminder', detail: '12 accounts due for password rotation.', level: 'medium' },
  { id: 3, title: 'API rate spike', detail: 'Grants API saw a 3x traffic spike at 2 AM.', level: 'low' },
]
