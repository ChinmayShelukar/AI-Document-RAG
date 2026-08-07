package com.aidocrag.client;

import java.util.Map;

public interface ChatBotClient {
    Map<String, Object> askAgentAI(final String message, final Integer topK,
            final String model, final Double confidenceThreshold);

    Map<String, Object> uploadDocument(final byte[] content, final String filename,
            final Integer chunkSize, final Integer chunkOverlap);
}
