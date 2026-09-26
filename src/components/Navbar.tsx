import React from 'react';
import {
  CheckSquare,
  Calendar,
  Users,
  Flame,
  Target,
  FileText,
  Download,
  Upload,
  Cloud,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  pendingTasksCount: number;
  habitsDoneTodayCount: number;
  totalHabitsCount: number;
  isCalendarConnected: boolean;
  onOpenBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount,
  habitsDoneTodayCount,
  totalHabitsCount,
  isCalendarConnected,
  onOpenBackupModal,
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <span className="font-extrabold text-white text-base tracking-wider">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">Nexus Hub</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  Synced
                </span>
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

          {/* Backup / Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBackupModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
              title="Backup or Restore Data"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Backup / Restore</span>
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
