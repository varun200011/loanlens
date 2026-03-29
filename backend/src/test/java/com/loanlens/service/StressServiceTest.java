package com.loanlens.service;

import com.loanlens.dto.*;
import com.loanlens.model.*;
import com.loanlens.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StressService — scenario simulation tests")
class StressServiceTest {

    @Mock UserRepository userRepository;
    @Mock LoanRepository loanRepository;
    @Mock StressScenarioRepository stressScenarioRepository;
    @InjectMocks StressService stressService;

    private User testUser;
    private Loan testLoan;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils_setField();
        testUser = User.builder().id(UUID.randomUUID()).email("test@test.com").name("Test User")
            .monthlyIncome(new BigDecimal("100000"))
            .monthlyExpenses(new BigDecimal("30000")).build();
        testLoan = Loan.builder().id(UUID.randomUUID()).user(testUser)
            .loanType(Loan.LoanType.HOME).principal(new BigDecimal("5000000"))
            .interestRate(new BigDecimal("8.5")).tenureMonths(240)
            .startDate(LocalDate.now().minusMonths(12)).active(true).build();
    }

    private void ReflectionTestUtils_setField() {
        try {
            var f = StressService.class.getDeclaredField("objectMapper");
            f.setAccessible(true);
            f.set(stressService, new ObjectMapper());
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    @Test
    @DisplayName("Income drop scenario: 50% drop should flag RED or CRITICAL risk")
    void incomeDrop_50pct_highRisk() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(loanRepository.findByUserAndActiveTrue(testUser)).thenReturn(List.of(testLoan));
        when(stressScenarioRepository.save(any())).thenReturn(new StressScenario());

        var result = stressService.simulate("test@test.com",
            new StressRequest() {{ setScenarioType(StressScenario.ScenarioType.INCOME_DROP); setParameterDelta(new BigDecimal("-50")); }});

        assertThat(result.getRiskBand()).isIn(StressScenario.RiskBand.AMBER, StressScenario.RiskBand.RED, StressScenario.RiskBand.CRITICAL);
        assertThat(result.getRecommendations()).isNotEmpty();
    }

    @Test
    @DisplayName("Rate hike scenario: projected EMI should be higher than current")
    void rateHike_projectedEmiIncreases() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(loanRepository.findByUserAndActiveTrue(testUser)).thenReturn(List.of(testLoan));
        when(stressScenarioRepository.save(any())).thenReturn(new StressScenario());

        var req = new StressRequest();
        req.setScenarioType(StressScenario.ScenarioType.RATE_HIKE);
        req.setParameterDelta(new BigDecimal("2"));
        var result = stressService.simulate("test@test.com", req);

        assertThat(result.getProjectedMonthlyEmi()).isGreaterThan(result.getCurrentMonthlyEmi());
    }

    @Test
    @DisplayName("Job loss scenario: should always be CRITICAL risk")
    void jobLoss_alwaysCritical() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(loanRepository.findByUserAndActiveTrue(testUser)).thenReturn(List.of(testLoan));
        when(stressScenarioRepository.save(any())).thenReturn(new StressScenario());

        var req = new StressRequest();
        req.setScenarioType(StressScenario.ScenarioType.JOB_LOSS);
        req.setParameterDelta(new BigDecimal("100"));
        var result = stressService.simulate("test@test.com", req);

        assertThat(result.getRiskBand()).isEqualTo(StressScenario.RiskBand.CRITICAL);
        assertThat(result.isAtRisk()).isTrue();
    }
}
