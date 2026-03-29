package com.loanlens.dto;

import com.loanlens.model.StressScenario.ScenarioType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class StressRequest {
    @NotNull private ScenarioType scenarioType;
    @NotNull @DecimalMin("-100") @DecimalMax("100") private BigDecimal parameterDelta;
}
