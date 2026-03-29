package com.loanlens.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class AffordabilityScore {
    private int score;
    private String grade;
    private BigDecimal safeBorrowLimit;
    private BigDecimal bankEligibilityLimit;
    private BigDecimal currentMonthlyEmi;
    private BigDecimal disposableAfterAllCommitments;
    private BigDecimal recommendedMaxEmi;
    private String summary;
    private java.util.List<String> insights;
}
