# TypeScript Coding Standards

## Overview

This document defines TypeScript coding standards for the AI Presentations project. Following these standards ensures type safety, maintainability, and consistency across the codebase.

## Core Principles

1. **Type Safety First**: Avoid `any`, use strict typing
2. **DRY (Don't Repeat Yourself)**: Extract common patterns into reusable utilities
3. **Explicit Over Implicit**: Prefer explicit type annotations for public APIs
4. **Immutability**: Use `const` and readonly where possible
5. **Composability**: Build small, focused functions and types

## TypeScript Configuration

### tsconfig.json Requirements

```json
{
  "compilerOptions": {
    "strict": true,                    // Enable all strict type checking
    "noUncheckedIndexedAccess": true,  // Array/object access returns T | undefined
    "noImplicitOverride": true,        // Require 'override' keyword
    "noUnusedLocals": true,            // Error on unused local variables
    "noUnusedParameters": true,        // Error on unused function parameters
    "exactOptionalPropertyTypes": true, // Distinguish undefined from missing
    "noFallthroughCasesInSwitch": true // Require break in switch cases
  }
}
```

### Current Configuration
Our project uses these settings in [tsconfig.json](../../tsconfig.json).

## Type Definitions

### Prefer Interfaces for Object Shapes

**Good**:
```typescript
interface User {
  id: string
  name: string
  email: string
}
```

**Bad**:
```typescript
type User = {
  id: string
  name: string
  email: string
}
```

**Rationale**: Interfaces provide better error messages and are more extensible.

**Exception**: Use `type` for unions, intersections, or mapped types:
```typescript
type Status = 'pending' | 'in_progress' | 'completed'
type Partial<T> = { [P in keyof T]?: T[P] }
```

### Avoid `any` - Use Proper Types

**Bad**:
```typescript
function processData(data: any): any {
  return data.value
}
```

**Good**:
```typescript
interface DataInput {
  value: string
}

function processData(data: DataInput): string {
  return data.value
}
```

**When Truly Unknown**: Use `unknown` instead of `any`:
```typescript
function parseJson(json: string): unknown {
  return JSON.parse(json)
}

// Force type checking before use
const data = parseJson('{"name": "test"}')
if (typeof data === 'object' && data !== null && 'name' in data) {
  console.log(data.name)
}
```

### Use Type Guards for Runtime Checks

```typescript
interface TextComponent {
  type: 'text'
  content: string
}

interface ImageComponent {
  type: 'image'
  src: string
}

type Component = TextComponent | ImageComponent

// Type guard
function isTextComponent(component: Component): component is TextComponent {
  return component.type === 'text'
}

// Usage
function renderComponent(component: Component) {
  if (isTextComponent(component)) {
    // TypeScript knows component is TextComponent here
    console.log(component.content)
  } else {
    // TypeScript knows component is ImageComponent here
    console.log(component.src)
  }
}
```

### Discriminated Unions for Variants

**Good**:
```typescript
interface AddAction {
  type: 'add'
  componentId: string
  component: Component
}

interface UpdateAction {
  type: 'update'
  componentId: string
  updates: Partial<Component>
}

interface RemoveAction {
  type: 'remove'
  componentId: string
}

type TimelineAction = AddAction | UpdateAction | RemoveAction

// TypeScript narrows type based on discriminant
function handleAction(action: TimelineAction) {
  switch (action.type) {
    case 'add':
      // action is AddAction here
      registry.set(action.componentId, action.component)
      break
    case 'update':
      // action is UpdateAction here
      const existing = registry.get(action.componentId)
      if (existing) {
        registry.set(action.componentId, { ...existing, ...action.updates })
      }
      break
    case 'remove':
      // action is RemoveAction here
      registry.delete(action.componentId)
      break
  }
}
```

## Function Signatures

### Explicit Return Types for Public APIs

**Good**:
```typescript
export function createSession(id: string): Session {
  return {
    id,
    createdAt: new Date(),
    state: { messages: [], currentComponents: {} },
    timeline: []
  }
}
```

**Acceptable for Internal Functions**:
```typescript
function formatDate(date: Date) {
  return date.toISOString()
}
```

### Use Optional Parameters and Default Values

**Good**:
```typescript
interface CreateComponentOptions {
  transition?: 'fade' | 'slide' | 'instant'
  duration?: number
}

function createComponent(
  id: string,
  type: string,
  options: CreateComponentOptions = {}
): Component {
  const { transition = 'fade', duration = 300 } = options
  // ...
}
```

**Bad**:
```typescript
function createComponent(
  id: string,
  type: string,
  transition: string | undefined,
  duration: number | undefined
): Component {
  // ...
}
```

### Prefer Named Parameters for Complex Functions

**Good**:
```typescript
interface UpdateComponentParams {
  componentId: string
  updates: Partial<Component>
  transition?: Transition
  onComplete?: () => void
}

function updateComponent(params: UpdateComponentParams): void {
  const { componentId, updates, transition = 'fade', onComplete } = params
  // ...
}

// Usage
updateComponent({
  componentId: 'text-1',
  updates: { content: 'New text' },
  onComplete: () => console.log('Done')
})
```

**Bad**:
```typescript
function updateComponent(
  componentId: string,
  updates: Partial<Component>,
  transition?: Transition,
  onComplete?: () => void
): void {
  // ...
}

// Usage - unclear what each argument means
updateComponent('text-1', { content: 'New text' }, undefined, () => console.log('Done'))
```

## Nullability and Error Handling

### Explicit Nullability

**Good**:
```typescript
function findComponent(id: string): Component | undefined {
  return componentRegistry.get(id)
}

// Caller must handle undefined
const component = findComponent('text-1')
if (component) {
  renderComponent(component)
}
```

**Bad**:
```typescript
function findComponent(id: string): Component {
  return componentRegistry.get(id)! // Non-null assertion - dangerous!
}
```

### Use Result Types for Expected Errors

```typescript
interface Success<T> {
  success: true
  data: T
}

interface Failure {
  success: false
  error: string
}

type Result<T> = Success<T> | Failure

function parseComponent(json: string): Result<Component> {
  try {
    const data = JSON.parse(json)
    // Validate data...
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Usage forces error handling
const result = parseComponent(jsonString)
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

## Generics

### Use Generics for Reusable Code

**Good**:
```typescript
function mapValues<T, U>(
  obj: Record<string, T>,
  fn: (value: T) => U
): Record<string, U> {
  const result: Record<string, U> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = fn(value)
  }
  return result
}

