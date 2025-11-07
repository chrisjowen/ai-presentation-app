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
	import ProgressComponent from './ProgressComponent.svelte';
	import BadgeComponent from './BadgeComponent.svelte';
	import AlertComponent from './AlertComponent.svelte';
	import SeparatorComponent from './SeparatorComponent.svelte';
	import HeroComponent from './HeroComponent.svelte';
	import StatementComponent from './StatementComponent.svelte';
	import SplitLayoutComponent from './SplitLayoutComponent.svelte';
	import TitleSlideComponent from './TitleSlideComponent.svelte';
	import SectionDividerComponent from './SectionDividerComponent.svelte';
	import ContentSlideComponent from './ContentSlideComponent.svelte';

	interface Props {
		component: Component;
		transition?: string;
	}

	let { component, transition = 'instant' }: Props = $props();
</script>

<div data-component-type={component.type} data-component-id={component.id}>
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
	{:else if component.type === 'progress'}
		<ProgressComponent component={component} {transition} />
	{:else if component.type === 'badge'}
		<BadgeComponent component={component} {transition} />
	{:else if component.type === 'alert'}
		<AlertComponent component={component} {transition} />
	{:else if component.type === 'separator'}
		<SeparatorComponent component={component} {transition} />
	{:else if component.type === 'hero'}
		<HeroComponent component={component} {transition} />
	{:else if component.type === 'statement'}
		<StatementComponent component={component} {transition} />
	{:else if component.type === 'split'}
		<SplitLayoutComponent component={component} {transition} />
	{:else if component.type === 'title-slide'}
		<TitleSlideComponent component={component} {transition} />
	{:else if component.type === 'section-divider'}
		<SectionDividerComponent component={component} {transition} />
	{:else if component.type === 'content-slide'}
		<ContentSlideComponent component={component} {transition} />
	{/if}
</div>
