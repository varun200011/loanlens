package com.loanlens.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "stress_scenarios")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StressScenario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private ScenarioType scenarioType;

    private BigDecimal parameterDelta;

    @Column(columnDefinition = "TEXT")
    private String resultJson;

    @Enumerated(EnumType.STRING)
    private RiskBand riskBand;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ScenarioType { INCOME_DROP, RATE_HIKE, EXPENSE_SHOCK, JOB_LOSS }
    public enum RiskBand { GREEN, AMBER, RED, CRITICAL }
}
