package com.loanlens.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reports")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String s3Key;
    private String signedUrl;
    private String healthGrade;
    private BigDecimal dtiRatio;

    @CreationTimestamp
    private LocalDateTime generatedAt;
}
