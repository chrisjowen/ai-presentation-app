/**
 * Mermaid diagram validation and fixing
 */

export interface MermaidValidationResult {
	isValid: boolean;
	fixedDiagram?: string;
	error?: string;
}

/**
 * Validate and attempt to fix common Mermaid syntax issues
 */
export function validateAndFixMermaid(diagram: string): MermaidValidationResult {
	try {
		// Remove any leading/trailing whitespace
		let fixed = diagram.trim();

		// Check if it has a valid diagram type
		const validTypes = [
			'flowchart',
			'graph',
			'sequenceDiagram',
			'classDiagram',
			'stateDiagram',
			'erDiagram',
			'journey',
			'gantt',
			'pie',
			'gitGraph'
		];

		const hasValidType = validTypes.some((type) => fixed.startsWith(type));

		if (!hasValidType) {
			// Try to detect and add missing type
			if (fixed.includes('-->') || fixed.includes('---')) {
				fixed = 'flowchart TD\n' + fixed;
			} else if (fixed.includes('title') && fixed.includes(':')) {
				// Might be a pie chart
				if (!fixed.startsWith('pie')) {
					fixed = 'pie\n' + fixed;
				}
			}
		}

		// Ensure proper line breaks (convert \\n to actual newlines if needed)
		// This handles cases where JSON escaping is double-applied
		if (fixed.includes('\\n')) {
			fixed = fixed.replace(/\\n/g, '\n');
		}

		// Fix common syntax issues
		// 1. Ensure spaces around arrows
		fixed = fixed.replace(/([A-Za-z0-9]+)(-->|---|-.->|==>)([A-Za-z0-9]+)/g, '$1 $2 $3');

		// 2. Fix missing spaces after semicolons
		fixed = fixed.replace(/;([A-Za-z])/g, '; $1');

		// 3. Ensure flowchart direction is valid (TD, LR, RL, BT)
		fixed = fixed.replace(/^flowchart\s+([^T|L|R|B])/m, 'flowchart TD\n$1');

		// Basic validation checks
		const lines = fixed.split('\n');

		// Check if it's too short
		if (lines.length < 2) {
			return {
				isValid: false,
				error: 'Diagram must have at least 2 lines (type + content)'
			};
		}

		// Check for empty lines that might cause issues
		const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
		if (nonEmptyLines.length < 2) {
			return {
				isValid: false,
				error: 'Diagram must have at least 2 non-empty lines'
			};
		}

		return {
			isValid: true,
			fixedDiagram: fixed
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Validation error: ${error}`
		};
	}
}

/**
 * Generate example Mermaid diagrams for different use cases
 */
export const MERMAID_EXAMPLES = {
	simpleFlow: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,

	process: `flowchart LR
    A[Input] --> B[Process]
    B --> C[Validate]
    C --> D[Output]`,

	timeline: `flowchart TD
    A[2020: Start] --> B[2021: Growth]
    B --> C[2022: Expansion]
    C --> D[2023: Scale]`,

	sequence: `sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System->>System: Process
    System->>User: Response`,

	pie: `pie title Distribution
    "Category A": 45
    "Category B": 30
    "Category C": 25`
};
