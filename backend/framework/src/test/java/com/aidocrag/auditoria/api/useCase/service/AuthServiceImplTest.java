package com.aidocrag.auditoria.api.useCase.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.aidocrag.entity.UserDomain;
import com.aidocrag.exception.Conflict;
import com.aidocrag.exception.Unauthorized;
import com.aidocrag.repository.UserRepository;
import com.aidocrag.utils.JWTUtils;

/**
 * Unit tests for the authentication logic — login, registration (incl. the
 * duplicate-email guard), and isAuth. All collaborators are mocked so these run
 * fast with no DB or network.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private JWTUtils jwtUtils;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private AuthServiceImpl authService;

    private UserDomain sampleUser(UUID id) {
        return new UserDomain(id, "Jane", "jane@demo.com", "hashed", LocalDateTime.now());
    }

    // --- login ---

    @Test
    void login_returnsToken_whenCredentialsValid() {
        UserDomain user = sampleUser(UUID.randomUUID());
        when(userRepository.findByEmail("jane@demo.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pw", "hashed")).thenReturn(true);
        when(jwtUtils.generateUserToken(user)).thenReturn("jwt-token");

        assertThat(authService.login("jane@demo.com", "pw")).isEqualTo("jwt-token");
    }

    @Test
    void login_throwsUnauthorized_whenEmailUnknown() {
        when(userRepository.findByEmail("ghost@demo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("ghost@demo.com", "pw"))
                .isInstanceOf(Unauthorized.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_throwsUnauthorized_whenPasswordWrong() {
        UserDomain user = sampleUser(UUID.randomUUID());
        when(userRepository.findByEmail("jane@demo.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("jane@demo.com", "wrong"))
                .isInstanceOf(Unauthorized.class)
                .hasMessage("Invalid credentials");
        // never mints a token on a bad password
        verify(jwtUtils, never()).generateUserToken(any());
    }

    // --- register ---

    @Test
    void register_savesAndReturnsToken_whenEmailNew() {
        when(userRepository.findByEmail("new@demo.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pw")).thenReturn("hashed");
        UserDomain saved = sampleUser(UUID.randomUUID());
        when(userRepository.save(any(UserDomain.class))).thenReturn(saved);
        when(jwtUtils.generateUserToken(saved)).thenReturn("jwt-token");

        assertThat(authService.register("New", "new@demo.com", "pw")).isEqualTo("jwt-token");
        verify(userRepository).save(any(UserDomain.class));
    }

    @Test
    void register_throwsConflict_andDoesNotSave_whenEmailExists() {
        when(userRepository.findByEmail("dup@demo.com"))
                .thenReturn(Optional.of(sampleUser(UUID.randomUUID())));

        assertThatThrownBy(() -> authService.register("Dup", "dup@demo.com", "pw"))
                .isInstanceOf(Conflict.class)
                .hasMessage("An account with this email already exists.");
        // the guard must prevent the insert (no DB unique-constraint 500)
        verify(userRepository, never()).save(any());
    }

    // --- isAuth ---

    @Test
    void isAuth_returnsUsername_whenUserExists() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.of(sampleUser(id)));

        assertThat(authService.isAuth(id))
                .containsEntry("message", "User is authenticated")
                .containsEntry("username", "Jane");
    }

    @Test
    void isAuth_throwsUnauthorized_whenUserMissing() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.isAuth(id)).isInstanceOf(Unauthorized.class);
    }
}
