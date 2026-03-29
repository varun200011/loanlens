package com.loanlens.service;

import com.loanlens.dto.*;
import com.loanlens.exception.NotFoundException;
import com.loanlens.model.User;
import com.loanlens.repository.*;
import com.loanlens.util.FinanceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final LoanService loanService;

    public PortfolioSummary getSummary(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found"));
        List<LoanResponse> loans = loanRepository.findByUserAndActiveTrue(user)
            .stream().map(loanService::toResponse).toList();

        BigDecimal totalEmi = loans.stream().map(LoanResponse::getEmi)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOutstanding = loans.stream().map(LoanResponse::getOutstandingBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalInterest = loans.stream().map(LoanResponse::getTotalInterest)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal income = user.getMonthlyIncome() != null ? user.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal expenses = user.getMonthlyExpenses() != null ? user.getMonthlyExpenses() : BigDecimal.ZERO;
        BigDecimal sip = user.getMonthlySipCommitment() != null ? user.getMonthlySipCommitment() : BigDecimal.ZERO;
        BigDecimal disposable = income.subtract(totalEmi).subtract(expenses).subtract(sip);

        BigDecimal dti = FinanceUtils.calculateDti(totalEmi, income);
        String grade = FinanceUtils.healthGrade(dti);

        return PortfolioSummary.builder()
            .totalOutstanding(totalOutstanding)
            .totalMonthlyEmi(totalEmi)
            .dtiRatio(dti)
            .healthGrade(grade)
            .monthlyIncome(income)
            .disposableAfterEmi(disposable)
            .activeLoanCount(loans.size())
            .totalInterestPayable(totalInterest)
            .loans(loans)
            .avalanche(computeAvalanche(loans))
            .snowball(computeSnowball(loans))
            .build();
    }

    private PortfolioSummary.PrepaymentComparison computeAvalanche(List<LoanResponse> loans) {
        // Avalanche: pay highest interest rate first
        List<String> order = loans.stream()
            .sorted(Comparator.comparing(LoanResponse::getInterestRate).reversed())
            .map(l -> l.getLoanType() + " @ " + l.getInterestRate() + "%")
            .toList();
        BigDecimal saved = loans.stream()
            .map(l -> l.getTotalInterest().multiply(BigDecimal.valueOf(0.12)))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
        return PortfolioSummary.PrepaymentComparison.builder()
            .strategy("Avalanche (Highest Rate First)")
            .totalInterestSaved(saved)
            .monthsSaved(estimateMonthsSaved(loans))
            .payoffOrder(order).build();
    }

    private PortfolioSummary.PrepaymentComparison computeSnowball(List<LoanResponse> loans) {
        // Snowball: pay lowest balance first
        List<String> order = loans.stream()
            .sorted(Comparator.comparing(LoanResponse::getOutstandingBalance))
            .map(l -> l.getLoanType() + " ₹" + l.getOutstandingBalance())
            .toList();
        BigDecimal saved = loans.stream()
            .map(l -> l.getTotalInterest().multiply(BigDecimal.valueOf(0.08)))
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
        return PortfolioSummary.PrepaymentComparison.builder()
            .strategy("Snowball (Lowest Balance First)")
            .totalInterestSaved(saved)
            .monthsSaved(estimateMonthsSaved(loans) - 3)
            .payoffOrder(order).build();
    }

    private int estimateMonthsSaved(List<LoanResponse> loans) {
        return loans.stream().mapToInt(l -> (int)(l.getRemainingMonths() * 0.15)).sum();
    }
}
