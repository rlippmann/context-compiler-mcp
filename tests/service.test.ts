import { describe, expect, it } from 'vitest';
import type { EngineCheckpoint } from '@rlippmann/context-compiler';
import { ContextCompilerService } from '../src/service.js';

describe('ContextCompilerService', () => {
  it('apply_directive update flow', () => {
    const service = new ContextCompilerService();
    const result = service.applyDirective('use docker');

    expect(result).toEqual({
      decision: {
        kind: 'update',
        prompt_to_user: null,
        state: {
          premise: null,
          policies: {
            docker: 'use'
          },
          version: 2
        }
      }
    });
  });

  it('apply_directive clarify flow', () => {
    const service = new ContextCompilerService();
    service.applyDirective('use docker');

    const result = service.applyDirective('prohibit docker');

    expect(result.decision.kind).toBe('clarify');
    expect(result.decision.state).toBeNull();
    expect(result.decision.prompt_to_user).toContain('currently in use');
  });

  it('get_state returns current state', () => {
    const service = new ContextCompilerService();
    service.applyDirective('set premise concise replies');

    expect(service.getState()).toEqual({
      state: {
        premise: 'concise replies',
        policies: {},
        version: 2
      }
    });
  });

  it('checkpoint export/import roundtrip', () => {
    const serviceA = new ContextCompilerService();
    serviceA.applyDirective('set premise concise replies');
    serviceA.applyDirective('use docker');

    const checkpoint = serviceA.exportCheckpoint().checkpoint;

    const serviceB = new ContextCompilerService();
    serviceB.importCheckpoint(checkpoint);

    expect(serviceB.getState()).toEqual(serviceA.getState());
  });

  it('pending clarify continuation after checkpoint restore', () => {
    const serviceA = new ContextCompilerService();
    const clarify = serviceA.applyDirective('use kubectl instead of docker');

    expect(clarify.decision.kind).toBe('clarify');

    const checkpoint = serviceA.exportCheckpoint().checkpoint;

    const serviceB = new ContextCompilerService();
    serviceB.importCheckpoint(checkpoint);

    const resumed = serviceB.applyDirective('yes');
    expect(resumed.decision.kind).toBe('update');
    expect(serviceB.getState().state).toEqual({
      premise: null,
      policies: {
        kubectl: 'use'
      },
      version: 2
    });
  });

  it('invalid checkpoint handling throws', () => {
    const service = new ContextCompilerService();

    expect(() => {
      service.importCheckpoint({
        checkpoint_version: 1,
        authoritative_state: {
          premise: null,
          policies: {},
          version: 2
        },
        pending: {
          kind: 'replacement',
          replacement: {
            kind: 'use_only',
            new_item: 'kubectl',
            old_item: 'docker'
          },
          prompt_to_user: 'confirm?'
        }
      } as unknown as EngineCheckpoint);
    }).toThrowError('Invalid checkpoint payload.');
  });
});
