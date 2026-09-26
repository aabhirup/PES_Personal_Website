import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './googleAuth';
import { Task, Club, Habit, HabitLog, ProjectGoal, Note } from '../types';

export interface DashboardCloudData {
  ownerId: string;
  tasks: Task[];
  clubs: Club[];
  habits: Habit[];
  habitLogs: HabitLog;
  projects: ProjectGoal[];
  notes: Note[];
  updatedAt: string;
}

export type SyncStatus = 'offline' | 'connecting' | 'synced' | 'saving' | 'error';

// Test connection on startup per Firebase skill rules
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode or network is unreachable.');
    }
    return false;
  }
}

// Subscribe to real-time changes on the user's dashboard document across devices
export function subscribeToUserDashboard(
  userId: string,
  onData: (data: DashboardCloudData) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'users', userId, 'data', 'dashboard');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as DashboardCloudData;
        onData(cloudData);
      }
    },
    (err) => {
      console.error('Firestore real-time sync error:', err);
      if (onError) onError(err);
    }
  );
}

// Fetch dashboard data once (e.g. on initial sign in)
export async function getDashboardFromFirestore(
  userId: string
): Promise<DashboardCloudData | null> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'dashboard');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as DashboardCloudData;
    }
    return null;
  } catch (err) {
    console.error('Failed to read dashboard from Firestore:', err);
    return null;
  }
}

// Debounced save tracker
let saveTimeout: any = null;

// Save current dashboard to user's Firestore document
export async function saveDashboardToFirestore(
  userId: string,
  data: {
    tasks: Task[];
    clubs: Club[];
    habits: Habit[];
    habitLogs: HabitLog;
    projects: ProjectGoal[];
    notes: Note[];
  }
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'data', 'dashboard');
  const payload: DashboardCloudData = {
    ownerId: userId,
    tasks: data.tasks,
    clubs: data.clubs,
    habits: data.habits,
    habitLogs: data.habitLogs,
    projects: data.projects,
    notes: data.notes,
    updatedAt: new Date().toISOString(),
  };

  // Immediate save with fallback
  return setDoc(docRef, payload, { merge: true });
}

// Debounced version to avoid too many writes when typing rapidly in markdown notes
export function queueDashboardSave(
  userId: string,
  data: {
    tasks: Task[];
    clubs: Club[];
    habits: Habit[];
    habitLogs: HabitLog;
    projects: ProjectGoal[];
    notes: Note[];
  },
  onStatusChange?: (status: SyncStatus) => void
) {
  if (onStatusChange) onStatusChange('saving');
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(async () => {
    try {
      await saveDashboardToFirestore(userId, data);
      if (onStatusChange) onStatusChange('synced');
    } catch (err) {
      console.error('Error saving dashboard to Firestore:', err);
      if (onStatusChange) onStatusChange('error');
    }
  }, 1000);
}
