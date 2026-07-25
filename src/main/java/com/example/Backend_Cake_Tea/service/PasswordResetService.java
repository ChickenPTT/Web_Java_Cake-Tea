package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.PasswordResetToken;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.repository.PasswordResetTokenRepository;
import com.example.Backend_Cake_Tea.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_VALID_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Map<String, Object> requestReset(String email) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.");

        if (email == null || email.isBlank()) {
            result.put("success", false);
            result.put("message", "Vui lòng nhập email");
            return result;
        }

        String normalized = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(normalized);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(email.trim());
        }
        if (userOpt.isEmpty()) {
            return result;
        }

        User user = userOpt.get();
        tokenRepository.invalidateAllForUser(user.getId());

        String tokenValue = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenValue)
                .userId(user.getId())
                .email(user.getEmail())
                .expiresAt(LocalDateTime.now().plusMinutes(TOKEN_VALID_MINUTES))
                .used(false)
                .build();
        tokenRepository.save(token);

        String resetLink = baseUrl.replaceAll("/$", "") + "/reset-password?token=" + tokenValue;
        boolean mailSent = false;
        boolean mailConfigured = mailUsername != null && !mailUsername.isBlank();

        if (mailConfigured) {
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink);
                mailSent = true;
            } catch (Exception e) {
                log.error("Không gửi được email đặt lại mật khẩu: {}", e.getMessage());
            }
        } else {
            log.warn("SMTP chưa cấu hình. Link đặt lại mật khẩu: {}", resetLink);
        }

        if (!mailSent) {
            result.put("resetLink", resetLink);
            result.put("message", "SMTP chưa cấu hình hoặc gửi email thất bại. Dùng link đặt lại mật khẩu bên dưới.");
        }

        return result;
    }

    public boolean isTokenValid(String tokenValue) {
        if (tokenValue == null || tokenValue.isBlank()) return false;
        return tokenRepository.findByTokenAndUsedFalse(tokenValue)
                .filter(t -> !t.isExpired())
                .isPresent();
    }

    @Transactional
    public Map<String, Object> resetPassword(String tokenValue, String newPassword) {
        Map<String, Object> result = new HashMap<>();

        if (newPassword == null || newPassword.length() < 6) {
            result.put("success", false);
            result.put("message", "Mật khẩu phải có ít nhất 6 ký tự");
            return result;
        }

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenAndUsedFalse(tokenValue);
        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired()) {
            result.put("success", false);
            result.put("message", "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
            return result;
        }

        PasswordResetToken resetToken = tokenOpt.get();
        User user = userRepository.findById(resetToken.getUserId()).orElse(null);
        if (user == null) {
            result.put("success", false);
            result.put("message", "Không tìm thấy tài khoản");
            return result;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        tokenRepository.invalidateAllForUser(user.getId());

        result.put("success", true);
        result.put("message", "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.");
        return result;
    }
}
