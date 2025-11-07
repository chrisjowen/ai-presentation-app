<script lang="ts">
	import type { AlertComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: AlertComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Color variants with icons
	const variantConfig = $derived(() => {
		switch (component.variant) {
			case 'success':
				return {
					bg: 'bg-green-500/10',
					border: 'border-green-500/30',
					text: 'text-green-300',
					icon: component.icon || '✓'
				};
			case 'warning':
				return {
					bg: 'bg-yellow-500/10',
					border: 'border-yellow-500/30',
					text: 'text-yellow-300',
					icon: component.icon || '⚠'
				};
			case 'error':
				return {
					bg: 'bg-red-500/10',
					border: 'border-red-500/30',
					text: 'text-red-300',
					icon: component.icon || '✕'
				};
			case 'info':
			default:
				return {
					bg: 'bg-blue-500/10',
					border: 'border-blue-500/30',
					text: 'text-blue-300',
					icon: component.icon || 'ℹ'
				};
		}
	});
</script>

<div
	class={`
		${getTransitionClass(transition)}
		${variantConfig().bg}
		${variantConfig().border}
		border-2 rounded-xl p-6 backdrop-blur-sm
		max-w-3xl mx-auto
	`}
>
	<div class="flex items-start gap-4">
		<div class={`text-3xl ${variantConfig().text} flex-shrink-0`}>
			{variantConfig().icon}
		</div>
		<div class="flex-1">
			{#if component.title}
				<h3 class={`text-xl font-bold mb-2 ${variantConfig().text}`}>
					{component.title}
				</h3>
			{/if}
			<p class="text-slate-200 text-lg leading-relaxed">
				{component.message}
			</p>
		</div>
	</div>
</div>
