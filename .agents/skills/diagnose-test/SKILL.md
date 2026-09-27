---
name: diagnose-test
description: Diagnose and fix a failing unit, integration, or browser test in this repository. Use for test failures, flaky tests, or a regression needing a behavioral test.
---

Read AGENTS.md, reproduce the smallest failing test, and inspect both the assertion
and the implementation. Decide whether the defect is in the behavior, setup, or test.
Preserve meaningful assertions; do not solve failures by skipping tests, lowering
coverage gates, adding arbitrary sleeps, or mocking away the feature being tested.

Jest runs separately in client and server. Reconstructed WF package tests use Node's
test runner. Playwright tests use a built server on port 4180, independently of the
developer's running server. Use role/name queries and user-event for React interactions.
Wait for observable async outcomes and clean up resources created by the test.

Make the focused fix, run the failing test, then affected related checks. Explain the
cause and why the assertion would catch the original regression. If the request was
only for diagnosis, report the fix needed without making unrelated changes.
