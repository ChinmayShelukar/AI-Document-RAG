package gustavo.company.auditoria.api.driver.client;

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

import gustavo.company.client.ChatBotClient;

@Service
public class ChatBotClientImpl implements ChatBotClient {

    private final String ragApiUrl;
    private final RestTemplate rest;

    public ChatBotClientImpl(@Value("${rag.api.url}") String ragApiUrl, RestTemplate rest) {
        this.ragApiUrl = ragApiUrl;
        this.rest = rest;
    }

    @Override
    public Map<String, String> askAgentAI(final String message) {
        Map<String, String> req = Map.of("message", message);
        Map<String, String> answer = rest.postForObject(ragApiUrl + "/agent/respond", req, Map.class);
        return answer;
    }

    @Override
    public Map<String, Object> uploadDocument(final byte[] content, final String filename) {
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

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        Map<String, Object> result = rest.postForObject(ragApiUrl + "/documents/ingest", request, Map.class);
        return result;
    }
}
