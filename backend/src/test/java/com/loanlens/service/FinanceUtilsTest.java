package com.loanlens.service;

import com.loanlens.util.FinanceUtils;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.*;

@DisplayName("FinanceUtils — EMI and calculation tests")
class FinanceUtilsTest {

    @Test
    @DisplayName("EMI for 5L at 8.5% for 240 months should be approx 4340")
    void emiCalculation_standardHomeLoan() {
        BigDecimal emi = FinanceUtils.calculateEmi(
            new BigDecimal("500000"), new BigDecimal("8.5"), 240);
        assertThat(emi).isBetween(new BigDecimal("4300"), new BigDecimal("4400"));
    }

    @Test
    @DisplayName("EMI with zero interest rate returns principal / tenure")
    void emiCalculation_zeroInterest() {
        BigDecimal emi = FinanceUtils.calculateEmi(
            new BigDecimal("120000"), BigDecimal.ZERO, 12);
        assertThat(emi).isEqualByComparingTo(new BigDecimal("10000.00"));
    }

    @Test
    @DisplayName("Outstanding balance at halfway point should be less than 80% of principal")
    void outstandingBalance_halfwayPoint() {
        BigDecimal outstanding = FinanceUtils.outstandingBalance(
            new BigDecimal("1000000"), new BigDecimal("8.5"), 240, 120);
        assertThat(outstanding).isLessThan(new BigDecimal("800000"));
        assertThat(outstanding).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Outstanding balance at tenure end should be zero")
    void outstandingBalance_atEnd() {
        BigDecimal outstanding = FinanceUtils.outstandingBalance(
            new BigDecimal("500000"), new BigDecimal("10"), 60, 60);
        assertThat(outstanding).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @ParameterizedTest
    @DisplayName("DTI ratio calculation")
    @CsvSource({ "30000,100000,30.00", "50000,100000,50.00", "0,100000,0.00" })
    void dtiRatio(String emi, String income, String expected) {
        BigDecimal dti = FinanceUtils.calculateDti(new BigDecimal(emi), new BigDecimal(income));
        assertThat(dti).isEqualByComparingTo(new BigDecimal(expected));
    }

    @ParameterizedTest
    @DisplayName("Health grade mapping")
    @CsvSource({ "15,A+", "25,A", "35,B", "45,C", "55,D", "70,F" })
    void healthGrade(String dti, String expectedGrade) {
        assertThat(FinanceUtils.healthGrade(new BigDecimal(dti))).isEqualTo(expectedGrade);
    }

    @Test
    @DisplayName("DTI with zero income returns 100")
    void dtiWithZeroIncome() {
        BigDecimal dti = FinanceUtils.calculateDti(new BigDecimal("50000"), BigDecimal.ZERO);
        assertThat(dti).isEqualByComparingTo(new BigDecimal("100"));
    }

    @Test
    @DisplayName("EMI should be positive for any valid inputs")
    void emiAlwaysPositive() {
        assertThat(FinanceUtils.calculateEmi(new BigDecimal("10000"), new BigDecimal("24"), 6))
            .isGreaterThan(BigDecimal.ZERO);
    }
}
