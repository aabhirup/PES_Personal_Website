import { Task, Club, Habit, HabitLog, ProjectGoal, Note } from '../types';

const STORAGE_KEYS = {
  TASKS: 'nexus_tasks_v1',
  CLUBS: 'nexus_clubs_v1',
  HABITS: 'nexus_habits_v1',
  HABIT_LOGS: 'nexus_habit_logs_v1',
  PROJECTS: 'nexus_projects_v1',
  NOTES: 'nexus_notes_v1',
  ACTIVE_NOTE_ID: 'nexus_active_note_id_v1',
};

// Helper: today's date formatted as YYYY-MM-DD in local time
export const getTodayDateString = (offsetDays = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format nice readable date
export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
};

// Initial Seed Data
const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Review team presentation slides for club showcase',
    description: 'Ensure club mission, project showcase, and officer intros are aligned with the new guidelines.',
    completed: false,
    priority: 'high',
    dueDate: getTodayDateString(0),
    category: 'Clubs',
    subtasks: [
      { id: 'st-1', title: 'Check speaker notes and timing', completed: true },
      { id: 'st-2', title: 'Update slide 4 budget graphic', completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Draft architecture proposal for distributed cache project',
    description: 'Document Redis failover strategy and benchmark read/write latencies.',
    completed: false,
    priority: 'high',
    dueDate: getTodayDateString(2),
    category: 'Projects',
    subtasks: [
      { id: 'st-3', title: 'Compile benchmark statistics', completed: false },
      { id: 'st-4', title: 'Review with engineering lead', completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Schedule weekly sync with project mentor',
    description: 'Check available slots on Google Calendar and send invite.',
    completed: true,
    priority: 'medium',
    dueDate: getTodayDateString(-1),
    category: 'Academic',
    subtasks: [],
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Review weekly habit streak & plan workout routine',
    description: 'Log weights, plan split for next week, ensure hydration goals are met.',
    completed: false,
    priority: 'low',
    dueDate: getTodayDateString(3),
    category: 'Personal',
    subtasks: [],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'Artificial Intelligence & Robotics Society',
    role: 'Lead',
    category: 'Technology & Engineering',
    meetingSchedule: 'Every Tuesday @ 6:30 PM PST',
    meetingLocation: 'Hall of Engineering 204 & Google Meet',
    description: 'Hands-on technical organization building autonomous quadcopters, LLM agent pipelines, and hosting weekly technical talks.',
    duesStatus: 'Paid',
    contactEmail: 'contact@ai-robotics-soc.org',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    announcements: [
      {
        id: 'ann-1',
        date: getTodayDateString(-2),
        title: 'Spring Hackathon Registration Opened!',
        content: 'Registration is live for our annual 48-hour hardware and AI hackathon. Track mentors and cloud compute credits available.',
      },
      {
        id: 'ann-2',
        date: getTodayDateString(-8),
        title: 'Workshop: Fine-Tuning LLMs on Edge Devices',
        content: 'Slides and demo repositories have been uploaded to GitHub. Thank you to everyone who attended!',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'club-2',
    name: 'Open Source Software Guild',
    role: 'Officer',
    category: 'Software Development',
    meetingSchedule: 'Thursdays @ 7:00 PM PST',
    meetingLocation: 'Student Union Rm 312',
    description: 'Community-driven guild dedicated to contributing to top open-source projects, peer code reviews, and hosting student showcases.',
    duesStatus: 'Paid',
    contactEmail: 'guild@oss-community.edu',
    announcements: [
      {
        id: 'ann-3',
        date: getTodayDateString(-4),
        title: 'Monthly Pull Request Sprint',
        content: 'Our collective PR sprint merged 14 upstream bugfixes this month across Kubernetes and React tooling ecosystems.',
      },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'club-3',
    name: 'Philosophy & Ethics of Computing Colloquium',
    role: 'Member',
    category: 'Interdisciplinary & Discussion',
    meetingSchedule: 'Alternate Fridays @ 5:00 PM PST',
    meetingLocation: 'Library Lounge',
    description: 'Reading group exploring AI safety, algorithmic fairness, digital privacy rights, and the future of creative labor.',
    duesStatus: 'N/A',
    announcements: [],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'hab-1',
    title: 'Morning Deep Work (90 min)',
    description: 'Focus blocks with phone in Do Not Disturb and zero social media interruptions.',
    category: 'Productivity',
    frequency: 'daily',
    targetDaysPerWeek: 6,
    color: '#6366f1', // Indigo
    icon: 'Brain',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hab-2',
    title: 'Daily 5km Run or Strength Training',
    description: 'Keep zone 2 cardio base or complete resistance routine.',
    category: 'Fitness',
    frequency: 'daily',
    targetDaysPerWeek: 5,
    color: '#10b981', // Emerald
    icon: 'Activity',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hab-3',
    title: 'Read 25 Pages of Non-Fiction',
    description: 'Read technical books, systems architecture papers, or biographies.',
    category: 'Learning',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    color: '#f59e0b', // Amber
    icon: 'BookOpen',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hab-4',
    title: '15-Minute Evening Meditation & Reflection',
    description: 'Box breathing and quick gratitude/daily reflection entry.',
    category: 'Mindfulness',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    color: '#a855f7', // Purple
    icon: 'Sparkles',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hab-5',
    title: 'Drink 3 Liters of Water',
    description: 'Keep hydration bottle filled and tracked throughout the day.',
    category: 'Health',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    color: '#06b6d4', // Cyan
    icon: 'Droplets',
    createdAt: new Date().toISOString(),
  },
];

// Seed initial logs for habits to showcase streaks
const generateSeedHabitLogs = (): HabitLog => {
  const logs: HabitLog = {};
  // Fill recent 5 days
  for (let i = 0; i <= 6; i++) {
    const date = getTodayDateString(-i);
    logs[date] = [];
    // Mark some completed for demo realism
    if (i !== 3) logs[date].push('hab-1');
    if (i % 2 === 0) logs[date].push('hab-2');
    logs[date].push('hab-3');
    if (i < 4) logs[date].push('hab-4');
    logs[date].push('hab-5');
  }
  return logs;
};

const DEFAULT_PROJECTS: ProjectGoal[] = [
  {
    id: 'proj-1',
    title: 'Full-Stack Distributed System Architecture Cert & Showcase',
    vision: 'Master distributed systems primitives (consensus, replication, idempotency) and ship an open-source high-throughput event streamer.',
    category: 'Tech & Career',
    targetDate: getTodayDateString(75),
    status: 'in-progress',
    progress: 65,
    milestones: [
      { id: 'm-1', title: 'Complete distributed consensus lecture series and paper reviews', completed: true },
      { id: 'm-2', title: 'Implement Raft state machine replication in Go/TypeScript', completed: true },
      { id: 'm-3', title: 'Benchmark partitions and failover with Chaos Mesh', completed: false, dueDate: getTodayDateString(20) },
      { id: 'm-4', title: 'Publish comprehensive technical report and live interactive demo', completed: false, dueDate: getTodayDateString(60) },
    ],
    tags: ['Architecture', 'Distributed Systems', 'Portfolio'],
    notes: 'Primary focus is ensuring partition tolerance and zero-downtime leader re-election tests pass under heavy synthetic traffic.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    title: 'Half Marathon Under 1:45:00',
    vision: 'Build cardiovascular endurance, prevent injury through cross-training, and complete the coastal half marathon.',
    category: 'Fitness',
    targetDate: getTodayDateString(110),
    status: 'in-progress',
    progress: 45,
    milestones: [
      { id: 'm-5', title: 'Base training: 35km weekly volume for 4 consecutive weeks', completed: true },
      { id: 'm-6', title: 'Pace test: 10km tempo run under 47 minutes', completed: true },
      { id: 'm-7', title: 'Peak long run: 18km easy endurance run', completed: false, dueDate: getTodayDateString(45) },
      { id: 'm-8', title: 'Tapering phase and race day execution', completed: false, dueDate: getTodayDateString(100) },
    ],
    tags: ['Athletics', 'Running', 'Health'],
    notes: 'Focus on cadence (175+ spm) and post-run mobility routines. Hydrate with electrolytes.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    title: 'Publish Technical Book on Clean Modern React & UI Design',
    vision: 'Write and self-publish a practical handbook on design systems, accessible interactions, and clean state patterns.',
    category: 'Creative',
    targetDate: getTodayDateString(180),
    status: 'planning',
    progress: 20,
    milestones: [
      { id: 'm-9', title: 'Outline table of contents & 8 core chapters', completed: true },
      { id: 'm-10', title: 'Draft Chapters 1-3 on Component Architecture', completed: false, dueDate: getTodayDateString(35) },
      { id: 'm-11', title: 'Create companion code repository with live StackBlitz examples', completed: false },
      { id: 'm-12', title: 'Beta reader review & formatting for ePub/PDF', completed: false },
    ],
    tags: ['Writing', 'Engineering', 'Design'],
    notes: 'Chapters should emphasize practical heuristics over abstract theory with before-and-after code snippets.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: 'Getting Started with Nexus Hub & Markdown Guide',
    content: `# Welcome to Nexus Hub 🚀

Your all-in-one dark mode command center for **tasks**, **Google Calendar**, **clubs**, **habits**, **long-term projects**, and **notes**.

---

### 📝 Markdown Editor Capabilities
You can write rich documentation, meeting minutes, and personal reflections with complete Markdown syntax support:

- **Headings**: Use \`#\`, \`##\`, \`###\` for hierarchical headers
- **Emphasis**: Use \`**bold**\` or \`*italics*\` or \`~~strikethrough~~\`
- **Lists**:
  - Bulleted lists with \`-\` or \`*\`
  - Numbered lists with \`1.\`, \`2.\`
  - Interactive task checklists:
    - [x] Complete daily habits
    - [x] Check Google Calendar events
    - [ ] Review long-term quarterly goals

### 💻 Code Blocks & Syntax
Inline code looks like \`const accessToken = getAccessToken();\`, or write full fenced blocks:

\`\`\`typescript
interface UserGoal {
  title: string;
  progress: number; // 0 - 100%
  status: 'planning' | 'in-progress' | 'completed';
}
\`\`\`

### 💡 Blockquotes & Tips
> "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
> — *Will Durant*

### 🔗 Links & Tables
Check out [Google Workspace](https://workspace.google.com) or explore your customized pages across the top navigation bar!

| Section | Purpose | Persistence |
|---|---|---|
| **Tasks** | Daily to-dos & priority tracking | Browser Local Storage |
| **Calendar** | Read-only Google Calendar agenda | Google Calendar API |
| **Clubs** | Student orgs & team announcements | Browser Local Storage |
| **Habits** | Daily streak & habit matrix | Browser Local Storage |
| **Projects** | Milestone roadmaps | Browser Local Storage |
| **Notes** | Formatted Markdown scratchpad | Browser Local Storage |
`,
    tags: ['Welcome', 'Guide', 'Productivity'],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-meeting',
    title: 'AI & Robotics Society: Officer Sync Notes',
    content: `## Meeting Minutes — Officer Strategy Session
**Date:** March 2026
**Attendees:** Alex, Jordan, Sarah, Abhirup

### Key Takeaways
1. **Annual Hackathon Sponsorship:**
   - Secured Tier 1 hardware kits from campus research labs.
   - Mentorship schedule needs 4 additional alumni reviewers.
2. **Project Demos for Showcase:**
   - Quadcopter visual SLAM pipeline is 90% ready.
   - Autonomous rover needs final PID calibration.

### Action Items
- [x] Draft budget allocation sheet
- [ ] Email RSVP links to registered attendees
- [ ] Sync calendar invite with all faculty advisors
`,
    tags: ['Clubs', 'Robotics', 'Minutes'],
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Local Storage Helper Utilities
export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return DEFAULT_TASKS;
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
};

export const loadClubs = (): Club[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLUBS);
    if (!raw) {
      saveClubs(DEFAULT_CLUBS);
      return DEFAULT_CLUBS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load clubs from localStorage', e);
    return DEFAULT_CLUBS;
  }
};

export const saveClubs = (clubs: Club[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  } catch (e) {
    console.error('Failed to save clubs to localStorage', e);
  }
};

export const loadHabits = (): Habit[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habits from localStorage', e);
    return DEFAULT_HABITS;
  }
};

export const saveHabits = (habits: Habit[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits to localStorage', e);
  }
};

export const loadHabitLogs = (): HabitLog => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
    if (!raw) {
      const initialLogs = generateSeedHabitLogs();
      saveHabitLogs(initialLogs);
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load habit logs from localStorage', e);
    return {};
  }
};

export const saveHabitLogs = (logs: HabitLog): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save habit logs to localStorage', e);
  }
};

export const loadProjects = (): ProjectGoal[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      saveProjects(DEFAULT_PROJECTS);
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load projects from localStorage', e);
    return DEFAULT_PROJECTS;
  }
};

