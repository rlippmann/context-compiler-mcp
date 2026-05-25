# Directive Generation Guidance

This file helps evaluate host-model behavior before calling MCP `apply_directive`.

## Goal

Decide whether to:
- call `apply_directive` with one canonical directive string
- not call `apply_directive`
- handle clarify follow-up (`yes` / `no` / other) after a prior clarify

## Use these canonical directive forms only

- `set premise <value>`
- `change premise to <value>`
- `use <item>`
- `prohibit <item>`
- `remove policy <item>`
- `use <new item> instead of <old item>`
- `clear premise`
- `reset policies`
- `clear state`

## Do not call `apply_directive` for these

- quoted or reported directives (`He said "use docker"`)
- questions or hypotheticals (`Could we use uv?`, `Suppose we clear state`)
- preferences or self-descriptions (`I prefer concise replies`)
- near-miss grammar or aliases (`allow docker`, `clear everything`)
- multi-instruction text (`prohibit peanuts and use almonds`)

## Clarify behavior

A `clarify` decision means the mutation did not apply yet.
The host should ask the user using `prompt_to_user`, then call `apply_directive` with the user follow-up.

Some clarify cases are pending continuation (`yes`/`no` can resolve), while others are conflict clarifications that do not create pending replacement state.

See `tests/fixtures/directive-generation-cases.json` for concrete examples.
