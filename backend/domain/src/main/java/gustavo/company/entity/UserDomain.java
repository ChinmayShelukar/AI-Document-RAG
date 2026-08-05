package gustavo.company.entity;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDomain(
        UUID id,
        String name,
        String email,
        String password,
        LocalDateTime createdAt) {
}
