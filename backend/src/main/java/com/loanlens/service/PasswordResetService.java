package com.loanlens.service;

import com.loanlens.exception.NotFoundException;
import com.loanlens.model.PasswordResetToken;
import com.loanlens.model.User;
import com.loanlens.repository.PasswordResetTokenRepository;
import com.loanlens.repository.UserRepository;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.mail.from:natarajvarun913@gmail.com}")
    private String fromEmail;

    @Value("${SENDGRID_API_KEY:}")
    private String sendGridApiKey;

    @Transactional
    public void sendResetLink(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.deleteByEmail(email);

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .email(email)
                    .expiresAt(LocalDateTime.now().plusMinutes(30))
                    .used(false)
                    .build();
            tokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + token;
            sendEmail(email, user.getName(), resetLink);
            log.info("Password reset link sent to {}", email);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Invalid or expired reset link"));

        if (resetToken.isUsed()) {
            throw new IllegalStateException("This reset link has already been used");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Reset link has expired. Please request a new one");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successful for {}", resetToken.getEmail());
    }

    private void sendEmail(String to, String name, String resetLink) {
        try {
            // Build trust-all SSL context to bypass local cert issues
            TrustManager[] trustAll = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] c, String a) {}
                    public void checkServerTrusted(X509Certificate[] c, String a) {}
                }
            };
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAll, new SecureRandom());

            CloseableHttpClient httpClient = HttpClients.custom()
                    .setSSLContext(sslContext)
                    .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                    .build();

            SendGrid sg = new SendGrid(sendGridApiKey, new Client(httpClient));

            Email from    = new Email(fromEmail, "LoanLens");
            Email toEmail = new Email(to);
            String subject = "LoanLens — Reset Your Password";
            Content content = new Content("text/plain",
                "Hi " + name + ",\n\n" +
                "We received a request to reset your LoanLens password.\n\n" +
                "Click the link below to reset it (valid for 30 minutes):\n\n" +
                resetLink + "\n\n" +
                "If you didn't request this, you can safely ignore this email.\n\n" +
                "— The LoanLens Team"
            );

            Mail mail = new Mail(from, subject, toEmail, content);

            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            log.info("SendGrid response: {} for {}", response.getStatusCode(), to);

            if (response.getStatusCode() >= 400) {
                log.error("SendGrid error: {} - {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Failed to send reset email");
            }

        } catch (IOException | NoSuchAlgorithmException | KeyManagementException e) {
            log.error("SendGrid error: {}", e.getMessage());
            throw new RuntimeException("Failed to send reset email: " + e.getMessage());
        }
    }
}