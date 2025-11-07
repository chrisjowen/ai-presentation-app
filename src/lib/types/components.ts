/**
 * Component Registry
 * Shared type definitions for all presentation components
 */

export type TransitionType = 
	| 'fade' 
	| 'slide-left' 
	| 'slide-right' 
	| 'slide-up' 
	| 'slide-down' 
	| 'wipe-left'
	| 'wipe-right'
	| 'wipe-up'
	| 'wipe-down'
	| 'zoom-in'
	| 'zoom-out'
	| 'instant';

export interface BaseComponent {
	id: string;
	type: string;
	transition?: TransitionType;
	transitionDuration?: number; // milliseconds
}

// Text Component
export interface TextComponent extends BaseComponent {
	type: 'text';
	content: string;
	variant?: 'heading' | 'subheading' | 'title' | 'body' | 'caption';
	align?: 'left' | 'center' | 'right';
	color?: string;
	gradient?: string; // CSS gradient string, e.g., "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
	className?: string;
}

// Image Component
export interface ImageComponent extends BaseComponent {
	type: 'image';
	src: string;
	alt?: string;
	fit?: 'contain' | 'cover' | 'fill';
	fullBleed?: boolean; // Edge-to-edge image
	className?: string;
}

// Grid Container Component
export interface GridComponent extends BaseComponent {
	type: 'grid';
	columns?: number | string; // e.g., 3 or "1fr 2fr 1fr"
	rows?: number | string;
	gap?: number; // in pixels
	children: Component[];
	className?: string;
}

// Table Component
export interface TableComponent extends BaseComponent {
	type: 'table';
	headers: string[];
	rows: string[][];
	className?: string;
}

// Pie Chart Component
export interface PieChartComponent extends BaseComponent {
	type: 'pie';
	data: Array<{ label: string; value: number; color?: string }>;
	title?: string;
	className?: string;
}

// Bar Chart Component
export interface BarChartComponent extends BaseComponent {
	type: 'bar';
	data: Array<{ label: string; value: number; color?: string }>;
	title?: string;
	orientation?: 'vertical' | 'horizontal';
	className?: string;
}

// Code Block Component
export interface CodeBlockComponent extends BaseComponent {
	type: 'code';
	code: string;
	language: string;
	highlightLines?: number[];
	showLineNumbers?: boolean;
	title?: string;
	className?: string;
}

// Timeline Component
export interface TimelineComponent extends BaseComponent {
	type: 'timeline';
	events: Array<{ date: string; title: string; description?: string }>;
	orientation?: 'horizontal' | 'vertical';
	className?: string;
}

// Card Grid Component
export interface CardGridComponent extends BaseComponent {
	type: 'cards';
	cards: Array<{ icon?: string; title: string; description: string }>;
	columns?: number;
	className?: string;
}

// Quote/Callout Component
export interface QuoteComponent extends BaseComponent {
	type: 'quote';
	content: string;
	author?: string;
	variant?: 'default' | 'info' | 'warning' | 'success';
	icon?: string;
	className?: string;
}

// Animated Counter Component
export interface CounterComponent extends BaseComponent {
	type: 'counter';
	value: number;
	label: string;
	suffix?: string; // e.g., "%", "M+", "K"
	duration?: number; // Animation duration in ms
	className?: string;
}

// Comparison Table Component
export interface ComparisonTableComponent extends BaseComponent {
	type: 'comparison';
	items: Array<{ name: string; features: Array<boolean | string> }>;
	features: string[]; // Feature names
	className?: string;
}

// Mermaid Diagram Component
export interface MermaidComponent extends BaseComponent {
	type: 'mermaid';
	diagram: string; // Mermaid syntax
	title?: string;
	className?: string;
}

// Progress Component
export interface ProgressComponent extends BaseComponent {
	type: 'progress';
	value: number; // 0-100
	label?: string;
	description?: string;
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
	showValue?: boolean;
}

// Badge Component
export interface BadgeComponent extends BaseComponent {
	type: 'badge';
	badges: Array<{
		text: string;
		icon?: string;
	}>;
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
	size?: 'sm' | 'md' | 'lg';
}

// Alert Component
export interface AlertComponent extends BaseComponent {
	type: 'alert';
	title?: string;
	message: string;
	variant: 'info' | 'success' | 'warning' | 'error';
	icon?: string;
}

// Separator Component
export interface SeparatorComponent extends BaseComponent {
	type: 'separator';
	label?: string;
	style?: 'solid' | 'dashed' | 'dotted' | 'gradient';
	thickness?: 'thin' | 'medium' | 'thick';
}

