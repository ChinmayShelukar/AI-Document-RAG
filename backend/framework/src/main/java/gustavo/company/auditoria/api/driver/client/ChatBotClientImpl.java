package gustavo.company.auditoria.api.driver.client;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
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
}
