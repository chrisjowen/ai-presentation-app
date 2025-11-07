# Svelte 5 Coding Standards

## Overview

This document defines Svelte 5 coding standards with emphasis on runes-based reactivity, component composition, and best practices for building maintainable UI components in the AI Presentations project.

## Core Principles

1. **Runes-First**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`) over legacy stores
2. **Fine-Grained Reactivity**: Optimize for minimal re-renders
3. **Component Composition**: Build small, focused, reusable components
4. **Props Immutability**: Never mutate props, use events or callbacks
5. **Type Safety**: Full TypeScript integration with component props

## Svelte 5 Runes

### `$state` - Reactive State

Use `$state` for mutable reactive values:

**Good**:
```svelte
<script lang="ts">
  let count = $state(0)
  let user = $state({ name: 'Alice', age: 30 })

  function increment() {
    count++ // Direct mutation, automatically tracked
  }

  function updateName() {
    user.name = 'Bob' // Deep reactivity works
  }
</script>

<button onclick={increment}>{count}</button>
<p>{user.name}</p>
```

**Bad** - Using legacy syntax:
```svelte
<script lang="ts">
  let count = 0 // Not reactive in Svelte 5

  $: reactiveCount = count // Old reactive declaration, avoid
</script>
```

### `$derived` - Computed Values

Use `$derived` for values computed from other reactive state:

**Good**:
```svelte
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
  let message = $derived(`Count is ${count}`)
</script>

<p>{doubled}</p>
<p>{message}</p>
```

**Good** - Complex derivations:
```svelte
<script lang="ts">
  interface Component {
    id: string
    type: string
    visible: boolean
  }

  let components = $state<Component[]>([])

  let visibleComponents = $derived(
    components.filter(c => c.visible)
  )

  let componentCount = $derived(visibleComponents.length)
</script>
```

**Bad** - Unnecessary `$derived`:
```svelte
<script lang="ts">
  let name = $state('Alice')
  let greeting = $derived(`Hello ${name}`) // Unnecessary, use template directly
</script>

<!-- Good - just use the reactive value in template -->
<p>Hello {name}</p>
```

### `$effect` - Side Effects

Use `$effect` for side effects that should run when dependencies change:

**Good**:
```svelte
<script lang="ts">
  let sessionId = $state<string>()
  let data = $state<SessionData>()

  $effect(() => {
    if (sessionId) {
      fetch(`/api/sessions/${sessionId}`)
        .then(r => r.json())
        .then(d => data = d)
    }
  })
</script>
```

**Good** - Cleanup with return function:
```svelte
<script lang="ts">
  let playing = $state(false)

  $effect(() => {
    if (playing) {
      const interval = setInterval(() => {
        console.log('tick')
      }, 1000)

      return () => clearInterval(interval) // Cleanup
    }
  })
</script>
```

**Bad** - Missing cleanup:
```svelte
<script lang="ts">
  let playing = $state(false)

  $effect(() => {
    if (playing) {
      setInterval(() => console.log('tick'), 1000) // Leaks memory!
    }
  })
</script>
```

**Best Practice** - Use `$effect.pre` for pre-render effects:
```svelte
<script lang="ts">
  let value = $state('')

  // Runs before DOM updates
  $effect.pre(() => {
    console.log('Value will be:', value)
  })
</script>
```

## Component Props and Binding

### Define Props with Type Safety

**Good**:
```svelte
<script lang="ts">
  interface Props {
    id: string
    title: string
    visible?: boolean
    onClose?: () => void
  }

  let { id, title, visible = true, onClose }: Props = $props()
</script>

