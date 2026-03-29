package com.loanlens.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.*;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "LoanLens API",
        version = "1.0.0",
        description = "Loan Eligibility & EMI Risk Analyzer — Stress simulation, portfolio analysis, real affordability scoring",
        contact = @Contact(name = "LoanLens", email = "api@loanlens.app")
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Local dev"),
        @Server(url = "https://api.loanlens.app", description = "Production")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER,
    description = "JWT token from /api/auth/login. Prefix: Bearer <token>"
)
public class OpenApiConfig {}
