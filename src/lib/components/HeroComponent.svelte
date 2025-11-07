<script lang="ts">
	import type { HeroComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: HeroComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	// Overlay styles
	const overlayClass = $derived(() => {
		switch (component.overlay) {
			case 'dark':
				return 'bg-gradient-to-t from-black/80 via-black/40 to-transparent';
			case 'light':
				return 'bg-gradient-to-t from-black/60 via-black/30 to-transparent';
			case 'heavy':
				return 'bg-gradient-to-t from-black/90 via-black/60 to-black/20';
			default:
				return 'bg-gradient-to-t from-black/70 via-black/40 to-transparent';
		}
	});

	// Text alignment
	const alignmentClass = $derived(() => {
		switch (component.textAlign) {
			case 'center':
				return 'items-center text-center';
			case 'right':
				return 'items-end text-right';
			default:
				return 'items-start text-left';
		}
	});
</script>

<div class={`${getTransitionClass(transition)} relative w-full h-screen -mx-[10vw] -my-[5vh]`}>
	<!-- Full-bleed background image -->
	<div
		class="absolute inset-0 bg-cover bg-center"
		style={`background-image: url('${component.backgroundImage}')`}
	></div>

	<!-- Gradient overlay -->
	<div class={`absolute inset-0 ${overlayClass()}`}></div>

	<!-- Content -->
	<div class={`relative h-full flex flex-col justify-end p-16 md:p-24 ${alignmentClass()}`}>
		{#if component.heading}
			<h1
				class="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight leading-none text-white text-shadow-lg"
			>
				{component.heading}
			</h1>
		{/if}

		{#if component.subheading}
			<p class="text-3xl md:text-4xl lg:text-5xl font-light text-slate-100 text-shadow-md max-w-4xl">
				{component.subheading}
			</p>
		{/if}
	</div>
</div>
