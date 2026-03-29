package com.loanlens.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean used;
}
