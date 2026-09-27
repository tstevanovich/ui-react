---
name: review-change
description: Review a proposed or uncommitted change in this project for behavior, accessibility, routing, and meaningful tests. Use when a code review is requested.
---

Read AGENTS.md and identify the requested review scope. Preserve unrelated user edits.
Trace changed behavior through callers and tests. Check hooks, request validation,
route refresh/back behavior, accessible labels/focus, and local WF runtime limitations.
Use existing lint/type/test commands to substantiate findings when practical.

Lead with actionable defects and file locations, ordered by impact. Describe the
trigger, observed or inferred consequence, and a focused correction. Distinguish
confirmed behavior from uncertainty. If no defects are found, say so and state the
validation limits. Explain one relevant React concept if it helps the developer learn.
Review does not itself authorize publishing, committing, or unrelated refactoring.
