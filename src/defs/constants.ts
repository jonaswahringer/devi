/** Payloads larger than this use the blob store; smaller values stay in SQLite `inline_value`. */
export const INLINE_THRESHOLD_BYTES = 64 * 1024;
