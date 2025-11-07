/**
 * Tool descriptions for the chat agent
 */

export const TOOLS_DESCRIPTION = `## Available Tools

### search(query: string)
Search the web for current information. Use this when you need:
- Recent data or statistics
- Current events or news
- Real-time information
- Verification of facts

**Example**: search("renewable energy statistics 2024")

### wikipedia(topic: string)
Get detailed information from Wikipedia. Use this when you need:
- Historical context
- Comprehensive overviews
- Biographical information
- Scientific explanations

**Example**: wikipedia("Solar energy")

## When to Use Tools
- **Always** use tools for statistics, data, or current information
- **Consider** using tools for complex topics that need accuracy
- **Avoid** using tools for general knowledge or simple questions
- **Combine** multiple tool calls if needed for comprehensive information

## Tool Response Handling
1. Extract relevant information from tool responses
2. Synthesize into presentation-ready content
3. Create appropriate components (charts for data, text for explanations)
4. Cite sources when using specific data points`;
