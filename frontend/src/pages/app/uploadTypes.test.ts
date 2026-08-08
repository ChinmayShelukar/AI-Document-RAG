import { describe, it, expect } from "vitest";
import { ACCEPTED, FILE_CHIPS, FILE_TYPES, uploadErrorMessage } from "./uploadTypes";

// Mirror of backend/rag-server/agent.py SUPPORTED_EXTS. If the two lists drift,
// the frontend advertises types the server rejects (or vice-versa) — the exact
// bug class behind broken uploads. Keep both in sync; this test fails loudly if
// FILE_TYPES changes without updating this mirror (and the reverse in agent.py).
const BACKEND_SUPPORTED_EXTS = ["pdf", "docx", "txt", "md", "csv", "pptx", "xlsx"];

describe("file type lists stay in sync", () => {
  it("ACCEPTED and FILE_CHIPS derive from FILE_TYPES (no drift)", () => {
    const exts = Object.keys(FILE_TYPES);
    // dropzone accepts exactly the MIME types we know about
    expect(Object.keys(ACCEPTED).sort()).toEqual(Object.values(FILE_TYPES).sort());
    // chips advertise exactly what we accept — never over-advertise
    expect(FILE_CHIPS.sort()).toEqual(exts.map((e) => e.toUpperCase()).sort());
  });

  it("matches the backend SUPPORTED_EXTS (frontend can't advertise what the server rejects)", () => {
    expect(new Set(Object.keys(FILE_TYPES))).toEqual(new Set(BACKEND_SUPPORTED_EXTS));
  });
});

describe("uploadErrorMessage", () => {
  it("maps 413 to the size message", () => {
    expect(uploadErrorMessage({ response: { status: 413 } })).toBe(
      "Upload failed: File exceeds the 10MB limit."
    );
  });

  it("surfaces the server's detail (e.g. real RAG failure, not a generic mask)", () => {
    const err = { response: { status: 500, data: { detail: "Could not extract text from x.pdf" } } };
    expect(uploadErrorMessage(err)).toBe("Upload failed: Could not extract text from x.pdf");
  });

  it("falls back to message, then generic", () => {
    expect(uploadErrorMessage({ response: { data: { message: "boom" } } })).toBe(
      "Upload failed: boom"
    );
    expect(uploadErrorMessage(new Error("network"))).toBe(
      "Failed to upload the document. Please try again."
    );
  });
});
