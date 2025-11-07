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
				},
				flowchart: {
					rankSpacing: 80,
					nodeSpacing: 50,
					curve: 'basis'
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

<div class={`w-full max-w-7xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if component.title}
		<h3 class="text-sm md:text-base font-semibold mb-2 text-center text-slate-300">{component.title}</h3>
	{/if}

	<div class="bg-slate-900/30 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-slate-800">
		{#if isLoading}
			<div class="flex items-center justify-center h-80">
				<div class="text-slate-400 text-lg animate-pulse">Rendering diagram...</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center p-12 text-red-400">
				<div class="text-2xl font-semibold mb-4">⚠️ Diagram Rendering Failed</div>
				<div class="text-base mb-6">{error}</div>
				<details class="w-full">
					<summary class="cursor-pointer text-base text-slate-400 hover:text-slate-300">Show diagram source</summary>
					<pre class="mt-4 p-6 bg-slate-800 rounded-xl text-sm text-left overflow-auto max-h-80">{rawDiagram}</pre>
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
