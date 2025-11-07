# Testing Standards

## Overview

This document defines comprehensive testing standards for the AI Presentations project, with emphasis on **non-brittle tests**, **high coverage**, and **TDD practices**. Our goal is to write tests that provide confidence without breaking on every implementation change.

## Core Testing Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Avoid Brittle Tests**: Tests should not break when implementation details change
3. **DRY Test Code**: Extract common patterns into reusable test utilities
4. **Fast Feedback**: Tests should run quickly and provide clear error messages
5. **TDD Red-Green-Refactor**: Write failing test first, make it pass, then refactor

## Testing Pyramid

```
        ╱╲
       ╱  ╲ E2E Tests (10%)
      ╱────╲ Integration Tests (30%)
     ╱──────╲ Unit Tests (60%)
```

**Unit Tests (60%)**:
- Individual functions, utilities, classes
- Fast, isolated, no external dependencies
- Use mocks/stubs for dependencies

**Integration Tests (30%)**:
- Component rendering with real dependencies
- API routes with in-memory database
- Agent tool execution with mocked LLM

**E2E Tests (10%)**:
- Full user flows (session creation → message → presentation)
- Browser automation with Playwright
- Slow but high confidence

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

Follow this cycle for ALL new code:

#### 1. RED - Write Failing Test

```typescript
// formatDate.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date('2024-03-15T10:30:00Z')
    expect(formatDate(date)).toBe('2024-03-15')
  })
})

// Run test → FAILS (function doesn't exist yet)
```

#### 2. GREEN - Write Minimal Code to Pass

```typescript
// formatDate.ts
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Run test → PASSES
```

#### 3. REFACTOR - Improve Code Quality

```typescript
// formatDate.ts (refactored)
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Run test → STILL PASSES
// Implementation changed but test didn't break (non-brittle!)
```

### TDD Best Practices

- **One test at a time**: Write one failing test, make it pass, repeat
- **Start simple**: Begin with the simplest case, add complexity incrementally
- **Baby steps**: Small iterations are faster and less error-prone
- **Commit after green**: Commit when tests pass, not when they fail
- **Refactor confidently**: Good tests enable fearless refactoring

## Unit Testing

### Testing Pure Functions

**Good** - Tests behavior:
```typescript
// sum.test.ts
import { describe, it, expect } from 'vitest'
import { sum } from './sum'

describe('sum', () => {
  it('returns sum of two numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })

  it('handles negative numbers', () => {
    expect(sum(-2, 3)).toBe(1)
  })

  it('handles zero', () => {
    expect(sum(0, 5)).toBe(5)
  })
})
```

**Bad** - Tests implementation:
```typescript
// sum.test.ts (brittle)
it('uses addition operator', () => {
  const spy = vi.spyOn(Math, 'floor') // Testing HOW, not WHAT
  sum(2, 3)
  expect(spy).not.toHaveBeenCalled()
})
```

### Testing Classes

```typescript
// counter.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { Counter } from './counter'

describe('Counter', () => {
  let counter: Counter

  beforeEach(() => {
    counter = new Counter()
  })

  it('starts at zero', () => {
    expect(counter.value).toBe(0)
  })

  it('increments by one', () => {
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('increments multiple times', () => {
    counter.increment()
    counter.increment()
    counter.increment()
    expect(counter.value).toBe(3)
  })

  it('resets to zero', () => {
    counter.increment()
    counter.increment()
    counter.reset()
    expect(counter.value).toBe(0)
  })
})
```

### Mocking Dependencies

**Good** - Mock external dependencies:
```typescript
// api.test.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchUserData } from './api'

// Mock fetch globally
global.fetch = vi.fn()

describe('fetchUserData', () => {
  it('fetches user data from API', async () => {
    const mockData = { id: '1', name: 'Alice' }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response)

    const result = await fetchUserData('1')

    expect(fetch).toHaveBeenCalledWith('/api/users/1')
    expect(result).toEqual(mockData)
  })

  it('throws error on failed request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    } as Response)

    await expect(fetchUserData('1')).rejects.toThrow('Not Found')
  })
})
```

**Bad** - Testing mocks instead of behavior:
```typescript
it('calls fetch', async () => {
  await fetchUserData('1')
  expect(fetch).toHaveBeenCalled() // Too generic, not useful
})
```

## Component Testing

