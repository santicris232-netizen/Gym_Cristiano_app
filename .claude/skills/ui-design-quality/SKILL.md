---
name: ui-design-quality
description: Design and review interfaces that look deliberately designed instead of default — spacing and type scales, real visual hierarchy, restrained color, complete interaction states, and accessible contrast and focus. Use this skill whenever the user is building, styling, or improving any UI: React components, pages, forms, tables, dashboards, landing pages, design tokens, CSS/Tailwind work, or whenever they say something "looks bad", "looks generic", "needs polish", "doesn't look professional", or asks to improve the look and feel — even if they never say the word "design".
---

# UI design quality

Most generated UI is not ugly because of bad taste. It is ugly because every decision was made independently: this padding, that font size, this shade of gray, all locally reasonable and globally incoherent. The fix is not more decoration. It is fewer, more consistent decisions.

Work through this skill in three passes: **structure** (what goes where and what matters most), **system** (the small set of values everything is built from), **state** (what the thing looks like when it's empty, loading, focused, or broken). Polish is the last 5%, not the first.

## Pass 1 — Structure and hierarchy

Before writing any style, answer: what is the one thing the user came to this screen to do? That element gets the strongest treatment. Everything else steps down. A screen where three things shout is a screen where nothing is heard.

You have exactly three levers for hierarchy, and you should reach for them in this order:

1. **Size and weight** — the cheapest and most legible signal. A 24px semibold heading above 14px regular body needs no other differentiation.
2. **Space** — proximity groups related things far more convincingly than borders do. Related items get tight spacing; unrelated groups get generous spacing. If you find yourself adding a divider, first try doubling the gap.
3. **Color** — the last resort, not the first. Color carries meaning (danger, success, brand), so spending it on decoration devalues it.

Concretely, this means:

- **One primary button per view.** Everything else is secondary (subtle background) or tertiary (text only). Two blue buttons side by side is a decision you pushed onto the user.
- **Don't wrap everything in a card.** Cards imply "this is a separable unit." A page of nested cards has no hierarchy — it's a stack of equal boxes. Use background separation only where the grouping is real.
- **Left-align text.** Centered text is for short hero copy and empty states only; centered paragraphs force the eye to hunt for each new line's start.
- **Constrain measure.** Body text becomes hard to read past ~75 characters per line (`max-w-prose`, or roughly `max-w-2xl`). Full-width paragraphs on a wide monitor are a readability bug.

## Pass 2 — The system

Pick the values once, then only use those values. This single habit accounts for most of the visual difference between amateur and professional work.

**Spacing** — use a 4px-based scale and nothing else: `4, 8, 12, 16, 24, 32, 48, 64`. If a layout needs 13px, the real problem is elsewhere. Tailwind's default scale already is this; the discipline is refusing arbitrary values like `p-[13px]`.

**Type** — 4 to 6 sizes maximum for an entire app, e.g. `12, 14, 16, 20, 24, 32`. Body copy is 15–16px, never below 14px. Pair each size with a line height: tight (`1.2`) for headings, comfortable (`1.5–1.6`) for body. Use two weights (regular + semibold); a third only if you have a real use for it.

**Color** — one neutral ramp plus one accent, plus semantic colors for feedback:

- The neutral ramp does 90% of the work: page background, surface, border, muted text, body text. Backgrounds are rarely pure white and text is rarely pure black — near-neutrals (`#FAFAFA` / `#18181B`) read as considered, pure `#FFF`/`#000` read as untouched defaults.
- The accent appears on the primary action, active nav state, and focus ring. That's usually it.
- Semantic colors (red/amber/green) are reserved for meaning. Never use red purely because it looks energetic.
- **Never a purple-to-pink gradient on the hero and buttons.** It is the single strongest tell of unconsidered AI output. If you want visual interest, get it from typography, a real photograph, generous whitespace, or one saturated accent against a lot of neutral.

**Radius and shadow** — pick one radius (commonly 6–8px) and use it everywhere; mixing 4px inputs with 16px cards looks accidental. Shadows should read as light, not as gray fog: small blur, low opacity, slight downward offset, and *at most* two elevation levels (resting and floating). Everything cannot be elevated.

**Borders vs shadows** — pick one as the primary way you separate surfaces. Using both on the same element usually means neither was doing its job.

## Pass 3 — States

Unfinished-feeling UI is almost always missing states, not missing polish. For every interactive element, decide all of these before you call it done:

- **Hover** — visible but subtle; a small background or border shift, not a jump in size.
- **Focus-visible** — a clearly visible ring, and never `outline: none` without a replacement. Keyboard users navigate entirely by this. Use `:focus-visible` so mouse clicks don't show the ring.
- **Active/pressed** — brief, immediate feedback so a click feels acknowledged.
- **Disabled** — reduced contrast *and* `cursor: not-allowed`, plus the reason communicated somewhere if it isn't obvious.
- **Loading** — for anything async. Skeletons that mirror the real layout for initial page loads; inline spinners with the button locked for actions. A button that can be double-submitted is a bug.
- **Empty** — the first thing a new user sees. Say what would go here and give the action that creates the first one. A blank rectangle reads as broken.
- **Error** — placed next to the field or action that failed, saying what to do about it, not just what failed.

And the accessibility floor, which is design work rather than a compliance chore:

- Body text at 4.5:1 contrast, large text and UI borders at 3:1. Light gray on white fails this constantly — check it rather than eyeballing it.
- Interactive targets at least 44×44px on touch. Icon-only buttons need padding, not just a bigger icon.
- Never encode meaning in color alone; pair status colors with an icon or label.
- Respect `prefers-reduced-motion` for anything that moves more than a few pixels.
- Transitions of 150–200ms on color and transform. Long animations feel slow the second time; animating `width`/`height`/`top` instead of `transform`/`opacity` makes them janky.

## When the task is "improve this existing UI"

Read the current code first and diagnose before changing anything. Report findings in this shape so the user can accept or reject each one:

```markdown
## What's working
[Briefly — don't rewrite what's fine.]

## Issues, highest impact first
1. **[Problem]** — [why it hurts the user] → [the specific change]

## Changes I made
[File and what changed, one line each.]
```

Ordering by impact matters: fixing an unreadable contrast ratio or a missing loading state beats nudging a border radius, and the user should see that judgment rather than a flat list.

## Practical defaults for React + Tailwind

- Keep the design system in one place — Tailwind theme tokens or CSS custom properties — and reference tokens (`bg-surface`, `text-muted`) rather than raw values (`bg-[#f4f4f5]`). One change then updates everything.
- Build variants with `cva` or a small variant map instead of long ternary chains in `className`; it keeps the variant list readable and makes the "one primary button" rule enforceable.
- Reach for an accessible headless primitive (Radix, React Aria) for modals, dropdowns, comboboxes, and tooltips. Focus trapping, escape handling, and ARIA wiring are where hand-rolled components quietly fail, and rewriting them is rarely the interesting part of the task.
- Dark mode, if supported, is a token swap — define both palettes as variables. Never define a color only inside a dark-mode block; something will render unstyled in the other theme.
- Test at 320px wide, at 100% zoom on a large monitor, and with the keyboard only. These three checks catch most of what review would catch.

## The tells to avoid

These read as "nobody looked at this": purple/pink gradients; emoji used as interface icons; every section centered; drop shadows on everything; five font sizes within one card; `#000` text on `#FFF`; a spinner as the only empty state; placeholder text used as the label; horizontal scrollbars at mobile width; buttons that shift position on hover.

The recurring theme is uniform emphasis. When everything is equally prominent, the interface stops guiding anyone — so if a screen feels flat, the fix is usually to *remove* emphasis from four things rather than add more to the fifth.
