package gustavo.company.auditoria.api.driver.client;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gustavo.company.auditoria.api.entity.User;


public interface UserRepositoryOrm extends  JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);

}
