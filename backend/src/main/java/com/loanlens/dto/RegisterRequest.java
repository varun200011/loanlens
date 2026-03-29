package com.loanlens.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=2, max=100)
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min=8, max=64)
    private String password;

    @DecimalMin("0") private BigDecimal monthlyIncome;
    @DecimalMin("0") private BigDecimal monthlyExpenses;
    @DecimalMin("0") private BigDecimal monthlySipCommitment;
    @DecimalMin("0") private BigDecimal emergencyBufferTarget;
    @Min(0) @Max(20)  private Integer dependents;
}
