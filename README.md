# Context Compiler MCP

Local stdio MCP server for Context Compiler.

This server keeps one in-memory Context Compiler engine instance and exposes four MCP tools:

- `apply_directive(input)`
- `get_state()`
- `export_checkpoint()`
- `import_checkpoint(checkpoint)`

User-visible behavior:
- explicit directives update stored state deterministically
- clarify decisions are returned directly and remain distinct from updates
- checkpoint export/import supports continuation-safe restore, including pending clarification state

Out of scope in v0:
- remote hosting
- preprocessor behavior
- planner or autonomous workflow behavior
- multi-session orchestration

## Install

```bash
npm install -g @rlippmann/context-compiler-mcp
```

## Run

```bash
context-compiler-mcp
```

## MCP tools

- apply_directive
- get_state
- export_checkpoint
- import_checkpoint

`apply_directive` accepts canonical Context Compiler directives like:

```text
use uv
prohibit docker
set premise concise replies
```

Clarify responses are blocking and require confirmation before mutation continues.

## License

Apache-2.0