export const saveProjects = (projects: ProjectGoal[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
};

export const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      saveNotes(DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notes from localStorage', e);
    return DEFAULT_NOTES;
  }
};

export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
};

// Full Backup & Restore functionality
export interface FullDataBackup {
  version: string;
  exportedAt: string;
  tasks: Task[];
  clubs: Club[];
  habits: Habit[];
  habitLogs: HabitLog;
  projects: ProjectGoal[];
  notes: Note[];
}

export const exportAllDataAsJSON = (): string => {
  const data: FullDataBackup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tasks: loadTasks(),
    clubs: loadClubs(),
    habits: loadHabits(),
    habitLogs: loadHabitLogs(),
    projects: loadProjects(),
    notes: loadNotes(),
  };
  return JSON.stringify(data, null, 2);
};

export const importAllDataFromJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as FullDataBackup;
    if (data.tasks) saveTasks(data.tasks);
    if (data.clubs) saveClubs(data.clubs);
    if (data.habits) saveHabits(data.habits);
    if (data.habitLogs) saveHabitLogs(data.habitLogs);
    if (data.projects) saveProjects(data.projects);
    if (data.notes) saveNotes(data.notes);
    return true;
  } catch (e) {
    console.error('Failed to import JSON data', e);
    return false;
  }
};
