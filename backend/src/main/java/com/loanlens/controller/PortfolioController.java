package com.loanlens.controller;

import com.loanlens.dto.PortfolioSummary;
import com.loanlens.service.PortfolioService;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Multi-loan portfolio aggregation")
@SecurityRequirement(name = "bearerAuth")
public class PortfolioController {
    private final PortfolioService portfolioService;

    @GetMapping("/summary")
    @Operation(summary = "Get portfolio summary with DTI, health grade, and prepayment strategies")
    public ResponseEntity<PortfolioSummary> getSummary(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(portfolioService.getSummary(user.getUsername()));
    }
}
