import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trash2,
  Award,
  Zap,
  RotateCcw,
  BarChart2,
  Heart,
  BookOpen,
  Brain,
  Activity,
  Droplets,
} from 'lucide-react';
import { Habit, HabitLog, HabitCategory } from '../types';
import { getTodayDateString } from '../utils/storage';

interface HabitsPageProps {
  habits: Habit[];
  habitLogs: HabitLog;
  onUpdateHabits: (habits: Habit[]) => void;
  onUpdateHabitLogs: (logs: HabitLog) => void;
}

const CATEGORY_COLORS: Record<HabitCategory, string> = {
  Health: '#06b6d4', // Cyan
  Fitness: '#10b981', // Emerald
  Mindfulness: '#a855f7', // Purple
  Productivity: '#6366f1', // Indigo
  Learning: '#f59e0b', // Amber
  Creative: '#ec4899', // Pink
};

export const HabitsPage: React.FC<HabitsPageProps> = ({
  habits,
  habitLogs,
  onUpdateHabits,
  onUpdateHabitLogs,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New habit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Productivity');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);

  const todayStr = getTodayDateString(0);

  // Generate last 7 days array (from 6 days ago up to today)
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i; // 6 days ago ... today
    const dateStr = getTodayDateString(-offset);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - offset);
    return {
      dateStr,
      offset,
      dayName: dateObj.toLocaleDateString(undefined, { weekday: 'narrow' }),
      dayNumber: dateObj.getDate(),
      isToday: offset === 0,
    };
  });

  // Toggle habit completion for a specific date (persisted to localStorage)
  const handleToggleHabitForDate = (habitId: string, dateStr: string) => {
    const currentCompleted = habitLogs[dateStr] || [];
    const isCompleted = currentCompleted.includes(habitId);

    const updatedDateList = isCompleted
      ? currentCompleted.filter((id) => id !== habitId)
      : [...currentCompleted, habitId];

    const updatedLogs: HabitLog = {
      ...habitLogs,
      [dateStr]: updatedDateList,
    };

    onUpdateHabitLogs(updatedLogs);
  };

  // Calculate current streak for a habit
  const calculateStreak = (habitId: string): number => {
    let streak = 0;
    let checkOffset = 0;

    // If today is completed, streak includes today. If not completed yet today, check starting from yesterday
    const todayDone = habitLogs[todayStr]?.includes(habitId);
    if (!todayDone) {
      checkOffset = 1;
    }

    while (true) {
      const dateToCheck = getTodayDateString(-checkOffset);
      const isDone = habitLogs[dateToCheck]?.includes(habitId);
      if (isDone) {
        streak++;
        checkOffset++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate total completions all-time for a habit
  const calculateTotalCompletions = (habitId: string): number => {
    let count = 0;
    Object.values(habitLogs).forEach((completedList) => {
      if (completedList.includes(habitId)) {
        count++;
      }
    });
    return count;
  };

  // Create new habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: `hab-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      frequency: 'daily',
      targetDaysPerWeek,
      color: CATEGORY_COLORS[category] || '#6366f1',
      icon: 'Flame',
      createdAt: new Date().toISOString(),
    };

    onUpdateHabits([...habits, newHabit]);
    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter((h) => h.id !== habitId);
    onUpdateHabits(updated);
  };

  // Summary Metrics
  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((h) =>
    (habitLogs[todayStr] || []).includes(h.id)
  ).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;
  const highestStreak = habits.reduce((max, h) => Math.max(max, calculateStreak(h.id)), 0);

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            Habit Tracker
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Build lasting routines with daily tracking saved permanently to your browser storage.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* Progress & Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Today's Progress</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{completionPercentage}%</span>
            <span className="text-xs text-zinc-500">
              ({completedTodayCount}/{totalHabits})
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Active Habits</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{totalHabits}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Daily routines tracked</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Best Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 flex items-center gap-1">
            <span>{highestStreak}</span>
            <span className="text-xs font-normal text-zinc-400">days</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Keep the momentum going</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Storage Status</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-semibold text-purple-300 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Saved Locally</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Restores automatically on load</p>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          All Categories
        </button>
        {(['Health', 'Fitness', 'Mindfulness', 'Productivity', 'Learning', 'Creative'] as HabitCategory[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* 7-Day Consistency Table & Habits List */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header: Days of week */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Habit Consistency</h3>
            <p className="text-xs text-zinc-400">Click any day bubble to toggle completion status</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Completed</span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700 inline-block ml-2" />
            <span>Missed / Pending</span>
          </div>
        </div>

        {filteredHabits.length === 0 ? (
          <div className="p-12 text-center">
            <Flame className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-zinc-300">No habits in this category</h4>
            <p className="text-xs text-zinc-500 mt-1 mb-4">Click "Add New Habit" to create your first habit tracker.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {filteredHabits.map((habit) => {
              const streak = calculateStreak(habit.id);
              const totalDone = calculateTotalCompletions(habit.id);
              const isDoneToday = (habitLogs[todayStr] || []).includes(habit.id);

              return (
                <div
                  key={habit.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-850/30 transition-colors"
                >
                  {/* Left: Habit info and category */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: habit.color || '#6366f1' }}
                      />
                      <h4 className="text-sm font-semibold text-white truncate">{habit.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                        {habit.category}
                      </span>
                    </div>

                    {habit.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1 mb-1.5">{habit.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1 font-medium text-amber-400">
                        <Flame className="w-3.5 h-3.5" />
                        {streak} {streak === 1 ? 'day' : 'days'} streak
                      </span>
                      <span>•</span>
                      <span>{totalDone} total completions</span>
                    </div>
                  </div>

                  {/* Right: 7-Day interactive check bubble matrix */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {recentDays.map((d) => {
                        const isDone = (habitLogs[d.dateStr] || []).includes(habit.id);
                        return (
                          <div key={d.dateStr} className="flex flex-col items-center gap-1">
                            <span
                              className={`text-[10px] font-medium ${
                                d.isToday ? 'text-amber-400 font-bold' : 'text-zinc-500'
                              }`}
                            >
                              {d.dayName}
                            </span>
                            <button
                              onClick={() => handleToggleHabitForDate(habit.id, d.dateStr)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                  : d.isToday
                                  ? 'bg-zinc-950 border border-amber-500/50 hover:border-amber-400 text-zinc-600'
                                  : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-600'
                              }`}
                              title={`${d.dateStr}: ${isDone ? 'Completed' : 'Not completed'}`}
                            >
                              {isDone ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : (
                                <span className="text-[10px] text-zinc-500">{d.dayNumber}</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Today's Big Action Button */}
                    <div className="pl-2 border-l border-zinc-800">
                      <button
                        onClick={() => handleToggleHabitForDate(habit.id, todayStr)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                          isDoneToday
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${isDoneToday ? 'text-emerald-400' : 'text-zinc-500'}`}
                        />
                        <span className="hidden sm:inline">{isDoneToday ? 'Done Today' : 'Mark Done'}</span>
                      </button>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1.5 text-zinc-600 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateHabit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Create New Habit
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Habit Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Read 20 mins, Drink 3L water, Morning Run"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="Why is this habit important or how to do it?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HabitCategory)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Health">Health</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Learning">Learning</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Target Days / Week</label>
                <select
                  value={targetDaysPerWeek}
                  onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                >
                  <option value={7}>7 days (Everyday)</option>
                  <option value={6}>6 days / week</option>
                  <option value={5}>5 days / week (Weekdays)</option>
                  <option value={4}>4 days / week</option>
                  <option value={3}>3 days / week</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg shadow-sm"
              >
                Save Habit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
