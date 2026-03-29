package com.loanlens.controller;

import com.loanlens.dto.AffordabilityScore;
import com.loanlens.service.AffordabilityService;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/affordability")
@RequiredArgsConstructor
@Tag(name = "Affordability", description = "Real affordability score vs bank eligibility")
@SecurityRequirement(name = "bearerAuth")
public class AffordabilityController {
    private final AffordabilityService affordabilityService;

    @GetMapping("/score")
    @Operation(summary = "Get personalised affordability score, safe borrow limit, and insights")
    public ResponseEntity<AffordabilityScore> getScore(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(affordabilityService.calculate(user.getUsername()));
    }
}
