# Implementation Plan Creation Prompt

## Objective
Create a comprehensive implementation plan for a given feature story, including task breakdown, technical approach, and confidence scoring.

## Context Analysis
Before creating the plan, analyze:

1. **Feature Requirements**: What exactly needs to be built?
2. **Existing Documentation**: Review `docs/` for current architecture, features, and APIs
3. **Technical Constraints**: Consider existing codebase structure and patterns
4. **Dependencies**: Identify external libraries, APIs, or services needed
5. **Testing Requirements**: What needs to be tested and how

## Implementation Plan Structure

### Story Information
- **Story Number**: Generate next sequential number (check existing stories)
- **Title**: Clear, concise feature title
- **Description**: Detailed feature description
- **Acceptance Criteria**: Specific, measurable criteria for completion
- **Priority**: High/Medium/Low
- **Estimated Effort**: Small/Medium/Large/XL

### Technical Approach
- **Architecture Changes**: Required modifications to existing architecture
- **New Components**: List of new files, classes, or modules to create
- **Modified Components**: Existing code that needs updates
- **Database Changes**: Schema updates, migrations, new tables
- **API Changes**: New endpoints, modified responses, breaking changes
- **Dependencies**: New packages or libraries to install

### Task Breakdown
Break down implementation into specific, actionable tasks:

```markdown
## Implementation Tasks

### Phase 1: Foundation
- [ ] Task 1: Brief description
  - **Files**: List specific files to create/modify
  - **Tests**: Specific tests to write
  - **Docs**: Documentation to update
  - **Estimated Time**: X hours

- [ ] Task 2: Brief description
  - **Files**: List specific files to create/modify
  - **Tests**: Specific tests to write
  - **Docs**: Documentation to update
  - **Estimated Time**: X hours

### Phase 2: Core Implementation
- [ ] Task 3: Brief description
  - **Files**: List specific files to create/modify
  - **Tests**: Specific tests to write
  - **Docs**: Documentation to update
  - **Estimated Time**: X hours

### Phase 3: Integration & Polish
- [ ] Task 4: Brief description
  - **Files**: List specific files to create/modify
  - **Tests**: Specific tests to write
  - **Docs**: Documentation to update
  - **Estimated Time**: X hours
```

### Risk Assessment
- **Technical Risks**: Potential implementation challenges
- **Dependencies**: External factors that could block progress
- **Unknowns**: Areas requiring research or experimentation
- **Mitigation Strategies**: How to handle identified risks

### Testing Strategy
- **Unit Tests**: Specific units to test
- **Integration Tests**: System interactions to test
- **E2E Tests**: User workflows to test
- **Performance Tests**: Load/stress testing requirements
- **Security Tests**: Security considerations and tests

### Documentation Requirements
- **Architecture Updates**: Diagrams or documents to update
- **API Documentation**: New or modified API docs
- **User Documentation**: End-user facing documentation
- **Developer Documentation**: Code documentation and guides

## Confidence Assessment

Rate confidence level (1-10) for:
- **Requirements Clarity**: How well-defined are the requirements?
- **Technical Approach**: How confident are you in the proposed solution?
- **Effort Estimation**: How accurate are the time estimates?
- **Risk Mitigation**: How well are risks identified and planned for?

**Overall Confidence Score**: X/10

### Confidence Factors
- **High Confidence (8-10)**: Clear requirements, proven approach, low risk
- **Medium Confidence (5-7)**: Some unknowns, moderate complexity
- **Low Confidence (1-4)**: Unclear requirements, high complexity, significant unknowns

## Refinement Process

If confidence score is below 7, identify areas needing clarification:

1. **Requirements Questions**: Specific questions about unclear requirements
2. **Technical Research**: Areas needing investigation or prototyping
3. **Stakeholder Input**: Who needs to provide additional information

## Output Format

Generate two files:
1. `docs/stories/[story_no]/story.md` - User story and acceptance criteria
2. `docs/stories/[story_no]/implementation.md` - Full implementation plan

## Instructions for Copilot

1. **Start with skeleton**: Create basic structure first
2. **Analyze thoroughly**: Review existing docs before planning
3. **Be specific**: Include exact file names and test descriptions
4. **Assess realistically**: Don't overestimate confidence
5. **Ask questions**: If requirements are unclear, ask for clarification
6. **Iterate**: Refine plan based on feedback before implementation
7. **Keep updated**: Update plan progress as tasks are completed

Remember: A good implementation plan saves time during development and ensures nothing is forgotten.
