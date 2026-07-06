package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByUserEmail(String userEmail);
}