// Usage with type inference
const components = { 'text-1': { type: 'text' }, 'img-1': { type: 'image' } }
const types = mapValues(components, (c) => c.type) // Record<string, string>
```

### Constrain Generics When Needed

```typescript
interface Identifiable {
  id: string
}

function findById<T extends Identifiable>(
  items: T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id)
}
```

## Async/Await

### Always Use Async/Await Over Promises

**Good**:
```typescript
async function fetchSession(id: string): Promise<Session> {
  const response = await fetch(`/api/sessions/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.statusText}`)
  }
  return response.json()
}
```

**Bad**:
```typescript
function fetchSession(id: string): Promise<Session> {
  return fetch(`/api/sessions/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`)
      }
      return response.json()
    })
}
```

### Handle Errors Explicitly

```typescript
async function processMessage(sessionId: string, message: string): Promise<Result<void>> {
  try {
    const session = await fetchSession(sessionId)
    await updateSession(session, message)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

## Immutability

### Use `const` by Default

**Good**:
```typescript
const components = new Map<string, Component>()
const timeline = []
```

**Bad**:
```typescript
let components = new Map<string, Component>()
let timeline = []
```

### Use `readonly` for Immutable Data

```typescript
interface Session {
  readonly id: string
  readonly createdAt: Date
  state: AgentState // Mutable
}

type ReadonlySession = Readonly<Session>
```

### Use Immutable Update Patterns

**Good**:
```typescript
// Array
const newItems = [...items, newItem]

// Object
const updatedComponent = { ...component, content: 'Updated' }

// Nested object
const updatedSession = {
  ...session,
  state: {
    ...session.state,
    messages: [...session.state.messages, newMessage]
  }
}
```

**Bad**:
```typescript
items.push(newItem) // Mutates original array
component.content = 'Updated' // Mutates original object
```

## Utility Types

### Leverage Built-in Utility Types

```typescript
// Partial - make all properties optional
type PartialComponent = Partial<Component>

// Pick - select specific properties
type ComponentIdentity = Pick<Component, 'id' | 'type'>

// Omit - exclude specific properties
type ComponentWithoutId = Omit<Component, 'id'>

// Required - make all properties required
type RequiredOptions = Required<CreateComponentOptions>

// Record - object with specific key/value types
type ComponentRegistry = Record<string, Component>

// ReturnType - extract function return type
type SessionResult = ReturnType<typeof createSession>
```

## Module Organization

### File Structure

```
src/lib/
├── types/
│   ├── components.ts      # Component type definitions
│   ├── timeline.ts        # Timeline event types
│   └── session.ts         # Session types
├── utils/
│   ├── validation.ts      # Validation utilities
│   └── formatting.ts      # Formatting utilities
└── stores/
    └── presentation.svelte.ts
```

### Export Organization

**Good**:
```typescript
// types/components.ts
export interface TextComponent { /* ... */ }
export interface ImageComponent { /* ... */ }
export type Component = TextComponent | ImageComponent

// Single barrel export
export * from './types/components'
export * from './types/timeline'
```

### Avoid Circular Dependencies

**Bad**:
```typescript
// a.ts
import { B } from './b'
export class A { b: B }

// b.ts
import { A } from './a'
export class B { a: A }
```

**Good** - Extract common types:
```typescript
// types.ts
export interface AData { /* ... */ }
export interface BData { /* ... */ }

// a.ts
import type { BData } from './types'
export class A { b: BData }

// b.ts
import type { AData } from './types'
export class B { a: AData }
```

## Zod Integration

### Use Zod for Runtime Validation

```typescript
import { z } from 'zod'

// Define Zod schema
export const ComponentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['text', 'image', 'grid']),
  content: z.string().optional(),
  src: z.string().url().optional()
})

// Infer TypeScript type from schema
export type Component = z.infer<typeof ComponentSchema>

// Validate at runtime
function validateComponent(data: unknown): Component {
  return ComponentSchema.parse(data) // Throws if invalid
}

// Safe validation
function safeValidateComponent(data: unknown): Result<Component> {
  const result = ComponentSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error.message }
  }
}
```

## Comments and Documentation

### Use JSDoc for Public APIs

```typescript
/**
 * Creates a new presentation session with the given ID.
 *
 * @param id - Unique identifier for the session
 * @param options - Optional configuration
 * @returns A new session instance
 * @throws {Error} If session ID already exists
 *
 * @example
 * ```typescript
 * const session = createSession('session-123')
 * console.log(session.id) // 'session-123'
 * ```
 */
export function createSession(
  id: string,
  options?: SessionOptions
): Session {
  // ...
}
```

### Avoid Obvious Comments

**Bad**:
```typescript
// Increment counter
counter++

// Return the user name
return user.name
```

**Good** - Explain "why", not "what":
```typescript
// Use exponential backoff to avoid overwhelming the API
await delay(2 ** retryCount * 1000)

// Clone to avoid mutating original state (required for time-travel debugging)
const newState = structuredClone(state)
```

## Common Patterns

### Factory Functions

```typescript
interface ComponentFactory {
  create(type: string, props: ComponentProps): Component
}

export function createComponentFactory(): ComponentFactory {
  return {
    create(type, props) {
      const id = crypto.randomUUID()
      return { id, type, ...props }
    }
  }
}
```

### Builder Pattern

```typescript
class SessionBuilder {
  private session: Partial<Session> = {}

  withId(id: string): this {
    this.session.id = id
    return this
  }

  withState(state: AgentState): this {
    this.session.state = state
    return this
  }

  build(): Session {
    if (!this.session.id || !this.session.state) {
      throw new Error('Missing required session properties')
    }
    return {
      ...this.session,
      createdAt: new Date(),
      timeline: []
    } as Session
  }
}

// Usage
const session = new SessionBuilder()
  .withId('session-123')
  .withState({ messages: [], currentComponents: {} })
  .build()
```

## Performance Considerations

### Avoid Expensive Type Operations

**Bad** - Complex mapped types can slow down TypeScript compiler:
```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

**Good** - Use simpler types when possible:
```typescript
type PartialComponent = Partial<Component>
```

### Use Type Assertions Sparingly

**Bad**:
```typescript
const data = JSON.parse(json) as Component // Unsafe!
```

**Good**:
```typescript
const data = ComponentSchema.parse(JSON.parse(json)) // Validated at runtime
```

## Testing

### Type Tests with `expectTypeOf`

```typescript
import { expectTypeOf } from 'expect-type'

// Ensure return type is correct
expectTypeOf(createSession('id')).toMatchTypeOf<Session>()

// Ensure type guards work
declare const component: Component
if (isTextComponent(component)) {
  expectTypeOf(component).toMatchTypeOf<TextComponent>()
}
```

## Checklist

Before committing TypeScript code, ensure:

- [ ] No `any` types (use `unknown` if truly needed)
- [ ] Public API functions have explicit return types
- [ ] Complex functions use named parameters (interface)
- [ ] Nullability is handled explicitly (no non-null assertions)
- [ ] Immutable update patterns used (no mutations)
- [ ] Zod schemas for runtime validation of external data
- [ ] JSDoc comments for exported functions
- [ ] No circular dependencies
- [ ] Type guards for discriminated unions
- [ ] Error handling with Result types or try/catch

## Related Documentation

- [Svelte 5 Standards](./svelte-standards.md)
- [Testing Standards](./testing-standards.md)
- [System Architecture](../🏗️%20architecture/system-overview.md)
