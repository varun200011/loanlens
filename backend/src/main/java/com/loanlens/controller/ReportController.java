package com.loanlens.controller;

import com.loanlens.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "PDF report generation")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/generate")
    @Operation(summary = "Generate PDF financial risk report, returns signed download URL")
    public ResponseEntity<Map<String, String>> generate(
            @AuthenticationPrincipal UserDetails user) throws Exception {
        return ResponseEntity.ok(reportService.generateReport(user.getUsername()));
    }
}
