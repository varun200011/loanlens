package com.loanlens.service;

import com.loanlens.dto.*;
import com.loanlens.exception.ConflictException;
import com.loanlens.model.User;
import com.loanlens.repository.UserRepository;
import com.loanlens.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered: " + req.getEmail());
        }
        var user = User.builder()
            .name(req.getName())
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .monthlyIncome(req.getMonthlyIncome())
            .monthlyExpenses(req.getMonthlyExpenses())
            .monthlySipCommitment(req.getMonthlySipCommitment())
            .emergencyBufferTarget(req.getEmergencyBufferTarget())
            .dependents(req.getDependents())
            .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        // ── Step 1: Check if email exists FIRST ──
        // This gives a clear "user not found" error vs "wrong password"
        boolean userExists = userRepository.existsByEmail(req.getEmail());
        if (!userExists) {
            throw new BadCredentialsException("USER_NOT_FOUND");
        }

        // ── Step 2: Authenticate — throws BadCredentialsException if wrong password ──
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("WRONG_PASSWORD");
        }

        var user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new BadCredentialsException("USER_NOT_FOUND"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
            .accessToken(jwtService.generateAccessToken(user.getId(), user.getEmail()))
            .refreshToken(jwtService.generateRefreshToken(user.getId(), user.getEmail()))
            .tokenType("Bearer")
            .expiresIn(jwtService.getAccessTokenExpiry())
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .build();
    }
}