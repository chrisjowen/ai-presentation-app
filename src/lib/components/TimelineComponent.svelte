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

<div class={`w-full max-w-6xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if isVertical}
		<!-- Vertical Timeline -->
		<div class="relative">
			<div class="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-400 opacity-30"></div>

			{#each component.events as event, i}
				<div class="relative pl-32 pb-16 last:pb-0">
					<div class="absolute left-9 w-7 h-7 rounded-full bg-blue-500 border-4 border-slate-950"></div>

					<div class="space-y-3">
						<div class="text-base md:text-lg text-blue-400 font-semibold tracking-wide">{event.date}</div>
						<div class="text-xl md:text-2xl font-bold">{event.title}</div>
						{#if event.description}
							<div class="text-base md:text-lg text-slate-400 leading-relaxed">{event.description}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Horizontal Timeline -->
		<div class="relative pt-12">
			<div class="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-30"></div>

			<div class="flex justify-between gap-8">
				{#each component.events as event}
					<div class="relative flex flex-col items-center flex-1">
						<div class="w-6 h-6 rounded-full bg-blue-500 border-4 border-slate-950 mb-8 z-10"></div>

						<div class="text-center space-y-2">
							<div class="text-base md:text-lg text-blue-400 font-semibold">{event.date}</div>
							<div class="text-xl md:text-2xl font-bold">{event.title}</div>
							{#if event.description}
								<div class="text-base md:text-lg text-slate-400 mt-3">{event.description}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
