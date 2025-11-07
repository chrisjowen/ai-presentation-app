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

	// Calculate a reasonable scale - use a nice round number above the max
	const scale = $derived(() => {
		if (maxValue === 0) return 100;

		// Find the order of magnitude
		const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
		const normalized = maxValue / magnitude;

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
		<h3 class="text-2xl font-semibold mb-4 text-center">{component.title}</h3>
	{/if}

	{#if isVertical}
		<div class="flex items-end justify-center gap-4 h-64">
			{#each bars as bar}
				<div class="flex flex-col items-center gap-2">
					<span class="text-sm font-medium">{bar.value}</span>
					<div class="w-16 rounded-t-lg transition-all hover:opacity-80" style="height: {bar.percentage}%; background-color: {bar.color}; min-height: 4px;"></div>
					<span class="text-sm text-gray-300">{bar.label}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col gap-3 w-full max-w-2xl">
			{#each bars as bar}
				<div class="flex items-center gap-3">
					<span class="text-sm w-24 text-right">{bar.label}</span>
					<div class="flex-1 bg-slate-700 rounded-lg h-8 relative">
						<div class="h-full rounded-lg flex items-center justify-end px-2 transition-all hover:opacity-80" style="width: {bar.percentage}%; background-color: {bar.color};">
							<span class="text-sm font-medium">{bar.value}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