### Testing Svelte Components

Use `@testing-library/svelte` for component tests:

**Good** - Tests user-visible behavior:
```typescript
// TextComponent.test.ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import TextComponent from './TextComponent.svelte'

describe('TextComponent', () => {
  it('renders text content', () => {
    render(TextComponent, {
      props: {
        id: 'text-1',
        content: 'Hello World',
        size: 'medium'
      }
    })

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies size class', () => {
    render(TextComponent, {
      props: {
        id: 'text-1',
        content: 'Test',
        size: 'large'
      }
    })

    const element = screen.getByText('Test')
    expect(element).toHaveClass('text-large')
  })

  it('renders markdown content', () => {
    render(TextComponent, {
      props: {
        id: 'text-1',
        content: '**Bold** text'
      }
    })

    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Bold').tagName).toBe('STRONG')
  })
})
```

**Bad** - Tests implementation details:
```typescript
it('has correct internal state', () => {
  const { component } = render(TextComponent, { props: { ... } })
  expect(component.$$).toBeDefined() // Testing Svelte internals - BRITTLE!
})
```

### Testing User Interactions

```typescript
// Counter.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import Counter from './Counter.svelte'

describe('Counter', () => {
  it('increments on button click', async () => {
    const user = userEvent.setup()

    render(Counter, {
      props: {
        initialCount: 0,
        onIncrement: vi.fn()
      }
    })

    const button = screen.getByRole('button', { name: /increment/i })

    await user.click(button)

    expect(screen.getByText(/count: 1/i)).toBeInTheDocument()
  })

  it('calls onIncrement callback', async () => {
    const user = userEvent.setup()
    const onIncrement = vi.fn()

    render(Counter, {
      props: {
        initialCount: 0,
        onIncrement
      }
    })

    await user.click(screen.getByRole('button'))

    expect(onIncrement).toHaveBeenCalledTimes(1)
  })
})
```

### Avoiding Brittle Component Tests

**Bad** - Tight coupling to DOM structure:
```typescript
it('renders correctly', () => {
  const { container } = render(Component)
  expect(container.querySelector('.outer > .inner > p')).toBeTruthy()
})
```

**Good** - Tests user-visible behavior:
```typescript
it('displays welcome message', () => {
  render(Component)
  expect(screen.getByText(/welcome/i)).toBeInTheDocument()
})
```

**Bad** - Snapshot tests for everything:
```typescript
it('matches snapshot', () => {
  const { container } = render(Component)
  expect(container).toMatchSnapshot() // Breaks on any HTML change
})
```

**Good** - Snapshots for specific data structures:
```typescript
it('generates correct component config', () => {
  const config = createComponentConfig({ type: 'text' })
  expect(config).toMatchInlineSnapshot(`
    {
      "id": "text-1",
      "type": "text",
      "transition": "fade"
    }
  `)
})
```

## Integration Testing

### Testing API Routes

```typescript
// session.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST, GET, DELETE } from './+server'

describe('Session API', () => {
  let sessionId: string

  beforeEach(async () => {
    // Create test session
    const response = await POST({ request: new Request('http://localhost') })
    const data = await response.json()
    sessionId = data.id
  })

  it('creates new session', async () => {
    const response = await POST({ request: new Request('http://localhost') })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('createdAt')
  })

  it('retrieves existing session', async () => {
    const response = await GET({ params: { sessionId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe(sessionId)
  })

  it('returns 404 for non-existent session', async () => {
    const response = await GET({ params: { sessionId: 'invalid' } })

    expect(response.status).toBe(404)
  })

  it('deletes session', async () => {
    const deleteResponse = await DELETE({ params: { sessionId } })
    expect(deleteResponse.status).toBe(204)

    const getResponse = await GET({ params: { sessionId } })
    expect(getResponse.status).toBe(404)
  })
})
```

### Testing Agent Tools

