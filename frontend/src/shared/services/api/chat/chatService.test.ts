import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the axios instance the service imports. Must be declared before importing
// the service (vi.mock is hoisted).
vi.mock("../config/axios.config", () => ({
  api: { post: vi.fn() },
}));

import { chatService } from "./chatService";
import { api } from "../config/axios.config";

const mockedPost = api.post as unknown as ReturnType<typeof vi.fn>;

describe("chatService.ask", () => {
  beforeEach(() => mockedPost.mockReset());

  it("posts to the agent endpoint and returns the parsed body", async () => {
    const body = {
      answer: "42",
      sources: [{ text: "ctx", score: 0.9, file: "doc.txt" }],
      tokens: { prompt: 10, completion: 2, embedding: 1 },
    };
    mockedPost.mockResolvedValue({ data: body });

    const res = await chatService.ask({
      message: "q",
      topK: 3,
      model: "llama-3.1-8b-instant",
      confidenceThreshold: 0.5,
    });

    expect(res).toEqual(body);
    const [url, payload] = mockedPost.mock.calls[0];
    expect(url).toBe("/chat-bot/ask/agent");
    // all tuning params are forwarded
    expect(payload).toMatchObject({
      message: "q",
      topK: 3,
      model: "llama-3.1-8b-instant",
      confidenceThreshold: 0.5,
    });
  });
});

describe("chatService.upload", () => {
  beforeEach(() => mockedPost.mockReset());

  it("sends multipart form with chunk params and the Content-Type override", async () => {
    mockedPost.mockResolvedValue({ data: { filename: "doc.txt", chunks: 3 } });
    const file = new File(["hello"], "doc.txt", { type: "text/plain" });

    const res = await chatService.upload(file, 300, 30);

    expect(res).toEqual({ filename: "doc.txt", chunks: 3 });
    const [url, form, config] = mockedPost.mock.calls[0];
    expect(url).toBe("/documents/upload");
    expect(form).toBeInstanceOf(FormData);
    expect((form as FormData).get("chunkSize")).toBe("300");
    expect((form as FormData).get("chunkOverlap")).toBe("30");
    // the multipart-boundary fix: Content-Type must be undefined so the browser sets it
    expect(config?.headers?.["Content-Type"]).toBeUndefined();
  });

  it("omits chunk params when not provided", async () => {
    mockedPost.mockResolvedValue({ data: { filename: "d.txt", chunks: 1 } });
    const file = new File(["x"], "d.txt", { type: "text/plain" });

    await chatService.upload(file);

    const [, form] = mockedPost.mock.calls[0];
    expect((form as FormData).has("chunkSize")).toBe(false);
    expect((form as FormData).has("chunkOverlap")).toBe(false);
  });
});
