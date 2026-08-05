package gustavo.company.client;

import java.util.Map;

public interface ChatBotClient {
    Map<String, String> askAgentAI(final String message);
}
