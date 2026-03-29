package com.loanlens.service;

import com.loanlens.dto.AffordabilityScore;
import com.loanlens.exception.NotFoundException;
import com.loanlens.repository.*;
import com.loanlens.util.FinanceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AffordabilityService {
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final LoanService loanService;

    public AffordabilityScore calculate(String email) {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found"));
        var loans = loanRepository.findByUserAndActiveTrue(user);

        BigDecimal income = user.getMonthlyIncome() != null ? user.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal expenses = user.getMonthlyExpenses() != null ? user.getMonthlyExpenses() : BigDecimal.ZERO;
        BigDecimal sip = user.getMonthlySipCommitment() != null ? user.getMonthlySipCommitment() : BigDecimal.ZERO;
        BigDecimal buffer = user.getEmergencyBufferTarget() != null ? user.getEmergencyBufferTarget() : BigDecimal.ZERO;

        BigDecimal currentEmi = loans.stream()
            .map(l -> FinanceUtils.calculateEmi(l.getPrincipal(), l.getInterestRate(), l.getTenureMonths()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Bank formula: 50% of income for EMI
        BigDecimal bankEligibility = income.multiply(BigDecimal.valueOf(0.5)).subtract(currentEmi);

        // Real formula: income - expenses - sip - buffer/12 leaves X for EMI
        BigDecimal committed = expenses.add(sip).add(buffer.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP));
        BigDecimal trueDisposable = income.subtract(committed);
        BigDecimal recommendedMaxEmi = trueDisposable.multiply(BigDecimal.valueOf(0.4));
        BigDecimal safeBorrow = recommendedMaxEmi.compareTo(BigDecimal.ZERO) > 0
            ? recommendedMaxEmi.multiply(BigDecimal.valueOf(240)) // rough 20yr 8% factor
            : BigDecimal.ZERO;

        BigDecimal disposableAfterAll = trueDisposable.subtract(currentEmi);
        BigDecimal dti = FinanceUtils.calculateDti(currentEmi, income);
        int score = computeScore(dti, disposableAfterAll, income);
        String grade = scoreToGrade(score);

        List<String> insights = new ArrayList<>();
        if (dti.doubleValue() > 40) insights.add("Your DTI is above 40% — banks may reject new loans");
        if (disposableAfterAll.compareTo(BigDecimal.ZERO) < 0) insights.add("Warning: current EMIs exceed disposable income");
        if (sip.compareTo(BigDecimal.ZERO) == 0) insights.add("No SIP detected — consider starting wealth building alongside debt repayment");
        if (buffer.compareTo(BigDecimal.ZERO) == 0) insights.add("Set an emergency fund target to protect against income shocks");

        return AffordabilityScore.builder()
            .score(score).grade(grade)
            .safeBorrowLimit(safeBorrow.max(BigDecimal.ZERO))
            .bankEligibilityLimit(bankEligibility.max(BigDecimal.ZERO))
            .currentMonthlyEmi(currentEmi)
            .disposableAfterAllCommitments(disposableAfterAll)
            .recommendedMaxEmi(recommendedMaxEmi.max(BigDecimal.ZERO))
            .summary("Based on your complete financial picture, your safe borrow limit is ₹" +
                safeBorrow.setScale(0, RoundingMode.HALF_UP) +
                " vs bank's offer of ₹" + bankEligibility.setScale(0, RoundingMode.HALF_UP))
            .insights(insights).build();
    }

    private int computeScore(BigDecimal dti, BigDecimal disposable, BigDecimal income) {
        int base = 100;
        double d = dti.doubleValue();
        if (d > 60) base -= 40;
        else if (d > 50) base -= 30;
        else if (d > 40) base -= 20;
        else if (d > 30) base -= 10;
        if (disposable.compareTo(BigDecimal.ZERO) < 0) base -= 20;
        return Math.max(0, Math.min(100, base));
    }

    private String scoreToGrade(int score) {
        if (score >= 90) return "A+";
        if (score >= 80) return "A";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 50) return "D";
        return "F";
    }
}
