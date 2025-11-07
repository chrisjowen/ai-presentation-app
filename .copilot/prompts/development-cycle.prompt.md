# Development Cycle Prompt

## Objective
Execute the development cycle for implementing features following best practices, ensuring quality, and maintaining proper git workflow.

## Pre-Development Setup

### 1. Branch Management
**ALWAYS start with these steps:**

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Create feature branch with story number and brief description
git checkout -b feature/[story-no]-brief-description
```

**Branch Naming Convention:**
- Format: `feature/[story-no]-brief-description`
- Example: `feature/001-user-authentication`
- Keep description short (2-4 words max)

### 2. Implementation Plan Review
- Open `docs/stories/[story_no]/implementation.md`
- Review all tasks and acceptance criteria
- Understand dependencies and order of tasks
- Identify any blocking issues before starting

## Development Cycle Process

### Task Implementation Loop
For each task in the implementation plan:

#### Step 1: Task Preparation
- [ ] Read task description and requirements thoroughly
- [ ] Identify files to be created or modified
- [ ] Review existing code in those areas
- [ ] Plan the minimal viable implementation

#### Step 2: Apply TDD Cycle
**MUST follow `prompts/tdd-cycle.prompt.md` for ALL code changes:**
- Write failing test first (RED)
- Write minimal code to pass (GREEN)  
- Refactor and improve (REFACTOR)
- Repeat for each piece of functionality

#### Step 3: Task Completion Verification
- [ ] All new tests pass
- [ ] All existing tests still pass
- [ ] Code follows project standards
- [ ] No linting errors
- [ ] Documentation updated as specified in task

#### Step 4: Update Implementation Plan
- [ ] Mark task as completed: `- [x] Task description`
- [ ] Add any notes about changes or decisions made
- [ ] Update estimated vs actual time if tracking

#### Step 5: Commit Changes
**Only commit when ALL criteria met:**
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code quality maintained

```bash
# Add all changes
git add .

# Commit with conventional format
git commit -m "feat(story-X): brief description of completed task

- Specific change 1
- Specific change 2
- Updated documentation"
```

## Quality Gates During Development

### Continuous Verification
Run these checks frequently using project-specific commands:
- **Test Suite**: Execute all tests to ensure functionality works
- **Code Quality**: Run linting/static analysis tools
- **Test Coverage**: Check coverage reports to ensure adequate testing
- **Build Process**: Verify code compiles/builds without errors

Refer to `docs/coding-standards/` for technology-specific commands and tools.

### Before Each Commit
- [ ] Full test suite passes
- [ ] No linting errors
- [ ] All modified files have appropriate tests
- [ ] Documentation reflects changes
- [ ] Implementation plan updated

### Task-Level Quality Checks
- [ ] Code follows project patterns and conventions
- [ ] Error handling implemented appropriately
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Accessibility requirements met (if applicable)

## Documentation Integration

### During Each Task
Use `.copilot/prompts/update-documentation.prompt.md` to:
- [ ] Update API documentation for new/changed endpoints
- [ ] Update architecture diagrams if structure changed
- [ ] Update feature documentation
- [ ] Add/update code comments for complex logic
- [ ] Update README if new setup steps required

### Documentation Locations
- **API Changes**: `docs/api/`
- **Architecture Changes**: `docs/architecture/`
- **Feature Documentation**: `docs/features/`
- **Code Documentation**: Inline comments and docstrings

## Error Handling and Debugging

### When Tests Fail
1. **Understand the failure**: Read error messages carefully
2. **Isolate the issue**: Run single failing test if possible
3. **Debug systematically**: Use debugger or logging
4. **Fix minimally**: Make smallest change to fix issue
5. **Verify fix**: Ensure fix doesn't break other tests

### When Stuck
1. **Review implementation plan**: Ensure understanding is correct
2. **Check existing patterns**: Look for similar implementations
3. **Research solutions**: Check documentation, Stack Overflow, etc.
4. **Ask for help**: Document specific issue and what you've tried
5. **Update plan if needed**: Add research tasks or adjust approach

## Progress Tracking

### Daily Progress Update
- [ ] Update implementation plan with completed tasks
- [ ] Note any blockers or changes in approach
- [ ] Record actual time vs estimates (if tracking)
- [ ] Identify next day's priorities

### Weekly Progress Review
- [ ] Review overall story progress
- [ ] Assess if story will meet original timeline
- [ ] Update confidence scores if significant changes
- [ ] Communicate any concerns or roadblocks

## Branch Management Best Practices

### Keep Branch Updated
Regularly sync with main branch:
```bash
# Fetch latest changes
git fetch origin

# Merge main into feature branch (if needed)
git merge origin/main
```

### Before Final Merge
- [ ] All implementation tasks completed
- [ ] All tests pass
- [ ] Documentation fully updated
- [ ] Code quality gates passed
- [ ] Story acceptance criteria met

## Instructions for Copilot

1. **Follow the order**: Don't skip steps in the cycle
2. **One task at a time**: Complete each task fully before moving to next
3. **Update as you go**: Keep implementation plan current
4. **Quality first**: Never compromise on tests or documentation
5. **Commit regularly**: Small, focused commits are better than large ones
6. **Stay organized**: Keep workspace clean and files properly structured
7. **Document decisions**: Note any deviations from original plan
8. **Follow standards**: Refer to `docs/coding-standards/` for project-specific development practices and tooling

Remember: Consistency in following this cycle leads to higher quality code, better maintainability, and fewer bugs in production.
