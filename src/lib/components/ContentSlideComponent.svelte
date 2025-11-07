<script lang="ts">
	import { getTransitionClass } from '$lib/utils/transitions';
	import ComponentRenderer from './ComponentRenderer.svelte';
	import type { Component } from '$lib/types/components';
	
	interface ContentSlideComponent {
		id: string;
		type: 'content-slide';
		header?: {
			title: string;
			subtitle?: string;
		};
		layout: '1-column' | '2-column' | '3-column' | '2-column-wide-left' | '2-column-wide-right';
		content: Component[][];  // Array of columns, each containing components
		className?: string;
	}

	interface Props {
		component: ContentSlideComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	const gridClasses = {
		'1-column': 'grid-cols-1',
		'2-column': 'grid-cols-2',
		'3-column': 'grid-cols-3',
		'2-column-wide-left': 'grid-cols-[2fr_1fr]',
		'2-column-wide-right': 'grid-cols-[1fr_2fr]'
	};
</script>

<div class={`w-full h-full flex flex-col ${getTransitionClass(transition)} ${component.className || ''}`}>
	<!-- Header with underline -->
	{#if component.header}
		<div class="px-12 py-8 border-b border-slate-800">
			<h2 class="text-4xl md:text-5xl font-bold mb-2">{component.header.title}</h2>
			<div class="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-2"></div>
			{#if component.header.subtitle}
				<p class="text-xl md:text-2xl text-slate-400">{component.header.subtitle}</p>
			{/if}
		</div>
	{/if}

	<!-- Grid content -->
	<div class={`flex-1 grid ${gridClasses[component.layout]} gap-8 md:gap-12 p-12`}>
		{#each component.content as column, colIndex}
			<div class="flex flex-col gap-6">
				{#each column as item}
					<ComponentRenderer component={item} transition="fade" />
				{/each}
			</div>
		{/each}
	</div>
</div>
