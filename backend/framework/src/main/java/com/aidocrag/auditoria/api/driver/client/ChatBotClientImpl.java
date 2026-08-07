package com.aidocrag.auditoria.api.driver.client;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.aidocrag.client.ChatBotClient;

@Service
public class ChatBotClientImpl implements ChatBotClient {

    private final String ragApiUrl;
    private final RestTemplate rest;

    public ChatBotClientImpl(@Value("${rag.api.url}") String ragApiUrl, RestTemplate rest) {
        this.ragApiUrl = ragApiUrl;
        this.rest = rest;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> askAgentAI(final String message, final Integer topK,
            final String model, final Double confidenceThreshold) {
        // Only send params that were provided; the RAG server applies its own
        // defaults for anything omitted.
        Map<String, Object> req = new HashMap<>();
        req.put("message", message);
        if (topK != null) req.put("top_k", topK);
        if (model != null && !model.isBlank()) req.put("model", model);
        if (confidenceThreshold != null) req.put("confidence_threshold", confidenceThreshold);
        return rest.postForObject(ragApiUrl + "/agent/respond", req, Map.class);
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> uploadDocument(final byte[] content, final String filename,
            final Integer chunkSize, final Integer chunkOverlap) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // ByteArrayResource with an overridden filename so the RAG server sees the
        // original name (and its extension) on the multipart "file" part.
        ByteArrayResource resource = new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);
        if (chunkSize != null) body.add("chunk_size", chunkSize);
        if (chunkOverlap != null) body.add("chunk_overlap", chunkOverlap);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        return rest.postForObject(ragApiUrl + "/documents/ingest", request, Map.class);
    }
}
