package com.aidocrag.auditoria.api.useCase.service.utils;



import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import com.aidocrag.entity.UserDomain;
import com.aidocrag.exception.JWTException;
import com.aidocrag.utils.JWTUtils;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility for creating, validating, and extracting data from JWT tokens.
 * Uses the Auth0 JWT library for cryptographic operations.
 */
@Component
@Slf4j
public class JWTUtilsImpl implements JWTUtils {

    private final Algorithm algorithm;
    private final String ISSUER;
    private final long EXPIRATION_HOURS;

    /**
     * Constructor that initializes the secret key, issuer, and token expiration
     * time.
     *
     * @param jwtSecret       secret used for HMAC256 token signature
     * @param issuer          JWT token issuer
     * @param expirationHours token validity in hours
     */
    public JWTUtilsImpl(
            @Value("${spring.security.jwt.password}") String jwtSecret,
            @Value("${spring.security.jwt.issuer}") String issuer,
            @Value("${spring.security.jwt.expiration-hours}") long expirationHours) {
        this.algorithm = Algorithm.HMAC256(jwtSecret);
        this.ISSUER = issuer;
        this.EXPIRATION_HOURS = expirationHours;
        log.info("JWTUtils initialized with issuer '{}' and expiration of {} hours", issuer, expirationHours);
    }

    /**
     * Generates a JWT token for the given user.
     *
     * @param user the user for whom the token will be generated
     * @return signed JWT token as a String
     * @throws JWTException if token creation fails
     */
    @Override
    public String generateUserToken(UserDomain user) {
        try {
            String token = JWT.create()
                    .withIssuer(this.ISSUER)
                    .withSubject(user.id().toString())
                    .withExpiresAt(this.generateExpirationDate())
                    .sign(this.algorithm);
            log.debug("JWT token generated for user {}", user.id());
            return token;
        } catch (JWTCreationException e) {
            log.error("Error generating JWT token for user {}", user.id(), e);
            throw new JWTException("Error while generating JWT token");
        }
    }

    /**
     * Validates the JWT token and extracts the user ID contained in it.
     *
     * @param token JWT token to be validated
     * @return user ID as a String if valid; null if invalid or expired
     */
    @Override
    public String validateAndExtractUserId(String token) {
        try {
            String userId = JWT.require(this.algorithm)
                    .withIssuer(this.ISSUER)
                    .build()
                    .verify(token)
                    .getSubject();
            log.debug("JWT token successfully validated for user {}", userId);
            return userId;
        } catch (JWTVerificationException e) {
            log.warn("Invalid or expired JWT token", e);
            return null;
        }
    }

    /**
     * Generates the token expiration date/time based on the current time plus the
     * configured duration.
     *
     * @return expiration instant of the token
     */
    private Instant generateExpirationDate() {
        return LocalDateTime.now()
                .plusHours(this.EXPIRATION_HOURS)
                .toInstant(ZoneOffset.of("-03:00"));
    }

   
}