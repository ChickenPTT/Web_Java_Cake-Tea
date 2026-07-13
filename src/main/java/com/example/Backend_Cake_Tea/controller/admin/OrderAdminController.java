package com.example.Backend_Cake_Tea.controller.admin;

import com.example.Backend_Cake_Tea.model.Order;
import com.example.Backend_Cake_Tea.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class OrderAdminController {

    private final OrderService orderService;

    public OrderAdminController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return orderService.getByStatus(status);
        }
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PutMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return orderService.updateStatus(id, body.get("status"));
    }

    @GetMapping("/stats/summary")
    public Map<String, Long> getSummary() {
        return Map.of(
                "totalOrders", orderService.countAll(),
                "pendingOrders", orderService.countByStatus("Pending")
                        + orderService.countByStatus("Processing")
                        + orderService.countByStatus("Preparing")
        );
    }
}
