import { cases } from './data.js';

// This is intentionally a transparent baseline, not an LLM judge. A case
// passes only when every required phrase occurs in the sample response.
export function evaluateCase(testCase) {
  const normalized = testCase.response.toLocaleLowerCase();
  const checks = testCase.checks.map(phrase => ({ phrase, passed: normalized.includes(phrase.toLocaleLowerCase()) }));
  return { id: testCase.id, passed: checks.every(check => check.passed), checks };
}
export function runEvaluation(testCases = cases, date = new Date().toISOString()) {
  const results = testCases.map(evaluateCase);
  return { id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date, results };
}
export function passRate(run) {
  return run?.results?.length ? Math.round(run.results.filter(result => result.passed).length / run.results.length * 100) : 0;
}
// Older runs use the same case IDs and scoring model so the trend can be
// compared with a newly run evaluation. Dates are relative to today.
function seededRun(daysAgo, failedIds) {
  const date = new Date(); date.setDate(date.getDate() - daysAgo); date.setHours(10, 30, 0, 0);
  return { id: `sample-${daysAgo}`, date: date.toISOString(), sample: true, results: cases.map(item => ({ id: item.id, passed: !failedIds.includes(item.id), checks: [] })) };
}
export const seedRuns = [seededRun(12, ['TC-002', 'TC-004', 'TC-008']), seededRun(10, ['TC-004', 'TC-008']), seededRun(8, ['TC-002', 'TC-004']), seededRun(6, ['TC-004']), seededRun(4, ['TC-004', 'TC-007']), seededRun(2, ['TC-004']), seededRun(0, ['TC-004'])];
export const STORAGE_KEY = 'agenteval-runs-v1';
export function loadRuns() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.every(run => run && typeof run.id === 'string' && !Number.isNaN(Date.parse(run.date)) && Array.isArray(run.results) && run.results.every(result => typeof result.id === 'string' && typeof result.passed === 'boolean'))) return saved;
  } catch { /* Storage may be unavailable or contain old data. */ }
  return seedRuns;
}
