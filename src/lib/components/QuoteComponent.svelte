<script lang="ts">
	import type { QuoteComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: QuoteComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	const variantStyles = {
		default: 'bg-slate-800/50 border-slate-600',
		info: 'bg-blue-900/30 border-blue-500',
		warning: 'bg-yellow-900/30 border-yellow-500',
		success: 'bg-green-900/30 border-green-500'
	};

	const style = variantStyles[component.variant || 'default'];
</script>

<div class={`w-full max-w-3xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	<div class={`${style} backdrop-blur-sm rounded-xl p-6 border-l-4 border shadow-lg`}>
		<div class="flex gap-4">
			{#if component.icon}
				<div class="text-4xl flex-shrink-0">{component.icon}</div>
			{/if}
			<div class="flex-1">
				<div class="text-xl leading-relaxed whitespace-pre-wrap italic">{component.content}</div>
				{#if component.author}
					<div class="mt-4 text-sm text-gray-400">— {component.author}</div>
				{/if}
			</div>
		</div>
	</div>
</div>