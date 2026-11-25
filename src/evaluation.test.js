import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCase, runEvaluation, passRate } from './evaluation.js';

test('checks phrases without case sensitivity and requires all checks', () => {
  assert.equal(evaluateCase({ id: 'a', response: 'Hello World', checks: ['hello', 'WORLD'] }).passed, true);
  assert.equal(evaluateCase({ id: 'b', response: 'Hello', checks: ['hello', 'world'] }).passed, false);
});
test('runs all cases and calculates a rounded pass rate', () => {
  const run = runEvaluation([{ id: 'a', response: 'yes', checks: ['yes'] }, { id: 'b', response: 'no', checks: ['yes'] }], '2026-01-01T00:00:00Z');
  assert.equal(run.results.length, 2); assert.equal(passRate(run), 50); assert.equal(passRate({ results: [] }), 0);
});
