import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  Search,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
} from '../services/googleAuth';
import {
  fetchCalendarEvents,
  GoogleCalendarEvent,
  CalendarApiError,
} from '../services/calendarApi';

export const CalendarPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Calendar events state
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'agenda' | 'day' | 'month'>('agenda');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
  const [selectedEvent, setSelectedEvent] = useState<GoogleCalendarEvent | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch events when token is available or timeRange changes
  const loadEvents = useCallback(async () => {
    const currentToken = token || getAccessToken();
    if (!currentToken) return;

    setIsLoadingEvents(true);
    setCalendarError(null);

    try {
      const now = new Date();
      const timeMin = now.toISOString();

      let timeMax: string | undefined = undefined;
      if (timeRange === '7days') {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        timeMax = nextWeek.toISOString();
      } else if (timeRange === '30days') {
        const nextMonth = new Date();
        nextMonth.setDate(now.getDate() + 30);
        timeMax = nextMonth.toISOString();
      }

      const items = await fetchCalendarEvents(currentToken, {
        timeMin,
        timeMax,
        maxResults: 100,
      });

      setEvents(items);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      if (err instanceof CalendarApiError && err.status === 401) {
        setCalendarError('Your Google Calendar authorization session expired. Please sign in again.');
        setAccessToken(null);
        setToken(null);
      } else {
        setCalendarError(err.message || 'Failed to load Google Calendar events. Check connection.');
      }
    } finally {
      setIsLoadingEvents(false);
    }
  }, [token, timeRange]);

  useEffect(() => {
    if (token) {
      loadEvents();
    }
  }, [token, loadEvents]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed', err);
      setAuthError(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setEvents([]);
  };

  // Format event time display
  const formatEventDateTime = (event: GoogleCalendarEvent) => {
    if (event.start.date) {
      return {
        isAllDay: true,
        dateFormatted: new Date(event.start.date + 'T00:00:00').toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        timeFormatted: 'All Day',
      };
    }

    if (event.start.dateTime) {
      const startDate = new Date(event.start.dateTime);
      const endDate = event.end.dateTime ? new Date(event.end.dateTime) : null;

      const dateFormatted = startDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const startTimeStr = startDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });

      const endTimeStr = endDate
        ? endDate.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })
        : '';

      return {
        isAllDay: false,
        dateFormatted,
        timeFormatted: `${startTimeStr} - ${endTimeStr}`,
      };
    }

    return { isAllDay: false, dateFormatted: 'Unknown', timeFormatted: '' };
  };

  // Filter events by query
  const filteredEvents = events.filter((ev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchSummary = ev.summary?.toLowerCase().includes(q);
    const matchDesc = ev.description?.toLowerCase().includes(q);
    const matchLoc = ev.location?.toLowerCase().includes(q);
    return matchSummary || matchDesc || matchLoc;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-indigo-400" />
              Google Calendar
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
              Read-Only Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Access and view your Google Calendar schedule directly inside Nexus Hub.
          </p>
        </div>

        {/* User Status / Actions */}
        {user && token && (
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google User'}
                className="w-8 h-8 rounded-full border border-zinc-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-semibold text-xs">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {user.displayName || 'Google User'}
              </p>
              <p className="text-[11px] text-zinc-400 leading-tight truncate max-w-[150px]">
                {user.email}
              </p>
            </div>
            <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-800 pl-3">
              <button
                onClick={loadEvents}
                disabled={isLoadingEvents}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Refresh Calendar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingEvents ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                title="Disconnect Google Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!token ? (
        /* Sign-in Promotion Card */
        <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/10">
            <CalendarIcon className="w-8 h-8 text-indigo-400" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Connect Your Google Calendar
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
            Link your Google account to view upcoming meetings, appointments, and deadlines
            seamlessly alongside your tasks, habits, and long-term project roadmaps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 block"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Read-Only Safety</h4>
                <p className="text-[11px] text-zinc-500">
                  Read calendar events without altering your existing schedule.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Video className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Meeting Links</h4>
                <p className="text-[11px] text-zinc-500">
                  One-click launch for Google Meet and video calls.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Always Current</h4>
                <p className="text-[11px] text-zinc-500">
                  Direct live synchronization from Google Calendar servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Connected Calendar View */
        <div className="space-y-4">
          {/* Controls Bar: Time Range, Search, View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
            {/* Time range selector */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: '7days', label: 'Next 7 Days' },
                  { id: '30days', label: 'This Month' },
                  { id: 'all', label: 'All Upcoming' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    timeRange === tab.id
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search calendar events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Error Banner */}
          {calendarError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{calendarError}</span>
              </div>
              <button
                onClick={handleGoogleSignIn}
                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold rounded text-xs shrink-0"
              >
                Reconnect
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoadingEvents ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-300">Fetching events from Google Calendar...</p>
              <p className="text-xs text-zinc-500 mt-1">Connecting to your primary calendar</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
              <CalendarDays className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">No upcoming events found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No events match "${searchQuery}".`
                  : 'You have no scheduled events in this time period.'}
              </p>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Google Calendar</span>
              </a>
            </div>
          ) : (
            /* Events Agenda List */
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const { isAllDay, dateFormatted, timeFormatted } = formatEventDateTime(event);
                const hasMeet = !!event.hangoutLink;
                const attendeeCount = event.attendees?.length || 0;

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Event Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {event.summary || '(Untitled Event)'}
                          </h3>
                          {isAllDay && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              All-Day
                            </span>
                          )}
                          {hasMeet && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Video className="w-3 h-3" />
                              Google Meet
                            </span>
                          )}
                        </div>

                        {/* Date, Time & Location row */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                          <div className="flex items-center gap-1 text-zinc-300 font-medium">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>
                              {dateFormatted} • {timeFormatted}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-1 text-zinc-400 truncate max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {attendeeCount > 0 && (
                            <div className="flex items-center gap-1 text-zinc-500">
                              <UserIcon className="w-3.5 h-3.5" />
                              <span>{attendeeCount} attendee{attendeeCount > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-xs text-zinc-500 line-clamp-2 pt-0.5">
                            {event.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>

                      {/* Right: Quick Launch buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        {hasMeet && (
                          <a
                            href={event.hangoutLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-lg transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meet</span>
                          </a>
                        )}

                        {event.htmlLink && (
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                            title="View in Google Calendar"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Event Details Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedEvent.summary || '(Untitled Event)'}
                    </h3>
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">
                      {formatEventDateTime(selectedEvent).dateFormatted} •{' '}
                      {formatEventDateTime(selectedEvent).timeFormatted}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-zinc-200">Location</p>
                      <p className="text-zinc-400">{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-zinc-400">Description</h4>
                    <div className="text-xs text-zinc-300 max-h-40 overflow-y-auto p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 whitespace-pre-wrap">
                      {selectedEvent.description.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-zinc-400">
                      Attendees ({selectedEvent.attendees.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {selectedEvent.attendees.map((att, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-950/60"
                        >
                          <span className="text-zinc-300 truncate max-w-[250px]">
                            {att.displayName || att.email}
                          </span>
                          <span className="text-[10px] capitalize text-zinc-500 font-medium">
                            {att.responseStatus || 'invited'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  {selectedEvent.hangoutLink && (
                    <a
                      href={selectedEvent.hangoutLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Google Meet</span>
                    </a>
                  )}
                  {selectedEvent.htmlLink && (
                    <a
                      href={selectedEvent.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Calendar</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
