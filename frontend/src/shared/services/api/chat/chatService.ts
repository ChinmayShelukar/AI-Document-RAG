import { api } from "../config/axios.config";

export interface Source {
  text: string;
  score: number;
  file: string;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  embedding: number;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
  tokens: TokenUsage;
}

export interface AskParams {
  message: string;
  topK?: number;
  model?: string;
  confidenceThreshold?: number;
}

export interface UploadResponse {
  filename: string;
  chunks: number;
}

export const chatService = {
  ask: async (params: AskParams): Promise<AskResponse> => {
    const { data } = await api.post<AskResponse>("/chat-bot/ask/agent", params);
    return data;
  },

  upload: async (
    file: File,
    chunkSize?: number,
    chunkOverlap?: number
  ): Promise<UploadResponse> => {
    const form = new FormData();
    form.append("file", file);
    if (chunkSize != null) form.append("chunkSize", String(chunkSize));
    if (chunkOverlap != null) form.append("chunkOverlap", String(chunkOverlap));
    // Content-Type undefined lets the browser set the multipart boundary
    // (the axios default of application/json would break the upload).
    const { data } = await api.post<UploadResponse>("/documents/upload", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },
};
