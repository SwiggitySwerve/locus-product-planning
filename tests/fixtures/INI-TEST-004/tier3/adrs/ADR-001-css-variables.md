---
status: Accepted
---

# ADR-001: Use CSS Variables for Theming

## Context
We need a theming system that's performant and maintainable.

## Decision
Use CSS custom properties (variables) for all theme values.

## Consequences
- Easy theme switching with class toggle
- Good browser support
- Some IE11 incompatibility (acceptable)
