package gustavo.company.auditoria.api.adapter.mapper;

import gustavo.company.auditoria.api.entity.User;
import gustavo.company.entity.UserDomain;


public class UserMapper {

    public static User toEntityBasic(UserDomain domain) {
        if (domain == null) return null;

        return new User(
                domain.id(),
                domain.name(),
                domain.email(),
                domain.password(),
                domain.createdAt()
        );
    }

    public static UserDomain toDomainBasic(User entity) {
        if (entity == null) return null;

        return new UserDomain(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPassword(),
                entity.getCreatedAt()
        );
    }

    public static User toEntityComplete(UserDomain domain) {
        if (domain == null) return null;

        return new User(
                domain.id(),
                domain.name(),
                domain.email(),
                domain.password(),
                domain.createdAt()
               
        );
    }

    public static UserDomain toDomainComplete(User entity) {
        if (entity == null) return null;

        return new UserDomain(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPassword(),
                entity.getCreatedAt()
               
        );
    }
}
