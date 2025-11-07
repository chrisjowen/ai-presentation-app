<script lang="ts">
	import { onMount } from 'svelte';
	import type { CodeBlockComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';
	import { codeToHtml } from 'shiki';

	interface Props {
		component: CodeBlockComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	let highlightedCode = $state('');
	let isLoading = $state(true);

	onMount(async () => {
		try {
			// Generate highlighted HTML with Shiki
			const html = await codeToHtml(component.code, {
				lang: component.language,
				theme: 'github-dark',
				transformers: [
					{
						line(node, line) {
							// Add line numbers if requested
							if (component.showLineNumbers !== false) {
								node.properties['data-line'] = line;
							}

							// Highlight specific lines
							if (component.highlightLines?.includes(line)) {
								this.addClassToHast(node, 'highlighted-line');
							}
						}
					}
				]
			});

			highlightedCode = html;
			isLoading = false;
		} catch (error) {
			console.error('[CodeBlock] Failed to highlight code:', error);
			// Fallback to plain code
			highlightedCode = `<pre><code>${component.code}</code></pre>`;
			isLoading = false;
		}
	});
</script>

<div class={`w-full max-w-4xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if component.title}
		<div class="bg-slate-800 px-4 py-2 rounded-t-lg border-b border-slate-700">
			<span class="text-sm font-semibold text-gray-300">{component.title}</span>
			<span class="text-xs text-gray-500 ml-2">{component.language}</span>
		</div>
	{/if}

	<div class="relative">
		{#if isLoading}
			<div class="bg-slate-900 p-4 rounded-lg animate-pulse">
				<div class="h-32 bg-slate-800 rounded"></div>
			</div>
		{:else}
			<div class="code-block-wrapper {component.title ? 'rounded-b-lg' : 'rounded-lg'} overflow-hidden">
				{@html highlightedCode}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.code-block-wrapper pre) {
		margin: 0;
		padding: 1.5rem;
		overflow-x: auto;
		background: #0d1117 !important;
	}

	:global(.code-block-wrapper code) {
		font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	/* Line numbers */
	:global(.code-block-wrapper .line[data-line]) {
		display: inline-block;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	:global(.code-block-wrapper .line[data-line]::before) {
		content: attr(data-line);
		display: inline-block;
		width: 2rem;
		margin-right: 1.5rem;
		text-align: right;
		color: #6b7280;
		user-select: none;
	}

	/* Highlighted lines */
	:global(.code-block-wrapper .highlighted-line) {
		background-color: rgba(59, 130, 246, 0.1);
		border-left: 3px solid #3b82f6;
		display: block;
		margin-left: -1.5rem;
		margin-right: -1.5rem;
		padding-left: calc(1.5rem - 3px);
		padding-right: 1.5rem;
	}

	/* Smooth scrolling */
	:global(.code-block-wrapper pre) {
		scrollbar-width: thin;
		scrollbar-color: #4b5563 #1f2937;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar) {
		height: 8px;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar-track) {
		background: #1f2937;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar-thumb) {
		background: #4b5563;
		border-radius: 4px;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar-thumb:hover) {
		background: #6b7280;
	}
</style>
