package gustavo.company.auditoria.api.useCase.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gustavo.company.auditoria.api.adapter.mapper.UserMapper;
import gustavo.company.auditoria.api.entity.User;
import gustavo.company.entity.UserDomain;
import gustavo.company.exception.InternalServerError;
import gustavo.company.exception.NotFound;
import gustavo.company.exception.Unauthorized;
import gustavo.company.repository.UserRepository;
import gustavo.company.service.AuthService;
import gustavo.company.utils.JWTUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of the authentication service responsible for user login and
 * registration,
 * including credential validation, email code verification, and sending
 * confirmation messages.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JWTUtils jwtUtils;

    private final PasswordEncoder passwordEncoder;

    @Override
    public String login(final String email, final String password) {
        log.info("Attempting login for email: {}", email);

        UserDomain record = this.userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found for email: {}", email);
                    return new NotFound("Invalid credentials");
                });

        final boolean passwordMatched = passwordEncoder.matches(password, record.password());

        if (!passwordMatched) {
            log.warn("Invalid password attempt for user: {}", email);
            throw new NotFound("Invalid credentials");
        }

        final String token = generateToken(record);

        log.info("Login successful for email: {}", email);
        return token;
    }

    @Override
    @Transactional
    public String register(final String name, final String email, final String password) {
        log.info("Starting registration for email: {}", email);

        final User user = new User(
                null,
                name,
                email,
                passwordEncoder.encode(password),
                LocalDateTime.now());

        final UserDomain savedUser = userRepository.save(UserMapper.toDomainComplete(user));

        final String token = generateToken(savedUser);
        log.info("Registration successful for email: {}", email);
        return token;
    }

    @Override
    public Map<String, Object> isAuth(final UUID userId) {
        UserDomain user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found or not authenticated. userId: {}", userId);
                    return new Unauthorized("User not authenticated");
                });

        final Map<String, Object> response = new HashMap<>();
        response.put("message", "User is authenticated");
        response.put("username", user.name());

        return response;
    }

    // Helpers

    private String generateToken(final UserDomain user) {
        final String token = jwtUtils.generateUserToken(user);
        if (token == null || token.isBlank()) {
            throw new InternalServerError("Invalid token");
        }
        return token;
    }
}