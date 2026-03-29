package com.loanlens.dto;

import com.loanlens.model.Loan.LoanType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder
public class LoanResponse {
    private String id;
    private LoanType loanType;
    private BigDecimal principal;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private LocalDate startDate;
    private String lenderName;
    private BigDecimal emi;
    private BigDecimal totalInterest;
    private BigDecimal totalPayable;
    private BigDecimal outstandingBalance;
    private int remainingMonths;
    private boolean active;
}
