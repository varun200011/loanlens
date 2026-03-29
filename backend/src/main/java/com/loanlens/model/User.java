package com.loanlens.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(precision = 15, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(precision = 15, scale = 2)
    private BigDecimal monthlyExpenses;

    @Column(precision = 15, scale = 2)
    private BigDecimal monthlySipCommitment;

    @Column(precision = 15, scale = 2)
    private BigDecimal emergencyBufferTarget;

    private Integer dependents;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Loan> loans;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}