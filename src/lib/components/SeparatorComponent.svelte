<script lang="ts">
	import type { SeparatorComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: SeparatorComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Style variants
	const styleClasses = $derived(() => {
		switch (component.style) {
			case 'dashed':
				return 'border-dashed';
			case 'dotted':
				return 'border-dotted';
			case 'gradient':
				return 'border-0 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent';
			default:
				return 'border-solid';
		}
	});

	// Thickness
	const thicknessClass = $derived(() => {
		switch (component.thickness) {
			case 'thin':
				return 'border-t';
			case 'thick':
				return 'border-t-4';
			default:
				return 'border-t-2';
		}
	});
</script>

<div class={`${getTransitionClass(transition)} w-full flex items-center gap-4 my-8`}>
	{#if component.label}
		<div class={`flex-1 ${styleClasses()} ${thicknessClass()} border-slate-700`}></div>
		<span class="text-slate-400 font-semibold px-4">{component.label}</span>
		<div class={`flex-1 ${styleClasses()} ${thicknessClass()} border-slate-700`}></div>
	{:else}
		<div class={`flex-1 ${styleClasses()} ${thicknessClass()} border-slate-700`}></div>
	{/if}
</div>
