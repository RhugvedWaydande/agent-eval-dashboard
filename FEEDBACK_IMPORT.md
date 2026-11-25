# Import feedback

The dashboard can import a manually prepared JSON file. Imported feedback and demo feedback are kept separate; choose the source in the feedback inbox. This is **not a live connection** to AuraDesk.

## Important limitation

As of the AuraDesk version inspected on 2026-11-25, feedback and messages exist only in that page's React state. There is no export, shared storage, or API. **New chat or a page refresh removes that session's feedback.** The dashboard cannot automatically read it from another website or recover past sessions. To automate collection, AuraDesk must first be changed to explicitly export or persist consented feedback.

## Prepare a file

Use synthetic data or feedback you have permission to use. Remove customer names, contact information, card numbers, and other sensitive details before importing. Create a UTF-8 file named, for example, `feedback.json`:

```json
{
  "version": 1,
  "feedback": [
    {
      "id": "message-001",
      "rating": "down",
      "prompt": "Where is my order?",
      "response": "I couldn't find the order.",
      "timestamp": "2026-11-25T12:00:00Z",
      "comment": "The answer did not explain what to do next."
    }
  ]
}
```

Each record requires a unique `id`, `rating` (`up` or `down`), the customer `prompt`, the agent `response`, and an ISO 8601 `timestamp` with timezone. `comment` is optional. There may be 1–1,000 records, up to 5,000 characters per text field, and the whole file must be at most 1 MB. JSON quotes and escaped characters must be valid. Do not paste sensitive information.

## Import into AgentEval

1. Open **Feedback** and select **Import JSON**.
2. Choose the file or paste its contents, then select **Import feedback**. Errors explain what needs correcting.
3. The inbox switches to **Imported feedback**. Expand **View conversation** to see the linked prompt and response. Overview feedback metrics use the selected source.
4. Use the source dropdown to switch back to demo data. **Remove import** deletes the imported data from this browser. Importing another file replaces the previous import, rather than merging it.

The import is stored in this browser's localStorage only; it is not encrypted or shared across browsers, devices, or users. Anyone with access to this browser profile may be able to read it. Clearing site data removes it. Do not use this as a secure production store.
