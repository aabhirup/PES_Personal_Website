export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  category: string;
  subtasks: Subtask[];
  createdAt: string;
  completedAt?: string;
}

export type ClubRole = 'President' | 'Officer' | 'Lead' | 'Member' | 'Advisor';

export interface ClubAnnouncement {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface Club {
  id: string;
  name: string;
  role: ClubRole;
  category: string;
  meetingSchedule: string;
  meetingLocation: string;
  description: string;
  duesStatus: 'Paid' | 'Pending' | 'Exempt' | 'N/A';
  contactEmail?: string;
  meetingLink?: string;
  announcements: ClubAnnouncement[];
  tasksAssigned?: string[];
  createdAt: string;
}

export type HabitCategory = 'Health' | 'Fitness' | 'Mindfulness' | 'Productivity' | 'Learning' | 'Creative';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  targetDaysPerWeek: number;
  color: string;
  icon: string;
  archived?: boolean;
  createdAt: string;
}

export interface HabitLog {
  // Mapping of date (YYYY-MM-DD) to array of completed habit IDs
  [dateString: string]: string[];
}

export type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface ProjectGoal {
  id: string;
  title: string;
  vision: string;
  category: string;
  targetDate: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  milestones: ProjectMilestone[];
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown text
  tags: string[];
  isPinned: boolean;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export type NavigationTab = 'tasks' | 'calendar' | 'clubs' | 'habits' | 'projects' | 'notes';
