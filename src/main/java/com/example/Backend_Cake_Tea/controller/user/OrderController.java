package com.example.Backend_Cake_Tea.controller.user;

import com.example.Backend_Cake_Tea.model.Order;
import com.example.Backend_Cake_Tea.model.User;
import com.example.Backend_Cake_Tea.service.OrderService;
import com.example.Backend_Cake_Tea.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String && auth.getPrincipal().equals("anonymousUser"))) {
                Object principal = auth.getPrincipal();
                if (principal instanceof UserDetails) {
                    String email = ((UserDetails) principal).getUsername();
                    User user = userService.findByEmail(email).orElse(null);
                    
                    if (user != null) {
                        order.setUserId(user.getId());
                        order.setUserEmail(user.getEmail());
                        order.setUserName(user.getName());
                    }
                }
            }

            // Validate required fields
            if (order.getAmount() == null || order.getAmount() <= 0) {
                return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Invalid amount")
                );
            }

            if (order.getItems() == null || order.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "No items in order")
                );
            }

            Order createdOrder = orderService.createOrder(order);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", createdOrder.getId());
            response.put("message", "Order placed successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error creating order: " + e.getMessage())
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderById(id);
            if (order != null) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("success", false, "message", "Order not found")
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error fetching order")
            );
        }
    }

    @GetMapping("/user/current")
    public ResponseEntity<?> getCurrentUserOrders() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String && auth.getPrincipal().equals("anonymousUser"))) {
                Object principal = auth.getPrincipal();
                if (principal instanceof UserDetails) {
                    String email = ((UserDetails) principal).getUsername();
                    List<Order> orders = orderService.getOrdersByUserEmail(email);
                    return ResponseEntity.ok(orders);
                }
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("success", false, "message", "Not authenticated")
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error fetching orders")
            );
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            
            if (updatedOrder != null) {
                return ResponseEntity.ok(
                    Map.of("success", true, "message", "Order status updated", "order", updatedOrder)
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("success", false, "message", "Order not found")
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error updating order")
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Order deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("success", false, "message", "Error deleting order")
            );
        }
    }
}
