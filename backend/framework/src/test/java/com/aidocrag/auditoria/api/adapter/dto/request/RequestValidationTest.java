package com.aidocrag.auditoria.api.adapter.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.aidocrag.auditoria.api.adapter.dto.request.auth.LoginRequestDTO;
import com.aidocrag.auditoria.api.adapter.dto.request.auth.RegisterRequestDTO;
import com.aidocrag.auditoria.api.adapter.dto.request.chatBot.QuestionRequestDTO;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

/**
 * Validation tests for request DTOs — confirm the Bean Validation annotations
 * actually reject bad input (empty fields, malformed email, short password).
 */
class RequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    private <T> boolean hasViolationOn(Set<ConstraintViolation<T>> v, String field) {
        return v.stream().anyMatch(c -> c.getPropertyPath().toString().equals(field));
    }

    // --- RegisterRequestDTO ---

    @Test
    void register_valid_hasNoViolations() {
        var dto = new RegisterRequestDTO("Jane", "jane@demo.com", "password123");
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void register_blankName_isRejected() {
        var dto = new RegisterRequestDTO("", "jane@demo.com", "password123");
        assertThat(hasViolationOn(validator.validate(dto), "name")).isTrue();
    }

    @Test
    void register_malformedEmail_isRejected() {
        var dto = new RegisterRequestDTO("Jane", "not-an-email", "password123");
        assertThat(hasViolationOn(validator.validate(dto), "email")).isTrue();
    }

    @Test
    void register_shortPassword_isRejected() {
        var dto = new RegisterRequestDTO("Jane", "jane@demo.com", "short");
        assertThat(hasViolationOn(validator.validate(dto), "password")).isTrue();
    }

    // --- LoginRequestDTO ---

    @Test
    void login_valid_hasNoViolations() {
        var dto = new LoginRequestDTO("jane@demo.com", "password123");
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void login_blankEmail_isRejected() {
        var dto = new LoginRequestDTO("", "password123");
        assertThat(hasViolationOn(validator.validate(dto), "email")).isTrue();
    }

    // --- QuestionRequestDTO ---

    @Test
    void question_valid_hasNoViolations() {
        var dto = new QuestionRequestDTO("What is the revenue?", 5, "llama-3.1-8b-instant", 0.3);
        assertThat(validator.validate(dto)).isEmpty();
    }

    @Test
    void question_blankMessage_isRejected() {
        var dto = new QuestionRequestDTO("   ", null, null, null);
        assertThat(hasViolationOn(validator.validate(dto), "message")).isTrue();
    }

    @Test
    void question_tuningParamsOptional_nullsAreValid() {
        // topK/model/confidenceThreshold are optional — nulls must not trip validation
        var dto = new QuestionRequestDTO("hello", null, null, null);
        assertThat(validator.validate(dto)).isEmpty();
    }
}
