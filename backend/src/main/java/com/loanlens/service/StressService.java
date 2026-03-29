package com.loanlens.service;

import com.loanlens.dto.*;
import com.loanlens.exception.NotFoundException;
import com.loanlens.model.*;
import com.loanlens.repository.*;
import com.loanlens.util.FinanceUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StressService {
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final StressScenarioRepository stressScenarioRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    @SneakyThrows
    public StressResponse simulate(String email, StressRequest req) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found"));
        var loans = loanRepository.findByUserAndActiveTrue(user);

        BigDecimal income = user.getMonthlyIncome() != null ? user.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal expenses = user.getMonthlyExpenses() != null ? user.getMonthlyExpenses() : BigDecimal.ZERO;

        BigDecimal currentEmi = loans.stream()
            .map(l -> FinanceUtils.calculateEmi(l.getPrincipal(), l.getInterestRate(), l.getTenureMonths()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal projectedEmi = currentEmi;
        BigDecimal projectedIncome = income;
        String riskMessage;
        List<String> recommendations = new ArrayList<>();

        switch (req.getScenarioType()) {
            case INCOME_DROP -> {
                BigDecimal dropPct = req.getParameterDelta().abs();
                projectedIncome = income.multiply(BigDecimal.ONE.subtract(
                    dropPct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)));
                riskMessage = "Income drops by " + dropPct + "% — your monthly income reduces to ₹" +
                    projectedIncome.setScale(0, RoundingMode.HALF_UP);
                recommendations.add("Build 6-month EMI emergency fund before taking new loans");
                recommendations.add("Consider income protection insurance");
            }
            case RATE_HIKE -> {
                BigDecimal hike = req.getParameterDelta();
                projectedEmi = loans.stream()
                    .map(l -> FinanceUtils.calculateEmi(l.getPrincipal(),
                        l.getInterestRate().add(hike), l.getTenureMonths()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                riskMessage = "Rate hike of +" + hike + "% increases your total EMI by ₹" +
                    projectedEmi.subtract(currentEmi).setScale(0, RoundingMode.HALF_UP);
                recommendations.add("Consider switching floating-rate loans to fixed if rates are rising");
                recommendations.add("Prepay high-interest loans to reduce rate sensitivity");
            }
            case EXPENSE_SHOCK -> {
                BigDecimal shock = req.getParameterDelta();
                expenses = expenses.add(shock);
                riskMessage = "Unexpected expense of ₹" + shock + " reduces monthly buffer";
                recommendations.add("Maintain 3-month expense buffer as liquid savings");
            }
            case JOB_LOSS -> {
                projectedIncome = BigDecimal.ZERO;
                riskMessage = "Complete income loss — EMI coverage relies entirely on savings";
                recommendations.add("Keep 12-month EMI reserve in liquid instruments");
                recommendations.add("Explore loan moratorium options with your bank");
                recommendations.add("Review insurance coverage — EPFO unemployment benefits");
            }
            default -> riskMessage = "Scenario simulated";
        }

        BigDecimal currentAvailable = income.subtract(currentEmi).subtract(
            user.getMonthlyExpenses() != null ? user.getMonthlyExpenses() : BigDecimal.ZERO);
        BigDecimal projectedAvailable = projectedIncome.subtract(projectedEmi).subtract(expenses);
        BigDecimal breachThreshold = currentEmi.multiply(BigDecimal.valueOf(1.2));
        boolean atRisk = projectedAvailable.compareTo(BigDecimal.ZERO) < 0
            || projectedEmi.compareTo(projectedIncome.multiply(BigDecimal.valueOf(0.5))) > 0;

        StressScenario.RiskBand band = computeRiskBand(projectedAvailable, income);
        StressResponse response = StressResponse.builder()
            .scenarioType(req.getScenarioType())
            .parameterDelta(req.getParameterDelta())
            .riskBand(band)
            .riskMessage(riskMessage)
            .currentMonthlyEmi(currentEmi)
            .projectedMonthlyEmi(projectedEmi)
            .availableAfterEmi(currentAvailable)
            .projectedAvailableAfterEmi(projectedAvailable)
            .breachThreshold(breachThreshold)
            .isAtRisk(atRisk)
            .recommendations(recommendations)
            .build();

        stressScenarioRepository.save(StressScenario.builder()
            .user(user).scenarioType(req.getScenarioType())
            .parameterDelta(req.getParameterDelta())
            .resultJson(objectMapper.writeValueAsString(response))
            .riskBand(band).build());

        return response;
    }

    private StressScenario.RiskBand computeRiskBand(BigDecimal projectedAvailable, BigDecimal income) {
        if (income.compareTo(BigDecimal.ZERO) == 0) return StressScenario.RiskBand.CRITICAL;
        double ratio = projectedAvailable.divide(income, 4, RoundingMode.HALF_UP).doubleValue();
        if (ratio >= 0.3)  return StressScenario.RiskBand.GREEN;
        if (ratio >= 0.1)  return StressScenario.RiskBand.AMBER;
        if (ratio >= 0)    return StressScenario.RiskBand.RED;
        return StressScenario.RiskBand.CRITICAL;
    }
}
