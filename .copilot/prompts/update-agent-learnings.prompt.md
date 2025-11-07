# Update Agent Learnings Prompt

## Objective
Capture, document, and integrate learnings from development cycles to improve future performance and share knowledge across projects.

## When to Trigger Learning Updates

### Automatic Triggers
- **Cycle Completion**: After completing any full development cycle (story → implementation → testing → documentation)
- **Problem Resolution**: After resolving significant bugs, challenges, or obstacles
- **Process Improvements**: When discovering better ways to follow or modify the SDLC workflow
- **Performance Insights**: When identifying ways to work more efficiently or effectively

### Manual Triggers
- **User Request**: When user explicitly asks for learning updates
- **Retrospective**: During scheduled retrospective or review sessions
- **Knowledge Sharing**: When preparing to hand off project or onboard new team members
- **Process Evaluation**: During formal process assessment or improvement initiatives

## Learning Capture Process

### Step 1: Identify Learning Opportunities
**Reflect on Recent Activities**:
- What went well that could be replicated?
- What challenges were encountered and how were they resolved?
- What would be done differently next time?
- What new insights were gained about the technology, process, or domain?

**Categories to Consider**:
- **Process Efficiency**: Workflow improvements or optimizations
- **Technical Solutions**: Better implementation approaches or patterns
- **Communication**: Improved ways to gather requirements or provide updates
- **Quality Assurance**: Enhanced testing or validation techniques
- **Problem-Solving**: Effective debugging or troubleshooting methods
- **Tool Usage**: Better utilization of development tools or frameworks

### Step 2: Document Learning Using Template
**Use `.copilot/templates/agent-learnings-template.md`**:

1. **Create Learning Entry**: Generate unique ID (AL-001, AL-002, etc.)
2. **Categorize Learning**: Select primary category and assess impact
3. **Document Context**: Capture situation, challenge, and solution
4. **Detail Implementation**: Explain what changed and why it's better
5. **Assess Applicability**: Define when and how to apply this learning
6. **Plan Integration**: Identify documentation updates needed

### Step 3: Store and Organize Learnings
**File Location**: `docs/agent/learnings/AL-[XXX]-[brief-description].md`

**Directory Structure**:
```
docs/agent/
├── learnings/
│   ├── AL-001-improved-tdd-workflow.md
│   ├── AL-002-better-error-handling-patterns.md
│   └── AL-003-efficient-documentation-updates.md
├── learning-index.md
└── retrospectives/
    ├── 2025-Q1-retrospective.md
    └── monthly-reviews/
```

### Step 4: Update Process Documentation
**Based on Learnings, Update**:
- **Prompts**: Improve `.copilot/prompts/` based on process learnings
- **Templates**: Enhance `.copilot/templates/` with better formats
- **Standards**: Update `docs/coding-standards/` with technical insights
- **Guidelines**: Modify main instructions based on workflow improvements

### Step 5: Create Learning Index
**Maintain**: `docs/agent/learning-index.md` with:
- Summary of all learnings
- Cross-references between related learnings
- Quick reference for common scenarios
- Impact assessment of implemented learnings

## Learning Assessment Framework

### Impact Evaluation
**Assess Each Learning**:
- **Effectiveness**: How much did this improve outcomes?
- **Applicability**: How broadly can this be applied?
- **Adoption**: How easily can others implement this?
- **Sustainability**: Will this continue to provide value?

### Success Metrics
**Track Learning Impact**:
- **Time Savings**: Reduction in task completion time
- **Quality Improvements**: Fewer bugs, better test coverage
- **Process Efficiency**: Smoother workflow, fewer blockers
- **Knowledge Transfer**: Easier onboarding or handoffs

### Validation Methods
**Verify Learning Value**:
- **Apply in Next Cycle**: Test learning in subsequent development work
- **Measure Results**: Compare metrics before and after implementation
- **Gather Feedback**: Collect input from team members or users
- **Iterate and Improve**: Refine learnings based on results

## Retrospective Process

### Cycle-End Retrospective
**After Each Major Feature/Story**:
1. **What Worked Well**: Successful practices to continue
2. **What Could Improve**: Areas needing enhancement
3. **What to Try**: New approaches to experiment with
4. **Actions to Take**: Specific changes to implement

### Periodic Deep Retrospectives
**Monthly or Quarterly**:
1. **Trend Analysis**: Patterns across multiple cycles
2. **Process Evolution**: How SDLC workflow has improved
3. **Knowledge Gaps**: Areas needing additional learning
4. **Strategic Improvements**: Major process or tool changes

## Integration with Development Workflow

### During Story Planning
**Reference Existing Learnings**:
- Review relevant learnings from similar previous work
- Apply proven patterns and approaches
- Avoid previously identified anti-patterns
- Incorporate process improvements

### During Implementation
**Capture Real-Time Insights**:
- Note effective techniques as they're discovered
- Document challenges and solutions as they occur
- Track deviations from planned approach and outcomes
- Record unexpected insights or revelations

### During Review and Retrospective
**Consolidate and Document**:
- Synthesize insights from the complete cycle
- Identify patterns across multiple tasks or stories
- Document lessons that apply beyond current context
- Plan integration of learnings into future work

## Learning Sharing and Communication

### Internal Documentation
**Update Project Knowledge Base**:
- Integrate learnings into relevant documentation
- Update coding standards and best practices
- Enhance development guidelines and workflows
- Create quick reference guides for common scenarios

### Cross-Project Knowledge Transfer
**Share Learnings Across Projects**:
- Abstract project-specific details for general applicability
- Update `.copilot/` framework with universal improvements
- Create case studies for complex or high-impact learnings
- Maintain library of reusable patterns and solutions

## Quality Assurance for Learnings

### Learning Validation Checklist
- [ ] **Clear and Actionable**: Learning can be understood and applied by others
- [ ] **Evidence-Based**: Learning is supported by concrete evidence or results
- [ ] **Contextual**: Appropriate context and constraints are documented
- [ ] **Reusable**: Learning can be applied in similar future situations
- [ ] **Integrated**: Learning is incorporated into relevant process documentation

### Regular Review Process
**Monthly Learning Review**:
- Assess effectiveness of implemented learnings
- Identify learnings that need refinement or updates
- Retire outdated or superseded learnings
- Consolidate related learnings into unified guidelines

## Instructions for Copilot

1. **Proactive Learning Capture**: Don't wait for explicit requests - identify learning opportunities
2. **Comprehensive Documentation**: Use full template for significant learnings
3. **Practical Focus**: Emphasize actionable insights over theoretical observations
4. **Evidence-Based**: Support learnings with concrete examples and results
5. **Integration Mindset**: Always consider how learnings improve the overall process
6. **Continuous Improvement**: Regularly review and refine captured learnings
7. **Knowledge Sharing**: Make learnings accessible and reusable for future work

### Learning Capture Triggers
- [ ] After resolving any significant challenge or problem
- [ ] When discovering more efficient approaches or techniques
- [ ] After completing any development cycle or major milestone
- [ ] When user provides feedback or requests improvements
- [ ] During retrospectives or process review sessions
- [ ] When adapting process for new technologies or contexts

Remember: The goal is continuous improvement through systematic learning capture and application. Every challenge is an opportunity to enhance future performance.
