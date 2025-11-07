/**
 * Smooth transitions for professional presentation feel
 * Optimized for 60fps performance
 */

import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function getTransitionClass(transition?: string): string {
	switch (transition) {
		case 'fade':
			return 'animate-fade';
		case 'slide-up':
			return 'animate-slide-up';
		case 'slide-down':
			return 'animate-slide-down';
		case 'slide-left':
			return 'animate-slide-left';
		case 'slide-right':
			return 'animate-slide-right';
		default:
			return 'animate-fade';
	}
}

export interface FadeSlideParams {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	y?: number;
	x?: number;
}

/**
 * Smooth fade with optional slide
 * Uses transform for 60fps performance
 */
export function fadeSlide(
	node: Element,
	{ delay = 0, duration = 400, easing = cubicOut, y = 10, x = 0 }: FadeSlideParams = {}
): TransitionConfig {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	
	if (prefersReducedMotion) {
		return {
			delay,
			duration: 0,
			easing,
			css: () => ''
		};
	}

	return {
		delay,
		duration,
		easing,
		css: (t) => {
			const opacity = t;
			const translateY = (1 - t) * y;
			const translateX = (1 - t) * x;
			
			return `
				opacity: ${opacity};
				transform: translate(${translateX}px, ${translateY}px);
			`;
		}
	};
}

/**
 * Smooth scale fade for important elements
 */
export function scaleFade(
	node: Element,
	{ delay = 0, duration = 400, easing = cubicOut }: Omit<FadeSlideParams, 'y' | 'x'> = {}
): TransitionConfig {
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	
	if (prefersReducedMotion) {
		return {
			delay,
			duration: 0,
			easing,
			css: () => ''
		};
	}

	return {
		delay,
		duration,
		easing,
		css: (t) => {
			const opacity = t;
			const scale = 0.95 + (t * 0.05);
			
			return `
				opacity: ${opacity};
				transform: scale(${scale});
			`;
		}
	};
}
