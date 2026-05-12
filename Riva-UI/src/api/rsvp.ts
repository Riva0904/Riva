const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5236/api';

export interface SubmitRsvpRequest {
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  status: 'Accepted' | 'Declined' | 'Maybe';
  guestCount: number;
  message?: string;
}

export interface RsvpDto {
  rsvpId: number;
  guestName: string;
  guestEmail?: string;
  status: string;
  guestCount: number;
  message?: string;
  respondedAt: string;
}

export interface RsvpSummary {
  totalResponses: number;
  accepted: number;
  declined: number;
  maybe: number;
  totalGuests: number;
  responses: RsvpDto[];
}

export async function submitRsvp(slug: string, req: SubmitRsvpRequest): Promise<{ rsvpId: number; message: string }> {
  const res = await fetch(`${API_BASE}/rsvp/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit RSVP');
  return data;
}

export async function exportRsvpCsv(invitationId: number, title: string): Promise<void> {
  const token = localStorage.getItem('riva_token');
  const res = await fetch(`${API_BASE}/rsvp/${invitationId}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `rsvp-${title}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getRsvpSummary(invitationId: number): Promise<RsvpSummary> {
  const token = localStorage.getItem('riva_token');
  const res = await fetch(`${API_BASE}/rsvp/${invitationId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load RSVPs');
  return data;
}
