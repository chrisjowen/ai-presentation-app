# Copilot Agent Baseline

# .copilot Directory

This directory contains **reusable, technology-agnostic** process definitions for software development lifecycle management. These files can be copied to any project regardless of programming language or technology stack.

## Directory Structure

### `prompts/`
Contains process prompts that guide the development lifecycle:

- **`initialize-project.prompt.md`** - Sets up project foundation with business context, architecture, and standards
- **`create-implementation-plan.prompt.md`** - Guides creation of detailed implementation plans from feature descriptions
- **`development-cycle.prompt.md`** - Defines the complete development cycle with branch management, quality gates, and commit standards
- **`tdd-cycle.prompt.md`** - Enforces Test-Driven Development (TDD) red-green-refactor methodology
- **`update-documentation.prompt.md`** - Ensures comprehensive documentation updates throughout development
- **`update-agent-learnings.prompt.md`** - Captures and integrates learnings for continuous improvement

### `templates/`
Contains standardized templates for consistent documentation creation:

- **`story-template.md`** - Template for creating user stories with acceptance criteria
- **`implementation-template.md`** - Template for detailed implementation plans with task breakdown
- **`ADR-template.md`** - Template for Architectural Decision Records
- **`system-overview-template.md`** - Template for documenting system architecture
- **`agent-changelog-template.md`** - Template for tracking agent activities
- **`agent-learnings-template.md`** - Template for capturing development insights

## Usage Philosophy

### What Goes Here (Technology-Agnostic)
- **Process definitions**: HOW to develop software
- **Workflow templates**: Standard formats and structures
- **Methodology guides**: TDD, documentation practices, etc.
- **Quality gates**: When and how to verify quality

### What Goes in `docs/` (Project-Specific)
- **Actual stories and plans**: Real user stories for this project
- **System architecture**: This project's technical design
- **Coding standards**: Technology-specific examples and tools
- **API documentation**: This project's endpoints and contracts

## Reusability

This `.copilot/` directory is designed to be:
- **Portable**: Can be copied to any new project
- **Language-agnostic**: No technology-specific examples or syntax
- **Process-focused**: Defines methodology, not implementation
- **Standardized**: Provides consistent development practices across projects

## Getting Started with New Project

1. **Copy `.copilot/` directory** to your new project
2. **Run initialization**: Agent will use `initialize-project.prompt.md` if no `docs/` exist
3. **Begin development**: Follow structured story-driven development process
4. **Track progress**: All agent activities logged in `docs/agent-changelog.md`

## Integration

These prompts work together to create a complete development lifecycle:

0. **New Project** → `initialize-project.prompt.md` → **Project Foundation**
1. **Feature Request** → `create-implementation-plan.prompt.md` → **Story + Plan**
2. **Implementation** → `development-cycle.prompt.md` → **Structured Development**
3. **Code Changes** → `tdd-cycle.prompt.md` → **Quality Code**
4. **Task Completion** → `update-documentation.prompt.md` → **Current Documentation**
5. **Cycle/Learning** → `update-agent-learnings.prompt.md` → **Captured Knowledge**

## Customization

While the core process should remain consistent, you can:
- Adjust templates to match your story format preferences
- Modify confidence scoring criteria in implementation planning
- Add project-specific quality gates to development cycle
- Customize documentation types and locations

## Technology-Specific Examples

For language and framework-specific examples, tools, and best practices, refer to:
- `docs/coding-standards/[technology]-standards.md`
- `docs/coding-standards/testing-standards.md`
- `docs/coding-standards/development-standards.md`

This separation ensures that process knowledge remains reusable while technical details stay project-specific.
