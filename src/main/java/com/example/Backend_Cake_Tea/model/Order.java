package com.example.Backend_Cake_Tea.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "user_email", length = 255)
    private String userEmail;
    
    @Column(name = "user_name", length = 255)
    private String userName;
    
    @Column(columnDefinition = "TEXT")
    private String items;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(length = 50)
    private String status;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "payment_status", length = 50)
    private String paymentStatus;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "Pending";
        }
        if (paymentStatus == null) {
            paymentStatus = "Pending";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
