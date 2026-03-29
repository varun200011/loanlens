package com.loanlens.util;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;

public final class FinanceUtils {

    private FinanceUtils() {}

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);
    private static final int SCALE = 2;

    /**
     * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
     * where r = monthly interest rate, n = tenure months
     */
    public static BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int tenureMonths) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(tenureMonths), SCALE, RoundingMode.HALF_UP);
        }
        BigDecimal r = annualRate.divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal onePlusRPowN = onePlusR.pow(tenureMonths, MC);
        BigDecimal numerator = principal.multiply(r).multiply(onePlusRPowN, MC);
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);
        return numerator.divide(denominator, SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Outstanding balance after k payments using amortization formula
     */
    public static BigDecimal outstandingBalance(BigDecimal principal, BigDecimal annualRate,
                                                int tenureMonths, int monthsPaid) {
        if (monthsPaid >= tenureMonths) return BigDecimal.ZERO;
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            BigDecimal perMonth = principal.divide(BigDecimal.valueOf(tenureMonths), 10, RoundingMode.HALF_UP);
            return perMonth.multiply(BigDecimal.valueOf(tenureMonths - monthsPaid))
                           .setScale(SCALE, RoundingMode.HALF_UP);
        }
        BigDecimal r = annualRate.divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR = BigDecimal.ONE.add(r);
        BigDecimal onePlusRPowN = onePlusR.pow(tenureMonths, MC);
        BigDecimal onePlusRPowK = onePlusR.pow(monthsPaid, MC);
        BigDecimal numerator = onePlusRPowN.subtract(onePlusRPowK);
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);
        return principal.multiply(numerator.divide(denominator, 10, RoundingMode.HALF_UP))
                        .setScale(SCALE, RoundingMode.HALF_UP);
    }

    public static int monthsElapsed(java.time.LocalDate startDate) {
        Period period = Period.between(startDate, LocalDate.now());
        return Math.max(0, period.getYears() * 12 + period.getMonths());
    }

    /**
     * DTI = (total monthly EMI / monthly income) * 100
     */
    public static BigDecimal calculateDti(BigDecimal totalEmi, BigDecimal monthlyIncome) {
        if (monthlyIncome == null || monthlyIncome.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.valueOf(100);
        return totalEmi.divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                       .multiply(BigDecimal.valueOf(100))
                       .setScale(2, RoundingMode.HALF_UP);
    }

    public static String healthGrade(BigDecimal dti) {
        double d = dti.doubleValue();
        if (d <= 20) return "A+";
        if (d <= 30) return "A";
        if (d <= 40) return "B";
        if (d <= 50) return "C";
        if (d <= 60) return "D";
        return "F";
    }
}
