<script lang="ts">
	import type { ProgressComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: ProgressComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Ensure value is between 0 and 100
	const normalizedValue = $derived(Math.min(100, Math.max(0, component.value)));
	
	// Color variants
	const colorClasses = $derived(() => {
		switch (component.variant) {
			case 'success':
				return 'bg-green-500';
			case 'warning':
				return 'bg-yellow-500';
			case 'error':
				return 'bg-red-500';
			case 'info':
				return 'bg-blue-500';
			default:
				return 'bg-blue-500';
		}
	});
</script>

<div class={`${getTransitionClass(transition)} w-full max-w-2xl mx-auto`}>
	{#if component.label}
		<div class="flex justify-between items-center mb-2">
			<span class="text-lg font-semibold text-slate-200">{component.label}</span>
			{#if component.showValue}
				<span class="text-lg font-bold text-slate-300">{normalizedValue}%</span>
			{/if}
		</div>
	{/if}
	
	<div class="w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
		<div
			class={`h-full ${colorClasses()} transition-all duration-1000 ease-out rounded-full`}
			style={`width: ${normalizedValue}%`}
		></div>
	</div>
	
	{#if component.description}
		<p class="text-sm text-slate-400 mt-2">{component.description}</p>
	{/if}
</div>
