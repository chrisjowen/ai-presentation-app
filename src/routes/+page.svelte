<script lang="ts">
	import { goto } from '$app/navigation';

	function createNewSession() {
		const sessionId = `session-${Date.now()}`;
		goto(`/session/${sessionId}`);
	}

	function loadDemoSession() {
		goto('/demo');
	}

	function startChat() {
		goto('/chat');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-8">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
			AI Explainer
		</h1>

		<p class="text-2xl md:text-3xl mb-12 text-gray-300">
			Experience AI agents like never before. Voice-first interactive presentations.
		</p>

		<div class="flex flex-col md:flex-row gap-6 justify-center items-center">
			<button
				on:click={startChat}
				class="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50"
			>
				🎙️ Start Voice Chat
			</button>

			<button
				on:click={loadDemoSession}
				class="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-xl font-semibold transition-all"
			>
				View Demo
			</button>

			<button
				on:click={createNewSession}
				class="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-xl font-semibold transition-all"
			>
				Create Presentation
			</button>
		</div>

		<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
			<div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-xl hover:bg-slate-900/70 transition-all">
				<div class="text-4xl mb-4">🎭</div>
				<h3 class="text-xl font-semibold mb-2">Dynamic Visuals</h3>
				<p class="text-slate-400">Text, images, and layouts that update in real-time</p>
			</div>

			<div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-xl hover:bg-slate-900/70 transition-all">
				<div class="text-4xl mb-4">🎙️</div>
				<h3 class="text-xl font-semibold mb-2">Voice Narration</h3>
				<p class="text-slate-400">Synchronized text-to-speech with visual changes</p>
			</div>

			<div class="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-xl hover:bg-slate-900/70 transition-all">
				<div class="text-4xl mb-4">⚡</div>
				<h3 class="text-xl font-semibold mb-2">Interactive</h3>
				<p class="text-slate-400">Pause and ask questions anytime with voice input</p>
			</div>
		</div>
	</div>
</div>
