<script lang="ts">
	interface Props {
		text?: string;
		showPageNumber?: boolean;
		pageNumber?: number;
		totalPages?: number;
		variant?: 'default' | 'minimal' | 'branded';
		brandColor?: string;
	}

	let { 
		text, 
		showPageNumber = true, 
		pageNumber = 1, 
		totalPages, 
		variant = 'default',
		brandColor = '#8b5cf6'
	}: Props = $props();
</script>

<div class="w-full">
	{#if variant === 'branded'}
		<!-- Branded footer with accent line -->
		<div class="flex items-center justify-between py-4 px-8 border-t-2" style="border-color: {brandColor};">
			{#if text}
				<span class="text-sm text-slate-400">{text}</span>
			{/if}
			<div class="flex-1"></div>
			{#if showPageNumber}
				<span class="text-sm text-slate-400">
					{#if totalPages}
						{pageNumber} / {totalPages}
					{:else}
						{pageNumber}
					{/if}
				</span>
			{/if}
		</div>
	{:else if variant === 'minimal'}
		<!-- Minimal footer -->
		<div class="flex items-center justify-end py-3 px-8">
			{#if showPageNumber}
				<span class="text-xs text-slate-500">{pageNumber}</span>
			{/if}
		</div>
	{:else}
		<!-- Default footer -->
		<div class="flex items-center justify-between py-4 px-8 border-t border-slate-800">
			{#if text}
				<span class="text-sm text-slate-400">{text}</span>
			{/if}
			<div class="flex-1"></div>
			{#if showPageNumber}
				<span class="text-sm text-slate-400">
					{#if totalPages}
						{pageNumber} / {totalPages}
					{:else}
						{pageNumber}
					{/if}
				</span>
			{/if}
		</div>
	{/if}
</div>
