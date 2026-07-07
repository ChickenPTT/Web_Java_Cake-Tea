package com.example.Backend_Cake_Tea.repository;

import com.example.Backend_Cake_Tea.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByUserEmail(String userEmail);

    List<Order> findByStatus(String status);

    long countByStatus(String status);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    long countByCreatedAtBetweenAndStatus(LocalDateTime from, LocalDateTime to, String status);

    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o WHERE o.createdAt BETWEEN :from AND :to AND o.status = :status")
    Double sumRevenueByDateRangeAndStatus(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("status") String status);

    @Query("SELECT FUNCTION('DATE', o.createdAt), COALESCE(SUM(o.amount), 0), COUNT(o) " +
           "FROM Order o WHERE o.createdAt BETWEEN :from AND :to AND o.status = :status " +
           "GROUP BY FUNCTION('DATE', o.createdAt) ORDER BY FUNCTION('DATE', o.createdAt)")
    List<Object[]> sumDailyRevenue(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("status") String status);
}