<div class:hidden={!visible}>
  <h2>{title}</h2>
  {#if onClose}
    <button onclick={onClose}>Close</button>
  {/if}
</div>
```

**Bad** - No types:
```svelte
<script>
  let { id, title, visible, onClose } = $props()
</script>
```

### Prop Immutability

**Never mutate props directly**:

**Bad**:
```svelte
<script lang="ts">
  interface Props {
    count: number
  }

  let { count }: Props = $props()

  function increment() {
    count++ // ERROR: Cannot mutate props
  }
</script>
```

**Good** - Use events or callbacks:
```svelte
<script lang="ts">
  interface Props {
    count: number
    onIncrement: () => void
  }

  let { count, onIncrement }: Props = $props()
</script>

<button onclick={onIncrement}>{count}</button>
```

**Good** - Local state derived from props:
```svelte
<script lang="ts">
  interface Props {
    initialCount: number
  }

  let { initialCount }: Props = $props()
  let count = $state(initialCount) // Local mutable copy

  function increment() {
    count++
  }
</script>
```

### Bindable Props with `$bindable`

Use `$bindable` for two-way binding:

**Good**:
```svelte
<!-- Child.svelte -->
<script lang="ts">
  interface Props {
    value: string
  }

  let { value = $bindable('') }: Props = $props()
</script>

<input bind:value />

<!-- Parent.svelte -->
<script lang="ts">
  let text = $state('')
</script>

<Child bind:value={text} />
<p>Text: {text}</p>
```

**Use Sparingly**: Prefer one-way data flow with events when possible.

## Component Structure

### File Organization

```svelte
<!-- ComponentName.svelte -->
<script lang="ts">
  // 1. Imports
  import { someUtil } from '$lib/utils'
  import OtherComponent from './OtherComponent.svelte'

  // 2. Props interface
  interface Props {
    id: string
    title: string
  }

  // 3. Props destructuring
  let { id, title }: Props = $props()

  // 4. Local state
  let count = $state(0)
  let doubled = $derived(count * 2)

  // 5. Effects
  $effect(() => {
    console.log('Count changed:', count)
  })

  // 6. Functions
  function handleClick() {
    count++
  }
</script>

<!-- 7. Template -->
<div class="component">
  <h2>{title}</h2>
  <p>Count: {count}, Doubled: {doubled}</p>
  <button onclick={handleClick}>Increment</button>
</div>

<!-- 8. Styles -->
<style>
  .component {
    padding: 1rem;
  }
</style>
```

### Component Naming

- **PascalCase** for component files: `TextComponent.svelte`, `GridComponent.svelte`
- **kebab-case** for CSS classes: `.text-component`, `.grid-container`
- **camelCase** for props and functions: `onClose`, `handleSubmit`

## Reactivity Patterns

### Avoid Unnecessary Derivations

**Bad**:
```svelte
<script lang="ts">
  let firstName = $state('Alice')
  let lastName = $state('Smith')
  let fullName = $derived(`${firstName} ${lastName}`)
</script>

<p>{fullName}</p>
```

**Good** - Use template directly:
```svelte
<script lang="ts">
  let firstName = $state('Alice')
  let lastName = $state('Smith')
</script>

<p>{firstName} {lastName}</p>
```

**When to use `$derived`**:
- Complex computations used multiple times
- Values used in multiple `$effect` or other derivations
- Expensive operations that should be memoized

### Deep Reactivity with Objects and Arrays

**Good** - Direct mutation works:
```svelte
<script lang="ts">
  let items = $state([1, 2, 3])
  let user = $state({ name: 'Alice', age: 30 })

  function addItem() {
    items.push(4) // Reactive!
  }

  function updateAge() {
    user.age++ // Reactive!
  }
</script>
```

**Good** - Immutable updates (preferred for clarity):
```svelte
<script lang="ts">
  let items = $state([1, 2, 3])

  function addItem() {
    items = [...items, 4]
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index)
  }
</script>
```

### Reactive Class State

```svelte
<script lang="ts">
  class Counter {
    count = $state(0)
    doubled = $derived(this.count * 2)

    increment() {
      this.count++
    }
  }

  let counter = new Counter()
</script>

<button onclick={() => counter.increment()}>
  {counter.count} (doubled: {counter.doubled})
</button>
```

## Event Handling

### Use `onclick` (lowercase) in Svelte 5

**Good**:
```svelte
<button onclick={handleClick}>Click</button>
<button onclick={() => count++}>Increment</button>
```

**Bad** - Old Svelte 4 syntax:
```svelte
<button on:click={handleClick}>Click</button>
```

### Custom Events with Callbacks

**Good**:
```svelte
<!-- Child.svelte -->
<script lang="ts">
  interface Props {
    onSubmit: (value: string) => void
  }

  let { onSubmit }: Props = $props()
  let value = $state('')
</script>

<form onsubmit={(e) => {
  e.preventDefault()
  onSubmit(value)
}}>
  <input bind:value />
  <button type="submit">Submit</button>
</form>

<!-- Parent.svelte -->
<script lang="ts">
  function handleSubmit(value: string) {
    console.log('Submitted:', value)
  }
</script>

