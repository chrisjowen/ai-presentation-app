<script lang="ts">
	interface Props {
		title?: string;
		subtitle?: string;
		showLogo?: boolean;
		logoUrl?: string;
		variant?: 'default' | 'minimal' | 'section';
	}

	let { title, subtitle, showLogo = false, logoUrl, variant = 'default' }: Props = $props();
</script>

<div class="w-full">
	{#if variant === 'section'}
		<!-- Section divider header -->
		<div class="flex flex-col items-center justify-center py-12 border-b-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
			{#if showLogo && logoUrl}
				<img src={logoUrl} alt="Logo" class="h-12 mb-6 opacity-50" />
			{/if}
			{#if title}
				<h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-4">{title}</h1>
			{/if}
			{#if subtitle}
				<p class="text-2xl md:text-3xl text-slate-400 text-center">{subtitle}</p>
			{/if}
		</div>
	{:else if variant === 'minimal'}
		<!-- Minimal header with just logo -->
		<div class="flex items-center justify-between py-4 px-8 border-b border-slate-800">
			{#if showLogo && logoUrl}
				<img src={logoUrl} alt="Logo" class="h-8 opacity-70" />
			{/if}
			<div class="flex-1"></div>
		</div>
	{:else}
		<!-- Default header with title and underline -->
		<div class="flex flex-col py-6 px-8">
			<div class="flex items-center justify-between mb-4">
				{#if showLogo && logoUrl}
					<img src={logoUrl} alt="Logo" class="h-10 opacity-70" />
				{/if}
				<div class="flex-1"></div>
			</div>
			{#if title}
				<div class="space-y-2">
					<h2 class="text-3xl md:text-4xl font-bold">{title}</h2>
					<div class="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
				</div>
			{/if}
			{#if subtitle}
				<p class="text-lg md:text-xl text-slate-400 mt-2">{subtitle}</p>
			{/if}
		</div>
	{/if}
</div>
