/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import {
  testFirestoreConnection,
  subscribeToUserDashboard,
  getDashboardFromFirestore,
  saveDashboardToFirestore,
  queueDashboardSave,
  SyncStatus,
} from './services/firestoreSync';
import { User } from 'firebase/auth';
import { Smartphone, Laptop, Tablet, Cloud, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('tasks');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  // Authentication & Cloud Sync
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  // Persistent States
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [clubs, setClubs] = useState<Club[]>(() => loadClubs());
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [habitLogs, setHabitLogs] = useState<HabitLog>(() => loadHabitLogs());
  const [projects, setProjects] = useState<ProjectGoal[]>(() => loadProjects());
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());

  // Ref to track if change was received from remote Firestore to prevent looping
  const isRemoteUpdateRef = useRef(false);

  // Test Firestore connection on boot per Firebase skill guidelines
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen for Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, _token) => {
        setCurrentUser(user);
        setIsCalendarConnected(true);
        setSyncStatus('connecting');
      },
      () => {
        setCurrentUser(null);
        setIsCalendarConnected(false);
        setSyncStatus('offline');
      }
    );
    return () => unsubscribe();
  }, []);

  // Set up Real-time Cross-Device Firestore Sync when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribeSnapshot: (() => void) | null = null;

    const setupSync = async () => {
      try {
        // Initial fetch: if Firestore has data, load it. If not, seed Firestore with current local data
        const cloudData = await getDashboardFromFirestore(currentUser.uid);
        if (cloudData) {
          isRemoteUpdateRef.current = true;
          if (cloudData.tasks) {
            setTasks(cloudData.tasks);
            saveTasks(cloudData.tasks);
          }
          if (cloudData.clubs) {
            setClubs(cloudData.clubs);
            saveClubs(cloudData.clubs);
          }
          if (cloudData.habits) {
            setHabits(cloudData.habits);
            saveHabits(cloudData.habits);
          }
          if (cloudData.habitLogs) {
            setHabitLogs(cloudData.habitLogs);
            saveHabitLogs(cloudData.habitLogs);
          }
          if (cloudData.projects) {
            setProjects(cloudData.projects);
            saveProjects(cloudData.projects);
          }
          if (cloudData.notes) {
            setNotes(cloudData.notes);
            saveNotes(cloudData.notes);
          }
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 300);
        } else {
          // First time syncing this user: upload current local storage state
          await saveDashboardToFirestore(currentUser.uid, {
            tasks,
            clubs,
            habits,
            habitLogs,
            projects,
            notes,
          });
        }
        setSyncStatus('synced');

        // Subscribe to real-time updates from other devices (laptop, phone, tablet)
        unsubscribeSnapshot = subscribeToUserDashboard(
          currentUser.uid,
          (updatedCloudData) => {
            isRemoteUpdateRef.current = true;
            if (updatedCloudData.tasks) {
              setTasks(updatedCloudData.tasks);
              saveTasks(updatedCloudData.tasks);
            }
            if (updatedCloudData.clubs) {
              setClubs(updatedCloudData.clubs);
              saveClubs(updatedCloudData.clubs);
            }
            if (updatedCloudData.habits) {
              setHabits(updatedCloudData.habits);
              saveHabits(updatedCloudData.habits);
            }
            if (updatedCloudData.habitLogs) {
              setHabitLogs(updatedCloudData.habitLogs);
              saveHabitLogs(updatedCloudData.habitLogs);
            }
            if (updatedCloudData.projects) {
              setProjects(updatedCloudData.projects);
              saveProjects(updatedCloudData.projects);
            }
            if (updatedCloudData.notes) {
              setNotes(updatedCloudData.notes);
              saveNotes(updatedCloudData.notes);
            }
            setSyncStatus('synced');
            setTimeout(() => {
              isRemoteUpdateRef.current = false;
            }, 300);
          },
          () => {
            setSyncStatus('error');
          }
        );
      } catch (err) {
        console.error('Failed to setup Firestore cross-device sync:', err);
        setSyncStatus('error');
      }
    };

    setupSync();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [currentUser]);

  // Helper to trigger cloud sync when user makes changes locally
  const syncToCloud = (partialData: {
    tasks?: Task[];
    clubs?: Club[];
    habits?: Habit[];
    habitLogs?: HabitLog;
    projects?: ProjectGoal[];
    notes?: Note[];
  }) => {
    if (!currentUser || isRemoteUpdateRef.current) return;

    queueDashboardSave(
      currentUser.uid,
      {
        tasks: partialData.tasks ?? tasks,
        clubs: partialData.clubs ?? clubs,
        habits: partialData.habits ?? habits,
        habitLogs: partialData.habitLogs ?? habitLogs,
        projects: partialData.projects ?? projects,
        notes: partialData.notes ?? notes,
      },
      setSyncStatus
    );
  };

  // Update handlers with immediate localStorage persistence & cloud sync
  const handleUpdateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
    syncToCloud({ tasks: newTasks });
  };

  const handleUpdateClubs = (newClubs: Club[]) => {
    setClubs(newClubs);
    saveClubs(newClubs);
    syncToCloud({ clubs: newClubs });
  };

  const handleUpdateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    saveHabits(newHabits);
    syncToCloud({ habits: newHabits });
  };

  const handleUpdateHabitLogs = (newLogs: HabitLog) => {
    setHabitLogs(newLogs);
    saveHabitLogs(newLogs);
    syncToCloud({ habitLogs: newLogs });
  };

  const handleUpdateProjects = (newProjects: ProjectGoal[]) => {
    setProjects(newProjects);
    saveProjects(newProjects);
    syncToCloud({ projects: newProjects });
  };

  const handleUpdateNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    saveNotes(newNotes);
    syncToCloud({ notes: newNotes });
  };

  // Handle Google Login / Logout from Navbar
  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setIsCalendarConnected(true);
      }
    } catch (e) {
      console.error('Sign-in failed', e);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setIsCalendarConnected(false);
    setSyncStatus('offline');
  };

  // Reload all states after manual backup import
  const handleDataRestored = () => {
    const loadedTasks = loadTasks();
    const loadedClubs = loadClubs();
    const loadedHabits = loadHabits();
    const loadedHabitLogs = loadHabitLogs();
    const loadedProjects = loadProjects();
    const loadedNotes = loadNotes();

    setTasks(loadedTasks);
    setClubs(loadedClubs);
    setHabits(loadedHabits);
    setHabitLogs(loadedHabitLogs);
    setProjects(loadedProjects);
    setNotes(loadedNotes);

    if (currentUser) {
      saveDashboardToFirestore(currentUser.uid, {
        tasks: loadedTasks,
        clubs: loadedClubs,
        habits: loadedHabits,
        habitLogs: loadedHabitLogs,
        projects: loadedProjects,
        notes: loadedNotes,
      });
    }
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
        user={currentUser}
        syncStatus={syncStatus}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* 3-Device Cloud Sync Banner for unauthenticated visitors */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-indigo-950/60 border-b border-indigo-500/20 px-4 py-2 text-center text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-zinc-300">
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              Cross-Device Cloud Database Ready:
            </span>
            <span className="text-zinc-400">
              Sign in with your Google account to automatically sync your tasks, habits, and notes across your phone, laptop, and tablet.
            </span>
            <button
              onClick={handleGoogleSignIn}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-1"
            >
              Sign in to enable 3-Device Sync →
            </button>
          </div>
        </div>
      )}

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
          <p className="text-zinc-400 font-medium tracking-wide">Website made for Aabhi, built for Aabhi</p>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {currentUser ? 'Cloud Firestore Synchronized (All 3 Devices)' : 'Local Storage Active'}
            </span>
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
