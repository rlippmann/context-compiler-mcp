#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEngine } from '@rlippmann/context-compiler';
import {
  preprocess_heuristic,
  validate_preprocessor_output,
  parse_preprocessor_output
} from '@rlippmann/context-compiler/experimental/preprocessor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const fixturePath = path.join(root, 'tests', 'fixtures', 'directive-generation-cases.json');

function loadFixture() {
  const raw = fs.readFileSync(fixturePath, 'utf8');
  return JSON.parse(raw);
}

function classifyFromPipeline(message) {
  const heuristic = preprocess_heuristic(message);

  if (heuristic.classification === 'no_directive') {
    return {
      pipeline_classification: 'do_not_call_apply_directive',
      canonical_directive: null,
      heuristic,
      validated: { classification: 'no_directive', output: null }
    };
  }

  if (heuristic.classification === 'unknown' || heuristic.output == null) {
    return {
      pipeline_classification: 'invalid_or_abstain',
      canonical_directive: null,
      heuristic,
      validated: { classification: 'unknown', output: null }
    };
  }

  const validated = validate_preprocessor_output(heuristic.output, { source_input: message });
  const parsed = parse_preprocessor_output(heuristic.output, { source_input: message });

  if (validated.classification === 'directive' && parsed != null) {
    return {
      pipeline_classification: 'call_apply_directive',
      canonical_directive: parsed,
      heuristic,
      validated
    };
  }

  return {
    pipeline_classification: 'invalid_or_abstain',
    canonical_directive: null,
    heuristic,
    validated
  };
}

function evalClarifyCase(testCase, pipeline) {
  const engine = createEngine();

  for (const input of testCase.prelude ?? []) {
    engine.step(input);
  }

  if (pipeline.pipeline_classification !== 'call_apply_directive' || pipeline.canonical_directive == null) {
    return {
      pass: false,
      reason: 'pipeline_did_not_produce_call',
      firstDecisionKind: null,
      followupDecisionKind: null
    };
  }

  const first = engine.step(pipeline.canonical_directive);
  const follow = engine.step(testCase.follow_up_message);

  const pass =
    first.kind === testCase.expected_first_decision_kind &&
    follow.kind === testCase.expected_follow_up_decision_kind;

  return {
    pass,
    reason: pass ? null : 'clarify_kind_mismatch',
    firstDecisionKind: first.kind,
    followupDecisionKind: follow.kind
  };
}

function main() {
  const fixture = loadFixture();
  const cases = fixture.cases;

  const results = [];
  const stats = {
    total: cases.length,
    pass: 0,
    fail: 0,
    false_positives: 0,
    false_negatives: 0,
    wrong_canonical: 0,
    by_expected: {
      call_apply_directive: 0,
      do_not_call_apply_directive: 0,
      clarify_follow_up: 0
    },
    by_outcome: {
      call_apply_directive: 0,
      do_not_call_apply_directive: 0,
      invalid_or_abstain: 0
    }
  };

  for (const testCase of cases) {
    stats.by_expected[testCase.classification] += 1;

    const pipeline = classifyFromPipeline(testCase.message);
    stats.by_outcome[pipeline.pipeline_classification] += 1;

    let pass = false;
    let failureKind = null;
    let clarifyEval = null;

    if (testCase.classification === 'call_apply_directive') {
      if (pipeline.pipeline_classification !== 'call_apply_directive') {
        failureKind = 'false_negative';
        stats.false_negatives += 1;
      } else if (pipeline.canonical_directive !== testCase.expected_input) {
        failureKind = 'wrong_canonical';
        stats.wrong_canonical += 1;
      } else {
        pass = true;
      }
    } else if (testCase.classification === 'do_not_call_apply_directive') {
      if (pipeline.pipeline_classification === 'call_apply_directive') {
        failureKind = 'false_positive';
        stats.false_positives += 1;
      } else {
        pass = true;
      }
    } else if (testCase.classification === 'clarify_follow_up') {
      if (pipeline.pipeline_classification !== 'call_apply_directive') {
        failureKind = 'false_negative';
        stats.false_negatives += 1;
      } else {
        clarifyEval = evalClarifyCase(testCase, pipeline);
        if (clarifyEval.pass) {
          pass = true;
        } else {
          failureKind = clarifyEval.reason;
        }
      }
    }

    if (pass) {
      stats.pass += 1;
    } else {
      stats.fail += 1;
    }

    results.push({
      id: testCase.id,
      expected: testCase.classification,
      message: testCase.message,
      pipeline_classification: pipeline.pipeline_classification,
      canonical_directive: pipeline.canonical_directive,
      expected_input: testCase.expected_input ?? null,
      pass,
      failure_kind: failureKind,
      heuristic_classification: pipeline.heuristic.classification,
      heuristic_output: pipeline.heuristic.output,
      validated_classification: pipeline.validated.classification,
      validated_output: pipeline.validated.output,
      clarify_eval: clarifyEval
    });
  }

  const highRiskFailures = results.filter(
    (r) => !r.pass && (r.failure_kind === 'false_positive' || r.failure_kind === 'wrong_canonical')
  );
  const missedCalls = results.filter((r) => !r.pass && r.failure_kind === 'false_negative');

  console.log('\nDirective Generation Eval Summary');
  console.log('================================');
  console.log(`Fixture: ${fixturePath}`);
  console.log(`Total: ${stats.total}`);
  console.log(`Pass: ${stats.pass}`);
  console.log(`Fail: ${stats.fail}`);
  console.log(`False positives (high risk): ${stats.false_positives}`);
  console.log(`False negatives: ${stats.false_negatives}`);
  console.log(`Wrong canonical directives: ${stats.wrong_canonical}`);
  console.log('');
  console.log('Expected classes:', stats.by_expected);
  console.log('Pipeline outcome classes:', stats.by_outcome);

  if (highRiskFailures.length > 0) {
    console.log('\nHigh-risk failures');
    for (const row of highRiskFailures.slice(0, 20)) {
      console.log(`- ${row.id}: expected=${row.expected} got=${row.pipeline_classification} canonical=${row.canonical_directive}`);
    }
  }

  if (missedCalls.length > 0) {
    console.log('\nFalse negatives (conservative misses)');
    for (const row of missedCalls.slice(0, 20)) {
      console.log(`- ${row.id}: expected call, got ${row.pipeline_classification} (${row.message})`);
    }
  }

  const claudeFailureReplay = [
    'Can you avoid peanuts?',
    'prohibit peanuts and use almonds',
    'set premise to concise replies',
    'He said "use docker".'
  ].map((message) => ({ message, ...classifyFromPipeline(message) }));

  console.log('\nObserved Claude-failure replay against heuristic+validation');
  for (const row of claudeFailureReplay) {
    console.log(
      `- ${row.message} => ${row.pipeline_classification}` +
        (row.canonical_directive ? ` (${row.canonical_directive})` : '')
    );
  }

  const outPath = path.join(root, 'tests', 'fixtures', 'directive-generation-eval.latest.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        summary: stats,
        high_risk_failures: highRiskFailures,
        false_negative_cases: missedCalls,
        claude_failure_replay: claudeFailureReplay,
        results
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  console.log(`\nWrote detailed report: ${outPath}`);

  if (stats.false_positives > 0 || stats.wrong_canonical > 0) {
    process.exitCode = 2;
  }
}

main();
