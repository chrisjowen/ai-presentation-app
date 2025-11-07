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

<div class={`w-full max-w-6xl mx-auto overflow-x-auto ${getTransitionClass(transition)}`}>
	<table class="w-full border-collapse">
		<thead>
			<tr class="border-b border-slate-700">
				{#each component.headers as header}
					<th class="px-4 py-2 text-left text-xs md:text-sm font-semibold text-slate-200 uppercase tracking-wide">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each component.rows as row, i}
				<tr class="border-b border-slate-800 hover:bg-slate-900/30 transition-colors">
					{#each row as cell}
						<td class="px-4 py-2 text-xs md:text-sm text-slate-300">{cell}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
