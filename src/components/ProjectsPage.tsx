import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Trash2,
  Tag,
  TrendingUp,
  Flag,
  ChevronDown,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { ProjectGoal, ProjectStatus, ProjectMilestone } from '../types';
import { getTodayDateString, formatDisplayDate } from '../utils/storage';

interface ProjectsPageProps {
  projects: ProjectGoal[];
  onUpdateProjects: (projects: ProjectGoal[]) => void;
}

const STATUS_LABELS: Record<ProjectStatus, { label: string; color: string; border: string }> = {
  planning: {
    label: 'Planning',
    color: 'bg-zinc-800 text-zinc-300',
    border: 'border-zinc-700',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-indigo-500/15 text-indigo-300',
    border: 'border-indigo-500/30',
  },
  review: {
    label: 'In Review',
    color: 'bg-amber-500/15 text-amber-300',
    border: 'border-amber-500/30',
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/15 text-emerald-300',
    border: 'border-emerald-500/30',
  },
  'on-hold': {
    label: 'On Hold',
    color: 'bg-rose-500/15 text-rose-300',
    border: 'border-rose-500/30',
  },
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onUpdateProjects }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    new Set(['proj-1', 'proj-2'])
  );

  // New milestone inline state
  const [activeMilestoneProjId, setActiveMilestoneProjId] = useState<string | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');

  // New goal form state
  const [title, setTitle] = useState('');
  const [vision, setVision] = useState('');
  const [category, setCategory] = useState('Career');
  const [targetDate, setTargetDate] = useState(getTodayDateString(90));
  const [status, setStatus] = useState<ProjectStatus>('in-progress');
  const [tagsInput, setTagsInput] = useState('');

  // Toggle milestone completed
  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const nextMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        // Automatically recalculate progress % if milestones exist
        const completedCount = nextMilestones.filter((m) => m.completed).length;
        const autoProgress =
          nextMilestones.length > 0 ? Math.round((completedCount / nextMilestones.length) * 100) : p.progress;

        return {
          ...p,
          milestones: nextMilestones,
          progress: autoProgress,
          status: autoProgress === 100 ? ('completed' as ProjectStatus) : p.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    onUpdateProjects(updated);
  };

  // Add milestone
  const handleAddMilestone = (projectId: string) => {
    if (!milestoneTitle.trim()) return;

    const newMilestone: ProjectMilestone = {
      id: `m-${Date.now()}`,
      title: milestoneTitle.trim(),
      completed: false,
      dueDate: milestoneDueDate || undefined,
    };

    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const nextMilestones = [...p.milestones, newMilestone];
        const completedCount = nextMilestones.filter((m) => m.completed).length;
        const autoProgress = Math.round((completedCount / nextMilestones.length) * 100);
        return {
          ...p,
          milestones: nextMilestones,
          progress: autoProgress,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    onUpdateProjects(updated);
    setMilestoneTitle('');
    setMilestoneDueDate('');
    setActiveMilestoneProjId(null);
  };

  // Update project progress slider directly
  const handleProgressChange = (projectId: string, newProgress: number) => {
    const updated = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            progress: newProgress,
            status: newProgress === 100 ? ('completed' as ProjectStatus) : p.status,
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    onUpdateProjects(updated);
  };

  // Update project status
  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    const updated = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            status: newStatus,
            progress: newStatus === 'completed' ? 100 : p.progress,
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    onUpdateProjects(updated);
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter((p) => p.id !== projectId);
    onUpdateProjects(updated);
  };

  // Create new project goal
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProj: ProjectGoal = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      vision: vision.trim(),
      category: category.trim() || 'General',
      targetDate: targetDate || getTodayDateString(60),
      status,
      progress: 0,
      milestones: [],
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateProjects([newProj, ...projects]);
    setTitle('');
    setVision('');
    setTagsInput('');
    setIsAddModalOpen(false);
  };

  // Toggle expand
  const toggleExpand = (projectId: string) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  // Days remaining calculation
  const getDaysRemaining = (targetDateStr: string): { days: number; isPassed: boolean } => {
    if (!targetDateStr) return { days: 0, isPassed: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days: Math.abs(diffDays), isPassed: diffDays < 0 };
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  // Summary Metrics
  const totalProjects = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'in-progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const avgProgress =
    totalProjects > 0
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Long-Term Project Goals
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Define high-impact milestones, track completion rates, and realize long-term ambitions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Long-Term Goal</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Roadmaps</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalProjects}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>In Progress</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{inProgressCount}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">{completedCount}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Average Progress</span>
            <Flag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">{avgProgress}%</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(['all', 'in-progress', 'planning', 'review', 'completed', 'on-hold'] as const).map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {st === 'all' ? 'All Goals' : st.replace('-', ' ')}
            </button>
          )
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
            <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">No goals in this category</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Set multi-month ambitions, milestones, and deadlines to stay accountable.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              Create Project Goal
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isExpanded = expandedProjectIds.has(project.id);
            const { days, isPassed } = getDaysRemaining(project.targetDate);
            const statusConfig = STATUS_LABELS[project.status] || STATUS_LABELS.planning;

            return (
              <div
                key={project.id}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 shadow-lg transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{project.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color} ${statusConfig.border}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                        {project.category}
                      </span>
                    </div>

                    {project.vision && (
                      <p className="text-xs text-zinc-400 leading-relaxed">{project.vision}</p>
                    )}

                    {/* Tags */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800"
                          >
                            <Tag className="w-2.5 h-2.5 text-zinc-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus)}
                      className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="planning">Planning</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                    </select>

                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Target Date */}
                <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-200">Overall Progress</span>
                      <span className="font-bold text-indigo-400">{project.progress}%</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>
                        Target:{' '}
                        <strong className="text-zinc-200 font-semibold">
                          {formatDisplayDate(project.targetDate)}
                        </strong>{' '}
                        (
                        {isPassed
                          ? `${days} days ago`
                          : `${days} days left`}
                        )
                      </span>
                    </div>
                  </div>

                  {/* Progress slider bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Adjust slider manually or complete milestones below:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={project.progress}
                        onChange={(e) => handleProgressChange(project.id, Number(e.target.value))}
                        className="w-32 accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Key Milestones Section */}
                <div className="pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                      <span>
                        Key Milestones (
                        {project.milestones.filter((m) => m.completed).length}/{project.milestones.length})
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        toggleExpand(project.id);
                        setActiveMilestoneProjId(
                          activeMilestoneProjId === project.id ? null : project.id
                        );
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  {/* Add Milestone Form */}
                  {activeMilestoneProjId === project.id && (
                    <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                      <input
                        type="text"
                        placeholder="Milestone title (e.g. Pass benchmark tests, launch beta)"
                        value={milestoneTitle}
                        onChange={(e) => setMilestoneTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-zinc-400">Target Date:</label>
                          <input
                            type="date"
                            value={milestoneDueDate}
                            onChange={(e) => setMilestoneDueDate(e.target.value)}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-300 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveMilestoneProjId(null)}
                            className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddMilestone(project.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Milestones List */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 pl-2">
                      {project.milestones.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic py-1">
                          No milestones added yet. Add concrete milestones to measure advancement.
                        </p>
                      ) : (
                        project.milestones.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between gap-2 p-2 bg-zinc-950/60 border border-zinc-850 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleMilestone(project.id, m.id)}
                                className="text-zinc-500 hover:text-indigo-400"
                              >
                                {m.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-600" />
                                )}
                              </button>
                              <span
                                className={`truncate ${
                                  m.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                                }`}
                              >
                                {m.title}
                              </span>
                            </div>

                            {m.dueDate && (
                              <span className="text-[10px] text-zinc-500 shrink-0">
                                {formatDisplayDate(m.dueDate)}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Project Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateProject}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Create Long-Term Project Goal
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Goal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Master Cloud Architecture, Run Half-Marathon, Ship SaaS Product"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Vision & Key Motivation
              </label>
              <textarea
                rows={2}
                placeholder="Why does this matter? What does success look like upon completion?"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="Career & Work">Career & Work</option>
                  <option value="Tech & Engineering">Tech & Engineering</option>
                  <option value="Academic">Academic</option>
                  <option value="Fitness & Health">Fitness & Health</option>
                  <option value="Creative & Writing">Creative & Writing</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Tech, Portfolio, Health"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
