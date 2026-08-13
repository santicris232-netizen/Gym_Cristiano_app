---
name: clean-architecture
description: Structure TypeScript/React/Node codebases so features stay independent and business logic stays out of the edges — feature-first folders, inward dependency direction, validated boundaries, explicit module contracts, and incremental refactors that don't require a rewrite. Use this skill whenever the user asks where code should live, how to organize or restructure a project, is scaffolding a new app or repo, mentions architecture / layers / folder structure / separation of concerns / coupling, or has files and components that have grown too big and do too much — even when they only say "clean this up" or "this is getting messy".
---

# Clean architecture for TypeScript full-stack

Architecture is the set of decisions that are expensive to reverse. In a TypeScript app those are almost always about **where a piece of knowledge lives** and **who is allowed to depend on whom** — not about which framework or folder naming convention you picked.

The goal is that a change to one feature touches one folder, and that the rules of the business can be read and tested without booting a server, opening a browser, or mocking a database.

## The two rules that carry most of the weight

**1. Organize by feature, not by technical kind.**

The instinct to create `components/`, `hooks/`, `services/`, `types/` at the top level feels tidy and produces the worst possible outcome: every feature is smeared across five folders, so every change is a five-folder change, and no folder can ever be deleted with confidence.

```
src/
  features/
    workouts/            # everything about workouts lives here
      components/
      hooks/
      workout-service.ts
      workout.types.ts
      index.ts           # the public surface — see rule 2
    members/
    billing/
  shared/                # genuinely cross-feature only
    ui/                  # design-system primitives: Button, Input, Dialog
    lib/                 # date, formatting, fetch wrapper
  app/                   # routing, providers, layout, composition root
```

Technical folders (`components/`, `hooks/`) are fine *inside* a feature, where the scope is small enough that the grouping is genuinely useful.

Code goes in `shared/` when a second feature actually needs it — not when you predict one might. Something used by exactly one feature belongs to that feature, however generic it looks.

**2. Dependencies point inward, and each feature has one front door.**

```
app / routes / UI  →  application (use cases)  →  domain (rules, types)
                              ↓
                       adapters (db, http, sdk)
```

The domain layer knows nothing about React, Express, Prisma, or `fetch`. It's plain functions and types. That's what makes it fast to test and durable across framework changes — which is the actual payoff, not architectural purity.

Every feature exports its public surface from `index.ts`, and other features import only from there:

```ts
// features/workouts/index.ts
export { WorkoutList } from './components/workout-list';
export { createWorkout, completeWorkout } from './workout-service';
export type { Workout, WorkoutId } from './workout.types';
```

```ts
import { createWorkout } from '@/features/workouts';            // ✅ contract
import { db } from '@/features/workouts/internal/db-client';    // ❌ reaching inside
```

This is what makes a feature refactorable: as long as `index.ts` holds, the inside can be rewritten freely. Enforce it mechanically with `eslint-plugin-boundaries` or an `import/no-restricted-paths` rule rather than by convention — conventions decay under deadline.

**Features should not import each other in a cycle.** If workouts and billing each need the other, the shared concept belongs in a lower layer both can depend on, or one of them should emit an event the other reacts to.

## Where business logic actually goes

The most common structural failure isn't folders — it's logic living in the edges:

| Logic ends up in | Why it hurts | Where it belongs |
|---|---|---|
| React components | Untestable without rendering; duplicated across screens | A plain function in the feature, called by the component |
| Route handlers / server actions | Tied to HTTP shape; unreusable from a job or CLI | A use-case function the handler calls |
| ORM models / DB queries | Business rules leak into persistence; hard to change stores | Domain functions; the query only reads and writes |
| `useEffect` | Runs at the wrong times, races, duplicates on re-render | Derived at render, or an explicit event handler |

The test: **can you exercise this rule without a browser, a server, or a database?** If not, it's in the wrong place. A handler should read as *parse input → call use case → shape response*, and be boring.

```ts
// features/workouts/complete-workout.ts — the use case, pure orchestration
export async function completeWorkout(
  deps: { workouts: WorkoutRepo; clock: Clock },
  input: CompleteWorkoutInput,
): Promise<Result<Workout, CompleteWorkoutError>> { … }

// app/api/workouts/[id]/complete/route.ts — the edge, thin
export async function POST(req: Request, { params }) {
  const parsed = completeWorkoutSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: 'invalid' }, { status: 400 });

  const result = await completeWorkout({ workouts, clock }, { id: params.id, ...parsed.data });
  return result.ok
    ? Response.json(result.value)
    : Response.json({ error: result.error.code }, { status: statusFor(result.error) });
}
```

