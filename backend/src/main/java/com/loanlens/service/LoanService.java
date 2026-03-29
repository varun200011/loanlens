package com.loanlens.service;

import com.loanlens.dto.*;
import com.loanlens.exception.NotFoundException;
import com.loanlens.model.*;
import com.loanlens.repository.*;
import com.loanlens.util.FinanceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LoanService {
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    @Transactional
    public LoanResponse addLoan(String email, LoanRequest req) {
        var user = getUser(email);
        var loan = Loan.builder()
            .user(user)
            .loanType(req.getLoanType())
            .principal(req.getPrincipal())
            .interestRate(req.getInterestRate())
            .tenureMonths(req.getTenureMonths())
            .startDate(req.getStartDate())
            .lenderName(req.getLenderName())
            .notes(req.getNotes())
            .active(true)
            .build();
        return toResponse(loanRepository.save(loan));
    }

    public List<LoanResponse> getLoans(String email) {
        return loanRepository.findByUserAndActiveTrue(getUser(email))
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteLoan(String email, String loanId) {
        var loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new NotFoundException("Loan not found"));
        if (!loan.getUser().getEmail().equals(email))
            throw new SecurityException("Access denied");
        loan.setActive(false);
        loanRepository.save(loan);
    }

    LoanResponse toResponse(Loan loan) {
        BigDecimal emi = FinanceUtils.calculateEmi(
            loan.getPrincipal(), loan.getInterestRate(), loan.getTenureMonths());
        BigDecimal totalPayable = emi.multiply(BigDecimal.valueOf(loan.getTenureMonths()));
        BigDecimal totalInterest = totalPayable.subtract(loan.getPrincipal());
        int elapsed = FinanceUtils.monthsElapsed(loan.getStartDate());
        int remaining = Math.max(0, loan.getTenureMonths() - elapsed);
        BigDecimal outstanding = FinanceUtils.outstandingBalance(
            loan.getPrincipal(), loan.getInterestRate(), loan.getTenureMonths(), elapsed);

        return LoanResponse.builder()
            .id(loan.getId()).loanType(loan.getLoanType())
            .principal(loan.getPrincipal()).interestRate(loan.getInterestRate())
            .tenureMonths(loan.getTenureMonths()).startDate(loan.getStartDate())
            .lenderName(loan.getLenderName()).emi(emi)
            .totalInterest(totalInterest).totalPayable(totalPayable)
            .outstandingBalance(outstanding).remainingMonths(remaining)
            .active(loan.isActive()).build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found"));
    }
}