import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { EngineCheckpoint } from '@rlippmann/context-compiler';
import { ContextCompilerService } from './service.js';

export function createMcpServer(service: ContextCompilerService = new ContextCompilerService()): McpServer {
  const server = new McpServer({
    name: '@rlippmann/context-compiler-mcp',
    version: '0.0.1'
  });

  server.registerTool(
    'apply_directive',
    {
      description:
        "Apply exactly one canonical Context Compiler directive to the current in-memory engine state. Prefer canonical directive forms like: 'set premise concise replies', 'change premise to concise replies', 'use sqlite', 'prohibit docker', 'remove policy docker', 'clear premise', 'reset policies', 'clear state', 'use kubectl instead of docker'. Returns decision.kind, prompt_to_user, and state from the engine. If decision.kind is 'clarify', the mutation is blocked and you must ask the user the clarify prompt before attempting another mutation. Do not call this tool for quoted or reported instructions unless the user is actually asking to save that instruction as compiler state.",
      inputSchema: {
        input: z.string()
      }
    },
    async ({ input }) => {
      const result = service.applyDirective(input);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        structuredContent: result
      };
    }
  );

  server.registerTool(
    'get_state',
    {
      description: 'Return the current in-memory Context Compiler engine state.',
      inputSchema: {}
    },
    async () => {
      const result = service.getState();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        structuredContent: result
      };
    }
  );

  server.registerTool(
    'export_checkpoint',
    {
      description:
        'Export a continuation-safe Context Compiler checkpoint containing authoritative_state and pending clarify state, if any.',
      inputSchema: {}
    },
    async () => {
      const result = service.exportCheckpoint();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        structuredContent: result
      };
    }
  );

  server.registerTool(
    'import_checkpoint',
    {
      description: 'Import a Context Compiler checkpoint into the current in-memory engine instance.',
      inputSchema: {
        checkpoint: z.custom<EngineCheckpoint>()
      }
    },
    async ({ checkpoint }) => {
      const result = service.importCheckpoint(checkpoint);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ],
        structuredContent: result
      };
    }
  );

  return server;
}
