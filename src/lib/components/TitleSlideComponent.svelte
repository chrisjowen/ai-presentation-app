<script lang="ts">
	import { getTransitionClass } from '$lib/utils/transitions';
	
	interface TitleSlideComponent {
		id: string;
		type: 'title-slide';
		title: string;
		subtitle?: string;
		author?: string;
		date?: string;
		backgroundImage?: string;
		overlay?: 'light' | 'dark' | 'heavy' | 'none';
		className?: string;
	}

	interface Props {
		component: TitleSlideComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
</script>

<div class={`w-full h-full flex flex-col items-center justify-center relative ${getTransitionClass(transition)} ${component.className || ''}`}>
	<!-- Background image with overlay -->
	{#if component.backgroundImage}
		<div class="absolute inset-0 z-0">
			<img src={component.backgroundImage} alt="" class="w-full h-full object-cover" />
			{#if component.overlay === 'light'}
				<div class="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950/80"></div>
			{:else if component.overlay === 'dark'}
				<div class="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950/90"></div>
			{:else if component.overlay === 'heavy'}
				<div class="absolute inset-0 bg-slate-950/95"></div>
			{/if}
		</div>
	{/if}

	<!-- Content -->
	<div class="relative z-10 text-center max-w-5xl px-8 space-y-8">
		<!-- Title with underline -->
		<div class="space-y-6">
			<h1 class="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
				{component.title}
			</h1>
			<div class="flex justify-center">
				<div class="h-2 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
			</div>
		</div>

		<!-- Subtitle -->
		{#if component.subtitle}
			<p class="text-2xl md:text-3xl lg:text-4xl text-slate-300 leading-relaxed">
				{component.subtitle}
			</p>
		{/if}

		<!-- Author and date -->
		{#if component.author || component.date}
			<div class="flex items-center justify-center gap-6 text-lg md:text-xl text-slate-400 pt-8">
				{#if component.author}
					<span>{component.author}</span>
				{/if}
				{#if component.author && component.date}
					<span class="text-slate-600">•</span>
				{/if}
				{#if component.date}
					<span>{component.date}</span>
				{/if}
			</div>
		{/if}
	</div>
</div>
