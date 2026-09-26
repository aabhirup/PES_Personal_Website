/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  loadTasks,
  saveTasks,
  loadClubs,
  saveClubs,
  loadHabits,
  saveHabits,
  loadHabitLogs,
  saveHabitLogs,
  loadProjects,
  saveProjects,
  loadNotes,
  saveNotes,
  getTodayDateString,
} from './utils/storage';
import { NavigationTab, Task, Club, Habit, HabitLog, ProjectGoal, Note } from './types';
import { Navbar } from './components/Navbar';
import { TasksPage } from './components/TasksPage';
import { CalendarPage } from './components/CalendarPage';
import { ClubsPage } from './components/ClubsPage';
import { HabitsPage } from './components/HabitsPage';
import { ProjectsPage } from './components/ProjectsPage';
import { NotesPage } from './components/NotesPage';
import { DataBackupModal } from './components/DataBackupModal';
import { initAuth } from './services/googleAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('tasks');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  // Persistent States
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [clubs, setClubs] = useState<Club[]>(() => loadClubs());
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [habitLogs, setHabitLogs] = useState<HabitLog>(() => loadHabitLogs());
  const [projects, setProjects] = useState<ProjectGoal[]>(() => loadProjects());
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());

  // Listen for Google Auth connection status
  useEffect(() => {
    const unsubscribe = initAuth(
      () => setIsCalendarConnected(true),
      () => setIsCalendarConnected(false)
    );
    return () => unsubscribe();
  }, []);

  // Update handlers with immediate localStorage persistence
  const handleUpdateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleUpdateClubs = (newClubs: Club[]) => {
    setClubs(newClubs);
    saveClubs(newClubs);
  };

  const handleUpdateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    saveHabits(newHabits);
  };

  const handleUpdateHabitLogs = (newLogs: HabitLog) => {
    setHabitLogs(newLogs);
    saveHabitLogs(newLogs);
  };

  const handleUpdateProjects = (newProjects: ProjectGoal[]) => {
    setProjects(newProjects);
    saveProjects(newProjects);
  };

  const handleUpdateNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  // Reload all states after backup import
  const handleDataRestored = () => {
    setTasks(loadTasks());
    setClubs(loadClubs());
    setHabits(loadHabits());
    setHabitLogs(loadHabitLogs());
    setProjects(loadProjects());
    setNotes(loadNotes());
  };

  // Badges calculations
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const todayStr = getTodayDateString(0);
  const habitsDoneTodayCount = habits.filter((h) =>
    (habitLogs[todayStr] || []).includes(h.id)
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
        habitsDoneTodayCount={habitsDoneTodayCount}
        totalHabitsCount={habits.length}
        isCalendarConnected={isCalendarConnected}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'tasks' && (
          <TasksPage tasks={tasks} onUpdateTasks={handleUpdateTasks} />
        )}

        {activeTab === 'calendar' && <CalendarPage />}

        {activeTab === 'clubs' && (
          <ClubsPage clubs={clubs} onUpdateClubs={handleUpdateClubs} />
        )}

        {activeTab === 'habits' && (
          <HabitsPage
            habits={habits}
            habitLogs={habitLogs}
            onUpdateHabits={handleUpdateHabits}
            onUpdateHabitLogs={handleUpdateHabitLogs}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsPage projects={projects} onUpdateProjects={handleUpdateProjects} />
        )}

        {activeTab === 'notes' && (
          <NotesPage notes={notes} onUpdateNotes={handleUpdateNotes} />
        )}
      </main>

      {/* Backup & Restore Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
        stats={{
          tasksCount: tasks.length,
          clubsCount: clubs.length,
          habitsCount: habits.length,
          projectsCount: projects.length,
          notesCount: notes.length,
        }}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/70 text-zinc-500 text-xs py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Nexus Hub • Personal OS & Life Dashboard</p>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>Local Storage Active</span>
            <span>•</span>
            <span>Google Calendar API Enabled</span>
            <span>•</span>
            <span>Markdown Live Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
