<script lang="ts">
	import { getTransitionClass } from '$lib/utils/transitions';
	
	interface SectionDividerComponent {
		id: string;
		type: 'section-divider';
		title: string;
		subtitle?: string;
		number?: number;
		icon?: string;
		backgroundImage?: string;
		className?: string;
	}

	interface Props {
		component: SectionDividerComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
</script>

<div class={`w-full h-full flex flex-col items-center justify-center relative ${getTransitionClass(transition)} ${component.className || ''}`}>
	<!-- Background image with heavy overlay -->
	{#if component.backgroundImage}
		<div class="absolute inset-0 z-0">
			<img src={component.backgroundImage} alt="" class="w-full h-full object-cover opacity-20" />
		</div>
	{/if}

	<!-- Decorative top line -->
	<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

	<!-- Content -->
	<div class="relative z-10 text-center max-w-4xl px-8 space-y-8">
		<!-- Section number or icon -->
		{#if component.number}
			<div class="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 opacity-50">
				{component.number.toString().padStart(2, '0')}
			</div>
		{:else if component.icon}
			<div class="text-8xl md:text-9xl">
				{component.icon}
			</div>
		{/if}

		<!-- Title -->
		<h2 class="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
			{component.title}
		</h2>

		<!-- Subtitle -->
		{#if component.subtitle}
			<p class="text-2xl md:text-3xl text-slate-400 leading-relaxed">
				{component.subtitle}
			</p>
		{/if}

		<!-- Decorative underline -->
		<div class="flex justify-center pt-4">
			<div class="h-1 w-48 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
		</div>
	</div>

	<!-- Decorative bottom line -->
	<div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
</div>