Passing dependencies as a plain first argument gets you testability without a DI container or an interface-per-class ceremony. It's the cheapest version of the pattern and it composes fine.

## Boundaries: parse, don't assume

Every place data enters the system — HTTP request, API response, `localStorage`, env vars, URL params, webhook — is untyped at runtime no matter what the TypeScript signature claims. Validate once at the boundary with a schema (zod or equivalent), derive the type from the schema, and let everything inside trust the type.

```ts
const WorkoutSchema = z.object({ id: z.string().uuid(), sets: z.number().int().positive() });
export type Workout = z.infer<typeof WorkoutSchema>;   // one source of truth
```

Two failure modes this prevents: `as SomeType` casts that lie about untrusted data, and defensive `if (!x?.y)` checks scattered through code that should have been able to trust its inputs. Validate at the door so the interior can be clean.

Env vars deserve the same treatment, parsed once at startup so a missing variable fails at boot rather than at 3am in a rare code path.

## Client/server boundary (Next.js and friends)

The boundary is a network hop, so treat it as a real interface: server components fetch and pass plain serializable data down; `"use client"` sits as low in the tree as possible, on the interactive leaves rather than the page. Keep secrets and DB clients out of any module a client component can transitively import — that import graph is the actual security boundary, and it's easy to break accidentally through a barrel file.

Shared validation schemas and types can live in a `shared/` module both sides import; shared *runtime* code that touches server-only APIs cannot.

## When not to abstract

Structure has a cost, and over-applied it produces the other kind of unmaintainable codebase: five files to add one field.

- **Rule of three.** Two similar pieces of code are a coincidence; extract on the third, when you can see what actually varies. Early abstractions get shaped by the first case and fight the second.
- **Don't add an interface with one implementation.** A `UserRepository` interface with exactly one `PrismaUserRepository` behind it is indirection without optionality. Add it when a second implementation (or a test fake you genuinely need) exists.
- **Don't build a generic system for a specific problem.** A config-driven form engine invented before the third form is a bet that usually loses.
- **Prefer deleting to abstracting.** Duplicated code that no longer runs is the cheapest thing to remove.

Depth of folders is not quality. Three well-named files beat a nine-file hexagonal cathedral around a CRUD endpoint.

## Refactoring an existing mess

Never propose a rewrite. Migrate along the seams, keeping the app shippable at every step:

1. **Map it first.** Find the biggest files and the most-imported modules — those are where coupling has accumulated. Say what you found before changing anything.
2. **Pick one feature** — ideally one about to change anyway — and pull its files into `features/<name>/`, leaving re-exports at the old paths so nothing breaks.
3. **Extract logic out of the edges** for that feature: pull rules out of components and handlers into plain functions, and put tests on those functions now that they're testable.
4. **Add the `index.ts` contract** and switch other call sites to it.
5. **Turn on the lint boundary rule** for migrated features only, so new code can't regress while the rest catches up.
6. **Repeat per feature.** Mixed old and new structure during migration is normal and fine; a half-finished rewrite is not.

Each step is independently valuable and independently revertable, which is what makes it survive contact with a real schedule.

## Smells and what they usually mean

| Smell | Usually means |
|---|---|
| A component over ~200 lines | Several responsibilities; extract logic first, then split rendering |
| `../../../` imports | Wrong module boundary, or a missing path alias |
| A `utils.ts` that keeps growing | Unnamed concepts hiding in a junk drawer — name and relocate them |
| A `types.ts` shared by everything | Types divorced from the code that owns them |
| A test that needs five mocks | Too many dependencies in one unit — the design is telling you something |
| Changing one feature breaks another | A leaked internal; the contract wasn't respected |
| `any` or `as` at a boundary | Missing runtime validation |

## Output when asked to review or restructure

Lead with the diagnosis, not the folder tree — the user needs to agree with the problem before the solution is worth reading:

```markdown
## What I found
[Concrete observations with file paths and sizes, not generic advice.]

## Proposed structure
[Tree, only for the parts that change.]

## Migration steps
[Ordered, each one shippable on its own.]

## Deliberately not changing
[What's fine as-is, and why — this is as useful as the changes.]
```
