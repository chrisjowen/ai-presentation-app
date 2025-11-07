# GitHub Copilot Development Lifecycle Instructions

## Overview
This repository follows a structured development lifecycle that emphasizes story-driven development, test-driven development (TDD), and comprehensive documentation. All features must be implemented following this process.

## Core Principles
1. **Story-Driven Development**: Every feature starts with a clear story and implementation plan
2. **Test-Driven Development**: Follow red-green-refactor cycle for all code changes
3. **Documentation-First**: Update documentation with every task completion
4. **Quality Gates**: All commits must pass tests and maintain code quality standards

## Directory Structure Philosophy

### `.copilot/` - Reusable Process Framework
Contains **technology-agnostic** process definitions that can be reused across any SDLC project:
- **`prompts/`**: Process prompts for development lifecycle stages
- **`templates/`**: Standardized templates for stories and implementation plans
- **Purpose**: Defines HOW to develop (process, methodology, workflow)

### `docs/` - Project-Specific Documentation  
Contains **project and technology-specific** documentation:
- **`stories/`**: Actual user stories and implementation plans for this project
- **`architecture/`**: This project's system architecture and technical decisions  
- **`features/`**: This project's feature documentation
- **`coding-standards/`**: Technology-specific coding standards and examples
- **Purpose**: Defines WHAT is being built (requirements, architecture, standards)

## Development Workflow

### Phase 0: Project Initialization (First Time Only)
**ALWAYS check for existing documentation first**:
1. **Check Documentation**: Look for `docs/🏗️ architecture/system-overview.md` and `docs/🏗️ architecture/business-overview.md`
2. **If No Documentation Exists**: Use `.copilot/prompts/initialize-project.prompt.md` to set up project foundation
3. **Create Agent Log**: Initialize `docs/📋 agent-changelog.md` to track all activities
4. **Validation**: Ensure all base documentation exists before proceeding

### Phase 1: Story Creation and Planning
When given a feature description or conversation transcript:

1. **Create Story**: Generate a user story from the feature description
2. **Implementation Planning**: 
   - Use `.copilot/prompts/create-implementation-plan.prompt.md` to generate detailed plan
   - Use story template from `.copilot/templates/story-template.md`
   - Create feature directory: `docs/🎨 features/[feature-name]/`
   - Save story in `docs/🎨 features/[feature-name]/story-[no].md`
   - Save implementation plan in `docs/🎨 features/[feature-name]/implementation-[no].md`
   - Include confidence score and task breakdown with checkboxes

### Phase 2: Development Cycle
Follow the process defined in `.copilot/prompts/development-cycle.prompt.md`:

1. **Branch Management**:
   - Ensure on main branch and up to date (`git pull`)
   - Create feature branch: `feature/[story-no]-brief-description`

2. **Task Implementation**:
   - Follow implementation plan checklist in order
   - Update plan progress after each step
   - Apply TDD cycle for all code changes (see `prompts/tdd-cycle.prompt.md`)

3. **Quality Requirements**:
   - All tests must pass before committing
   - Documentation must be updated for each completed task
   - Follow code standards and best practices

### Phase 3: Test-Driven Development
Use `.copilot/prompts/tdd-cycle.prompt.md` for all code changes:

1. **Red**: Write failing test first
2. **Green**: Write minimal code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Repeat**: ONE test at a time, complete full cycle each iteration

### Phase 4: Documentation Updates
Use `.copilot/prompts/update-documentation.prompt.md` for:

1. Update relevant documentation in `./docs/` after each task
2. Update architecture diagrams if applicable
3. Update feature documentation
4. Ensure all changes are reflected in appropriate docs

### Phase 5: Learning Capture
Use `.copilot/prompts/update-agent-learnings.prompt.md` for:

1. **After Cycle Completion**: Capture insights from completed development cycles
2. **Problem Resolution**: Document solutions to significant challenges
3. **Process Improvements**: Record workflow optimizations and enhancements
4. **User Request**: Update learnings when explicitly requested
5. Store learnings in `docs/🤖 agent/💡 learnings/` and update learning index

### Phase 6: Quality Assurance
Before story completion:

1. Run full test suite and ensure 100% pass rate
2. Check code coverage and aim for high coverage
3. Run CodeQL analysis for security issues
4. Record metrics diff (tests, coverage, docs changes)
5. Ensure all documentation is updated and accurate

## File Structure Requirements

```
.copilot/
├── prompts/
│   ├── initialize-project.prompt.md
│   ├── create-implementation-plan.prompt.md
│   ├── development-cycle.prompt.md
│   ├── tdd-cycle.prompt.md
│   ├── update-documentation.prompt.md
│   └── update-agent-learnings.prompt.md
└── templates/
    ├── story-template.md
    ├── implementation-template.md
    ├── ADR-template.md
    ├── system-overview-template.md
    ├── agent-changelog-template.md
    └── agent-learnings-template.md

docs/
├── 🎨 features/
│   └── [feature-name]/
│       ├── story-[no].md
│       ├── implementation-[no].md
│       └── feature-overview.md
├── 🏗️ architecture/
│   ├── system-overview.md
│   ├── business-overview.md
│   └── decisions/
├── 🔌 api/
├── 💻 coding-standards/
│   ├── development-standards.md
│   ├── testing-standards.md
│   └── [technology-specific].md
├── 🤖 agent/
│   ├── 💡 learnings/
│   │   └── AL-[XXX]-[description].md
│   ├── 📊 learning-index.md
│   └── 🔄 retrospectives/
└── 📋 agent-changelog.md
```

## Commit Standards

- Each commit represents completion of a task from implementation plan
- Commit only when all tests pass
- Include relevant documentation updates in same commit
- Use conventional commit format: `feat(story-X): brief description`

## Quality Gates

Before merging feature branch:
- [ ] All tests pass
- [ ] Code coverage maintained or improved
- [ ] Documentation updated
- [ ] CodeQL analysis clean
- [ ] Implementation plan 100% complete
- [ ] Story acceptance criteria met

## Instructions for Copilot

1. **Check documentation first** - if no `docs/` exist, run initialization prompt
2. **Log all activities** - update `docs/📋 agent-changelog.md` with every significant action
3. **Follow the prompts** - use the specific prompt files in `.copilot/prompts/` for each phase
4. **Maintain quality gates** - never compromise on testing or documentation
5. **Update progress** - always update implementation plan progress
6. **One step at a time** - complete each phase fully before moving to next
7. **Ask for clarification** if feature requirements are unclear
8. **Record metrics** - track improvements in tests, coverage, and documentation
9. **Capture learnings** - update agent learnings after completing cycles or when requested

Remember: This process ensures high-quality, maintainable code with comprehensive testing and documentation. Every step is important for long-term project success.