<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { MermaidComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';
	import mermaid from 'mermaid';

	interface Props {
		component: MermaidComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
	let diagramEl: HTMLDivElement | undefined = $state();
	let isLoading = $state(true);
	let error = $state('');
	let rawDiagram = $state('');
	let renderedSvg = $state('');

	onMount(async () => {
		try {
			// Store raw diagram for debugging
			rawDiagram = component.diagram;

			// Fix common JSON escaping issues
			let fixedDiagram = component.diagram;

			// If diagram contains \\n (double-escaped), convert to single newlines
			if (fixedDiagram.includes('\\n')) {
				fixedDiagram = fixedDiagram.replace(/\\n/g, '\n');
			}

			// Ensure proper spacing around arrows
			fixedDiagram = fixedDiagram.replace(/([A-Za-z0-9\]])(-->|---|-.->|==>)([A-Za-z0-9\[])/g, '$1 $2 $3');

			console.log('[Mermaid] Original diagram:', component.diagram);
			console.log('[Mermaid] Fixed diagram:', fixedDiagram);

			mermaid.initialize({
				startOnLoad: false,
				theme: 'dark',
				themeVariables: {
					darkMode: true,
					background: '#0f172a',
					primaryColor: '#8b5cf6',
					secondaryColor: '#3b82f6',
					tertiaryColor: '#10b981',
					primaryTextColor: '#fff',
					secondaryTextColor: '#cbd5e1',
					lineColor: '#64748b',
					textColor: '#fff'
				}
			});

			// Render mermaid without needing DOM element
			// Mermaid.render returns the SVG directly
			const { svg } = await mermaid.render('mermaid-' + component.id, fixedDiagram);

			renderedSvg = svg;
			isLoading = false;
		} catch (err: any) {
			console.error('[Mermaid] Render error:', err);
			console.error('[Mermaid] Diagram content:', component.diagram);
			error = err.message || 'Failed to render diagram';
			isLoading = false;
		}
	});
</script>

<div class={`w-full max-w-6xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if component.title}
		<h3 class="text-2xl font-semibold mb-4 text-center">{component.title}</h3>
	{/if}

	<div class="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
		{#if isLoading}
			<div class="flex items-center justify-center h-64">
				<div class="text-gray-400 animate-pulse">Rendering diagram...</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center p-8 text-red-400">
				<div class="text-xl font-semibold mb-2">⚠️ Diagram Rendering Failed</div>
				<div class="text-sm mb-4">{error}</div>
				<details class="w-full">
					<summary class="cursor-pointer text-sm text-gray-400 hover:text-gray-300">Show diagram source</summary>
					<pre class="mt-2 p-4 bg-slate-800 rounded text-xs text-left overflow-auto max-h-64">{rawDiagram}</pre>
				</details>
			</div>
		{:else}
			<div class="flex justify-center mermaid-diagram">
				{@html renderedSvg}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.mermaid-diagram svg) {
		max-width: 100%;
		height: auto;
	}
</style>
