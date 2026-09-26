import React, { useState } from 'react';
import {
  Users,
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Mail,
  Shield,
  Bell,
  Trash2,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Club, ClubRole, ClubAnnouncement } from '../types';
import { getTodayDateString, formatDisplayDate } from '../utils/storage';

interface ClubsPageProps {
  clubs: Club[];
  onUpdateClubs: (clubs: Club[]) => void;
}

export const ClubsPage: React.FC<ClubsPageProps> = ({ clubs, onUpdateClubs }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAnnouncementClubId, setActiveAnnouncementClubId] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [expandedClubIds, setExpandedClubIds] = useState<Set<string>>(new Set(['club-1']));

  // New club form
  const [name, setName] = useState('');
  const [role, setRole] = useState<ClubRole>('Member');
  const [category, setCategory] = useState('Technology & Engineering');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [duesStatus, setDuesStatus] = useState<'Paid' | 'Pending' | 'Exempt' | 'N/A'>('Paid');

  // Toggle club announcement expand
  const toggleExpand = (clubId: string) => {
    setExpandedClubIds((prev) => {
      const next = new Set(prev);
      if (next.has(clubId)) next.delete(clubId);
      else next.add(clubId);
      return next;
    });
  };

  // Add announcement to club
  const handleAddAnnouncement = (clubId: string) => {
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    const newAnnouncement: ClubAnnouncement = {
      id: `ann-${Date.now()}`,
      date: getTodayDateString(0),
      title: announcementTitle.trim(),
      content: announcementContent.trim(),
    };

    const updated = clubs.map((c) =>
      c.id === clubId ? { ...c, announcements: [newAnnouncement, ...c.announcements] } : c
    );

    onUpdateClubs(updated);
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setActiveAnnouncementClubId(null);
  };

  // Create new club
  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: name.trim(),
      role,
      category: category.trim() || 'General',
      meetingSchedule: meetingSchedule.trim() || 'TBD',
      meetingLocation: meetingLocation.trim() || 'Online / Campus',
      description: description.trim(),
      contactEmail: contactEmail.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
      duesStatus,
      announcements: [],
      createdAt: new Date().toISOString(),
    };

    onUpdateClubs([newClub, ...clubs]);
    // Reset form
    setName('');
    setDescription('');
    setMeetingSchedule('');
    setMeetingLocation('');
    setContactEmail('');
    setMeetingLink('');
    setIsAddModalOpen(false);
  };

  // Delete club
  const handleDeleteClub = (clubId: string) => {
    const updated = clubs.filter((c) => c.id !== clubId);
    onUpdateClubs(updated);
  };

  // Stats
  const totalClubs = clubs.length;
  const leadershipRolesCount = clubs.filter(
    (c) => c.role === 'President' || c.role === 'Lead' || c.role === 'Officer'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Clubs & Organizations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Keep track of student organizations, leadership commitments, meeting times, and updates.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Enrolled Clubs</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalClubs}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Leadership Positions</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">{leadershipRolesCount}</div>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Announcements</span>
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {clubs.reduce((acc, c) => acc + c.announcements.length, 0)}
          </div>
        </div>
      </div>

      {/* Clubs List */}
      <div className="grid grid-cols-1 gap-4">
        {clubs.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">No clubs added yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Add your university clubs, sports leagues, or extracurricular associations.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
            >
              Add First Club
            </button>
          </div>
        ) : (
          clubs.map((club) => {
            const isExpanded = expandedClubIds.has(club.id);

            const roleBadgeColor =
              club.role === 'President' || club.role === 'Lead'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : club.role === 'Officer'
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700/60';

            return (
              <div
                key={club.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg hover:border-zinc-700/80 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{club.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeColor}`}>
                        {club.role}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                        {club.category}
                      </span>
                    </div>
                    {club.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed pt-1">{club.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Remove club"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Logistics Info Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-500 font-medium">Meeting Time</p>
                      <p className="font-medium text-zinc-200">{club.meetingSchedule || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-zinc-500 font-medium">Location</p>
                      <p className="font-medium text-zinc-200">{club.meetingLocation || 'Campus'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-medium">Dues Status</p>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          club.duesStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : club.duesStatus === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {club.duesStatus}
                      </span>
                    </div>

                    {club.meetingLink && (
                      <a
                        href={club.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                      >
                        <span>Join Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Announcements Collapsible */}
                <div className="pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleExpand(club.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-500" />
                      )}
                      <span>Announcements & Updates ({club.announcements.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleExpand(club.id);
                        setActiveAnnouncementClubId(
                          activeAnnouncementClubId === club.id ? null : club.id
                        );
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post Update</span>
                    </button>
                  </div>

                  {/* Add Announcement inline form */}
                  {activeAnnouncementClubId === club.id && (
                    <div className="mt-3 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2.5">
                      <h4 className="text-xs font-semibold text-white">Post New Announcement</h4>
                      <input
                        type="text"
                        placeholder="Announcement title..."
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                      <textarea
                        rows={2}
                        placeholder="Announcement details..."
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveAnnouncementClubId(null)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddAnnouncement(club.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                        >
                          Post Announcement
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Announcements List */}
                  {isExpanded && club.announcements.length > 0 && (
                    <div className="mt-3 space-y-2.5 pl-2">
                      {club.announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="p-3 bg-zinc-950/70 border border-zinc-850 rounded-xl space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-semibold text-zinc-200">{ann.title}</h5>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {formatDisplayDate(ann.date)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{ann.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Club Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateClub}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Add Club / Organization
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
              <label className="block text-xs font-medium text-zinc-300 mb-1">Organization Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Robotics Guild, Design Collective, Solar Car Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Your Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ClubRole)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="President">President</option>
                  <option value="Lead">Lead / Chair</option>
                  <option value="Officer">Officer / VP</option>
                  <option value="Member">Active Member</option>
                  <option value="Advisor">Advisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Arts, Sports"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Meeting Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Tuesdays @ 6:00 PM"
                  value={meetingSchedule}
                  onChange={(e) => setMeetingSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Location / Room</label>
                <input
                  type="text"
                  placeholder="e.g. Student Center Rm 201"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Description / Mission</label>
              <textarea
                rows={2}
                placeholder="What is this organization about and what are your responsibilities?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Meeting Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Dues Status</label>
                <select
                  value={duesStatus}
                  onChange={(e) => setDuesStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Exempt">Exempt</option>
                  <option value="N/A">N/A</option>
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
                disabled={!name.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Save Organization
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
