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
			<tr class="border-b-2 border-slate-700">
				{#each component.headers as header}
					<th class="px-8 py-6 text-left text-lg md:text-xl font-semibold text-slate-200">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each component.rows as row, i}
				<tr class="border-b border-slate-800 hover:bg-slate-900/30 transition-colors">
					{#each row as cell}
						<td class="px-8 py-6 text-base md:text-lg text-slate-300">{cell}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
