/**
 * Google Calendar REST API Client
 */

export interface GoogleCalendarDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface GoogleCalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus?: string;
  self?: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GoogleCalendarDateTime;
  end: GoogleCalendarDateTime;
  htmlLink?: string;
  status?: string;
  hangoutLink?: string;
  attendees?: GoogleCalendarAttendee[];
  organizer?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  colorId?: string;
  created?: string;
  updated?: string;
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  timeZone?: string;
}

export class CalendarApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CalendarApiError';
    this.status = status;
  }
}

export const fetchCalendarEvents = async (
  accessToken: string,
  options?: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    q?: string;
  }
): Promise<GoogleCalendarEvent[]> => {
  const calendarId = encodeURIComponent(options?.calendarId || 'primary');
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(options?.maxResults || 100),
  });

  if (options?.timeMin) {
    params.set('timeMin', options.timeMin);
  }
  if (options?.timeMax) {
    params.set('timeMax', options.timeMax);
  }
  if (options?.q) {
    params.set('q', options.q);
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errMessage = `Calendar API Error: ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData?.error?.message) {
        errMessage = errData.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new CalendarApiError(errMessage, response.status);
  }

  const data = await response.json();
  return data.items || [];
};

export const fetchCalendarList = async (accessToken: string): Promise<CalendarListEntry[]> => {
  const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new CalendarApiError(`Failed to fetch calendars: ${response.statusText}`, response.status);
  }

  const data = await response.json();
  return data.items || [];
};
