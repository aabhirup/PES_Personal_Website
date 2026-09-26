import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Task, Priority, Subtask } from '../types';
import { getTodayDateString, formatDisplayDate } from '../utils/storage';

interface TasksPageProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ tasks, onUpdateTasks }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDueDate, setNewDueDate] = useState(getTodayDateString(0));
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New subtask inline state
  const [activeSubtaskTaskId, setActiveSubtaskTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Extract unique categories
  const categories = Array.from(new Set(tasks.map((t) => t.category || 'General')));

  // Toggle task completed
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Toggle subtask completed
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
        return {
          ...t,
          subtasks: updatedSubtasks,
          completed: allCompleted ? true : t.completed,
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Add subtask
  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t
    );
    onUpdateTasks(updated);
    setNewSubtaskTitle('');
    setActiveSubtaskTaskId(null);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onUpdateTasks(updated);
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      category: newCategory.trim() || 'General',
      subtasks: [],
      createdAt: new Date().toISOString(),
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTitle('');
    setIsFormOpen(false);
  };

  // Toggle expanded
  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'high' && task.priority !== 'high') return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  const todayStr = getTodayDateString(0);

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Write, organize, and complete daily tasks with persistent local storage.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-xl font-bold text-white">{totalTasks}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300">{pendingTasks}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300">{completedTasks}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>High Priority</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-300">{highPriorityTasks}</div>
        </div>
      </div>

      {/* New Task Inline Form */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateTask}
          className="bg-zinc-900/90 border border-indigo-500/40 rounded-xl p-4 sm:p-5 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Add New Task
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="What needs to be finished?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category / Tag</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Work, Clubs, Study"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['all', 'active', 'completed', 'high'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              {tab === 'high' ? 'High Priority' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800/60 flex items-center justify-center mx-auto mb-3">
              <CheckSquare className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">No tasks found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery || filter !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'All clear! Click "New Task" to write down your next action.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskIds.has(task.id);
            const subtaskCount = task.subtasks.length;
            const completedSubtaskCount = task.subtasks.filter((s) => s.completed).length;

            const isDueToday = task.dueDate === todayStr;
            const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;

            const priorityBadge =
              task.priority === 'high' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  High
                </span>
              ) : task.priority === 'medium' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Medium
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Low
                </span>
              );

            return (
              <div
                key={task.id}
                className={`bg-zinc-900/80 border transition-all rounded-xl p-3.5 sm:p-4 ${
                  task.completed
                    ? 'border-zinc-800/60 opacity-65 bg-zinc-950/40'
                    : 'border-zinc-800 hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 text-zinc-400 hover:text-indigo-400 transition-colors"
                    title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 fill-indigo-500/20" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-medium ${
                          task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {priorityBadge}
                      {task.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-zinc-400 mb-2">{task.description}</p>
                    )}

                    {/* Metadata & Subtasks status */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1 ${
                            isOverdue
                              ? 'text-rose-400 font-semibold'
                              : isDueToday
                              ? 'text-amber-400 font-medium'
                              : 'text-zinc-400'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {isDueToday
                              ? 'Due Today'
                              : isOverdue
                              ? `Overdue (${formatDisplayDate(task.dueDate)})`
                              : `Due ${formatDisplayDate(task.dueDate)}`}
                          </span>
                        </div>
                      )}

                      {subtaskCount > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {completedSubtaskCount}/{subtaskCount} Subtasks
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          toggleExpand(task.id);
                          setActiveSubtaskTaskId(task.id);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add subtask</span>
                      </button>
                    </div>

                    {/* Expanded Subtasks List */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 pl-2">
                        {task.subtasks.map((st) => (
                          <div key={st.id} className="flex items-center gap-2 group text-xs">
                            <button
                              onClick={() => handleToggleSubtask(task.id, st.id)}
                              className="text-zinc-500 hover:text-indigo-400"
                            >
                              {st.completed ? (
                                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-zinc-600" />
                              )}
                            </button>
                            <span
                              className={`${
                                st.completed ? 'line-through text-zinc-600' : 'text-zinc-300'
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>
                        ))}

                        {/* Add subtask input */}
                        {activeSubtaskTaskId === task.id && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="New subtask title..."
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSubtask(task.id);
                              }}
                              className="flex-1 px-2.5 py-1 bg-zinc-950 border border-zinc-750 rounded text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleAddSubtask(task.id)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800/80 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
