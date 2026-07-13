package com.example.Backend_Cake_Tea.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@sugarpetals.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBirthdayEmail(String toEmail, String customerName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Chúc mừng sinh nhật từ Sugar Petals!");
        message.setText("Xin chào " + (customerName != null ? customerName : "bạn") + ",\n\n"
                + "Sugar Petals chúc bạn một ngày sinh nhật thật vui vẻ!\n"
                + "Nhân dịp đặc biệt, bạn được giảm 10% cho đơn hàng tiếp theo.\n\n"
                + "Trân trọng,\nSugar Petals Team");
        mailSender.send(message);
    }
}
