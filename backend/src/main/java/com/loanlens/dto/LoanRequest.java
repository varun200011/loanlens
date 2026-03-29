package com.loanlens.dto;

import com.loanlens.model.Loan.LoanType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoanRequest {
    @NotNull private LoanType loanType;
    @NotNull @DecimalMin("1000") private BigDecimal principal;
    @NotNull @DecimalMin("0.1") @DecimalMax("36.0") private BigDecimal interestRate;
    @NotNull @Min(1) @Max(360) private Integer tenureMonths;
    @NotNull private LocalDate startDate;
    private String lenderName;
    private String notes;
}
