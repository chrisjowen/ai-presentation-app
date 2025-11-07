<script lang="ts">
	import type { ImageComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: ImageComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
</script>

<div class={`w-full max-w-2xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	<img
		src={component.src}
		alt={component.alt || ''}
		class={`w-full h-auto rounded-lg shadow-2xl ${component.fit === 'cover' ? 'object-cover' : component.fit === 'fill' ? 'object-fill' : 'object-contain'}`}
	/>
</div>
