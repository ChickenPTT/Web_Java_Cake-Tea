package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CustomerCareService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public CustomerCareService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public List<User> getBirthdayCustomersToday() {
        return userRepository.findByBirthday(LocalDate.now());
    }

    public List<User> getAllCustomers() {
        return userRepository.findAll();
    }

    public void sendBirthdayEmail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng id=" + userId));
        if (Boolean.FALSE.equals(user.getEmailMarketing())) {
            throw new RuntimeException("Khách hàng đã tắt nhận email marketing");
        }
        emailService.sendBirthdayEmail(user.getEmail(), user.getName());
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendScheduledBirthdayEmails() {
        List<User> birthdayUsers = getBirthdayCustomersToday();
        for (User user : birthdayUsers) {
            if (Boolean.TRUE.equals(user.getEmailMarketing())) {
                try {
                    emailService.sendBirthdayEmail(user.getEmail(), user.getName());
                } catch (Exception e) {
                    System.err.println("Gửi email sinh nhật thất bại cho " + user.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }
}
