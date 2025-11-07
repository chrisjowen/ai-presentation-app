/**
 * Theme System for Presentations
 */

export interface Theme {
	id: string;
	name: string;
	background: ThemeBackground;
	header?: ThemeElement;
	footer?: ThemeElement;
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		text: string;
		textSecondary: string;
	};
}

export interface ThemeBackground {
	type: 'color' | 'gradient' | 'image';
	value: string; // CSS color, gradient, or image URL
	overlay?: string; // Optional overlay color with opacity
}

export interface ThemeElement {
	content?: string;
	height?: string;
	className?: string;
	backgroundImage?: string;
}

export const THEMES: Record<string, Theme> = {
	default: {
		id: 'default',
		name: 'Default',
		background: {
			type: 'gradient',
			value: 'linear-gradient(to bottom right, #0a0a0a, #1a1a1a)'
		},
		colors: {
			primary: '#3b82f6',
			secondary: '#60a5fa',
			accent: '#10b981',
			text: '#ffffff',
			textSecondary: '#9ca3af'
		}
	},

	space: {
		id: 'space',
		name: 'Space',
		background: {
			type: 'gradient',
			value: 'linear-gradient(to bottom, #000000, #0a0a1a, #1a0a2e)',
			overlay: 'rgba(0, 0, 0, 0.3)'
		},
		header: {
			height: '80px',
			className: 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm'
		},
		footer: {
			height: '60px',
			className: 'bg-black/30 backdrop-blur-sm'
		},
		colors: {
			primary: '#a78bfa',
			secondary: '#818cf8',
			accent: '#c084fc',
			text: '#ffffff',
			textSecondary: '#d8b4fe'
		}
	},

	ai: {
		id: 'ai',
		name: 'AI',
		background: {
			type: 'gradient',
			value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
			overlay: 'rgba(0, 0, 0, 0.4)'
		},
		header: {
			height: '80px',
			className: 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-md border-b border-purple-500/30'
		},
		footer: {
			height: '60px',
			className: 'bg-black/40 backdrop-blur-md border-t border-purple-500/20'
		},
		colors: {
			primary: '#818cf8',
			secondary: '#c084fc',
			accent: '#06b6d4',
			text: '#ffffff',
			textSecondary: '#e9d5ff'
		}
	}
};

// Keywords to detect which theme to use
export const THEME_KEYWORDS: Record<string, string[]> = {
	space: ['space', 'galaxy', 'planet', 'star', 'astronaut', 'cosmos', 'universe', 'asteroid', 'rocket', 'nasa'],
	ai: ['ai', 'artificial intelligence', 'machine learning', 'neural', 'deep learning', 'gpt', 'llm', 'model', 'algorithm', 'robot']
};

export function detectTheme(text: string): string {
	const lowerText = text.toLowerCase();

	for (const [themeId, keywords] of Object.entries(THEME_KEYWORDS)) {
		if (keywords.some(keyword => lowerText.includes(keyword))) {
			return themeId;
		}
	}

	return 'default';
}
