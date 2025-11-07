<script lang="ts">
	import type { Component } from '$lib/types/components';
	import TextComponent from './TextComponent.svelte';
	import ImageComponent from './ImageComponent.svelte';
	import GridComponent from './GridComponent.svelte';
	import TableComponent from './TableComponent.svelte';
	import PieChartComponent from './PieChartComponent.svelte';
	import BarChartComponent from './BarChartComponent.svelte';
	import CodeBlockComponent from './CodeBlockComponent.svelte';
	import TimelineComponent from './TimelineComponent.svelte';
	import CardGridComponent from './CardGridComponent.svelte';
	import QuoteComponent from './QuoteComponent.svelte';
	import CounterComponent from './CounterComponent.svelte';
	import ComparisonTableComponent from './ComparisonTableComponent.svelte';
	import MermaidComponent from './MermaidComponent.svelte';

	interface Props {
		component: Component;
		transition?: string;
	}

	let { component, transition = 'instant' }: Props = $props();
</script>

{#if component.type === 'text'}
	<TextComponent component={component} {transition} />
{:else if component.type === 'image'}
	<ImageComponent component={component} {transition} />
{:else if component.type === 'grid'}
	<GridComponent component={component} {transition} />
{:else if component.type === 'table'}
	<TableComponent component={component} {transition} />
{:else if component.type === 'pie'}
	<PieChartComponent component={component} {transition} />
{:else if component.type === 'bar'}
	<BarChartComponent component={component} {transition} />
{:else if component.type === 'code'}
	<CodeBlockComponent component={component} {transition} />
{:else if component.type === 'timeline'}
	<TimelineComponent component={component} {transition} />
{:else if component.type === 'cards'}
	<CardGridComponent component={component} {transition} />
{:else if component.type === 'quote'}
	<QuoteComponent component={component} {transition} />
{:else if component.type === 'counter'}
	<CounterComponent component={component} {transition} />
{:else if component.type === 'comparison'}
	<ComparisonTableComponent component={component} {transition} />
{:else if component.type === 'mermaid'}
	<MermaidComponent component={component} {transition} />
{/if}
