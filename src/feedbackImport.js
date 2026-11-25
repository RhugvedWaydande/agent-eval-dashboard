// The import format is intentionally small and versioned. It is not a live
// AuraDesk integration: someone must explicitly supply this JSON file.
export const FEEDBACK_STORAGE_KEY = 'agenteval-imported-feedback-v1';
export const MAX_IMPORT_BYTES = 1_000_000;
const MAX_RECORDS = 1000;
const MAX_TEXT = 5000;

export function parseFeedbackImport(text) {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) throw new Error('The file must be 1 MB or smaller.');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('The file is not valid JSON.'); }
  if (!data || data.version !== 1 || !Array.isArray(data.feedback)) throw new Error('Expected an object with version: 1 and a feedback array.');
  if (!data.feedback.length || data.feedback.length > MAX_RECORDS) throw new Error('Include between 1 and 1,000 feedback records.');
  const ids = new Set();
  return data.feedback.map((record, index) => {
    const label = `Record ${index + 1}`;
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(`${label} must be an object.`);
    const required = ['id', 'rating', 'prompt', 'response', 'timestamp'];
    for (const field of required) {
      if (typeof record[field] !== 'string' || !record[field].trim() || record[field].length > MAX_TEXT) throw new Error(`${label}: ${field} must be a non-empty string of at most ${MAX_TEXT} characters.`);
    }
    const id = record.id.trim();
    if (ids.has(id)) throw new Error(`${label}: duplicate id "${id}".`);
    ids.add(id);
    if (!['up', 'down'].includes(record.rating)) throw new Error(`${label}: rating must be "up" or "down".`);
    // Require an explicit UTC offset so dates do not silently change timezone.
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(record.timestamp) || Number.isNaN(Date.parse(record.timestamp))) throw new Error(`${label}: timestamp must be an ISO 8601 date with a timezone, such as 2026-11-25T12:00:00Z.`);
    if (record.comment !== undefined && (typeof record.comment !== 'string' || record.comment.length > MAX_TEXT)) throw new Error(`${label}: comment must be a string of at most ${MAX_TEXT} characters.`);
    return { id, sentiment: record.rating === 'up' ? 'positive' : 'negative', topic: 'Imported feedback', prompt: record.prompt.trim(), response: record.response.trim(), comment: record.comment?.trim() || '', timestamp: record.timestamp };
  });
}

// Store the original validated file so it can be revalidated after a reload.
export function loadImportedFeedback() {
  try {
    const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return saved ? parseFeedbackImport(saved) : null;
  } catch { return null; }
}
