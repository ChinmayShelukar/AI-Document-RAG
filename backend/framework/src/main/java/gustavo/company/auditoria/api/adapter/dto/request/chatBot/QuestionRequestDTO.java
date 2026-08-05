package gustavo.company.auditoria.api.adapter.dto.request.chatBot;

import jakarta.validation.constraints.NotBlank;

public record QuestionRequestDTO(
        @NotBlank(message = "message cannot be empty.") String message) {

}
