<script lang="ts">
	import { onMount } from 'svelte';
	import type { CounterComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: CounterComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
	let displayValue = $state(0);

	onMount(() => {
		const duration = component.duration || 2000;
		const steps = 60;
		const increment = component.value / steps;
		const interval = duration / steps;

		let current = 0;
		const timer = setInterval(() => {
			current += increment;
			if (current >= component.value) {
				displayValue = component.value;
				clearInterval(timer);
			} else {
				displayValue = Math.floor(current);
			}
		}, interval);

		return () => clearInterval(timer);
	});
</script>

<div class={`w-full max-w-md mx-auto text-center ${getTransitionClass(transition)} ${component.className || ''}`}>
	<div class="bg-slate-900/40 backdrop-blur-sm rounded-lg p-6 border border-slate-800 shadow-xl">
		<div class="text-5xl font-bold text-blue-400 mb-2">
			{displayValue.toLocaleString()}{component.suffix || ''}
		</div>
		<div class="text-xl text-gray-300">{component.label}</div>
	</div>
</div>
