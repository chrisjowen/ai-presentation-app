<script lang="ts">
	import type { TimelineComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: TimelineComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
	const isVertical = $derived(component.orientation === 'vertical');
</script>

<div class={`w-full max-w-4xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if isVertical}
		<!-- Vertical Timeline -->
		<div class="relative">
			<div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

			{#each component.events as event, i}
				<div class="relative pl-20 pb-8 last:pb-0">
					<div class="absolute left-6 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-slate-900 shadow-lg"></div>

					<div class="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700 hover:border-purple-500 transition-all">
						<div class="text-sm text-purple-400 font-semibold mb-1">{event.date}</div>
						<div class="text-lg font-bold mb-1">{event.title}</div>
						{#if event.description}
							<div class="text-sm text-gray-400">{event.description}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Horizontal Timeline -->
		<div class="relative pt-8">
			<div class="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>

			<div class="flex justify-between">
				{#each component.events as event}
					<div class="relative flex flex-col items-center flex-1">
						<div class="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-slate-900 shadow-lg mb-4 z-10"></div>

						<div class="text-center">
							<div class="text-xs text-purple-400 font-semibold mb-1">{event.date}</div>
							<div class="text-sm font-bold">{event.title}</div>
							{#if event.description}
								<div class="text-xs text-gray-400 mt-1">{event.description}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
