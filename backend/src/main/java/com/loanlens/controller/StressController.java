package com.loanlens.controller;

import com.loanlens.dto.*;
import com.loanlens.service.StressService;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stress")
@RequiredArgsConstructor
@Tag(name = "Stress Simulator", description = "Financial stress scenario testing")
@SecurityRequirement(name = "bearerAuth")
public class StressController {
    private final StressService stressService;

    @PostMapping("/simulate")
    @Operation(summary = "Run a stress scenario — income drop, rate hike, expense shock, or job loss")
    public ResponseEntity<StressResponse> simulate(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody StressRequest req) {
        return ResponseEntity.ok(stressService.simulate(user.getUsername(), req));
    }
}
