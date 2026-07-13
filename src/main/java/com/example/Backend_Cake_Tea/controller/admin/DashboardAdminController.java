package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.service.FoodService;
import com.example.Backend_Cake_Tea.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardAdminController {

    private final FoodService foodService;
    private final OrderService orderService;

    public DashboardAdminController(FoodService foodService, OrderService orderService) {
        this.foodService = foodService;
        this.orderService = orderService;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
                "totalItems", (long) foodService.getAllFood().size(),
                "totalOrders", orderService.countAll(),
                "pendingOrders", orderService.countByStatus("Pending")
                        + orderService.countByStatus("Processing")
                        + orderService.countByStatus("Preparing")
        );
    }
}