```typescript
// tools.test.ts
import { describe, it, expect } from 'vitest'
import { addComponentTool, updateComponentTool } from './tools'
import { AgentState } from './state'

describe('Agent Tools', () => {
  let state: AgentState

  beforeEach(() => {
    state = {
      messages: [],
      currentComponents: {}
    }
  })

  it('adds component to state', async () => {
    const result = await addComponentTool.invoke({
      id: 'text-1',
      type: 'text',
      content: 'Hello'
    }, { configurable: { state } })

    expect(result.action).toBe('add')
    expect(result.componentId).toBe('text-1')
    expect(state.currentComponents['text-1']).toEqual({
      type: 'text',
      content: 'Hello'
    })
  })

  it('updates existing component', async () => {
    state.currentComponents['text-1'] = { type: 'text', content: 'Old' }

    const result = await updateComponentTool.invoke({
      id: 'text-1',
      content: 'New'
    }, { configurable: { state } })

    expect(result.action).toBe('update')
    expect(state.currentComponents['text-1'].content).toBe('New')
  })

  it('throws error when updating non-existent component', async () => {
    await expect(
      updateComponentTool.invoke({ id: 'missing', content: 'Test' }, { configurable: { state } })
    ).rejects.toThrow(/not found/)
  })
})
```

## E2E Testing with Playwright

### Writing E2E Tests

```typescript
// session.e2e.test.ts
import { test, expect } from '@playwright/test'

test.describe('Session Flow', () => {
  test('creates session and displays presentation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Create new session
    await page.click('text=Create New Session')

    // Wait for navigation to session page
    await expect(page).toHaveURL(/\/session\/[\w-]+/)

    // Verify presentation container is visible
    await expect(page.locator('[data-testid="presentation"]')).toBeVisible()
  })

  test('sends message and receives response', async ({ page }) => {
    // Create session
    await page.goto('/')
    await page.click('text=Create New Session')

    // Pause presentation
    await page.keyboard.press('Space')

    // Type message
    await page.fill('[data-testid="message-input"]', 'Tell me about TypeScript')
    await page.click('[data-testid="send-button"]')

    // Wait for response
    await expect(page.locator('text=/TypeScript/i')).toBeVisible({ timeout: 10000 })

    // Verify narration played
    await expect(page.locator('[data-testid="speech-indicator"]')).toBeVisible()
  })

  test('handles errors gracefully', async ({ page }) => {
    await page.goto('/session/invalid-id')

    await expect(page.locator('text=/not found/i')).toBeVisible()
  })
})
```

### E2E Best Practices

- **Use data-testid**: Add `data-testid` attributes for reliable selectors
- **Wait for content**: Use `expect(...).toBeVisible()` instead of fixed timeouts
- **Test happy path**: Focus on critical user flows
- **Mock external APIs**: Use Playwright's route mocking for API calls
- **Parallel execution**: Run independent tests in parallel

## Test Organization

### File Structure

```
src/
├── lib/
│   ├── utils/
│   │   ├── formatDate.ts
│   │   └── formatDate.test.ts
│   ├── components/
│   │   ├── TextComponent.svelte
│   │   └── TextComponent.test.ts
│   ├── agent/
│   │   ├── tools.ts
│   │   └── tools.test.ts
│   └── stores/
│       ├── presentation.svelte.ts
│       └── presentation.test.ts
└── routes/
    └── api/
        └── sessions/
            ├── +server.ts
            └── +server.test.ts

e2e/
├── session.spec.ts
├── presentation.spec.ts
└── navigation.spec.ts
```

### Test Naming Conventions

**File names**:
- Unit/Integration: `*.test.ts`
- E2E: `*.spec.ts` or `*.e2e.test.ts`

**Test descriptions**:
- Describe block: Component/function name
- Test block: User-readable behavior

```typescript
describe('UserProfile', () => {
  it('displays user name and email', () => { ... })
  it('shows loading state while fetching', () => { ... })
  it('displays error message on failure', () => { ... })
})
```

## Test Utilities and Helpers

### Create Reusable Test Utilities

**Good** - Extract common setup:
```typescript
// test-utils/component.ts
import { render } from '@testing-library/svelte'
import type { ComponentProps } from 'svelte'

export function renderComponent<T>(
  Component: T,
  props?: Partial<ComponentProps<T>>
) {
  return render(Component as any, { props })
}

// test-utils/session.ts
export function createMockSession(overrides = {}) {
  return {
    id: 'test-session',
    createdAt: new Date(),
    state: { messages: [], currentComponents: {} },
    timeline: [],
    ...overrides
  }
}
```

