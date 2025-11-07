import { getSession } from '$lib/server/sessions';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { sessionId } = params;

	const session = getSession(sessionId);

	if (!session) {
		// Return null for new sessions - they'll be created via POST
		return {
			sessionId,
			presentation: null
		};
	}

	return {
		sessionId,
		presentation: session
	};
};
