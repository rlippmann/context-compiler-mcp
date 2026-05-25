# AGENTS.md

Guidelines for AI agents working in this repository.

## Branch rules
- Never commit directly to `main`.
- Never push directly to `main`.
- Never check out or modify `main`.
- Always work on a feature branch.
- If the current branch is `main`, stop and ask the user to create a branch.

## Development workflow
Before committing:
1. Run the repository lint/format/typecheck commands if configured.
2. Run the repository test suite.

Do not bypass pre-commit hooks or validation tooling.

## Test coverage expectations
Before opening a PR, consider:

* Does this change affect any user-facing behavior?
* If so, is that behavior covered by tests?

User-facing behavior includes:

* MCP tool responses
* clarify/pending flows
* checkpoint export/import behavior
* stdio server behavior
* MCP client compatibility behavior
* tool schema/output shape
* error normalization behavior

If a user-facing behavior is changed or introduced, add or update tests to cover it.

Do not rely solely on coverage metrics.

## Scope of changes
- Only modify files necessary for the requested task.
- Do not refactor unrelated code.
- Do not change project structure unless explicitly asked.
- Make the minimal change required to solve the requested task.
- If the task expands beyond the original request, stop and ask the user for guidance.

## Dependencies
- Prefer small, well-maintained dependencies.
- Do not introduce frameworks or abstractions unless clearly justified.
- If adding a dependency, explain why it is needed.

## TypeScript
- Target modern TypeScript and Node.js versions supported by the repository.
- Prefer simple, explicit implementations over abstraction-heavy designs.
- Avoid unnecessary wrapper layers.
- Keep MCP tool handlers thin and easy to inspect.
- Core directive/state semantics belong to Context Compiler, not this MCP layer.

## MCP scope
- Do not add semantic interpretation in the MCP layer.
- Do not implement planner/agent behavior.
- Do not duplicate directive semantics outside the core engine.
- Do not add autonomous workflow behavior.
- Do not infer authoritative state from model output.
- Do not expose experimental preprocessor behavior as core MCP functionality.

## Git safety
- Do not perform history-rewriting operations unless explicitly instructed.
- This includes `git rebase`, `git reset`, `git push --force`, and `git commit --amend`.
- Do not push directly to `main`.
- Do not check out or modify `main`.
- If the current branch is `main`, stop and ask the user to create a feature branch.

## Commit messages
- Commit messages must use this format: `<type>: <summary>`.
- The `<type>` token must be lowercase letters only.
- The `<summary>` must be short and written in imperative mood.
- Allowed `<type>` values: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
- If a proposed commit message does not match this format or type list, stop and ask for a corrected message before committing.

## PR guidance
- Never open or merge a PR targeting `main` from `main`; always use a feature branch.
- PR titles must use the same format as commits: `<type>: <summary>`.
- PR descriptions should include:
  - what changed
  - why the change was needed
- Do not include a dedicated "Validation" section in PR text.
- Keep PR scope aligned to the requested task; if scope grows, ask for guidance before expanding.

## CI
Do not modify GitHub CI workflows unless explicitly asked.

## Documentation
Specification and API contracts are authoritative.

Do not change specification documents unless explicitly instructed.

If implementation behavior does not match the specification, report the mismatch instead of modifying the specification.

## Documentation style

For README, examples, package descriptions, and integration docs:

- Explain user-visible behavior before architecture.
- Prefer plain, concrete wording when accurate.
- Keep examples short and practical.
- Prefer behavior-first explanations over internal terminology.

Examples:
- "rules and corrections that stick"
- "saved compiler state"
- "stored premise and policy rules"
- "fixed, repeatable behavior"
- "explicit instructions stay consistent across turns"

Avoid unnecessary jargon when simpler wording is accurate.

Specification and contract documents are different:
- preserve precise terminology
- preserve unambiguous behavioral guarantees
- do not weaken formal semantics for readability

Do not rewrite captured outputs, fixture-sensitive examples, or eval evidence unless explicitly asked.

## Tooling
Use the repository's existing tooling and scripts.

Prefer:
- existing package manager
- existing test runner
- existing formatter/linter configuration

Do not introduce alternative tooling unless explicitly requested.

## MCP design principles
- Prefer a small, inspectable tool surface.
- Prefer explicit structured outputs over prose.
- Clarify responses must remain visibly distinct from successful mutations.
- Preserve deterministic continuation behavior across checkpoint restore.
- Avoid hidden stateful orchestration in the MCP server.
- Keep the server local-first and stdio-first unless explicitly instructed otherwise.

## Regression expectations
- Changes affecting MCP response shape or clarify behavior must include regression coverage.
- Checkpoint import/export behavior must remain deterministic.
- Tool schema changes must be intentional and documented.
- If behavior changes intentionally, explain the contract change in the PR description.

