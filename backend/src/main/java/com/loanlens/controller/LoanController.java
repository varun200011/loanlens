package com.loanlens.controller;

import com.loanlens.dto.*;
import com.loanlens.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Tag(name = "Loans", description = "Loan CRUD and EMI calculation")
@SecurityRequirement(name = "bearerAuth")
public class LoanController {
    private final LoanService loanService;

    @PostMapping
    @Operation(summary = "Add a new loan")
    public ResponseEntity<LoanResponse> addLoan(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody LoanRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(loanService.addLoan(user.getUsername(), req));
    }

    @GetMapping
    @Operation(summary = "Get all active loans")
    public ResponseEntity<List<LoanResponse>> getLoans(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(loanService.getLoans(user.getUsername()));
    }

    @DeleteMapping("/{loanId}")
    @Operation(summary = "Soft-delete a loan")
    public ResponseEntity<Void> deleteLoan(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String loanId) {
        loanService.deleteLoan(user.getUsername(), loanId);
        return ResponseEntity.noContent().build();
    }
}
