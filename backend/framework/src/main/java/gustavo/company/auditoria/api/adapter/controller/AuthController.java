package gustavo.company.auditoria.api.adapter.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gustavo.company.auditoria.api.adapter.dto.request.auth.LoginRequestDTO;
import gustavo.company.auditoria.api.adapter.dto.request.auth.RegisterRequestDTO;
import gustavo.company.service.AuthService;
import gustavo.company.utils.JWTUtils;
import jakarta.servlet.http.HttpServletRequest;
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
    private final JWTUtils jwtUtils;

    // Cookie flags are env-driven so the same build works locally (Lax/insecure)
    // and cross-origin over HTTPS in production (None/secure).
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    /**
     * Endpoint to log in a user.
     * Receives email and password, authenticates the user, and returns a JWT token
     * via cookie.
     *
     * @param loginRequestImpl Login data containing email and password.
     * @param response         HttpServletResponse used to set the cookie with the
     *                         JWT token.
     * @return HTTP response with success message.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid LoginRequestDTO loginRequestImpl) {
        log.info("Login attempt for email: {}", loginRequestImpl.email());

        String token = authService.login(loginRequestImpl.email(), loginRequestImpl.password());

        log.info("Login successful for email: {}", loginRequestImpl.email());
        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, buildTokenCookie(token).toString())
                .body("User logged in successfully");
    }

    /**
     * Endpoint to check if the user is authenticated.
     * Extracts the JWT token from the cookie, validates it, and checks if the user
     * exists.
     *
     * @param httpRequest HTTP request containing cookies.
     * @return HTTP response indicating whether the user is authenticated.
     */
    @GetMapping("/isAuth")
    public ResponseEntity<Map<String, Object>> isAuth(HttpServletRequest httpRequest) {

        UUID userId = jwtUtils.getUserIdFromCookie(httpRequest);
        log.info("Checking authentication for user ID: {}", userId);

        Map<String, Object> response = authService.isAuth(userId); // throws exception if not found or invalid

        log.info("User is authenticated. ID: {}", userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Endpoint to register a new user.
     * Validates the verification code, creates the user, and returns a JWT token
     * via cookie.
     *
     * @param registerRequestImpl Registration data containing email, code, and
     *                            avatar URL.
     * @param response            HttpServletResponse used to set the cookie with
     *                            the JWT token.
     * @return HTTP response with success message.
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterRequestDTO registerRequestImpl) {
        log.info("Registration attempt for email: {}", registerRequestImpl.email());

        String token = authService.register(
                registerRequestImpl.name(),
                registerRequestImpl.email(),
                registerRequestImpl.password());

        log.info("Registration successful for email: {}", registerRequestImpl.email());
        return ResponseEntity.status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, buildTokenCookie(token).toString())
                .body("User registered successfully");
    }

    /**
     * Builds the JWT cookie. Uses Spring's ResponseCookie so we can set SameSite
     * (the Servlet Cookie API cannot), required for cross-origin HTTPS deploys.
     *
     * @param token JWT token to be stored in the cookie.
     * @return the configured ResponseCookie.
     */
    private ResponseCookie buildTokenCookie(String token) {
        return ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(60 * 60) // 1 hour
                .build();
    }
}