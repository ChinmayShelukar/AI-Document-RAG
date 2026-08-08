// Single source of truth for which document types the app accepts, plus the
// upload-error message picker. Lives here (not inline in ChatBot) so it's unit-
// testable and so the dropzone `accept` map, the advertised chips, and the
// backend SUPPORTED_EXTS can't silently drift apart — that drift was a real bug.

// ext -> MIME. Keep in lockstep with backend/rag-server/agent.py SUPPORTED_EXTS.
export const FILE_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

// react-dropzone `accept` shape: { mime: [".ext"] }
export const ACCEPTED: Record<string, string[]> = Object.fromEntries(
  Object.entries(FILE_TYPES).map(([ext, mime]) => [mime, [`.${ext}`]])
);

// Chips shown in the UI — derived from the same list so they can't over-advertise.
export const FILE_CHIPS = Object.keys(FILE_TYPES).map((e) => e.toUpperCase());

/** Pick the clearest upload-error message: server's specific reason first,
 *  413 → size, then any server detail/message, else a generic fallback. */
export function uploadErrorMessage(err: any): string {
  if (err?.response?.status === 413) return "Upload failed: File exceeds the 10MB limit.";
  const serverMsg = err?.response?.data?.detail || err?.response?.data?.message;
  return serverMsg
    ? `Upload failed: ${serverMsg}`
    : "Failed to upload the document. Please try again.";
}
