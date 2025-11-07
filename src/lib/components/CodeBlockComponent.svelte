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

<div class={`w-full max-w-6xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if component.title}
		<div class="bg-slate-800/50 px-6 py-4 rounded-t-2xl border-b border-slate-700/50">
			<span class="text-base md:text-lg font-semibold text-slate-200">{component.title}</span>
			<span class="text-sm text-slate-400 ml-3">{component.language}</span>
		</div>
	{/if}

	<div class="relative">
		{#if isLoading}
			<div class="bg-slate-900 p-8 rounded-2xl animate-pulse">
				<div class="h-40 bg-slate-800 rounded"></div>
			</div>
		{:else}
			<div class="code-block-wrapper {component.title ? 'rounded-b-2xl' : 'rounded-2xl'} overflow-hidden">
				{@html highlightedCode}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.code-block-wrapper pre) {
		margin: 0;
		padding: 2rem 2.5rem;
		overflow-x: auto;
		background: #0d1117 !important;
	}

	:global(.code-block-wrapper code) {
		font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
		font-size: 1rem;
		line-height: 1.8;
	}

	@media (min-width: 768px) {
		:global(.code-block-wrapper code) {
			font-size: 1.125rem;
		}
	}

	/* Line numbers */
	:global(.code-block-wrapper .line[data-line]) {
		display: inline-block;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}

	:global(.code-block-wrapper .line[data-line]::before) {
		content: attr(data-line);
		display: inline-block;
		width: 2.5rem;
		margin-right: 2rem;
		text-align: right;
		color: #6b7280;
		user-select: none;
	}

	/* Highlighted lines */
	:global(.code-block-wrapper .highlighted-line) {
		background-color: rgba(59, 130, 246, 0.15);
		border-left: 4px solid #3b82f6;
		display: block;
		margin-left: -2rem;
		margin-right: -2rem;
		padding-left: calc(2rem - 4px);
		padding-right: 2rem;
	}

	/* Smooth scrolling */
	:global(.code-block-wrapper pre) {
		scrollbar-width: thin;
		scrollbar-color: #4b5563 #1f2937;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar) {
		height: 10px;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar-track) {
		background: #1f2937;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar-thumb) {
		background: #4b5563;
		border-radius: 5px;
	}

	:global(.code-block-wrapper pre::-webkit-scrollbar-thumb:hover) {
		background: #6b7280;
	}
</style>
