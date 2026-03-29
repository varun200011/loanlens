package com.loanlens.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private String userId;
    private String name;
    private String email;
}
