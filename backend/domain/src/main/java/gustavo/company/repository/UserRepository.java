package gustavo.company.repository;

import java.util.Optional;
import java.util.UUID;

import gustavo.company.entity.UserDomain;

public interface UserRepository {
    UserDomain save(UserDomain user);

    Optional<UserDomain> findByEmail(String email);

    Optional<UserDomain> findByName(String username);

    Optional<UserDomain> findById(UUID userId);
}
