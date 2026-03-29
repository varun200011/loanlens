package com.loanlens.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import com.loanlens.dto.*;
import com.loanlens.exception.NotFoundException;
import com.loanlens.model.*;
import com.loanlens.repository.*;
import com.loanlens.util.FinanceUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final ReportRepository reportRepository;
    private final PortfolioService portfolioService;
    private final AffordabilityService affordabilityService;

    @Value("${app.report.output-dir:${java.io.tmpdir}/loanlens-reports}")
    private String outputDir;

    @Transactional
    public Map<String, String> generateReport(String email) throws Exception {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("User not found"));

        PortfolioSummary portfolio = portfolioService.getSummary(email);
        AffordabilityScore affordability = affordabilityService.calculate(email);

        String filename = "loanlens-report-" + user.getId().toString().substring(0, 8)
            + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".pdf";

        Files.createDirectories(Paths.get(outputDir));
        String filePath = outputDir + File.separator + filename;

        buildPdf(filePath, user, portfolio, affordability);

        // In production: upload to S3, return signed URL
        // For now: save path as s3Key
        Report report = Report.builder()
            .user(user)
            .s3Key(filename)
            .signedUrl("/api/reports/download/" + filename)
            .healthGrade(portfolio.getHealthGrade())
            .dtiRatio(portfolio.getDtiRatio())
            .build();
        reportRepository.save(report);

        log.info("Report generated for user={} file={}", user.getId(), filename);
        return Map.of(
            "signedUrl", "/api/reports/download/" + filename,
            "healthGrade", portfolio.getHealthGrade(),
            "filename", filename
        );
    }

    private void buildPdf(String path, User user, PortfolioSummary portfolio,
                          AffordabilityScore affordability) throws Exception {
        try (PdfWriter writer = new PdfWriter(path);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            // ── Cover ──
            doc.add(new Paragraph("LoanLens Financial Risk Report")
                .setBold().setFontSize(22).setFontColor(ColorConstants.DARK_GRAY));
            doc.add(new Paragraph("Prepared for: " + user.getName())
                .setFontSize(13).setFontColor(ColorConstants.GRAY));
            doc.add(new Paragraph("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")))
                .setFontSize(11).setFontColor(ColorConstants.GRAY));
            doc.add(new Paragraph("\n"));

            // ── Health Summary ──
            doc.add(new Paragraph("Financial Health Summary")
                .setBold().setFontSize(15).setUnderline());
            Table summary = new Table(UnitValue.createPercentArray(new float[]{3, 3, 3, 3})).useAllAvailableWidth();
            addHeaderCell(summary, "Health Grade");
            addHeaderCell(summary, "DTI Ratio");
            addHeaderCell(summary, "Monthly EMI");
            addHeaderCell(summary, "Monthly Buffer");
            addDataCell(summary, portfolio.getHealthGrade());
            addDataCell(summary, portfolio.getDtiRatio().setScale(1, RoundingMode.HALF_UP) + "%");
            addDataCell(summary, "₹" + fmt(portfolio.getTotalMonthlyEmi()));
            addDataCell(summary, "₹" + fmt(portfolio.getDisposableAfterEmi()));
            doc.add(summary);
            doc.add(new Paragraph("\n"));

            // ── Loan Breakdown ──
            doc.add(new Paragraph("Loan Portfolio Breakdown")
                .setBold().setFontSize(15).setUnderline());
            Table loans = new Table(UnitValue.createPercentArray(new float[]{2,2,2,2,2,2})).useAllAvailableWidth();
            for (String h : new String[]{"Type","Principal","Rate","EMI","Interest","Outstanding"})
                addHeaderCell(loans, h);
            for (LoanResponse l : portfolio.getLoans()) {
                addDataCell(loans, l.getLoanType().toString());
                addDataCell(loans, "₹" + fmt(l.getPrincipal()));
                addDataCell(loans, l.getInterestRate() + "%");
                addDataCell(loans, "₹" + fmt(l.getEmi()));
                addDataCell(loans, "₹" + fmt(l.getTotalInterest()));
                addDataCell(loans, "₹" + fmt(l.getOutstandingBalance()));
            }
            doc.add(loans);
            doc.add(new Paragraph("\n"));

            // ── Affordability ──
            doc.add(new Paragraph("Affordability Analysis")
                .setBold().setFontSize(15).setUnderline());
            doc.add(new Paragraph("Affordability Score: " + affordability.getScore() + "/100 (Grade " + affordability.getGrade() + ")")
                .setFontSize(13));
            doc.add(new Paragraph("Safe Borrow Limit: ₹" + fmt(affordability.getSafeBorrowLimit()))
                .setFontSize(12));
            doc.add(new Paragraph("Bank's Eligibility Offer: ₹" + fmt(affordability.getBankEligibilityLimit()))
                .setFontSize(12).setFontColor(ColorConstants.GRAY));
            doc.add(new Paragraph("\n"));

            // ── Insights ──
            if (!affordability.getInsights().isEmpty()) {
                doc.add(new Paragraph("Key Insights").setBold().setFontSize(15).setUnderline());
                for (String ins : affordability.getInsights())
                    doc.add(new Paragraph("→ " + ins).setFontSize(11));
                doc.add(new Paragraph("\n"));
            }

            // ── Prepayment Strategies ──
            doc.add(new Paragraph("Prepayment Strategy Comparison")
                .setBold().setFontSize(15).setUnderline());
            Table strat = new Table(UnitValue.createPercentArray(new float[]{4, 3, 2})).useAllAvailableWidth();
            addHeaderCell(strat, "Strategy");
            addHeaderCell(strat, "Interest Saved");
            addHeaderCell(strat, "Months Saved");
            addDataCell(strat, "Avalanche (Highest Rate First)");
            addDataCell(strat, "₹" + fmt(portfolio.getAvalanche().getTotalInterestSaved()));
            addDataCell(strat, String.valueOf(portfolio.getAvalanche().getMonthsSaved()));
            addDataCell(strat, "Snowball (Lowest Balance First)");
            addDataCell(strat, "₹" + fmt(portfolio.getSnowball().getTotalInterestSaved()));
            addDataCell(strat, String.valueOf(portfolio.getSnowball().getMonthsSaved()));
            doc.add(strat);

            // ── Footer ──
            doc.add(new Paragraph("\n\nThis report is for informational purposes only and does not constitute financial advice.")
                .setFontSize(9).setFontColor(ColorConstants.LIGHT_GRAY));
        }
    }

    private void addHeaderCell(Table t, String text) {
        t.addHeaderCell(new Cell().add(new Paragraph(text).setBold().setFontSize(10))
            .setBackgroundColor(ColorConstants.LIGHT_GRAY));
    }

    private void addDataCell(Table t, String text) {
        t.addCell(new Cell().add(new Paragraph(text).setFontSize(10)));
    }

    private String fmt(BigDecimal val) {
        if (val == null) return "0";
        return String.format("%,.0f", val.doubleValue());
    }
}
