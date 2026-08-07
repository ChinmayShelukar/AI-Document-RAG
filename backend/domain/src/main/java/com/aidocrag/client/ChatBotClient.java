package com.aidocrag.client;

import java.util.Map;

public interface ChatBotClient {
    Map<String, String> askAgentAI(final String message);

    Map<String, Object> uploadDocument(final byte[] content, final String filename);
}
