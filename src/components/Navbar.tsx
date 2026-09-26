import React from 'react';
import {
  CheckSquare,
  Calendar,
  Users,
  Flame,
  Target,
  FileText,
  Download,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { SyncStatus } from '../services/firestoreSync';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  pendingTasksCount: number;
  habitsDoneTodayCount: number;
  totalHabitsCount: number;
  isCalendarConnected: boolean;
  onOpenBackupModal: () => void;
  user: User | null;
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  habitsDoneTodayCount,
  totalHabitsCount,
  isCalendarConnected,
  onOpenBackupModal,
  user,
  syncStatus,
  onSignIn,
  onSignOut,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingTasksCount > 0 ? (
        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {pendingTasksCount}
        </span>
      ) : null,
    },
    {
      id: 'calendar',
      label: 'Google Calendar',
      icon: <Calendar className="w-4 h-4" />,
      badge: isCalendarConnected ? (
        <span className="w-2 h-2 ml-1.5 rounded-full bg-emerald-400 animate-pulse" title="Google Connected" />
      ) : (
        <span className="w-2 h-2 ml-1.5 rounded-full bg-zinc-600" title="Not connected" />
      ),
    },
    {
      id: 'clubs',
      label: 'Clubs',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      badge: totalHabitsCount > 0 ? (
        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {habitsDoneTodayCount}/{totalHabitsCount}
        </span>
      ) : null,
    },
    {
      id: 'projects',
      label: 'Project Goals',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative px-2.5 py-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.55)] border border-indigo-400/50">
              <span className="font-extrabold text-white text-xs tracking-wider drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] [text-shadow:0_0_8px_rgba(224,231,255,1),0_0_16px_rgba(129,140,248,0.9)] animate-pulse">
                AS
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">PES Tracking HUB</span>
                {user ? (
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      syncStatus === 'synced'
                        ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60'
                        : syncStatus === 'saving'
                        ? 'text-indigo-400 bg-indigo-950/50 border-indigo-800/60'
                        : 'text-amber-400 bg-amber-950/50 border-amber-800/60'
                    }`}
                    title="Real-time multi-device cloud database sync is active"
                  >
                    {syncStatus === 'saving' ? (
                      <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                    ) : (
                      <Cloud className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>
                      {syncStatus === 'saving'
                        ? 'Syncing Cloud...'
                        : syncStatus === 'synced'
                        ? '3-Device Cloud Synced'
                        : 'Connecting...'}
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={onSignIn}
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 px-2 py-0.5 rounded-full transition-colors"
                    title="Sign in to sync across phone, laptop, and tablet"
                  >
                    <Smartphone className="w-3 h-3 text-amber-400" />
                    <span>Sync 3 Devices</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Productivity & Life Operating System</p>
            </div>
          </div>

          {/* Navigation Tabs - Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </nav>

          {/* Right Section: User & Backup Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-2.5 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-zinc-700"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="text-xs text-zinc-200 hidden lg:inline truncate max-w-[100px]">
                  {user.displayName?.split(' ')[0] || 'Account'}
                </span>
                <button
                  onClick={onSignOut}
                  className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
              title="Backup or Restore Data"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline">Backup</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 gap-1 border-t border-zinc-800/60 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
