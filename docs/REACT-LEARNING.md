# Learn React in this project

Use small changes to learn one concept at a time. Each exercise below is optional;
the setup does not depend on completing these exercises.

## 1. Components and JSX

Read `client/src/home/Home.tsx`. A component is a function that returns a description
of the UI. JSX is the markup-like syntax used to create that description. MUI's Box
and Typography are components too; their props control layout and presentation.

Exercise: add a descriptive sentence under Welcome, then change the test to assert
that a visitor can read it. Use `screen.getByText` or a semantic role where appropriate.

## 2. Props and TypeScript

Props are inputs supplied by a parent component. Read how App passes `config` to
Template. A TypeScript interface describes the allowed shape; it does not create an
object or implement a feature at runtime. This distinction matters for the copied WF
`.d.ts` files: the matching JavaScript must implement the feature too.

Exercise: extract a Greeting component that accepts a typed `name: string` prop.
Render it with two names in a focused test. Keep it in the feature folder until a
second feature actually needs it.

## 3. State and events

State is a component's memory. Calling a state setter asks React to render again;
mutating a variable does not. Read the local Template's mobile-menu state and button
handler as an example. Event handlers describe what should happen after an action.

Exercise: add a show/hide details button with `useState`, an accessible name, and
`aria-expanded`. Test opening and closing with `userEvent.click`.

## 4. Routes and navigation

Read `client/src/app/routes.tsx` and `NotFound.tsx`. The route table maps URLs to page
components. RouterLink updates the URL through the router without a full document
reload. The WF Template owns the router; adding another BrowserRouter is an error.

Exercise: add a Help page and menu item. Verify direct navigation, refresh, Home,
browser Back, the document title, and the mobile menu. Add the corresponding tests.

## 5. Effects and loading

An effect synchronizes React with something outside rendering, such as a network
request or document title. Do not use an effect merely to calculate a value from props.
Read the local `useConfig.js` implementation: it loads JSON, displays a fallback,
reports failure, and cancels a request when its component goes away.

Exercise: test a loading state and failed request in a small feature. Explain why
cleanup matters when the component unmounts. StrictMode may repeat setup/cleanup in
development to reveal mistakes; avoid disabling it to hide them.

## Suggested learning loop

Ask the AI to explain the next concept using one current file. Make a small change,
write a behavior-focused test, run it, then inspect the browser and the diff. Ask the
AI to explain any type or lint error before accepting a broad suppression.

Official starting points: [React Quick Start](https://react.dev/learn),
[Thinking in React](https://react.dev/learn/thinking-in-react), and
[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).
