---
name: functional-typescript
description: Write TypeScript in a functional style the compiler can actually check — a pure core with effects pushed to the edges, immutable data, discriminated unions that make illegal states unrepresentable, exhaustive matching, and typed errors instead of thrown exceptions. Use this skill whenever the user mentions functional programming, pure functions, immutability, composition, side effects, Result/Either/Option types, or is refactoring imperative or stateful code, tangled React state and `useEffect` chains, defensive null checks, or ad-hoc error handling — including when they only ask for code that is "cleaner", "safer", or "easier to test".
---

# Functional TypeScript

Functional programming in TypeScript is worth doing for two concrete payoffs: **functions you can test by calling them**, and **states the compiler won't let you reach**. Everything below serves one of those. Anything that serves neither — point-free style for its own sake, monad transformers on a team that hasn't asked for them — makes the code worse, so it isn't here.

TypeScript is not Haskell, and pretending otherwise produces code your teammates route around. The aim is a strongly functional *core* with a pragmatic shell.

## Pure core, imperative shell

A pure function returns the same output for the same input and touches nothing else — no I/O, no clock, no randomness, no mutation of its arguments, no global state. Those functions are trivially testable, safely reorderable, and cacheable.

Effects can't be eliminated; they can be *concentrated*. Push them to the outside so the interesting logic stays pure:

```ts
// ❌ Rules and effects tangled — to test this you need a database and a fake clock
async function chargeMember(id: string) {
  const member = await db.member.findUnique({ where: { id } });
  if (member.plan === 'annual' && Date.now() - member.joinedAt < YEAR) {
    member.balance -= 0;
  } else {
    member.balance -= PRICES[member.plan];
  }
  await db.member.update({ where: { id }, data: { balance: member.balance } });
}

// ✅ The rule is pure; the effects sit around it
export function calculateCharge(member: Member, now: Date): Money { … }

async function chargeMember(id: string) {
  const member = await loadMember(id);
  const charge = calculateCharge(member, new Date());   // ← the part worth testing
  await saveBalance(id, subtract(member.balance, charge));
}
```

`calculateCharge` now has a table-driven test with no mocks. That is the whole point — not that the code looks more functional.

Two habits follow from this: **pass time, randomness, and IDs in as arguments** rather than calling `Date.now()`, `Math.random()`, or `crypto.randomUUID()` inside logic; and **pass dependencies explicitly** as a plain first parameter (`{ db, clock }`) instead of importing singletons, which gives you injection without a framework.

## Immutability

Mutation is a communication problem: it lets a function change something its caller still holds a reference to, so the caller can no longer reason locally.

- Mark inputs `readonly` (`readonly T[]`, `Readonly<T>`) so the compiler enforces it — this is real checking, not a naming convention.
- Return new values instead of editing arguments: `[...items, next]`, `{ ...user, name }`, `items.map(...)`, `items.toSorted(...)`. Note that `sort`, `reverse`, and `splice` mutate in place; the `toSorted`/`toReversed`/`with` variants don't.
- Use `as const` for literal data so the types stay narrow and the value stays frozen in intent.

Deeply nested spread updates (`{...a, b: {...a.b, c: {...}}}`) are a signal, not a style to push through: either the state shape is too nested, or you want Immer's `produce` for that one reducer. Both beat three levels of spread.

Local mutation inside a function that doesn't escape is fine — a `for` loop building an array it then returns is pure from the outside, and often clearer than a clever `reduce`.

## Make illegal states unrepresentable

This is where TypeScript pays the most, and it costs almost nothing. The common shape below allows sixteen combinations, most of them nonsense — `isLoading` and `error` at once, `data` present while loading:

```ts
type State = { isLoading: boolean; data?: Workout[]; error?: Error };
```

A discriminated union allows exactly the four real ones, and the compiler forces every consumer to handle them:

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: readonly Workout[] }
  | { status: 'error'; error: LoadError };
