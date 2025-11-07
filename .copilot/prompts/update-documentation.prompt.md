# Documentation Update Prompt

## Objective
Maintain comprehensive, accurate, and up-to-date documentation throughout the development lifecycle, ensuring all changes are properly documented as they are implemented.

## Documentation Philosophy

### Living Documentation
- Documentation should evolve with the code
- Updates happen during development, not after
- Documentation is part of the Definition of Done
- Outdated documentation is worse than no documentation

### Documentation-Driven Development
- Update documentation to reflect intended changes first
- Use documentation to clarify requirements
- Documentation serves as specification for implementation
- Keep documentation concise but complete

## Documentation Types and Locations

### 1. Architecture Documentation (`docs/architecture/`)

#### System Architecture
**File**: `docs/architecture/system-overview.md`
**Update When**:
- New services or components added
- System boundaries change
- Technology stack changes
- Integration patterns change

**Content Structure**:
```markdown
# System Architecture Overview

## High-Level Architecture
[Architecture diagram]

## Components
### Component Name
- **Purpose**: What this component does
- **Technology**: Languages, frameworks, databases
- **Dependencies**: Other components it depends on
- **APIs**: External interfaces it exposes

## Data Flow
[Sequence diagrams for key workflows]

## Deployment Architecture
[Infrastructure and deployment diagrams]
```

#### Technical Decisions
**File**: `docs/architecture/decisions/ADR-XXX-decision-title.md`
**Update When**:
- Making significant technical decisions
- Changing architectural patterns
- Adopting new technologies
- Deprecating old approaches

**Content Structure**:
```markdown
# ADR-XXX: Decision Title

**Status**: Proposed | Accepted | Deprecated | Superseded

**Date**: YYYY-MM-DD

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences
What becomes easier or more difficult to do and any risks introduced by the change?
```

### 2. Feature Documentation (`docs/features/`)

#### Feature Overview
**File**: `docs/features/feature-name.md`
**Update When**:
- New features added
- Existing features modified
- Features deprecated or removed
- User workflows change

**Content Structure**:
```markdown
# Feature Name

## Overview
Brief description of what the feature does and why it exists.

## User Stories
- As a [user type], I want [goal] so that [reason]

## Functionality
### Core Features
- Feature 1: Description
- Feature 2: Description

### User Workflows
1. **Workflow Name**
   - Step 1: Action description
   - Step 2: Action description
   - Expected Result: What user should see

## Business Rules
- Rule 1: Condition and behavior
- Rule 2: Condition and behavior

## Dependencies
- Internal dependencies (other features)
- External dependencies (third-party services)

## Configuration
Any configuration options or environment variables.

## Limitations
Known limitations or constraints.
```

### 3. API Documentation (`docs/api/`)

#### API Reference
**File**: `docs/api/endpoints.md` or individual endpoint files
**Update When**:
- New endpoints added
- Endpoint parameters change
- Response formats change
- Authentication requirements change

**Content Structure**:
```markdown
# API Endpoints

## Authentication
How to authenticate API requests.

## Endpoints

### GET /api/users
**Purpose**: Retrieve user list

**Parameters**:
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page (default: 20)

**Response**:
```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Responses**:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `500`: Internal Server Error


#### API Changelog
**File**: `docs/api/changelog.md`
**Update When**:
- Breaking changes made
- New versions released
- Deprecations announced

### 4. Developer Documentation

#### Setup and Installation
**File**: `README.md` (root level)
**Update When**:
- Dependencies change
- Setup process changes
- New environment requirements
- Build process changes

#### Code Documentation
**Location**: Inline comments and docstrings
**Update When**:
- Complex algorithms implemented
- Public APIs created or modified
- Business logic that's not obvious
- Configuration or setup code

## Documentation Update Process

### During Task Implementation

#### Step 1: Identify Documentation Impact
Before coding, identify what documentation needs updating:
- [ ] Will this change system architecture?
- [ ] Does this add/modify user-facing features?
- [ ] Are there new API endpoints or changes?
- [ ] Do setup or deployment instructions change?

