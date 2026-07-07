package com.example.Backend_Cake_Tea.service;

import com.example.Backend_Cake_Tea.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class StatisticsService {

    private final OrderRepository orderRepository;

    public StatisticsService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> getRevenueStatistics(LocalDate from, LocalDate to) {
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.atTime(LocalTime.MAX);

        Double totalRevenue = orderRepository.sumRevenueByDateRangeAndStatus(
                fromDateTime, toDateTime, "Delivered");
        if (totalRevenue == null) totalRevenue = 0.0;

        long totalOrders = orderRepository.countByCreatedAtBetween(fromDateTime, toDateTime);
        long deliveredOrders = orderRepository.countByCreatedAtBetweenAndStatus(
                fromDateTime, toDateTime, "Delivered");
        long cancelledOrders = orderRepository.countByCreatedAtBetweenAndStatus(
                fromDateTime, toDateTime, "Cancelled");

        List<Object[]> dailyData = orderRepository.sumDailyRevenue(fromDateTime, toDateTime, "Delivered");
        List<Map<String, Object>> dailyRevenue = new ArrayList<>();
        for (Object[] row : dailyData) {
            Map<String, Object> day = new HashMap<>();
            day.put("date", row[0].toString());
            day.put("revenue", row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
            day.put("orders", row[2] != null ? ((Number) row[2]).longValue() : 0L);
            dailyRevenue.add(day);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("from", from.toString());
        result.put("to", to.toString());
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", totalOrders);
        result.put("deliveredOrders", deliveredOrders);
        result.put("cancelledOrders", cancelledOrders);
        result.put("dailyRevenue", dailyRevenue);
        return result;
    }
}
