# Story 002-D: Dynamic Presentation Structure

## Story Information
- **Story Number**: 002-D
- **Parent Story**: 002 (UI/UX Improvements)
- **Title**: Dynamic Presentation Structure - Varied Openings and Flow
- **Priority**: High
- **Estimated Effort**: Medium (2-3 hours)
- **Status**: Planning

## Description
Make presentation structure dynamic instead of always starting with a title slide. Presentations should feel unique and engaging with varied openings, pacing, and component usage.

## User Stories
- As a presentation viewer, I want varied presentation openings so that each presentation feels fresh and engaging
- As a presentation viewer, I want dynamic pacing so that the presentation maintains my attention
- As a presentation creator, I want the AI to use diverse component types so that presentations are visually interesting

## Acceptance Criteria
- [ ] Presentations don't always start with title slide
- [ ] At least 5 different opening patterns implemented
- [ ] Varied pacing throughout presentations
- [ ] Better mix of component types (use all available components)
- [ ] Tests verify presentation variety (generate 10 presentations, check for variety)
- [ ] Agent prompt updated with new patterns
- [ ] Documentation updated with examples

## Opening Patterns to Implement

### Pattern 1: Bold Statement
Start with a large, impactful statement or statistic
```
- Counter component with impressive number
- Big heading with emoji
- Immediate impact
```

### Pattern 2: Question Hook
Start with an intriguing question
```
- Large text component with question
- Pause for effect
- Answer with visual components
```

### Pattern 3: Visual First
Start with a striking image or diagram
```
- Full-screen image
- Minimal text overlay
- Let visuals tell the story
```

### Pattern 4: Quote Opening
Start with a powerful quote
```
- Quote component
- Attribution
- Expand on the theme
```

### Pattern 5: Data Visualization
Start with a chart or graph
```
- Pie chart or bar chart
- Show the data first
- Explain the story behind it
```

## Technical Requirements
### Functional Requirements
- **FR1**: Update agent prompt with varied opening patterns
- **FR2**: Add logic to randomly select opening pattern
- **FR3**: Ensure smooth transitions between patterns
- **FR4**: Maintain narrative coherence despite varied structure
- **FR5**: Use all component types throughout presentation

### Non-Functional Requirements
- **Performance**: Pattern selection should not add latency
- **Quality**: Presentations should still be coherent and engaging
- **Variety**: No two presentations should feel identical

## Dependencies
### Internal Dependencies
- [ ] Agent prompt system (`src/lib/agent/simple-agent.ts`)
- [ ] All component types must be available

### External Dependencies
- None

## Implementation Tasks
1. **Update agent prompt** with varied opening patterns
2. **Add examples** for each pattern type
3. **Test variety** by generating multiple presentations
4. **Refine patterns** based on results
5. **Document patterns** for future reference

## Testing Strategy
- Generate 10 presentations on different topics
- Verify at least 4 different opening patterns are used
- Check that presentations maintain coherence
- Verify all component types are used across presentations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Agent prompt updated and tested
- [ ] Generated presentations show variety
- [ ] Documentation updated with examples
- [ ] Code committed with descriptive messages

## Notes
- Focus on maintaining narrative flow despite varied structure
- Ensure patterns match the topic and tone
- Don't sacrifice coherence for variety
