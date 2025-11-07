<script lang="ts">
	import type { PieChartComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: PieChartComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	const total = $derived(component.data.reduce((sum, item) => sum + item.value, 0));
	const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

	const slices = $derived((() => {
		let currentAngle = -90;
		return component.data.map((item, index) => {
			const percentage = (item.value / total) * 100;
			const angle = (item.value / total) * 360;
			const startAngle = currentAngle;
			const endAngle = currentAngle + angle;
			currentAngle = endAngle;

			const startX = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
			const startY = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
			const endX = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
			const endY = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);
			const largeArc = angle > 180 ? 1 : 0;

			const path = `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArc} 1 ${endX} ${endY} Z`;

			return { ...item, percentage, path, color: item.color || defaultColors[index % defaultColors.length] };
		});
	})());
</script>

<div class={`flex flex-col items-center ${getTransitionClass(transition)} ${component.className || ''}`}>
	{#if component.title}
		<h3 class="text-3xl md:text-4xl lg:text-5xl font-semibold mb-12">{component.title}</h3>
	{/if}

	<div class="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
		<svg viewBox="0 0 100 100" class="w-80 h-80 md:w-96 md:h-96">
			{#each slices as slice}
				<path d={slice.path} fill={slice.color} stroke="#0f172a" stroke-width="0.5" class="transition-all hover:opacity-80" />
			{/each}
		</svg>

		<div class="flex flex-col gap-4">
			{#each slices as slice}
				<div class="flex items-center gap-4">
					<div class="w-6 h-6 rounded-lg" style="background-color: {slice.color}"></div>
					<span class="text-lg md:text-xl">{slice.label}: <span class="font-semibold">{slice.percentage.toFixed(1)}%</span></span>
				</div>
			{/each}
		</div>
	</div>
</div>
