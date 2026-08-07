package com.aidocrag.repository;

import java.util.Optional;
import java.util.UUID;

import com.aidocrag.entity.UserDomain;

public interface UserRepository {
    UserDomain save(UserDomain user);

    Optional<UserDomain> findByEmail(String email);

    Optional<UserDomain> findByName(String username);

    Optional<UserDomain> findById(UUID userId);
}
