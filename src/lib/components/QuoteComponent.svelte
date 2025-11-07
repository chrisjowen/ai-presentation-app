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

<div class={`w-full max-w-5xl mx-auto ${getTransitionClass(transition)} ${component.className || ''} py-8`}>
	<div class="relative">
		{#if component.icon}
			<div class="text-6xl md:text-7xl mb-8 opacity-80">{component.icon}</div>
		{/if}
		<blockquote class="text-3xl md:text-4xl lg:text-5xl font-light leading-relaxed italic text-slate-100">
			"{component.content}"
		</blockquote>
		{#if component.author}
			<div class="mt-8 text-2xl md:text-3xl text-slate-400 font-normal">— {component.author}</div>
		{/if}
		<!-- Subtle accent line -->
		<div class="absolute -left-6 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
	</div>
</div>