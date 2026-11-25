import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeedbackImport } from './feedbackImport.js';
const record = { id: 'msg-1', rating: 'down', prompt: 'Where is my order?', response: 'I do not know.', timestamp: '2026-11-25T12:00:00Z' };
const json = feedback => JSON.stringify({ version: 1, feedback });
test('normalizes imported ratings and preserves linked messages', () => {
  const [item] = parseFeedbackImport(json([record]));
  assert.equal(item.sentiment, 'negative');
  assert.equal(item.prompt, record.prompt);
  assert.equal(item.response, record.response);
});
test('rejects malformed, duplicate and unsupported data', () => {
  assert.throws(() => parseFeedbackImport('oops'), /valid JSON/);
  assert.throws(() => parseFeedbackImport(json([record, record])), /duplicate/);
  assert.throws(() => parseFeedbackImport(json([{ ...record, rating: 'meh' }])), /rating/);
  assert.throws(() => parseFeedbackImport(json([{ ...record, timestamp: 'yesterday' }])), /timestamp/);
  assert.throws(() => parseFeedbackImport(JSON.stringify({ version: 2, feedback: [record] })), /version/);
  assert.throws(() => parseFeedbackImport(json([])), /between/);
});
test('rejects oversized input and invalid comments', () => {
  assert.throws(() => parseFeedbackImport(json([{ ...record, comment: 42 }])), /comment/);
  assert.throws(() => parseFeedbackImport(' '.repeat(1_000_001)), /1 MB/);
});
