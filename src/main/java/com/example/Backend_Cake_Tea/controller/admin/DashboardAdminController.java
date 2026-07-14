package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.repository.OrderRepository;
import com.example.Backend_Cake_Tea.service.FoodService;
import com.example.Backend_Cake_Tea.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardAdminController {

    private final FoodService foodService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public DashboardAdminController(FoodService foodService, OrderService orderService,
                                    OrderRepository orderRepository) {
        this.foodService = foodService;
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalItems", (long) foodService.getAllFood().size());
        stats.put("totalOrders", orderService.countAll());
        stats.put("pendingOrders", orderService.countByStatus("Pending")
                + orderService.countByStatus("Processing")
                + orderService.countByStatus("Preparing"));
        stats.putAll(buildChartData());
        return stats;
    }

    private Map<String, Object> buildChartData() {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(6);
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = today.atTime(LocalTime.MAX);

        // Doanh thu 7 ngày (Delivered)
        Map<String, Double> revenueByDate = new LinkedHashMap<>();
        Map<String, Long> ordersByDate = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        for (int i = 0; i < 7; i++) {
            String key = from.plusDays(i).format(fmt);
            revenueByDate.put(key, 0.0);
            ordersByDate.put(key, 0L);
        }

        for (Object[] row : orderRepository.sumDailyRevenue(fromDt, toDt, "Delivered")) {
            String date = row[0].toString();
            if (revenueByDate.containsKey(date)) {
                revenueByDate.put(date, row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
            }
        }

        for (Object[] row : orderRepository.countDailyOrders(fromDt, toDt)) {
            String date = row[0].toString();
            if (ordersByDate.containsKey(date)) {
                ordersByDate.put(date, row[1] != null ? ((Number) row[1]).longValue() : 0L);
            }
        }

        List<String> labels = new ArrayList<>(revenueByDate.keySet());
        List<Double> revenues = new ArrayList<>(revenueByDate.values());
        List<Long> dailyOrders = new ArrayList<>(ordersByDate.values());

        // Phân bố trạng thái đơn
        List<String> statusLabels = new ArrayList<>();
        List<Long> statusCounts = new ArrayList<>();
        for (Object[] row : orderRepository.countGroupByStatus()) {
            statusLabels.add(row[0] != null ? row[0].toString() : "Unknown");
            statusCounts.add(row[1] != null ? ((Number) row[1]).longValue() : 0L);
        }

        Double weekRevenue = orderRepository.sumRevenueByDateRangeAndStatus(fromDt, toDt, "Delivered");
        if (weekRevenue == null) weekRevenue = 0.0;

        Map<String, Object> charts = new LinkedHashMap<>();
        charts.put("weekRevenue", weekRevenue);
        charts.put("revenueLabels", labels);
        charts.put("revenueValues", revenues);
        charts.put("orderLabels", labels);
        charts.put("orderValues", dailyOrders);
        charts.put("statusLabels", statusLabels);
        charts.put("statusValues", statusCounts);
        return charts;
    }
}
