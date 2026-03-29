package com.loanlens.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class PortfolioSummary {
    private BigDecimal totalOutstanding;
    private BigDecimal totalMonthlyEmi;
    private BigDecimal dtiRatio;
    private String healthGrade;
    private BigDecimal monthlyIncome;
    private BigDecimal disposableAfterEmi;
    private int activeLoanCount;
    private BigDecimal totalInterestPayable;
    private List<LoanResponse> loans;
    private PrepaymentComparison avalanche;
    private PrepaymentComparison snowball;

    @Data @Builder
    public static class PrepaymentComparison {
        private String strategy;
        private BigDecimal totalInterestSaved;
        private int monthsSaved;
        private List<String> payoffOrder;
    }
}
