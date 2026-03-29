package com.loanlens.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loanlens.dto.*;
import com.loanlens.service.AuthService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController — REST layer tests")
class AuthControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockBean AuthService authService;

    private static final AuthResponse MOCK_RESPONSE = AuthResponse.builder()
        .accessToken("test.jwt.token").refreshToken("refresh.token")
        .tokenType("Bearer").expiresIn(900000L)
        .userId(UUID.randomUUID().toString()).name("Test User").email("test@test.com")
        .build();

    @Test
    @DisplayName("POST /api/auth/register — 201 with valid request")
    void register_valid_returns201() throws Exception {
        when(authService.register(any())).thenReturn(MOCK_RESPONSE);

        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new RegisterRequest() {{
                    setName("Test User"); setEmail("test@test.com"); setPassword("Password123!");
                }})))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accessToken").value("test.jwt.token"))
            .andExpect(jsonPath("$.name").value("Test User"));
    }

    @Test
    @DisplayName("POST /api/auth/register — 400 with invalid email")
    void register_invalidEmail_returns400() throws Exception {
        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"email\":\"not-an-email\",\"password\":\"Pass123!\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register — 400 with short password")
    void register_shortPassword_returns400() throws Exception {
        mvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"abc\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login — 200 with valid credentials")
    void login_valid_returns200() throws Exception {
        when(authService.login(any())).thenReturn(MOCK_RESPONSE);

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@test.com\",\"password\":\"Password123!\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/auth/login — 401 with wrong credentials")
    void login_wrongCredentials_returns401() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("Invalid credentials"));

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@test.com\",\"password\":\"WrongPass!\"}"))
            .andExpect(status().isUnauthorized());
    }
}
