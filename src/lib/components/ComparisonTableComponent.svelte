<script lang="ts">
	import type { ComparisonTableComponent } from '$lib/types/components';
	import { getTransitionClass } from '$lib/utils/transitions';

	interface Props {
		component: ComparisonTableComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();

	function getIcon(value: boolean | string): string {
		if (typeof value === 'boolean') {
			return value ? '✅' : '❌';
		}
		return value;
	}
</script>

<div class={`w-full max-w-6xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<thead>
				<tr class="border-b-2 border-slate-700">
					<th class="px-8 py-6 text-left text-lg md:text-xl font-bold">Feature</th>
					{#each component.items as item}
						<th class="px-8 py-6 text-center text-lg md:text-xl font-bold">{item.name}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each component.features as feature, i}
					<tr class="hover:bg-slate-900/30 transition-colors border-b border-slate-800">
						<td class="px-8 py-6 text-base md:text-lg font-medium">{feature}</td>
						{#each component.items as item}
							<td class="px-8 py-6 text-center text-2xl">
								{getIcon(item.features[i])}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
