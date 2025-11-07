<script lang="ts">
	import type { CardGridComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: CardGridComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
	const columns = component.columns || 3;
</script>

<div class={`w-full max-w-7xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	<div class="grid gap-12 md:gap-16" style="grid-template-columns: repeat({columns}, minmax(0, 1fr));">
		{#each component.cards as card}
			<div class="group">
				{#if card.icon}
					<div class="text-7xl md:text-8xl mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
				{/if}
				<h3 class="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">{card.title}</h3>
				<p class="text-xl md:text-2xl text-slate-300 leading-relaxed">{card.description}</p>
			</div>
		{/each}
	</div>
</div>
