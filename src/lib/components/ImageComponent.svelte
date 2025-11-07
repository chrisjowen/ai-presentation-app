<script lang="ts">
	import type { ImageComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: ImageComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
</script>

<div class={`w-full ${component.fullBleed ? '-mx-[10vw] max-w-none' : 'max-w-5xl mx-auto'} ${getTransitionClass(transition)} ${component.className || ''}`}>
	<img
		src={component.src}
		alt={component.alt || ''}
		class={`w-full h-auto ${component.fullBleed ? '' : 'rounded-2xl'} ${component.fit === 'cover' ? 'object-cover' : component.fit === 'fill' ? 'object-fill' : 'object-contain'}`}
	/>
</div>