<Child onSubmit={handleSubmit} />
```

## Control Flow

### `{#if}` Blocks

```svelte
<script lang="ts">
  let loading = $state(false)
  let error = $state<string>()
  let data = $state<Data>()
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if data}
  <DataDisplay {data} />
{:else}
  <p>No data</p>
{/if}
```

### `{#each}` with Key

**Always use `key` for list items**:

**Good**:
```svelte
<script lang="ts">
  interface Item {
    id: string
    name: string
  }

  let items = $state<Item[]>([])
</script>

{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

**Bad** - Missing key:
```svelte
{#each items as item}
  <div>{item.name}</div>
{/each}
```

### `{#await}` for Promises

```svelte
<script lang="ts">
  async function fetchData() {
    const response = await fetch('/api/data')
    return response.json()
  }

  let dataPromise = $state(fetchData())
</script>

{#await dataPromise}
  <p>Loading...</p>
{:then data}
  <pre>{JSON.stringify(data, null, 2)}</pre>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

## Snippets (Reusable Template Blocks)

Use snippets for reusable template logic:

```svelte
<script lang="ts">
  let items = $state(['Apple', 'Banana', 'Cherry'])
</script>

{#snippet itemCard(item: string)}
  <div class="card">
    <h3>{item}</h3>
    <button onclick={() => console.log(item)}>Select</button>
  </div>
{/snippet}

<div class="grid">
  {#each items as item (item)}
    {@render itemCard(item)}
  {/each}
</div>
```

## Slots

### Default Slot

```svelte
<!-- Card.svelte -->
<script lang="ts">
  interface Props {
    title: string
    children: import('svelte').Snippet
  }

  let { title, children }: Props = $props()
</script>

<div class="card">
  <h2>{title}</h2>
  <div class="content">
    {@render children()}
  </div>
</div>

<!-- Usage -->
<Card title="My Card">
  <p>This is the content</p>
</Card>
```

### Named Slots

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  interface Props {
    header?: import('svelte').Snippet
    footer?: import('svelte').Snippet
    children: import('svelte').Snippet
  }

  let { header, footer, children }: Props = $props()
</script>

<div class="modal">
  {#if header}
    <div class="header">
      {@render header()}
    </div>
  {/if}

  <div class="body">
    {@render children()}
  </div>

  {#if footer}
    <div class="footer">
      {@render footer()}
    </div>
  {/if}
</div>

<!-- Usage -->
<Modal>
  {#snippet header()}
    <h2>Modal Title</h2>
  {/snippet}

  <p>Modal content here</p>

  {#snippet footer()}
    <button>Close</button>
  {/snippet}
</Modal>
```

## Component Communication

### Parent → Child (Props)

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  let count = $state(0)
</script>

<Child value={count} />

<!-- Child.svelte -->
<script lang="ts">
  interface Props {
    value: number
  }

  let { value }: Props = $props()
</script>

<p>Value: {value}</p>
```

### Child → Parent (Callbacks)

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  function handleEvent(data: string) {
    console.log('Child said:', data)
  }
</script>

<Child onEvent={handleEvent} />

<!-- Child.svelte -->
<script lang="ts">
  interface Props {
    onEvent: (data: string) => void
  }

  let { onEvent }: Props = $props()
</script>

<button onclick={() => onEvent('Hello')}>Send</button>
```

### Sibling Communication (Shared State)

```svelte
<!-- parent.svelte -->
<script lang="ts">
  let sharedValue = $state(0)
</script>

<ChildA bind:value={sharedValue} />
<ChildB bind:value={sharedValue} />
```

Or use stores for complex state sharing (see [State Management](#state-management)).

## State Management

### Component-Level State

Use `$state` for simple component state:

```svelte
<script lang="ts">
  let count = $state(0)
  let items = $state<string[]>([])
</script>
```

### Module-Level State (Shared Stores)

For state shared across components:

```typescript
// stores/counter.svelte.ts
export const counter = (() => {
  let count = $state(0)

  return {
    get count() { return count },
    increment: () => count++,
    decrement: () => count--,
    reset: () => count = 0
  }
})()
```

```svelte
<!-- ComponentA.svelte -->
<script lang="ts">
  import { counter } from '$lib/stores/counter.svelte'
</script>

<p>{counter.count}</p>
<button onclick={counter.increment}>+</button>

<!-- ComponentB.svelte -->
<script lang="ts">
  import { counter } from '$lib/stores/counter.svelte'
</script>

<p>Same count: {counter.count}</p>
```

### Class-Based Stores

```typescript
// stores/presentation.svelte.ts
class PresentationStore {
  components = $state<Map<string, Component>>(new Map())
  timeline = $state<TimelineEvent[]>([])

  isPlaying = $derived(this.timeline.length > 0)
  componentCount = $derived(this.components.size)

  addComponent(id: string, component: Component) {
    this.components.set(id, component)
  }

  removeComponent(id: string) {
    this.components.delete(id)
  }

  clear() {
    this.components.clear()
    this.timeline = []
  }
}

export const presentationStore = new PresentationStore()
```

## Styling

### Component-Scoped Styles

```svelte
<style>
  .container {
    padding: 1rem;
    background: var(--bg-color);
  }

  h2 {
    /* Only affects h2 within this component */
    color: var(--heading-color);
  }
</style>

<div class="container">
  <h2>Title</h2>
</div>
```

### Global Styles with `:global()`

```svelte
<style>
  :global(body) {
    margin: 0;
  }

  .container :global(.external-class) {
    /* Styles for elements with external-class inside container */
  }
</style>
```

### Dynamic Classes

```svelte
<script lang="ts">
  let active = $state(false)
  let variant = $state<'primary' | 'secondary'>('primary')
</script>

<!-- class: directive for reactive classes -->
<button
  class="btn"
  class:active
  class:btn-primary={variant === 'primary'}
  class:btn-secondary={variant === 'secondary'}
>
  Button
</button>

<!-- Or use template literal -->
<button class="btn {variant} {active ? 'active' : ''}">
  Button
</button>
```

### CSS Custom Properties (Recommended)

```svelte
<script lang="ts">
  interface Props {
    color?: string
    size?: string
  }

  let { color = 'blue', size = '1rem' }: Props = $props()
</script>

<div
  class="box"
  style:--box-color={color}
  style:--box-size={size}
>
  Content
</div>

<style>
  .box {
    color: var(--box-color);
    font-size: var(--box-size);
  }
</style>
```

## Performance Optimization

### Avoid Unnecessary Re-renders

**Bad** - New object/array on every render:
```svelte
<script lang="ts">
  let items = $state([1, 2, 3])
</script>

<Child data={items.map(i => i * 2)} />
```

**Good** - Use `$derived`:
```svelte
<script lang="ts">
  let items = $state([1, 2, 3])
  let doubled = $derived(items.map(i => i * 2))
</script>

<Child data={doubled} />
```

### Lazy Loading Components

```svelte
<script lang="ts">
  import { onMount } from 'svelte'

  let HeavyComponent: any = $state()

  onMount(async () => {
    HeavyComponent = (await import('./HeavyComponent.svelte')).default
  })
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{/if}
```

## DRY Principles

### Extract Reusable Logic

**Bad** - Repeated logic:
```svelte
<!-- ComponentA.svelte -->
<script lang="ts">
  let data = $state<Data>()

  $effect(() => {
    fetch('/api/data-a')
      .then(r => r.json())
      .then(d => data = d)
  })
</script>

<!-- ComponentB.svelte -->
<script lang="ts">
  let data = $state<Data>()

  $effect(() => {
    fetch('/api/data-b')
      .then(r => r.json())
      .then(d => data = d)
  })
</script>
```

**Good** - Extract to utility:
```typescript
// utils/fetcher.svelte.ts
export function useFetch<T>(url: string) {
  let data = $state<T>()
  let loading = $state(true)
  let error = $state<string>()

  $effect(() => {
    loading = true
    fetch(url)
      .then(r => r.json())
      .then(d => {
        data = d
        loading = false
      })
      .catch(e => {
        error = e.message
        loading = false
      })
  })

  return {
    get data() { return data },
    get loading() { return loading },
    get error() { return error }
  }
}
```

```svelte
<!-- Component.svelte -->
<script lang="ts">
  import { useFetch } from '$lib/utils/fetcher.svelte'

  const { data, loading, error } = useFetch<Data>('/api/data')
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p>Error: {error}</p>
{:else if data}
  <pre>{JSON.stringify(data, null, 2)}</pre>
{/if}
```

## Testing Considerations

### Write Testable Components

```svelte
<!-- Testable: Pure props, callbacks for actions -->
<script lang="ts">
  interface Props {
    count: number
    onIncrement: () => void
  }

  let { count, onIncrement }: Props = $props()
</script>

<button data-testid="increment-btn" onclick={onIncrement}>
  {count}
</button>
```

See [testing-standards.md](./testing-standards.md) for comprehensive testing guidelines.

## Checklist

Before committing Svelte code, ensure:

- [ ] Using Svelte 5 runes (`$state`, `$derived`, `$effect`)
- [ ] Props defined with TypeScript interface
- [ ] Never mutating props directly
- [ ] Using `key` in `{#each}` blocks
- [ ] Event handlers use lowercase (`onclick`, not `on:click`)
- [ ] Effects have cleanup when necessary
- [ ] No unnecessary `$derived` (use templates directly)
- [ ] Components are focused and reusable
- [ ] Styles are scoped appropriately
- [ ] Data flow is clear (props down, events up)

## Related Documentation

- [TypeScript Standards](./typescript-standards.md)
- [Testing Standards](./testing-standards.md)
- [System Architecture](../🏗️%20architecture/system-overview.md)
