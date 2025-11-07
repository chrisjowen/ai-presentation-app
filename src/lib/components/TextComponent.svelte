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
			text-xl md:text-2xl prose prose-invert prose-lg max-w-none
			${component.align === 'center' ? 'text-center' : ''}
			${component.align === 'right' ? 'text-right' : ''}
			${component.align === 'left' || !component.align ? 'text-left' : ''}
			${component.className || ''}
		`}
		style={component.color ? `color: ${component.color}` : ''}
	>
		{@html renderedContent}
	</div>
{:else}
	<div
		class={`
			${getTransitionClass(transition)}
			${component.variant === 'heading' ? 'text-5xl md:text-7xl font-bold mb-6' : ''}
			${component.variant === 'subheading' ? 'text-3xl md:text-4xl font-semibold mb-4' : ''}
			${component.variant === 'caption' ? 'text-base md:text-lg text-gray-400' : ''}
			${component.align === 'center' ? 'text-center' : ''}
			${component.align === 'right' ? 'text-right' : ''}
			${component.align === 'left' || !component.align ? 'text-left' : ''}
			whitespace-pre-wrap
			${component.className || ''}
		`}
		style={component.color ? `color: ${component.color}` : 'color: rgba(255, 255, 255, 0.98)'}
	>
		{component.content}
	</div>
{/if}
