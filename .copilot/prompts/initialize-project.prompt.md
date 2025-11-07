# Initialize Project Prompt

## Objective
Initialize a new project with comprehensive documentation structure, business context, technical foundation, and coding standards. This should be the FIRST step when working with any new project.

## When to Use This Prompt
- Project has no existing documentation in `docs/`
- Working with a new codebase for the first time  
- Setting up development lifecycle for an existing project
- Migrating to this development process

## Pre-Initialization Assessment

### Project Discovery Questions
Before initializing, gather information about:

1. **Project Purpose**:
   - What problem does this project solve?
   - Who are the target users?
   - What are the core business objectives?

2. **Technical Context**:
   - What technologies/languages are being used?
   - What is the current architecture (if any)?
   - What external services or dependencies exist?

3. **Team Context**:
   - Team size and structure
   - Development experience level
   - Existing development processes

4. **Business Context**:
   - Project timeline and milestones
   - Success criteria and metrics
   - Compliance or regulatory requirements

## Initialization Process

### Step 1: Create Base Documentation Structure

#### 1.1 Business Overview (`docs/architecture/business-overview.md`)
Create comprehensive business context document:

**Content Structure**:
```markdown
# Project Business Overview

## Project Mission
[Clear statement of what this project aims to achieve]

## Problem Statement
### Current State
[What problems exist today?]

### Desired Future State  
[What will success look like?]

## Target Users
### Primary Users
- **User Type 1**: Description, needs, pain points
- **User Type 2**: Description, needs, pain points

### Secondary Users
- **User Type**: Description, interaction patterns

## Business Objectives
### Primary Objectives
1. **Objective 1**: Measurable outcome
2. **Objective 2**: Measurable outcome

### Success Metrics
- **Metric 1**: How measured, target value
- **Metric 2**: How measured, target value

## Market Context
### Competitive Landscape
[Key competitors and differentiators]

### Market Opportunity
[Size, growth, timing considerations]

## Constraints and Requirements
### Business Constraints
- Budget limitations
- Timeline requirements
- Resource constraints

### Regulatory Requirements
- Compliance needs
- Security requirements
- Privacy considerations

## Stakeholders
### Internal Stakeholders
- **Role**: Responsibilities and expectations

### External Stakeholders  
- **Role**: Relationship and requirements
```

#### 1.2 System Architecture Overview (`docs/architecture/system-overview.md`)
Use `.copilot/templates/system-overview-template.md` and customize with:

- Current technology stack discovery
- Existing system components analysis
- Integration points identification
- Performance and scalability considerations

#### 1.3 Coding Standards (`docs/coding-standards/`)
Set up technology-specific standards:

**For Each Technology Used**:
- Create `[technology]-standards.md` (e.g., `javascript-standards.md`, `python-standards.md`)
- Include framework-specific guidelines
- Define testing frameworks and patterns
- Set up linting and formatting rules

### Step 2: Analyze Existing Codebase (if applicable)

#### 2.1 Codebase Analysis
If working with existing code:

**Architecture Discovery**:
- [ ] Identify main components and their relationships
- [ ] Map data flow and dependencies  
- [ ] Document existing APIs and interfaces
- [ ] Note technical debt and improvement opportunities

**Technology Audit**:
- [ ] List all dependencies and versions
- [ ] Identify build and deployment processes
- [ ] Document testing setup (if any)
- [ ] Note development environment requirements

#### 2.2 Feature Inventory
Create initial feature documentation:

**For Each Major Feature**:
- Create `docs/features/[feature-name]/feature-overview.md`
- Document current functionality
- Note user workflows and business rules
- Identify gaps or improvement opportunities

### Step 3: Establish Development Foundation

#### 3.1 Initial Architectural Decisions
Create foundational ADRs in `docs/architecture/decisions/`:

**Essential Decision Records**:
- **ADR-001**: Technology Stack Rationale
- **ADR-002**: Architecture Pattern Choice  
- **ADR-003**: Testing Strategy
- **ADR-004**: Development Process Adoption

#### 3.2 Development Environment Setup
Document in appropriate coding standards:

**Setup Requirements**:
- [ ] Development environment prerequisites
- [ ] Installation and configuration steps
- [ ] Local development workflow
- [ ] Testing and build processes

### Step 4: Create Agent Changelog

#### 4.1 Initialize Agent Log (`docs/agent-changelog.md`)
Create tracking log for all agent activities:

**Content Structure**:
```markdown
# Agent Activity Changelog

## Purpose
This log tracks all significant actions taken by the development agent, providing an audit trail of project evolution and decision-making.

## Log Format
Each entry includes:
- **Date/Time**: When action was taken
- **Action Type**: Type of activity performed
- **Description**: What was done and why
- **Files Affected**: List of created/modified files
- **Outcome**: Results or next steps

---

## [YYYY-MM-DD HH:MM] - Project Initialization
**Action Type**: INITIALIZATION
**Description**: Initialized project documentation structure and development lifecycle
**Files Created**:
- docs/architecture/business-overview.md
- docs/architecture/system-overview.md  
- docs/coding-standards/[technology]-standards.md
- docs/architecture/decisions/ADR-001-technology-stack.md
- docs/agent-changelog.md

**Outcome**: Project ready for feature development using structured SDLC process
**Next Steps**: Begin feature analysis and story creation

---
```

## Quality Gates for Initialization

### Completion Checklist
- [ ] **Business Overview**: Comprehensive business context documented
- [ ] **System Architecture**: Current/planned architecture documented  
- [ ] **Coding Standards**: Technology-specific standards established
- [ ] **Initial ADRs**: Key architectural decisions recorded
- [ ] **Feature Inventory**: Existing features documented (if applicable)
- [ ] **Agent Changelog**: Activity tracking established
- [ ] **Directory Structure**: All required folders created
- [ ] **Development Setup**: Environment and process documented

### Validation Criteria
- [ ] All documentation follows established templates
- [ ] Business objectives are clear and measurable
- [ ] Technical decisions are justified and recorded
- [ ] Development process is ready for immediate use
- [ ] Team can begin feature development workflow

## Post-Initialization Actions

### Immediate Next Steps
1. **Team Onboarding**: Share documentation with development team
2. **Process Training**: Ensure team understands SDLC workflow
3. **Tool Setup**: Configure development tools and CI/CD
4. **First Feature**: Identify and plan first development story

### Ongoing Maintenance
- Update documentation as project evolves
- Record all significant decisions in ADRs
- Maintain agent changelog with all activities
- Review and refine process based on team feedback

## Instructions for Copilot

1. **Always run initialization first** when no docs exist
2. **Gather context before creating** - ask clarifying questions
3. **Be thorough but practical** - create usable documentation
4. **Focus on immediate needs** - don't over-engineer initially  
5. **Use templates consistently** - maintain standardization
6. **Record everything** - maintain complete activity log
7. **Validate completeness** - ensure all sections are addressed

Remember: Good initialization saves significant time throughout the project lifecycle and ensures consistent, high-quality development practices from day one.
