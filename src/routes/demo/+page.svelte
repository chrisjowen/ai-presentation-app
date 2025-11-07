<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { EXAMPLE_PRESENTATION } from '$lib/types/timeline';

	onMount(async () => {
		// Create a demo session with the example presentation
		const sessionId = 'demo-session';

		try {
			await fetch(`/api/sessions/${sessionId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(EXAMPLE_PRESENTATION)
			});

			// Redirect to the session viewer
			goto(`/session/${sessionId}`);
		} catch (error) {
			console.error('Failed to create demo session:', error);
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
	<div class="text-center">
		<div class="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
		<p class="text-2xl">Loading demo...</p>
	</div>
</div>
