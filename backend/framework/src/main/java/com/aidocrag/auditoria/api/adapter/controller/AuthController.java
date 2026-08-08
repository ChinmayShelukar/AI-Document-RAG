package com.aidocrag.auditoria.api.adapter.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aidocrag.auditoria.api.adapter.dto.request.auth.LoginRequestDTO;
import com.aidocrag.auditoria.api.adapter.dto.request.auth.RegisterRequestDTO;
import com.aidocrag.exception.Unauthorized;
import com.aidocrag.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller responsible for authentication-related endpoints,
 * such as login, registration, and token validation.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Log in a user. Returns the JWT in the response body so the SPA can store it
     * and send it as an Authorization: Bearer header (works cross-site, unlike a
     * third-party cookie).
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody @Valid LoginRequestDTO loginRequestImpl) {
        log.info("Login attempt for email: {}", loginRequestImpl.email());

        String token = authService.login(loginRequestImpl.email(), loginRequestImpl.password());

        log.info("Login successful for email: {}", loginRequestImpl.email());
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("token", token));
    }

    /**
     * Check if the caller is authenticated. The SecurityFilter has already
     * validated the Bearer token and populated the SecurityContext; read the user
     * id from there.
     */
    @GetMapping("/isAuth")
    public ResponseEntity<Map<String, Object>> isAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Anonymous requests (no valid Bearer token) have an AnonymousAuthenticationToken
        // whose name is "anonymousUser" — treat anything that isn't a real UUID principal
        // as unauthenticated rather than letting UUID.fromString throw a 500.
        if (auth == null || !auth.isAuthenticated()
                || auth instanceof AnonymousAuthenticationToken
                || auth.getName() == null) {
            throw new Unauthorized("User not authenticated");
        }
        final UUID userId;
        try {
            userId = UUID.fromString(auth.getName());
        } catch (IllegalArgumentException e) {
            throw new Unauthorized("User not authenticated");
        }
        log.info("Checking authentication for user ID: {}", userId);

        Map<String, Object> response = authService.isAuth(userId);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Register a new user. Like login, returns the JWT in the body.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody @Valid RegisterRequestDTO registerRequestImpl) {
        log.info("Registration attempt for email: {}", registerRequestImpl.email());

        String token = authService.register(
                registerRequestImpl.name(),
                registerRequestImpl.email(),
                registerRequestImpl.password());

        log.info("Registration successful for email: {}", registerRequestImpl.email());
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("token", token));
    }
}