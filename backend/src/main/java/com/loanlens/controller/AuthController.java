package com.loanlens.controller;

import com.loanlens.dto.*;
import com.loanlens.service.AuthService;
import com.loanlens.service.PasswordResetService;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send password reset link to registered email")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody PasswordResetRequest req) {
        passwordResetService.sendResetLink(req.getEmail());
        return ResponseEntity.ok(Map.of("message",
            "If that email is registered, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from email")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody NewPasswordRequest req) {
        passwordResetService.resetPassword(req.getToken(), req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}