// Hero Component - Full-bleed image with text overlay
export interface HeroComponent extends BaseComponent {
	type: 'hero';
	backgroundImage: string;
	heading?: string;
	subheading?: string;
	overlay?: 'light' | 'dark' | 'heavy';
	textAlign?: 'left' | 'center' | 'right';
}

// Statement Component - Huge text, minimal design
export interface StatementComponent extends BaseComponent {
	type: 'statement';
	text: string;
	size?: 'md' | 'lg' | 'xl';
	gradient?: boolean;
}

// Split Layout Component - Asymmetric image + content
export interface SplitLayoutComponent extends BaseComponent {
	type: 'split';
	imageUrl: string;
	imageAlt?: string;
	imageSide?: 'left' | 'right';
	ratio?: '60/40' | '70/30' | '40/60' | '30/70';
	content: {
		heading?: string;
		subheading?: string;
		points?: string[];
	};
}

// Title Slide Component - Professional title slide with branding
export interface TitleSlideComponent extends BaseComponent {
	type: 'title-slide';
	title: string;
	subtitle?: string;
	author?: string;
	date?: string;
	backgroundImage?: string;
	overlay?: 'light' | 'dark' | 'heavy' | 'none';
	className?: string;
}

// Section Divider Component - Visual break between sections
export interface SectionDividerComponent extends BaseComponent {
	type: 'section-divider';
	title: string;
	subtitle?: string;
	number?: number;
	icon?: string;
	backgroundImage?: string;
	className?: string;
}

// Content Slide Component - Grid-based professional layout
export interface ContentSlideComponent extends BaseComponent {
	type: 'content-slide';
	header?: {
		title: string;
		subtitle?: string;
	};
	layout: '1-column' | '2-column' | '3-column' | '2-column-wide-left' | '2-column-wide-right';
	content: Component[][];
	className?: string;
}

// Union type of all components
export type Component =
	| TextComponent
	| ImageComponent
	| GridComponent
	| TableComponent
	| PieChartComponent
	| BarChartComponent
	| CodeBlockComponent
	| TimelineComponent
	| CardGridComponent
	| QuoteComponent
	| CounterComponent
	| ComparisonTableComponent
	| MermaidComponent
	| ProgressComponent
	| BadgeComponent
	| AlertComponent
	| SeparatorComponent
	| HeroComponent
	| StatementComponent
	| SplitLayoutComponent
	| TitleSlideComponent
	| SectionDividerComponent
	| ContentSlideComponent;

// Component Registry metadata for agent reference
export interface ComponentDefinition {
	type: string;
	description: string;
	props: {
		name: string;
		type: string;
		required: boolean;
		description: string;
		default?: any;
	}[];
}

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
	text: {
		type: 'text',
		description: 'Display text content with styling options',
		props: [
			{ name: 'id', type: 'string', required: true, description: 'Unique component identifier' },
			{ name: 'content', type: 'string', required: true, description: 'Text content to display' },
			{ name: 'variant', type: 'heading | subheading | body | caption', required: false, description: 'Text style variant', default: 'body' },
			{ name: 'align', type: 'left | center | right', required: false, description: 'Text alignment', default: 'left' },
			{ name: 'color', type: 'string', required: false, description: 'Text color (CSS color value)' },
			{ name: 'className', type: 'string', required: false, description: 'Additional Tailwind classes' }
		]
	},
	image: {
		type: 'image',
		description: 'Display an image with sizing options',
		props: [
			{ name: 'id', type: 'string', required: true, description: 'Unique component identifier' },
			{ name: 'src', type: 'string', required: true, description: 'Image source URL' },
			{ name: 'alt', type: 'string', required: false, description: 'Alt text for accessibility' },
			{ name: 'fit', type: 'contain | cover | fill', required: false, description: 'How image should fit container', default: 'contain' },
			{ name: 'className', type: 'string', required: false, description: 'Additional Tailwind classes' }
		]
	},
	grid: {
		type: 'grid',
		description: 'Layout container using CSS Grid',
		props: [
			{ name: 'id', type: 'string', required: true, description: 'Unique component identifier' },
			{ name: 'columns', type: 'number | string', required: false, description: 'Number of columns or CSS grid-template-columns value', default: 1 },
			{ name: 'rows', type: 'number | string', required: false, description: 'Number of rows or CSS grid-template-rows value' },
			{ name: 'gap', type: 'number', required: false, description: 'Gap between grid items in pixels', default: 16 },
			{ name: 'children', type: 'Component[]', required: true, description: 'Child components to render in grid' },
			{ name: 'className', type: 'string', required: false, description: 'Additional Tailwind classes' }
		]
	}
};
