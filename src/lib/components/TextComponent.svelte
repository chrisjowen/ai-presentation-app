<script lang="ts">
	import type { TextComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';
	import { marked } from 'marked';

	interface Props {
		component: TextComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Parse markdown for body text, keep plain text for headings
	const renderedContent = $derived(
		component.variant === 'body'
			? marked.parse(component.content, { breaks: true, gfm: true })
			: component.content
	);

	const isMarkdown = $derived(component.variant === 'body');
</script>

{#if isMarkdown}
	<div
		class={`
			${getTransitionClass(transition)}
			text-sm md:text-base prose prose-invert prose-sm max-w-none leading-relaxed
			${component.align === 'left' ? 'text-left' : ''}
			${component.align === 'right' ? 'text-right' : ''}
			${component.align === 'center' || !component.align ? 'text-center' : ''}
			${component.className || ''}
		`}
		style={component.color ? `color: ${component.color}` : 'color: rgba(255, 255, 255, 0.9)'}
	>
		{@html renderedContent}
	</div>
{:else}
	<div
		class={`
			${getTransitionClass(transition)}
			${component.variant === 'heading' ? 'text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight' : ''}
			${component.variant === 'subheading' ? 'text-2xl md:text-3xl font-semibold mb-4 tracking-tight' : ''}
			${component.variant === 'title' ? 'text-base md:text-lg font-bold mb-3 tracking-tight' : ''}
			${component.variant === 'caption' ? 'text-xs md:text-sm text-slate-400 font-normal' : ''}
			${component.align === 'left' ? 'text-left' : ''}
			${component.align === 'right' ? 'text-right' : ''}
			${component.align === 'center' || !component.align ? 'text-center' : ''}
			${component.gradient ? 'text-gradient' : ''}
			whitespace-pre-wrap
			${component.className || ''}
		`}
		style={component.color ? `color: ${component.color}` : component.variant === 'heading' ? 'color: rgba(255, 255, 255, 0.98)' : 'color: rgba(255, 255, 255, 0.9)'}
	>
		{component.content}
	</div>
{/if}
