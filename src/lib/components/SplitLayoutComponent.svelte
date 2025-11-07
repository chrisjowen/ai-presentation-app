<script lang="ts">
	import type { SplitLayoutComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: SplitLayoutComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Grid template based on ratio
	const gridTemplate = $derived(() => {
		switch (component.ratio) {
			case '70/30':
				return 'grid-cols-1 lg:grid-cols-[7fr_3fr]';
			case '30/70':
				return 'grid-cols-1 lg:grid-cols-[3fr_7fr]';
			case '40/60':
				return 'grid-cols-1 lg:grid-cols-[4fr_6fr]';
			case '60/40':
			default:
				return 'grid-cols-1 lg:grid-cols-[6fr_4fr]';
		}
	});

	// Order based on image side
	const imageOrder = $derived(component.imageSide === 'right' ? 'lg:order-2' : 'lg:order-1');
	const contentOrder = $derived(component.imageSide === 'right' ? 'lg:order-1' : 'lg:order-2');
</script>

<div class={`${getTransitionClass(transition)} grid ${gridTemplate()} gap-8 lg:gap-16 items-center min-h-[70vh]`}>
	<!-- Image Side -->
	<div class={`${imageOrder} w-full h-full`}>
		<img
			src={component.imageUrl}
			alt={component.imageAlt || ''}
			class="w-full h-full object-cover rounded-2xl"
		/>
	</div>

	<!-- Content Side -->
	<div class={`${contentOrder} flex flex-col justify-center space-y-6`}>
		{#if component.content.heading}
			<h2 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
				{component.content.heading}
			</h2>
		{/if}

		{#if component.content.subheading}
			<p class="text-2xl md:text-3xl text-slate-300 leading-relaxed">
				{component.content.subheading}
			</p>
		{/if}

		{#if component.content.points && component.content.points.length > 0}
			<ul class="space-y-4 text-xl md:text-2xl text-slate-200">
				{#each component.content.points as point}
					<li class="flex items-start gap-3">
						<span class="text-blue-400 text-2xl">•</span>
						<span class="leading-relaxed">{point}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
