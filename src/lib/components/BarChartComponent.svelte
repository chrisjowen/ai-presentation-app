<script lang="ts">
	import type { BarChartComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: BarChartComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	const maxValue = $derived(Math.max(...component.data.map(item => item.value)));
	const minValue = $derived(Math.min(...component.data.map(item => item.value)));
	const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

	// Calculate a tighter scale for better visual variation
	const scale = $derived(() => {
		if (maxValue === 0) return 100;

		// Use max value + 20% padding for better visual range
		// This ensures bars aren't all near 100% height
		const paddedMax = maxValue * 1.2;
		
		// Find the order of magnitude
		const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
		const normalized = paddedMax / magnitude;

		// Round up to nearest nice number (1, 2, 5, or 10)
		let niceMax;
		if (normalized <= 1) niceMax = 1;
		else if (normalized <= 2) niceMax = 2;
		else if (normalized <= 5) niceMax = 5;
		else niceMax = 10;

		return niceMax * magnitude;
	});

	const bars = $derived(component.data.map((item, index) => ({
		...item,
		percentage: (item.value / scale) * 100,
		color: item.color || defaultColors[index % defaultColors.length]
	})));

	const isVertical = $derived(component.orientation !== 'horizontal');
</script>

<div class={`flex flex-col ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if component.title}
		<h3 class="text-sm md:text-base font-semibold mb-3 text-center text-slate-300">{component.title}</h3>
	{/if}

	{#if isVertical}
		<div class="flex items-end justify-center gap-8 md:gap-12 h-96">
			{#each bars as bar}
				<div class="flex flex-col items-center gap-4">
					<span class="text-xl md:text-2xl font-semibold">{bar.value}</span>
					<div class="w-20 md:w-24 rounded-t-2xl transition-all hover:opacity-80" style="height: {bar.percentage}%; background-color: {bar.color}; min-height: 8px;"></div>
					<span class="text-lg md:text-xl text-slate-300">{bar.label}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col gap-6 w-full max-w-4xl mx-auto">
			{#each bars as bar}
				<div class="flex items-center gap-6">
					<span class="text-lg md:text-xl w-32 md:w-40 text-right">{bar.label}</span>
					<div class="flex-1 bg-slate-800/30 rounded-xl h-12 md:h-14 relative">
						<div class="h-full rounded-xl flex items-center justify-end px-4 transition-all hover:opacity-80" style="width: {bar.percentage}%; background-color: {bar.color};">
							<span class="text-lg md:text-xl font-semibold">{bar.value}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
