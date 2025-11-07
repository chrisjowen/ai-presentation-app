<script lang="ts">
	import type { BadgeComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: BadgeComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Color variants
	const variantClasses = $derived(() => {
		switch (component.variant) {
			case 'success':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			case 'warning':
				return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
			case 'error':
				return 'bg-red-500/20 text-red-300 border-red-500/30';
			case 'info':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			default:
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		}
	});

	// Size variants
	const sizeClasses = $derived(() => {
		switch (component.size) {
			case 'sm':
				return 'text-xs px-2 py-0.5';
			case 'lg':
				return 'text-lg px-4 py-2';
			default:
				return 'text-sm px-3 py-1';
		}
	});
</script>

<div class={`${getTransitionClass(transition)} flex flex-wrap gap-2 justify-center`}>
	{#each component.badges as badge}
		<span
			class={`
				inline-flex items-center gap-1.5 rounded-full border font-semibold
				${variantClasses()}
				${sizeClasses()}
				backdrop-blur-sm
			`}
		>
			{#if badge.icon}
				<span>{badge.icon}</span>
			{/if}
			<span>{badge.text}</span>
		</span>
	{/each}
</div>
