---
name: react-feature
description: Implement a feature in this React and Express project while teaching the React concepts used. Use for requested pages, components, or user interactions.
---

Read the root AGENTS.md and the affected code. Establish the requested user behavior
and build the smallest implementation that satisfies it. Retain the WF Template;
pages and navigation are registered in client/src/app/routes.tsx. The local Template
supports flat routes, including path parameters, but not loaders/actions or auth guards.

Use props for inputs and state for changing local UI values. Compute derived values
during render when possible; reserve effects for synchronization with external systems.
Use semantic controls and accessible names. Add loading/empty/error UI when the feature
actually involves asynchronous data, not as unused scaffolding.

Test the observable interaction with Testing Library/user-event. Add a browser test
when routing, refresh, focus, or responsive layout is part of the requirement. Run the
relevant checks from AGENTS.md and report results.

Explain the React concept introduced using the edited file and a small example. End
with an optional hands-on exercise that does not block completion of the requested work.