```typescript
// Usage in tests
import { renderComponent } from '../test-utils/component'
import { createMockSession } from '../test-utils/session'

it('renders session view', () => {
  const session = createMockSession({ id: 'custom-id' })
  renderComponent(SessionView, { session })
  expect(screen.getByText('custom-id')).toBeInTheDocument()
})
```

### Custom Matchers

```typescript
// test-utils/matchers.ts
import { expect } from 'vitest'

expect.extend({
  toBeValidSession(received) {
    const pass =
      typeof received.id === 'string' &&
      received.createdAt instanceof Date &&
      typeof received.state === 'object'

    return {
      pass,
      message: () => `expected ${received} to be a valid session`
    }
  }
})

// Usage
expect(session).toBeValidSession()
```

## Coverage Requirements

### Minimum Coverage Targets

```json
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
}
```

**Coverage by Type**:
- **Utilities**: 90%+ (pure functions, easy to test)
- **Components**: 80%+ (visual components, interaction logic)
- **API Routes**: 85%+ (business logic, error handling)
- **E2E**: Critical user flows only (quality > quantity)

### Coverage Does NOT Equal Quality

**Bad** - High coverage, low value:
```typescript
it('runs without errors', () => {
  const result = myFunction()
  expect(result).toBeDefined() // Meaningless assertion
})
```

**Good** - Tests actual behavior:
```typescript
it('formats date as ISO string', () => {
  const result = formatDate(new Date('2024-03-15'))
  expect(result).toBe('2024-03-15')
})
```

## Debugging Tests

### Use `test.only` for Focused Testing

```typescript
test.only('specific test to debug', () => {
  // Only this test runs
})
```

### Use `--reporter=verbose` for Details

```bash
pnpm test --reporter=verbose
```

### Add Debug Logs

```typescript
import { screen, debug } from '@testing-library/svelte'

it('renders component', () => {
  render(Component)
  debug() // Prints DOM tree
  console.log(screen.getByRole('button').textContent)
})
```

## CI/CD Integration

### Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  },
  "lint-staged": {
    "*.{ts,svelte}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Anti-Patterns to Avoid

### ❌ Testing Implementation Details

```typescript
// BAD
it('uses map to transform array', () => {
  const spy = vi.spyOn(Array.prototype, 'map')
  transform([1, 2, 3])
  expect(spy).toHaveBeenCalled()
})

// GOOD
it('transforms array values', () => {
  expect(transform([1, 2, 3])).toEqual([2, 4, 6])
})
```

### ❌ Over-Mocking

```typescript
// BAD
it('adds two numbers', () => {
  vi.spyOn(Math, 'floor')
  vi.spyOn(Math, 'ceil')
  vi.spyOn(Number.prototype, 'toString')
  // Mocking everything defeats the purpose
})

// GOOD
it('adds two numbers', () => {
  expect(sum(2, 3)).toBe(5)
})
```

### ❌ Test Interdependence

```typescript
// BAD
let sharedState = 0

it('increments state', () => {
  sharedState++
  expect(sharedState).toBe(1)
})

it('increments state again', () => {
  sharedState++ // Depends on previous test!
  expect(sharedState).toBe(2)
})

// GOOD
it('increments state', () => {
  let state = 0
  state++
  expect(state).toBe(1)
})

it('increments state again', () => {
  let state = 0
  state++
  expect(state).toBe(1)
})
```

### ❌ Testing Trivial Code

```typescript
// BAD - Waste of time
it('returns true', () => {
  expect(true).toBe(true)
})

it('getter returns value', () => {
  const obj = { name: 'test' }
  expect(obj.name).toBe('test')
})
```

## Checklist

Before committing code, ensure:

- [ ] Followed TDD (red-green-refactor)
- [ ] Tests focus on behavior, not implementation
- [ ] No brittle tests (tight DOM coupling, snapshots of everything)
- [ ] DRY test code (extracted common patterns)
- [ ] Tests have clear, descriptive names
- [ ] Coverage meets minimum thresholds (80%+)
- [ ] E2E tests cover critical user flows
- [ ] All tests pass locally before pushing
- [ ] No `test.only` or `test.skip` in committed code

## Related Documentation

- [TDD Cycle Prompt](../../.copilot/prompts/tdd-cycle.prompt.md)
- [TypeScript Standards](./typescript-standards.md)
- [Svelte Standards](./svelte-standards.md)
- [Development Cycle](../../.copilot/prompts/development-cycle.prompt.md)
