<!--
Sync Impact Report
- Version: 1.0.0 → 1.1.0
- Modified Principles: II. Static Delivery Mandate (new), III. Test Evidence First (renumbered), IV. Experience Consistency (renumbered), V. Performance Guardrails (renumbered)
- Added Sections: None
- Removed Sections: None
- Templates Updated: ✅ .specify/templates/plan-template.md, ✅ .specify/templates/spec-template.md, ✅ .specify/templates/tasks-template.md
- Follow-ups: None
-->

# Feedfront Constitution

## Scope

Feedfront is a single progressive web app (PWA) that serves as a front-end client for headless-rss backends.

## Core Principles

### I. Code Quality Discipline
All contributions MUST pass automated linting, and type-checking before review, keep functions focused, and delete dead code in the same change that makes it obsolete. 

### II. Static Delivery Mandate
Every feature MUST compile down to immutable assets served via CDN, with all dynamic data fetched from headless-rss APIs at build time or through client-side hydration that works without server state. Runtime servers, custom APIs, or persistent sessions are prohibited unless justified via an RFC approved by maintainers. Builds must remain reproducible, deterministic, and capable of running under `npm run build && npm run export` on clean environments.

### III. Automatic Tests
Every change MUST include failing tests before implementation work begins and end-to-end verification before merge.

### IV. Experience Consistency
UI work MUST use the shared design tokens, typography scale, and spacing system, remain responsive between 320px and 1440px, and meet WCAG 2.1 AA contrast and keyboard navigation rules.


## Delivery Constraints

- Static-first: Build artifacts must be immutable assets deployable to a CDN. All server-side needs must route through existing headless-rss endpoints, and any proposal for custom compute requires an approved RFC plus rollback plan.
- Dependency discipline: Frontend libraries must be audited for bundle impact and security; adding a framework requires an RFC reviewed against Principle V budgets.

## Workflow & Quality Gates

1. **Plan**: Before Phase 0 research, document Constitution Gates (quality, test, experience, performance) in the plan and enumerate how the feature will satisfy each.
2. **Spec**: User stories must include UX acceptance criteria; specs without these are rejected.
3. **Tasks**: Each user story receives explicit tasks for creating automated tests.

**Version**: 1.2.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12
