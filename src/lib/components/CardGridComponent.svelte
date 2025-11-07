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

<div class={`w-full max-w-6xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	<div class="grid gap-6" style="grid-template-columns: repeat({columns}, minmax(0, 1fr));">
		{#each component.cards as card}
			<div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all group">
				{#if card.icon}
					<div class="text-5xl mb-4 group-hover:scale-110 transition-transform">{card.icon}</div>
				{/if}
				<h3 class="text-xl font-bold mb-2 text-white">{card.title}</h3>
				<p class="text-gray-400 text-sm leading-relaxed">{card.description}</p>
			</div>
		{/each}
	</div>
</div>
