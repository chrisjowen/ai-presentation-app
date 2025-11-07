<script lang="ts">
	interface Props {
		message?: string;
	}

	let { message = 'Processing...' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-8 animate-fade">
	<!-- Animated circles -->
	<div class="relative w-32 h-32">
		<div class="absolute inset-0 rounded-full border-4 border-purple-500 opacity-20"></div>
		<div class="absolute inset-2 rounded-full border-4 border-blue-500 opacity-30 animate-spin-slow"></div>
		<div class="absolute inset-4 rounded-full border-4 border-purple-400 opacity-40 animate-spin-reverse"></div>
		<div class="absolute inset-6 rounded-full border-4 border-blue-400 opacity-50 animate-pulse"></div>
		<div class="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse"></div>
	</div>

	<!-- Message -->
	<div class="text-2xl font-semibold text-center">
		<div class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
			{message}
		</div>
	</div>

	<!-- Dots animation -->
	<div class="flex gap-2">
		<div class="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0ms"></div>
		<div class="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style="animation-delay: 150ms"></div>
		<div class="w-3 h-3 rounded-full bg-blue-400 animate-bounce" style="animation-delay: 300ms"></div>
	</div>
</div>

<style>
	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes spin-reverse {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}

	.animate-spin-slow {
		animation: spin-slow 3s linear infinite;
	}

	.animate-spin-reverse {
		animation: spin-reverse 2s linear infinite;
	}
</style>
