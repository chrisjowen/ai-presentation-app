/**
 * Session Storage
 * In-memory storage for presentation sessions (can be replaced with DB later)
 */

import type { Presentation } from '$lib/types/timeline';

// In-memory session store
const sessions = new Map<string, Presentation>();

export function getSession(sessionId: string): Presentation | null {
	return sessions.get(sessionId) || null;
}

export function setSession(sessionId: string, presentation: Presentation): void {
	sessions.set(sessionId, presentation);
}

export function deleteSession(sessionId: string): boolean {
	return sessions.delete(sessionId);
}

export function listSessions(): string[] {
	return Array.from(sessions.keys());
}