#### Step 2: Update Documentation First (When Appropriate)
For some changes, update documentation first as specification:
- [ ] API documentation for new endpoints
- [ ] Feature documentation for new user workflows
- [ ] Architecture diagrams for structural changes

#### Step 3: Update Documentation During Implementation
As you implement:
- [ ] Add code comments for complex logic
- [ ] Update API documentation as endpoints are created
- [ ] Create or update architectural decision records

#### Step 4: Finalize Documentation
Before marking task complete:
- [ ] Review all affected documentation
- [ ] Ensure accuracy and completeness
- [ ] Check links and references
- [ ] Verify examples and code snippets work

### Documentation Quality Checklist

#### Accuracy
- [ ] Information matches current implementation
- [ ] Code examples are tested and working
- [ ] Screenshots are current (if used)
- [ ] Links are valid and working

#### Completeness
- [ ] All public APIs documented
- [ ] User workflows covered
- [ ] Error conditions explained
- [ ] Configuration options listed

#### Clarity
- [ ] Written for target audience
- [ ] Uses clear, concise language
- [ ] Includes examples where helpful
- [ ] Follows consistent formatting

#### Maintainability
- [ ] Easy to find and update
- [ ] Follows established patterns
- [ ] Uses automation where possible
- [ ] Version controlled with code

## Specific Update Scenarios

### Adding New API Endpoint
1. **Before Implementation**:
   - [ ] Document endpoint specification in `docs/api/`
   - [ ] Include expected parameters and responses
   - [ ] Note authentication requirements

2. **During Implementation**:
   - [ ] Update code with appropriate docstrings
   - [ ] Add inline comments for complex logic

3. **After Implementation**:
   - [ ] Test and verify documentation examples
   - [ ] Update API changelog if applicable

### Modifying System Architecture
1. **Before Changes**:
   - [ ] Update architecture diagrams
   - [ ] Create ADR for significant decisions

2. **During Implementation**:
   - [ ] Update component descriptions
   - [ ] Modify data flow diagrams if needed

3. **After Implementation**:
   - [ ] Verify diagrams match implementation
   - [ ] Update deployment documentation if needed

### Adding New Feature
1. **Planning Phase**:
   - [ ] Create feature documentation outline
   - [ ] Document user stories and acceptance criteria

2. **Implementation Phase**:
   - [ ] Update feature documentation with each task
   - [ ] Add API documentation for new endpoints
   - [ ] Update relevant architecture docs

3. **Completion Phase**:
   - [ ] Review and finalize feature documentation
   - [ ] Update main README if setup changes
   - [ ] Create user-facing documentation if needed

## Documentation Tools and Automation

### Recommended Tools
- **Diagrams**: Mermaid for architecture and flow diagrams
- **API Docs**: OpenAPI/Swagger for API documentation
- **Screenshots**: Automated screenshot tools for UI documentation
- **Validation**: Link checkers and documentation linters

### Automation Opportunities
- Generate API docs from code annotations
- Validate documentation in CI/CD pipeline
- Auto-update version numbers and dates
- Check for broken links regularly

## Instructions for Copilot

1. **Document as you go**: Don't defer documentation updates
2. **Be specific**: Include exact steps, parameters, and examples
3. **Keep it current**: Remove outdated information promptly
4. **Think about users**: Write for people who don't know the code
5. **Use examples**: Show don't just tell
6. **Maintain consistency**: Follow existing patterns and formats
7. **Version important changes**: Track significant modifications

### Documentation Update Checklist for Each Task
- [ ] Identified documentation impact before coding
- [ ] Updated relevant documentation during implementation
- [ ] Verified documentation accuracy after implementation
- [ ] Checked that examples and code snippets work
- [ ] Ensured documentation follows project conventions
- [ ] Committed documentation updates with code changes

Remember: Good documentation is an investment in the future maintainability and success of the project. It reduces onboarding time, prevents mistakes, and enables better collaboration.
