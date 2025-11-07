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
