<script lang="ts">
	import type { StatementComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: StatementComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Size mapping
	const sizeClass = $derived(() => {
		switch (component.size) {
			case 'xl':
				return 'text-8xl md:text-9xl';
			case 'lg':
				return 'text-7xl md:text-8xl';
			case 'md':
				return 'text-6xl md:text-7xl';
			default:
				return 'text-7xl md:text-8xl lg:text-9xl';
		}
	});
</script>

<div class={`${getTransitionClass(transition)} flex items-center justify-center min-h-[60vh] px-8 md:px-16`}>
	<h1
		class={`
			${sizeClass()}
			font-bold
			tracking-tighter
			leading-none
			text-center
			max-w-6xl
			${component.gradient ? 'text-gradient' : 'text-white'}
		`}
	>
		{component.text}
	</h1>
</div>
