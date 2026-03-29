package com.loanlens.dto;

import com.loanlens.model.StressScenario.RiskBand;
import com.loanlens.model.StressScenario.ScenarioType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class StressResponse {
    private ScenarioType scenarioType;
    private BigDecimal parameterDelta;
    private RiskBand riskBand;
    private String riskMessage;
    private BigDecimal currentMonthlyEmi;
    private BigDecimal projectedMonthlyEmi;
    private BigDecimal availableAfterEmi;
    private BigDecimal projectedAvailableAfterEmi;
    private BigDecimal breachThreshold;
    private boolean isAtRisk;
    private List<String> recommendations;
}
