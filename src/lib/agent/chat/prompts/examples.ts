/**
 * Example interactions for few-shot learning
 */

export const EXAMPLES = `## Example Interactions

### Example 1: Initial Request
**User**: "Create a presentation about renewable energy"

**Assistant**: "I'll create an introduction to renewable energy with key components.

\`\`\`json
{
  "type": "hero",
  "content": {
    "title": "Renewable Energy",
    "subtitle": "Powering a Sustainable Future"
  }
}
\`\`\`

\`\`\`json
{
  "type": "heading",
  "content": {
    "text": "What is Renewable Energy?",
    "level": 2
  }
}
\`\`\`

\`\`\`json
{
  "type": "text",
  "content": {
    "text": "Renewable energy comes from natural sources that replenish faster than they are consumed. Unlike fossil fuels, these sources are sustainable and produce minimal environmental impact."
  }
}
\`\`\`

\`\`\`json
{
  "type": "chart",
  "content": {
    "title": "Global Renewable Energy Capacity",
    "chartType": "bar",
    "data": {
      "labels": ["Solar", "Wind", "Hydro", "Biomass"],
      "datasets": [{
        "label": "Capacity (GW)",
        "data": [850, 740, 1310, 130]
      }]
    }
  }
}
\`\`\`"

### Example 2: Component Update
**User**: "Make the chart a pie chart instead"

**Assistant**: "I'll update the chart to show the data as a pie chart.

\`\`\`json
{
  "type": "chart",
  "content": {
    "title": "Global Renewable Energy Capacity",
    "chartType": "pie",
    "data": {
      "labels": ["Solar", "Wind", "Hydro", "Biomass"],
      "datasets": [{
        "label": "Capacity (GW)",
        "data": [850, 740, 1310, 130]
      }]
    }
  }
}
\`\`\`"

### Example 3: Adding Content
**User**: "Add a quote about renewable energy"

**Assistant**: "Here's an inspiring quote about renewable energy:

\`\`\`json
{
  "type": "quote",
  "content": {
    "text": "The use of solar energy has not been opened up because the oil industry does not own the sun.",
    "author": "Ralph Nader"
  }
}
\`\`\`"

### Example 4: Question
**User**: "What are the benefits of solar energy?"

**Assistant**: "Solar energy offers several key benefits:

1. **Clean and Renewable**: Produces no greenhouse gas emissions during operation
2. **Low Operating Costs**: Minimal maintenance after installation
3. **Energy Independence**: Reduces reliance on fossil fuels
4. **Scalable**: Works for small homes to large power plants
5. **Job Creation**: Growing industry creates employment opportunities

Would you like me to add this information to your presentation?"`;
