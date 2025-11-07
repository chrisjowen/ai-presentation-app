<script lang="ts">
	import { getTransitionClass } from '$lib/utils/transitions';

	interface TableComponent {
		id: string;
		type: 'table';
		headers: string[];
		rows: string[][];
		transition?: string;
		transitionDuration?: number;
	}

	interface Props {
		component: TableComponent;
		transition?: string;
	}

	let { component, transition = 'fade' }: Props = $props();
</script>

<div class={`w-full overflow-x-auto ${getTransitionClass(transition)}`}>
	<table class="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
		<thead>
			<tr class="bg-slate-700">
				{#each component.headers as header}
					<th class="px-6 py-3 text-left text-sm font-semibold text-white border-b border-slate-600">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each component.rows as row, i}
				<tr class="hover:bg-slate-700 transition-colors {i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}">
					{#each row as cell}
						<td class="px-6 py-4 text-sm text-gray-300 border-b border-slate-700">{cell}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
