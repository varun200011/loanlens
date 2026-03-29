package com.loanlens.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loanlens.dto.*;
import com.loanlens.model.Loan.LoanType;
import com.loanlens.security.*;
import com.loanlens.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LoanController.class)
@DisplayName("LoanController — REST layer tests")
class LoanControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockBean LoanService loanService;
    @MockBean JwtService jwtService;
    @MockBean UserDetailsServiceImpl userDetailsService;

    private LoanResponse buildMockLoan(String id) {
        return LoanResponse.builder()
           .id(id).loanType(LoanType.HOME)
            .principal(new BigDecimal("3000000")).interestRate(new BigDecimal("8.5"))
            .tenureMonths(240).startDate(LocalDate.of(2023, 1, 1))
            .emi(new BigDecimal("26028")).totalInterest(new BigDecimal("3246720"))
            .totalPayable(new BigDecimal("6246720"))
            .outstandingBalance(new BigDecimal("2800000")).remainingMonths(228).active(true)
            .build();
    }

    @Test
    @WithMockUser(username = "test@test.com")
    @DisplayName("GET /api/loans — 200 returns list of loans")
    void getLoans_authenticated_returns200() throws Exception {
        when(loanService.getLoans("test@test.com"))
            .thenReturn(List.of(buildMockLoan("00000000-0000-0000-0000-000000000001")));

        mvc.perform(get("/api/loans"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].loanType").value("HOME"))
            .andExpect(jsonPath("$[0].emi").value(26028));
    }

    @Test
    @DisplayName("GET /api/loans — 401 when not authenticated")
    void getLoans_unauthenticated_returns401() throws Exception {
        mvc.perform(get("/api/loans"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    @DisplayName("POST /api/loans — 201 with valid loan request")
    void addLoan_valid_returns201() throws Exception {
        var mockLoan = buildMockLoan("00000000-0000-0000-0000-000000000002");
        when(loanService.addLoan(eq("test@test.com"), any())).thenReturn(mockLoan);

        LoanRequest req = new LoanRequest();
        req.setLoanType(LoanType.HOME);
        req.setPrincipal(new BigDecimal("3000000"));
        req.setInterestRate(new BigDecimal("8.5"));
        req.setTenureMonths(240);
        req.setStartDate(LocalDate.of(2023, 1, 1));

        mvc.perform(post("/api/loans")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.loanType").value("HOME"));
    }

    @Test
    @WithMockUser(username = "test@test.com")
    @DisplayName("POST /api/loans — 400 with negative principal")
    void addLoan_negativePrincipal_returns400() throws Exception {
        mvc.perform(post("/api/loans")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"loanType\":\"HOME\",\"principal\":-1000,\"interestRate\":8.5,\"tenureMonths\":240,\"startDate\":\"2023-01-01\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@test.com")
    @DisplayName("DELETE /api/loans/{id} — 204 on successful delete")
    void deleteLoan_valid_returns204() throws Exception {
        doNothing().when(loanService).deleteLoan(anyString(), anyString());

        mvc.perform(delete("/api/loans/00000000-0000-0000-0000-000000000001"))
            .andExpect(status().isNoContent());
    }
}
