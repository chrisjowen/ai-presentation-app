import { json } from '@sveltejs/kit';
import { getSession, setSession } from '$lib/server/sessions';
import type { Presentation } from '$lib/types/timeline';
import type { RequestHandler } from './$types';

// GET /api/sessions/:sessionId - Fetch session state
export const GET: RequestHandler = async ({ params }) => {
	const { sessionId } = params;

	const session = getSession(sessionId);

	if (!session) {
		return json(
			{
				error: 'Session not found'
			},
			{ status: 404 }
		);
	}

	return json(session);
};

// POST /api/sessions/:sessionId - Create or update session
export const POST: RequestHandler = async ({ params, request }) => {
	const { sessionId } = params;

	try {
		const presentation: Presentation = await request.json();

		// Validate basic structure
		if (!presentation.events || !Array.isArray(presentation.events)) {
			return json(
				{
					error: 'Invalid presentation format'
				},
				{ status: 400 }
			);
		}

		// Ensure session ID matches
		presentation.sessionId = sessionId;
		presentation.id = presentation.id || `${sessionId}-${Date.now()}`;
		presentation.createdAt = presentation.createdAt || Date.now();

		// Store session
		setSession(sessionId, presentation);

		return json({ success: true, presentation });
	} catch (error) {
		return json(
			{
				error: 'Invalid JSON payload'
			},
			{ status: 400 }
		);
	}
};

// DELETE /api/sessions/:sessionId - Delete session
export const DELETE: RequestHandler = async ({ params }) => {
	const { sessionId } = params;

	const deleted = getSession(sessionId);

	if (!deleted) {
		return json(
			{
				error: 'Session not found'
			},
			{ status: 404 }
		);
	}

	return json({ success: true });
};
