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

<div class={`w-full max-w-5xl mx-auto ${getTransitionClass(transition)} ${component.className || ''}`}>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<thead>
				<tr class="bg-gradient-to-r from-slate-800 to-slate-700">
					<th class="px-6 py-4 text-left text-sm font-bold border-b border-slate-600">Feature</th>
					{#each component.items as item}
						<th class="px-6 py-4 text-center text-sm font-bold border-b border-slate-600">{item.name}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each component.features as feature, i}
					<tr class="hover:bg-slate-800/50 transition-colors {i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/30'}">
						<td class="px-6 py-4 text-sm font-medium border-b border-slate-700">{feature}</td>
						{#each component.items as item}
							<td class="px-6 py-4 text-center text-lg border-b border-slate-700">
								{getIcon(item.features[i])}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