```

Now `state.data` doesn't typecheck unless you've narrowed to `success`, so the "loading spinner over stale data" class of bug can't be written.

Pair unions with **exhaustive matching**, so adding a variant turns into a compile error at every place that needs updating rather than a silent fallthrough at runtime:

```ts
function render(state: State) {
  switch (state.status) {
    case 'idle':    return null;
    case 'loading': return <Skeleton />;
    case 'success': return <List items={state.data} />;
    case 'error':   return <Error error={state.error} />;
    default: {
      const _exhaustive: never = state;   // adding a variant fails to compile here
      return _exhaustive;
    }
  }
}
```

The same idea applies to primitives: branded types (`type UserId = string & { readonly _brand: 'UserId' }`) stop a `WorkoutId` being passed where a `MemberId` belongs — a bug that unit tests rarely catch and types catch for free.

## Typed errors at the boundaries

Thrown exceptions are invisible to the type system: nothing in a signature tells a caller what can fail or how. For *expected* failures — validation, not-found, insufficient permission, payment declined — return them instead:

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function parseWorkout(input: unknown): Result<Workout, ValidationError> { … }
```

Callers must handle the failure to reach the value, and the failure modes are documented in the signature. Model the error as a discriminated union too (`{ kind: 'not_found' } | { kind: 'forbidden' }`) so each case can be handled distinctly instead of by string-matching a message.

Be deliberate about scope, or this becomes noise:

- **Use `Result`** for expected, actionable failures — the ones a caller has a real decision to make about.
- **Keep throwing** for genuine bugs and unrecoverable conditions (invariant violations, misconfiguration). Let those hit an error boundary or top-level handler.
- **Don't wrap everything.** A `Result` threaded through eight layers that all just forward it is worse than a throw caught once at the edge. Convert at the boundary where the decision is actually made.

Reach for `neverthrow` or `fp-ts` only if the team already uses it. A twelve-line hand-rolled `Result` with `map`/`unwrapOr` helpers covers most needs and stays readable to everyone.

## Composition

Prefer small named functions composed at the call site over one function with flag parameters or five branches. Naming each step is most of the readability win:

```ts
const activeMembers = members.filter(isActive);
const overdue = activeMembers.filter(hasOverduePayment(today));
const notices = overdue.map(toPaymentNotice);
```

That is more readable than a single-pass `reduce` doing all three, and the intermediate arrays are irrelevant at these sizes. Optimize the chain into one pass only when the data is large *and* you've measured — and say so in a comment when you do.

Some honest limits: use `reduce` for actual folds (summing, grouping), not for things `map`/`filter`/`flatMap` express directly — `reduce` with an accumulator object is often harder to read than the loop it replaced. And skip point-free/`pipe(a, b, c)` chains unless the codebase already leans that way; the intermediate names usually help more than the brevity does.

Higher-order functions earn their place when they remove real duplication (`withRetry`, `withAuth`, `memoize`), not when they exist to look abstract.

## In React specifically

React components are already functions of props to UI, so most React "state bugs" are functional-programming problems wearing a costume:

- **Derive, don't synchronize.** If a value can be computed from props or state, compute it during render. A `useEffect` that sets state from other state is the most common self-inflicted bug in React apps — it renders twice, can desync, and disappears entirely when you just compute the value.
- **Effects are for synchronizing with the outside world** — subscriptions, the DOM, network calls that aren't derived data. Not for reacting to your own state changes.
- **Event handlers over effects.** Something that should happen *because the user did something* belongs in the handler, not in an effect watching the resulting state.
- **Reducers should be pure.** A `useReducer` reducer with a fetch or a `Date.now()` in it will misbehave. Compute the effect's input in the reducer; perform it outside.
- **`useMemo`/`useCallback` are for measured problems** — a genuinely expensive computation or a stable dependency identity. Wrapping everything adds allocation and noise for no gain.
- **Keep components pure during render**: no mutating props, no writing to module-level variables, no side effects in the render body. StrictMode's double-render exists to surface exactly these.

## Applying this to existing code

When refactoring rather than writing fresh, go in this order — it front-loads the value and keeps every step shippable:

1. **Find the logic worth extracting**: business rules currently tangled with I/O, rendering, or framework calls.
2. **Pull them into pure functions** taking explicit inputs, and put tests on them immediately — the tests are the proof the extraction was correct.
3. **Replace boolean-soup state** with a discriminated union, and let the compile errors show you every place that was handling an impossible case (or failing to handle a real one).
4. **Type the error paths** at the boundary where failures are decided.
5. **Leave the shell imperative.** Handlers, effects, and the composition root are allowed to be plain and sequential; that's where the mess is supposed to live.

Don't convert an entire codebase in one pass. Mixed styles are normal; a half-migrated abstraction nobody understands is not. If a change makes the code harder for someone else to follow, it failed on its own terms — the goal is testable and unbreakable, not clever.
