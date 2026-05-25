import { createEngine, type Decision, type EngineCheckpoint, type EngineState } from '@rlippmann/context-compiler';

export interface ApplyDirectiveResponse extends Record<string, unknown> {
  decision: {
    kind: Decision['kind'];
    prompt_to_user: string | null;
    state: EngineState | null;
  };
}

export interface GetStateResponse extends Record<string, unknown> {
  state: EngineState;
}

export interface ExportCheckpointResponse extends Record<string, unknown> {
  checkpoint: EngineCheckpoint;
}

export class ContextCompilerService {
  private readonly engine = createEngine();

  applyDirective(input: string): ApplyDirectiveResponse {
    const decision = this.engine.step(input);
    return {
      decision: {
        kind: decision.kind,
        prompt_to_user: decision.prompt_to_user,
        state: decision.state
      }
    };
  }

  getState(): GetStateResponse {
    return { state: this.engine.state };
  }

  exportCheckpoint(): ExportCheckpointResponse {
    return { checkpoint: this.engine.exportCheckpoint() };
  }

  importCheckpoint(checkpoint: EngineCheckpoint): GetStateResponse {
    this.engine.importCheckpoint(checkpoint);
    return { state: this.engine.state };
  }
}
