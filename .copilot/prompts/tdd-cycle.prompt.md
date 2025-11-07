# Test-Driven Development (TDD) Cycle Prompt

## Objective
Implement all code changes using strict TDD methodology: Red-Green-Refactor, one test at a time, ensuring comprehensive test coverage and high code quality.

## TDD Fundamentals

### The Three Laws of TDD
1. **No Production Code**: Don't write any production code until you have a failing unit test
2. **Minimal Test Code**: Don't write more of a unit test than is sufficient to fail
3. **Minimal Production Code**: Don't write more production code than is sufficient to pass the currently failing test

### The Red-Green-Refactor Cycle
Each iteration MUST follow this complete cycle:

#### 🔴 RED Phase: Write a Failing Test
1. **Identify next smallest piece of functionality**
2. **Write a test that describes this functionality**
3. **Run the test and confirm it fails**
4. **Ensure failure is for the right reason** (not syntax errors)

#### 🟢 GREEN Phase: Make the Test Pass
1. **Write the minimal code to make the test pass**
2. **Don't worry about code quality yet**
3. **Use hardcoding if needed** (will refactor later)
4. **Run test and confirm it passes**
5. **Run ALL tests to ensure no regression**

#### 🔧 REFACTOR Phase: Improve the Code
1. **Improve code structure and quality**
2. **Remove duplication**
3. **Improve naming and readability**
4. **Optimize performance if needed**
5. **Keep ALL tests passing throughout**

## Implementation Process

### Before Starting TDD
- [ ] Understand the specific functionality to implement
- [ ] Identify the smallest testable unit of behavior
- [ ] Set up test environment and dependencies
- [ ] Ensure existing tests are all passing

### TDD Cycle Implementation

#### Step 1: Plan the Next Test
**Ask yourself:**
- What's the next smallest behavior I need to implement?
- What would a test for this behavior look like?
- What should the test expect as input and output?
- What edge cases should I consider?

#### Step 2: Write the Failing Test (RED)
**Test Structure Pattern (Arrange-Act-Assert)**:
```
// Arrange: Set up test data and environment
[Create test inputs and expected outputs]

// Act: Call the function/method being tested
[Execute the functionality being tested]

// Assert: Verify expected behavior
[Check that actual results match expectations]
```

**Verification Steps:**
- [ ] Run test and confirm it fails
- [ ] Verify failure message is meaningful
- [ ] Ensure failure is due to missing functionality, not syntax errors

#### Step 3: Write Minimal Production Code (GREEN)
**Implementation Approach**:
- Write the simplest possible code to make the test pass
- Use hardcoded values if necessary (will be generalized in refactor)
- Don't implement edge cases or future features yet
- Focus solely on making THIS specific test pass

**Verification Steps:**
- [ ] Write only enough code to make THIS test pass
- [ ] Avoid over-engineering or implementing future features
- [ ] Run the failing test and confirm it now passes
- [ ] Run ALL tests to ensure no regression

#### Step 4: Refactor (REFACTOR)
**Code Improvements:**
- [ ] Remove code duplication
- [ ] Improve variable and function names
- [ ] Extract functions if methods are getting long
- [ ] Optimize algorithms if performance is critical
- [ ] Update documentation and comments

**Safety Checks:**
- [ ] Run ALL tests after each refactoring change
- [ ] Ensure all tests still pass
- [ ] Revert changes if any test breaks

### Test Types and Strategies

#### Unit Tests
**Focus on:**
- Single functions or methods
- Class behavior in isolation
- Input validation and edge cases
- Error conditions and exception handling

**Test Scope**: Isolated components with no external dependencies

#### Integration Tests
**Focus on:**
- Component interactions
- Database operations
- API endpoints
- External service integration

**Test Scope**: Multiple components working together

#### Test Organization
**Structure tests by:**
- Feature or module
- Use descriptive test names that describe expected behavior
- Group related tests logically
- Use appropriate setup and teardown for test isolation

### Common TDD Patterns

#### Test Data Builders
**Purpose**: Create complex test objects with fluent interface
- Build test objects incrementally
- Use builder pattern for complex data structures
- Provide sensible defaults for required fields
- Allow method chaining for readability

#### Arrange-Act-Assert (AAA) Pattern
**Structure**: Organize tests into three clear sections
- **Arrange**: Set up test data, dependencies, and conditions
- **Act**: Execute the specific functionality being tested
- **Assert**: Verify that the expected outcome occurred

**Benefits**: Makes test intent clear and improves readability

## Quality Guidelines

### Test Quality Criteria
- [ ] **Fast**: Tests run quickly (< 1 second per test ideal)
- [ ] **Independent**: Tests don't depend on each other
- [ ] **Repeatable**: Same result every time
- [ ] **Self-Validating**: Clear pass/fail result
- [ ] **Timely**: Written just before production code

### Code Coverage Goals
- [ ] **Statements**: Aim for 90%+ coverage
- [ ] **Branches**: Cover all conditional paths
- [ ] **Functions**: Test all public methods
- [ ] **Lines**: Ensure critical logic is tested

### Test Naming Conventions
**Good test names describe behavior**:
- "should return user data when valid ID provided"
- "should throw error when user ID does not exist"
- "should calculate discount correctly for premium users"

**Bad test names are generic**:
- "test user function"
- "check validation"  
- "test case 1"

**Format**: Use "should [expected behavior] when [conditions]" pattern

## Troubleshooting TDD

### When Tests Are Hard to Write
- **Problem**: Complex setup required
- **Solution**: Refactor production code to be more testable

### When Tests Pass Without Implementation
- **Problem**: Test is not specific enough
- **Solution**: Make test more precise about expected behavior

### When Refactoring Breaks Tests
- **Problem**: Test is too coupled to implementation
- **Solution**: Focus tests on behavior, not implementation details

### When Tests Are Slow
- **Problem**: Heavy dependencies or I/O operations
- **Solution**: Use mocks, stubs, or test doubles

## Instructions for Copilot

1. **One test at a time**: Never write multiple tests before implementing
2. **Complete the cycle**: Always do Red-Green-Refactor completely
3. **Start simple**: Begin with the simplest possible case
4. **Build incrementally**: Add complexity one test at a time
5. **Refactor regularly**: Don't accumulate technical debt
6. **Keep tests fast**: Mock external dependencies
7. **Focus on behavior**: Test what the code should do, not how it does it
8. **Follow standards**: Refer to `docs/coding-standards/` for technology-specific testing frameworks, syntax, and examples

### TDD Checklist for Each Function/Feature
- [ ] Started with simplest possible test case
- [ ] Followed Red-Green-Refactor for each test
- [ ] Covered happy path scenarios
- [ ] Covered edge cases and error conditions
- [ ] Tests are fast and independent
- [ ] Production code is clean and well-structured
- [ ] All tests pass consistently

Remember: TDD is a discipline that requires practice. The cycle becomes natural with repetition, and the resulting code is more reliable, maintainable, and well-designed.
