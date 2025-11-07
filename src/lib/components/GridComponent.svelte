<script lang="ts">
	import type { GridComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';
	import ComponentRenderer from './ComponentRenderer.svelte';

	interface Props {
		component: GridComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
</script>

<div
	class={`grid w-full ${getTransitionClass(transition)} ${component.className || ''}`}
	style={`
		grid-template-columns: ${typeof component.columns === 'number' ? `repeat(${component.columns}, 1fr)` : component.columns || '1fr'};
		grid-template-rows: ${typeof component.rows === 'number' ? `repeat(${component.rows}, 1fr)` : component.rows || 'auto'};
		gap: ${component.gap || 16}px;
	`}
>
	{#each component.children as child (child.id)}
		<div class="w-full">
			<ComponentRenderer component={child} />
		</div>
	{/each}
</div>
